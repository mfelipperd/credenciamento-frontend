import { handleRequest } from "@/utils/handleRequest";
import { useAxio } from "@/hooks/useAxio";
import type {
  Stand,
  StandStats,
  ConfigureStandsForm,
  ConfigureStandsResponse,
} from "@/interfaces/finance";

const BASE_URL = "/finance";

// Hook personalizado para o serviço de stands
export const useStandService = () => {
  const api = useAxio();

  // Configurar stands em lote para uma feira
  const configureStands = async (
    data: ConfigureStandsForm
  ): Promise<ConfigureStandsResponse | undefined> => {
    return handleRequest<ConfigureStandsResponse>({
      request: () => api.post(`${BASE_URL}/stands/configure`, data),
    });
  };

  // Listar todos os stands de uma feira
  const getStands = async (fairId: string): Promise<Stand[] | undefined> => {
    return handleRequest<Stand[]>({
      request: () =>
        api.get(`${BASE_URL}/stands`, {
          params: { fairId },
        }),
    });
  };

  // Listar apenas stands disponíveis
  const getAvailableStands = async (
    fairId: string
  ): Promise<Stand[] | undefined> => {
    return handleRequest<Stand[]>({
      request: () =>
        api.get(`${BASE_URL}/stands/available`, {
          params: { fairId },
        }),
    });
  };

  // Listar apenas stands ocupados
  const getOccupiedStands = async (
    fairId: string
  ): Promise<Stand[] | undefined> => {
    return handleRequest<Stand[]>({
      request: () =>
        api.get(`${BASE_URL}/stands/occupied`, {
          params: { fairId },
        }),
    });
  };

  // Obter estatísticas dos stands de uma feira
  const getStandStats = async (
    fairId: string
  ): Promise<StandStats | undefined> => {
    return handleRequest<StandStats>({
      request: () =>
        api.get(`${BASE_URL}/stands/stats`, {
          params: { fairId },
        }),
    });
  };

  // Buscar um stand específico por ID
  const getStandById = async (id: string): Promise<Stand | undefined> => {
    return handleRequest<Stand>({
      request: () => api.get(`${BASE_URL}/stands/${id}`),
    });
  };

  // Vincular manualmente um stand a uma receita existente
  const linkStandToRevenue = async (
    standId: string,
    revenueId: string
  ): Promise<Stand | undefined> => {
    return handleRequest<Stand>({
      request: () =>
        api.patch(`${BASE_URL}/stands/${standId}/link-revenue`, {
          revenueId,
        }),
    });
  };

  // Desvincula um stand de sua receita (libera o stand)
  const unlinkStandFromRevenue = async (
    standId: string
  ): Promise<{ message: string; stand: Stand } | undefined> => {
    return handleRequest<{ message: string; stand: Stand }>({
      request: () => api.patch(`${BASE_URL}/stands/${standId}/unlink-revenue`),
    });
  };

  return {
    configureStands,
    getStands,
    getAvailableStands,
    getOccupiedStands,
    getStandStats,
    getStandById,
    linkStandToRevenue,
    unlinkStandFromRevenue,
  };
};
