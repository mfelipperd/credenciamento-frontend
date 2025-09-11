import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFairPartnersService } from "@/service/fair-partners.service";
import type {
  UpdateFairPartnerForm,
  UpdatePartnerForm,
} from "@/interfaces/fair-partners";

// Hooks para gestão de sócios por feira
export const useFairPartners = (fairId: string) => {
  const fairPartnersService = useFairPartnersService();
  
  return useQuery({
    queryKey: ["fair-partners", fairId],
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
    queryKey: ["fair-partner", id],
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
      queryClient.invalidateQueries({ queryKey: ["fair-partners", fairId] });
      queryClient.invalidateQueries({ queryKey: ["fair-partners-summary", fairId] });
      queryClient.invalidateQueries({ queryKey: ["available-percentage", fairId] });
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
      queryClient.invalidateQueries({ queryKey: ["fair-partner", id] });
      queryClient.invalidateQueries({ queryKey: ["fair-partners"] });
    },
  });
};

export const useDeleteFairPartner = () => {
  const queryClient = useQueryClient();
  const fairPartnersService = useFairPartnersService();
  
  return useMutation({
    mutationFn: fairPartnersService.deleteFairPartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fair-partners"] });
      queryClient.invalidateQueries({ queryKey: ["fair-partners-summary"] });
      queryClient.invalidateQueries({ queryKey: ["available-percentage"] });
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
    queryKey: ["partners", filters],
    queryFn: () => fairPartnersService.getPartners(filters),
  });
};

export const usePartner = (id: string) => {
  const fairPartnersService = useFairPartnersService();
  
  return useQuery({
    queryKey: ["partner", id],
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
      queryClient.invalidateQueries({ queryKey: ["partners"] });
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
      queryClient.invalidateQueries({ queryKey: ["partner", id] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
  });
};

export const useDeletePartner = () => {
  const queryClient = useQueryClient();
  const fairPartnersService = useFairPartnersService();
  
  return useMutation({
    mutationFn: fairPartnersService.deletePartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
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
      queryClient.invalidateQueries({ queryKey: ["fair-partners", fairId] });
      queryClient.invalidateQueries({ queryKey: ["fair-partners-summary", fairId] });
      queryClient.invalidateQueries({ queryKey: ["cash-flow-analysis", fairId] });
    },
  });
};
