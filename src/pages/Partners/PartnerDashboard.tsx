import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PageTabsList, PageTabsTrigger } from "@/components/ui/page-tabs";
import { FinancialSummary } from "./components/FinancialSummary";
import { WithdrawalForm } from "./components/WithdrawalForm";
import { WithdrawalsList } from "./components/WithdrawalsList";
import { PartnerCompleteDashboardView } from "./components/PartnerCompleteDashboardView";
import { AlertCircle, BarChart3, DollarSign, History, UserRound, Wallet } from "lucide-react";
import { useUserSession } from "@/hooks/useUserSession";
import { usePartnerMe } from "@/hooks/usePartners";
import { useSearchParams } from "@/hooks/useSearchParams";

export const PartnerDashboard: React.FC = () => {
  const { user } = useUserSession();
  const { data: partner, isLoading, error } = usePartnerMe();
  const [, , fairId] = useSearchParams();

  if (!user?.id) {
    return <StatusState icon="warning" title="Usuário não encontrado" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-6 text-center">
        <div>
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-brand-cyan" />
          <p className="text-sm font-medium text-white/50">Carregando dados do sócio...</p>
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return <StatusState icon="error" title="Erro ao carregar dados do sócio" description="Verifique se você tem um perfil de sócio ativo." />;
  }

  return (
    <div className="min-h-screen space-y-8 p-4 pb-12 text-white sm:p-6">
      <Tabs defaultValue="summary" className="space-y-6">
        <div className="flex flex-col gap-5 xl:grid xl:grid-cols-[1fr_auto_1fr] xl:items-end">
          <div>
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Área do sócio</p>
            <h1 className="flex items-center gap-3 text-3xl font-black tracking-tighter text-white sm:text-4xl">
              <UserRound className="h-8 w-8 text-brand-pink" />
              Meu <span className="text-brand-cyan">Painel</span>
            </h1>
            <p className="mt-1 text-sm font-medium text-white/40">Gerencie seus ganhos e solicite saques</p>
          </div>

          <PageTabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:w-auto sm:grid-cols-4">
            <PageTabsTrigger value="summary" className="px-3"><Wallet className="h-4 w-4" />Resumo</PageTabsTrigger>
            <PageTabsTrigger value="withdraw" className="px-3"><DollarSign className="h-4 w-4" />Solicitar</PageTabsTrigger>
            <PageTabsTrigger value="history" className="px-3"><History className="h-4 w-4" />Histórico</PageTabsTrigger>
            <PageTabsTrigger value="all-fairs" className="px-3"><BarChart3 className="h-4 w-4" />Feiras</PageTabsTrigger>
          </PageTabsList>
          <div className="hidden xl:block" />
        </div>

        <TabsContent value="summary"><FinancialSummary partnerId={partner.id} fairId={fairId || ""} /></TabsContent>
        <TabsContent value="withdraw"><WithdrawalForm partnerId={partner.id} fairId={fairId || ""} /></TabsContent>
        <TabsContent value="history"><WithdrawalsList partnerId={partner.id} fairId={fairId || ""} /></TabsContent>
        <TabsContent value="all-fairs"><PartnerCompleteDashboardView partnerId={partner.id} /></TabsContent>
      </Tabs>
    </div>
  );
};

function StatusState({ icon, title, description }: { icon: "warning" | "error"; title: string; description?: string }) {
  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <div className="glass-card max-w-md rounded-3xl border border-white/10 p-10 text-center">
        <AlertCircle className={`mx-auto mb-4 h-10 w-10 ${icon === "error" ? "text-red-400" : "text-brand-pink"}`} />
        <p className="font-bold text-white">{title}</p>
        {description && <p className="mt-2 text-sm text-white/40">{description}</p>}
      </div>
    </div>
  );
}
