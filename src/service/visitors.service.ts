import { handleRequest } from "@/utils/handleRequest";
import { useBaseService } from "./base.service";
import type { Visitor } from "@/interfaces/visitors";
import { useState } from "react";

export const useVisitorsService = () => {
  const { api, loading, setLoading } = useBaseService();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const getVisitors = async (faird: string) => {
    const result = await handleRequest({
      request: () => api.get("visitors", { params: { fairId: faird } }),
      setLoading,
    });
    if (!result) return;
    setVisitors(result);
  };

  const deleteVisitor = async (visitorId: string) => {
    const result = await handleRequest({
      request: () => api.delete(`visitors/${visitorId}`),
      setLoading,
    });
    if (!result) return;
    return result;
  };
  return {
    getVisitors,
    loading,
    visitors,
    deleteVisitor,
  };
};
