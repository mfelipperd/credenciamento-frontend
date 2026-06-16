import { handleRequest } from "@/utils/handleRequest";
import { useAxio } from "@/hooks/useAxio";
import { AppEndpoints } from "@/constants/AppEndpoints";

export type ProspectStatus =
  | "NOVO"
  | "CONTATADO"
  | "RESPONDEU"
  | "INTERESSADO"
  | "CONVERTIDO"
  | "DESCARTADO";

export type ProspectType = "EXPOSITOR" | "VISITANTE";

export interface Prospect {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  sector?: string;
  cnaeDescricao?: string;
  type: ProspectType;
  status: ProspectStatus;
  state?: string;
  city?: string;
  email?: string;
  phone?: string;
  notes?: string;
  isB2bPriority?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProspectAnalytics {
  overview: {
    total: number;
    byType: { expositores: number; visitantes: number };
    conversionRate: number;
    contactRate: number;
    withEmail: number;
    withPhone: number;
    enriched: number;
  };
  funnel: Array<{ status: ProspectStatus; count: number }>;
  sectorDistribution: Array<{
    sector: string;
    count: number;
    b2bPriority: boolean;
  }>;
  geographicDistribution: Array<{ state: string; count: number }>;
  topCnaes: Array<{
    code: string;
    description: string;
    sector: string;
    count: number;
  }>;
  charts: {
    sector: { labels: string[]; series: number[] };
    funnel: { categories: string[]; series: [{ name: string; data: number[] }] };
    geographic: {
      categories: string[];
      series: [{ name: string; data: number[] }];
    };
  };
}

export interface ImportCnpjsResult {
  imported: number;
  skipped: number;
  errors: number;
}

export interface PaginatedProspects {
  data: Prospect[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardOverview {
  fairId: string;
  totalVisitors: number;
  totalCheckIns: number;
}

export const useProspectsService = () => {
  const api = useAxio();

  const getDashboardOverview = async (
    fairId: string
  ): Promise<DashboardOverview | null> => {
    const response = await handleRequest({
      request: () =>
        api.get(AppEndpoints.DASHBOARD.OVERVIEW, { params: { fairId } }),
    });
    return response as DashboardOverview | null;
  };

  const getProspectAnalytics = async (
    fairId: string
  ): Promise<ProspectAnalytics | null> => {
    const response = await handleRequest({
      request: () => api.get(AppEndpoints.PROSPECTS.ANALYTICS(fairId)),
    });
    return response as ProspectAnalytics | null;
  };

  const getProspects = async (
    fairId: string,
    params: {
      type?: string;
      status?: string;
      state?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedProspects | null> => {
    const response = await handleRequest({
      request: () =>
        api.get(AppEndpoints.PROSPECTS.BY_FAIR(fairId), { params }),
    });
    return response as PaginatedProspects | null;
  };

  const updateProspectStatus = async (
    fairId: string,
    id: string,
    status: ProspectStatus,
    notes?: string
  ): Promise<Prospect | null> => {
    const response = await handleRequest({
      request: () =>
        api.patch(AppEndpoints.PROSPECTS.UPDATE_STATUS(fairId, id), {
          status,
          notes,
        }),
    });
    return response as Prospect | null;
  };

  const importCnpjs = async (
    fairId: string,
    cnpjs: string[],
    type: ProspectType
  ): Promise<ImportCnpjsResult | null> => {
    const response = await handleRequest({
      request: () =>
        api.post(AppEndpoints.PROSPECTS.IMPORT_CNPJS(fairId), {
          cnpjs,
          type,
        }),
    });
    return response as ImportCnpjsResult | null;
  };

  const enrichProspect = async (
    fairId: string,
    id: string
  ): Promise<Prospect | null> => {
    const response = await handleRequest({
      request: () => api.post(AppEndpoints.PROSPECTS.ENRICH(fairId, id)),
    });
    return response as Prospect | null;
  };

  const deleteProspect = async (
    fairId: string,
    id: string
  ): Promise<boolean> => {
    const response = await handleRequest({
      request: () => api.delete(AppEndpoints.PROSPECTS.BY_ID(fairId, id)),
    });
    return response !== null;
  };

  return {
    getDashboardOverview,
    getProspectAnalytics,
    getProspects,
    updateProspectStatus,
    importCnpjs,
    enrichProspect,
    deleteProspect,
  };
};
