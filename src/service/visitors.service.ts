import { handleRequest } from "@/utils/handleRequest";
import { useBaseService } from "./base.service";
import type {
  CheckinPerHourResponse,
  Visitor,
  VisitorEdit,
  VisitorLookupResult,
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
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
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
      if (params.dateFrom?.trim()) queryParams.dateFrom = params.dateFrom.trim();
      if (params.dateTo?.trim()) queryParams.dateTo = params.dateTo.trim();

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
          const rawData = result || {};
          const rawMeta = (rawData.meta || {}) as Record<string, unknown>;
          
          const totalItems = typeof rawMeta.totalItems === 'number' && !isNaN(rawMeta.totalItems)
            ? rawMeta.totalItems
            : typeof rawMeta.total === 'number' && !isNaN(rawMeta.total)
            ? rawMeta.total
            : Array.isArray(rawData.data)
            ? rawData.data.length
            : 0;
            
          const limit = rawMeta.limit || params.limit || 50;
          const totalPages = typeof rawMeta.totalPages === 'number' && !isNaN(rawMeta.totalPages)
            ? rawMeta.totalPages
            : typeof rawMeta.total_pages === 'number' && !isNaN(rawMeta.total_pages)
            ? rawMeta.total_pages
            : Math.ceil(totalItems / limit) || 1;

          setVisitors(rawData.data || []);
          setPaginationMeta({
            page: rawMeta.page || params.page || 1,
            limit,
            totalItems,
            totalPages,
            hasNextPage: !!rawMeta.hasNextPage,
            hasPreviousPage: !!rawMeta.hasPreviousPage,
          });
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
  const lookupVisitor = useCallback(
    async (params: { name?: string; phone?: string; cnpj?: string; email?: string }) => {
      const queryParams: Record<string, string> = {};
      if (params.name?.trim()) queryParams.name = params.name.trim();
      if (params.phone?.trim()) queryParams.phone = params.phone.trim();
      if (params.cnpj?.trim()) queryParams.cnpj = params.cnpj.trim();
      if (params.email?.trim()) queryParams.email = params.email.trim();

      const result = await handleRequest({
        request: () =>
          api.get<VisitorLookupResult[]>(AppEndpoints.VISITORS.LOOKUP, {
            params: queryParams,
          }),
        setLoading,
      });
      return (result as VisitorLookupResult[] | undefined) ?? [];
    },
    [api, setLoading]
  );

  const exportVisitorsPdf = useCallback(
    async (fairId: string) => {
      try {
        setLoading(true);
        const response = await api.get(AppEndpoints.VISITORS.EXPORT_PDF(fairId), {
          responseType: "blob", // Importante para receber arquivos binários
        });

        // Cria uma URL para o blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        
        // Cria um elemento a e força o download
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `lista-visitantes-${fairId}.pdf`); // Nome do arquivo
        document.body.appendChild(link);
        link.click();
        
        // Limpeza
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return true;
      } catch (error) {
        console.error("Erro ao exportar PDF:", error);
        return false;
      } finally {
        setLoading(false);
      }
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
      exportVisitorsPdf,
      lookupVisitor,
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
      exportVisitorsPdf,
      lookupVisitor,
    ]
  );
};
