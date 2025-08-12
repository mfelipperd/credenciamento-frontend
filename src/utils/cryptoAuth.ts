import CryptoJS from 'crypto-js';

// Chave secreta do arquivo .env
const SECRET_KEY = import.meta.env.VITE_FRONTEND_SECRET_KEY || 'fallback-key-development-only';

/**
 * Gera um hash HMAC-SHA256 para autenticação frontend
 * Baseado no timestamp atual para evitar replay attacks
 */
export function generateFrontendAuthHash(): string {
  const timestamp = Date.now().toString();
  const message = `frontend-${timestamp}`;
  
  const hash = CryptoJS.HmacSHA256(message, SECRET_KEY).toString();
  
  // Retorna o hash com timestamp para validação no backend
  return `${hash}-${timestamp}`;
}

/**
 * Retorna apenas headers que não precisam de configuração CORS especial
 * Evita problemas com Access-Control-Allow-Headers
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    // Removido x-frontend-auth para evitar CORS
    // A autenticação será feita via query string e body
  };
}
