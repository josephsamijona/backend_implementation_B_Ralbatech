// cors-setup.js
'use strict';

const cors = require('cors');

const env = process.env.NODE_ENV || 'production';
const isDev = env === 'development';

// === Allowed Origins (Staging & Production) ===
const allowedOrigins = [
  'https://ralbatech.com',
  'https://yuniceyeglasses.com',
  'https://admin.ralbatech.com',
  'https://admin.yuniceyeglasses.com',
  'https://gltfviewer.ralbatech.com',
  'https://tryon.ralbatech.com',
  'https://preview.ralbatech.com',
  'https://vendorstore.ralbatech.com',
  'https://store.ralbatech.com',
  'https://backendimplementationbralbatech-production.up.railway.app',
  'https://ralbaoptical.com'
];

// Optional: explicit IP allowlist (kept from your config)
const allowedIPs = [
  '110.227.203.30',
  '122.176.24.171'
];

// ---------- Helpers ----------
function normalizeOrigin(origin) {
  if (!origin) return '';
  try {
    const u = new URL(origin);
    return `${u.protocol}//${u.host}`.toLowerCase();
  } catch {
    return origin.split('/').slice(0, 3).join('/').replace(/\/$/, '').toLowerCase();
  }
}
//code added to readh new domain names from environment variables
function isAllowedOriginFromEnv(origin) {
  const envOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const cleanOrigins = envOrigins.map(normalizeOrigin);
  return cleanOrigins.some(o => o.toLowerCase() === normalizeOrigin(origin));
}

function isAllowedOrigin(origin) {
  if (isAllowedOriginFromEnv(origin)) {
    return true;
  }
  const clean = normalizeOrigin(origin);
  return allowedOrigins.some(o => o.toLowerCase() === clean);
}

function firstNonEmpty(arr) {
  return (arr || []).map(s => (s || '').trim()).find(Boolean) || '';
}

function isJunkIP(v) {
  if (!v) return true;
  const s = String(v).trim().toLowerCase();
  return s === '(null)' || s === 'null' || s === 'unknown' || s === '-' || s === '::';
}

function stripPrefix(ip) {
  return (ip || '').replace(/^::ffff:/, '');
}

function extractClientIP(req) {
  // 1) Prefer Express-computed req.ip but only if it's not junk
  let ip = (req.ip || '').trim();
  if (!isJunkIP(ip)) return stripPrefix(ip);

  // 2) Parse X-Forwarded-For manually (take the first good value, skipping junk entries)
  const xff = req.headers['x-forwarded-for'];
  if (xff) {
    const firstGood = xff
      .split(',')
      .map(s => s.trim())
      .find(v => !isJunkIP(v));
    if (firstGood) return stripPrefix(firstGood);
  }

  // 3) Fallbacks
  ip = (req.connection?.remoteAddress || req.socket?.remoteAddress || '').trim();
  if (!isJunkIP(ip)) return stripPrefix(ip);

  return ''; // unknown
}

function isAllowedIP(ip) {
  return !!ip && allowedIPs.includes(ip);
}

function isLoopbackIP(ip) {
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}

function headerHasValue(req, name) {
  const v = req.get(name);
  if (!v) return false;
  const s = String(v).trim().toLowerCase();
  return s && s !== 'nil' && s !== 'null' && s !== '(null)';
}

function isSigned(req) {
  // Presence-only check (real HMAC/JWT verification happens in your auth layer)
  return headerHasValue(req, 'x-client-id') &&
    headerHasValue(req, 'x-signature') &&
    headerHasValue(req, 'x-timestamp') &&
    headerHasValue(req, 'x-nonce')
}

function isSecSigningEndpoint(req) {
  // Allowlist the signing endpoint for non-browser callers with no Origin
  return req.path === '/sec/v1/sign-request';
}

// Generic logging
function logDebug(stage, req, extra = {}) {
  const originHeader = req.get('origin') || '';
  const referer = req.get('referer') || '';
  const ip = extractClientIP(req);
  const ua = req.get('user-agent') || '';
  const headers = req.headers;

  const line = {
    ts: new Date().toISOString(),
    env,
    stage,
    method: req.method,
    url: req.originalUrl,
    origin: originHeader,
    referer,
    ip: ip || '(unknown)',
    ua,
    extra,
    headers
  };

  // console.log('[CORS-DEBUG]', JSON.stringify(line, null, 2));
}

// ---------- Dev mode: allow all ----------
if (isDev) {
  const corsMiddleware = cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'FETCH'],
    credentials: true,
    optionsSuccessStatus: 200
  });

  function validateOriginOrIP(req, res, next) {
    logDebug('dev-mode-entry', req, { decision: 'SKIP (dev mode)' });
    next();
  }

  module.exports = { corsMiddleware, validateOriginOrIP };
  return;
}

// ---------- Staging/Prod ----------
function customCorsOrigin(origin, callback) {
  // Debug before check
  // console.log('[CORS-DEBUG] customCorsOrigin check for:', origin);

  // Non-browser clients (no Origin) — CORS layer should not block them.
  if (!origin) {
    // console.log('[CORS-DEBUG] No Origin header → ALLOW');
    return callback(null, true);
  }

  const ok = isAllowedOrigin(origin);
  // console.log(`[CORS-DEBUG] Origin ${origin} → ${ok ? 'ALLOW' : 'DENY'}`);
  return callback(null, ok ? true : false);
}

const corsMiddleware = cors({
  origin: customCorsOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'FETCH'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
  // Explicitly allow custom headers used by the signing/auth scheme
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'x-client-id',
    'x-signature',
    'x-timestamp',
    'x-nonce',
    'Cache-Control'
  ]
});

// Secondary gate: Origin/IP/User-Agent policy with Option A (+ /sec/sign-request allowlist)
function validateOriginOrIP(req, res, next) {
  logDebug('gate-entry', req);

  if (req.method === 'OPTIONS') {
    logDebug('gate-preflight', req, { decision: 'SKIP OPTIONS' });
    return next();
  }

  const originHeader = req.get('origin') || '';
  const referer = req.get('referer') || '';
  const originForPolicy = originHeader || referer;

  const ip = extractClientIP(req);
  const ua = req.get('user-agent') || '';

  const isPostman = /postman/i.test(ua);
  const loopback = isLoopbackIP(ip);
  const originAllowed = isAllowedOrigin(originForPolicy);
  const ipAllowed = isAllowedIP(ip);
  const signed = isSigned(req);

  // console.log(`[CORS-DEBUG] Checks: originHeader=${originHeader || '(empty)'}, originForPolicy=${originForPolicy || '(empty)'}, ip=${ip || '(unknown)'}, ua=${ua}`);
  // console.log(`[CORS-DEBUG] → isPostman=${isPostman}, loopback=${!!loopback}, originAllowed=${originAllowed}, ipAllowed=${ipAllowed}, isSigned=${signed}`);

  // Keep your explicit Postman+loopback block
  if (!originHeader && loopback && isPostman) {
    logDebug('gate-deny', req, { reason: 'Postman on loopback without origin' });
    return res.status(403).json({ status: 0, message: 'Postman blocked' });
  }

  // === NEW: Allow non-browser access to the signing endpoint ===
  if (!originHeader && isSecSigningEndpoint(req)) {
    logDebug('gate-allow', req, { reason: 'Sign endpoint without Origin (server → API)' });
    return next();
  }

  // === Option A: Allow signed, non-browser API calls even with no Origin ===
  if (!originHeader && /^\/api\/.+/.test(req.path) && signed) {
    logDebug('gate-allow', req, { reason: 'Signed API call without Origin' });
    return next();
  }

  // Also allow loopback without origin (your previous special-case)
  if (!originHeader && loopback) {
    logDebug('gate-allow', req, { reason: 'Loopback without Origin' });
    return next();
  }

  // Standard: allow if allowed origin or allowed IP
  if (originAllowed || ipAllowed) {
    logDebug('gate-allow', req, { reason: originAllowed ? 'Allowed origin' : 'Allowed IP' });
    return next();
  }

  // Default: deny
  logDebug('gate-deny', req, { reason: 'Disallowed origin or IP' });
  return res.status(403).json({ status: 0, message: 'Disallowed origin or IP' });
}

module.exports = {
  corsMiddleware,
  validateOriginOrIP
};


