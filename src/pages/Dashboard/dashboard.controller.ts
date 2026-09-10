import { useDashboardData } from "@/hooks/useDashboardData";
import { useSearchParams } from "@/hooks/useSearchParams";
import { AppEndpoints } from "@/constants/AppEndpoints";
import type { DashboardOverviewReponse, DashboardByabsentVisitorsResponse } from "@/interfaces/dashboard";

export const useDashboardController = () => {
  const [, , fairId] = useSearchParams();
  const overview = useDashboardData<DashboardOverviewReponse>(AppEndpoints.DASHBOARD.OVERVIEW, fairId);
  const absent = useDashboardData<DashboardByabsentVisitorsResponse>(AppEndpoints.DASHBOARD.ABSENT_VISITORS, fairId);
  return {
    overview: overview.data,
    fairId,
    absenteeVisitors: absent.data,
    loading: overview.isLoading || absent.isLoading,
  };
};
