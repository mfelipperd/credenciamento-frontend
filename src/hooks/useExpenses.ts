import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useAxio } from "@/hooks/useAxio";
import { toast } from "sonner";
import type {
  CreateExpenseForm,
  UpdateExpenseForm,
  ExpenseFilters,
  CreateFinanceCategoryForm,
  UpdateFinanceCategoryForm,
  CreateAccountForm,
  UpdateAccountForm,
} from "@/interfaces/finance";

// Hook para buscar despesas
export const useExpenses = (filters: ExpenseFilters) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.expenses.list(filters),
    queryFn: async () => {
      const { fairId, ...otherFilters } = filters;
      const params = new URLSearchParams();

      Object.entries(otherFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const fullUrl = `/fairs/${fairId}/expenses${queryString}`;
      console.log('🔍 Fetching expenses from:', fullUrl);
      console.log('🔍 fairId:', fairId);
      
      const response = await api.get(fullUrl);
      console.log('🔍 Expenses data received:', response.data);
      return response.data;
    },
    enabled: !!filters.fairId,
  });
};

// Hook para buscar detalhes de uma despesa
export const useExpenseDetail = (id: string, fairId: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.expenses.detail(id, fairId),
    queryFn: async () => {
      if (!fairId) {
        throw new Error("fairId é obrigatório para buscar detalhes da despesa");
      }

      const response = await api.get(`/fairs/${fairId}/expenses/${id}`);
      return response.data;
    },
    enabled: !!id && !!fairId,
  });
};

// Hook para buscar total de despesas
export const useExpensesTotal = (fairId: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.expenses.total(fairId),
    queryFn: async () => {
      const response = await api.get(`/fairs/${fairId}/expenses/total`);
      return response.data;
    },
    enabled: !!fairId,
  });
};

// Hook para buscar totais por categoria
export const useExpensesTotalByCategory = (fairId: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.expenses.totalByCategory(fairId),
    queryFn: async () => {
      const response = await api.get(`/fairs/${fairId}/expenses/total-by-category`);
      return response.data;
    },
    enabled: !!fairId,
  });
};

// Hook para buscar totais por conta
export const useExpensesTotalByAccount = (fairId: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.expenses.totalByAccount(fairId),
    queryFn: async () => {
      const response = await api.get(`/fairs/${fairId}/expenses/total-by-account`);
      return response.data;
    },
    enabled: !!fairId,
  });
};

// Hook para buscar categorias da feira
export const useFinanceCategoriesByFair = (fairId: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.expenses.categoriesByFair(fairId),
    queryFn: async () => {
      const response = await api.get(`/categories/fair/${fairId}`);
      return response.data;
    },
    enabled: !!fairId,
  });
};

// Hook para buscar contas
export const useAccounts = () => {
  const api = useAxio();
  
  return useQuery({
    queryKey: queryKeys.expenses.accounts(),
    queryFn: async () => {
      const response = await api.get(`/accounts`);
      return response.data;
    },
  });
};

// Mutations
export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({ fairId, data }: { fairId: string; data: CreateExpenseForm }) => {
      const expenseData = { ...data, fairId };
      
      const response = await api.post(`/fairs/${fairId}/expenses`, expenseData);
      return response.data;
    },
    onSuccess: (_, { fairId }) => {
      // Invalida queries relacionadas para recarregar dados
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.total(fairId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.totalByCategory(fairId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.totalByAccount(fairId) });
      toast.success("Despesa criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar despesa: " + error.message);
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({ id, data, fairId }: { id: string; data: UpdateExpenseForm; fairId: string }) => {
      if (!fairId) {
        throw new Error("fairId é obrigatório para atualizar despesa");
      }

      const response = await api.patch(`/fairs/${fairId}/expenses/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { fairId }) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.total(fairId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.totalByCategory(fairId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.totalByAccount(fairId) });
      toast.success("Despesa atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar despesa: " + error.message);
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({ id, fairId }: { id: string; fairId: string }) => {
      await api.delete(`/fairs/${fairId}/expenses/${id}`);
    },
    onSuccess: (_, { fairId }) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.total(fairId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.totalByCategory(fairId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.totalByAccount(fairId) });
      toast.success("Despesa excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir despesa: " + error.message);
    },
  });
};

export const useCreateFinanceCategory = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({ fairId, data }: { fairId: string; data: CreateFinanceCategoryForm }) => {
      const categoryData = { ...data, fairId };
      
      const response = await api.post(`/categories`, categoryData);
      return response.data;
    },
    onSuccess: (_, { fairId }) => {
      // Invalida queries de categorias
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.categoriesByFair(fairId) });
      toast.success("Categoria financeira criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar categoria financeira: " + error.message);
    },
  });
};

export const useUpdateFinanceCategory = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFinanceCategoryForm; fairId: string }) => {
      const response = await api.patch(`/categories/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { fairId }) => {
      // Invalida queries de categorias
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.categoriesByFair(fairId) });
      toast.success("Categoria financeira atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar categoria financeira: " + error.message);
    },
  });
};

export const useDeleteFinanceCategory = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({ id }: { id: string; fairId: string }) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: (_, { fairId }) => {
      // Invalida queries de categorias
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.categoriesByFair(fairId) });
      toast.success("Categoria financeira excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir categoria financeira: " + error.message);
    },
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async (data: CreateAccountForm) => {
      const response = await api.post(`/accounts`, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalida queries de contas
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.accounts() });
      toast.success("Conta criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar conta: " + error.message);
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAccountForm }) => {
      const response = await api.patch(`/accounts/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalida queries de contas
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.accounts() });
      toast.success("Conta atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar conta: " + error.message);
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/accounts/${id}`);
    },
    onSuccess: () => {
      // Invalida queries de contas
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.accounts() });
      toast.success("Conta excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir conta: " + error.message);
    },
  });
};
