import { useState } from "react";
import {
  X,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Target,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCashFlowAnalysis } from "@/hooks/useFinance";
import type { CashFlowAnalysis } from "@/interfaces/finance";

interface CashFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  fairId: string;
}

export function CashFlowModal({ isOpen, onClose, fairId }: CashFlowModalProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    data: cashFlowData,
    isLoading,
    error,
    refetch,
  } = useCashFlowAnalysis(fairId);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "excellent":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "good":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "average":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "poor":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getPerformanceLabel = (performance: string) => {
    switch (performance) {
      case "excellent":
        return "Excelente";
      case "good":
        return "Boa";
      case "average":
        return "Média";
      case "poor":
        return "Ruim";
      default:
        return "N/A";
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Análise de Fluxo de Caixa
                  </DialogTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Carregando dados...
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Erro ao carregar dados
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Não foi possível carregar os dados do fluxo de caixa.
            </p>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Tentar novamente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!cashFlowData) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl w-[98vw] max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Análise de Fluxo de Caixa
                </DialogTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Performance financeira da feira
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* Resumo Principal */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Resumo Executivo
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {cashFlowData.summary}
                </p>
              </div>
              <div className="text-center lg:text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Performance</p>
                <Badge className={`text-sm ${getPerformanceColor(cashFlowData.performance)}`}>
                  {getPerformanceLabel(cashFlowData.performance)}
                </Badge>
              </div>
              <div className="text-center lg:text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                <div className="flex items-center justify-center lg:justify-end gap-1">
                  {cashFlowData.isProfitable ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    cashFlowData.isProfitable ? "text-green-600" : "text-red-600"
                  }`}>
                    {cashFlowData.isProfitable ? "Lucrativo" : "Prejuízo"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Receitas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(cashFlowData.totalRevenue)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Quantidade</p>
                    <p className="font-medium">{cashFlowData.revenueCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Média</p>
                    <p className="font-medium">{formatCurrency(cashFlowData.averageRevenue)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Maior Receita</p>
                  <p className="font-medium text-green-600 dark:text-green-400">
                    {formatCurrency(cashFlowData.largestRevenue)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  Despesas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(cashFlowData.totalExpenses)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Quantidade</p>
                    <p className="font-medium">{cashFlowData.expenseCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Média</p>
                    <p className="font-medium">{formatCurrency(cashFlowData.averageExpense)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Maior Despesa</p>
                  <p className="font-medium text-red-600 dark:text-red-400">
                    {formatCurrency(cashFlowData.largestExpense)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Resultado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Lucro Líquido</p>
                  <p className={`text-2xl font-bold ${
                    cashFlowData.netProfit >= 0 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {formatCurrency(cashFlowData.netProfit)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Margem de Lucro</p>
                  <p className={`text-xl font-bold ${
                    cashFlowData.profitMargin >= 0 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {formatPercentage(cashFlowData.profitMargin)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recomendações */}
          {cashFlowData.recommendations.length > 0 && (
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {cashFlowData.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {recommendation}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
