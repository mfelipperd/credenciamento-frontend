import { handleRequest } from "@/utils/handleRequest";
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
  ExpenseTotalByCategory,
  ExpenseTotalByAccount,
} from "@/interfaces/finance";

const BASE_URL = "";

// Funções puras de API para despesas
export const expensesApi = {
  // ===== DESPESAS =====
  getExpenses: async (filters: ExpenseFilters): Promise<Expense[]> => {
    const { fairId, ...otherFilters } = filters;
    const params = new URLSearchParams();

    // Adiciona apenas os filtros que não são fairId
    Object.entries(otherFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString() ? `?${params.toString()}` : "";

    return handleRequest<Expense[]>({
      request: () =>
        fetch(`${BASE_URL}/fairs/${fairId}/expenses${queryString}`),
    });
  },

  getExpenseDetail: async (id: string, fairId: string): Promise<Expense> => {
    if (!fairId) {
      throw new Error("fairId é obrigatório para buscar detalhes da despesa");
    }

    return handleRequest<Expense>({
      request: () => fetch(`${BASE_URL}/fairs/${fairId}/expenses/${id}`),
    });
  },

  createExpense: async (fairId: string, data: CreateExpenseForm): Promise<Expense> => {
    const expenseData = {
      ...data,
      fairId,
    };

    return handleRequest<Expense>({
      request: () =>
        fetch(`${BASE_URL}/fairs/${fairId}/expenses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(expenseData),
        }),
      successMessage: "Despesa criada com sucesso!",
    });
  },

  updateExpense: async (id: string, data: UpdateExpenseForm, fairId: string): Promise<Expense> => {
    if (!fairId) {
      throw new Error("fairId é obrigatório para atualizar despesa");
    }

    return handleRequest<Expense>({
      request: () =>
        fetch(`${BASE_URL}/fairs/${fairId}/expenses/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }),
      successMessage: "Despesa atualizada com sucesso!",
    });
  },

  deleteExpense: async (id: string, fairId: string): Promise<void> => {
    await handleRequest<{ success: boolean }>({
      request: () => fetch(`${BASE_URL}/fairs/${fairId}/expenses/${id}`, {
        method: 'DELETE',
      }),
      successMessage: "Despesa removida com sucesso!",
    });
  },

  // ===== RELATÓRIOS DE DESPESAS =====
  getExpensesTotal: async (fairId: string): Promise<number> => {
    return handleRequest<number>({
      request: () => fetch(`${BASE_URL}/fairs/${fairId}/expenses/total`),
    });
  },

  getExpensesTotalByCategory: async (fairId: string): Promise<ExpenseTotalByCategory[]> => {
    return handleRequest<ExpenseTotalByCategory[]>({
      request: () => fetch(`${BASE_URL}/fairs/${fairId}/expenses/total-by-category`),
    });
  },

  getExpensesTotalByAccount: async (fairId: string): Promise<ExpenseTotalByAccount[]> => {
    return handleRequest<ExpenseTotalByAccount[]>({
      request: () => fetch(`${BASE_URL}/fairs/${fairId}/expenses/total-by-account`),
    });
  },

  // ===== CATEGORIAS FINANCEIRAS =====
  getFinanceCategoriesByFair: async (fairId: string): Promise<FinanceCategory[]> => {
    return handleRequest<FinanceCategory[]>({
      request: () => fetch(`${BASE_URL}/fairs/${fairId}/finance-categories`),
    });
  },

  createFinanceCategory: async (fairId: string, data: CreateFinanceCategoryForm): Promise<FinanceCategory> => {
    const categoryData = {
      ...data,
      fairId,
    };

    return handleRequest<FinanceCategory>({
      request: () =>
        fetch(`${BASE_URL}/fairs/${fairId}/finance-categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(categoryData),
        }),
      successMessage: "Categoria criada com sucesso!",
    });
  },

  updateFinanceCategory: async (
    id: string,
    data: UpdateFinanceCategoryForm,
    fairId: string
  ): Promise<FinanceCategory> => {
    return handleRequest<FinanceCategory>({
      request: () =>
        fetch(`${BASE_URL}/fairs/${fairId}/finance-categories/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }),
      successMessage: "Categoria atualizada com sucesso!",
    });
  },

  deleteFinanceCategory: async (id: string, fairId: string): Promise<void> => {
    await handleRequest<{ success: boolean }>({
      request: () => fetch(`${BASE_URL}/fairs/${fairId}/finance-categories/${id}`, {
        method: 'DELETE',
      }),
      successMessage: "Categoria removida com sucesso!",
    });
  },

  // ===== CONTAS BANCÁRIAS =====
  getAccounts: async (): Promise<Account[]> => {
    return handleRequest<Account[]>({
      request: () => fetch(`${BASE_URL}/accounts`),
    });
  },

  createAccount: async (data: CreateAccountForm): Promise<Account> => {
    return handleRequest<Account>({
      request: () =>
        fetch(`${BASE_URL}/accounts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }),
      successMessage: "Conta criada com sucesso!",
    });
  },

  updateAccount: async (id: string, data: UpdateAccountForm): Promise<Account> => {
    return handleRequest<Account>({
      request: () =>
        fetch(`${BASE_URL}/accounts/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }),
      successMessage: "Conta atualizada com sucesso!",
    });
  },

  deleteAccount: async (id: string): Promise<void> => {
    await handleRequest<{ success: boolean }>({
      request: () => fetch(`${BASE_URL}/accounts/${id}`, {
        method: 'DELETE',
      }),
      successMessage: "Conta removida com sucesso!",
    });
  },
};
