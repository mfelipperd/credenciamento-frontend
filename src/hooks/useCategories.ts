import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCategoriesService } from "@/service/categories.service";
import { toast } from "sonner";

export const useCategories = (fairId: string) => {
  const service = useCategoriesService();
  const queryClient = useQueryClient();

  const queryKeys = {
    all: ["categories"] as const,
    fair: (id: string) => [...queryKeys.all, "fair", id] as const,
    required: (id: string) => [...queryKeys.fair(id), "required"] as const,
    optional: (id: string) => [...queryKeys.fair(id), "optional"] as const,
    summary: (id: string) => [...queryKeys.fair(id), "summary"] as const,
  };

  // Buscar todas as categorias da feira
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: queryKeys.fair(fairId),
    queryFn: () => service.getAllCategories(fairId),
    enabled: !!fairId,
  });

  // Buscar categorias obrigatórias
  const { data: requiredCategories, isLoading: isLoadingRequired } = useQuery({
    queryKey: queryKeys.required(fairId),
    queryFn: () => service.getRequiredCategories(fairId),
    enabled: !!fairId,
  });

  // Buscar categorias opcionais
  const { data: optionalCategories, isLoading: isLoadingOptional } = useQuery({
    queryKey: queryKeys.optional(fairId),
    queryFn: () => service.getOptionalCategories(fairId),
    enabled: !!fairId,
  });

  // Buscar resumo das categorias obrigatórias
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: queryKeys.summary(fairId),
    queryFn: () => service.getRequiredSummary(fairId),
    enabled: !!fairId,
  });

  // Alternar status obrigatório
  const toggleRequiredMutation = useMutation({
    mutationFn: service.toggleRequired,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fair(fairId) });
      toast.success("Status da categoria alterado com sucesso");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao alterar status da categoria");
    },
  });

  // Criar categoria
  const createCategoryMutation = useMutation({
    mutationFn: service.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fair(fairId) });
      toast.success("Categoria criada com sucesso");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao criar categoria");
    },
  });

  // Atualizar categoria
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => service.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fair(fairId) });
      toast.success("Categoria atualizada com sucesso");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao atualizar categoria");
    },
  });

  // Deletar categoria
  const deleteCategoryMutation = useMutation({
    mutationFn: service.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fair(fairId) });
      toast.success("Categoria deletada com sucesso");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao deletar categoria");
    },
  });

  const isLoading = isLoadingCategories || isLoadingRequired || isLoadingOptional || isLoadingSummary;

  return {
    categories: categories || [],
    requiredCategories: requiredCategories || [],
    optionalCategories: optionalCategories || [],
    summary,
    isLoading,
    toggleRequired: toggleRequiredMutation.mutateAsync,
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    isToggling: toggleRequiredMutation.isPending,
    isCreating: createCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
  };
};
