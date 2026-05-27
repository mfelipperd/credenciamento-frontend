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
} from "@/interfaces/finance";
import type {
  FinanceCategory,
  OverheadCategory,
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
  DirectExpenseCategory,
  FinanceCategory,
  OverheadCategory,
  CreateCategoryDto,
  UpdateCategoryDto,
  Account,
  CreateAccountForm,
  UpdateAccountForm,
  ExpenseTotalByCategory,
  ExpenseTotalByAccount,
};
