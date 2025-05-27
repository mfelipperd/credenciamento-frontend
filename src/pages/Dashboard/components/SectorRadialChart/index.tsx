import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useDashboardService } from "@/service/dashboard.service";

interface SectorsChartState {
  series: number[];
  options: ApexCharts.ApexOptions;
}

const SECTOR_COLORS = [
  "#EB2970", // cor 1
  "#F39B0C", // cor 2
  "#5CB1FC", // cor 3
  "#2CA02C", // cor 4
  "#9467BD", // cor 5
  "#8C564B", // cor 6
];

export const SectorsRadialChart: React.FC<{ fairId: string }> = ({
  fairId,
}) => {
  const { getVisitorsBySectors, loading } = useDashboardService();
  const [chart, setChart] = useState<SectorsChartState>({
    series: [],
    options: {
      chart: { height: 250, type: "radialBar" },
      colors: SECTOR_COLORS,
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: { fontSize: "22px" },
            value: { fontSize: "16px" },
            total: { show: true, label: "Total", formatter: () => "0" },
          },
        },
      },
      labels: [],
    },
  });

  useEffect(() => {
    (async () => {
      const data = await getVisitorsBySectors(fairId);
      if (!data) return;

      const series = data.visitorsBySectors.map((v) => Number(v.count));
      const labels = data.visitorsBySectors.map((v) => v.sector);
      const total = series.reduce((sum, n) => sum + n, 0);

      setChart((cur) => ({
        series,
        options: {
          ...cur.options,
          labels,
          plotOptions: {
            radialBar: {
              dataLabels: {
                ...cur.options.plotOptions!.radialBar!.dataLabels!,
                total: {
                  show: true,
                  label: "Total",
                  formatter: () => total.toString(),
                },
              },
            },
          },
        },
      }));
    })();
  }, [fairId]);

  if (loading) return <p>Carregando...</p>;
  if (chart.series.length === 0) return <p>Sem dados para exibir.</p>;

  return (
    <div
      id="sectors-radial-chart"
      className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-around gap-4 w-full"
    >
      {/* Legenda */}
      <div className="flex flex-wrap w-full sm:w-[50%] gap-4">
        {chart.options.labels!.map((label, i) => (
          <div key={label} className="flex items-center gap-4">
            <div
              className="h-5 w-5 rounded-full"
              style={{ backgroundColor: chart.options.colors![i] }}
            />
            <p className="text-lg capitalize text-gray-600 font-bold">
              {label}
            </p>
            <p className="text-base font-light text-gray-500">
              {chart.series[i]}
            </p>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <ReactApexChart
        options={chart.options}
        series={chart.series}
        type="radialBar"
        height={350}
      />
    </div>
  );
};
