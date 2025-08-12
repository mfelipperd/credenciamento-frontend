import { useMemo } from "react";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import axios from "axios";
import { getSecurityHeaders } from "../utils/cryptoAuth";
import { enhanceRequestForBackendMiddleware, needsMiddlewareHeaders } from "../utils/middlewareCompat";

export const useAxiosPublic = (): AxiosInstance => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || "";

  const instance = useMemo(() => {
    const config: AxiosRequestConfig = {
      baseURL,
      headers: {
        "Content-Type": "application/json",
        ...getSecurityHeaders(),
      },
    };

    const inst = axios.create(config);

    // Interceptor para adicionar headers compatíveis com middleware
    inst.interceptors.request.use(
      (request) => {
        // Aplica estratégias de compatibilidade para rotas protegidas
        if (needsMiddlewareHeaders(request.url || '')) {
          request = enhanceRequestForBackendMiddleware(request);
        }
        return request;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor de resposta (opcional)
    inst.interceptors.response.use(
      (response) => response,
      (error) => {
        // Aqui você pode tratar erros comuns, ex: mostrar toast, etc
        return Promise.reject(error);
      }
    );

    return inst;
  }, [baseURL]);

  return instance;
};
