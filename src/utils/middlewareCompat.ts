import { getSecurityHeaders } from './cryptoAuth';

export function enhanceRequestForBackendMiddleware(config: Record<string, unknown> & { headers?: Record<string, string> }) {
  config.headers = { ...config.headers, ...getSecurityHeaders() };
  return config;
}

export function needsMiddlewareHeaders(url: string): boolean {
  const protectedRoutes = ['/visitors', '/auth', '/dashboard', '/finance'];
  return protectedRoutes.some(route => url.includes(route));
}
