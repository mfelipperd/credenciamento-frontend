import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesApi } from "@/service/expenses.service";
import { queryKeys } from "@/lib/query-keys";
import type {
  Expense,
  CreateExpenseForm,
  UpdateExpenseForm,
  ExpenseFilters,
  FinanceCategory,
  CreateFinanceCategoryForm,
  UpdateFinanceCategoryForm,
  Account,
  CreateAccountForm,
  UpdateAccountForm,
} from "@/interfaces/finance";

// Hook para buscar despesas
export const useExpenses = (filters: ExpenseFilters) => {
  return useQuery({
    queryKey: queryKeys.expenses.list(filters),
    queryFn: () => expensesApi.getExpenses(filters),
    enabled: !!filters.fairId,
  });
};

// Hook para buscar detalhes de uma despesa
export const useExpenseDetail = (id: string, fairId: string) => {
  return useQuery({
    queryKey: queryKeys.expenses.detail(id, fairId),
    queryFn: () => expensesApi.getExpenseDetail(id, fairId),
    enabled: !!id && !!fairId,
  });
};

// Hook para buscar total de despesas
export const useExpensesTotal = (fairId: string) => {
  return useQuery({
    queryKey: queryKeys.expenses.total(fairId),
    queryFn: () => expensesApi.getExpensesTotal(fairId),
    enabled: !!fairId,
  });
};

// Hook para buscar totais por categoria
export const useExpensesTotalByCategory = (fairId: string) => {
  return useQuery({
    queryKey: queryKeys.expenses.totalByCategory(fairId),
    queryFn: () => expensesApi.getExpensesTotalByCategory(fairId),
    enabled: !!fairId,
  });
};

// Hook para buscar totais por conta
export const useExpensesTotalByAccount = (fairId: string) => {
  return useQuery({
    queryKey: queryKeys.expenses.totalByAccount(fairId),
    queryFn: () => expensesApi.getExpensesTotalByAccount(fairId),
    enabled: !!fairId,
  });
};

// Hook para buscar categorias da feira
export const useFinanceCategoriesByFair = (fairId: string) => {
  return useQuery({
    queryKey: queryKeys.expenses.categoriesByFair(fairId),
    queryFn: () => expensesApi.getFinanceCategoriesByFair(fairId),
    enabled: !!fairId,
  });
};

// Hook para buscar contas
export const useAccounts = () => {
  return useQuery({
    queryKey: queryKeys.expenses.accounts(),
    queryFn: () => expensesApi.getAccounts(),
  });
};

// Mutations
export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fairId, data }: { fairId: string; data: CreateExpenseForm }) =>
      expensesApi.createExpense(fairId, data),
    onSuccess: (_, { fairId }) => {
      // Invalida queries relacionadas para recarregar dados
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.total(fairId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.totalByCategory(fairId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.totalByAccount(fairId) });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, fairId }: { id: string; data: UpdateExpenseForm; fairId: string }) =>
      expensesApi.updateExpense(id, data, fairId),
    onSuccess: (_, { fairId }) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.total(fairId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.totalByCategory(fairId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.totalByAccount(fairId) });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, fairId }: { id: string; fairId: string }) =>
      expensesApi.deleteExpense(id, fairId),
    onSuccess: (_, { fairId }) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.total(fairId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.totalByCategory(fairId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.totalByAccount(fairId) });
    },
  });
};

export const useCreateFinanceCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fairId, data }: { fairId: string; data: CreateFinanceCategoryForm }) =>
      expensesApi.createFinanceCategory(fairId, data),
    onSuccess: (_, { fairId }) => {
      // Invalida queries de categorias
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.categoriesByFair(fairId) });
    },
  });
};

export const useUpdateFinanceCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, fairId }: { id: string; data: UpdateFinanceCategoryForm; fairId: string }) =>
      expensesApi.updateFinanceCategory(id, data, fairId),
    onSuccess: (_, { fairId }) => {
      // Invalida queries de categorias
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.categoriesByFair(fairId) });
    },
  });
};

export const useDeleteFinanceCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, fairId }: { id: string; fairId: string }) =>
      expensesApi.deleteFinanceCategory(id, fairId),
    onSuccess: (_, { fairId }) => {
      // Invalida queries de categorias
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.categoriesByFair(fairId) });
    },
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountForm) => expensesApi.createAccount(data),
    onSuccess: () => {
      // Invalida queries de contas
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.accounts() });
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountForm }) =>
      expensesApi.updateAccount(id, data),
    onSuccess: () => {
      // Invalida queries de contas
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.accounts() });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expensesApi.deleteAccount(id),
    onSuccess: () => {
      // Invalida queries de contas
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.accounts() });
    },
  });
};
