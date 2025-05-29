import { handleRequest } from "@/utils/handleRequest";
import type { ILoginFormPost } from "@/interfaces/logint";
import type { AuthResponse } from "@/interfaces/auth";
import { useState } from "react";
import { useAxiosPublic } from "@/hooks/useAxiosPublic";

export const useAuthService = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const api = useAxiosPublic();
  const create = async (
    data: ILoginFormPost
  ): Promise<AuthResponse | undefined> => {
    const result = await handleRequest({
      request: () => api.post<AuthResponse>("/auth/login", data),
      setLoading,
      successMessage: "Login realizado com sucesso!",
    });
    return result;
  };

  return {
    create,
    loading,
  };
};
