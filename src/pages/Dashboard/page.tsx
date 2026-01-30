import { CardRoot } from "@/components/Card";
import { CardTotals } from "@/components/CardTotals";
import { useDashboardController } from "./dashboard.controller";
import { CategoryRadialChart } from "./components/CategoryRadialChart";
import { OriginBarChart } from "./components/OriginRadialChart";
import { SectorsRadialChart } from "./components/SectorRadialChart";
import { CheckinPerHourChart } from "./components/CheckinPerHourChat";
import { ConversionChart } from "./components/ConversionChart";
import { Users, CheckCircle2, UserPlus } from "lucide-react";
import { LogoLoading } from "@/components/LogoLoading";

export const Dashboard = () => {
  const controller = useDashboardController();

  if (!controller.fairId) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <LogoLoading size={80} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Cards de Totais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardTotals
          title="Total de inscritos"
          value={controller.overview?.totalVisitors}
          icon={Users}
          color="#EB2970"
          className="shadow-pink-500/5 hover:shadow-pink-500/10"
        />
        <CardTotals
          title="Check-ins realizados"
          value={controller.overview?.totalCheckIns}
          icon={CheckCircle2}
          color="#00aacd"
          className="shadow-cyan-500/5 hover:shadow-cyan-500/10"
        />
        <CardTotals
          title="inscritos ausentes"
          value={Number(controller.absenteeVisitors?.absentVisitors.length)}
          icon={UserPlus}
          color="#F39B0C"
          className="shadow-orange-500/5 hover:shadow-orange-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico de Check-ins por Hora */}
        <CardRoot
          title="Fluxo de Check-ins (Tempo Real)"
          className="lg:col-span-8 md:col-span-1 col-span-1 min-h-[480px] glass-card border-white/5 shadow-2xl rounded-[32px]"
        >
          <CheckinPerHourChart fairId={controller.fairId} />
        </CardRoot>

        {/* Categoria de Visitantes */}
        <CardRoot
          title="Perfil do Público"
          className="lg:col-span-4 md:col-span-1 col-span-1 min-h-[480px] glass-card border-white/5 shadow-2xl rounded-[32px]"
        >
          <CategoryRadialChart fairId={controller.fairId} />
        </CardRoot>

        {/* Como Conheceu */}
        <CardRoot
          title="Canais de Aquisição"
          className="lg:col-span-6 md:col-span-1 col-span-1 min-h-[420px] glass-card border-white/5 shadow-2xl rounded-[32px]"
        >
          <OriginBarChart fairId={controller.fairId} />
        </CardRoot>

        {/* Setores de Interesse */}
        <CardRoot
          title="Interesses Principais"
          className="lg:col-span-6 md:col-span-1 col-span-1 min-h-[420px] glass-card border-white/5 shadow-2xl rounded-[32px]"
        >
          <SectorsRadialChart fairId={controller.fairId} />
        </CardRoot>

        {/* Conversão */}
        <CardRoot
          title="Performance por Canal de Divulgação"
          className="lg:col-span-12 md:col-span-1 col-span-1 min-h-[480px] glass-card border-white/5 shadow-2xl rounded-[32px]"
        >
          <ConversionChart fairId={controller.fairId} />
        </CardRoot>
      </div>
    </div>
  );
};
