import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFairService } from "@/service/fair.service";
import { useAuth } from "@/hooks/useAuth";
import { useAxio } from "@/hooks/useAxio";
import { AppEndpoints } from "@/constants/AppEndpoints";
import type {
  UpdateFairForm,
  FairFilters,
  Fair,
} from "@/interfaces/fairs";

// Hook para listar feiras
export const useFairs = (filters?: FairFilters) => {
  const api = useAxio();
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["fairs", "list", user?.id, filters ?? null],
    queryFn: async () => {
      const response = await api.get<Fair[]>(AppEndpoints.FAIRS.BASE, { params: filters });
      return response.data;
    },
    enabled: isAuthenticated && !!user?.id,
  });
};

// Hook para buscar feira específica
export const useFair = (id: string) => {
  const fairService = useFairService();

  return useQuery({
    queryKey: ["fairs", id],
    queryFn: async () => {
      const result = await fairService.getFairById(id);
      return result ?? null;
    },
    enabled: !!id,
  });
};

// Hook para estatísticas agregadas das feiras (via backend)
export const useFairStats = () => {
  const fairService = useFairService();

  return useQuery({
    queryKey: ["fairs", "stats"],
    queryFn: () => fairService.getFairStats(),
  });
};

// Hook para criar feira
export const useCreateFair = () => {
  const fairService = useFairService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fairService.createFair,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fairs"] });
      queryClient.invalidateQueries({ queryKey: ["fairs", "stats"] });
    },
  });
};

// Hook para atualizar feira
export const useUpdateFair = () => {
  const fairService = useFairService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFairForm }) =>
      fairService.updateFair(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["fairs"] });
      queryClient.invalidateQueries({ queryKey: ["fairs", id] });
      queryClient.invalidateQueries({ queryKey: ["fairs", "stats"] });
    },
  });
};

// Hook para excluir feira
export const useDeleteFair = () => {
  const fairService = useFairService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fairService.deleteFair,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fairs"] });
      queryClient.invalidateQueries({ queryKey: ["fairs", "stats"] });
    },
  });
};

// Hook para ativar/desativar feira
export const useToggleFairActive = () => {
  const fairService = useFairService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fairService.toggleFairActive,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fairs"] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["fairs", data.id] });
      }
      queryClient.invalidateQueries({ queryKey: ["fairs", "stats"] });
    },
  });
};
