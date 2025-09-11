import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxio } from "@/hooks/useAxio";
import { handleRequest } from "@/utils/handleRequest";
import { toast } from "sonner";
import type { Visitor, CheckinPerHourResponse, VisitorEdit } from "@/interfaces/visitors";

// Interface para resposta paginada
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Interface para parâmetros de busca
interface VisitorsParams {
  fairId?: string;
  search?: string;
  searchField?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

const VISITORS_BASE_URL = "/visitors";

// Hook para buscar visitantes paginados
export const useVisitorsPaginated = (params: VisitorsParams) => {
  const api = useAxio();

  return useQuery({
    queryKey: ["visitors", "paginated", params],
    queryFn: async () => {
      try {
        console.log("🚀 useVisitorsPaginated - iniciando busca:", params);
        
        const queryParams: Record<string, string> = {};

        // Só adiciona parâmetros que têm valores válidos
        if (params.fairId?.trim()) queryParams.fairId = params.fairId.trim();
        if (params.search?.trim()) queryParams.search = params.search.trim();
        if (params.searchField?.trim() && params.searchField !== "all")
          queryParams.searchField = params.searchField.trim();
        if (typeof params.page === "number" && params.page > 0)
          queryParams.page = params.page.toString();
        if (typeof params.limit === "number" && params.limit > 0)
          queryParams.limit = params.limit.toString();
        if (params.sortBy?.trim()) queryParams.sortBy = params.sortBy.trim();
        if (params.sortOrder?.trim())
          queryParams.sortOrder = params.sortOrder.trim();

        console.log("📊 useVisitorsPaginated - parâmetros da query:", queryParams);

        const result = await handleRequest({
          request: () =>
            api.get<PaginatedResponse<Visitor>>(VISITORS_BASE_URL, {
              params: queryParams,
            }),
        });

        if (!result) {
          console.log("⚠️ useVisitorsPaginated - resultado vazio, retornando null");
          return null;
        }

        console.log("✅ useVisitorsPaginated - resultado recebido:", result);

        // Verificar se o backend retorna formato paginado ou array direto
        if (Array.isArray(result)) {
          // Backend retorna array direto (formato atual)
          return {
            data: result,
            meta: {
              page: params.page || 1,
              limit: params.limit || 50,
              totalItems: result.length,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          };
        } else {
          // Backend retorna formato paginado
          return result;
        }
      } catch (error) {
        console.error("❌ useVisitorsPaginated - erro capturado:", error);
        // Retorna dados vazios em caso de erro para evitar Promise rejeitada
        return {
          data: [],
          meta: {
            page: params.page || 1,
            limit: params.limit || 50,
            totalItems: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      }
    },
    enabled: !!(params.fairId && params.fairId.trim()),
    staleTime: 30000, // 30 segundos
    retry: 1,
    retryOnMount: false,
    refetchOnWindowFocus: false,
  });
};

// Hook para buscar visitante por ID
export const useVisitorById = (visitorId?: string, fairId?: string) => {
  const api = useAxio();

  return useQuery({
    queryKey: ["visitor", visitorId, fairId],
    queryFn: async () => {
      if (!visitorId || !fairId) return null;

      return handleRequest({
        request: () =>
          api.get<Visitor>(`${VISITORS_BASE_URL}/${visitorId}`, {
            params: { fairId },
          }),
      });
    },
    enabled: !!(visitorId && fairId),
  });
};

// Hook para check-in de visitante
export const useCheckinVisitor = () => {
  const api = useAxio();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ visitorId, fairId }: { visitorId: string; fairId: string }) => {
      return handleRequest({
        request: () =>
          api.post("/checkins", { registrationCode: visitorId, fairId }),
        successMessage: "Check-in realizado com sucesso!",
      });
    },
    onSuccess: () => {
      // Invalida queries relacionadas para atualizar os dados
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      queryClient.invalidateQueries({ queryKey: ["checkinPerHour"] });
    },
    onError: (error) => {
      console.error("Erro ao fazer check-in:", error);
      toast.error("Erro ao fazer check-in do visitante");
    },
  });
};

// Hook para buscar check-ins por hora
export const useCheckinPerHour = (fairId?: string, filterDay?: string) => {
  const api = useAxio();

  return useQuery({
    queryKey: ["checkinPerHour", fairId, filterDay],
    queryFn: async () => {
      if (!fairId) return null;

      return handleRequest({
        request: () =>
          api.get<CheckinPerHourResponse>("checkins/today", {
            params: { fairId, filterDay },
          }),
      });
    },
    enabled: !!fairId,
    staleTime: 60000, // 1 minuto
  });
};

// Hook para atualizar visitante
export const useUpdateVisitor = () => {
  const api = useAxio();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (visitor: Partial<VisitorEdit>) => {
      return handleRequest({
        request: () =>
          api.patch<VisitorEdit>(`${VISITORS_BASE_URL}/${visitor.registrationCode}`, {
            name: visitor.name,
            fairIds: visitor.fairIds,
          }),
        successMessage: "Visitante atualizado com sucesso!",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
    },
    onError: (error) => {
      console.error("Erro ao atualizar visitante:", error);
      toast.error("Erro ao atualizar visitante");
    },
  });
};

// Hook para deletar visitante
export const useDeleteVisitor = () => {
  const api = useAxio();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (visitorId: string) => {
      return handleRequest({
        request: () => api.delete(`${VISITORS_BASE_URL}/${visitorId}`),
        successMessage: "Visitante excluído com sucesso!",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
    },
    onError: (error) => {
      console.error("Erro ao excluir visitante:", error);
      toast.error("Erro ao excluir visitante");
    },
  });
};
