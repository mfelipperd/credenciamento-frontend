import { cn } from "@/lib/utils";

interface CardTotalsProps {
  title?: string;
  value?: string;
  className?: string;
}

export const CardTotals = ({ className, title, value }: CardTotalsProps) => {
  return (
    <div
      className={cn(
        "bg-white col-span-4 h-20 rounded-2xl flex flex-col items-center justify-between py-2 px-4 ",
        className
      )}
    >
      <p className="text-white text-base  font-bold">{title}</p>
      <p className="text-white text-3xl  font-bold">{value || 0}</p>
    </div>
  );
};
