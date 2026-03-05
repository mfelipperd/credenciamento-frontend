import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useAxio } from "@/hooks/useAxio";
import { toast } from "sonner";
import { AppEndpoints } from "@/constants/AppEndpoints";

// Interfaces básicas (ajustar conforme necessário)
export interface Stand {
  id: string;
  fairId: string;
  number: string;
  size: string;
  status: string;
  price: number;
  exhibitorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StandConfig {
  id: string;
  fairId: string;
  totalStands: number;
  availableStands: number;
  reservedStands: number;
  soldStands: number;
}

export interface CreateStandForm {
  fairId: string;
  number: string;
  size: string;
  price: number;
}

export interface UpdateStandForm {
  number?: string;
  size?: string;
  price?: number;
  status?: string;
  exhibitorId?: string;
}

// ===== QUERIES =====

// Hook para buscar stands de uma feira
export const useStands = (fairId: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.stands.listByFair(fairId),
    queryFn: async () => {
      const response = await api.get(AppEndpoints.STANDS.BASE, {
        params: { fairId }
      });
      return response.data as Stand[];
    },
    enabled: !!fairId,
  });
};

// Hook para buscar detalhes de um stand
export const useStand = (id: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.stands.detail(id),
    queryFn: async () => {
      const response = await api.get(AppEndpoints.STANDS.BY_ID(id));
      return response.data as Stand;
    },
    enabled: !!id,
  });
};

// Hook para buscar configuração de stands de uma feira
export const useStandConfig = (fairId: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.stands.configByFair(fairId),
    queryFn: async () => {
      const response = await api.get(AppEndpoints.STANDS.CONFIGURE, {
        params: { fairId }
      });
      return response.data as StandConfig;
    },
    enabled: !!fairId,
  });
};

// ===== MUTATIONS =====

// Hook para criar stand
export const useCreateStand = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async (data: CreateStandForm) => {
      const response = await api.post(AppEndpoints.STANDS.BASE, data);
      return response.data as Stand;
    },
    onSuccess: (data) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.stands.listByFair(data.fairId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stands.configByFair(data.fairId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.fairs.standsByFair(data.fairId) });
      toast.success("Stand criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar stand: " + (error.response?.data?.message || error.message));
    },
  });
};

// Hook para atualizar stand
export const useUpdateStand = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateStandForm }) => {
      const response = await api.patch(AppEndpoints.STANDS.BY_ID(id), data);
      return response.data as Stand;
    },
    onSuccess: (data) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.stands.listByFair(data.fairId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stands.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stands.configByFair(data.fairId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.fairs.standsByFair(data.fairId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.fairs.standStats(data.fairId) });
      toast.success("Stand atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar stand: " + (error.response?.data?.message || error.message));
    },
  });
};

// Hook para deletar stand
export const useDeleteStand = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({ id, fairId }: { id: string; fairId: string }) => {
      const response = await api.delete(AppEndpoints.STANDS.BY_ID(id));
      return { ...response.data, fairId };
    },
    onSuccess: (data) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.stands.listByFair(data.fairId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stands.configByFair(data.fairId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.fairs.standsByFair(data.fairId) });
      toast.success("Stand removido com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover stand: " + (error.response?.data?.message || error.message));
    },
  });
};
