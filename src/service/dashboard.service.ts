import { handleRequest } from "@/utils/handleRequest";
import { useBaseService } from "./base.service";
import type {
  DashboardOverviewReponse,
  DashboardCheckedInResponse,
  DashboardByCategoryResponse,
  DashboardByOriginResponse,
  DashboardBySectorsResponse,
  DashboardByabsentVisitorsResponse,
} from "@/interfaces/dashboard";
import { useState } from "react";

export const useDashboardService = () => {
  const { api, loading, setLoading } = useBaseService();
  const [overview, setOverview] = useState<DashboardOverviewReponse>();
  const [checkedIn, setCheckedIn] = useState<DashboardCheckedInResponse>();
  const [byCategory, setByCategory] = useState<DashboardByCategoryResponse>();
  const [byOrigin, setByOrigin] = useState<DashboardByOriginResponse>();
  const [bySectors, setBySectors] = useState<DashboardBySectorsResponse>();
  const [absenteeVisitors, setAbsenteeVisitors] =
    useState<DashboardByabsentVisitorsResponse>();

  const getOverView = async (fairId: string) => {
    const result = await handleRequest({
      request: () =>
        api.get<DashboardOverviewReponse>(`/dashboard/overview`, {
          params: { fairId },
        }),
      setLoading,
    });
    if (!result) return;
    setOverview(result);
    return result;
  };

  const getCheckedInVisitors = async (fairId: string) => {
    const result = await handleRequest({
      request: () =>
        api.get<DashboardCheckedInResponse>(`/dashboard/visitors/checked-in`, {
          params: { fairId },
        }),
      setLoading,
    });
    if (!result) return;

    setCheckedIn(result);
    return result;
  };

  const getVisitorsByCategory = async (fairId: string) => {
    const result = await handleRequest({
      request: () =>
        api.get<DashboardByCategoryResponse>(`/dashboard/visitors/category`, {
          params: { fairId },
        }),
      setLoading,
    });
    if (!result) return;
    setByCategory(result);
    return result;
  };

  const getVisitorsByOrigin = async (fairId: string) => {
    const result = await handleRequest({
      request: () =>
        api.get<DashboardByOriginResponse>(`/dashboard/visitors/origin`, {
          params: { fairId },
        }),
      setLoading,
    });
    if (!result) return;
    setByOrigin(result);
    return result;
  };

  const getVisitorsBySectors = async (fairId: string) => {
    const result = await handleRequest({
      request: () =>
        api.get<DashboardBySectorsResponse>(`/dashboard/visitors/sectors`, {
          params: { fairId },
        }),
      setLoading,
    });
    if (!result) return;
    setBySectors(result);
    return result;
  };

  const getAbsenteeVisitors = async (fairId: string) => {
    const result = await handleRequest({
      request: () =>
        api.get<DashboardByabsentVisitorsResponse>(
          `/dashboard/absent-visitors`,
          {
            params: { fairId },
          }
        ),
      setLoading,
    });
    if (!result) return;
    setAbsenteeVisitors(result);
    return result;
  };

  return {
    getOverView,
    getCheckedInVisitors,
    getVisitorsByCategory,
    getVisitorsByOrigin,
    getVisitorsBySectors,
    getAbsenteeVisitors,
    loading,
    overview,
    checkedIn,
    byCategory,
    byOrigin,
    bySectors,
    absenteeVisitors,
  };
};
