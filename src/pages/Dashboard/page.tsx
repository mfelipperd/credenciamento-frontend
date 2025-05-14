import { CardRoot } from "@/components/Card";
import { CardTotals } from "@/components/CardTotals";
import { useDashboardController } from "./dashboard.controller";

export const Dashboard = () => {
  const controller = useDashboardController();
  return (
    <div className="w-ful grid grid-cols-12 gap-4">
      <CardTotals
        className="bg-gray-500 col-span-4 "
        title="Total de inscritos"
        value={controller.overview?.totalVisitors}
      />
      <CardTotals
        className="bg-green-600  col-span-4 "
        title="Check-ins realizados"
        value={controller.overview?.totalCheckIns}
      />
      <CardTotals
        className="bg-yellow-600 col-span-4 "
        title="inscritos ausentes"
        value={Number(
          (controller.overview?.totalVisitors ?? 0) -
            (controller.overview?.totalCheckIns ?? 0)
        )}
      />
      <CardRoot title="tipos de ingresso " className="bg-white col-span-8 h-96">
        <p>TESTEEEE</p>
      </CardRoot>
      <CardRoot title="como conheceu" className="bg-white col-span-4 h-96" />{" "}
      <CardRoot
        title="Equipe do evento "
        className="bg-white col-span-4 h-96"
      />{" "}
      <CardRoot
        title="mapa de inscritos "
        className="bg-white col-span-4 h-96"
      />{" "}
      <CardRoot
        title="Setor de interesse"
        className="bg-white col-span-4 h-96"
      />
    </div>
  );
};
