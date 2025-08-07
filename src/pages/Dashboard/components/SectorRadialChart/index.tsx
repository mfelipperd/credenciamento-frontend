import React, { useEffect, useState, useRef } from "react";
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
  const lastFairIdRef = useRef<string | null>(null);
  const [chart, setChart] = useState<SectorsChartState>({
    series: [],
    options: {
      chart: { height: 350, type: "radialBar" },
      colors: SECTOR_COLORS,
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: { fontSize: "22px", color: "#ffffff" },
            value: { fontSize: "16px", color: "#ffffff" },
            total: {
              show: true,
              label: "Total",
              formatter: () => "0",
              color: "#ffffff",
            },
          },
        },
      },
      labels: [],
    },
  });

  useEffect(() => {
    (async () => {
      // Só faz requisição se fairId é válido e diferente do anterior
      if (!fairId || fairId.trim() === "" || lastFairIdRef.current === fairId) {
        return;
      }

      lastFairIdRef.current = fairId;
      const data = await getVisitorsBySectors(fairId);
      if (!data) return;

      const counts = data.visitorsBySectors.map((v) => Number(v.count));
      const labels = data.visitorsBySectors.map((v) => v.sector);
      const total = counts.reduce((sum, n) => sum + n, 0);

      // Converte os valores absolutos para porcentagens (0-100)
      const series = counts.map((count) =>
        total > 0 ? Math.round((count / total) * 100) : 0
      );

      setChart((cur) => ({
        series,
        options: {
          ...cur.options,
          labels,
          plotOptions: {
            radialBar: {
              dataLabels: {
                name: { fontSize: "22px", color: "#ffffff" },
                value: { fontSize: "16px", color: "#ffffff" },
                total: {
                  show: true,
                  label: "Total",
                  formatter: () => total.toString(),
                  color: "#ffffff",
                },
              },
            },
          },
        },
      }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fairId]); // Apenas fairId nas dependências, SEM funções

  if (loading) return <p>Carregando...</p>;
  if (chart.series.length === 0) return <p>Sem dados para exibir.</p>;

  return (
    <div className="w-full h-full flex items-center justify-center p-4 min-h-[400px]">
      <div className="w-full max-w-full h-full flex items-center justify-center">
        <ReactApexChart
          options={{
            ...chart.options,
            chart: {
              ...chart.options.chart,
              height: 380,
              width: "100%",
              parentHeightOffset: 0,
            },
          }}
          series={chart.series}
          type="radialBar"
          height={380}
          width="100%"
        />
      </div>
    </div>
  );
};
