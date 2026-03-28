/**
 * Secure Auth Middleware + Signature Generation
 * One-time-use nonce/signature with configurable expiry
 */

const crypto = require('crypto');
const redis = require("redis");
const appConfig = require('../../config/appConfig');
const { encrypt, decrypt } = require('../libs/encLib');
// =======================
// Config
// =======================
const NONCE_TTL_MS = parseInt(process.env.NONCE_TTL_MS || '2500', 10); // default 2.5s
const NONCE_TTL_SS = parseInt(process.env.NONCE_TTL_SS || '60', 10);    // default 1 minute
const isDev = process.env.NODE_ENV === 'development'; // typo? fix to 'development'

// =======================
// Secrets
// =======================
const credentials = {
  ralbatech: process.env.PLATFORM_SECRET,
  admin: process.env.ADMIN_SECRET
};

// =======================
// Redis Client (singleton)
// =======================
const redis_client = redis.createCluster({
  rootNodes: [
    { url: 'redis://18.119.88.207:7001' },
    { url: 'redis://18.119.88.207:7002' },
    { url: 'redis://18.119.88.207:7003' }
  ],
  defaults: {
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('❌ Redis: Too many reconnection attempts');
          return new Error('Too many retries');
        }
        return Math.min(retries * 100, 3000);
      }
    }
  },
  useReplicas: true,
  minimizeConnections: false
});

redis_client.on('error', (err) => {
  console.error('❌ Redis Cluster Error:', err);
});

redis_client.on('ready', () => {
  console.log('✅ Redis Cluster is ready');
});

let redisConnected = false;
let connectionPromise = null;

async function ensureRedisConnection() {
  if (redisConnected) {
    return;
  }

  // If a connection is already in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      await redis_client.connect();
      // Wait a bit for cluster slots to be discovered
      await new Promise(resolve => setTimeout(resolve, 500));
      redisConnected = true;
      console.log('✅ Redis Cluster connected successfully');
    } catch (err) {
      console.error('❌ Redis connect failed:', err);
      connectionPromise = null;
      throw new Error('Redis connection error: ' + err.message);
    }
  })();

  return connectionPromise;
}

/**
 * Store nonce with TTL in Redis
 */
async function storeNonce(clientId, nonce) {
  const key = `nonce:${clientId}:${nonce}`;
  try {
    await ensureRedisConnection();
    await redis_client.set(key, 'used', {
      EX: NONCE_TTL_SS,
      NX: true
    });
  } catch (err) {
    console.error('❌ Error storing nonce:', err);
    throw err;
  }
}

/**
 * Check if nonce is already used
 */
async function isNonceUsed(clientId, nonce) {
  const key = `nonce:${clientId}:${nonce}`;
  try {
    await ensureRedisConnection();
    const exists = await redis_client.exists(key);
    return exists === 1;
  } catch (err) {
    console.error('❌ Error checking nonce:', err);
    throw err;
  }
}

/**
 * Validate timestamp freshness
 */
function isTimestampValid(timestamp) {
  const now = Date.now();
  const requestTime = Number(timestamp);
  return Math.abs(now - requestTime) < NONCE_TTL_MS;
}

/**
 * Generate HMAC signature
 */
function generateServerSignature({ method, path, timestamp, nonce, secret, bodyStr }) {
  const baseString = `${method}:${path}:${timestamp}:${nonce}:${bodyStr}`;
  return crypto.createHmac('sha256', secret).update(baseString).digest('hex');
}

/**
 * Authentication Middleware
 */
async function authMiddleware(req, res, next) {
  // In development: skip auth/signature entirely, but optionally hydrate body from carrierPacket
  if (isDev) {
    try {
      if (req.body && typeof req.body.carrierPacket === 'string' && req.body.carrierPacket.trim() !== '') {
        const decryptedJson = decrypt(req.body.carrierPacket);
        const parsed = JSON.parse(decryptedJson);
        req.decryptedBody = parsed;
        req.body = parsed;
      }
    } catch (e) {
      console.warn('⚠️ Dev mode: failed to decrypt/parse carrierPacket; proceeding with original body:', e.message);
    }
    return next();
  }

  if (!isDev) {
    const realIp = req.ip;
    const forwardedIps = req.ips;

    const clientId = req.header('x-client-id');
    const timestamp = req.header('x-timestamp');
    const nonce = req.header('x-nonce');
    const signature = req.header('x-signature');

    if (!clientId || !timestamp || !nonce || !signature) {
      return res.status(400).json({ error: 'Missing authentication headers', ip: realIp });
    }

    const secret = credentials[clientId];
    if (!secret) {
      return res.status(403).json({ error: 'Unknown client', ip: realIp });
    }

    // Determine content type early to allow conditional validation for file uploads
    const contentTypeEarly = (req.headers['content-type'] || '').toLowerCase();
    const isMultipartEarly = contentTypeEarly.includes('multipart/form-data');

    // Skip timestamp freshness check for multipart/form-data (file uploads)
    if (isMultipartEarly) {
      console.log(`Auth: multipart/form-data detected for ${req.originalUrl}; skipping timestamp freshness check.`);
    } else if (!isTimestampValid(timestamp)) {
      return res.status(403).json({ error: 'Invalid or expired timestamp', ip: realIp });
    }

    try {
      const nonceUsed = await isNonceUsed(clientId, nonce);
      if (nonceUsed) {
        return res.status(403).json({ error: 'Nonce already used', ip: realIp });
      }
    } catch (err) {
      return res.status(500).json({ error: 'Internal error verifying nonce', ip: realIp });
    }

    const cleanPath = req.originalUrl.split('?')[0];

    // Determine how to derive the body string used in signature
    const contentType = (req.headers['content-type'] || '').toLowerCase();
    const isMultipart = contentType.includes('multipart/form-data');

    let bodyStr = null;
    if (!isMultipart) {
      // Prefer encrypted packet if provided by client
      if (req.body && typeof req.body.carrierPacket === 'string' && req.body.carrierPacket.trim() !== '') {
        bodyStr = req.body.carrierPacket;
        // Attempt to decrypt to hydrate req.body for downstream handlers
        try {
          const decryptedJson = decrypt(bodyStr);
          const parsed = JSON.parse(decryptedJson);
          req.decryptedBody = parsed;
          // Replace req.body with decrypted structure for route handlers
          req.body = parsed;
        } catch (e) {
          console.warn('⚠️ Failed to decrypt/parse carrierPacket, proceeding with raw packet for signature only:', e.message);
        }
      } else if (req.body && Object.keys(req.body).length > 0) {
        // Backward compatibility: client sent plain JSON; derive bodyStr via encrypt()
        bodyStr = encrypt(JSON.stringify(req.body));
      }
    }

    console.log(`Validating signature for ${clientId} on ${cleanPath} at ${timestamp} with nonce ${nonce} and method ${req.method} bodyPresent=${!!bodyStr} isMultipart=${isMultipart}`);

    const expectedSignature = generateServerSignature({
      method: req.method,
      path: cleanPath,
      timestamp,
      nonce,
      secret,
      bodyStr
    });

    if (expectedSignature !== signature) {
      console.warn(`⚠️ Signature mismatch: expected ${expectedSignature} vs received ${signature}`);
      return res.status(403).json({ error: 'Invalid signature', ip: realIp });
    }

    try {
      await storeNonce(clientId, nonce);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to store nonce', ip: realIp });
    }

    req.authenticatedClient = clientId;
    req.requestIp = realIp;
    req.forwardedIps = forwardedIps;
  }

  next();
}

module.exports = { authMiddleware };
