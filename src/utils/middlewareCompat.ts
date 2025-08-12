import { generateFrontendAuthHash } from './cryptoAuth';

/**
 * Utilitário para autenticação SEM USAR HEADERS CUSTOMIZADOS
 * Usa apenas query string e body para evitar problemas de CORS
 */

/**
 * Adiciona autenticação via query string e body (ZERO CORS necessário)
 */
export function enhanceRequestForBackendMiddleware(config: any) {
  const authHash = generateFrontendAuthHash();
  
  // Estratégia 1: Query string (sempre funciona, sem CORS)
  if (config.url) {
    const separator = config.url.includes('?') ? '&' : '?';
    config.url += `${separator}frontend-client=true&app-type=frontend&auth-hash=${encodeURIComponent(authHash)}`;
  }

  // Estratégia 2: Body parameters para POST/PUT (sem CORS)
  if (config.data && typeof config.data === 'object' && config.method?.toLowerCase() !== 'get') {
    config.data = {
      ...config.data,
      __frontendClient: true,
      __appType: 'frontend',
      __authHash: authHash,
    };
  }

  // REMOVIDO: Todos os headers customizados que causam CORS
  // Usando apenas Content-Type e Authorization que já funcionam

  return config;
}

/**
 * Verifica se uma requisição é para rota que precisa do middleware
 */
export function needsMiddlewareHeaders(url: string): boolean {
  // Rotas que passam pelo middleware de segurança
  const protectedRoutes = ['/visitor', '/auth', '/dashboard', '/finance'];
  return protectedRoutes.some(route => url.includes(route));
}
