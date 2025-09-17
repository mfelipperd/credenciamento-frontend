import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  TrendingUp,
  DollarSign,
  Percent,
} from "lucide-react";
import type { FairStats as FairStatsType } from "@/interfaces/fairs";

interface FairStatsProps {
  stats: FairStatsType | undefined;
  isLoading: boolean;
}

export const FairStats: React.FC<FairStatsProps> = ({ stats, isLoading }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Não foi possível carregar as estatísticas
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total de Feiras */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Total de Feiras
          </CardTitle>
          <Building2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalFairs}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Feiras cadastradas
          </p>
        </CardContent>
      </Card>

      {/* Feiras Ativas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Feiras Ativas
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.activeFairs}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.totalFairs > 0 
              ? `${((stats.activeFairs / stats.totalFairs) * 100).toFixed(1)}% do total`
              : "0% do total"
            }
          </p>
        </CardContent>
      </Card>

      {/* Receita Total Esperada */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Receita Esperada
          </CardTitle>
          <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatCurrency(stats.totalExpectedRevenue)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Soma de todas as feiras
          </p>
        </CardContent>
      </Card>

      {/* Lucro Total Esperado */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Lucro Esperado
          </CardTitle>
          <Percent className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(stats.totalExpectedProfit)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Margem média: {stats.averageProfitMargin.toFixed(1)}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
