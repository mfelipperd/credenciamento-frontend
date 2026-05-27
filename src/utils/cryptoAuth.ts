import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_FRONTEND_SECRET_KEY || 'fallback-key-development-only';

// PBKDF2 com 16384 iterações é custoso — cache por 30s para não bloquear a main thread em cada request
let _cachedHash: string | null = null;
let _cacheExpiry = 0;

// Deriva a chave uma única vez por sessão (a chave não muda)
const _derivedKey = CryptoJS.PBKDF2(SECRET_KEY, 'salt', { keySize: 256 / 32, iterations: 16384 });

export function generateFrontendAuthHash(): string {
  const now = Date.now();
  if (_cachedHash && now < _cacheExpiry) return _cachedHash;

  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(now.toString(), _derivedKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  _cachedHash = iv.toString(CryptoJS.enc.Hex) + encrypted.ciphertext.toString(CryptoJS.enc.Hex);
  _cacheExpiry = now + 30_000;
  return _cachedHash;
}

export function getSecurityHeaders(): Record<string, string> {
  return { 'x-frontend-auth': generateFrontendAuthHash() };
}
