import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useDashboardService } from "@/service/dashboard.service";

interface OriginChartState {
  series: { name: string; data: number[] }[];
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

export const OriginBarChart: React.FC<{ fairId: string }> = ({ fairId }) => {
  const { getVisitorsByOrigin, loading } = useDashboardService();

  const [chart, setChart] = useState<OriginChartState>({
    series: [
      {
        name: "Visitantes",
        data: [],
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 350,
        toolbar: { show: false },
        zoom: { enabled: false },
        width: "100%",
      },
      colors: ORIGIN_COLORS,
      plotOptions: {
        bar: {
          horizontal: false, // barras verticais
          columnWidth: "50%",
          borderRadius: 18,
        },
      },
      dataLabels: {
        enabled: false, // desabilita labels dentro das barras
      },
      grid: {
        yaxis: {
          lines: {
            show: false,
          },
        },
      },
      yaxis: {
        labels: {
          show: false,
        },
      },
      tooltip: {
        y: {
          formatter: (val) => `${val}`,
        },
      },
    },
  });

  useEffect(() => {
    (async () => {
      const data = await getVisitorsByOrigin(fairId);
      if (!data) return;

      const counts = data.visitorsByOrigin.map((v) => Number(v.count));
      const origins = data.visitorsByOrigin.map((v) => v.origin);

      setChart((cur) => ({
        series: [
          {
            name: "Visitantes",
            data: counts,
          },
        ],
        options: {
          ...cur.options,
          xaxis: {
            ...cur.options.xaxis!,
            categories: origins,
          },
        },
      }));
    })();
  }, [fairId]);

  if (loading) return <p>Carregando...</p>;
  if (chart.series[0].data.length === 0) return <p>Sem dados para exibir.</p>;

  return (
    <div className="h-full w-full overflow-hidden">
      {/* Gráfico de Barras */}
      <ReactApexChart
        options={chart.options}
        series={chart.series}
        type="bar"
        height={290}
        width={"100%"}
      />
    </div>
  );
};
