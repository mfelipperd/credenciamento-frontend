import { useFairFinancialOverview } from "@/hooks/useFairPartners";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wallet,
  Users,
} from "lucide-react";
import type { PartnerFinancialOverviewItem } from "@/interfaces/fair-partners";

interface Props {
  fairId: string;
}

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v / 100);

const pct = (v: number) => `${v.toFixed(1)}%`;

const ALERT_LABEL: Record<string, { label: string; color: string }> = {
  overdraw: { label: "Saldo negativo", color: "bg-red-100 text-red-700 border-red-200" },
  pending_exceeds_balance: { label: "Pendente > disponível", color: "bg-orange-100 text-orange-700 border-orange-200" },
  inactive: { label: "Inativo", color: "bg-slate-100 text-slate-500 border-slate-200" },
  withdrawal_in_unprofitable_fair: { label: "Sacou em feira não lucrativa", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
};

export function FairFinancialOverview({ fairId }: Props) {
  const { data: overview, isLoading } = useFairFinancialOverview(fairId);

  if (!fairId) {
    return (
      <div className="text-center py-12 text-slate-400">
        <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p>Selecione uma feira para ver a visão financeira.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-white/5" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-slate-100 dark:bg-white/5" />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>Nenhum dado disponível para esta feira.</p>
      </div>
    );
  }

  const totalAlerts = overview.socios.reduce((sum, s) => sum + s.alertas.length, 0);

  return (
    <div className="space-y-6">
      {/* Lucratividade da feira */}
      <div
        className={`rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          overview.isProfitable
            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30"
            : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30"
        }`}
      >
        <div className="flex items-center gap-3">
          {overview.isProfitable ? (
            <TrendingUp className="w-8 h-8 text-green-600" />
          ) : (
            <TrendingDown className="w-8 h-8 text-red-600" />
          )}
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Resultado da Feira
            </p>
            <p className={`text-2xl font-black ${overview.isProfitable ? "text-green-700" : "text-red-700"}`}>
              {fmt(overview.lucroFeira)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 font-medium text-slate-700 dark:text-slate-300">
            Empresa retém <strong>{pct(overview.percentagemEmpresa)}</strong>
          </span>
          {overview.isProfitable ? (
            <Badge className="bg-green-500 text-white text-xs px-3">Lucrativa</Badge>
          ) : (
            <Badge className="bg-red-500 text-white text-xs px-3">Não lucrativa</Badge>
          )}
        </div>
      </div>

      {/* Totais sócios */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KpiCard
          icon={<Wallet className="w-5 h-5 text-purple-500" />}
          label="Disponível p/ sócios"
          value={fmt(overview.totalDisponivelSocios)}
          bg="bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/30"
          valueColor="text-purple-700 dark:text-purple-400"
        />
        <KpiCard
          icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
          label="Total sacado"
          value={fmt(overview.totalSacado)}
          bg="bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30"
          valueColor="text-green-700 dark:text-green-400"
        />
        <KpiCard
          icon={<Clock className="w-5 h-5 text-orange-500" />}
          label="Total pendente"
          value={fmt(overview.totalPendente)}
          bg="bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/30"
          valueColor="text-orange-700 dark:text-orange-400"
        />
      </div>

      {/* Alertas globais */}
      {(overview.sociosEmExcesso.length > 0 || overview.sociosComPendentes.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {overview.sociosEmExcesso.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl text-sm">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="font-medium text-red-700 dark:text-red-400">
                {overview.sociosEmExcesso.length} sócio{overview.sociosEmExcesso.length > 1 ? "s" : ""} com saldo negativo
              </span>
            </div>
          )}
          {overview.sociosComPendentes.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/30 rounded-xl text-sm">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="font-medium text-orange-700 dark:text-orange-400">
                {overview.sociosComPendentes.length} sócio{overview.sociosComPendentes.length > 1 ? "s" : ""} com saques pendentes
              </span>
            </div>
          )}
          {totalAlerts === 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-xl text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="font-medium text-green-700 dark:text-green-400">Todos os saldos estão em ordem</span>
            </div>
          )}
        </div>
      )}

      {/* Tabela por sócio */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Users className="w-4 h-4 text-[#00aacd]" />
            Detalhamento por Sócio
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <th className="text-left px-6 py-3">Sócio</th>
                  <th className="text-right px-4 py-3">%</th>
                  <th className="text-right px-4 py-3">Projeção</th>
                  <th className="text-right px-4 py-3">Sacado</th>
                  <th className="text-right px-4 py-3">Pendente</th>
                  <th className="text-right px-4 py-3">Disponível</th>
                  <th className="text-right px-4 py-3">C/ pendentes</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="px-6 py-3">Alertas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {overview.socios.map((socio) => (
                  <PartnerOverviewRow key={socio.partnerId} socio={socio} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PartnerOverviewRow({ socio }: { socio: PartnerFinancialOverviewItem }) {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-white/3 transition-colors">
      <td className="px-6 py-3">
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{socio.partnerName}</p>
          {socio.partnerEmail && (
            <p className="text-[11px] text-slate-400">{socio.partnerEmail}</p>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">
        {pct(socio.percentage)}
      </td>
      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
        {fmt(socio.projectedEarnings)}
      </td>
      <td className="px-4 py-3 text-right text-green-600 dark:text-green-400 font-medium">
        {fmt(socio.sacadoAprovado)}
        {socio.taxaSaque > 0 && (
          <p className="text-[10px] text-slate-400">{pct(socio.taxaSaque)}</p>
        )}
      </td>
      <td className="px-4 py-3 text-right text-orange-500 font-medium">
        {fmt(socio.sacadoPendente)}
      </td>
      <td className={`px-4 py-3 text-right font-bold ${socio.isOverdrawn ? "text-red-600" : "text-purple-600 dark:text-purple-400"}`}>
        {fmt(socio.saldoDisponivel)}
        {socio.isOverdrawn && socio.valorExcedente > 0 && (
          <p className="text-[10px] text-red-400">excede {fmt(socio.valorExcedente)}</p>
        )}
      </td>
      <td className={`px-4 py-3 text-right text-sm ${socio.saldoConsiderandoPendentes < 0 ? "text-red-500" : "text-slate-500"}`}>
        {fmt(socio.saldoConsiderandoPendentes)}
      </td>
      <td className="px-4 py-3 text-center">
        {socio.isOverdrawn ? (
          <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">Negativo</Badge>
        ) : (
          <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">OK</Badge>
        )}
      </td>
      <td className="px-6 py-3">
        <div className="flex flex-wrap gap-1">
          {socio.alertas.length === 0 ? (
            <span className="text-[11px] text-slate-300">—</span>
          ) : (
            socio.alertas.map((a, i) => {
              const style = ALERT_LABEL[a.type] ?? { label: a.type, color: "bg-slate-100 text-slate-600 border-slate-200" };
              return (
                <span
                  key={i}
                  title={a.message}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${style.color}`}
                >
                  {style.label}
                </span>
              );
            })
          )}
        </div>
      </td>
    </tr>
  );
}

function KpiCard({
  icon,
  label,
  value,
  bg,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
  valueColor: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${bg}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
      </div>
      <p className={`text-xl font-black ${valueColor}`}>{value}</p>
    </div>
  );
}
