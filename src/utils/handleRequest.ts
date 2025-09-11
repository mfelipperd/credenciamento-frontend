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
    console.log("🚀 handleRequest iniciado");
    const response = await request();
    const { status, data } = response;
    
    console.log("📊 handleRequest response:", { status, data });

    if (!isSuccessfulRequest(status)) {
      console.log("❌ handleRequest - status não é sucesso:", status);
      handleAxiosError(response);
      return;
    }

    if (successMessage) {
      console.log("✅ handleRequest - exibindo mensagem de sucesso:", successMessage);
      toast.success(successMessage);
    }

    // If data is null, undefined or empty string (but not boolean false), return appropriate default value
    if (
      (data === null ||
        data === undefined ||
        (typeof data === "string" && data === "")) &&
      typeof data !== "boolean"
    ) {
      console.log("⚠️ handleRequest - dados vazios, retornando valor padrão");
      // For object types, return empty object; for primitive types, return appropriate default
      if (typeof data === "object") {
        return {} as T;
      }
      return data;
    }

    console.log("✅ handleRequest - retornando dados:", data);
    return data;
  } catch (error) {
    console.log("❌ handleRequest - erro capturado:", error);
    handleAxiosError(error);
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
