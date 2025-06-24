import { useDashboardService } from "@/service/dashboard.service";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const useDashboardController = () => {
  const fairId = useSearchParams()[0].get("fairId") || "";
  const {
    getOverView,
    overview,
    getCheckedInVisitors,
    getVisitorsBySectors,
    getAbsenteeVisitors,
    absenteeVisitors,
  } = useDashboardService();

  useEffect(() => {
    getOverView(fairId);
    getCheckedInVisitors(fairId);
    getVisitorsBySectors(fairId);
    getAbsenteeVisitors(fairId);
  }, [fairId]);

  return {
    overview,
    fairId,
    absenteeVisitors,
  };
};
