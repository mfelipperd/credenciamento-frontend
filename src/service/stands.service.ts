import { handleRequest } from "@/utils/handleRequest";
import { useAxio } from "@/hooks/useAxio";
import type {
  Stand,
  StandStats,
  ConfigureStandsForm,
  ConfigureStandsResponse,
} from "@/interfaces/finance";

import { AppEndpoints } from "@/constants/AppEndpoints";

// Hook personalizado para o serviço de stands
export const useStandService = () => {
  const api = useAxio();

  // Configurar stands em lote para uma feira
  const configureStands = async (
    data: ConfigureStandsForm
  ): Promise<ConfigureStandsResponse | undefined> => {
    return handleRequest<ConfigureStandsResponse>({
      request: () => api.post(AppEndpoints.STANDS.CONFIGURE, data),
    });
  };

  // Listar todos os stands de uma feira
  const getStands = async (fairId: string): Promise<Stand[] | undefined> => {
    return handleRequest<Stand[]>({
      request: () =>
        api.get(AppEndpoints.STANDS.BASE, {
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
        api.get(AppEndpoints.STANDS.AVAILABLE, {
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
        api.get(AppEndpoints.STANDS.OCCUPIED, {
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
        api.get(AppEndpoints.STANDS.STATS, {
          params: { fairId },
        }),
    });
  };

  // Buscar um stand específico por ID
  const getStandById = async (id: string): Promise<Stand | undefined> => {
    return handleRequest<Stand>({
      request: () => api.get(AppEndpoints.STANDS.BY_ID(id)),
    });
  };

  // Vincular manualmente um stand a uma receita existente
  const linkStandToRevenue = async (
    standId: string,
    revenueId: string
  ): Promise<Stand | undefined> => {
    return handleRequest<Stand>({
      request: () =>
        api.patch(AppEndpoints.STANDS.LINK_REVENUE(standId), {
          revenueId,
        }),
    });
  };

  // Desvincula um stand de sua receita (libera o stand)
  const unlinkStandFromRevenue = async (
    standId: string
  ): Promise<{ message: string; stand: Stand } | undefined> => {
    return handleRequest<{ message: string; stand: Stand }>({
      request: () => api.patch(AppEndpoints.STANDS.UNLINK_REVENUE(standId)),
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
