import { useDashboardService } from "@/service/dashboard.service";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import type { ConversionByHowDidYouKnow } from "@/interfaces/dashboard";

interface ConversionChartState {
  series: number[];
  options: ApexCharts.ApexOptions;
}

const CONVERSION_COLORS = [
  "#3B82F6", // facebook - azul
  "#E91E63", // instagram - rosa
  "#4CAF50", // google - verde
  "#FF9800", // outdoor - laranja
  "#9C27B0", // busdoor - roxo
  "#F44336", // tv - vermelho
  "#00BCD4", // indicação - ciano
  "#795548", // representante - marrom
  "#607D8B", // outros - cinza azulado
];

// Mapeamento de labels mais amigáveis
const LABEL_MAPPING: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  google: "Google",
  outdoor: "Outdoor",
  busdoor: "Busdoor",
  tv: "Televisão",
  indicação: "Indicação",
  representante: "Indicação de Representante",
  outro: "Outros",
};

export const ConversionByHowDidYouKnowChart: React.FC<{ fairId: string }> = ({
  fairId,
}) => {
  const { getConversionsByHowDidYouKnow, loading } = useDashboardService();
  const [chart, setChart] = useState<ConversionChartState>({
    series: [],
    options: {
      chart: {
        height: 380,
        type: "donut",
        animations: {
          enabled: true,
          speed: 800,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: number) {
          return val.toFixed(1) + "%";
        },
        style: {
          fontSize: "12px",
          fontWeight: "bold",
          colors: ["#ffffff"],
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: "70%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Total de Conversões",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#ffffff",
                formatter: () => "0",
              },
              value: {
                show: true,
                fontSize: "24px",
                fontWeight: "bold",
                color: "#ffffff",
              },
            },
          },
        },
      },
      legend: {
        show: false, // Vamos criar nossa própria legenda customizada
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: function (val: number) {
            return val + " conversões";
          },
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 300,
              height: 300,
            },
          },
        },
      ],
      labels: [],
    },
  });

  useEffect(() => {
    // Só faz a chamada se fairId existe e é válido
    if (!fairId || fairId.trim() === "") {
      console.log(
        "ConversionByHowDidYouKnowChart: fairId não disponível, pulando chamada"
      );
      return;
    }

    (async () => {
      const data = await getConversionsByHowDidYouKnow(fairId);
      if (!data || !data.conversions.length) return;

      const series = data.conversions.map(
        (item: ConversionByHowDidYouKnow) => item.totalCheckIns
      );
      const rawLabels = data.conversions.map(
        (item: ConversionByHowDidYouKnow) => item.howDidYouKnow
      );
      const labels = rawLabels.map(
        (label: string) => LABEL_MAPPING[label] || label
      );
      const total = series.reduce((sum: number, n: number) => sum + n, 0);

      setChart({
        series,
        options: {
          ...chart.options,
          colors: CONVERSION_COLORS.slice(0, series.length),
          labels,
          plotOptions: {
            pie: {
              donut: {
                size: "70%",
                labels: {
                  show: true,
                  total: {
                    show: true,
                    label: "Total de Conversões",
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#ffffff",
                    formatter: () => total.toString(),
                  },
                  value: {
                    show: true,
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#ffffff",
                  },
                },
              },
            },
          },
        },
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fairId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (chart.series.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <svg
          className="w-16 h-16 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className="text-lg font-medium">Sem dados de conversão</p>
        <p className="text-sm">Nenhuma conversão foi registrada ainda.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Conversões por Meio de Divulgação
        </h3>
        <p className="text-sm text-gray-600">
          Como os visitantes ficaram sabendo da feira
        </p>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-around gap-6">
        {/* Legenda personalizada */}
        <div className="flex flex-col gap-3 order-2 xl:order-1">
          {chart.options.labels?.map((label, i) => (
            <div
              key={`${label}-${i}`}
              className="flex items-center gap-3 group hover:bg-gray-50 p-2 rounded-md transition-colors"
            >
              <div
                className="h-4 w-4 rounded-full shadow-sm"
                style={{ backgroundColor: chart.options.colors![i] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 capitalize truncate">
                  {label}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-sm font-bold text-gray-900">
                  {chart.series[i]}
                </p>
                <p className="text-xs text-gray-500">
                  {(
                    (chart.series[i] /
                      chart.series.reduce((a, b) => a + b, 0)) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Gráfico */}
        <div className="w-full flex justify-center order-1 xl:order-2">
          <ReactApexChart
            options={chart.options}
            series={chart.series}
            type="donut"
            height={380}
            width="100%"
          />
        </div>
      </div>

      {/* Insights adicionais */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-800">
              Canal Mais Efetivo
            </p>
            <p className="text-lg font-bold text-blue-900">
              {chart.options.labels?.[0] || "N/A"}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-green-800">
              Total de Canais
            </p>
            <p className="text-lg font-bold text-green-900">
              {chart.series.length}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-purple-800">
              Total de Conversões
            </p>
            <p className="text-lg font-bold text-purple-900">
              {chart.series.reduce((a, b) => a + b, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
