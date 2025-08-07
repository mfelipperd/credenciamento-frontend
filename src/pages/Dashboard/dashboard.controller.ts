import { useDashboardService } from "@/service/dashboard.service";
import { useVisitorsService } from "@/service/visitors.service";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

export const useDashboardController = () => {
  const fairId = useSearchParams()[0].get("fairId") || "";
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
    // Só faz requisições se fairId existe, não é vazio e é diferente do último fetch
    if (fairId && fairId.trim() !== "" && hasFetchedRef.current !== fairId) {
      console.log("Dashboard: Fazendo fetch de dados para fairId:", fairId);
      getOverView(fairId);
      getCheckedInVisitors(fairId);
      getVisitorsBySectors(fairId);
      getAbsenteeVisitors(fairId);
      getCheckinPerHour(fairId);
      hasFetchedRef.current = fairId;
    } else if (!fairId || fairId.trim() === "") {
      console.log(
        "Dashboard: Não foi possível fazer fetch - fairId inválido:",
        fairId
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fairId]);

  return {
    overview,
    fairId,
    absenteeVisitors,
    checkinPerHour,
    getCheckinPerHour,
    loading,
  };
};
