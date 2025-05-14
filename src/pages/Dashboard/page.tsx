import { CardRoot } from "@/components/Card";
import { CardTotals } from "@/components/CardTotals";
import { useDashboardController } from "./dashboard.controller";
import { CategoryRadialChart } from "./components/CategoryRadialChart";
import { OriginRadialChart } from "./components/OriginRadialChart";

export const Dashboard = () => {
  const controller = useDashboardController();
  return (
    <div className="w-ful grid grid-cols-12 gap-4">
      <CardTotals
        className="bg-gray-500 sm:col-span-4 col-span-full "
        title="Total de inscritos"
        value={controller.overview?.totalVisitors}
      />
      <CardTotals
        className="bg-green-600  sm:col-span-4 col-span-full "
        title="Check-ins realizados"
        value={controller.overview?.totalCheckIns}
      />
      <CardTotals
        className="bg-yellow-600 sm:col-span-4 col-span-full "
        title="inscritos ausentes"
        value={Number(
          (controller.overview?.totalVisitors ?? 0) -
            (controller.overview?.totalCheckIns ?? 0)
        )}
      />
      <CardRoot
        title="tipos de ingresso "
        className="bg-white sm:col-span-6 h-96 min-h-fit col-span-full"
      >
        <CategoryRadialChart fairId={controller.fairId} />
      </CardRoot>
      <CardRoot
        title="como conheceu"
        className="bg-white sm:col-span-6 h-96 min-h-fit col-span-full"
      >
        <OriginRadialChart fairId={controller.fairId} />
      </CardRoot>{" "}
      <CardRoot
        title="Equipe do evento "
        className="bg-white sm:col-span-4 h-96 col-span-full"
      />{" "}
      <CardRoot
        title="mapa de inscritos "
        className="bg-white sm:col-span-4 h-96 col-span-full"
      />{" "}
      <CardRoot
        title="Setor de interesse"
        className="bg-white sm:col-span-4 h-96 col-span-full"
      />
    </div>
  );
};
