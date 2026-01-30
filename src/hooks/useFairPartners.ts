import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useFairPartnersService } from "@/service/fair-partners.service";
import { toast } from "sonner";
import type {
  UpdateFairPartnerForm,
  UpdatePartnerForm,
} from "@/interfaces/fair-partners";

// Hooks para gestão de sócios por feira
export const useFairPartners = (fairId: string) => {
  const fairPartnersService = useFairPartnersService();
  
  return useQuery({
    queryKey: queryKeys.fairPartners.list(fairId),
    queryFn: () => fairPartnersService.getFairPartners(fairId),
    enabled: !!fairId,
  });
};

export const usePartnerFairs = (partnerId: string) => {
  const fairPartnersService = useFairPartnersService();
  
  return useQuery({
    queryKey: ["partner-fairs", partnerId],
    queryFn: () => fairPartnersService.getPartnerFairs(partnerId),
    enabled: !!partnerId,
  });
};

export const useMyFairs = () => {
  const fairPartnersService = useFairPartnersService();
  
  return useQuery({
    queryKey: ["my-fairs"],
    queryFn: fairPartnersService.getMyFairs,
  });
};

export const useFairPartner = (id: string) => {
  const fairPartnersService = useFairPartnersService();
  
  return useQuery({
    queryKey: queryKeys.fairPartners.detail(id),
    queryFn: () => fairPartnersService.getFairPartnerById(id),
    enabled: !!id,
  });
};

export const useCreateFairPartner = () => {
  const queryClient = useQueryClient();
  const fairPartnersService = useFairPartnersService();
  
  return useMutation({
    mutationFn: fairPartnersService.createFairPartner,
    onSuccess: (_, { fairId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fairPartners.list(fairId) });
      queryClient.invalidateQueries({ queryKey: ["fair-partners-summary", fairId] });
      queryClient.invalidateQueries({ queryKey: ["available-percentage", fairId] });
      toast.success("Sócio adicionado à feira com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao adicionar sócio à feira: " + (error.response?.data?.message || error.message));
    },
  });
};

export const useUpdateFairPartner = () => {
  const queryClient = useQueryClient();
  const fairPartnersService = useFairPartnersService();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFairPartnerForm }) => 
      fairPartnersService.updateFairPartner(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fairPartners.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.fairPartners.lists() });
      toast.success("Sócio da feira atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar sócio da feira: " + (error.response?.data?.message || error.message));
    },
  });
};

export const useDeleteFairPartner = () => {
  const queryClient = useQueryClient();
  const fairPartnersService = useFairPartnersService();
  
  return useMutation({
    mutationFn: fairPartnersService.deleteFairPartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fairPartners.lists() });
      queryClient.invalidateQueries({ queryKey: ["fair-partners-summary"] });
      queryClient.invalidateQueries({ queryKey: ["available-percentage"] });
      toast.success("Sócio removido da feira com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover sócio da feira: " + (error.response?.data?.message || error.message));
    },
  });
};

// Hooks para controle financeiro
export const useFairPartnersSummary = (fairId: string) => {
  const fairPartnersService = useFairPartnersService();
  
  return useQuery({
    queryKey: ["fair-partners-summary", fairId],
    queryFn: () => fairPartnersService.getFairPartnersSummary(fairId),
    enabled: !!fairId,
  });
};

export const useFairPartnerFinancialSummary = (fairId: string, partnerId: string) => {
  const fairPartnersService = useFairPartnersService();
  
  return useQuery({
    queryKey: ["fair-partner-financial-summary", fairId, partnerId],
    queryFn: () => fairPartnersService.getFairPartnerFinancialSummary(fairId, partnerId),
    enabled: !!fairId && !!partnerId,
  });
};

export const useAvailablePercentage = (fairId: string) => {
  const fairPartnersService = useFairPartnersService();
  
  return useQuery({
    queryKey: ["available-percentage", fairId],
    queryFn: () => fairPartnersService.getAvailablePercentage(fairId),
    enabled: !!fairId,
  });
};

// Hooks para gestão de sócios básicos
export const usePartners = (filters?: { search?: string; isActive?: boolean }) => {
  const fairPartnersService = useFairPartnersService();
  
  return useQuery({
    queryKey: queryKeys.partners.list(filters),
    queryFn: () => fairPartnersService.getPartners(filters),
  });
};

export const usePartner = (id: string) => {
  const fairPartnersService = useFairPartnersService();
  
  return useQuery({
    queryKey: queryKeys.partners.detail(id),
    queryFn: () => fairPartnersService.getPartnerById(id),
    enabled: !!id,
  });
};

export const useCreatePartner = () => {
  const queryClient = useQueryClient();
  const fairPartnersService = useFairPartnersService();
  
  return useMutation({
    mutationFn: fairPartnersService.createPartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.lists() });
      toast.success("Sócio criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar sócio: " + (error.response?.data?.message || error.message));
    },
  });
};

export const useUpdatePartner = () => {
  const queryClient = useQueryClient();
  const fairPartnersService = useFairPartnersService();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartnerForm }) => 
      fairPartnersService.updatePartner(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.lists() });
      toast.success("Sócio atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar sócio: " + (error.response?.data?.message || error.message));
    },
  });
};

export const useDeletePartner = () => {
  const queryClient = useQueryClient();
  const fairPartnersService = useFairPartnersService();
  
  return useMutation({
    mutationFn: fairPartnersService.deletePartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.lists() });
      toast.success("Sócio removido com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover sócio: " + (error.response?.data?.message || error.message));
    },
  });
};

// Hook para distribuição de lucros
export const useDistributeProfit = () => {
  const queryClient = useQueryClient();
  const fairPartnersService = useFairPartnersService();
  
  return useMutation({
    mutationFn: fairPartnersService.distributeProfit,
    onSuccess: (_, fairId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fairPartners.list(fairId) });
      queryClient.invalidateQueries({ queryKey: ["fair-partners-summary", fairId] });
      queryClient.invalidateQueries({ queryKey: ["cash-flow-analysis", fairId] });
      toast.success("Lucros distribuídos com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao distribuir lucros: " + (error.response?.data?.message || error.message));
    },
  });
};
