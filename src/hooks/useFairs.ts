import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFairService, useStandConfigurationService, useFairAnalysisService } from "@/service/fair.service";
import { toast } from "sonner";
import type {
  CreateStandConfigurationDto,
  UpdateStandConfigurationDto,
  CreateFairDto,
  UpdateFairDto,
} from "@/interfaces/fairs";

// Query Keys
export const fairQueryKeys = {
  all: ["fairs"] as const,
  lists: () => [...fairQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...fairQueryKeys.lists(), { filters }] as const,
  details: () => [...fairQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...fairQueryKeys.details(), id] as const,
  standConfigurations: (fairId: string) => [...fairQueryKeys.detail(fairId), "stand-configurations"] as const,
  statistics: (fairId: string) => [...fairQueryKeys.detail(fairId), "statistics"] as const,
  analysis: (fairId: string) => [...fairQueryKeys.detail(fairId), "analysis"] as const,
  insights: (fairId: string) => [...fairQueryKeys.detail(fairId), "insights"] as const,
  efficiency: (fairId: string) => [...fairQueryKeys.detail(fairId), "efficiency"] as const,
  profit: (fairId: string) => [...fairQueryKeys.detail(fairId), "profit"] as const,
};

// Hooks para Feiras
export const useFairs = () => {
  const fairService = useFairService();
  
  return useQuery({
    queryKey: fairQueryKeys.lists(),
    queryFn: () => fairService.getAllFairs(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useFair = (id: string) => {
  const fairService = useFairService();
  
  return useQuery({
    queryKey: fairQueryKeys.detail(id),
    queryFn: () => fairService.getFairById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateFair = () => {
  const queryClient = useQueryClient();
  const fairService = useFairService();

  return useMutation({
    mutationFn: (data: CreateFairDto) => fairService.createFair(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fairQueryKeys.lists() });
      toast.success("Feira criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao criar feira");
    },
  });
};

export const useUpdateFair = () => {
  const queryClient = useQueryClient();
  const fairService = useFairService();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFairDto }) =>
      fairService.updateFair(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: fairQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: fairQueryKeys.lists() });
      toast.success("Feira atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao atualizar feira");
    },
  });
};

export const useDeleteFair = () => {
  const queryClient = useQueryClient();
  const fairService = useFairService();

  return useMutation({
    mutationFn: (id: string) => fairService.deleteFair(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fairQueryKeys.lists() });
      toast.success("Feira removida com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao remover feira");
    },
  });
};

export const useToggleFairStatus = () => {
  const queryClient = useQueryClient();
  const fairService = useFairService();

  return useMutation({
    mutationFn: (id: string) => fairService.toggleFairStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: fairQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: fairQueryKeys.lists() });
      toast.success("Status da feira atualizado!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao atualizar status");
    },
  });
};

// Hooks para Configurações de Stands
export const useStandConfigurations = (fairId: string) => {
  const standService = useStandConfigurationService();
  
  return useQuery({
    queryKey: fairQueryKeys.standConfigurations(fairId),
    queryFn: () => standService.getByFairId(fairId),
    enabled: !!fairId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

export const useStandStatistics = (fairId: string) => {
  const standService = useStandConfigurationService();
  
  return useQuery({
    queryKey: fairQueryKeys.statistics(fairId),
    queryFn: () => standService.getStatistics(fairId),
    enabled: !!fairId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateStandConfiguration = () => {
  const queryClient = useQueryClient();
  const standService = useStandConfigurationService();

  return useMutation({
    mutationFn: ({ fairId, data }: { fairId: string; data: CreateStandConfigurationDto }) =>
      standService.create(fairId, data),
    onSuccess: (_, { fairId }) => {
      queryClient.invalidateQueries({ queryKey: fairQueryKeys.standConfigurations(fairId) });
      queryClient.invalidateQueries({ queryKey: fairQueryKeys.statistics(fairId) });
      queryClient.invalidateQueries({ queryKey: fairQueryKeys.analysis(fairId) });
      toast.success("Configuração de stand criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao criar configuração");
    },
  });
};

export const useUpdateStandConfiguration = () => {
  const queryClient = useQueryClient();
  const standService = useStandConfigurationService();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStandConfigurationDto }) =>
      standService.update(id, data),
    onSuccess: () => {
      // Invalidate all fair-related queries since we don't know which fair this belongs to
      queryClient.invalidateQueries({ queryKey: fairQueryKeys.all });
      toast.success("Configuração atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao atualizar configuração");
    },
  });
};

export const useToggleStandConfiguration = () => {
  const queryClient = useQueryClient();
  const standService = useStandConfigurationService();

  return useMutation({
    mutationFn: (id: string) => standService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fairQueryKeys.all });
      toast.success("Status da configuração atualizado!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao atualizar status");
    },
  });
};

export const useDeleteStandConfiguration = () => {
  const queryClient = useQueryClient();
  const standService = useStandConfigurationService();

  return useMutation({
    mutationFn: (id: string) => standService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fairQueryKeys.all });
      toast.success("Configuração removida com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao remover configuração");
    },
  });
};

// Hooks para Análise de Feiras
export const useFairAnalysis = (fairId: string) => {
  const analysisService = useFairAnalysisService();
  
  return useQuery({
    queryKey: fairQueryKeys.analysis(fairId),
    queryFn: () => analysisService.getFairAnalysis(fairId),
    enabled: !!fairId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useFairInsights = (fairId: string) => {
  const analysisService = useFairAnalysisService();
  
  return useQuery({
    queryKey: fairQueryKeys.insights(fairId),
    queryFn: () => analysisService.getInsights(fairId),
    enabled: !!fairId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useStandEfficiency = (fairId: string) => {
  const analysisService = useFairAnalysisService();
  
  return useQuery({
    queryKey: fairQueryKeys.efficiency(fairId),
    queryFn: () => analysisService.getStandEfficiency(fairId),
    enabled: !!fairId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useProfitAnalysis = (fairId: string) => {
  const analysisService = useFairAnalysisService();
  
  return useQuery({
    queryKey: fairQueryKeys.profit(fairId),
    queryFn: () => analysisService.getProfitAnalysis(fairId),
    enabled: !!fairId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useOptimizePricing = () => {
  const queryClient = useQueryClient();
  const analysisService = useFairAnalysisService();

  return useMutation({
    mutationFn: ({ fairId, targetMargin }: { fairId: string; targetMargin: number }) =>
      analysisService.optimizePricing(fairId, targetMargin),
    onSuccess: (_, { fairId }) => {
      queryClient.invalidateQueries({ queryKey: fairQueryKeys.analysis(fairId) });
      queryClient.invalidateQueries({ queryKey: fairQueryKeys.standConfigurations(fairId) });
      queryClient.invalidateQueries({ queryKey: fairQueryKeys.statistics(fairId) });
      toast.success("Precificação otimizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao otimizar precificação");
    },
  });
};
