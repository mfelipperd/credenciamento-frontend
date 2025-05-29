import { useMemo } from "react";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import axios from "axios";

export const useAxiosPublic = (): AxiosInstance => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || "";

  const instance = useMemo(() => {
    const config: AxiosRequestConfig = {
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const inst = axios.create(config);

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
