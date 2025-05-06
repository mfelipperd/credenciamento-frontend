import type { AxiosInstance, AxiosRequestConfig } from "axios";
import axios from "axios";

export const useAxios = (): AxiosInstance => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || "";

  const config: AxiosRequestConfig = {
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Cria instância
  const instance = axios.create(config);

  // Interceptadores (opcional)
  instance.interceptors.request.use(
    (request) => {
      // ex: adicionar token
      // request.headers.Authorization = `Bearer ${token}`;
      return request;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // tratamento global de erros
      return Promise.reject(error);
    }
  );

  return instance;
};
