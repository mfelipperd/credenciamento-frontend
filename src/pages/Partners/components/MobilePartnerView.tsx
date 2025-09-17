import { useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Lightbulb, 
  Target, 
  BarChart3, 
  Users, 
  CreditCard,
  Wallet,
  PiggyBank
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFairPartnerFinancialSummary } from "@/hooks/useFairPartners";
import { WithdrawalForm } from "./WithdrawalForm";
import { useCashFlowAnalysis } from "@/hooks/useFinance";
import type { FairPartner } from "@/interfaces/fair-partners";

interface MobilePartnerViewProps {
  partner?: FairPartner | null;
  fairId?: string;
  isAdminView?: boolean;
}

export function MobilePartnerView({ partner: propPartner, fairId, isAdminView = false }: MobilePartnerViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'withdrawals'>('overview');
  
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
  // const yearlyIdealWithdrawal = partnerProfit; // Removido para evitar warning

  // Insights baseados no saldo disponível
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

    return insights;
  };

  const insights = getWithdrawalInsights();

  if (!partner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 p-4">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-16" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950">
      {/* Header Mobile */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {isAdminView ? `Sócio: ${partner.partnerName}` : `Olá, ${partner.partnerName}!`}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatPercentage(partner.percentage)} de participação
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-16 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="flex px-4 py-2 space-x-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 mx-auto mb-1" />
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 py-3 px-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'insights'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Lightbulb className="w-4 h-4 mx-auto mb-1" />
            Insights
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`flex-1 py-3 px-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'withdrawals'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <CreditCard className="w-4 h-4 mx-auto mb-1" />
            Saques
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {activeTab === 'overview' && (
          <>
            {/* KPIs Grid - Mobile Optimized */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Participação</span>
                </div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {formatPercentage(partner.percentage)}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">da feira</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Lucro Feira</span>
                </div>
                <div className="text-lg font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(totalFairProfit)}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">total</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Seu Lucro</span>
                </div>
                <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                  {formatCurrency(partnerProfit)}
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">estimado</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
                <div className="flex items-center justify-between mb-2">
                  <Wallet className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Disponível</span>
                </div>
                <div className="text-lg font-bold text-orange-700 dark:text-orange-300">
                  {formatCurrency(financialSummary?.availableBalance || 0)}
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">para saque</p>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-4">
              <CardTitle className="text-lg mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Ações Rápidas
              </CardTitle>
              <div className="space-y-3">
                <Button 
                  onClick={() => {}}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Solicitar Saque
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Retirada Mensal Ideal</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(monthlyIdealWithdrawal)}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Retirada Trimestral</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(quarterlyIdealWithdrawal)}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            <Card className="p-4">
              <CardTitle className="text-lg mb-4 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                Insights Personalizados
              </CardTitle>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      insight.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-400'
                        : insight.type === 'warning'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-400'
                    }`}
                  >
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">{insight.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="space-y-4">
            <Card className="p-4">
              <CardTitle className="text-lg mb-4 flex items-center">
                <PiggyBank className="h-5 w-5 mr-2 text-green-600" />
                Histórico de Saques
              </CardTitle>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum saque realizado ainda</p>
                <p className="text-sm">Seus saques aparecerão aqui</p>
              </div>
            </Card>

            <Card className="p-4">
              <CardTitle className="text-lg mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Estratégias de Saque
              </CardTitle>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900 dark:text-blue-300">Mensal</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {formatCurrency(monthlyIdealWithdrawal)}
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Recomendado para fluxo regular</p>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                    <span className="font-medium text-green-900 dark:text-green-300">Trimestral</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {formatCurrency(quarterlyIdealWithdrawal)}
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">Para sócios com maior participação</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Withdrawal Dialog */}
      <WithdrawalForm
        partnerId={partner.id}
        fairId={fairId || ""}
        onSuccess={() => {}}
      />
    </div>
  );
}
