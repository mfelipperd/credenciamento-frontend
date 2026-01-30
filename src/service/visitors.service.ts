import { handleRequest } from "@/utils/handleRequest";
import { useBaseService } from "./base.service";
import type {
  CheckinPerHourResponse,
  Visitor,
  VisitorEdit,
} from "@/interfaces/visitors";
import { useState, useCallback, useMemo } from "react";
import { AppEndpoints } from "@/constants/AppEndpoints";

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

export const useVisitorsService = () => {
  const { api, loading, setLoading } = useBaseService();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [visitor, setVisitor] = useState<Visitor>();
  const [checkinPerHour, setCheckinPerHour] =
    useState<CheckinPerHourResponse>();
  const [paginationMeta, setPaginationMeta] = useState<
    PaginatedResponse<Visitor>["meta"] | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  // Método principal para buscar visitantes (compatível com backend unificado)
  const getVisitors = useCallback(
    async (
      fairId?: string,
      search?: string,
      searchField?: string,
      page?: number,
      limit?: number
    ) => {
      const params: Record<string, string> = {};

      // Só adiciona parâmetros que têm valores válidos
      if (fairId?.trim()) params.fairId = fairId.trim();
      if (search?.trim()) params.search = search.trim();
      if (searchField?.trim() && searchField !== "all")
        params.searchField = searchField.trim();
      if (typeof page === "number" && page > 0) params.page = page.toString();
      if (typeof limit === "number" && limit > 0)
        params.limit = limit.toString();

      const result = await handleRequest({
        request: () => api.get(AppEndpoints.VISITORS.BASE, { params }),
        setLoading,
      });
      if (!result) return;

      // Backend retorna formato diferente baseado nos parâmetros:
      // - Sem page/limit: Array<Visitor> (compatibilidade)
      // - Com page/limit: PaginatedResponse<Visitor>
      if (result.data && result.meta) {
        // Resposta paginada
        setVisitors(result.data);
        setPaginationMeta(result.meta);
      } else {
        // Resposta simples (array direto)
        setVisitors(result);
        setPaginationMeta(null);
      }
    },
    [api, setLoading]
  );

  // Método otimizado para busca paginada
  const getVisitorsPaginated = useCallback(
    async (params: VisitorsParams) => {
      setError(null); // Limpa erros anteriores

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

      try {
        const result = await handleRequest({
          request: () =>
            api.get<PaginatedResponse<Visitor>>(AppEndpoints.VISITORS.BASE, {
              params: queryParams,
            }),
          setLoading,
        });
        if (!result) return null;

        // Verificar se o backend retorna formato paginado ou array direto
        if (Array.isArray(result)) {
          // Backend retorna array direto (formato atual)
          setVisitors(result);
          // Simular metadata básica quando não há paginação server-side
          setPaginationMeta({
            page: params.page || 1,
            limit: params.limit || 50,
            totalItems: result.length,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          });
          return { data: result, meta: null };
        } else {
          // Backend retorna formato paginado (futuro)
          setVisitors(result.data);
          setPaginationMeta(result.meta);
          return result;
        }
      } catch (error: unknown) {
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response: { status: number } };
          if (axiosError.response?.status === 401) {
            setError("Não autorizado. Faça login para acessar os dados.");
          } else if (axiosError.response?.status === 403) {
            setError(
              "Acesso negado. Você não tem permissão para acessar estes dados."
            );
          } else {
            setError("Erro ao carregar visitantes. Tente novamente.");
          }
        } else {
          setError("Erro ao carregar visitantes. Tente novamente.");
        }
        throw error;
      }
    },
    [api, setLoading]
  );

  const getVisitorById = useCallback(
    async (visitorId?: string, params?: string) => {
      const result = await handleRequest({
        request: () =>
          api.get<Visitor>(AppEndpoints.VISITORS.BY_ID(visitorId || ""), {
            params: {
              fairId: params,
            },
          }),
        setLoading,
      });
      if (!result) return;
      setVisitor(result);
    },
    [api, setLoading]
  );

  const checkinVisitor = useCallback(
    async (visitorId: string, fairId: string) => {
      const result = await handleRequest({
        request: () =>
          api.post(AppEndpoints.CHECKINS.BASE, {
            registrationCode: visitorId,
            fairId: fairId,
          }),
        setLoading,
        successMessage: "Check-in realizado com sucesso!",
      });
      if (!result) return;
      return result;
    },
    [api, setLoading]
  );

  const getCheckinPerHour = useCallback(
    async (fairId: string, filterDay?: string) => {
      const result = await handleRequest({
        request: () =>
          api.get<CheckinPerHourResponse>(AppEndpoints.CHECKINS.TODAY, {
            params: { fairId, filterDay },
          }),
        setLoading,
      });
      if (!result) return;
      setCheckinPerHour(result);
    },
    [api, setLoading]
  );

  const updateVisitor = useCallback(
    async (visitor: Partial<VisitorEdit>) => {
      const result = await handleRequest({
        request: () =>
          api.patch<VisitorEdit>(
            AppEndpoints.VISITORS.BY_ID(visitor.registrationCode || ""),
            {
              name: visitor.name,
              fairIds: visitor.fairIds,
            }
          ),
        setLoading,
        successMessage: "Visitante atualizado com sucesso!",
      });
      if (!result) return;
      return result;
    },
    [api, setLoading]
  );

  const deleteVisitor = useCallback(
    async (visitorId: string) => {
      const result = await handleRequest({
        request: () => api.delete(AppEndpoints.VISITORS.BY_ID(visitorId)),
        setLoading,
      });
      if (!result) return;
      return result;
    },
    [api, setLoading]
  );
  return useMemo(
    () => ({
      getVisitors,
      getVisitorsPaginated,
      loading,
      visitors,
      paginationMeta,
      error,
      deleteVisitor,
      getVisitorById,
      visitor,
      checkinVisitor,
      getCheckinPerHour,
      checkinPerHour,
      setVisitor,
      updateVisitor,
    }),
    [
      getVisitors,
      getVisitorsPaginated,
      loading,
      visitors,
      paginationMeta,
      error,
      deleteVisitor,
      getVisitorById,
      visitor,
      checkinVisitor,
      getCheckinPerHour,
      checkinPerHour,
      setVisitor,
      updateVisitor,
    ]
  );
};
