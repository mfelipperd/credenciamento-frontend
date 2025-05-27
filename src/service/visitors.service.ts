import { handleRequest } from "@/utils/handleRequest";
import { useBaseService } from "./base.service";

export const useVisitorsService = () => {
  const { api, loading, setLoading } = useBaseService();
  const getVisitors = async (faird: string) => {
    const result = await handleRequest({
      request: () => api.get("visitors", { params: { fairId: faird } }),
      setLoading,
    });
    if (!result) return;
    return result;
  };
  return {
    getVisitors,
    loading,
  };
};
