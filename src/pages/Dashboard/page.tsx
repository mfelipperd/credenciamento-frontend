import { CardRoot } from "@/components/Card";
import { CardTotals } from "@/components/CardTotals";
import { useDashboardController } from "./dashboard.controller";
import { CategoryRadialChart } from "./components/CategoryRadialChart";
import { OriginBarChart } from "./components/OriginRadialChart";
import { SectorsRadialChart } from "./components/SectorRadialChart";
import { CheckinPerHourChart } from "./components/CheckinPerHourChat";
import { ConversionChart } from "./components/ConversionChart";

export const Dashboard = () => {
  const controller = useDashboardController();

  // Se não há fairId, mostra mensagem de carregamento
  if (!controller.fairId) {
    return (
      <div className="w-full flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan mx-auto mb-4"></div>
          <p className="text-white/40 font-black uppercase tracking-widest text-[10px]">
            Sincronizando Dados...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
      <CardTotals
        className="bg-linear-to-br from-brand-blue to-black/20 border border-white/10 lg:col-span-4 md:col-span-1 col-span-1 shadow-[0_20px_40px_rgba(0,0,0,0.3)] rounded-3xl"
        title="Total de inscritos"
        value={controller.overview?.totalVisitors}
      />
      <CardTotals
        className="bg-linear-to-br from-brand-cyan to-brand-cyan/50 border border-brand-cyan/20 lg:col-span-4 md:col-span-1 col-span-1 shadow-[0_20px_40px_rgba(0,170,205,0.2)] rounded-3xl"
        title="Check-ins realizados"
        value={controller.overview?.totalCheckIns}
      />
      <CardTotals
        className="bg-linear-to-br from-brand-pink to-brand-pink/50 border border-brand-pink/20 lg:col-span-4 md:col-span-2 col-span-1 shadow-[0_20px_40px_rgba(233,30,99,0.2)] rounded-3xl"
        title="inscritos ausentes"
        value={Number(controller.absenteeVisitors?.absentVisitors.length)}
      />

      {/* Primeira linha de gráficos */}
      <CardRoot
        title="tipos de ingresso"
        className="lg:col-span-6 md:col-span-2 col-span-1 h-[420px] glass-card border-white/5 shadow-2xl rounded-3xl"
      >
        <CategoryRadialChart fairId={controller.fairId} />
      </CardRoot>
      <CardRoot
        title="como conheceu"
        className="lg:col-span-6 md:col-span-2 col-span-1 h-[420px] glass-card border-white/5 shadow-2xl rounded-3xl"
      >
        <OriginBarChart fairId={controller.fairId} />
      </CardRoot>

      {/* Segunda linha de gráficos */}
      <CardRoot
        title="Horários de Check-ins"
        className="lg:col-span-8 md:col-span-2 col-span-1 h-[480px] glass-card border-white/5 shadow-2xl rounded-3xl"
      >
        <CheckinPerHourChart fairId={controller.fairId} />
      </CardRoot>
      <CardRoot
        title="Setor de interesse"
        className="lg:col-span-4 md:col-span-2 col-span-1 h-[480px] glass-card border-white/5 shadow-2xl rounded-3xl"
      >
        <SectorsRadialChart fairId={controller.fairId} />
      </CardRoot>

      {/* Gráfico de conversão ocupa toda a largura */}
      <CardRoot
        title="Taxa de Conversão por Meio de Divulgação"
        className="lg:col-span-12 md:col-span-2 col-span-1 min-h-[480px] glass-card border-white/5 shadow-2xl rounded-3xl"
      >
        <ConversionChart fairId={controller.fairId} />
      </CardRoot>
    </div>
  );
};
