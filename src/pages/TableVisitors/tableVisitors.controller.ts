import { useVisitorsService } from "@/service/visitors.service";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const useTableVisitorsController = () => {
  const fairId = useSearchParams()[0].get("fairId") ?? "";
  const { getVisitors, loading } = useVisitorsService();

  useEffect(() => {
    getVisitors(fairId);
  }, [fairId]);

  return {
    loading,
  };
};
