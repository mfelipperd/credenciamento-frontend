import { useAxio } from "@/hooks/useAxio";
import type {
  Fair,
  StandConfiguration,
  StandStatistics,
  FairAnalysis,
  OptimizedPricing,
  StandEfficiencyAnalysis,
  ProfitAnalysis,
  CreateStandConfigurationDto,
  UpdateStandConfigurationDto,
  CreateFairDto,
  UpdateFairDto,
} from "@/interfaces/fairs";

const FAIR_BASE_URL = "/fairs";
const STAND_CONFIG_BASE_URL = "/stand-configurations";
const FAIR_ANALYSIS_BASE_URL = "/fair-analysis";

// Hook para serviços de feiras
export const useFairService = () => {
  const api = useAxio();

  return {
    // Listar todas as feiras
    getAllFairs: async (): Promise<Fair[]> => {
      const response = await api.get(FAIR_BASE_URL);
      return response.data;
    },

    // Obter feira por ID
    getFairById: async (id: string): Promise<Fair> => {
      const response = await api.get(`${FAIR_BASE_URL}/${id}`);
      return response.data;
    },

    // Criar nova feira
    createFair: async (data: CreateFairDto): Promise<Fair> => {
      const response = await api.post(FAIR_BASE_URL, data);
      return response.data;
    },

    // Atualizar feira
    updateFair: async (id: string, data: UpdateFairDto): Promise<Fair> => {
      const response = await api.patch(`${FAIR_BASE_URL}/${id}`, data);
      return response.data;
    },

    // Deletar feira
    deleteFair: async (id: string): Promise<void> => {
      await api.delete(`${FAIR_BASE_URL}/${id}`);
    },

    // Ativar/Desativar feira
    toggleFairStatus: async (id: string): Promise<Fair> => {
      const response = await api.patch(`${FAIR_BASE_URL}/${id}/toggle-status`);
      return response.data;
    },
  };
};

// Hook para serviços de configurações de stands
export const useStandConfigurationService = () => {
  const api = useAxio();

  return {
    // Listar configurações de uma feira
    getByFairId: async (fairId: string): Promise<StandConfiguration[]> => {
      const response = await api.get(`${STAND_CONFIG_BASE_URL}/fair/${fairId}`);
      return response.data;
    },

    // Obter estatísticas das configurações
    getStatistics: async (fairId: string): Promise<StandStatistics> => {
      const response = await api.get(`${STAND_CONFIG_BASE_URL}/fair/${fairId}/statistics`);
      return response.data;
    },

    // Criar nova configuração
    create: async (fairId: string, data: CreateStandConfigurationDto): Promise<StandConfiguration> => {
      const response = await api.post(`${STAND_CONFIG_BASE_URL}/fair/${fairId}`, data);
      return response.data;
    },

    // Atualizar configuração
    update: async (id: string, data: UpdateStandConfigurationDto): Promise<StandConfiguration> => {
      const response = await api.patch(`${STAND_CONFIG_BASE_URL}/${id}`, data);
      return response.data;
    },

    // Ativar/Desativar configuração
    toggleActive: async (id: string): Promise<StandConfiguration> => {
      const response = await api.patch(`${STAND_CONFIG_BASE_URL}/${id}/toggle-active`);
      return response.data;
    },

    // Deletar configuração
    delete: async (id: string): Promise<void> => {
      await api.delete(`${STAND_CONFIG_BASE_URL}/${id}`);
    },
  };
};

// Hook para serviços de análise de feiras
export const useFairAnalysisService = () => {
  const api = useAxio();

  return {
    // Análise completa da feira
    getFairAnalysis: async (fairId: string): Promise<FairAnalysis> => {
      const response = await api.get(`${FAIR_ANALYSIS_BASE_URL}/fair/${fairId}`);
      return response.data;
    },

    // Obter apenas insights
    getInsights: async (fairId: string): Promise<{ fairId: string; insights: any[]; recommendations: string[] }> => {
      const response = await api.get(`${FAIR_ANALYSIS_BASE_URL}/fair/${fairId}/insights`);
      return response.data;
    },

    // Análise de eficiência dos stands
    getStandEfficiency: async (fairId: string): Promise<StandEfficiencyAnalysis> => {
      const response = await api.get(`${FAIR_ANALYSIS_BASE_URL}/fair/${fairId}/stand-efficiency`);
      return response.data;
    },

    // Análise de lucratividade
    getProfitAnalysis: async (fairId: string): Promise<ProfitAnalysis> => {
      const response = await api.get(`${FAIR_ANALYSIS_BASE_URL}/fair/${fairId}/profit-analysis`);
      return response.data;
    },

    // Otimizar precificação
    optimizePricing: async (fairId: string, targetMargin: number): Promise<OptimizedPricing> => {
      const response = await api.post(`${FAIR_ANALYSIS_BASE_URL}/fair/${fairId}/optimize-pricing?targetMargin=${targetMargin}`);
      return response.data;
    },
  };
};