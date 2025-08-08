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

interface FinanceKpisProps {
  data?: Kpis;
  isLoading: boolean;
}

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  icon: React.ReactNode;
  color: string;
}

function KpiCard({ title, value, subtitle, trend, icon, color }: KpiCardProps) {
  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex items-center">
          {trend > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : trend < 0 ? (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          ) : null}
          <span
            className={`text-sm font-medium ${
              trend > 0
                ? "text-green-600"
                : trend < 0
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {trend > 0 ? "+" : ""}
            {trend?.toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500 ml-1">
            vs período anterior
          </span>
        </div>
      )}
    </Card>
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

export function FinanceKpis({ data, isLoading }: FinanceKpisProps) {
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
        icon={<DollarSign className="w-6 h-6 text-white" />}
        color="bg-blue-500"
      />

      <KpiCard
        title="Total Recebido"
        value={formatCurrency(data.totalReceivedCents)}
        subtitle={formatPercentage(data.receivedPercentage) + " do contratado"}
        trend={data.receivedGrowth}
        icon={<CheckCircle className="w-6 h-6 text-white" />}
        color="bg-green-500"
      />

      <KpiCard
        title="Em Aberto"
        value={formatCurrency(data.totalPendingCents)}
        subtitle={formatPercentage(data.pendingPercentage) + " do contratado"}
        icon={<CreditCard className="w-6 h-6 text-white" />}
        color="bg-yellow-500"
      />

      <KpiCard
        title="Em Atraso"
        value={formatCurrency(data.totalOverdueCents)}
        subtitle={`${data.overdueCount} parcelas`}
        icon={<AlertCircle className="w-6 h-6 text-white" />}
        color="bg-red-500"
      />
    </div>
  );
}
