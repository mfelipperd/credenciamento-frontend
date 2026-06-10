import type { InternalAxiosRequestConfig } from 'axios';
import { getSecurityHeaders } from './cryptoAuth';

export function enhanceRequestForBackendMiddleware(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  config.headers = Object.assign({}, config.headers, getSecurityHeaders());
  return config;
}

export function needsMiddlewareHeaders(url: string): boolean {
  const protectedRoutes = ['/visitors', '/auth', '/dashboard', '/finance'];
  return protectedRoutes.some(route => url.includes(route));
}
