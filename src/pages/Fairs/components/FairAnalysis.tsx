import { useState } from "react";
import { useFairAnalysis, useOptimizePricing } from "@/hooks/useFairs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Target,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calculator
} from "lucide-react";

interface FairAnalysisProps {
  fairId: string;
}

export function FairAnalysis({ fairId }: FairAnalysisProps) {
  const [targetMargin, setTargetMargin] = useState(60);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const { data: analysis, isLoading, error, refetch } = useFairAnalysis(fairId);
  const optimizePricingMutation = useOptimizePricing();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'highly_recommended':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-700';
      case 'recommended':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-700';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700';
      case 'not_recommended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'highly_recommended':
        return 'Altamente Recomendado';
      case 'recommended':
        return 'Recomendado';
      case 'moderate':
        return 'Moderado';
      case 'not_recommended':
        return 'Não Recomendado';
      default:
        return 'Indefinido';
    }
  };

  const handleOptimizePricing = async () => {
    setIsOptimizing(true);
    try {
      await optimizePricingMutation.mutateAsync({ fairId, targetMargin });
    } catch (error) {
      console.error('Erro ao otimizar precificação:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-500 mb-4">
          <AlertCircle className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Erro ao carregar análise
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Não foi possível carregar os dados da análise da feira.
        </p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-400 mb-4">
          <BarChart3 className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Nenhuma análise disponível
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Configure stands para gerar análises da feira.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Otimização */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Análise de Margem de Lucro
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Análise detalhada da lucratividade e eficiência dos stands
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Label htmlFor="targetMargin" className="text-sm font-medium">
              Margem Alvo:
            </Label>
            <Input
              id="targetMargin"
              type="number"
              value={targetMargin}
              onChange={(e) => setTargetMargin(Number(e.target.value))}
              className="w-20"
              min="0"
              max="100"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
          <Button
            onClick={handleOptimizePricing}
            disabled={isOptimizing || optimizePricingMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isOptimizing || optimizePricingMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4 mr-2" />
            )}
            Otimizar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {formatCurrency(analysis.totalRevenue)}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {analysis.totalStands} stands
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
              Custos Totais
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800 dark:text-red-200">
              {formatCurrency(analysis.totalCosts)}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">
              Custo de montagem
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Lucro Total
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
              {formatCurrency(analysis.totalProfit)}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              Lucro líquido
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Margem de Lucro
            </CardTitle>
            <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {formatPercentage(analysis.profitMargin)}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Margem média
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Eficiência dos Stands */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Análise de Eficiência por Stand
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.standConfigurations.map((stand, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg ${getRecommendationColor(stand.recommendation)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {stand.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stand.dimensions} • {stand.area}m² • {stand.quantity} unidades
                    </p>
                  </div>
                  <Badge className={getRecommendationColor(stand.recommendation)}>
                    {getRecommendationText(stand.recommendation)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(stand.totalPrice)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Preço Total
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(stand.totalCost)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Custo Total
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(stand.profitPerStand)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Lucro/Stand
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatPercentage(stand.profitMargin)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Margem
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Eficiência: {formatCurrency(stand.efficiency)}/m²
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total: {formatCurrency(stand.totalRevenue)} receita
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights e Recomendações */}
      {analysis.insights && analysis.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              Insights de Negócio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.insights.map((insight, index) => (
              <div
                key={index}
                className="p-4 border-l-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 rounded-r-lg"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {insight.title}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {insight.impact === 'high' ? 'Alto' : 
                         insight.impact === 'medium' ? 'Médio' : 'Baixo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {insight.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {insight.action}
                      </p>
                      {insight.potentialIncrease > 0 && (
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">
                            +{insight.potentialIncrease}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recomendações Gerais */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Recomendações Estratégicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {recommendation}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
