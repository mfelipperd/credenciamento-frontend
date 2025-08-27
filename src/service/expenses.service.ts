import { handleRequest } from "@/utils/handleRequest";
import { useAxio } from "@/hooks/useAxio";
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

// Hook personalizado para o serviço de despesas
export const useExpensesService = () => {
  const api = useAxio();

  // ===== DESPESAS =====

  const getExpenses = async (
    filters: ExpenseFilters
  ): Promise<Expense[] | undefined> => {
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
        api.get(`${BASE_URL}/fairs/${fairId}/expenses${queryString}`),
    });
  };

  const getExpenseDetail = async (
    id: string,
    fairId?: string
  ): Promise<Expense | undefined> => {
    if (!fairId) {
      throw new Error("fairId é obrigatório para buscar detalhes da despesa");
    }

    return handleRequest<Expense>({
      request: () => api.get(`${BASE_URL}/fairs/${fairId}/expenses/${id}`),
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
        api.post(`${BASE_URL}/fairs/${fairId}/expenses`, expenseData),
      successMessage: "Despesa criada com sucesso!",
    });
  };

  const updateExpense = async (
    id: string,
    data: UpdateExpenseForm,
    fairId?: string
  ): Promise<Expense | undefined> => {
    if (!fairId) {
      throw new Error("fairId é obrigatório para atualizar despesa");
    }

    return handleRequest<Expense>({
      request: () =>
        api.patch(`${BASE_URL}/fairs/${fairId}/expenses/${id}`, data),
      successMessage: "Despesa atualizada com sucesso!",
    });
  };

  const deleteExpense = async (id: string, fairId: string): Promise<void> => {
    await handleRequest<{ success: boolean }>({
      request: () => api.delete(`${BASE_URL}/fairs/${fairId}/expenses/${id}`),
      successMessage: "Despesa removida com sucesso!",
    });
  };

  // ===== RELATÓRIOS DE DESPESAS =====

  const getExpensesTotal = async (
    fairId: string
  ): Promise<number | undefined> => {
    return handleRequest<number>({
      request: () => api.get(`${BASE_URL}/fairs/${fairId}/expenses/total`),
    });
  };

  const getExpensesTotalByCategory = async (
    fairId: string
  ): Promise<ExpenseTotalByCategory[] | undefined> => {
    return handleRequest<ExpenseTotalByCategory[]>({
      request: () =>
        api.get(`${BASE_URL}/fairs/${fairId}/expenses/total-by-category`),
    });
  };

  const getExpensesTotalByAccount = async (
    fairId: string
  ): Promise<ExpenseTotalByAccount[] | undefined> => {
    return handleRequest<ExpenseTotalByAccount[]>({
      request: () =>
        api.get(`${BASE_URL}/fairs/${fairId}/expenses/total-by-account`),
    });
  };

  // ===== CATEGORIAS FINANCEIRAS =====

  const getFinanceCategoriesByFair = async (
    fairId: string
  ): Promise<FinanceCategory[] | undefined> => {
    const response = await handleRequest<FinanceCategory[]>({
      request: () => api.get(`/categories/fair/${fairId}`),
    });

    // Mapear campo 'name' do backend para 'nome' da interface
    return response?.map((category) => ({
      ...category,
      nome: (category as any).name || category.nome || "Sem nome",
    }));
  };

  const getFinanceCategory = async (
    id: string
  ): Promise<FinanceCategory | undefined> => {
    return handleRequest<FinanceCategory>({
      request: () => api.get(`/categories/${id}`),
    });
  };

  const createFinanceCategory = async (
    data: CreateFinanceCategoryForm
  ): Promise<FinanceCategory | undefined> => {
    // Mapear campos para o formato esperado pelo backend
    const mappedData = {
      name: data.nome, // Backend espera 'name' mas enviamos 'nome'
      global: data.global,
      fairId: data.fairId, // Sempre incluir fairId quando disponível
      ...(data.parentId && { parentId: data.parentId }),
    };

    return handleRequest<FinanceCategory>({
      request: () => api.post(`/categories`, mappedData),
      successMessage: "Categoria criada com sucesso!",
    });
  };

  const updateFinanceCategory = async (
    id: string,
    data: UpdateFinanceCategoryForm
  ): Promise<FinanceCategory | undefined> => {
    // Mapear campos para o formato esperado pelo backend
    const mappedData = {
      ...(data.nome && { name: data.nome }),
      ...(data.global !== undefined && { global: data.global }),
      ...(data.fairId && { fairId: data.fairId }),
      ...(data.parentId && { parentId: data.parentId }),
    };

    return handleRequest<FinanceCategory>({
      request: () => api.patch(`/categories/${id}`, mappedData),
      successMessage: "Categoria atualizada com sucesso!",
    });
  };

  const deleteFinanceCategory = async (id: string): Promise<void> => {
    await handleRequest<{ success: boolean }>({
      request: () => api.delete(`/categories/${id}`),
      successMessage: "Categoria removida com sucesso!",
    });
  };

  // ===== CONTAS BANCÁRIAS =====

  const getAccounts = async (): Promise<Account[] | undefined> => {
    return handleRequest<Account[]>({
      request: () => api.get(`/accounts`),
    });
  };

  const getAccount = async (id: string): Promise<Account | undefined> => {
    return handleRequest<Account>({
      request: () => api.get(`/accounts/${id}`),
    });
  };

  const createAccount = async (
    data: CreateAccountForm
  ): Promise<Account | undefined> => {
    // Mapear campos para o formato esperado pelo backend
    const mappedData = {
      nomeConta: data.nomeConta, // Manter nomeConta se o backend aceitar
      banco: data.banco,
      tipo: data.tipo.toLowerCase(), // Converter para minúsculas: CORRENTE -> corrente
    };

    return handleRequest<Account>({
      request: () => api.post(`/accounts`, mappedData),
      successMessage: "Conta bancária criada com sucesso!",
    });
  };

  const updateAccount = async (
    id: string,
    data: UpdateAccountForm
  ): Promise<Account | undefined> => {
    // Mapear campos para o formato esperado pelo backend
    const mappedData = {
      ...(data.nomeConta && { nomeConta: data.nomeConta }),
      ...(data.banco && { banco: data.banco }),
      ...(data.tipo && { tipo: data.tipo.toLowerCase() }), // Converter para minúsculas
    };

    return handleRequest<Account>({
      request: () => api.patch(`/accounts/${id}`, mappedData),
      successMessage: "Conta bancária atualizada com sucesso!",
    });
  };

  const deleteAccount = async (id: string): Promise<void> => {
    await handleRequest<{ success: boolean }>({
      request: () => api.delete(`/accounts/${id}`),
      successMessage: "Conta bancária removida com sucesso!",
    });
  };

  return {
    // Despesas
    getExpenses,
    getExpenseDetail,
    createExpense,
    updateExpense,
    deleteExpense,

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
