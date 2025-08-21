import { useDashboardService } from "@/service/dashboard.service";
import { useVisitorsService } from "@/service/visitors.service";
import { useEffect, useRef } from "react";
import { useSearchParams } from "@/hooks/useSearchParams";

export const useDashboardController = () => {
  const [, , fairId] = useSearchParams();
  const hasFetchedRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

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
    // Aguarda a inicialização completa antes de fazer qualquer requisição
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      return;
    }

    // Só faz requisições se fairId existe e é diferente do último fetch
    if (fairId && hasFetchedRef.current !== fairId) {
      console.log("Dashboard: Fazendo fetch de dados para fairId:", fairId);
      getOverView(fairId);
      getCheckedInVisitors(fairId);
      getVisitorsBySectors(fairId);
      getAbsenteeVisitors(fairId);
      getCheckinPerHour(fairId);
      hasFetchedRef.current = fairId;
    } else if (!fairId) {
      console.log(
        "Dashboard: Não foi possível fazer fetch - fairId não disponível"
      );
      // Não faz requisições quando não há fairId válido
      return;
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
