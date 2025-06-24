import { handleRequest } from "@/utils/handleRequest";
import { useBaseService } from "./base.service";
import type { Visitor } from "@/interfaces/visitors";
import { useState } from "react";

export const useVisitorsService = () => {
  const { api, loading, setLoading } = useBaseService();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [visitor, setVisitor] = useState<Visitor>();
  const getVisitors = async (faird: string) => {
    const result = await handleRequest({
      request: () => api.get("visitors", { params: { fairId: faird } }),
      setLoading,
    });
    if (!result) return;
    setVisitors(result);
  };

  const getVisitorById = async (visitorId?: string, params?: string) => {
    const result = await handleRequest({
      request: () =>
        api.get<Visitor>(`visitors/${visitorId}`, {
          params: {
            fairId: params,
          },
        }),
      setLoading,
    });
    if (!result) return;
    setVisitor(result);
  };

  const checkinVisitor = async (visitorId: string, fairId: string) => {
    const result = await handleRequest({
      request: () =>
        api.post(`/checkins`, { registrationCode: visitorId, fairId: fairId }),
      setLoading,
      successMessage: "Check-in realizado com sucesso!",
    });
    if (!result) return;
    return result;
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
    getVisitorById,
    visitor,
    checkinVisitor,
  };
};
