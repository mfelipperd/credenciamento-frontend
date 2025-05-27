import { useDashboardService } from "@/service/dashboard.service";
import { useFairService } from "@/service/fair.service";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const useDashboardController = () => {
  const fairId = useSearchParams()[0].get("fairId") || "";
  const { getOverView, overview, getCheckedInVisitors, getVisitorsBySectors } =
    useDashboardService();
  const { getFairs } = useFairService();

  useEffect(() => {
    getFairs();
    getOverView(fairId);
    getCheckedInVisitors(fairId);
    getVisitorsBySectors(fairId);
  }, []);

  return {
    overview,
    fairId,
  };
};
