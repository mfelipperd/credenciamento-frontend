import { getSecurityHeaders } from './cryptoAuth';

/**
 * Utilitário para autenticação usando headers corretos (como backend espera)
 * Backend FrontendOriginGuard espera x-frontend-auth header
 */

/**
 * Adiciona autenticação via header x-frontend-auth (como backend espera)
 */
export function enhanceRequestForBackendMiddleware(config: any) {
  const securityHeaders = getSecurityHeaders();
  
  console.log('🔐 Aplicando autenticação para rota protegida:', {
    url: config.url,
    method: config.method,
    headers: Object.keys(securityHeaders)
  });
  
  // Aplicar headers de segurança (x-frontend-auth)
  config.headers = {
    ...config.headers,
    ...securityHeaders
  };
  
  console.log('� Headers de autenticação aplicados');

  return config;
}

/**
 * Verifica se uma requisição é para rota que precisa do middleware
 */
export function needsMiddlewareHeaders(url: string): boolean {
  // Rotas específicas que passam pelo middleware de segurança
  const protectedRoutes = [
    '/visitors',      // GET e POST de visitors
    '/auth',         // Login
    '/dashboard',    // Dashboard (se necessário)
    '/finance'       // Finance (se necessário)
  ];
  
  return protectedRoutes.some(route => url.includes(route));
}
