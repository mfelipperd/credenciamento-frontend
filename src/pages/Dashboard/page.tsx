import { HardHat } from "lucide-react";

export const Dashboard = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 select-none">
      <div className="relative">
        <div className="absolute inset-0 bg-brand-pink/20 blur-[60px] rounded-full" />
        <div className="relative flex items-center justify-center w-24 h-24 rounded-[28px] bg-white/5 border border-white/10">
          <HardHat className="w-10 h-10 text-brand-pink" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
          Em Construção
        </h1>
        <div className="h-1 w-16 bg-linear-to-r from-brand-pink to-brand-cyan rounded-full mx-auto" />
        <p className="text-sm text-white/40 font-medium mt-3 max-w-xs">
          Esta página está sendo preparada. Em breve estará disponível.
        </p>
      </div>
    </div>
  );
};
