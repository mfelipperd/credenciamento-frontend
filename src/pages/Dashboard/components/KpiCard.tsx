import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  subtext?: string;
  accentColor?: string;
  icon?: LucideIcon;
  loading?: boolean;
}

export function KpiCard({ label, value, subtext, accentColor = "#00aacd", icon: Icon, loading }: KpiCardProps) {
  if (loading) {
    return (
      <div className="relative p-5 rounded-2xl bg-white/3 border border-white/5 overflow-hidden">
        <Skeleton className="h-3 w-24 mb-3" />
        <Skeleton className="h-7 w-36 mb-2" />
        <Skeleton className="h-3 w-28" />
      </div>
    );
  }

  return (
    <div
      className="relative p-5 rounded-2xl bg-white/3 border border-white/5 overflow-hidden hover:bg-white/5 transition-colors"
      style={{ borderLeftColor: accentColor, borderLeftWidth: 3 }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 leading-tight">
          {label}
        </p>
        {Icon && <Icon className="w-4 h-4 shrink-0" style={{ color: accentColor }} />}
      </div>

      <p className="text-2xl font-black text-white mt-2 leading-none tabular-nums" style={{ color: accentColor }}>
        {value}
      </p>

      {subtext && (
        <p className="text-[10px] text-white/35 font-medium mt-1.5 leading-snug">
          {subtext}
        </p>
      )}
    </div>
  );
}
