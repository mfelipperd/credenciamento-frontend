import { handleRequest } from "@/utils/handleRequest";
import { useBaseService } from "./base.service";
import type { ILoginFormPost } from "@/interfaces/logint";
import type { AuthResponse } from "@/interfaces/auth";

export const useAuthService = () => {
  const { api, loading, setLoading } = useBaseService();

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
