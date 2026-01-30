import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useAxio } from "@/hooks/useAxio";
import { toast } from "sonner";
import { AppEndpoints } from "@/constants/AppEndpoints";
import type {
  Withdrawal,
  CreateWithdrawalForm,
  RejectWithdrawalForm,
  WithdrawalFilters,
} from "@/interfaces/partners";

// ===== QUERIES =====

// Hook para buscar saques de um partner específico
export const usePartnerWithdrawals = (partnerId: string, filters?: WithdrawalFilters) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.withdrawals.list(partnerId, filters),
    queryFn: async () => {
      const response = await api.get(AppEndpoints.PARTNERS.WITHDRAWALS(partnerId), { params: filters });
      return response.data as Withdrawal[];
    },
    enabled: !!partnerId,
  });
};

// Hook para buscar todos os saques (admin)
export const useAllWithdrawals = (filters?: WithdrawalFilters) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.withdrawals.allWithdrawals(filters),
    queryFn: async () => {
      if (!filters?.fairId) {
        throw new Error('fairId é obrigatório para listar saques');
      }
      if (!filters?.partnerId) {
        throw new Error('partnerId é obrigatório para listar saques');
      }

      const response = await api.get(
        AppEndpoints.PARTNERS.WITHDRAWALS(filters.partnerId), 
        { params: { fairId: filters.fairId } }
      );
      return response.data as Withdrawal[];
    },
    enabled: !!filters?.fairId && !!filters?.partnerId,
  });
};

// ===== MUTATIONS =====

// Hook para criar saque
export const useCreateWithdrawal = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({ partnerId, data }: { partnerId: string; data: CreateWithdrawalForm }) => {
      const response = await api.post(AppEndpoints.PARTNERS.WITHDRAWALS(partnerId), data);
      return response.data as Withdrawal;
    },
    onSuccess: (_, { partnerId }) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.withdrawals.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.financialSummary(partnerId, '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.all });
      toast.success("Saque solicitado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao solicitar saque: " + (error.response?.data?.message || error.message));
    },
  });
};

// Hook para aprovar saque
export const useApproveWithdrawal = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async (withdrawalId: string) => {
      const response = await api.post(AppEndpoints.PARTNERS.APPROVE_WITHDRAWAL(withdrawalId));
      return response.data as Withdrawal;
    },
    onSuccess: () => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.withdrawals.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      toast.success("Saque aprovado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao aprovar saque: " + (error.response?.data?.message || error.message));
    },
  });
};

// Hook para rejeitar saque
export const useRejectWithdrawal = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({ withdrawalId, data }: { withdrawalId: string; data: RejectWithdrawalForm }) => {
      const response = await api.post(AppEndpoints.PARTNERS.REJECT_WITHDRAWAL(withdrawalId), data);
      return response.data as Withdrawal;
    },
    onSuccess: () => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.withdrawals.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.all });
      toast.success("Saque rejeitado!");
    },
    onError: (error: any) => {
      toast.error("Erro ao rejeitar saque: " + (error.response?.data?.message || error.message));
    },
  });
};
