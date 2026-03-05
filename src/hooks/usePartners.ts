import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useAxio } from "@/hooks/useAxio";
import { toast } from "sonner";
import { AppEndpoints } from "@/constants/AppEndpoints";
import type {
  Partner,
  CreatePartnerForm,
  UpdatePartnerForm,
  AvailablePercentage,
  PartnerFilters,
  ProfitDistribution,
} from "@/interfaces/partners";

// ===== QUERIES =====

// Hook para buscar todos os partners
export const usePartners = (filters?: PartnerFilters) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.partners.list(filters),
    queryFn: async () => {
      const response = await api.get(AppEndpoints.PARTNERS.BASE, { params: filters });
      return response.data as Partner[];
    },
  });
};

// Hook para buscar partner atual (me)
export const usePartnerMe = () => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.partners.me(),
    queryFn: async () => {
      const response = await api.get(AppEndpoints.PARTNERS.ME);
      return response.data as Partner;
    },
  });
};

// Hook para buscar detalhes de um partner
export const usePartner = (id: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.partners.detail(id),
    queryFn: async () => {
      const response = await api.get(AppEndpoints.PARTNERS.BY_ID(id));
      return response.data as Partner;
    },
    enabled: !!id,
  });
};

// Hook para buscar resumo financeiro de um partner
export const usePartnerFinancialSummary = (id: string, fairId: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.partners.financialSummary(id, fairId),
    queryFn: async () => {
      const response = await api.get(`${AppEndpoints.PARTNERS.FINANCIAL_SUMMARY(id)}?fairId=${fairId}`);
      return response.data as import("@/interfaces/withdrawals").PartnerFinancialSummary;
    },
    enabled: !!id && !!fairId,
  });
};

// Hook para buscar percentual disponível
export const useAvailablePercentage = () => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.partners.availablePercentage(),
    queryFn: async () => {
      const response = await api.get(AppEndpoints.PARTNERS.AVAILABLE_PERCENTAGE);
      return response.data as AvailablePercentage;
    },
  });
};

// ===== MUTATIONS =====

// Hook para criar partner
export const useCreatePartner = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async (data: CreatePartnerForm) => {
      const response = await api.post(AppEndpoints.PARTNERS.BASE, data);
      return response.data as Partner;
    },
    onSuccess: () => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.availablePercentage() });
      toast.success("Sócio criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar sócio: " + (error.response?.data?.message || error.message));
    },
  });
};

// Hook para atualizar partner
export const useUpdatePartner = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePartnerForm }) => {
      const response = await api.patch(AppEndpoints.PARTNERS.BY_ID(id), data);
      return response.data as Partner;
    },
    onSuccess: (_, { id }) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.me() });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.availablePercentage() });
      toast.success("Sócio atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar sócio: " + (error.response?.data?.message || error.message));
    },
  });
};

// Hook para deletar partner
export const useDeletePartner = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(AppEndpoints.PARTNERS.BY_ID(id));
      return response.data;
    },
    onSuccess: () => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.availablePercentage() });
      toast.success("Sócio removido com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover sócio: " + (error.response?.data?.message || error.message));
    },
  });
};

// Hook para distribuir lucros
export const useDistributeProfit = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async (fairId: string) => {
      const response = await api.post(AppEndpoints.FINANCE.CASH_FLOW_DISTRIBUTE(fairId));
      return response.data as ProfitDistribution;
    },
    onSuccess: () => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      toast.success("Lucros distribuídos com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao distribuir lucros: " + (error.response?.data?.message || error.message));
    },
  });
};