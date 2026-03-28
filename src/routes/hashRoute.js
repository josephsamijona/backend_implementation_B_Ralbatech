// =======================
// API: Generate Signature (DO NOT STORE NONCE HERE)
// =======================


const crypto = require('crypto');
const { encrypt, decrypt } = require('../libs/encLib');
const { console } = require('inspector');


// =======================
// Secrets (use env variables in production)
// =======================
const credentials = {
  ralbatech: process.env.PLATFORM_SECRET,
  admin: process.env.ADMIN_SECRET
};

/**
 * Generate HMAC signature
 */
function generateServerSignature({ method, path, timestamp, nonce, secret,bodyStr }) {
  const baseString = `${method}:${path}:${timestamp}:${nonce}:${bodyStr}`;
  return crypto.createHmac('sha256', secret).update(baseString).digest('hex');
}


module.exports.setRouter = (app) => {
    let baseUrl = `/sec/v1`;


app.post(`${baseUrl}/sign-request`, (req, res) => {
  try {
    // Validate request query
    if (!req.body?.carrierPacket) {
      return res.status(400).json({ error: 'Missing encrypted payload' });
    }

    console.log(`carrierPacket =====> ${req.body.carrierPacket} :: Type ${typeof req.body.carrierPacket}`);

    let decryptedData;
    try {
      decryptedData = JSON.parse(decrypt(req.body.carrierPacket));
      console.log("decryptedData =====> ", decryptedData);
    } catch (err) {
      console.error('[sign-request] Decrypt error:', err.message);
      return res.status(400).json({ error: 'Invalid or corrupted payload' });
    }

    const { clientId, method, path, bodyStr } = decryptedData || {};

    // Validate decrypted fields
    if (!clientId || !method || !path) {
      return res.status(400).json({ error: 'Missing required fields in decrypted payload' });
    }

    // Validate secret
    const secret = credentials[clientId];
    if (!secret) {
      return res.status(403).json({ error: 'Invalid clientId' });
    }

    const timestamp = Date.now().toString();
    const nonce = crypto.randomUUID();

    // Strip query params if present
    const cleanPath = path.split('?')[0];
    const absolute_path = `${cleanPath}`;
    const absolute_method = method.toUpperCase();

    // Generate signature
    let signature;
    try {
      console.log(`sign-request signature for ${clientId} on ${absolute_path} at ${timestamp} with nonce ${nonce} and method ${req.method} secret ${secret} bodyStr ${bodyStr}`);
      signature = generateServerSignature({
        method: absolute_method,
        path: absolute_path,
        timestamp,
        nonce,
        secret,
        bodyStr
      });
    } catch (err) {
      console.error('[sign-request] Signature generation failed:', err.message);
      return res.status(500).json({ error: 'Failed to generate signature' });
    }

    // Encrypt the response
    let encryptedResponse;
    try {
      encryptedResponse = encrypt(
        JSON.stringify({
          clientId,
          timestamp,
          nonce,
          signature,
          validForMs: process.env.NONCE_TTL_MS
        })
      );
    } catch (err) {
      console.error('[sign-request] Encryption failed:', err.message);
      return res.status(500).json({ error: 'Failed to encrypt response' });
    }

    // Send encrypted response
    res.status(200).json({ payload: encryptedResponse });

  } catch (err) {
    console.error('[sign-request] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
};

