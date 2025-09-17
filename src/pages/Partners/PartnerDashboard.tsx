import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialSummary } from "./components/FinancialSummary";
import { WithdrawalForm } from "./components/WithdrawalForm";
import { WithdrawalsList } from "./components/WithdrawalsList";
import { Wallet, DollarSign, History } from "lucide-react";
import { useUserSession } from "@/hooks/useUserSession";
import { usePartnerMe } from "@/hooks/usePartners";
import { useSearchParams } from "@/hooks/useSearchParams";

export const PartnerDashboard: React.FC = () => {
  const { user } = useUserSession();
  const { data: partner, isLoading, error } = usePartnerMe();
  const [, , fairId] = useSearchParams();

  if (!user?.id) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Usuário não encontrado</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Carregando dados do parceiro...</p>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Erro ao carregar dados do parceiro</p>
        <p className="text-sm text-gray-500 mt-2">Verifique se você tem um perfil de parceiro ativo</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Meu Painel
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gerencie seus ganhos e solicite saques
        </p>
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Resumo Financeiro
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Solicitar Saque
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <FinancialSummary partnerId={partner.id} fairId={fairId || ""} />
        </TabsContent>

        <TabsContent value="withdraw">
          <WithdrawalForm partnerId={partner.id} fairId={fairId || ""} />
        </TabsContent>

        <TabsContent value="history">
          <WithdrawalsList partnerId={partner.id} fairId={fairId || ""} />
        </TabsContent>
      </Tabs>
    </div>
  );
};