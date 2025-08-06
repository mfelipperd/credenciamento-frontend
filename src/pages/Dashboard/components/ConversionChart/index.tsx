import { useDashboardService } from "@/service/dashboard.service";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import type { ConversionByHowDidYouKnow } from "@/interfaces/dashboard";

interface ConversionChartState {
  series: { data: number[] }[];
  options: ApexCharts.ApexOptions;
  conversionsData: ConversionByHowDidYouKnow[]; // Dados completos para o tooltip
  labels: string[]; // Labels para o tooltip
}

const CONVERSION_COLORS = [
  "#EB2970", // Rosa
  "#F39B0C", // Laranja
  "#5CB1FC", // Azul
  "#10B981", // Verde
  "#8B5CF6", // Roxo
  "#F59E0B", // Amarelo
  "#EF4444", // Vermelho
  "#6B7280", // Cinza
];

const HOW_DID_YOU_KNOW_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  google: "Google",
  outdoor: "Outdoor",
  busdoor: "Busdoor",
  tv: "Televisão",
  indicação: "Indicação",
  representante: "Representante",
  outro: "Outros",
};

export const ConversionChart: React.FC<{ fairId: string }> = ({ fairId }) => {
  const { getConversionsByHowDidYouKnow, loading } = useDashboardService();
  const [chart, setChart] = useState<ConversionChartState>({
    series: [],
    conversionsData: [],
    labels: [],
    options: {
      chart: {
        height: 350,
        type: "bar",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
          dataLabels: {
            position: "center",
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: [],
        labels: {
          formatter: (val: string) => `${val}%`,
        },
      },
      yaxis: {
        labels: {
          style: {
            fontSize: "12px",
            fontWeight: 600,
          },
        },
      },
      colors: CONVERSION_COLORS,
      legend: {
        show: false,
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (val: number) => {
            return `${val} check-ins`;
          },
        },
      },
      grid: {
        show: true,
        borderColor: "#e5e7eb",
        strokeDashArray: 3,
      },
    },
  });

  useEffect(() => {
    (async () => {
      const data = await getConversionsByHowDidYouKnow(fairId);
      if (!data || !data.conversions || data.conversions.length === 0) return;

      // Ordena por quantidade de check-ins decrescente
      const sortedConversions = data.conversions.sort(
        (a, b) => b.totalCheckIns - a.totalCheckIns
      );

      const series = sortedConversions.map(
        (conversion) => conversion.totalCheckIns
      );
      const labels = sortedConversions.map(
        (conversion) =>
          HOW_DID_YOU_KNOW_LABELS[conversion.howDidYouKnow] ||
          conversion.howDidYouKnow
      );

      setChart({
        series: [{ data: series }],
        conversionsData: sortedConversions,
        labels: labels,
        options: {
          ...chart.options,
          xaxis: {
            ...chart.options.xaxis,
            categories: labels,
          },
          colors: CONVERSION_COLORS.slice(0, series.length),
        },
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fairId]);

  if (loading)
    return <p className="text-center py-8">Carregando dados de conversão...</p>;
  if (chart.series.length === 0)
    return (
      <p className="text-center py-8">Sem dados de conversão disponíveis.</p>
    );

  // Cria um tooltip personalizado com acesso aos dados
  const tooltipOptions = {
    ...chart.options,
    tooltip: {
      enabled: true,
      custom: function ({
        series,
        seriesIndex,
        dataPointIndex,
      }: {
        series: number[][];
        seriesIndex: number;
        dataPointIndex: number;
      }) {
        const conversionData = chart.conversionsData[dataPointIndex];
        const checkIns = series[seriesIndex][dataPointIndex];
        const conversionRate =
          conversionData?.conversionRate?.toFixed(1) || "0";
        const totalRegistered = conversionData?.totalRegistered || 0;
        const channel = chart.labels[dataPointIndex];

        return `
          <div style="padding: 8px 12px; background: white; border: 1px solid #e5e7eb; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="font-weight: 600; margin-bottom: 4px;">${channel}</div>
            <div style="font-size: 14px; color: #374151;">
              <div><strong>${checkIns}</strong> check-ins</div>
              <div><strong>${totalRegistered}</strong> visitantes registrados</div>
              <div style="color: #059669;"><strong>${conversionRate}%</strong> de conversão</div>
            </div>
          </div>
        `;
      },
    },
  };

  return (
    <div className="w-full">
      <ReactApexChart
        options={tooltipOptions}
        series={chart.series}
        type="bar"
        height={400}
      />
    </div>
  );
};
