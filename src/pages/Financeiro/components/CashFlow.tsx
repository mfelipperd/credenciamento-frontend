import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useFinanceService } from "@/service/finance.service";
import { useExpensesService } from "@/service/expenses.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard
} from "lucide-react";

interface CashFlowData {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  receitasPorPeriodo: Array<{ periodo: string; valor: number }>;
  despesasPorPeriodo: Array<{ periodo: string; valor: number }>;
}

export function CashFlow() {
  const [searchParams] = useSearchParams();
  const fairId = searchParams.get("fairId") || "";
  
  const financeService = useFinanceService();
  const expensesService = useExpensesService();

  // Query para receitas
  const { data: revenuesData, isLoading: isLoadingRevenues } = useQuery({
    queryKey: ["finance-revenues-cashflow", fairId],
    queryFn: () => financeService.getRevenues({ 
      fairId: fairId || "", 
      page: 1, 
      pageSize: 1000 
    }),
    enabled: !!fairId,
  });

  // Query para despesas
  const { data: expensesData, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ["expenses-cashflow", fairId],
    queryFn: () => expensesService.getExpenses({ fairId: fairId! }),
    enabled: !!fairId,
  });

  // Query para total de despesas
  const { data: totalExpenses } = useQuery({
    queryKey: ["expenses-total-cashflow", fairId],
    queryFn: () => expensesService.getExpensesTotal(fairId!),
    enabled: !!fairId,
  });

  const isLoading = isLoadingRevenues || isLoadingExpenses;

  // Calcular dados do fluxo de caixa
  const cashFlowData: CashFlowData = {
    totalReceitas: revenuesData?.data?.reduce((sum: number, revenue: any) => 
      sum + (revenue.amount || 0), 0) || 0,
    totalDespesas: totalExpenses?.total || 0,
    saldo: 0,
    receitasPorPeriodo: [],
    despesasPorPeriodo: []
  };

  cashFlowData.saldo = cashFlowData.totalReceitas - cashFlowData.totalDespesas;

  // Agrupar receitas por mês
  const receitasPorMes = revenuesData?.data?.reduce((acc: any, revenue: any) => {
    const month = new Date(revenue.createdAt).toLocaleDateString('pt-BR', { 
      month: 'short', 
      year: 'numeric' 
    });
    acc[month] = (acc[month] || 0) + (revenue.amount || 0);
    return acc;
  }, {}) || {};

  // Agrupar despesas por mês
  const despesasPorMes = expensesData?.reduce((acc: any, expense: any) => {
    const month = new Date(expense.createdAt).toLocaleDateString('pt-BR', { 
      month: 'short', 
      year: 'numeric' 
    });
    acc[month] = (acc[month] || 0) + (expense.amount || 0);
    return acc;
  }, {}) || {};

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Total Receitas
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(cashFlowData.totalReceitas)}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Entradas de caixa
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
              Total Despesas
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(cashFlowData.totalDespesas)}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              <TrendingDown className="h-3 w-3 inline mr-1" />
              Saídas de caixa
            </p>
          </CardContent>
        </Card>

        <Card className={`${cashFlowData.saldo >= 0 
          ? 'border-blue-200 dark:border-blue-800' 
          : 'border-orange-200 dark:border-orange-800'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${
              cashFlowData.saldo >= 0 
                ? 'text-blue-700 dark:text-blue-300' 
                : 'text-orange-700 dark:text-orange-300'
            }`}>
              Saldo Líquido
            </CardTitle>
            <DollarSign className={`h-4 w-4 ${
              cashFlowData.saldo >= 0 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-orange-600 dark:text-orange-400'
            }`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              cashFlowData.saldo >= 0 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-orange-600 dark:text-orange-400'
            }`}>
              {formatCurrency(cashFlowData.saldo)}
            </div>
            <p className={`text-xs mt-1 ${
              cashFlowData.saldo >= 0 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-orange-600 dark:text-orange-400'
            }`}>
              {cashFlowData.saldo >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  Superávit
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 inline mr-1" />
                  Déficit
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo por Período */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Receitas por Período
            </CardTitle>
            <CardDescription>
              Distribuição das receitas ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(receitasPorMes).length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhuma receita encontrada
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(receitasPorMes).map(([periodo, valor]) => (
                  <div key={periodo} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{periodo}</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(valor as number)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-red-600" />
              Despesas por Período
            </CardTitle>
            <CardDescription>
              Distribuição das despesas ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(despesasPorMes).length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhuma despesa encontrada
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(despesasPorMes).map(([periodo, valor]) => (
                  <div key={periodo} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{periodo}</span>
                    <span className="text-sm font-bold text-red-600">
                      {formatCurrency(valor as number)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso rápido às principais funcionalidades financeiras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set("tab", "receitas");
                window.location.href = `?${newSearchParams.toString()}`;
              }}
            >
              <DollarSign className="h-4 w-4" />
              Ver Receitas Detalhadas
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set("tab", "despesas");
                window.location.href = `?${newSearchParams.toString()}`;
              }}
            >
              <CreditCard className="h-4 w-4" />
              Ver Despesas Detalhadas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
