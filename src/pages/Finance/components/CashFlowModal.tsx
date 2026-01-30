import { useState } from "react";
import {
  X,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  CheckCircle,
  BarChart3,
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

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
      return "R$ 0,00";
    }
    
    // Se o valor for muito grande (possivelmente em centavos), dividir por 100
    let formattedValue = value;
    if (Math.abs(value) > 1000000) {
      formattedValue = value / 100;
    }
    
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(formattedValue);
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
      return "0.00%";
    }
    return `${value.toFixed(2)}%`;
  };

  const getPerformanceColor = (performance: string | null) => {
    if (!performance) {
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
    
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

  const getPerformanceLabel = (performance: string | null) => {
    if (!performance) {
      return "N/A";
    }
    
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
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 border-none bg-slate-950">
          {/* Premium Header */}
          <div className="relative h-32 w-full flex items-end p-6 bg-linear-to-br from-[#00aacd] to-[#EB2970] overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
            
            <div className="relative z-10 w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                    Análise Financeira
                  </p>
                  <DialogTitle className="text-2xl font-black text-white tracking-tighter">
                    Fluxo de Caixa
                  </DialogTitle>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="text-white/60 hover:text-white hover:bg-white/10 rounded-full h-10 w-10"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6 bg-slate-950">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-3xl p-6 space-y-4">
                  <Skeleton className="h-6 w-32 bg-white/10" />
                  <Skeleton className="h-8 w-24 bg-white/10" />
                </div>
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
      <DialogContent className="max-w-[95vw] w-[95vw] min-w-[70vw] max-h-[95vh] overflow-y-auto p-0 border-none bg-slate-950">
          {/* Premium Header */}
          <div className="relative h-32 w-full flex items-end p-6 bg-linear-to-br from-[#00aacd] to-[#EB2970] overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
            
            <div className="relative z-10 w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                    Análise Financeira
                  </p>
                  <DialogTitle className="text-2xl font-black text-white tracking-tighter">
                    Fluxo de Caixa
                  </DialogTitle>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="text-white/60 hover:text-white hover:bg-white/10 rounded-full h-10 w-10"
                >
                  <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="text-white/60 hover:text-white hover:bg-white/10 rounded-full h-10 w-10"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>

        <div className="p-8 space-y-8 bg-slate-950">
          {/* Resumo Principal */}
          <div className="glass-card rounded-[32px] p-8 border border-white/10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-2">
                <h3 className="text-xl font-black text-white mb-4 tracking-tight">
                  Resumo Executivo
                </h3>
                <p className="text-slate-300 text-base leading-relaxed wrap-break-word">
                  {cashFlowData.summary || "Nenhum resumo disponível"}
                </p>
              </div>
              <div className="text-center lg:text-right">
                <p className="text-sm text-slate-400 mb-2 font-bold uppercase tracking-wider">Performance</p>
                <Badge className={`text-sm font-bold ${getPerformanceColor(cashFlowData.performance)}`}>
                  {getPerformanceLabel(cashFlowData.performance)}
                </Badge>
              </div>
              <div className="text-center lg:text-right">
                <p className="text-sm text-slate-400 mb-2 font-bold uppercase tracking-wider">Status</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="border-l-4 border-l-green-500 min-h-[300px]">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  Receitas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 break-words">
                    {formatCurrency(cashFlowData.totalRevenue)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Quantidade</p>
                    <p className="text-lg font-semibold">{cashFlowData.revenueCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Média</p>
                    <p className="text-lg font-semibold">{formatCurrency(cashFlowData.averageRevenue)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Maior Receita</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400 break-words">
                    {formatCurrency(cashFlowData.largestRevenue)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 min-h-[300px]">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                  Despesas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400 break-words">
                    {formatCurrency(cashFlowData.totalExpenses)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Quantidade</p>
                    <p className="text-lg font-semibold">{cashFlowData.expenseCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Média</p>
                    <p className="text-lg font-semibold">{formatCurrency(cashFlowData.averageExpense)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Maior Despesa</p>
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400 break-words">
                    {formatCurrency(cashFlowData.largestExpense)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 min-h-[300px]">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                  Resultado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Lucro Líquido</p>
                  <p className={`text-3xl font-bold break-words ${
                    (cashFlowData.netProfit || 0) >= 0 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {formatCurrency(cashFlowData.netProfit)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Margem de Lucro</p>
                  <p className={`text-2xl font-bold ${
                    (cashFlowData.profitMargin || 0) >= 0 
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
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {cashFlowData.recommendations.map((recommendation: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 shrink-0" />
                      <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed break-words">
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
