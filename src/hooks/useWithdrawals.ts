import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWithdrawalsService } from "@/service/withdrawals.service";
import { toast } from "sonner";
import type {
  CreateWithdrawalDto,
  ApproveWithdrawalDto,
  RejectWithdrawalDto,
  WithdrawalFilters,
  PartnerWithdrawal,
} from "@/interfaces/withdrawals";

export const useWithdrawals = (filters?: WithdrawalFilters) => {
  const withdrawalsService = useWithdrawalsService();

  return useQuery({
    queryKey: ["withdrawals", filters],
    queryFn: () => withdrawalsService.getAllWithdrawals(filters),
    enabled: !!filters?.fairId, // Só executa se tiver fairId
  });
};

export const usePartnerWithdrawals = (partnerId: string, filters?: WithdrawalFilters) => {
  const withdrawalsService = useWithdrawalsService();

  return useQuery({
    queryKey: ["partner-withdrawals", partnerId, filters],
    queryFn: () => withdrawalsService.getPartnerWithdrawals(partnerId, filters),
    enabled: !!partnerId,
  });
};

export const usePartnerFinancialSummary = (partnerId: string) => {
  const withdrawalsService = useWithdrawalsService();

  return useQuery({
    queryKey: ["partner-financial-summary", partnerId],
    queryFn: () => withdrawalsService.getPartnerFinancialSummary(partnerId),
    enabled: !!partnerId,
  });
};

export const useAvailablePercentage = () => {
  const withdrawalsService = useWithdrawalsService();

  return useQuery({
    queryKey: ["available-percentage"],
    queryFn: () => withdrawalsService.getAvailablePercentage(),
  });
};

export const useWithdrawalById = (withdrawalId: string) => {
  const withdrawalsService = useWithdrawalsService();

  return useQuery({
    queryKey: ["withdrawal", withdrawalId],
    queryFn: () => withdrawalsService.getWithdrawalById(withdrawalId),
    enabled: !!withdrawalId,
  });
};

export const useCreateWithdrawal = () => {
  const withdrawalsService = useWithdrawalsService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ partnerId, data }: { partnerId: string; data: CreateWithdrawalDto }) =>
      withdrawalsService.createWithdrawal(partnerId, data),
    onSuccess: (_, { partnerId }) => {
      queryClient.invalidateQueries({ queryKey: ["partner-withdrawals", partnerId] });
      queryClient.invalidateQueries({ queryKey: ["partner-financial-summary", partnerId] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      toast.success("Solicitação de saque criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao criar solicitação de saque");
    },
  });
};

export const useApproveWithdrawal = () => {
  const withdrawalsService = useWithdrawalsService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ withdrawalId, data }: { withdrawalId: string; data: ApproveWithdrawalDto }) =>
      withdrawalsService.approveWithdrawal(withdrawalId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["partner-withdrawals", data.partnerId] });
      queryClient.invalidateQueries({ queryKey: ["partner-financial-summary", data.partnerId] });
      toast.success("Saque aprovado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao aprovar saque");
    },
  });
};

export const useRejectWithdrawal = () => {
  const withdrawalsService = useWithdrawalsService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ withdrawalId, data }: { withdrawalId: string; data: RejectWithdrawalDto }) =>
      withdrawalsService.rejectWithdrawal(withdrawalId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["partner-withdrawals", data.partnerId] });
      queryClient.invalidateQueries({ queryKey: ["partner-financial-summary", data.partnerId] });
      toast.success("Saque rejeitado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao rejeitar saque");
    },
  });
};

export const useDistributeProfit = () => {
  const withdrawalsService = useWithdrawalsService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fairId: string) => withdrawalsService.distributeProfit(fairId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["partner-financial-summary"] });
      queryClient.invalidateQueries({ queryKey: ["fairs"] });
      toast.success(`Lucro de R$ ${data.totalProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} distribuído com sucesso!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao distribuir lucros");
    },
  });
};

export const useUpdateWithdrawal = () => {
  const withdrawalsService = useWithdrawalsService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ withdrawalId, data }: { withdrawalId: string; data: { status?: PartnerWithdrawal['status']; reason?: string; bankDetails?: string; notes?: string } }) =>
      withdrawalsService.updateWithdrawal(withdrawalId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["partner-withdrawals", data.partnerId] });
      queryClient.invalidateQueries({ queryKey: ["partner-financial-summary", data.partnerId] });
      toast.success("Saque atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao atualizar saque");
    },
  });
};

export const useDeleteWithdrawal = () => {
  const withdrawalsService = useWithdrawalsService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (withdrawalId: string) => withdrawalsService.deleteWithdrawal(withdrawalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["partner-withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["partner-financial-summary"] });
      toast.success("Saque excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao excluir saque");
    },
  });
};
