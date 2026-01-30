import { handleRequest } from "@/utils/handleRequest";
import { useBaseService } from "./base.service";
import type {
  DashboardOverviewReponse,
  DashboardCheckedInResponse,
  DashboardByCategoryResponse,
  DashboardByOriginResponse,
  DashboardBySectorsResponse,
  DashboardByabsentVisitorsResponse,
  DashboardConversionResponse,
} from "@/interfaces/dashboard";
import { useState, useCallback, useMemo } from "react";
import { AppEndpoints } from "@/constants/AppEndpoints";

export const useDashboardService = () => {
  const { api, loading, setLoading } = useBaseService();
  const [overview, setOverview] = useState<DashboardOverviewReponse>();
  const [checkedIn, setCheckedIn] = useState<DashboardCheckedInResponse>();
  const [byCategory, setByCategory] = useState<DashboardByCategoryResponse>();
  const [byOrigin, setByOrigin] = useState<DashboardByOriginResponse>();
  const [bySectors, setBySectors] = useState<DashboardBySectorsResponse>();
  const [absenteeVisitors, setAbsenteeVisitors] =
    useState<DashboardByabsentVisitorsResponse>();
  const [conversionData, setConversionData] =
    useState<DashboardConversionResponse>();

  const getOverView = useCallback(
    async (fairId: string) => {
      const result = await handleRequest({
        request: () =>
          api.get<DashboardOverviewReponse>(AppEndpoints.DASHBOARD.OVERVIEW, {
            params: { fairId },
          }),
        setLoading,
      });
      if (!result) return;
      setOverview(result);
      return result;
    },
    [api, setLoading]
  );

  const getCheckedInVisitors = useCallback(
    async (fairId: string) => {
      const result = await handleRequest({
        request: () =>
          api.get<DashboardCheckedInResponse>(
            AppEndpoints.DASHBOARD.VISITORS_CHECKED_IN,
            {
              params: { fairId },
            }
          ),
        setLoading,
      });
      if (!result) return;

      setCheckedIn(result);
      return result;
    },
    [api, setLoading]
  );

  const getVisitorsByCategory = useCallback(
    async (fairId: string) => {
      const result = await handleRequest({
        request: () =>
          api.get<DashboardByCategoryResponse>(
            AppEndpoints.DASHBOARD.VISITORS_CATEGORY,
            {
              params: { fairId },
            }
          ),
        setLoading,
      });
      if (!result) return;
      setByCategory(result);
      return result;
    },
    [api, setLoading]
  );

  const getVisitorsByOrigin = useCallback(
    async (fairId: string) => {
      const result = await handleRequest({
        request: () =>
          api.get<DashboardByOriginResponse>(
            AppEndpoints.DASHBOARD.VISITORS_ORIGIN,
            {
              params: { fairId },
            }
          ),
        setLoading,
      });
      if (!result) return;
      setByOrigin(result);
      return result;
    },
    [api, setLoading]
  );

  const getVisitorsBySectors = useCallback(
    async (fairId: string) => {
      const result = await handleRequest({
        request: () =>
          api.get<DashboardBySectorsResponse>(
            AppEndpoints.DASHBOARD.VISITORS_SECTORS,
            {
              params: { fairId },
            }
          ),
        setLoading,
      });
      if (!result) return;
      setBySectors(result);
      return result;
    },
    [api, setLoading]
  );

  const getAbsenteeVisitors = useCallback(
    async (fairId: string) => {
      const result = await handleRequest({
        request: () =>
          api.get<DashboardByabsentVisitorsResponse>(
            AppEndpoints.DASHBOARD.ABSENT_VISITORS,
            {
              params: { fairId },
            }
          ),
        setLoading,
      });
      if (!result) return;
      setAbsenteeVisitors(result);
      return result;
    },
    [api, setLoading]
  );

  const getConversionsByHowDidYouKnow = useCallback(
    async (fairId: string) => {
      const result = await handleRequest({
        request: () =>
          api.get<DashboardConversionResponse>(
            AppEndpoints.DASHBOARD.CONVERSIONS_HOW_DID_YOU_KNOW,
            {
              params: { fairId },
            }
          ),
        setLoading,
      });
      if (!result) return;
      setConversionData(result);
      return result;
    },
    [api, setLoading]
  );

  return useMemo(
    () => ({
      getOverView,
      getCheckedInVisitors,
      getVisitorsByCategory,
      getVisitorsByOrigin,
      getVisitorsBySectors,
      getAbsenteeVisitors,
      getConversionsByHowDidYouKnow,
      loading,
      overview,
      checkedIn,
      byCategory,
      byOrigin,
      bySectors,
      absenteeVisitors,
      conversionData,
    }),
    [
      getOverView,
      getCheckedInVisitors,
      getVisitorsByCategory,
      getVisitorsByOrigin,
      getVisitorsBySectors,
      getAbsenteeVisitors,
      getConversionsByHowDidYouKnow,
      loading,
      overview,
      checkedIn,
      byCategory,
      byOrigin,
      bySectors,
      absenteeVisitors,
      conversionData,
    ]
  );
};
