import { useState } from "react";
import { useSearchParams } from "@/hooks/useSearchParams";
import { useExpensesService } from "@/service/expenses.service";
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

  const expensesService = useExpensesService();
  const queryClient = useQueryClient();

  // Query para buscar despesas
  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses", fairId],
    queryFn: () => expensesService.getExpenses({ fairId: fairId! }),
    enabled: !!fairId,
  });

  // Query para buscar categorias da feira
  const { data: categories } = useQuery({
    queryKey: ["finance-categories", fairId],
    queryFn: () => expensesService.getFinanceCategoriesByFair(fairId!),
    enabled: !!fairId,
  });

  // Query para buscar contas
  const { data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => expensesService.getAccounts(),
  });

  // Query para total de despesas
  const { data: totalExpenses } = useQuery({
    queryKey: ["expenses-total", fairId],
    queryFn: () => expensesService.getExpensesTotal(fairId!),
    enabled: !!fairId,
  });

  // Mutation para criar despesa
  const createExpenseMutation = useMutation({
    mutationFn: (data: CreateExpenseForm) =>
      expensesService.createExpense(fairId!, data),
    onSuccess: () => {
      toast.success("Despesa criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["expenses", fairId] });
      queryClient.invalidateQueries({ queryKey: ["expenses-total", fairId] });
      setIsFormOpen(false);
    },
    onError: (error) => {
      console.error("Erro ao criar despesa:", error);
      toast.error("Erro ao criar despesa. Tente novamente.");
    },
  });

  // Mutation para atualizar despesa
  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseForm }) =>
      expensesService.updateExpense(id, data, fairId),
    onSuccess: () => {
      toast.success("Despesa atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["expenses", fairId] });
      queryClient.invalidateQueries({ queryKey: ["expenses-total", fairId] });
      setEditingExpense(null);
      setIsFormOpen(false);
    },
    onError: (error) => {
      console.error("Erro ao atualizar despesa:", error);
      toast.error("Erro ao atualizar despesa. Tente novamente.");
    },
  });

  // Mutation para deletar despesa
  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => expensesService.deleteExpense(id, fairId!),
    onSuccess: () => {
      toast.success("Despesa removida com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["expenses", fairId] });
      queryClient.invalidateQueries({ queryKey: ["expenses-total", fairId] });
      setExpenseToDelete(null);
    },
    onError: (error) => {
      console.error("Erro ao remover despesa:", error);
      toast.error("Erro ao remover despesa. Tente novamente.");
    },
  });

  // Handlers
  const handleCreateExpense = (data: CreateExpenseForm) => {
    // Incluir fairId nos dados da despesa
    const expenseData = {
      ...data,
      fairId: fairId!,
    };
    createExpenseMutation.mutate(expenseData);
  };

  const handleUpdateExpense = (id: string, data: UpdateExpenseForm) => {
    updateExpenseMutation.mutate({ id, data });
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpenseMutation.mutate(id);
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
            className="flex items-center gap-2"
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
            handleUpdateExpense(editingExpense.id, data as UpdateExpenseForm);
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
          queryClient.refetchQueries({
            queryKey: ["finance-categories", fairId],
          });
        }}
        onAccountCreated={() => {
          // Recarregar contas quando uma nova for criada
          queryClient.refetchQueries({ queryKey: ["accounts"] });
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
