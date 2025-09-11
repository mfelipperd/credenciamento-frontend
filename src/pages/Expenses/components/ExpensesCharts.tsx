import { useQuery } from "@tanstack/react-query";
import { useExpensesService } from "@/service/expenses.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, TrendingUp, DollarSign, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { ExpenseTotalByCategory, Expense } from "@/interfaces/finance";

interface ExpensesChartsProps {
  fairId: string;
}

export function ExpensesCharts({ fairId }: ExpensesChartsProps) {
  const expensesService = useExpensesService();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Query para buscar totais por categoria
  const { data: totalsByCategory, isLoading: loadingCategories } = useQuery({
    queryKey: ["expenses-total-by-category", fairId],
    queryFn: () => expensesService.getExpensesTotalByCategory(fairId),
    enabled: !!fairId,
  });


  // Query para buscar despesas individuais
  const { data: expenses } = useQuery({
    queryKey: ["expenses-list", fairId],
    queryFn: () => expensesService.getExpenses({ fairId, page: 1, pageSize: 1000 }),
    enabled: !!fairId,
  });

  const formatCurrency = (value: number | string) => {
    // Converter string para número
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (!isFinite(numValue)) return "R$ 0,00";
    
    // Se o valor for muito grande (possivelmente em centavos), dividir por 100
    let formattedValue = numValue;
    if (Math.abs(numValue) > 1000000) {
      formattedValue = numValue / 100;
    }
    
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(formattedValue);
  };

  const getTotalExpenses = (data: ExpenseTotalByCategory[] | undefined) => {
    if (!data || !Array.isArray(data)) return 0;
    
    const total = data.reduce((sum, item) => {
      // Converter string para número
      let value = typeof item.total === 'string' ? parseFloat(item.total) : (item.total || 0);
      
      // Se o valor for muito grande (possivelmente em centavos), dividir por 100
      if (Math.abs(value) > 1000000) {
        value = value / 100;
      }
      
      if (!isFinite(value)) return sum;
      return sum + value;
    }, 0);
    
    console.log('Calculated total:', total, 'from data:', data);
    return isFinite(total) ? total : 0;
  };

  const getPercentage = (value: number | string, total: number | string) => {
    // Converter strings para números
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const numTotal = typeof total === 'string' ? parseFloat(total) : total;
    
    if (numTotal === 0 || !isFinite(numTotal) || !isFinite(numValue)) return 0;
    if (numValue === 0) return 0;
    
    // Aplicar a mesma lógica de conversão de centavos
    let adjustedValue = numValue;
    let adjustedTotal = numTotal;
    
    if (Math.abs(numValue) > 1000000) {
      adjustedValue = numValue / 100;
    }
    if (Math.abs(numTotal) > 1000000) {
      adjustedTotal = numTotal / 100;
    }
    
    const percentage = (adjustedValue / adjustedTotal) * 100;
    if (!isFinite(percentage)) return 0;
    
    return parseFloat(percentage.toFixed(1));
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

  const getColorForGradient = (index: number) => {
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

  // Agrupar despesas por categoria
  const getExpensesByCategory = () => {
    if (!expenses) return {};
    
    return expenses.reduce((acc: Record<string, Expense[]>, expense) => {
      const categoryId = expense.categoryId;
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(expense);
      return acc;
    }, {});
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Função para obter o nome da categoria
  const getCategoryName = (categoryId: string, fallbackName?: string) => {
    if (fallbackName) return fallbackName;
    
    // Tentar buscar o nome da categoria a partir das despesas
    const expensesByCategory = getExpensesByCategory();
    const categoryExpenses = expensesByCategory[categoryId] || [];
    if (categoryExpenses.length > 0 && categoryExpenses[0].category?.name) {
      return categoryExpenses[0].category.name;
    }
    
    return `Categoria ${categoryId.slice(0, 8)}`;
  };

  if (loadingCategories) {
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

  // Debug logs
  console.log('totalsByCategory:', totalsByCategory);
  console.log('totalExpenses:', totalExpenses);
  
  if (totalsByCategory && totalsByCategory.length > 0) {
    console.log('First category item:', totalsByCategory[0]);
    console.log('First category total:', totalsByCategory[0].total);
    console.log('Percentage calculation:', getPercentage(totalsByCategory[0].total, totalExpenses));
  }

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6">
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

                {/* Legenda com itens expandíveis */}
                <div className="space-y-3">
                  {totalsByCategory.map((item, index) => {
                    const expensesByCategory = getExpensesByCategory();
                    const categoryExpenses = expensesByCategory[item.categoryId] || [];
                    const isExpanded = expandedCategories.has(item.categoryId);
                    
                    const percentage = getPercentage(item.total, totalExpenses || 0);
                    const color = getColorForGradient(index);
                    
                    return (
                      <div 
                        key={item.categoryId} 
                        className="border rounded-lg p-3 relative overflow-hidden backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                        style={{
                          background: `linear-gradient(90deg, ${color}15 0%, ${color}15 ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.05) 100%)`,
                          borderColor: `${color}30`,
                          boxShadow: `0 4px 6px -1px ${color}10, 0 2px 4px -1px ${color}05`
                        }}
                        onClick={() => toggleCategory(item.categoryId)}
                      >
                        <div
                          className="flex items-center justify-between relative z-10"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getRandomColor(index) }}
                            />
                            <span className="text-sm text-gray-800 dark:text-gray-100 font-medium">
                              {getCategoryName(item.categoryId, item.categoryName)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({categoryExpenses.length} itens)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {formatCurrency(item.total)}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-300">
                                {getPercentage(item.total, totalExpenses || 0)}%
                              </div>
                            </div>
                            {isExpanded ? (
                              <EyeOff className="w-4 h-4 text-gray-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                        
                        {/* Itens da categoria */}
                        {isExpanded && categoryExpenses.length > 0 && (
                          <div className="mt-3 space-y-2 border-t pt-3">
                            {categoryExpenses
                              .sort((a, b) => b.valor - a.valor) // Ordenar por valor decrescente
                              .map((expense) => {
                                const expensePercentage = getPercentage(expense.valor, item.total);
                                return (
                                  <div
                                    key={expense.id}
                                    className="flex items-center justify-between text-xs bg-white dark:bg-gray-700 rounded p-2 relative overflow-hidden"
                                  >
                                    {/* Barra de progresso de fundo */}
                                    <div 
                                      className="absolute inset-0 rounded"
                                      style={{
                                        background: `linear-gradient(90deg, ${color}10 0%, ${color}10 ${expensePercentage}%, transparent ${expensePercentage}%)`
                                      }}
                                    />
                                    
                                    <div className="flex-1 min-w-0 relative z-10">
                                      <div className="font-medium text-gray-900 dark:text-white truncate">
                                        {expense.descricao}
                                      </div>
                                      <div className="text-gray-500 dark:text-gray-400">
                                        {new Date(expense.data).toLocaleDateString('pt-BR')}
                                      </div>
                                    </div>
                                    <div className="text-right ml-2 relative z-10">
                                      <div className="font-medium text-gray-900 dark:text-white">
                                        {formatCurrency(expense.valor)}
                                      </div>
                                      <div className="text-xs font-semibold" style={{ color: color }}>
                                        {expensePercentage}% da categoria
                                      </div>
                                      {expense.observacoes && (
                                        <div className="text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                                          {expense.observacoes}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600 dark:text-gray-300">
                Nenhuma despesa encontrada para gerar gráficos
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
