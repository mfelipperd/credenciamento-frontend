import { toast } from "sonner";
import { handleAxiosError } from "./handleAxiosError";
import { isSuccessfulRequest } from "./isSuccessRequest";
import type { AxiosResponse } from "axios";
import type { Dispatch, SetStateAction } from "react";

interface HandleRequestOptions<T> {
  /** Function that performs the Axios request */
  request: () => Promise<AxiosResponse<T>>;
  /** Optional React setter to toggle a loading state */
  setLoading?: Dispatch<SetStateAction<boolean>>;
  /** Optional message to show on successful request */
  successMessage?: string;
}

interface HandleFetchRequestOptions<T> {
  /** Function that performs the fetch request */
  request: () => Promise<Response>;
  /** Optional React setter to toggle a loading state */
  setLoading?: Dispatch<SetStateAction<boolean>>;
  /** Optional message to show on successful request */
  successMessage?: string;
}

/**
 * Generic helper to handle axios requests with loading, error handling and success toasts.
 * @returns The response data of type T, or an empty object of type T if no data was returned, or `undefined` on error.
 */
export async function handleRequest<T>(
  options: HandleRequestOptions<T>
): Promise<T | undefined> {
  const { request, setLoading, successMessage } = options;
  setLoading?.(true);

  try {
    const response = await request();
    const { status, data } = response;

    if (!isSuccessfulRequest(status)) {
      handleAxiosError(response);
      return;
    }

    if (successMessage) {
      toast.success(successMessage);
    }

    // If data is null, undefined or empty string (but not boolean false), return appropriate default value
    if (
      (data === null ||
        data === undefined ||
        (typeof data === "string" && data === "")) &&
      typeof data !== "boolean"
    ) {
      // For object types, return empty object; for primitive types, return appropriate default
      if (typeof data === "object") {
        return {} as T;
      }
      return data;
    }

    return data;
  } catch (error) {
    handleAxiosError(error);
  } finally {
    setLoading?.(false);
  }
}

/**
 * Generic helper to handle fetch requests with loading, error handling and success toasts.
 * @returns The response data of type T, or an empty object of type T if no data was returned, or `undefined` on error.
 */
export async function handleFetchRequest<T>(
  options: HandleFetchRequestOptions<T>
): Promise<T | undefined> {
  const { request, setLoading, successMessage } = options;
  setLoading?.(true);

  try {
    const response = await request();
    const { status, ok } = response;

    if (!ok) {
      // Handle fetch errors
      const errorText = await response.text();
      console.error(`HTTP Error ${status}: ${errorText}`);
      toast.error(`Erro na requisição: ${status}`);
      return;
    }

    if (successMessage) {
      toast.success(successMessage);
    }

    // Try to parse JSON response
    let data: T;
    try {
      data = await response.json();
    } catch {
      // If response is not JSON, return empty object for object types
      if (typeof data === "object") {
        return {} as T;
      }
      return data;
    }

    // If data is null, undefined or empty string (but not boolean false), return appropriate default value
    if (
      (data === null ||
        data === undefined ||
        (typeof data === "string" && data === "")) &&
      typeof data !== "boolean"
    ) {
      // For object types, return empty object; for primitive types, return appropriate default
      if (typeof data === "object") {
        return {} as T;
      }
      return data;
    }

    return data;
  } catch (error) {
    console.error("Fetch request error:", error);
    toast.error("Erro na requisição. Tente novamente.");
  } finally {
    setLoading?.(false);
  }
}

// Usage example:
// const result = await handleRequest<MyType>({
//   request: () => axios.get<MyType>("/api/resource"),
//   setLoading: setIsLoading,
//   successMessage: "Requisição realizada com sucesso!",
// });
// if (result) { /* result é MyType, mesmo que vazio */ }

// Fetch usage example:
// const result = await handleFetchRequest<MyType>({
//   request: () => fetch("/api/resource"),
//   setLoading: setIsLoading,
//   successMessage: "Requisição realizada com sucesso!",
// });
// if (result) { /* result é MyType, mesmo que vazio */ }
