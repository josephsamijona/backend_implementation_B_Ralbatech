const crypto = require('crypto');
const algorithm = 'aes-256-cbc';

// Decode Base64 values from .env
const key = Buffer.from(process.env.ENC_KEY, 'base64'); // 32 bytes
const iv = Buffer.from(process.env.IV, 'base64');       // 16 bytes

const encrypt = (plaintext) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted; // return as Base64 string
};

const decrypt = (encryptedBase64) => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedBase64, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted; // return UTF-8 string
};

module.exports = {
  encrypt,
  decrypt
};
