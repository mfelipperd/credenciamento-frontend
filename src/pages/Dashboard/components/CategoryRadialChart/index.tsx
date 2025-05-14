import { useDashboardService } from "@/service/dashboard.service";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

interface CategoryChartState {
  series: number[];
  options: ApexCharts.ApexOptions;
}

const CATEGORY_COLORS = [
  "#EB2970", // azul
  "#F39B0C", // laranja
  "#5CB1FC", // verde
  "#d62728", // vermelho
  // … mais se precisar
];

export const CategoryRadialChart: React.FC<{ fairId: string }> = ({
  fairId,
}) => {
  const { getVisitorsByCategory, loading } = useDashboardService();
  const [chart, setChart] = useState<CategoryChartState>({
    series: [],
    options: {
      chart: { height: 250, type: "radialBar" },
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: { fontSize: "22px" },
            value: { fontSize: "16px" },
            total: {
              show: true,
              label: "Total",
              formatter: () => "0",
            },
          },
        },
      },
      labels: [],
    },
  });

  useEffect(() => {
    (async () => {
      const data = await getVisitorsByCategory(fairId);
      if (!data) return;

      const series = data.visitorsByCategory.map((v) => Number(v.count));
      const labels = data.visitorsByCategory.map((v) => v.visitor_category);
      const total = series.reduce((sum, n) => sum + n, 0);

      setChart({
        series,
        options: {
          ...chart.options,
          colors: CATEGORY_COLORS,
          labels,
          plotOptions: {
            radialBar: {
              ...chart.options.plotOptions!.radialBar!,
              dataLabels: {
                ...chart.options.plotOptions!.radialBar!.dataLabels!,
                total: {
                  show: true,
                  label: "Total",
                  formatter: () => total.toString(),
                },
              },
            },
          },
        },
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fairId]);

  if (loading) return <p>Carregando...</p>;
  if (chart.series.length === 0) return <p>Sem dados para exibir.</p>;
  console.log(chart);
  return (
    <div
      id="category-radial-chart"
      className="flex items-center justify-around gap-4 w-full"
    >
      <div className="flex flex-col gap-8">
        {chart.options.labels?.map((label, i) => (
          <div key={label} className="flex items-center gap-8">
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
      <ReactApexChart
        options={chart.options}
        series={chart.series}
        type="radialBar"
        height={350}
      />
    </div>
  );
};
