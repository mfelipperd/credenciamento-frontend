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
export async function handleRequest<T extends object>(
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

    // If data is null, undefined or empty string (but not boolean false), return an empty object of type T
    if (
      (data === null ||
        data === undefined ||
        (typeof data === "string" && data === "")) &&
      typeof data !== "boolean"
    ) {
      return {} as T;
    }

    return data;
  } catch (error) {
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
