import { useDashboardService } from "@/service/dashboard.service";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const useDashboardController = () => {
  const fairId = useSearchParams()[0].get("fairId") || "";
  const { getOverView, overview, getCheckedInVisitors, getVisitorsBySectors } =
    useDashboardService();

  useEffect(() => {
    getOverView(fairId);
    getCheckedInVisitors(fairId);
    getVisitorsBySectors(fairId);
  }, [fairId]);

  return {
    overview,
    fairId,
  };
};
