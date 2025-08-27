import { useQuery } from "@tanstack/react-query";
import { useExpensesService } from "@/service/expenses.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, BarChart3, TrendingUp, DollarSign } from "lucide-react";
import type { ExpenseTotalByCategory } from "@/interfaces/finance";

interface ExpensesChartsProps {
  fairId: string;
}

export function ExpensesCharts({ fairId }: ExpensesChartsProps) {
  const expensesService = useExpensesService();

  // Query para buscar totais por categoria
  const { data: totalsByCategory, isLoading: loadingCategories } = useQuery({
    queryKey: ["expenses-total-by-category", fairId],
    queryFn: () => expensesService.getExpensesTotalByCategory(fairId),
    enabled: !!fairId,
  });

  // Query para buscar totais por conta
  const { data: totalsByAccount, isLoading: loadingAccounts } = useQuery({
    queryKey: ["expenses-total-by-account", fairId],
    queryFn: () => expensesService.getExpensesTotalByAccount(fairId),
    enabled: !!fairId,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getTotalExpenses = (data: ExpenseTotalByCategory[] | undefined) => {
    if (!data) return 0;
    return data.reduce((total, item) => total + item.total, 0);
  };

  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return parseFloat(((value / total) * 100).toFixed(1));
  };

  const getRandomColor = (index: number) => {
    const colors = [
      "#3B82F6", // Azul
      "#EF4444", // Vermelho
      "#10B981", // Verde
      "#F59E0B", // Amarelo
      "#8B5CF6", // Roxo
      "#06B6D4", // Ciano
      "#84CC16", // Verde lima
      "#F97316", // Laranja
      "#EC4899", // Rosa
      "#6366F1", // Índigo
    ];
    return colors[index % colors.length];
  };

  if (loadingCategories || loadingAccounts) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalExpenses = getTotalExpenses(totalsByCategory);

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Total de Despesas
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Categorias
            </CardTitle>
            <PieChart className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalsByCategory?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Contas Utilizadas
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalsByAccount?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Despesas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalsByCategory && totalsByCategory.length > 0 ? (
              <div className="space-y-4">
                {/* Gráfico de pizza visual */}
                <div className="flex items-center justify-center h-32">
                  <div className="relative w-24 h-24">
                    {totalsByCategory.map((item, index) => {
                      const percentage = getPercentage(
                        item.total,
                        totalExpenses || 0
                      );
                      const rotation = totalsByCategory
                        .slice(0, index)
                        .reduce(
                          (acc, prevItem) =>
                            acc + (prevItem.total / totalExpenses) * 360,
                          0
                        );

                      return (
                        <div
                          key={item.categoryId}
                          className="absolute inset-0 rounded-full border-4 border-transparent"
                          style={{
                            borderColor: getRandomColor(index),
                            transform: `rotate(${rotation}deg)`,
                            clipPath: `polygon(50% 50%, 50% 0%, ${
                              50 + (percentage / 100) * 50
                            }% 0%, ${50 + (percentage / 100) * 50}% 50%)`,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Legenda */}
                <div className="space-y-2">
                  {totalsByCategory.map((item, index) => (
                    <div
                      key={item.categoryId}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getRandomColor(index) }}
                        />
                        <span className="text-sm text-gray-800 dark:text-gray-100 font-medium">
                          {item.categoryName}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.total)}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                          {getPercentage(item.total, totalExpenses || 0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600 dark:text-gray-300">
                Nenhuma despesa encontrada para gerar gráficos
              </div>
            )}
          </CardContent>
        </Card>

        {/* Despesas por Conta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Despesas por Conta Bancária
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalsByAccount && totalsByAccount.length > 0 ? (
              <div className="space-y-4">
                {/* Gráfico de barras visual */}
                <div className="space-y-3">
                  {totalsByAccount.map((item, index) => {
                    const percentage = getPercentage(
                      item.total,
                      totalExpenses || 0
                    );
                    return (
                      <div key={item.accountId} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-800 dark:text-gray-100 truncate max-w-[120px] font-medium">
                            {item.accountName}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(item.total)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: getRandomColor(index),
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 text-right">
                          {percentage}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600 dark:text-gray-300">
                Nenhuma conta encontrada para gerar gráficos
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Adicionais */}
      {totalsByCategory && totalsByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Estatísticas Detalhadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(
                    Math.max(...totalsByCategory.map((item) => item.total))
                  )}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  Maior Despesa por Categoria
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(
                    Math.min(...totalsByCategory.map((item) => item.total))
                  )}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  Menor Despesa por Categoria
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(
                    totalExpenses / (totalsByCategory.length || 1)
                  )}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  Média por Categoria
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
