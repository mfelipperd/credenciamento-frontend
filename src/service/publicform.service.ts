import { useAxios } from "@/hooks/useAxio";
import type { CredenciamentoFormData } from "@/pages/PublicForm/FormCreateVisitor/schema";
import { useState } from "react";

export const usePublicFormService = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const api = useAxios();

  const create = async (data: CredenciamentoFormData) => {
    try {
      setLoading(true);
      const response = await api.post("/visitors", data);
      if (!response.data) return;
      return response;
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    create,
    loading,
  };
};
