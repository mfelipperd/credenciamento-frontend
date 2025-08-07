import { cn } from "@/lib/utils";

interface CardTotalsProps {
  title?: string;
  value?: string | number;
  className?: string;
}

export const CardTotals = ({ className, title, value }: CardTotalsProps) => {
  return (
    <div
      className={cn(
        "h-16 sm:h-20 md:h-24 bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-between py-2 px-3 sm:px-4 shadow-2xl relative overflow-hidden",
        className
      )}
    >
      {/* Conteúdo */}
      <p className="text-white text-xs sm:text-sm md:text-base font-semibold text-center leading-tight text-enhanced-strong [text-shadow:_0_2px_8px_rgba(0,0,0,0.8)] relative z-10">
        {title}
      </p>
      <p className="text-white text-lg sm:text-2xl md:text-3xl font-bold text-enhanced-strong [text-shadow:_0_2px_8px_rgba(0,0,0,0.8)] relative z-10">
        {value || 0}
      </p>
    </div>
  );
};
