import { useAxio } from "@/hooks/useAxio";
import { handleRequest } from "@/utils/handleRequest";
import type {
  Fair,
  CreateFairForm,
  UpdateFairForm,
  FairFilters,
  FairStats,
} from "@/interfaces/fairs";
import { AppEndpoints } from "@/constants/AppEndpoints";

export const useFairService = () => {
  const api = useAxio();

  // Listar todas as feiras
  const getFairs = async (filters?: FairFilters): Promise<Fair[] | undefined> => {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.uf) params.append("uf", filters.uf);
    if (filters?.isActive !== undefined) params.append("isActive", filters.isActive.toString());

    const queryString = params.toString();
    const url = `${AppEndpoints.FAIRS.BASE}${queryString ? `?${queryString}` : ""}`;

    return handleRequest<Fair[]>({
      request: () => api.get(url),
    });
  };

  // Buscar feira específica
  const getFairById = async (id: string): Promise<Fair | undefined> => {
    return handleRequest<Fair>({
      request: () => api.get(AppEndpoints.FAIRS.BY_ID(id)),
    });
  };

  // Criar nova feira
  const createFair = async (data: CreateFairForm): Promise<Fair | undefined> => {
    return handleRequest<Fair>({
      request: () => api.post(AppEndpoints.FAIRS.BASE, data),
      successMessage: "Feira criada com sucesso!",
    });
  };

  // Atualizar feira
  const updateFair = async (id: string, data: UpdateFairForm): Promise<Fair | undefined> => {
    return handleRequest<Fair>({
      request: () => api.put(AppEndpoints.FAIRS.BY_ID(id), data),
      successMessage: "Feira atualizada com sucesso!",
    });
  };

  // Excluir feira
  const deleteFair = async (id: string): Promise<{ message: string } | undefined> => {
    return handleRequest<{ message: string }>({
      request: () => api.delete(AppEndpoints.FAIRS.BY_ID(id)),
      successMessage: "Feira excluída com sucesso!",
    });
  };

  // Ativar/desativar feira
  const toggleFairActive = async (id: string): Promise<Fair | undefined> => {
    return handleRequest<Fair>({
      request: () => api.patch(AppEndpoints.FAIRS.TOGGLE_ACTIVE(id)),
      successMessage: "Status da feira atualizado com sucesso!",
    });
  };

  // Obter estatísticas agregadas das feiras
  const getFairStats = async (): Promise<FairStats | undefined> => {
    return handleRequest<FairStats>({
      request: () => api.get(AppEndpoints.FAIRS.STATS),
    });
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