import { useSearchParams } from "@/hooks/useSearchParams";
import { useFairDashboard } from "./hooks/useFairDashboard";
import { KpiCard } from "./components/KpiCard";
import { ExpensesByCategoryChart } from "./components/charts/ExpensesByCategoryChart";
import { RevenuesByStatusChart } from "./components/charts/RevenuesByStatusChart";
import { RevenueForecastChart } from "./components/charts/RevenueForecastChart";
import { VisitorsTimelineChart } from "./components/charts/VisitorsTimelineChart";
import { CheckinsByHourChart } from "./components/charts/CheckinsByHourChart";
import {
  currency,
  percent,
  integer,
  profitColor,
  marginColor,
  inadimplenciaColor,
} from "./utils/format";
import { LogoLoading } from "@/components/LogoLoading";
import { getAxiosErrorMessage } from "@/utils/handleAxiosError";

export const Dashboard = () => {
  const [, , fairId] = useSearchParams();
  const {
    kpi,
    expensesByCategory,
    revenuesByStatus,
    revenueForecast,
    visitorsTimeline,
    checkinsByHour,
    kpiLoading,
    kpiError,
  } = useFairDashboard(fairId ?? "");

  if (!fairId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LogoLoading size={60} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="space-y-1.5">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
          Dashboard <span className="text-brand-pink">Financeiro</span>
        </h2>
        <div className="h-1.5 w-20 bg-linear-to-r from-brand-pink to-brand-cyan rounded-full" />
      </div>

      {kpiError && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          Não foi possível carregar os indicadores financeiros: {getAxiosErrorMessage(kpiError, "erro interno no servidor")}
        </div>
      )}

      {/* ROW 1 — KPI Receita */}
      <section className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
          Receita
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label="Receita Total"
            value={kpi ? currency(kpi.receita.totalContrato) : "—"}
            subtext={
              kpi
                ? `${integer(kpi.receita.contratosValidos)} contratos válidos | Ticket médio: ${currency(kpi.receita.ticketMedio)}`
                : undefined
            }
            accentColor="#00aacd"
            loading={kpiLoading}
          />
          <KpiCard
            label="A Receber"
            value={kpi ? currency(kpi.receita.totalAReceber) : "—"}
            subtext="Contratos em aberto"
            accentColor="#FEB019"
            loading={kpiLoading}
          />
          <KpiCard
            label="Em Atraso"
            value={kpi ? currency(kpi.receita.totalVencido) : "—"}
            subtext={
              kpi
                ? `Inadimplência: ${percent(kpi.receita.inadimplencia)} | Recebimento: ${percent(kpi.receita.taxaRecebimento)}`
                : undefined
            }
            accentColor={
              kpi ? inadimplenciaColor(kpi.receita.inadimplencia) : "#FEB019"
            }
            loading={kpiLoading}
          />
          <KpiCard
            label="Total de Despesas"
            value={kpi ? currency(kpi.despesas.total) : "—"}
            subtext={
              kpi
                ? `Diretas: ${currency(kpi.despesas.diretas)} | Rateadas: ${currency(kpi.despesas.rateadas)}`
                : undefined
            }
            accentColor="#FF4560"
            loading={kpiLoading}
          />
        </div>
      </section>

      {/* ROW 2 — KPI Resultado */}
      <section className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
          Resultado & Visitantes
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard
            label="Lucro Projetado"
            value={kpi ? currency(kpi.resultado.lucroProjetado) : "—"}
            subtext={
              kpi
                ? `Margem: ${percent(kpi.resultado.margemProjetada)}`
                : undefined
            }
            accentColor={
              kpi ? profitColor(kpi.resultado.lucroProjetado) : "#FEB019"
            }
            loading={kpiLoading}
          />
          <KpiCard
            label="Lucro Realizado"
            value={kpi ? currency(kpi.resultado.lucroRealizado) : "—"}
            subtext={
              kpi
                ? `Margem s/ recebido: ${percent(kpi.resultado.margemRealizada)}`
                : undefined
            }
            accentColor={
              kpi ? marginColor(kpi.resultado.margemRealizada) : "#FEB019"
            }
            loading={kpiLoading}
          />
          <KpiCard
            label="Despesas sobre Receita"
            value={kpi ? percent(kpi.resultado.despesasSobreReceita) : "—"}
            subtext="Percentual consolidado pelo backend"
            accentColor={
              kpi ? marginColor(kpi.resultado.despesasSobreReceita) : "#FEB019"
            }
            loading={kpiLoading}
          />
          <KpiCard
            label="Visitantes"
            value={kpi ? integer(kpi.visitantes.total) : "—"}
            subtext={
              kpi
                ? `Check-ins: ${integer(kpi.visitantes.checkins)} (${percent(kpi.visitantes.taxaComparecimento)})`
                : undefined
            }
            accentColor="#00aacd"
            loading={kpiLoading}
          />
          <KpiCard
            label="Custo por Visitante"
            value={kpi ? currency(kpi.visitantes.custoPorVisitante) : "—"}
            subtext="Despesas ÷ inscritos"
            accentColor="#775DD0"
            loading={kpiLoading}
          />
          <KpiCard
            label="Custo por Stand"
            value={kpi ? currency(kpi.visitantes.custoPorStand) : "—"}
            subtext="Montagem ÷ stands ocupados"
            accentColor="#FF4560"
            loading={kpiLoading}
          />
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
          Impostos estimados
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard
            label="Faturamento anual"
            value={
              kpi?.impostos.annualRevenue == null
                ? "Indisponível"
                : currency(kpi.impostos.annualRevenue)
            }
            subtext={
              kpi
                ? `Anexo ${kpi.impostos.annex} | RBT12 ${kpi.impostos.rbt12Complete ? "completo" : "estimado"}`
                : undefined
            }
            accentColor="#775DD0"
            loading={kpiLoading}
          />
          <KpiCard
            label="Imposto anual"
            value={
              kpi?.impostos.annualAmount == null
                ? "Indisponível"
                : currency(kpi.impostos.annualAmount)
            }
            subtext={
              kpi
                ? `Faixa ${kpi.impostos.bracket ?? "indisponível"}`
                : undefined
            }
            accentColor="#FEB019"
            loading={kpiLoading}
          />
          <KpiCard
            label="Imposto da feira"
            value={
              kpi?.impostos.amount == null
                ? "Indisponível"
                : currency(kpi.impostos.amount)
            }
            subtext={
              kpi?.impostos.effectiveRate == null
                ? "Alíquota indisponível"
                : `Alíquota efetiva: ${percent(kpi.impostos.effectiveRate)}`
            }
            accentColor="#FF4560"
            loading={kpiLoading}
          />
          <KpiCard
            label="Alíquota efetiva"
            value={
              kpi?.impostos.effectiveRate == null
                ? "Indisponível"
                : percent(kpi.impostos.effectiveRate)
            }
            subtext={
              kpi
                ? `Nominal: ${kpi.impostos.nominalRate == null ? "indisponível" : percent(kpi.impostos.nominalRate)}`
                : undefined
            }
            accentColor="#00aacd"
            loading={kpiLoading}
          />
        </div>
        {kpi?.impostos.message && (
          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-100">
            {kpi.impostos.message}
          </div>
        )}
      </section>

      {/* ROW 3 — Donuts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-[28px] bg-white/3 border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">
            Receitas por Status
          </p>
          <RevenuesByStatusChart data={revenuesByStatus} loading={!fairId} />
        </div>
        <div className="p-6 rounded-[28px] bg-white/3 border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">
            Despesas por Categoria
          </p>
          <ExpensesByCategoryChart
            data={expensesByCategory}
            loading={!fairId}
          />
        </div>
      </div>

      {/* ROW 4 — Forecast */}
      <div className="p-6 rounded-[28px] bg-white/3 border border-white/5">
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            Forecast de Recebimento
          </p>
          <p className="text-[10px] text-white/25 mt-0.5">
            Parcelas em aberto por mês
          </p>
        </div>
        <RevenueForecastChart data={revenueForecast} loading={!fairId} />
      </div>

      {/* ROW 5 — Timeline + Check-ins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-[28px] bg-white/3 border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">
            Evolução de Inscrições
          </p>
          <VisitorsTimelineChart data={visitorsTimeline} loading={!fairId} />
        </div>
        <div className="p-6 rounded-[28px] bg-white/3 border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">
            Check-ins por Horário
          </p>
          <CheckinsByHourChart data={checkinsByHour} loading={!fairId} />
        </div>
      </div>
    </div>
  );
};
