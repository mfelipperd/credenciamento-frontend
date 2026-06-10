import { useRevenueStats } from "@/hooks/useFinance";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Receipt, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface RevenueStatsProps {
  fairId: string;
  onTotalRevenueClick?: () => void;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  onClick?: () => void;
  subtitle?: string;
}

function StatCard({ title, value, icon: Icon, color, onClick, subtitle }: StatCardProps) {
  return (
    <div
      className={`group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 transition-all duration-500 hover:scale-[1.02] hover:bg-white/10 shadow-2xl ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div
        className="absolute -right-4 -top-4 w-28 h-28 blur-3xl opacity-15 transition-opacity group-hover:opacity-30"
        style={{ backgroundColor: color }}
      />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
            {title}
          </p>
          <div
            className="p-2 rounded-xl bg-white/5 group-hover:scale-110 transition-transform duration-500"
            style={{ color }}
          >
            <Icon size={18} />
          </div>
        </div>

        <div>
          <p className="text-white text-3xl font-black tracking-tighter leading-none">
            {value}
          </p>
          {subtitle && (
            <p className="text-white/30 text-[10px] font-medium mt-2">
              {subtitle}
            </p>
          )}
        </div>

        <div className="h-0.5 w-full rounded-full" style={{ backgroundColor: color, opacity: 0.25 }} />
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-2 w-24 bg-white/10" />
        <Skeleton className="h-8 w-8 rounded-xl bg-white/10" />
      </div>
      <Skeleton className="h-9 w-32 bg-white/10 mb-2" />
      <Skeleton className="h-0.5 w-full bg-white/10" />
    </div>
  );
}

export function RevenueStats({ fairId, onTotalRevenueClick }: RevenueStatsProps) {
  const { data: stats, isLoading } = useRevenueStats(fairId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Total de Receitas"
        value={formatCurrency(stats.totalValue)}
        icon={DollarSign}
        color="#00aacd"
        onClick={onTotalRevenueClick}
        subtitle={onTotalRevenueClick ? "Clique para ver fluxo de caixa" : undefined}
      />

      <StatCard
        title="Quantidade de Receitas"
        value={stats.totalRevenues}
        icon={Receipt}
        color="#EB2970"
      />

      <StatCard
        title="Média por Receita"
        value={formatCurrency(stats.averagePerRevenue)}
        icon={TrendingUp}
        color="#a855f7"
      />
    </div>
  );
}
