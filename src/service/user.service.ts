import { handleRequest } from "@/utils/handleRequest";
import { useBaseService } from "./base.service";
import type { CreateUserInput } from "@/components/Layout/ModalCreateUser/schema";
import { AppEndpoints } from "@/constants/AppEndpoints";

export const useUserService = () => {
  const { api, loading, setLoading } = useBaseService();
  const createUser = async (userData: CreateUserInput) => {
    const result = await handleRequest({
      request: () => api.post(AppEndpoints.USERS.BASE, userData),
      setLoading,
    });
    if (!result) return;

    return result;
  };

  return {
    createUser,
    loading,
  };
};
