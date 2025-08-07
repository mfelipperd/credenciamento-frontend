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
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
      <CardTotals
        className="bg-blue-800 dark:bg-blue-950 lg:col-span-4 md:col-span-1 col-span-1"
        title="Total de inscritos"
        value={controller.overview?.totalVisitors}
      />
      <CardTotals
        className="bg-green-600 dark:bg-green-800 lg:col-span-4 md:col-span-1 col-span-1"
        title="Check-ins realizados"
        value={controller.overview?.totalCheckIns}
      />
      <CardTotals
        className="bg-yellow-600 dark:bg-yellow-800 lg:col-span-4 md:col-span-2 col-span-1"
        title="inscritos ausentes"
        value={Number(controller.absenteeVisitors?.absentVisitors.length)}
      />

      {/* Primeira linha de gráficos */}
      <CardRoot
        title="tipos de ingresso"
        className="lg:col-span-6 md:col-span-2 col-span-1 h-[420px]"
      >
        <CategoryRadialChart fairId={controller.fairId} />
      </CardRoot>
      <CardRoot
        title="como conheceu"
        className="lg:col-span-6 md:col-span-2 col-span-1 h-[420px]"
      >
        <OriginBarChart fairId={controller.fairId} />
      </CardRoot>

      {/* Segunda linha de gráficos */}
      <CardRoot
        title="Horarios de Checkins"
        className="lg:col-span-8 md:col-span-2 col-span-1 h-[480px]"
      >
        <CheckinPerHourChart fairId={controller.fairId} />
      </CardRoot>
      <CardRoot
        title="Setor de interesse"
        className="lg:col-span-4 md:col-span-2 col-span-1 h-[480px]"
      >
        <SectorsRadialChart fairId={controller.fairId} />
      </CardRoot>

      {/* Gráfico de conversão ocupa toda a largura */}
      <CardRoot
        title="Taxa de Conversão por Meio de Divulgação"
        className="lg:col-span-12 md:col-span-2 col-span-1 min-h-[480px]"
      >
        <ConversionChart fairId={controller.fairId} />
      </CardRoot>
    </div>
  );
};
