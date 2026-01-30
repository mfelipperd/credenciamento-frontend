import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface CardTotalsProps {
  title?: string;
  value?: string | number;
  className?: string;
  icon?: LucideIcon;
  color?: string;
}

export const CardTotals = ({ className, title, value, icon: Icon, color }: CardTotalsProps) => {
  return (
    <div
      className={cn(
        "group relative overflow-hidden h-32 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 transition-all duration-500 hover:scale-[1.02] hover:bg-white/10 shadow-2xl",
        className
      )}
    >
      {/* Background Glow */}
      <div 
        className="absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-20 transition-opacity group-hover:opacity-40"
        style={{ backgroundColor: color || "#00aacd" }}
      />

      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
            {title}
          </p>
          {Icon && (
            <div 
              className="p-2 rounded-xl bg-white/5 text-white/60 group-hover:scale-110 transition-transform duration-500"
              style={{ color: color }}
            >
              <Icon size={18} />
            </div>
          )}
        </div>
        
        <div className="flex items-baseline gap-2">
          <p className="text-white text-4xl font-black tracking-tighter">
            {value || 0}
          </p>
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
