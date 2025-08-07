import { useDashboardService } from "@/service/dashboard.service";
import React, { useEffect, useState, useRef } from "react";
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
  const lastFetchedFairIdRef = useRef<string | null>(null);
  const [chart, setChart] = useState<CategoryChartState>({
    series: [],
    options: {
      chart: { height: 250, type: "radialBar" },
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

  // Estado separado para armazenar os valores absolutos
  const [absoluteValues, setAbsoluteValues] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      // Só faz requisição se fairId é válido e diferente da última requisição
      if (!fairId || fairId.trim() === "") {
        console.log(
          "CategoryRadialChart: fairId inválido, não fazendo requisição:",
          fairId
        );
        return;
      }

      // Evita requisições duplicadas
      if (lastFetchedFairIdRef.current === fairId) {
        return;
      }

      lastFetchedFairIdRef.current = fairId;

      const data = await getVisitorsByCategory(fairId);
      if (!data) return;

      const counts = data.visitorsByCategory.map((v) => Number(v.count));
      const labels = data.visitorsByCategory.map((v) => v.visitor_category);
      const total = counts.reduce((sum, n) => sum + n, 0);

      // Converte os valores absolutos para porcentagens (0-100)
      const series = counts.map((count) =>
        total > 0 ? Math.round((count / total) * 100) : 0
      );

      // Armazenar os valores absolutos no estado separado
      setAbsoluteValues(counts);

      setChart({
        series,
        options: {
          chart: { height: 250, type: "radialBar" },
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
          colors: CATEGORY_COLORS,
          labels,
        },
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fairId]);

  if (loading) return <p>Carregando...</p>;
  if (chart.series.length === 0) return <p>Sem dados para exibir.</p>;

  console.log(chart);
  return (
    <div className="w-full h-full flex flex-col lg:flex-row items-center justify-between gap-4 p-4 min-h-[350px]">
      {/* Legenda */}
      <div className="flex flex-col gap-3 order-2 lg:order-1 w-full lg:w-auto">
        {chart.options.labels?.map((label, i) => (
          <div
            key={label}
            className="flex items-center gap-3 justify-between lg:justify-start"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: chart.options.colors![i] }}
              />
              <p className="text-sm sm:text-base capitalize text-muted-foreground font-semibold">
                {label}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm sm:text-base font-medium text-foreground">
                {absoluteValues[i] || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {chart.series[i]}%
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div className="flex-1 order-1 lg:order-2 w-full flex justify-center items-center">
        <div className="w-full max-w-full h-full flex items-center justify-center">
          <ReactApexChart
            options={{
              ...chart.options,
              chart: {
                ...chart.options.chart,
                height: 300,
                width: "100%",
                parentHeightOffset: 0,
                offsetX: 0,
                offsetY: 0,
              },
            }}
            series={chart.series}
            type="radialBar"
            height={300}
            width="100%"
          />
        </div>
      </div>
    </div>
  );
};
