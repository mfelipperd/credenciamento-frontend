import { BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  label: string;
  height?: number;
  loading?: boolean;
}

export function EmptyChart({ label, height = 300, loading }: Props) {
  if (loading) {
    return <Skeleton className="w-full rounded-xl" style={{ height }} />;
  }

  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-xl bg-white/3 border border-white/5"
      style={{ height }}
    >
      <BarChart3 className="w-8 h-8 text-white/15" />
      <p className="text-[11px] font-bold text-white/30 uppercase tracking-wider">{label}</p>
      <p className="text-[10px] text-white/20">Nenhum dado disponível ainda</p>
    </div>
  );
}
