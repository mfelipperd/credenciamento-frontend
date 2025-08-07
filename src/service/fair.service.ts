import { handleRequest } from "@/utils/handleRequest";
import { useBaseService } from "./base.service";
import { useState, useCallback } from "react";
import type { IListFair } from "@/interfaces/fairs";

export const useFairService = () => {
  const { api, loading, setLoading } = useBaseService();
  const [fairs, setFairs] = useState<IListFair[]>([]);

  const getFairs = useCallback(async () => {
    const result = await handleRequest({
      request: () => api.get<IListFair[]>("fairs"),
      setLoading,
    });
    if (!result) return;

    return setFairs(result || []);
  }, [api, setLoading]);

  return {
    getFairs,
    loading,
    fairs,
  };
};
