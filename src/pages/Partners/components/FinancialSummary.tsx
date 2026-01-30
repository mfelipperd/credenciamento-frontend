import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Wallet, Percent, Clock } from "lucide-react";
import { usePartnerFinancialSummary } from "@/hooks/usePartners";
import { useCashFlowAnalysis } from "@/hooks/useFinance";
import type { FairEarning } from "@/interfaces/withdrawals";

interface FinancialSummaryProps {
  partnerId: string;
  fairId: string;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({ partnerId, fairId }) => {
  const { data: summary, isLoading, error } = usePartnerFinancialSummary(partnerId, fairId);
  const { data: cashFlowData } = useCashFlowAnalysis(fairId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Erro ao carregar resumo financeiro</p>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  // Calcular lucro da feira específica usando dados do cash flow
  const currentFairProfit = cashFlowData?.netProfit || 0;
  
  // Calcular porcentagem do sócio na feira atual
  const currentFairEarning = summary.fairEarnings?.find((fair: FairEarning) => fair.fairId === fairId);
  const currentFairPercentage = currentFairEarning ? parseFloat(currentFairEarning.percentage) : 0;

  const cards = [
    {
      title: "Lucro da Feira Atual",
      value: formatCurrency(currentFairProfit),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Sua Participação",
      value: formatCurrency(summary.totalEarnings),
      subtitle: `${currentFairPercentage.toFixed(1)}% desta feira`,
      icon: Percent,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Valor Pendente",
      value: formatCurrency(summary.pendingWithdrawals),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "Saldo Disponível",
      value: formatCurrency(summary.availableBalance),
      icon: Wallet,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Resumo Financeiro
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Visão geral dos ganhos e saques do sócio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {card.title}
                    </p>
                    <p className={`text-2xl font-bold ${card.color}`}>
                      {card.value}
                    </p>
                    {card.subtitle && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {card.subtitle}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${card.bgColor}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Participação nas Feiras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Porcentagem Média:
                </span>
                <span className="font-medium">{currentFairPercentage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total de Feiras:
                </span>
                <span className="font-medium">{summary.fairEarnings?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Feiras Lucrativas:
                </span>
                <span className="font-medium">
                  {summary.fairEarnings?.filter((fair: FairEarning) => fair.isProfitable).length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Status da Conta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Status:
                </span>
                <Badge variant={summary.availableBalance > 0 ? "default" : "secondary"}>
                  {summary.availableBalance > 0 ? "Ativo" : "Sem saldo"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Saques Pendentes:
                </span>
                <Badge variant={summary.pendingWithdrawals > 0 ? "destructive" : "outline"}>
                  {summary.pendingWithdrawals > 0 ? "Sim" : "Não"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total de Saques:
                </span>
                <span className="font-medium">{summary.totalWithdrawals}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhamento por Feira */}
      {summary.fairEarnings && summary.fairEarnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Detalhamento por Feira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.fairEarnings.map((fair: FairEarning) => (
                <div key={fair.fairId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{fair.fairName}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {fair.percentage}% de participação
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatCurrency(fair.earnings)}
                    </p>
                    <Badge variant={fair.isProfitable ? "default" : "destructive"}>
                      {fair.isProfitable ? "Lucrativa" : "Prejuízo"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
