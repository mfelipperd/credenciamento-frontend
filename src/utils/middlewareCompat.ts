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
  
  console.log('🔐 Gerando autenticação frontend:', {
    url: config.url,
    method: config.method,
    authHash: authHash,
    secretKey: import.meta.env.VITE_FRONTEND_SECRET_KEY ? 'Configurado' : 'Usando fallback'
  });
  
  // Estratégia 1: Query string (sempre funciona, sem CORS)
  if (config.url) {
    const separator = config.url.includes('?') ? '&' : '?';
    const newUrl = config.url + `${separator}frontend-client=true&app-type=frontend&auth-hash=${encodeURIComponent(authHash)}`;
    console.log('📡 URL com autenticação:', newUrl);
    config.url = newUrl;
  }

  // Estratégia 2: Body parameters para POST/PUT (sem CORS)
  if (config.data && typeof config.data === 'object' && config.method?.toLowerCase() !== 'get') {
    config.data = {
      ...config.data,
      __frontendClient: true,
      __appType: 'frontend',
      __authHash: authHash,
    };
    console.log('📦 Body com autenticação:', config.data);
  }

  // REMOVIDO: Todos os headers customizados que causam CORS
  // Usando apenas Content-Type e Authorization que já funcionam

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
