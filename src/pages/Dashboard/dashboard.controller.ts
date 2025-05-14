import { useDashboardService } from "@/service/dashboard.service";
import { useEffect } from "react";

export const useDashboardController = () => {
  const { getOverView, overview, getCheckedInVisitors, getVisitorsBySectors } =
    useDashboardService();
  const fairId = "da6e3a8a-07dd-4964-a892-08a626bdd64f";

  useEffect(() => {
    getOverView(fairId);
    getCheckedInVisitors(fairId);
    getVisitorsBySectors(fairId);
  }, []);

  return {
    overview,
    fairId,
  };
};
