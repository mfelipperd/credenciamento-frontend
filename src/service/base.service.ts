import { useAxios } from "@/hooks/useAxio";
import { useState } from "react";

export const useBaseService = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const api = useAxios();

  return {
    api,
    loading,
    setLoading,
  };
};
