import { useQuery } from "@tanstack/react-query";
import { useRevenueStats } from "@/hooks/useFinance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Receipt, TrendingUp } from "lucide-react";

interface RevenueStatsProps {
  fairId: string;
}

export function RevenueStats({ fairId }: RevenueStatsProps) {
  const { data: stats, isLoading } = useRevenueStats(fairId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total de Receitas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Total de Receitas
          </CardTitle>
          <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(stats.totalValue)}
          </div>
        </CardContent>
      </Card>

      {/* Quantidade de Receitas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Quantidade de Receitas
          </CardTitle>
          <Receipt className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalRevenues}
          </div>
        </CardContent>
      </Card>

      {/* Média por Receita */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Média por Receita
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatCurrency(stats.averagePerRevenue)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
