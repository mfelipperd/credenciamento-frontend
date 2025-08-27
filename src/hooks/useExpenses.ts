import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

const BASE_URL = "";

// Funções de API inline para despesas
const expensesApi = {
  getExpenses: async (filters: ExpenseFilters): Promise<Expense[]> => {
    const { fairId, ...otherFilters } = filters;
    const params = new URLSearchParams();

    Object.entries(otherFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${BASE_URL}/fairs/${fairId}/expenses${queryString}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  getExpenseDetail: async (id: string, fairId: string): Promise<Expense> => {
    if (!fairId) {
      throw new Error("fairId é obrigatório para buscar detalhes da despesa");
    }

    const response = await fetch(`${BASE_URL}/fairs/${fairId}/expenses/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  createExpense: async (fairId: string, data: CreateExpenseForm): Promise<Expense> => {
    const expenseData = { ...data, fairId };
    
    const response = await fetch(`${BASE_URL}/fairs/${fairId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  updateExpense: async (id: string, data: UpdateExpenseForm, fairId: string): Promise<Expense> => {
    if (!fairId) {
      throw new Error("fairId é obrigatório para atualizar despesa");
    }

    const response = await fetch(`${BASE_URL}/fairs/${fairId}/expenses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  deleteExpense: async (id: string, fairId: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/fairs/${fairId}/expenses/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  getExpensesTotal: async (fairId: string): Promise<number> => {
    const response = await fetch(`${BASE_URL}/fairs/${fairId}/expenses/total`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  getExpensesTotalByCategory: async (fairId: string): Promise<any[]> => {
    const response = await fetch(`${BASE_URL}/fairs/${fairId}/expenses/total-by-category`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  getExpensesTotalByAccount: async (fairId: string): Promise<any[]> => {
    const response = await fetch(`${BASE_URL}/fairs/${fairId}/expenses/total-by-account`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  getFinanceCategoriesByFair: async (fairId: string): Promise<FinanceCategory[]> => {
    const response = await fetch(`${BASE_URL}/fairs/${fairId}/finance-categories`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  createFinanceCategory: async (fairId: string, data: CreateFinanceCategoryForm): Promise<FinanceCategory> => {
    const categoryData = { ...data, fairId };
    
    const response = await fetch(`${BASE_URL}/fairs/${fairId}/finance-categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  updateFinanceCategory: async (id: string, data: UpdateFinanceCategoryForm, fairId: string): Promise<FinanceCategory> => {
    const response = await fetch(`${BASE_URL}/fairs/${fairId}/finance-categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  deleteFinanceCategory: async (id: string, fairId: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/fairs/${fairId}/finance-categories/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  getAccounts: async (): Promise<Account[]> => {
    const response = await fetch(`${BASE_URL}/accounts`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  createAccount: async (data: CreateAccountForm): Promise<Account> => {
    const response = await fetch(`${BASE_URL}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  updateAccount: async (id: string, data: UpdateAccountForm): Promise<Account> => {
    const response = await fetch(`${BASE_URL}/accounts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  deleteAccount: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/accounts/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};

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
