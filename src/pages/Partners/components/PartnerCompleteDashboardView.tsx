import { usePartnerCompleteDashboard } from "@/hooks/useFairPartners";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  History,
} from "lucide-react";
import type { PartnerFairBreakdown, PartnerWithdrawalItem } from "@/interfaces/partners";

interface Props {
  partnerId: string;
}

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v / 100);

const pct = (v: number) => `${v.toFixed(1)}%`;

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-700 border-orange-200",
  APPROVED: "bg-green-100 text-green-700 border-green-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  COMPLETED: "bg-blue-100 text-blue-700 border-blue-200",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Recusado",
  COMPLETED: "Concluído",
};

export function PartnerCompleteDashboardView({ partnerId }: Props) {
  const { data: dashboard, isLoading } = usePartnerCompleteDashboard(partnerId);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-100 dark:bg-white/5" />
          ))}
        </div>
        <div className="h-48 rounded-2xl bg-slate-100 dark:bg-white/5" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Wallet className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p>Nenhum dado encontrado.</p>
      </div>
    );
  }

  const { totais, feiras, ultimosSaques } = dashboard;

  return (
    <div className="space-y-6">
      {/* Totais globais */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div
          className={`rounded-2xl border p-4 col-span-2 md:col-span-1 ${
            totais.isOverdrawn
              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30"
              : "bg-linear-to-br from-[#00aacd]/8 to-[#EB2970]/8 border-[#00aacd]/20"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {totais.isOverdrawn ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : (
              <TrendingUp className="w-4 h-4 text-[#00aacd]" />
            )}
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Saldo global
            </span>
          </div>
          <p className={`text-2xl font-black ${totais.isOverdrawn ? "text-red-600" : "text-[#00aacd]"}`}>
            {fmt(totais.saldo)}
          </p>
          {totais.taxaSaqueGlobal > 0 && (
            <p className="text-xs text-slate-400 mt-1">
              Taxa de saque: {pct(totais.taxaSaqueGlobal)}
            </p>
          )}
        </div>

        <TotaisCard
          icon={<Building2 className="w-4 h-4 text-slate-400" />}
          label="Projeção total"
          value={fmt(totais.projecaoGlobal)}
          color="text-slate-700 dark:text-slate-200"
        />
        <TotaisCard
          icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
          label="Total sacado"
          value={fmt(totais.sacado)}
          color="text-green-700 dark:text-green-400"
          bg="bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30"
        />
        <TotaisCard
          icon={<Clock className="w-4 h-4 text-orange-500" />}
          label="Pendente aprovação"
          value={fmt(totais.pendente)}
          color="text-orange-700 dark:text-orange-400"
          bg="bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/30"
        />
        {totais.isOverdrawn && (
          <div className="col-span-2 md:col-span-2 flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-sm text-red-700 dark:text-red-400 font-medium">
              Saldo global negativo — total sacado supera a projeção.
            </span>
          </div>
        )}
      </div>

      {/* Feiras */}
      {feiras.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Building2 className="w-4 h-4 text-[#00aacd]" />
              Detalhamento por Feira
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-400">
                    <th className="text-left px-6 py-3">Feira</th>
                    <th className="text-right px-4 py-3">%</th>
                    <th className="text-right px-4 py-3">Projeção</th>
                    <th className="text-right px-4 py-3">Sacado</th>
                    <th className="text-right px-4 py-3">Pendente</th>
                    <th className="text-right px-4 py-3">Disponível</th>
                    <th className="text-right px-4 py-3">C/ pendentes</th>
                    <th className="text-center px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                  {feiras.map((feira) => (
                    <FairRow key={feira.fairId} feira={feira} />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Últimos saques */}
      {ultimosSaques.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <History className="w-4 h-4 text-[#00aacd]" />
              Últimas Movimentações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50 dark:divide-white/5">
              {ultimosSaques.map((saque) => (
                <WithdrawalRow key={saque.id} saque={saque} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function TotaisCard({
  icon,
  label,
  value,
  color,
  bg = "bg-white dark:bg-white/5 border-slate-100 dark:border-white/10",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bg?: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${bg}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
      </div>
      <p className={`text-lg font-black ${color}`}>{value}</p>
    </div>
  );
}

function FairRow({ feira }: { feira: PartnerFairBreakdown }) {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-white/3 transition-colors">
      <td className="px-6 py-3 font-semibold text-slate-900 dark:text-white">{feira.fairName}</td>
      <td className="px-4 py-3 text-right text-slate-500">{pct(feira.percentage)}</td>
      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{fmt(feira.projectedEarnings)}</td>
      <td className="px-4 py-3 text-right text-green-600 dark:text-green-400 font-medium">{fmt(feira.sacadoAprovado)}</td>
      <td className="px-4 py-3 text-right text-orange-500">{fmt(feira.sacadoPendente)}</td>
      <td className={`px-4 py-3 text-right font-bold ${feira.isOverdrawn ? "text-red-600" : "text-purple-600 dark:text-purple-400"}`}>
        {fmt(feira.saldoDisponivel)}
      </td>
      <td className={`px-4 py-3 text-right text-sm ${feira.saldoConsiderandoPendentes < 0 ? "text-red-500" : "text-slate-500"}`}>
        {fmt(feira.saldoConsiderandoPendentes)}
      </td>
      <td className="px-4 py-3 text-center">
        {feira.isOverdrawn ? (
          <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">Negativo</Badge>
        ) : (
          <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">OK</Badge>
        )}
      </td>
    </tr>
  );
}

function WithdrawalRow({ saque }: { saque: PartnerWithdrawalItem }) {
  const statusStyle = STATUS_STYLE[saque.status] ?? "bg-slate-100 text-slate-600 border-slate-200";
  const statusLabel = STATUS_LABEL[saque.status] ?? saque.status;

  return (
    <div className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 dark:hover:bg-white/3 transition-colors">
      <div>
        <p className="font-medium text-slate-900 dark:text-white">{fmt(saque.amount)}</p>
        <div className="flex gap-2 mt-0.5 text-xs text-slate-400">
          {saque.fairName && <span>{saque.fairName}</span>}
          {saque.reason && <span>• {saque.reason}</span>}
          <span>• {new Date(saque.createdAt).toLocaleDateString("pt-BR")}</span>
        </div>
      </div>
      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusStyle}`}>
        {statusLabel}
      </span>
    </div>
  );
}
