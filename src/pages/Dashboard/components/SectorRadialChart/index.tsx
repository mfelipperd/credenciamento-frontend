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
      chart: { height: 350, type: "radialBar" },
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
    <div className="w-full h-full flex flex-col items-center justify-center p-4 min-h-[400px]">
      <div className="w-full max-w-full h-full flex items-center justify-center">
        <ReactApexChart
          options={{
            ...chart.options,
            chart: {
              ...chart.options.chart,
              height: 350,
              width: "100%",
              parentHeightOffset: 0,
              offsetX: 0,
              offsetY: 0,
            },
            plotOptions: {
              radialBar: {
                ...chart.options.plotOptions?.radialBar,
                dataLabels: {
                  name: { fontSize: "16px" },
                  value: { fontSize: "14px" },
                  total: {
                    show: true,
                    label: "Total",
                    fontSize: "14px",
                    formatter: () =>
                      chart.series.reduce((sum, n) => sum + n, 0).toString(),
                  },
                },
              },
            },
          }}
          series={chart.series}
          type="radialBar"
          height={350}
          width="100%"
        />
      </div>
    </div>
  );
};
