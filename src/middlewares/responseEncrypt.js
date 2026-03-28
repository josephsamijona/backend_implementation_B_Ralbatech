'use strict';

const { encrypt } = require('../libs/encLib');
const isDev = process.env.NODE_ENV === 'development';

// Encrypt API JSON responses into { payload: <base64> }
// - Applies to /api/* routes (after auth)
// - Skips if response already has a string payload field
// - Leaves non-JSON and view/html responses untouched
function responseEncrypt(req, res, next) {
  // In development, bypass response encryption entirely
  if (isDev) {
    return next();
  }
  const urlPath = (req.originalUrl || '').split('?')[0];
  const isApi = urlPath.startsWith('/api/');

  if (!isApi) {
    return next();
  }

  // Keep originals
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  const buildEncryptedPayload = (data) => {
    try {
      // If already in expected shape with string payload, pass through
      if (data && typeof data === 'object' && typeof data.payload === 'string') {
        return data;
      }

      // Convert to string before encrypting
      const jsonString = typeof data === 'string' ? data : JSON.stringify(data ?? {});
      const encrypted = encrypt(jsonString);
      res.set('Content-Type', 'application/json');
      return { payload: encrypted };
    } catch (e) {
      // On failure, fall back to original data
      return data;
    }
  };

  res.json = (body) => {
    const wrapped = buildEncryptedPayload(body);
    return originalJson(wrapped);
  };

  res.send = (body) => {
    try {
      // If a Buffer or stream-like or not a JSON body, just forward
      if (Buffer.isBuffer(body)) {
        return originalSend(body);
      }

      // Try to detect JSON-like strings
      if (typeof body === 'string') {
        const trimmed = body.trim();
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
          // Attempt to parse and wrap
          const parsed = JSON.parse(body);
          const wrapped = buildEncryptedPayload(parsed);
          return originalSend(JSON.stringify(wrapped));
        }
        // Non-JSON string
        return originalSend(body);
      }

      // Objects
      if (typeof body === 'object' && body !== null) {
        const wrapped = buildEncryptedPayload(body);
        return originalSend(wrapped);
      }

      // Other primitive types
      return originalSend(body);
    } catch (e) {
      return originalSend(body);
    }
  };

  next();
}

module.exports = { responseEncrypt };
