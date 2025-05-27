import { handleRequest } from "@/utils/handleRequest";
import { useBaseService } from "./base.service";
import { useState } from "react";
import type { IListFair } from "@/interfaces/fairs";

export const useFairService = () => {
  const { api, loading, setLoading } = useBaseService();
  const [fairs, setFairs] = useState<IListFair[]>([]);
  const getFairs = async () => {
    const result = await handleRequest({
      request: () => api.get<IListFair[]>("fairs"),
      setLoading,
    });
    if (!result) return;

    return setFairs(result || []);
  };

  return {
    getFairs,
    loading,
    fairs,
  };
};
