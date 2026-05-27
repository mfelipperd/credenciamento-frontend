import { useState } from "react";
import { useSearchParams } from "@/hooks/useSearchParams";
import { useExpensesService } from "@/service/expenses.service";
import { useFairService } from "@/service/fair.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUpdateExpense } from "@/hooks/useFinance";
import { toast } from "sonner";
import { Plus, Filter, BarChart3, ChevronDown, Calendar, DollarSign, ListFilter, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpensesTable } from "./components/ExpensesTable";
import { ExpenseForm } from "./components/ExpenseForm";
import { ExpenseFilters } from "./components/ExpenseFilters";
import { ExpensesCharts } from "./components/ExpensesCharts";
import { ExpenseDetailModal } from "./components/ExpenseDetailModal";
import { DeleteExpenseDialog } from "./components/DeleteExpenseDialog";
import { CashFlowModal } from "../Finance/components/CashFlowModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OverheadExpensesTable } from "./components/OverheadExpensesTable";
import { OverheadExpenseForm } from "./components/OverheadExpenseForm";
import type {
  Expense,
  CreateExpenseForm,
  UpdateExpenseForm,
  CreateOverheadExpenseForm,
  UpdateOverheadExpenseForm,
  AllocatedOverheadExpense,
} from "@/interfaces/finance";

export default function ExpensesPage() {
  const [, , fairId] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isOverheadFormOpen, setIsOverheadFormOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isChartsOpen, setIsChartsOpen] = useState(false);
  
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [overheadToDelete, setOverheadToDelete] = useState<AllocatedOverheadExpense | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingOverheadExpense, setEditingOverheadExpense] = useState<AllocatedOverheadExpense | null>(null);
  const [showCashFlowModal, setShowCashFlowModal] = useState(false);

  const expensesService = useExpensesService();
  const fairService = useFairService();
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

  // Query para buscar todas as feiras
  const { data: fairsList } = useQuery({
    queryKey: ["fairs"],
    queryFn: () => fairService.getFairs(),
  });

  // Query para total de despesas
  const { data: totalExpenses } = useQuery({
    queryKey: ["expenses-total", fairId],
    queryFn: () => expensesService.getExpensesTotal(fairId!),
    enabled: !!fairId,
  });

  // Mutation para criar despesa direta
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

  // Mutation para atualizar despesa usando hook centralizado
  const updateExpenseMutation = useUpdateExpense();

  // Mutation para deletar despesa direta
  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => expensesService.deleteExpense(fairId!, id),
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

  // Mutation para criar despesa overhead
  const createOverheadExpenseMutation = useMutation({
    mutationFn: (data: CreateOverheadExpenseForm) =>
      expensesService.createOverheadExpense(data),
    onSuccess: () => {
      toast.success("Despesa overhead criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["expenses", fairId] });
      queryClient.invalidateQueries({ queryKey: ["expenses-total", fairId] });
      setIsOverheadFormOpen(false);
    },
    onError: (error) => {
      console.error("Erro ao criar despesa overhead:", error);
      toast.error("Erro ao criar despesa overhead. Tente novamente.");
    },
  });

  // Mutation para atualizar despesa overhead
  const updateOverheadExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOverheadExpenseForm }) =>
      expensesService.updateOverheadExpense(id, data),
    onSuccess: () => {
      toast.success("Despesa overhead atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["expenses", fairId] });
      queryClient.invalidateQueries({ queryKey: ["expenses-total", fairId] });
      setIsOverheadFormOpen(false);
      setEditingOverheadExpense(null);
    },
    onError: (error) => {
      console.error("Erro ao atualizar despesa overhead:", error);
      toast.error("Erro ao atualizar despesa overhead. Tente novamente.");
    },
  });

  // Mutation para deletar despesa overhead
  const deleteOverheadExpenseMutation = useMutation({
    mutationFn: (id: string) => expensesService.deleteOverheadExpense(id),
    onSuccess: () => {
      toast.success("Despesa overhead removida com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["expenses", fairId] });
      queryClient.invalidateQueries({ queryKey: ["expenses-total", fairId] });
      setOverheadToDelete(null);
    },
    onError: (error) => {
      console.error("Erro ao remover despesa overhead:", error);
      toast.error("Erro ao remover despesa overhead. Tente novamente.");
    },
  });

  // Handlers
  const handleCreateExpense = (data: CreateExpenseForm) => {
    const expenseData = {
      ...data,
      fairId: fairId!,
    };
    createExpenseMutation.mutate(expenseData);
  };

  const handleUpdateExpense = (id: string, data: UpdateExpenseForm) => {
    updateExpenseMutation.mutate({ id, data, fairId: fairId! }, {
      onSuccess: () => {
        setEditingExpense(null);
        setIsFormOpen(false);
      },
    });
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

  const handleCloseOverheadForm = () => {
    setIsOverheadFormOpen(false);
    setEditingOverheadExpense(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (!fairId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-blue">
        <div className="text-center space-y-4">
          <Building className="w-16 h-16 text-white/20 mx-auto animate-pulse" />
          <p className="text-white/60 font-semibold tracking-wide">
            Selecione uma feira para gerenciar despesas
          </p>
        </div>
      </div>
    );
  }

  const directCount = expenses?.directExpenses?.length || 0;
  const overheadCount = expenses?.allocatedOverhead?.length || 0;
  const totalCount = directCount + overheadCount;

  const totalValue = totalExpenses?.totalGeral || 0;
  const averageValue = totalCount > 0 ? totalValue / totalCount : 0;

  return (
    <div className="min-h-screen text-white space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            Custos e Operações
          </p>
          <h1 className="text-4xl font-black text-white tracking-tighter">
            Controle de Despesas
          </h1>
          <p className="text-white/40 text-sm font-medium mt-1">
            Gestão inteligente de custos diretos e rateios overhead compartilhados
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsChartsOpen(!isChartsOpen)}
            className="border-white/10 bg-white/5 backdrop-blur-md text-white/70 rounded-xl px-4 font-bold transition-all hover:bg-white/10 active:scale-95 h-11"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {isChartsOpen ? "Ocultar Gráficos" : "Mostrar Gráficos"}
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="border-white/10 bg-white/5 backdrop-blur-md text-white/70 rounded-xl px-4 font-bold transition-all hover:bg-white/10 active:scale-95 h-11"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-linear-to-br from-[#00aacd] to-[#EB2970] text-white rounded-xl px-6 font-bold shadow-lg shadow-pink-500/20 transition-all hover:scale-105 active:scale-95 h-11 gap-2 border-none">
                <Plus className="w-4 h-4" />
                Nova Despesa
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl text-white">
              <DropdownMenuItem onClick={() => setIsFormOpen(true)} className="cursor-pointer hover:bg-white/10 rounded-lg p-2.5">
                Despesa Direta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsOverheadFormOpen(true)} className="cursor-pointer hover:bg-white/10 rounded-lg p-2.5">
                Despesa Overhead (Rateada)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="glass-card border border-white/5 bg-white/3 backdrop-blur-md rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/5 hover:border-white/10 relative group overflow-hidden"
          onClick={() => setShowCashFlowModal(true)}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.15em] text-white/50">
              Total de Despesas
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <DollarSign className="h-4 w-4 text-red-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-black text-white tracking-tight">
              {formatCurrency(totalValue)}
            </div>
            <div className="text-xs text-white/40 mt-2 font-medium flex items-center gap-2">
              <span>Direto: <strong className="text-white/70">{formatCurrency(totalExpenses?.totalDireto || 0)}</strong></span>
              <span className="text-white/20">|</span>
              <span>Rateado: <strong className="text-white/70">{formatCurrency(totalExpenses?.totalRateado || 0)}</strong></span>
            </div>
            <div className="mt-3 text-[10px] font-bold text-blue-400 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 duration-200">
              Clique para detalhar fluxo de caixa &rarr;
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-white/5 bg-white/3 backdrop-blur-md rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/5 hover:border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.15em] text-white/50">
              Quantidade
            </CardTitle>
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <Calendar className="h-4 w-4 text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-black text-white tracking-tight">
              {totalCount}
            </div>
            <div className="text-xs text-white/40 mt-2 font-medium">
              Diretas: <strong className="text-white/70">{directCount}</strong> | Overhead: <strong className="text-white/70">{overheadCount}</strong>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-white/5 bg-white/3 backdrop-blur-md rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/5 hover:border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.15em] text-white/50">
              Média por Despesa
            </CardTitle>
            <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20">
              <ListFilter className="h-4 w-4 text-pink-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-black text-white tracking-tight">
              {formatCurrency(averageValue)}
            </div>
            <div className="text-xs text-white/40 mt-2 font-medium">
              Custo médio por lançamento
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      {isFiltersOpen && (
        <Card className="glass-card border border-white/5 rounded-2xl p-6 bg-slate-900/40">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-brand-cyan" />
              Filtrar Lançamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ExpenseFilters
              categories={categories || []}
              accounts={accounts || []}
              onApplyFilters={(filters) => {
                console.log("Aplicar filtros:", filters);
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      {isChartsOpen && (
        <Card className="glass-card border border-white/5 rounded-2xl p-6 bg-slate-900/40">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-pink" />
              Análise Dinâmica de Custos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ExpensesCharts fairId={fairId} />
          </CardContent>
        </Card>
      )}

      {/* Abas e Tabelas de Despesas */}
      <Tabs defaultValue="direct" className="space-y-6">
        <TabsList className="bg-white/5 backdrop-blur-md border border-white/10 p-1.5 rounded-xl gap-1 w-fit">
          <TabsTrigger 
            value="direct" 
            className="rounded-lg px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white/60 transition-all duration-200 data-[state=active]:bg-linear-to-br data-[state=active]:from-[#00aacd] data-[state=active]:to-[#EB2970] data-[state=active]:text-white hover:text-white cursor-pointer"
          >
            Despesas Diretas ({directCount})
          </TabsTrigger>
          <TabsTrigger 
            value="overhead" 
            className="rounded-lg px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white/60 transition-all duration-200 data-[state=active]:bg-linear-to-br data-[state=active]:from-[#00aacd] data-[state=active]:to-[#EB2970] data-[state=active]:text-white hover:text-white cursor-pointer"
          >
            Custos Overhead Rateados ({overheadCount})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="direct" className="outline-hidden">
          <Card className="glass-card border border-white/5 rounded-2xl p-6 overflow-hidden">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg font-bold text-white">Lista de Despesas Diretas</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <ExpensesTable
                expenses={expenses?.directExpenses || []}
                isLoading={isLoading}
                onEdit={handleEditExpense}
                onView={handleViewExpense}
                onDelete={(expense) => setExpenseToDelete(expense)}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="overhead" className="outline-hidden">
          <Card className="glass-card border border-white/5 rounded-2xl p-6 overflow-hidden">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg font-bold text-white">Custos Compartilhados (Overhead)</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <OverheadExpensesTable
                expenses={expenses?.allocatedOverhead || []}
                isLoading={isLoading}
                onEdit={(expense) => {
                  setEditingOverheadExpense(expense);
                  setIsOverheadFormOpen(true);
                }}
                onDelete={(expense) => setOverheadToDelete(expense)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Formulário Despesa Direta */}
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
          queryClient.refetchQueries({
            queryKey: ["finance-categories", fairId],
          });
        }}
        onAccountCreated={() => {
          queryClient.refetchQueries({ queryKey: ["accounts"] });
        }}
      />

      {/* Modal de Formulário Despesa Overhead */}
      <OverheadExpenseForm
        isOpen={isOverheadFormOpen}
        onClose={handleCloseOverheadForm}
        onSubmit={(data) => {
          if (editingOverheadExpense) {
            updateOverheadExpenseMutation.mutate({
              id: editingOverheadExpense.id,
              data: data as UpdateOverheadExpenseForm,
            });
          } else {
            createOverheadExpenseMutation.mutate(data as CreateOverheadExpenseForm);
          }
        }}
        expense={editingOverheadExpense}
        accounts={accounts || []}
        fairsList={fairsList || []}
        isLoading={
          createOverheadExpenseMutation.isPending ||
          updateOverheadExpenseMutation.isPending
        }
      />

      {/* Modal de Detalhes despesa direta */}
      <ExpenseDetailModal
        isOpen={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        expense={selectedExpense}
        onEdit={handleEditExpense}
      />

      {/* Dialog de Confirmação de Exclusão Despesa Direta */}
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

      {/* Dialog de Confirmação de Exclusão Despesa Overhead */}
      <DeleteExpenseDialog
        isOpen={!!overheadToDelete}
        onClose={() => setOverheadToDelete(null)}
        expense={
          overheadToDelete
            ? {
                id: overheadToDelete.id,
                fairId: fairId || "",
                categoryId: "",
                accountId: "",
                descricao: overheadToDelete.descricao || "Sem descrição",
                valor: overheadToDelete.valorTotal,
                data: overheadToDelete.data,
                category: {
                  id: "",
                  name: overheadToDelete.categoria || "N/A",
                  global: true,
                  createdAt: "",
                  updatedAt: "",
                },
                createdAt: "",
                updatedAt: "",
              }
            : null
        }
        onConfirm={() => {
          if (overheadToDelete) {
            deleteOverheadExpenseMutation.mutate(overheadToDelete.id);
          }
        }}
        isLoading={deleteOverheadExpenseMutation.isPending}
      />

      {/* Modal de fluxo de caixa */}
      {fairId && (
        <CashFlowModal
          isOpen={showCashFlowModal}
          onClose={() => setShowCashFlowModal(false)}
          fairId={fairId}
        />
      )}
    </div>
  );
}
