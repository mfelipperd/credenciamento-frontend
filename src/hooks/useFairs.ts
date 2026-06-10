import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFairService } from "@/service/fair.service";
import { toast } from "sonner";
import { getAxiosErrorMessage } from "@/utils/handleAxiosError";
import type {
  Fair,
  UpdateFairForm,
  FairFilters,
} from "@/interfaces/fairs";

// Hook para listar feiras
export const useFairs = (filters?: FairFilters) => {
  const fairService = useFairService();

  return useQuery({
    queryKey: ["fairs", filters ?? null],
    queryFn: async () => {
      const result = await fairService.getFairs(filters);
      // React Query v5 não aceita undefined — retorna [] como fallback seguro
      return result ?? [];
    },
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

// Hook para estatísticas das feiras (calculadas localmente)
export const useFairStats = (fairs: Fair[] | undefined) => {
  const fairService = useFairService();

  return useQuery({
    queryKey: ["fairs", "stats", fairs?.length],
    queryFn: () => fairService.getFairStats(fairs || []),
    enabled: !!fairs,
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
      toast.success("Feira criada com sucesso!");
    },
    onError: (error: unknown) => {
      toast.error(getAxiosErrorMessage(error, "Erro ao criar feira"));
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
      toast.success("Feira atualizada com sucesso!");
    },
    onError: (error: unknown) => {
      toast.error(getAxiosErrorMessage(error, "Erro ao atualizar feira"));
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
      toast.success("Feira excluída com sucesso!");
    },
    onError: (error: unknown) => {
      toast.error(getAxiosErrorMessage(error, "Erro ao excluir feira"));
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
      toast.success(
        `Feira ${data?.isActive ? "ativada" : "desativada"} com sucesso!`
      );
    },
    onError: (error: unknown) => {
      toast.error(getAxiosErrorMessage(error, "Erro ao alterar status da feira"));
    },
  });
};