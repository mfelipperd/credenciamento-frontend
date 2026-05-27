import { handleRequest } from "@/utils/handleRequest";
import { useAxio } from "@/hooks/useAxio";
import type {
  Expense,
  CreateExpenseForm,
  UpdateExpenseForm,
  ExpenseFilters,
  DirectExpenseCategory,
  Account,
  CreateAccountForm,
  UpdateAccountForm,
  ExpenseTotalByCategory,
  ExpenseTotalByAccount,
  FairExpensesResponse,
  FairExpensesTotalResponse,
  OverheadExpense,
  CreateOverheadExpenseForm,
  UpdateOverheadExpenseForm,
} from "@/interfaces/finance";
import type { FinanceCategory, CreateCategoryDto, UpdateCategoryDto } from "@/interfaces/categories";

import { AppEndpoints } from "@/constants/AppEndpoints";

// Hook personalizado para o serviço de despesas
export const useExpensesService = () => {
  const api = useAxio();

  // ===== DESPESAS =====

  const getExpenses = async (
    filters: ExpenseFilters
  ): Promise<FairExpensesResponse | undefined> => {
    const { fairId, ...otherFilters } = filters;
    const params = new URLSearchParams();

    // Adiciona apenas os filtros que não são fairId
    Object.entries(otherFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString() ? `?${params.toString()}` : "";

    const result = await handleRequest<FairExpensesResponse>({
      request: () =>
        api.get(`${AppEndpoints.FINANCE.EXPENSES_BY_FAIR(fairId)}${queryString}`),
    });

    return result;
  };

  const getExpenseDetail = async (
    fairId: string,
    id: string
  ): Promise<Expense | undefined> => {
    return handleRequest<Expense>({
      request: () => api.get(AppEndpoints.FINANCE.EXPENSE_BY_ID(fairId, id)),
    });
  };

  const createExpense = async (
    fairId: string,
    data: CreateExpenseForm
  ): Promise<Expense | undefined> => {
    // Incluir fairId no payload da requisição
    const expenseData = {
      ...data,
      fairId,
    };

    return handleRequest<Expense>({
      request: () =>
        api.post(AppEndpoints.FINANCE.EXPENSES_BY_FAIR(fairId), expenseData),
      successMessage: "Despesa criada com sucesso!",
    });
  };

  const updateExpense = async (
    fairId: string,
    id: string,
    data: UpdateExpenseForm
  ): Promise<Expense | undefined> => {
    return handleRequest<Expense>({
      request: () => api.patch(AppEndpoints.FINANCE.EXPENSE_BY_ID(fairId, id), data),
      successMessage: "Despesa atualizada com sucesso!",
    });
  };

  const deleteExpense = async (fairId: string, id: string): Promise<void> => {
    await handleRequest<{ success: boolean }>({
      request: () => api.delete(AppEndpoints.FINANCE.EXPENSE_BY_ID(fairId, id)),
      successMessage: "Despesa removida com sucesso!",
    });
  };

  // ===== RELATÓRIOS DE DESPESAS =====

  const getExpensesTotal = async (
    fairId: string
  ): Promise<FairExpensesTotalResponse | undefined> => {
    return handleRequest<FairExpensesTotalResponse>({
      request: () => api.get(AppEndpoints.FINANCE.EXPENSES_TOTAL(fairId)),
    });
  };

  const getExpensesTotalByCategory = async (
    fairId: string
  ): Promise<ExpenseTotalByCategory[] | undefined> => {
    return handleRequest<ExpenseTotalByCategory[]>({
      request: () =>
        api.get(AppEndpoints.FINANCE.EXPENSES_BY_CATEGORY(fairId)),
    });
  };

  const getExpensesTotalByAccount = async (
    fairId: string
  ): Promise<ExpenseTotalByAccount[] | undefined> => {
    return handleRequest<ExpenseTotalByAccount[]>({
      request: () =>
        api.get(AppEndpoints.FINANCE.EXPENSES_BY_ACCOUNT(fairId)),
    });
  };

  // ===== CATEGORIAS FINANCEIRAS =====

  const getFinanceCategoriesByFair = async (
    fairId: string
  ): Promise<DirectExpenseCategory[] | undefined> => {
    return handleRequest<DirectExpenseCategory[]>({
      request: () => api.get(AppEndpoints.FINANCE.CATEGORIES_BY_FAIR(fairId)),
    });
  };

  // ===== CATEGORIAS OVERHEAD =====

  const getOverheadCategories = async (): Promise<FinanceCategory[] | undefined> => {
    return handleRequest<FinanceCategory[]>({
      request: () => api.get(AppEndpoints.FINANCE.OVERHEAD_CATEGORIES),
    });
  };

  const getFinanceCategory = async (
    id: string
  ): Promise<FinanceCategory | undefined> => {
    return handleRequest<FinanceCategory>({
      request: () => api.get(AppEndpoints.FINANCE.CATEGORY_BY_ID(id)),
    });
  };

  const createFinanceCategory = async (
    data: CreateCategoryDto
  ): Promise<FinanceCategory | undefined> => {
    return handleRequest<FinanceCategory>({
      request: () => api.post(AppEndpoints.FINANCE.CATEGORIES, data),
      successMessage: "Categoria criada com sucesso!",
    });
  };

  const updateFinanceCategory = async (
    id: string,
    data: UpdateCategoryDto
  ): Promise<FinanceCategory | undefined> => {
    return handleRequest<FinanceCategory>({
      request: () => api.patch(AppEndpoints.FINANCE.CATEGORY_BY_ID(id), data),
      successMessage: "Categoria atualizada com sucesso!",
    });
  };

  const deleteFinanceCategory = async (id: string): Promise<void> => {
    await handleRequest<{ success: boolean }>({
      request: () => api.delete(AppEndpoints.FINANCE.CATEGORY_BY_ID(id)),
      successMessage: "Categoria removida com sucesso!",
    });
  };

  // ===== CONTAS BANCÁRIAS =====

  const getAccounts = async (): Promise<Account[] | undefined> => {
    return handleRequest<Account[]>({
      request: () => api.get(AppEndpoints.FINANCE.ACCOUNTS),
    });
  };

  const getAccount = async (id: string): Promise<Account | undefined> => {
    return handleRequest<Account>({
      request: () => api.get(AppEndpoints.FINANCE.ACCOUNT_BY_ID(id)),
    });
  };

  const createAccount = async (
    data: CreateAccountForm
  ): Promise<Account | undefined> => {
    return handleRequest<Account>({
      request: () => api.post(AppEndpoints.FINANCE.ACCOUNTS, data),
      successMessage: "Conta bancária criada com sucesso!",
    });
  };

  const updateAccount = async (
    id: string,
    data: UpdateAccountForm
  ): Promise<Account | undefined> => {
    return handleRequest<Account>({
      request: () => api.patch(AppEndpoints.FINANCE.ACCOUNT_BY_ID(id), data),
      successMessage: "Conta bancária atualizada com sucesso!",
    });
  };

  const deleteAccount = async (id: string): Promise<void> => {
    await handleRequest<{ success: boolean }>({
      request: () => api.delete(AppEndpoints.FINANCE.ACCOUNT_BY_ID(id)),
      successMessage: "Conta bancária removida com sucesso!",
    });
  };

  // ===== DESPESAS OVERHEAD =====

  const getOverheadExpenses = async (): Promise<OverheadExpense[] | undefined> => {
    return handleRequest<OverheadExpense[]>({
      request: () => api.get(AppEndpoints.FINANCE.OVERHEAD_EXPENSES),
    });
  };

  const getOverheadExpenseDetail = async (
    id: string
  ): Promise<OverheadExpense | undefined> => {
    return handleRequest<OverheadExpense>({
      request: () => api.get(AppEndpoints.FINANCE.OVERHEAD_EXPENSE_BY_ID(id)),
    });
  };

  const createOverheadExpense = async (
    data: CreateOverheadExpenseForm
  ): Promise<OverheadExpense | undefined> => {
    return handleRequest<OverheadExpense>({
      request: () => api.post(AppEndpoints.FINANCE.OVERHEAD_EXPENSES, data),
      successMessage: "Despesa overhead criada com sucesso!",
    });
  };

  const updateOverheadExpense = async (
    id: string,
    data: UpdateOverheadExpenseForm
  ): Promise<OverheadExpense | undefined> => {
    return handleRequest<OverheadExpense>({
      request: () => api.patch(AppEndpoints.FINANCE.OVERHEAD_EXPENSE_BY_ID(id), data),
      successMessage: "Despesa overhead atualizada com sucesso!",
    });
  };

  const deleteOverheadExpense = async (id: string): Promise<void> => {
    await handleRequest<{ success: boolean }>({
      request: () => api.delete(AppEndpoints.FINANCE.OVERHEAD_EXPENSE_BY_ID(id)),
      successMessage: "Despesa overhead removida com sucesso!",
    });
  };

  // ===== CONVERSÃO: DESPESA DIRETA → OVERHEAD =====

  interface ConvertToOverheadPayload {
    financeCategoryId?: string;
    fairs: Array<{ fairId: string; percentual?: number }>;
  }

  const convertExpenseToOverhead = async (
    id: string,
    payload: ConvertToOverheadPayload
  ): Promise<OverheadExpense | undefined> => {
    return handleRequest<OverheadExpense>({
      request: () =>
        api.post(AppEndpoints.FINANCE.EXPENSE_CONVERT_TO_OVERHEAD(id), payload),
      successMessage: "Despesa convertida para overhead com sucesso!",
    });
  };

  return {
    // Despesas
    getExpenses,
    getExpenseDetail,
    createExpense,
    updateExpense,
    deleteExpense,

    // Despesas Overhead
    getOverheadExpenses,
    getOverheadExpenseDetail,
    createOverheadExpense,
    updateOverheadExpense,
    deleteOverheadExpense,
    getOverheadCategories,
    convertExpenseToOverhead,

    // Relatórios
    getExpensesTotal,
    getExpensesTotalByCategory,
    getExpensesTotalByAccount,

    // Categorias Financeiras
    getFinanceCategoriesByFair,
    getFinanceCategory,
    createFinanceCategory,
    updateFinanceCategory,
    deleteFinanceCategory,

    // Contas Bancárias
    getAccounts,
    getAccount,
    createAccount,
    updateAccount,
    deleteAccount,
  };
};
