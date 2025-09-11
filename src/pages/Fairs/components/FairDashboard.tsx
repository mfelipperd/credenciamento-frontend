import { useFairAnalysis, useStandStatistics } from "@/hooks/useFairs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Target,
  AlertCircle,
  CheckCircle,
  Info,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface FairDashboardProps {
  fairId: string;
}

export function FairDashboard({ fairId }: FairDashboardProps) {
  const { data: analysis, isLoading: isLoadingAnalysis, error: analysisError } = useFairAnalysis(fairId);
  const { data: statistics, isLoading: isLoadingStats } = useStandStatistics(fairId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'profit_optimization':
        return <TrendingUp className="h-5 w-5" />;
      case 'stand_efficiency':
        return <BarChart3 className="h-5 w-5" />;
      case 'pricing_strategy':
        return <DollarSign className="h-5 w-5" />;
      case 'market_analysis':
        return <Target className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getInsightColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      case 'low':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20';
    }
  };

  const getInsightIconColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (isLoadingAnalysis || isLoadingStats) {
    return (
      <div className="space-y-6">
        {/* KPIs Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-16 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Insights Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (analysisError) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-500 mb-4">
          <AlertCircle className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Erro ao carregar análise
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Não foi possível carregar os dados da análise da feira.
        </p>
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
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total de Stands
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {analysis.totalStands}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {analysis.totalArea}m² de área total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
              {formatCurrency(analysis.totalRevenue)}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              Receita esperada
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Lucro Total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {formatCurrency(analysis.totalProfit)}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Lucro líquido
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Margem de Lucro
            </CardTitle>
            <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
              {formatPercentage(analysis.profitMargin)}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Margem média
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas de Stands */}
      {statistics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Estatísticas dos Stands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.totalConfigurations}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Configurações
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.averagePricePerSquareMeter.toFixed(0)}/m²
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Preço Médio
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPercentage(statistics.averageProfitMargin)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Margem Média
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights e Recomendações */}
      {analysis.insights && analysis.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              Insights e Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 border-l-4 rounded-r-lg ${getInsightColor(insight.impact)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 ${getInsightIconColor(insight.impact)}`}>
                    {getInsightIcon(insight.type)}
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
              Recomendações Gerais
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
