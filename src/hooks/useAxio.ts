import { useMemo } from "react";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import axios from "axios";
import { useAuth } from "./useAuth";

export const useAxios = (): AxiosInstance => {
  const { token } = useAuth(); // pega o token do contexto
  const baseURL = import.meta.env.VITE_API_BASE_URL || "";

  // Memoiza a instância para não recriar em toda renderização
  const instance = useMemo(() => {
    const config: AxiosRequestConfig = {
      baseURL,
      headers: {
        "Content-Type": "application/json",
        // não define Authorization aqui—vem via interceptor
      },
    };
    const inst = axios.create(config);

    // Request interceptor: injeta token se existir
    inst.interceptors.request.use(
      (request) => {
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
        return request;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor opcional
    inst.interceptors.response.use(
      (response) => response,
      (error) => {
        // ex: se 401, talvez faça signOut automático...
        return Promise.reject(error);
      }
    );

    return inst;
  }, [baseURL, token]);

  return instance;
};
