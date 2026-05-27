import type {
  Expense,
  CreateExpenseForm,
  UpdateExpenseForm,
  ExpenseFilters,
  Account,
  CreateAccountForm,
  UpdateAccountForm,
  ExpenseTotalByCategory,
  ExpenseTotalByAccount,
} from "@/interfaces/finance";
import type {
  FinanceCategory,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/interfaces/categories";

// Este arquivo agora serve apenas para exportar tipos
// Todas as requisições são feitas diretamente pelos hooks do React Query
export type {
  Expense,
  CreateExpenseForm,
  UpdateExpenseForm,
  ExpenseFilters,
  FinanceCategory,
  CreateCategoryDto,
  UpdateCategoryDto,
  Account,
  CreateAccountForm,
  UpdateAccountForm,
  ExpenseTotalByCategory,
  ExpenseTotalByAccount,
};
