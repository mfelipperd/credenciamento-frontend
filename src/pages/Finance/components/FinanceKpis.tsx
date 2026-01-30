import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import type { Kpis } from "@/interfaces/finance";
import type { LucideIcon } from "lucide-react";

interface FinanceKpisProps {
  data?: Kpis;
  isLoading: boolean;
  onTotalContractedClick?: () => void;
  onTotalReceivedClick?: () => void;
}

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  icon: LucideIcon;
  color: string;
  onClick?: () => void;
}

function KpiCard({ title, value, subtitle, trend, icon: Icon, color, onClick }: KpiCardProps) {
  return (
    <div
      className={`group relative overflow-hidden h-40 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 transition-all duration-500 hover:scale-[1.02] hover:bg-white/10 shadow-2xl ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      {/* Background Glow */}
      <div 
        className="absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-20 transition-opacity group-hover:opacity-40"
        style={{ backgroundColor: color }}
      />

      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
            {title}
          </p>
          <div 
            className="p-2 rounded-xl bg-white/5 text-white/60 group-hover:scale-110 transition-transform duration-500"
            style={{ color: color }}
          >
            <Icon size={18} />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <p className="text-white text-3xl font-black tracking-tighter">
              {value}
            </p>
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          </div>
          
          <div className="flex items-center justify-between mt-1">
            {subtitle && (
              <p className="text-white/40 text-[10px] font-medium truncate max-w-[150px]">
                {subtitle}
              </p>
            )}
            
            {trend !== undefined && (
              <div className="flex items-center gap-1">
                {trend > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                ) : trend < 0 ? (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                ) : null}
                <span
                  className={`text-[10px] font-bold ${
                    trend > 0
                      ? "text-green-500"
                      : trend < 0
                      ? "text-red-500"
                      : "text-white/40"
                  }`}
                >
                  {trend > 0 ? "+" : ""}
                  {trend?.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
      <div className="mt-4">
        <Skeleton className="h-4 w-36" />
      </div>
    </Card>
  );
}

export function FinanceKpis({ data, isLoading, onTotalContractedClick, onTotalReceivedClick }: FinanceKpisProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KpiCard
        title="Total Contratado"
        value={formatCurrency(data.totalContractedCents)}
        subtitle={`${data.totalContracts} contratos`}
        trend={data.contractedGrowth}
        icon={DollarSign}
        color="#00aacd"
        onClick={onTotalContractedClick}
      />

      <KpiCard
        title="Total Recebido"
        value={formatCurrency(data.totalReceivedCents)}
        subtitle={formatPercentage(data.receivedPercentage) + " do contratado"}
        trend={data.receivedGrowth}
        icon={CheckCircle}
        color="#22c55e"
        onClick={onTotalReceivedClick}
      />

      <KpiCard
        title="Em Aberto"
        value={formatCurrency(data.totalPendingCents)}
        subtitle={formatPercentage(data.pendingPercentage) + " do contratado"}
        icon={CreditCard}
        color="#eab308"
      />

      <KpiCard
        title="Em Atraso"
        value={formatCurrency(data.totalOverdueCents)}
        subtitle={`${data.overdueCount} parcelas`}
        icon={AlertCircle}
        color="#ef4444"
      />
    </div>
  );
}
