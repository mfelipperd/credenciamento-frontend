import { useState } from "react";
import { useSearchParams } from "@/hooks/useSearchParams";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Filter, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExpensesTable } from "./components/ExpensesTable";
import { ExpenseForm } from "./components/ExpenseForm";
import { ExpenseFilters } from "./components/ExpenseFilters";
import { ExpensesCharts } from "./components/ExpensesCharts";
import { ExpenseDetailModal } from "./components/ExpenseDetailModal";
import { DeleteExpenseDialog } from "./components/DeleteExpenseDialog";
import {
  useExpenses,
  useExpensesTotal,
  useFinanceCategoriesByFair,
  useAccounts,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from "@/hooks/useExpenses";
import type {
  Expense,
  CreateExpenseForm,
  UpdateExpenseForm,
} from "@/interfaces/finance";

export default function ExpensesPage() {
  const [, , fairId] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isChartsOpen, setIsChartsOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const { data: expenses, isLoading } = useExpenses({ fairId: fairId! });
  const { data: categories } = useFinanceCategoriesByFair(fairId!);
  const { data: accounts } = useAccounts();
  const { data: totalExpenses } = useExpensesTotal(fairId!);

  const createExpenseMutation = useCreateExpense();
  const updateExpenseMutation = useUpdateExpense();
  const deleteExpenseMutation = useDeleteExpense();

  // Handlers
  const handleCreateExpense = (data: CreateExpenseForm) => {
    createExpenseMutation.mutate(
      { fairId: fairId!, data },
      {
        onSuccess: () => {
          toast.success("Despesa criada com sucesso!");
          setIsFormOpen(false);
        },
        onError: (error) => {
          console.error("Erro ao criar despesa:", error);
          toast.error("Erro ao criar despesa. Tente novamente.");
        },
      }
    );
  };

  const handleUpdateExpense = ({ id, data }: { id: string; data: UpdateExpenseForm }) => {
    updateExpenseMutation.mutate(
      { id, data, fairId: fairId! },
      {
        onSuccess: () => {
          toast.success("Despesa atualizada com sucesso!");
          setEditingExpense(null);
          setIsFormOpen(false);
        },
        onError: (error) => {
          console.error("Erro ao atualizar despesa:", error);
          toast.error("Erro ao atualizar despesa. Tente novamente.");
        },
      }
    );
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpenseMutation.mutate(
      { id, fairId: fairId! },
      {
        onSuccess: () => {
          toast.success("Despesa removida com sucesso!");
          setExpenseToDelete(null);
        },
        onError: (error) => {
          console.error("Erro ao remover despesa:", error);
          toast.error("Erro ao remover despesa. Tente novamente.");
        },
      }
    );
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (!fairId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Selecione uma feira para gerenciar despesas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Despesas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie as despesas da feira
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsChartsOpen(!isChartsOpen)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            {isChartsOpen ? "Ocultar Gráficos" : "Mostrar Gráficos"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold px-6"
          >
            <Plus className="w-4 h-4" />
            Nova Despesa
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total de Despesas
            </CardTitle>
            <Badge variant="secondary">Mês Atual</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {totalExpenses ? formatCurrency(totalExpenses) : "R$ 0,00"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Quantidade
            </CardTitle>
            <Badge variant="secondary">Total</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {expenses?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Média por Despesa
            </CardTitle>
            <Badge variant="secondary">Valor</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {expenses && expenses.length > 0 && totalExpenses
                ? formatCurrency(totalExpenses / expenses.length)
                : "R$ 0,00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      {isFiltersOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseFilters
              categories={categories || []}
              accounts={accounts || []}
              onApplyFilters={(filters) => {
                console.log("Aplicar filtros:", filters);
                // Implementar lógica de filtros
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      {isChartsOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Análise de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesCharts fairId={fairId} />
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Tabela de Despesas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lista de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpensesTable
            expenses={expenses || []}
            isLoading={isLoading}
            onEdit={handleEditExpense}
            onView={handleViewExpense}
            onDelete={(expense) => setExpenseToDelete(expense)}
          />
        </CardContent>
      </Card>

      {/* Modal de Formulário */}
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={(data) => {
          if (editingExpense) {
            handleUpdateExpense({ id: editingExpense.id, data });
          } else {
            handleCreateExpense(data as CreateExpenseForm);
          }
        }}
        expense={editingExpense}
        categories={categories || []}
        accounts={accounts || []}
        isLoading={
          createExpenseMutation.isPending || updateExpenseMutation.isPending
        }
        fairId={fairId}
        onCategoryCreated={() => {
          // Recarregar categorias quando uma nova for criada
          // queryClient.refetchQueries({
          //   queryKey: ["finance-categories", fairId],
          // });
        }}
        onAccountCreated={() => {
          // Recarregar contas quando uma nova for criada
          // queryClient.refetchQueries({ queryKey: ["accounts"] });
        }}
      />

      {/* Modal de Detalhes */}
      <ExpenseDetailModal
        isOpen={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        expense={selectedExpense}
        onEdit={handleEditExpense}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <DeleteExpenseDialog
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        expense={expenseToDelete}
        onConfirm={() => {
          if (expenseToDelete) {
            handleDeleteExpense(expenseToDelete.id);
          }
        }}
        isLoading={deleteExpenseMutation.isPending}
      />
    </div>
  );
}
