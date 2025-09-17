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

// Este arquivo agora serve apenas para exportar tipos
// Todas as requisições são feitas diretamente pelos hooks do React Query
export type {
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
};
