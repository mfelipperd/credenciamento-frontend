import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePartnersService } from "@/service/partners.service";
import type {
  UpdatePartnerForm,
  CreateWithdrawalForm,
  RejectWithdrawalForm,
  PartnerFilters,
  WithdrawalFilters,
} from "@/interfaces/partners";

// Hooks para gestão de sócios
export const usePartners = (filters?: PartnerFilters) => {
  const partnersService = usePartnersService();
  
  return useQuery({
    queryKey: ["partners", filters],
    queryFn: () => partnersService.getPartners(filters),
  });
};

export const usePartnerMe = () => {
  const partnersService = usePartnersService();
  
  return useQuery({
    queryKey: ["partners", "me"],
    queryFn: partnersService.getPartnerMe,
  });
};

export const usePartner = (id: string) => {
  const partnersService = usePartnersService();
  
  return useQuery({
    queryKey: ["partners", id],
    queryFn: () => partnersService.getPartnerById(id),
    enabled: !!id,
  });
};

export const useCreatePartner = () => {
  const queryClient = useQueryClient();
  const partnersService = usePartnersService();
  
  return useMutation({
    mutationFn: partnersService.createPartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["partners", "available-percentage"] });
    },
  });
};

export const useUpdatePartner = () => {
  const queryClient = useQueryClient();
  const partnersService = usePartnersService();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartnerForm }) => 
      partnersService.updatePartner(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["partners", id] });
      queryClient.invalidateQueries({ queryKey: ["partners", "available-percentage"] });
    },
  });
};

export const useDeletePartner = () => {
  const queryClient = useQueryClient();
  const partnersService = usePartnersService();
  
  return useMutation({
    mutationFn: partnersService.deletePartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["partners", "available-percentage"] });
    },
  });
};

// Hooks para controle financeiro
export const usePartnerFinancialSummary = (id: string) => {
  const partnersService = usePartnersService();
  
  return useQuery({
    queryKey: ["partners", id, "financial-summary"],
    queryFn: () => partnersService.getPartnerFinancialSummary(id),
    enabled: !!id,
  });
};

export const useAvailablePercentage = () => {
  const partnersService = usePartnersService();
  
  return useQuery({
    queryKey: ["partners", "available-percentage"],
    queryFn: partnersService.getAvailablePercentage,
  });
};

// Hooks para sistema de saques
export const usePartnerWithdrawals = (partnerId: string, filters?: WithdrawalFilters) => {
  const partnersService = usePartnersService();
  
  return useQuery({
    queryKey: ["partners", partnerId, "withdrawals", filters],
    queryFn: () => partnersService.getPartnerWithdrawals(partnerId, filters),
    enabled: !!partnerId,
  });
};

export const useAllWithdrawals = (filters?: WithdrawalFilters) => {
  const partnersService = usePartnersService();
  
  return useQuery({
    queryKey: ["partners", "withdrawals", filters],
    queryFn: () => partnersService.getAllWithdrawals(filters),
  });
};

export const useCreateWithdrawal = () => {
  const queryClient = useQueryClient();
  const partnersService = usePartnersService();
  
  return useMutation({
    mutationFn: ({ partnerId, data }: { partnerId: string; data: CreateWithdrawalForm }) => 
      partnersService.createWithdrawal(partnerId, data),
    onSuccess: (_, { partnerId }) => {
      queryClient.invalidateQueries({ queryKey: ["partners", partnerId, "withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["partners", partnerId, "financial-summary"] });
      queryClient.invalidateQueries({ queryKey: ["partners", "withdrawals"] });
    },
  });
};

export const useApproveWithdrawal = () => {
  const queryClient = useQueryClient();
  const partnersService = usePartnersService();
  
  return useMutation({
    mutationFn: partnersService.approveWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners", "withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
  });
};

export const useRejectWithdrawal = () => {
  const queryClient = useQueryClient();
  const partnersService = usePartnersService();
  
  return useMutation({
    mutationFn: ({ withdrawalId, data }: { withdrawalId: string; data: RejectWithdrawalForm }) => 
      partnersService.rejectWithdrawal(withdrawalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners", "withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
  });
};

// Hook para distribuição de lucros
export const useDistributeProfit = () => {
  const queryClient = useQueryClient();
  const partnersService = usePartnersService();
  
  return useMutation({
    mutationFn: partnersService.distributeProfit,
    onSuccess: (_, fairId) => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["cash-flow-analysis", fairId] });
    },
  });
};