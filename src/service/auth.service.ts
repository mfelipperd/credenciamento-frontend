import { handleRequest } from "@/utils/handleRequest";
import { useBaseService } from "./base.service";
import type { ILoginFormPost, ILoginFormResponse } from "@/interfaces/logint";

export const useAuthService = () => {
  const { api, loading, setLoading } = useBaseService();

  const create = async (data: ILoginFormPost) => {
    await handleRequest({
      request: () => api.post<ILoginFormResponse>("/auth/login", data),
      setLoading,
      successMessage: "Login realizado com sucesso!",
    });
  };

  return {
    create,
    loading,
  };
};
