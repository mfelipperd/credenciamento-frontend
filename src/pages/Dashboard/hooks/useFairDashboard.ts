import { useQuery } from "@tanstack/react-query";
import { useAxio } from "@/hooks/useAxio";
import { AppEndpoints } from "@/constants/AppEndpoints";
import type { FairKpi, ApexDonutData, ApexBarData } from "../types/charts";

const STALE = 5 * 60 * 1000; // 5 min

export function useFairDashboard(fairId: string) {
  const api = useAxio();
  const enabled = !!fairId;

  const kpi = useQuery<FairKpi>({
    queryKey: ["charts", "kpi", fairId],
    queryFn: () => api.get<FairKpi>(AppEndpoints.CHARTS.FAIR_KPI(fairId)).then((r) => r.data),
    enabled,
    staleTime: STALE,
  });

  const expensesByCategory = useQuery<ApexDonutData>({
    queryKey: ["charts", "expenses-by-category", fairId],
    queryFn: () =>
      api.get<ApexDonutData>(AppEndpoints.CHARTS.EXPENSES_BY_CATEGORY(fairId)).then((r) => r.data),
    enabled,
    staleTime: STALE,
  });

  const revenuesByStatus = useQuery<ApexDonutData>({
    queryKey: ["charts", "revenues-by-status", fairId],
    queryFn: () =>
      api.get<ApexDonutData>(AppEndpoints.CHARTS.REVENUES_BY_STATUS(fairId)).then((r) => r.data),
    enabled,
    staleTime: STALE,
  });

  const revenueForecast = useQuery<ApexBarData>({
    queryKey: ["charts", "revenue-forecast", fairId],
    queryFn: () =>
      api.get<ApexBarData>(AppEndpoints.CHARTS.REVENUE_FORECAST(fairId)).then((r) => r.data),
    enabled,
    staleTime: STALE,
  });

  const visitorsTimeline = useQuery<ApexBarData>({
    queryKey: ["charts", "visitors-timeline", fairId],
    queryFn: () =>
      api.get<ApexBarData>(AppEndpoints.CHARTS.VISITORS_TIMELINE(fairId)).then((r) => r.data),
    enabled,
    staleTime: STALE,
  });

  const checkinsByHour = useQuery<ApexBarData>({
    queryKey: ["charts", "checkins-by-hour", fairId],
    queryFn: () =>
      api.get<ApexBarData>(AppEndpoints.CHARTS.CHECKINS_BY_HOUR(fairId)).then((r) => r.data),
    enabled,
    staleTime: STALE,
  });

  const isLoading =
    kpi.isLoading ||
    expensesByCategory.isLoading ||
    revenuesByStatus.isLoading ||
    revenueForecast.isLoading ||
    visitorsTimeline.isLoading ||
    checkinsByHour.isLoading;

  return {
    kpi: kpi.data ?? null,
    expensesByCategory: expensesByCategory.data ?? null,
    revenuesByStatus: revenuesByStatus.data ?? null,
    revenueForecast: revenueForecast.data ?? null,
    visitorsTimeline: visitorsTimeline.data ?? null,
    checkinsByHour: checkinsByHour.data ?? null,
    isLoading,
    kpiLoading: kpi.isLoading,
  };
}

export function useCompareCharts(fairIds: string[]) {
  const api = useAxio();
  const enabled = fairIds.length > 0;

  const revenueVsExpenses = useQuery<ApexBarData>({
    queryKey: ["charts", "compare", fairIds.join(",")],
    queryFn: () =>
      api.get<ApexBarData>(AppEndpoints.CHARTS.COMPARE(fairIds)).then((r) => r.data),
    enabled,
    staleTime: STALE,
  });

  const margins = useQuery<ApexBarData>({
    queryKey: ["charts", "compare-margins", fairIds.join(",")],
    queryFn: () =>
      api.get<ApexBarData>(AppEndpoints.CHARTS.COMPARE_MARGINS(fairIds)).then((r) => r.data),
    enabled,
    staleTime: STALE,
  });

  const expensesBreakdown = useQuery<ApexBarData>({
    queryKey: ["charts", "compare-expenses", fairIds.join(",")],
    queryFn: () =>
      api.get<ApexBarData>(AppEndpoints.CHARTS.COMPARE_EXPENSES(fairIds)).then((r) => r.data),
    enabled,
    staleTime: STALE,
  });

  return {
    revenueVsExpenses: revenueVsExpenses.data ?? null,
    margins: margins.data ?? null,
    expensesBreakdown: expensesBreakdown.data ?? null,
    isLoading:
      revenueVsExpenses.isLoading || margins.isLoading || expensesBreakdown.isLoading,
  };
}
