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
        "bg-white h-16 sm:h-20 md:h-24 rounded-lg sm:rounded-xl flex flex-col items-center justify-between py-2 px-3 sm:px-4",
        className
      )}
    >
      <p className="text-white text-xs sm:text-sm md:text-base font-semibold text-center leading-tight">
        {title}
      </p>
      <p className="text-white text-lg sm:text-2xl md:text-3xl font-bold">
        {value || 0}
      </p>
    </div>
  );
};
