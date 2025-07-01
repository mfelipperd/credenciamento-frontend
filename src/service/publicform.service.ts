import { useAxiosPublic } from "@/hooks/useAxiosPublic";
import type { Visitor } from "@/interfaces/visitors";
import type { CredenciamentoFormData } from "@/pages/PublicForm/FormCreateVisitor/schema";
import { useState } from "react";

export const usePublicFormService = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const api = useAxiosPublic();

  const create = async (
    data: CredenciamentoFormData
  ): Promise<Visitor | undefined> => {
    try {
      setLoading(true);
      const response = await api.post<Visitor>("/visitors", data);
      if (!response.data) return;
      return response.data;
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
