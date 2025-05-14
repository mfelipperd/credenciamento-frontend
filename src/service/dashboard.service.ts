import { handleRequest } from "@/utils/handleRequest";
import { useBaseService } from "./base.service";
import type { DashboardOverviewReponse } from "@/interfaces/dashboard";
import { useState } from "react";

export const useDashboardService = () => {
  const { api, loading, setLoading } = useBaseService();
  const [overview, setOverview] = useState<DashboardOverviewReponse>();

  const getOverView = async (params: string) => {
    const result = await handleRequest({
      request: () =>
        api.get<DashboardOverviewReponse>(`/dashboard/overview`, {
          params: { fairId: params },
        }),
      setLoading,
    });
    if (!result) return;
    setOverview(result);
    return result;
  };

  return {
    getOverView,
    loading,
    overview,
  };
};
