import { useAxio } from "@/hooks/useAxio";
import { handleRequest } from "@/utils/handleRequest";
import type {
  Fair,
  CreateFairForm,
  UpdateFairForm,
  FairFilters,
  FairStats,
} from "@/interfaces/fairs";

const BASE_URL = "/fairs";

export const useFairService = () => {
  const api = useAxio();

  // Listar todas as feiras
  const getFairs = async (filters?: FairFilters): Promise<Fair[] | undefined> => {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.pageSize) params.append("pageSize", filters.pageSize.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.isActive !== undefined) params.append("isActive", filters.isActive.toString());
    if (filters?.city) params.append("city", filters.city);
    if (filters?.state) params.append("state", filters.state);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const queryString = params.toString();
    const url = `${BASE_URL}${queryString ? `?${queryString}` : ""}`;

    return handleRequest<Fair[]>({
      request: () => api.get(url),
    });
  };

  // Buscar feira específica
  const getFairById = async (id: string): Promise<Fair | undefined> => {
    return handleRequest<Fair>({
      request: () => api.get(`${BASE_URL}/${id}`),
    });
  };

  // Criar nova feira
  const createFair = async (data: CreateFairForm): Promise<Fair | undefined> => {
    return handleRequest<Fair>({
      request: () => api.post(BASE_URL, data),
      successMessage: "Feira criada com sucesso!",
    });
  };

  // Atualizar feira
  const updateFair = async (id: string, data: UpdateFairForm): Promise<Fair | undefined> => {
    return handleRequest<Fair>({
      request: () => api.put(`${BASE_URL}/${id}`, data),
      successMessage: "Feira atualizada com sucesso!",
    });
  };

  // Excluir feira
  const deleteFair = async (id: string): Promise<{ message: string } | undefined> => {
    return handleRequest<{ message: string }>({
      request: () => api.delete(`${BASE_URL}/${id}`),
      successMessage: "Feira excluída com sucesso!",
    });
  };

  // Ativar/desativar feira
  const toggleFairActive = async (id: string): Promise<Fair | undefined> => {
    return handleRequest<Fair>({
      request: () => api.patch(`${BASE_URL}/${id}/toggle-active`),
      successMessage: "Status da feira atualizado com sucesso!",
    });
  };

  // Obter estatísticas das feiras (calculadas localmente)
  const getFairStats = async (fairs: Fair[]): Promise<FairStats | undefined> => {
    if (!fairs || fairs.length === 0) {
      return {
        totalFairs: 0,
        activeFairs: 0,
        inactiveFairs: 0,
        totalExpectedRevenue: 0,
        totalExpectedProfit: 0,
        averageProfitMargin: 0,
      };
    }

    const activeFairs = fairs.filter(fair => fair.isActive);
    const inactiveFairs = fairs.filter(fair => !fair.isActive);
    
    const totalExpectedRevenue = fairs.reduce((sum, fair) => sum + (fair.expectedRevenue || 0), 0);
    const totalExpectedProfit = fairs.reduce((sum, fair) => sum + (fair.expectedProfit || 0), 0);
    
    const fairsWithProfitMargin = fairs.filter(fair => fair.expectedProfitMargin && fair.expectedProfitMargin > 0);
    const averageProfitMargin = fairsWithProfitMargin.length > 0 
      ? fairsWithProfitMargin.reduce((sum, fair) => sum + (fair.expectedProfitMargin || 0), 0) / fairsWithProfitMargin.length
      : 0;

    return {
      totalFairs: fairs.length,
      activeFairs: activeFairs.length,
      inactiveFairs: inactiveFairs.length,
      totalExpectedRevenue,
      totalExpectedProfit,
      averageProfitMargin,
    };
  };

  return {
    getFairs,
    getFairById,
    createFair,
    updateFair,
    deleteFair,
    toggleFairActive,
    getFairStats,
  };
};