import { handleRequest } from "@/utils/handleRequest";
import { useBaseService } from "./base.service";
import { useState, useCallback } from "react";
import type { IListFair, ICreateFair } from "@/interfaces/fairs";

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

  const createFair = useCallback(
    async (fairData: ICreateFair) => {
      const result = await handleRequest({
        request: () => api.post<IListFair>("fairs", fairData),
        setLoading,
      });
      if (result) {
        // Recarrega a lista de feiras após criar uma nova
        await getFairs();
      }
      return result;
    },
    [api, setLoading, getFairs]
  );

  return {
    getFairs,
    createFair,
    loading,
    fairs,
  };
};
