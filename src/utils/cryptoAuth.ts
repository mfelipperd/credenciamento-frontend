import CryptoJS from 'crypto-js';

// Chave secreta do arquivo .env
const SECRET_KEY = import.meta.env.VITE_FRONTEND_SECRET_KEY || 'fallback-key-development-only';

/**
 * Gera um token criptografado AES-256-CBC para autenticação frontend
 * Implementação idêntica ao backend FrontendOriginGuard.generateFrontendAuth()
 */
export function generateFrontendAuthHash(): string {
  try {
    // Gerar chave usando scrypt (mesmo algoritmo do backend)
    const key = CryptoJS.PBKDF2(SECRET_KEY, 'salt', {
      keySize: 256/32,
      iterations: 16384
    });
    
    // Gerar IV aleatório (16 bytes)
    const iv = CryptoJS.lib.WordArray.random(16);
    
    // Timestamp atual
    const timestamp = Date.now().toString();
    
    console.log('🔑 Gerando token AES:', {
      timestamp,
      secretKey: SECRET_KEY.substring(0, 10) + '...',
      secretKeyLength: SECRET_KEY.length
    });
    
    // Criptografar timestamp usando AES-256-CBC
    const encrypted = CryptoJS.AES.encrypt(timestamp, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // Retornar IV + dados criptografados (mesmo formato do backend)
    const result = iv.toString(CryptoJS.enc.Hex) + encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    
    console.log('✅ Token AES gerado:', result.substring(0, 20) + '...');
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao gerar token AES:', error);
    throw error;
  }
}

/**
 * Retorna os headers obrigatórios para o middleware de segurança
 * Agora usando o header x-frontend-auth como o backend espera
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'x-frontend-auth': generateFrontendAuthHash(),
  };
}
