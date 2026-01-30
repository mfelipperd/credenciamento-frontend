import { useDashboardService } from "@/service/dashboard.service";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { TrendingUp } from "lucide-react";
import { LogoLoading } from "@/components/LogoLoading";
import type { ConversionByHowDidYouKnow } from "@/interfaces/dashboard";

const CONVERSION_COLORS = ["#00aacd"];

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
  const lastFetchedRef = React.useRef<string>("");
  const [data, setData] = useState<ConversionByHowDidYouKnow[]>([]);

  useEffect(() => {
    if (!fairId || fairId.trim() === "" || lastFetchedRef.current === fairId) return;
    lastFetchedRef.current = fairId;

    (async () => {
      const result = await getConversionsByHowDidYouKnow(fairId);
      if (!result || !result.conversions) return;

      setData(result.conversions.sort((a, b) => b.conversionRate - a.conversionRate));
    })();
  }, [fairId, getConversionsByHowDidYouKnow]);

  const series = [{
    name: "Taxa de Conversão",
    data: data.map(c => Math.round(c.conversionRate))
  }];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      background: "transparent",
      fontFamily: "inherit",
    },
    colors: CONVERSION_COLORS,
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: "60%",
        dataLabels: { position: "end" }
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}%`,
      style: {
        fontSize: "10px",
        fontWeight: 900,
        colors: ["#ffffff"]
      },
      offsetX: 30,
    },
    grid: {
      borderColor: "rgba(255, 255, 255, 0.05)",
      xaxis: { lines: { show: true } },
      padding: { right: 40 }
    },
    xaxis: {
      categories: data.map(c => HOW_DID_YOU_KNOW_LABELS[c.howDidYouKnow] || c.howDidYouKnow),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "rgba(255, 255, 255, 0.4)",
          fontSize: "10px",
          fontWeight: 700,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "rgba(255, 255, 255, 0.6)",
          fontSize: "10px",
          fontWeight: 900,
        },
      },
    },
    tooltip: {
      theme: "dark",
      custom: function({ dataPointIndex }) {
        const item = data[dataPointIndex];
        return `
          <div class="p-3 bg-brand-blue border border-white/10 rounded-xl shadow-2xl">
            <div class="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">${HOW_DID_YOU_KNOW_LABELS[item.howDidYouKnow] || item.howDidYouKnow}</div>
            <div class="space-y-1">
              <div class="flex justify-between gap-8">
                <span class="text-xs text-white/60">Inscritos:</span>
                <span class="text-xs font-bold text-white">${item.totalRegistered}</span>
              </div>
              <div class="flex justify-between gap-8">
                <span class="text-xs text-white/60">Check-ins:</span>
                <span class="text-xs font-bold text-white">${item.totalCheckIns}</span>
              </div>
              <div class="pt-1 mt-1 border-t border-white/5 flex justify-between gap-8">
                <span class="text-xs text-brand-cyan font-bold">Conversão:</span>
                <span class="text-xs font-black text-brand-cyan">${item.conversionRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        `;
      }
    },
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-[300px]">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <LogoLoading size={48} minimal />
          </div>
        ) : data.length > 0 ? (
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height="100%"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
            <TrendingUp size={48} className="mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">Aguardando dados de conversão</p>
          </div>
        )}
      </div>
    </div>
  );
};
