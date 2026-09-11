import { useMemo } from "react";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import axios from "axios";
import { useExhibitorAuth } from "./useExhibitorAuth";
import { getSecurityHeaders } from "../utils/cryptoAuth";
import { enhanceRequestForBackendMiddleware, needsMiddlewareHeaders } from "../utils/middlewareCompat";

export const useExhibitorAxio = (): AxiosInstance => {
  const { token } = useExhibitorAuth();

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
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
        if (needsMiddlewareHeaders(request.url || "")) {
          request = enhanceRequestForBackendMiddleware(request);
        }
        return request;
      },
      (error) => Promise.reject(error)
    );

    inst.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error)
    );

    return inst;
  }, [token]);

  return instance;
};
