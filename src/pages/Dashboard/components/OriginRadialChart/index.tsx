import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useDashboardService } from "@/service/dashboard.service";

interface OriginChartState {
  series: number[];
  options: ApexCharts.ApexOptions;
}

const ORIGIN_COLORS = [
  "#EB2970", // cor 1
  "#F39B0C", // cor 2
  "#5CB1FC", // cor 3
  "#2CA02C", // cor 4
  "#9467BD", // cor 5
  "#8C564B", // cor 6
];

export const OriginRadialChart: React.FC<{ fairId: string }> = ({ fairId }) => {
  const { getVisitorsByOrigin, loading } = useDashboardService();
  const [chart, setChart] = useState<OriginChartState>({
    series: [],
    options: {
      chart: { height: 250, type: "radialBar" },
      colors: ORIGIN_COLORS,
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
      const data = await getVisitorsByOrigin(fairId);
      if (!data) return;

      const series = data.visitorsByOrigin.map((v) => Number(v.count));
      const labels = data.visitorsByOrigin.map((v) => v.origin);
      const total = series.reduce((sum, num) => sum + num, 0);

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
      id="origin-radial-chart"
      className="flex items-center justify-around gap-4 w-full"
    >
      {/* Legenda à esquerda */}
      <div className="flex flex-wrap w-[50%] h-full  gap-4">
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
      {/* Gráfico ApexCharts */}
      <ReactApexChart
        options={chart.options}
        series={chart.series}
        type="radialBar"
        height={350}
      />
    </div>
  );
};
