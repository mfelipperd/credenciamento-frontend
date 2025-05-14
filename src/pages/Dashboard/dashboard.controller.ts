import { useDashboardService } from "@/service/dashboard.service";
import { useEffect } from "react";

export const useDashboardController = () => {
  const { getOverView, overview } = useDashboardService();
  const fairId = "da6e3a8a-07dd-4964-a892-08a626bdd64f";

  useEffect(() => {
    console.log("testeee");
    const fetchData = async () => {
      const result = await getOverView(fairId);
      console.log("testeeee:", result);
    };
    fetchData();
  }, []);

  return {
    overview,
  };
};
