import { useState } from "react";
import { DollarSign, TrendingUp, Calendar, Lightbulb, Target, BarChart3, Users, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFairPartnerFinancialSummary } from "@/hooks/useFairPartners";
import { WithdrawalForm } from "./WithdrawalForm";
import { useCashFlowAnalysis } from "@/hooks/useFinance";
import type { FairPartner } from "@/interfaces/fair-partners";

interface PartnerViewProps {
  partner?: FairPartner | null;
  fairId?: string;
  isAdminView?: boolean;
}

export function PartnerView({ partner: propPartner, fairId, isAdminView = false }: PartnerViewProps) {
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  
  const partner = propPartner;
  
  const { data: financialSummary } = useFairPartnerFinancialSummary(fairId || "", partner?.partnerId || "");
  const { data: cashFlowData } = useCashFlowAnalysis(fairId || "");

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "R$ 0,00";
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value));
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0.0%";
    }
    return `${Number(value).toFixed(1)}%`;
  };


  // Calcular lucro do sócio baseado na porcentagem
  const totalFairProfit = cashFlowData?.netProfit || 0;
  const partnerProfit = partner ? (totalFairProfit * partner.percentage) / 100 : 0;
  const monthlyIdealWithdrawal = partnerProfit / 12;
  const quarterlyIdealWithdrawal = partnerProfit / 4;
  const yearlyIdealWithdrawal = partnerProfit;

  // Insights baseados no saldo disponível
  // const availableBalance = financialSummary?.availableBalance || partner?.availableBalance || 0;
  // const totalEarnings = financialSummary?.totalEarnings || partner?.totalEarnings || 0;
  // const totalWithdrawn = financialSummary?.totalWithdrawn || partner?.totalWithdrawn || 0;

  // Insights de retirada
  const getWithdrawalInsights = () => {
    if (!partner || !financialSummary) return [];

    const insights = [];
    const availableBalance = financialSummary.availableBalance;
    const monthlyIdeal = monthlyIdealWithdrawal;

    // Insight 1: Frequência de retirada
    if (availableBalance > monthlyIdeal * 3) {
      insights.push({
        type: "success",
        icon: "💰",
        title: "Saldo Alto",
        description: `Você tem R$ ${formatCurrency(availableBalance)} disponível. Considere fazer retiradas mensais de R$ ${formatCurrency(monthlyIdeal)} para manter um fluxo regular.`
      });
    } else if (availableBalance > monthlyIdeal) {
      insights.push({
        type: "warning",
        icon: "⚠️",
        title: "Saldo Moderado",
        description: `Seu saldo de R$ ${formatCurrency(availableBalance)} permite retiradas. Recomendamos retirar R$ ${formatCurrency(monthlyIdeal)} por mês.`
      });
    } else {
      insights.push({
        type: "info",
        icon: "ℹ️",
        title: "Saldo Baixo",
        description: `Seu saldo atual é R$ ${formatCurrency(availableBalance)}. Aguarde mais lucros antes de fazer retiradas.`
      });
    }

    // Insight 2: Estratégia de retirada
    if (partner.percentage >= 50) {
      insights.push({
        type: "success",
        icon: "🎯",
        title: "Sócio Majoritário",
        description: `Com ${formatPercentage(partner.percentage)} de participação, você pode considerar retiradas trimestrais de R$ ${formatCurrency(quarterlyIdealWithdrawal)}.`
      });
    } else if (partner.percentage >= 25) {
      insights.push({
        type: "info",
        icon: "📊",
        title: "Participação Significativa",
        description: `Sua participação de ${formatPercentage(partner.percentage)} sugere retiradas mensais de R$ ${formatCurrency(monthlyIdeal)}.`
      });
    } else {
      insights.push({
        type: "info",
        icon: "💡",
        title: "Participação Menor",
        description: `Com ${formatPercentage(partner.percentage)} de participação, considere retiradas menores e mais frequentes.`
      });
    }

    // Insight 3: Histórico de retiradas
    const recentWithdrawals: any[] = []; // TODO: Implementar busca de retiradas

    if (recentWithdrawals.length === 0) {
      insights.push({
        type: "warning",
        icon: "📅",
        title: "Sem Retiradas Recentes",
        description: "Você não fez retiradas nos últimos 3 meses. Considere fazer uma retirada se o saldo permitir."
      });
    } else if (recentWithdrawals.length >= 3) {
      insights.push({
        type: "success",
        icon: "✅",
        title: "Retiradas Regulares",
        description: `Excelente! Você fez ${recentWithdrawals.length} retiradas nos últimos 3 meses, mantendo um fluxo regular.`
      });
    }

    return insights;
  };

  const insights = getWithdrawalInsights();

  if (!partner) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">
          {isAdminView ? "Selecione um sócio para visualizar" : "Não foi possível carregar os dados do sócio."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isAdminView ? `Visão do Sócio: ${partner.partnerName || "Nome não disponível"}` : `Olá, ${partner.partnerName || "Nome não disponível"}!`}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isAdminView ? "Perspectiva do sócio" : "Seu painel de sócio"} - {formatPercentage(partner.percentage)} de participação
          </p>
        </div>
        {!isAdminView && (
          <Button onClick={() => setIsWithdrawalDialogOpen(true)}>
            <CreditCard className="w-4 h-4 mr-2" />
            Solicitar Saque
          </Button>
        )}
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Sua Participação
            </CardTitle>
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatPercentage(partner.percentage)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              da feira
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Lucro Total da Feira
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalFairProfit)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Lucro líquido
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Seu Lucro
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(partnerProfit)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Baseado na sua %
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Saldo Disponível
            </CardTitle>
            <CreditCard className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(partner.availableBalance)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Para retirada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights de Retirada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Insights de Retirada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === "success" 
                    ? "bg-green-50 dark:bg-green-900/20 border-green-500" 
                    : insight.type === "warning"
                    ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500"
                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estratégias de Retirada */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Retirada Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(monthlyIdealWithdrawal)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Ideal para manter fluxo regular de caixa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Retirada Trimestral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(quarterlyIdealWithdrawal)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Boa para sócios com maior participação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Retirada Anual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(yearlyIdealWithdrawal)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Para investimentos de longo prazo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Financeiro Detalhado */}
      {financialSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro Detalhado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Ganhos</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Ganho</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(financialSummary.totalEarnings)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Seu Lucro Atual</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {formatCurrency(partnerProfit)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Retiradas</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Sacado</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(financialSummary.totalWithdrawn)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Saldo Disponível</span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                      {formatCurrency(financialSummary.availableBalance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário de Saque (apenas para o próprio sócio) */}
      {!isAdminView && (
        <WithdrawalForm
          isOpen={isWithdrawalDialogOpen}
          onClose={() => setIsWithdrawalDialogOpen(false)}
        />
      )}
    </div>
  );
}
