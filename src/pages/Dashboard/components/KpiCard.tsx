import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  subtext?: string;
  accentColor?: string;
  icon?: LucideIcon;
  loading?: boolean;
  featured?: boolean;
}

export function KpiCard({ label, value, subtext, accentColor = "#00aacd", icon: Icon, loading, featured }: KpiCardProps) {
  if (loading) {
    return (
      <div className="relative min-h-24 overflow-hidden rounded-2xl border border-white/5 bg-white/3 p-3.5 sm:min-h-28 sm:p-5">
        <Skeleton className="h-3 w-24 mb-3" />
        <Skeleton className="h-7 w-36 mb-2" />
        <Skeleton className="h-3 w-28" />
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-24 overflow-hidden rounded-2xl border bg-white/3 p-3.5 transition-colors hover:bg-white/5 sm:min-h-28 sm:p-5 ${featured ? "border-white/10 shadow-lg shadow-black/10" : "border-white/5"}`}
      style={{ borderLeftColor: accentColor, borderLeftWidth: 3 }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 leading-tight">
          {label}
        </p>
        {Icon && <Icon className="w-4 h-4 shrink-0" style={{ color: accentColor }} />}
      </div>

      <p className="mt-2 truncate text-lg font-black leading-none tabular-nums text-white sm:text-2xl" style={{ color: accentColor }} title={value}>
        {value}
      </p>

      {subtext && (
        <p className="mt-1.5 line-clamp-2 text-[9px] font-medium leading-snug text-white/35 sm:text-[10px]">
          {subtext}
        </p>
      )}
    </div>
  );
}
