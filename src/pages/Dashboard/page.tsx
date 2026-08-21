import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ChevronDown, CircleDollarSign, Clock3, RefreshCcw, TrendingUp, UserCheck, Users, WalletCards } from "lucide-react";
import { useSearchParams } from "@/hooks/useSearchParams";
import { useFairDashboard } from "./hooks/useFairDashboard";
import { KpiCard } from "./components/KpiCard";
import { ExpensesByCategoryChart } from "./components/charts/ExpensesByCategoryChart";
import { RevenuesByStatusChart } from "./components/charts/RevenuesByStatusChart";
import { RevenueForecastChart } from "./components/charts/RevenueForecastChart";
import { VisitorsTimelineChart } from "./components/charts/VisitorsTimelineChart";
import { CheckinsByHourChart } from "./components/charts/CheckinsByHourChart";
import { currency, percent, integer, profitColor, marginColor, inadimplenciaColor } from "./utils/format";
import { LogoLoading } from "@/components/LogoLoading";
import { getAxiosErrorMessage } from "@/utils/handleAxiosError";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PageTabsList, PageTabsTrigger } from "@/components/ui/page-tabs";

export const Dashboard = () => {
  const [, , fairId] = useSearchParams();
  const queryClient = useQueryClient();
  const [updatedAt, setUpdatedAt] = useState(new Date());
  const dashboard = useFairDashboard(fairId ?? "");
  const { kpi, kpiLoading, kpiError } = dashboard;

  if (!fairId) return <div className="flex min-h-[60vh] items-center justify-center"><LogoLoading size={60} /></div>;

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["charts"] });
    setUpdatedAt(new Date());
  };
  const totalStatus = kpi ? kpi.receita.totalRecebido + kpi.receita.totalAReceber + kpi.receita.totalVencido : 0;
  const share = (value: number) => totalStatus > 0 ? `${Math.max(0, value / totalStatus * 100)}%` : "0%";
  const alerts = kpi ? [
    kpi.receita.totalVencido > 0 ? `${currency(kpi.receita.totalVencido)} em atraso` : null,
    kpi.resultado.lucroRealizado < 0 ? `Resultado negativo de ${currency(kpi.resultado.lucroRealizado)}` : null,
    kpi.receita.inadimplencia > 10 ? `Inadimplência em ${percent(kpi.receita.inadimplencia)}` : null,
  ].filter(Boolean) as string[] : [];

  return (
    <div className="min-h-screen space-y-5 px-1 pb-10 text-white sm:space-y-6 sm:p-4 lg:p-6">
      <header className="flex items-start justify-between gap-3">
        <div><p className="text-[9px] font-black uppercase tracking-[.22em] text-white/35">Visão operacional</p><h1 className="text-2xl font-black tracking-tighter sm:text-4xl">Dashboard <span className="text-brand-pink">Financeiro</span></h1><p className="mt-1 text-[10px] text-white/35 sm:text-xs">Atualizado às {updatedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p></div>
        <Button variant="outline" size="sm" onClick={refresh} className="h-9 shrink-0 rounded-xl border-white/10 bg-white/5 px-3 text-white/60 hover:bg-white/10 hover:text-white"><RefreshCcw className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Atualizar</span></Button>
      </header>

      {kpiError && <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2.5 text-xs text-red-100">Não foi possível carregar os indicadores: {getAxiosErrorMessage(kpiError, "erro interno")}</div>}

      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3">
        <KpiCard label="Recebido" value={kpi ? currency(kpi.receita.totalRecebido) : "—"} subtext={kpi ? `${percent(kpi.receita.taxaRecebimento)} da receita` : undefined} accentColor="#10b981" icon={CircleDollarSign} loading={kpiLoading} featured />
        <KpiCard label="A receber" value={kpi ? currency(kpi.receita.totalAReceber) : "—"} subtext="Contratos em aberto" accentColor="#FEB019" icon={Clock3} loading={kpiLoading} />
        <KpiCard label="Resultado atual" value={kpi ? currency(kpi.resultado.lucroRealizado) : "—"} subtext={kpi ? `Margem ${percent(kpi.resultado.margemRealizada)}` : undefined} accentColor={kpi ? profitColor(kpi.resultado.lucroRealizado) : "#00aacd"} icon={TrendingUp} loading={kpiLoading} featured />
        <KpiCard label="Check-ins" value={kpi ? integer(kpi.visitantes.checkins) : "—"} subtext={kpi ? `${percent(kpi.visitantes.taxaComparecimento)} de comparecimento` : undefined} accentColor="#00aacd" icon={UserCheck} loading={kpiLoading} />
      </section>

      {kpi && <section className={`rounded-2xl border px-4 py-3 ${alerts.length ? "border-amber-400/20 bg-amber-400/10" : "border-emerald-400/15 bg-emerald-400/5"}`}><div className="flex items-start gap-3"><AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${alerts.length ? "text-amber-400" : "text-emerald-400"}`} /><div><p className="text-xs font-bold">{alerts.length ? "Pontos de atenção" : "Operação dentro do esperado"}</p>{alerts.length > 0 && <p className="mt-1 text-[11px] text-white/50">{alerts.join(" • ")}</p>}</div></div></section>}

      <Tabs defaultValue="overview" className="space-y-5">
        <div className="-mx-1 overflow-x-auto px-1 pb-1"><PageTabsList className="h-auto w-max min-w-full justify-start sm:min-w-0"><PageTabsTrigger value="overview">Visão geral</PageTabsTrigger><PageTabsTrigger value="finance">Financeiro</PageTabsTrigger><PageTabsTrigger value="audience">Público</PageTabsTrigger><PageTabsTrigger value="taxes">Impostos</PageTabsTrigger></PageTabsList></div>

        <TabsContent value="overview" className="space-y-5">
          <ChartCard title="Situação financeira" subtitle="Recebido, em aberto e vencido">
            <div className="mb-5 flex h-3 overflow-hidden rounded-full bg-white/5"><span className="bg-emerald-500" style={{width:share(kpi?.receita.totalRecebido??0)}}/><span className="bg-amber-400" style={{width:share(kpi?.receita.totalAReceber??0)}}/><span className="bg-red-500" style={{width:share(kpi?.receita.totalVencido??0)}}/></div>
            <div className="grid grid-cols-3 gap-2 text-center"><Mini label="Recebido" value={currency(kpi?.receita.totalRecebido??0)} color="text-emerald-400"/><Mini label="A receber" value={currency(kpi?.receita.totalAReceber??0)} color="text-amber-400"/><Mini label="Vencido" value={currency(kpi?.receita.totalVencido??0)} color="text-red-400"/></div>
          </ChartCard>
          <ChartCard title="Previsão de recebimentos" subtitle="Parcelas em aberto por mês"><RevenueForecastChart data={dashboard.revenueForecast} loading={!fairId}/></ChartCard>
          <MobileDetails title="Mais análises"><div className="grid gap-4 lg:grid-cols-2"><ChartCard title="Receitas por status"><RevenuesByStatusChart data={dashboard.revenuesByStatus} loading={!fairId}/></ChartCard><ChartCard title="Despesas por categoria"><ExpensesByCategoryChart data={dashboard.expensesByCategory} loading={!fairId}/></ChartCard></div></MobileDetails>
        </TabsContent>

        <TabsContent value="finance" className="space-y-5">
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4"><KpiCard label="Receita contratada" value={currency(kpi?.receita.totalContrato??0)} subtext={`${integer(kpi?.receita.contratosValidos??0)} contratos`} icon={WalletCards} loading={kpiLoading}/><KpiCard label="Despesas" value={currency(kpi?.despesas.total??0)} subtext={`Diretas ${currency(kpi?.despesas.diretas??0)}`} accentColor="#FF4560" loading={kpiLoading}/><KpiCard label="Lucro projetado" value={currency(kpi?.resultado.lucroProjetado??0)} subtext={`Margem ${percent(kpi?.resultado.margemProjetada??0)}`} accentColor={marginColor(kpi?.resultado.margemProjetada??0)} loading={kpiLoading}/><KpiCard label="Inadimplência" value={percent(kpi?.receita.inadimplencia??0)} accentColor={inadimplenciaColor(kpi?.receita.inadimplencia??0)} loading={kpiLoading}/></div>
          <ChartCard title="Previsão de recebimentos"><RevenueForecastChart data={dashboard.revenueForecast} loading={!fairId}/></ChartCard>
          <div className="grid gap-4 lg:grid-cols-2"><ChartCard title="Receitas por status"><RevenuesByStatusChart data={dashboard.revenuesByStatus} loading={!fairId}/></ChartCard><ChartCard title="Despesas por categoria"><ExpensesByCategoryChart data={dashboard.expensesByCategory} loading={!fairId}/></ChartCard></div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-5">
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4"><KpiCard label="Inscritos" value={integer(kpi?.visitantes.total??0)} icon={Users} loading={kpiLoading}/><KpiCard label="Check-ins" value={integer(kpi?.visitantes.checkins??0)} icon={UserCheck} loading={kpiLoading}/><KpiCard label="Custo por visitante" value={currency(kpi?.visitantes.custoPorVisitante??0)} accentColor="#775DD0" loading={kpiLoading}/><KpiCard label="Custo por stand" value={currency(kpi?.visitantes.custoPorStand??0)} accentColor="#FF4560" loading={kpiLoading}/></div>
          <div className="grid gap-4 lg:grid-cols-2"><ChartCard title="Evolução de inscrições"><VisitorsTimelineChart data={dashboard.visitorsTimeline} loading={!fairId}/></ChartCard><ChartCard title="Check-ins por horário"><CheckinsByHourChart data={dashboard.checkinsByHour} loading={!fairId}/></ChartCard></div>
        </TabsContent>

        <TabsContent value="taxes" className="space-y-4"><div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4"><KpiCard label="Faturamento anual" value={kpi?.impostos.annualRevenue==null?"Indisponível":currency(kpi.impostos.annualRevenue)} subtext={kpi?`Anexo ${kpi.impostos.annex}`:undefined} accentColor="#775DD0" loading={kpiLoading}/><KpiCard label="Imposto anual" value={kpi?.impostos.annualAmount==null?"Indisponível":currency(kpi.impostos.annualAmount)} accentColor="#FEB019" loading={kpiLoading}/><KpiCard label="Imposto da feira" value={kpi?.impostos.amount==null?"Indisponível":currency(kpi.impostos.amount)} accentColor="#FF4560" loading={kpiLoading}/><KpiCard label="Alíquota efetiva" value={kpi?.impostos.effectiveRate==null?"Indisponível":percent(kpi.impostos.effectiveRate)} accentColor="#00aacd" loading={kpiLoading}/></div>{kpi?.impostos.message&&<div className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-xs text-yellow-100">{kpi.impostos.message}</div>}</TabsContent>
      </Tabs>
    </div>
  );
};

function ChartCard({title,subtitle,children}:{title:string;subtitle?:string;children:ReactNode}){return <section className="rounded-2xl border border-white/5 bg-white/3 p-3 sm:rounded-[28px] sm:p-5"><div className="mb-3"><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/45">{title}</p>{subtitle&&<p className="mt-0.5 text-[10px] text-white/25">{subtitle}</p>}</div>{children}</section>}
function Mini({label,value,color}:{label:string;value:string;color:string}){return <div><p className="text-[9px] font-bold uppercase tracking-wider text-white/30">{label}</p><p className={`mt-1 truncate text-xs font-black sm:text-sm ${color}`}>{value}</p></div>}
function MobileDetails({title,children}:{title:string;children:ReactNode}){return <details className="group" open><summary className="mb-3 flex cursor-pointer list-none items-center justify-between text-xs font-black uppercase tracking-wider text-white/45 lg:hidden">{title}<ChevronDown className="h-4 w-4 transition group-open:rotate-180"/></summary><div>{children}</div></details>}
