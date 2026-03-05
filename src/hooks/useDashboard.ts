import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useAxio } from "@/hooks/useAxio";
import { AppEndpoints } from "@/constants/AppEndpoints";

// Interfaces básicas (ajustar conforme necessário)
export interface DashboardOverview {
  totalVisitors: number;
  totalCheckins: number;
  totalStands: number;
  totalRevenue: number;
}

export interface ConversionData {
  source: string;
  count: number;
  percentage: number;
}

export interface CheckinStats {
  hour: string;
  count: number;
}

export interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
}

export interface OriginStats {
  origin: string;
  count: number;
  percentage: number;
}

export interface SectorStats {
  sector: string;
  count: number;
  percentage: number;
}

// ===== QUERIES =====

// Hook para buscar visão geral do dashboard
export const useDashboardOverview = (fairId: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.dashboard.overview(fairId),
    queryFn: async () => {
      const response = await api.get(AppEndpoints.DASHBOARD.OVERVIEW, {
        params: { fairId }
      });
      return response.data as DashboardOverview;
    },
    enabled: !!fairId,
    refetchInterval: 60000, // Atualiza a cada 1 minuto
  });
};

// Hook para buscar conversões por "como conheceu"
export const useConversionsByHowDidYouKnow = (fairId: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.dashboard.conversionsByHowDidYouKnow(fairId),
    queryFn: async () => {
      const response = await api.get(AppEndpoints.DASHBOARD.CONVERSIONS_HOW_DID_YOU_KNOW, {
        params: { fairId }
      });
      return response.data as ConversionData[];
    },
    enabled: !!fairId,
    refetchInterval: 300000, // Atualiza a cada 5 minutos
  });
};

// Hook para buscar checkins por hora
export const useCheckinsPerHour = (fairId: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.dashboard.checkinsPerHour(fairId),
    queryFn: async () => {
      const response = await api.get(AppEndpoints.CHECKINS.TODAY, {
        params: { fairId }
      });
      return response.data as CheckinStats[];
    },
    enabled: !!fairId,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
};

// Hook para buscar estatísticas de categorias
export const useCategoryStats = (fairId: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.dashboard.categories(fairId),
    queryFn: async () => {
      const response = await api.get(AppEndpoints.DASHBOARD.VISITORS_CATEGORY, {
        params: { fairId }
      });
      return response.data as CategoryStats[];
    },
    enabled: !!fairId,
    refetchInterval: 300000, // Atualiza a cada 5 minutos
  });
};

// Hook para buscar estatísticas de origem
export const useOriginStats = (fairId: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.dashboard.origins(fairId),
    queryFn: async () => {
      const response = await api.get(AppEndpoints.DASHBOARD.VISITORS_ORIGIN, {
        params: { fairId }
      });
      return response.data as OriginStats[];
    },
    enabled: !!fairId,
    refetchInterval: 300000, // Atualiza a cada 5 minutos
  });
};

// Hook para buscar estatísticas de setor
export const useSectorStats = (fairId: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.dashboard.sectors(fairId),
    queryFn: async () => {
      const response = await api.get(AppEndpoints.DASHBOARD.VISITORS_SECTORS, {
        params: { fairId }
      });
      return response.data as SectorStats[];
    },
    enabled: !!fairId,
    refetchInterval: 300000, // Atualiza a cada 5 minutos
  });
};
