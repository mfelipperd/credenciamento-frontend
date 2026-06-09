import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useAxio } from "@/hooks/useAxio";
import { toast } from "sonner";
import { AppEndpoints } from "@/constants/AppEndpoints";
import type {
  Visitor,
  VisitorEdit,
  CheckinPerHourResponse,
} from "@/interfaces/visitors";

// Interface para parâmetros de busca
export interface VisitorsFilters {
  fairId?: string;
  search?: string;
  searchField?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}



// ===== QUERIES =====

// Hook para buscar visitantes
export const useVisitors = (filters: VisitorsFilters) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.visitors.list(filters),
    queryFn: async () => {
      const params: Record<string, string> = {};

      // Só adiciona parâmetros que têm valores válidos
      if (filters.fairId?.trim()) params.fairId = filters.fairId.trim();
      if (filters.search?.trim()) params.search = filters.search.trim();
      if (filters.searchField?.trim() && filters.searchField !== "all")
        params.searchField = filters.searchField.trim();
      if (typeof filters.page === "number" && filters.page > 0)
        params.page = filters.page.toString();
      if (typeof filters.limit === "number" && filters.limit > 0)
        params.limit = filters.limit.toString();
      if (filters.sortBy?.trim()) params.sortBy = filters.sortBy.trim();
      if (filters.sortOrder?.trim()) params.sortOrder = filters.sortOrder.trim();

      const response = await api.get(AppEndpoints.VISITORS.BASE, { params });

      // Se não for um array direto, normaliza as chaves do objeto de resposta
      const rawData = response.data || {};
      const rawMeta = rawData.meta || {};
      
      const totalItems = typeof rawMeta.totalItems === 'number' && !isNaN(rawMeta.totalItems)
        ? rawMeta.totalItems
        : typeof rawMeta.total === 'number' && !isNaN(rawMeta.total)
        ? rawMeta.total
        : Array.isArray(rawData.data)
        ? rawData.data.length
        : 0;
        
      const limit = rawMeta.limit || filters.limit || 50;
      const totalPages = typeof rawMeta.totalPages === 'number' && !isNaN(rawMeta.totalPages)
        ? rawMeta.totalPages
        : typeof rawMeta.total_pages === 'number' && !isNaN(rawMeta.total_pages)
        ? rawMeta.total_pages
        : Math.ceil(totalItems / limit) || 1;

      return {
        data: (rawData.data || []) as Visitor[],
        meta: {
          page: rawMeta.page || filters.page || 1,
          limit,
          totalItems,
          totalPages,
          hasNextPage: !!rawMeta.hasNextPage,
          hasPreviousPage: !!rawMeta.hasPreviousPage,
        }
      };
    },
    enabled: !!filters.fairId,
  });
};

// Hook para buscar detalhes de um visitante
export const useVisitor = (visitorId: string, fairId?: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.visitors.detail(visitorId),
    queryFn: async () => {
      const response = await api.get(AppEndpoints.VISITORS.BY_ID(visitorId), {
        params: { fairId },
      });
      return response.data as Visitor;
    },
    enabled: !!visitorId,
  });
};

// Hook para buscar checkins por hora
export const useCheckinPerHour = (fairId: string, filterDay?: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.visitors.checkinsByFair(fairId),
    queryFn: async () => {
      const response = await api.get(AppEndpoints.CHECKINS.TODAY, {
        params: { fairId, filterDay },
      });
      return response.data as CheckinPerHourResponse;
    },
    enabled: !!fairId,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
};

// ===== MUTATIONS =====

// Hook para fazer checkin de visitante
export const useCheckinVisitor = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({ visitorId, fairId }: { visitorId: string; fairId: string }) => {
      const response = await api.post(AppEndpoints.CHECKINS.BASE, {
        registrationCode: visitorId,
        fairId: fairId,
      });
      return response.data;
    },
    onSuccess: (_, { fairId }) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.visitors.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.visitors.checkinsByFair(fairId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.checkinsPerHour(fairId) });
      toast.success("Check-in realizado com sucesso!");
    },
    onError: (error: unknown) => {
      toast.error("Erro ao realizar check-in: " + ((error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || (error as { response?: { data?: { message?: string } }; message?: string }).message));
    },
  });
};

// Hook para atualizar visitante
export const useUpdateVisitor = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async (visitor: Partial<VisitorEdit>) => {
      const response = await api.patch(
        AppEndpoints.VISITORS.BY_ID(visitor.registrationCode || ""),
        {
          name: visitor.name,
          fairIds: visitor.fairIds,
        }
      );
      return response.data as VisitorEdit;
    },
    onSuccess: (data) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.visitors.lists() });
      if (data.registrationCode) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.visitors.detail(data.registrationCode) 
        });
      }
      toast.success("Visitante atualizado com sucesso!");
    },
    onError: (error: unknown) => {
      toast.error("Erro ao atualizar visitante: " + ((error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || (error as { response?: { data?: { message?: string } }; message?: string }).message));
    },
  });
};

// Hook para deletar visitante
export const useDeleteVisitor = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async (visitorId: string) => {
      const response = await api.delete(AppEndpoints.VISITORS.BY_ID(visitorId));
      return response.data;
    },
    onSuccess: () => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.visitors.lists() });
      toast.success("Visitante removido com sucesso!");
    },
    onError: (error: unknown) => {
      toast.error("Erro ao remover visitante: " + ((error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || (error as { response?: { data?: { message?: string } }; message?: string }).message));
    },
  });
};
