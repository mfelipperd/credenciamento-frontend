import { useDashboardService } from "@/service/dashboard.service";
import { useVisitorsService } from "@/service/visitors.service";
import { useEffect, useRef } from "react";
import { useSearchParams } from "@/hooks/useSearchParams";

export const useDashboardController = () => {
  const [, , fairId] = useSearchParams();
  const hasFetchedRef = useRef<string | null>(null);

  const {
    getOverView,
    overview,
    getCheckedInVisitors,
    getVisitorsBySectors,
    getAbsenteeVisitors,
    absenteeVisitors,
  } = useDashboardService();

  const { getCheckinPerHour, checkinPerHour, loading } = useVisitorsService();

  useEffect(() => {
    // Só faz requisições se fairId existe e é diferente do último fetch
    if (fairId && hasFetchedRef.current !== fairId) {
      console.log("Dashboard: Atualizando dados para novo fairId:", fairId);
      hasFetchedRef.current = fairId;
      
      // Executa as chamadas em paralelo
      Promise.all([
        getOverView(fairId),
        getCheckedInVisitors(fairId),
        getVisitorsBySectors(fairId),
        getAbsenteeVisitors(fairId),
        getCheckinPerHour(fairId)
      ]);
    }
  }, [fairId, getOverView, getCheckedInVisitors, getVisitorsBySectors, getAbsenteeVisitors, getCheckinPerHour]);

  return {
    overview,
    fairId,
    absenteeVisitors,
    checkinPerHour,
    getCheckinPerHour,
    loading,
  };
};
