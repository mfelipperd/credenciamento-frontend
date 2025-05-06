import { useAxios } from "@/hooks/useAxio";
import type { CreateVisitor } from "@/pages/PublicForm/FormCreateVisitor";
import { useState } from "react";

export const usePublicFormService = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const api = useAxios();

  const create = async (data: CreateVisitor) => {
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
