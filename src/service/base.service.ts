import { useAxio } from "@/hooks/useAxio";
import { useState, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";

export const useBaseService = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const api = useAxio();

  const setLoadingCallback = useCallback<Dispatch<SetStateAction<boolean>>>(
    (value) => {
      setLoading(value);
    },
    []
  );

  return {
    api,
    loading,
    setLoading: setLoadingCallback,
  };
};
