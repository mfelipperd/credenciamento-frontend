import { useRevenueStats } from "@/hooks/useFinance";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
      className={`group relative overflow-hidden h-32 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 transition-all duration-500 hover:scale-[1.02] hover:bg-white/10 shadow-2xl ${
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

        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <p className="text-white text-3xl font-black tracking-tighter">
              {value}
            </p>
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          </div>
          {subtitle && (
            <p className="text-white/40 text-[10px] font-medium mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
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
        color="#22c55e"
        onClick={onTotalRevenueClick}
        subtitle={onTotalRevenueClick ? "Clique para ver fluxo de caixa" : undefined}
      />

      <StatCard
        title="Quantidade de Receitas"
        value={stats.totalRevenues}
        icon={Receipt}
        color="#00aacd"
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
