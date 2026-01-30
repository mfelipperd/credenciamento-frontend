import { useMemo } from "react";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import axios from "axios";
import { useAuth } from "./useAuth";
import { getSecurityHeaders } from "../utils/cryptoAuth";
import { enhanceRequestForBackendMiddleware, needsMiddlewareHeaders } from "../utils/middlewareCompat";

export const useAxio = (): AxiosInstance => {
  const { token } = useAuth();

  const instance = useMemo(() => {
    const config: AxiosRequestConfig = {
      baseURL: import.meta.env.VITE_API_BASE_URL || "",
      headers: {
        "Content-Type": "application/json",
        ...getSecurityHeaders(),
      },
    };

    const inst = axios.create(config);

    inst.interceptors.request.use(
      (request) => {
        // Adiciona token de autorização se disponível
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
        
        // Aplica estratégias de compatibilidade para rotas protegidas
        if (needsMiddlewareHeaders(request.url || "")) {
          request = enhanceRequestForBackendMiddleware(request);
        }
        
        return request;
      },
      (error) => Promise.reject(error)
    );

    inst.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(error);
      }
    );

    return inst;
  }, [token]);

  return instance;
};
