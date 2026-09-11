import { useDashboardData } from "@/hooks/useDashboardData";
import { AppEndpoints } from "@/constants/AppEndpoints";
import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { TrendingUp } from "lucide-react";
import { LogoLoading } from "@/components/LogoLoading";
import type { DashboardConversionResponse } from "@/interfaces/dashboard";
import { currency } from "../../utils/format";

const REGISTERED_COLOR = "#00aacd";
const ATTENDED_COLOR = "#00E396";

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
  const { data: result, isLoading: loading } =
    useDashboardData<DashboardConversionResponse>(
      AppEndpoints.DASHBOARD.CONVERSIONS_HOW_DID_YOU_KNOW,
      fairId,
    );

  // Ordena por volume de inscritos, não só por taxa de conversão — um canal
  // com 90% de conversão mas 5 inscritos não é "melhor" que um com 40% de
  // conversão e 300 inscritos.
  const data = useMemo(
    () =>
      [...(result?.conversions ?? [])].sort(
        (a, b) => b.totalRegistered - a.totalRegistered,
      ),
    [result],
  );

  const series = [
    { name: "Inscritos", data: data.map((c) => c.totalRegistered) },
    { name: "Compareceram", data: data.map((c) => c.visitorsWithCheckins) },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      stacked: false,
      toolbar: { show: false },
      background: "transparent",
      fontFamily: "inherit",
    },
    colors: [REGISTERED_COLOR, ATTENDED_COLOR],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: "70%",
      },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "rgba(255, 255, 255, 0.05)",
      xaxis: { lines: { show: true } },
      padding: { right: 24 },
    },
    xaxis: {
      categories: data.map(
        (c) => HOW_DID_YOU_KNOW_LABELS[c.howDidYouKnow] || c.howDidYouKnow,
      ),
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
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      labels: { colors: "rgba(255, 255, 255, 0.6)" },
      fontSize: "11px",
    },
    tooltip: {
      theme: "dark",
      shared: true,
      intersect: false,
      custom: function ({ dataPointIndex }) {
        const item = data[dataPointIndex];
        const label =
          HOW_DID_YOU_KNOW_LABELS[item.howDidYouKnow] || item.howDidYouKnow;

        const costRows =
          item.spend != null
            ? `
              <div class="flex justify-between gap-8">
                <span class="text-xs text-white/60">Gasto no canal:</span>
                <span class="text-xs font-bold text-white">${currency(item.spend)}</span>
              </div>
              <div class="flex justify-between gap-8">
                <span class="text-xs text-white/60">Custo por inscrito (CPL):</span>
                <span class="text-xs font-bold text-white">${item.cpl != null ? currency(item.cpl) : "—"}</span>
              </div>
              <div class="flex justify-between gap-8">
                <span class="text-xs text-white/60">Custo por comparecimento (CPA):</span>
                <span class="text-xs font-bold text-white">${item.cpa != null ? currency(item.cpa) : "—"}</span>
              </div>
              ${
                item.sharedWithChannels.length > 0
                  ? `<div class="text-[10px] text-white/40 italic pt-1">Verba compartilhada com: ${item.sharedWithChannels
                      .map((c) => HOW_DID_YOU_KNOW_LABELS[c] || c)
                      .join(", ")} — não some o gasto entre os dois.</div>`
                  : ""
              }
            `
            : `<div class="text-xs text-white/40 italic">Sem despesa de mídia paga associada a este canal.</div>`;

        return `
          <div class="p-3 bg-brand-blue border border-white/10 rounded-xl shadow-2xl max-w-xs">
            <div class="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">${label}</div>
            <div class="space-y-1">
              <div class="flex justify-between gap-8">
                <span class="text-xs" style="color:${REGISTERED_COLOR}">Inscritos:</span>
                <span class="text-xs font-bold text-white">${item.totalRegistered}</span>
              </div>
              <div class="flex justify-between gap-8">
                <span class="text-xs" style="color:${ATTENDED_COLOR}">Compareceram:</span>
                <span class="text-xs font-bold text-white">${item.visitorsWithCheckins}</span>
              </div>
              <div class="flex justify-between gap-8">
                <span class="text-xs text-brand-cyan font-bold">Conversão:</span>
                <span class="text-xs font-black text-brand-cyan">${item.conversionRate.toFixed(1)}%</span>
              </div>
              <div class="pt-1 mt-1 border-t border-white/5 space-y-1">
                ${costRows}
              </div>
            </div>
          </div>
        `;
      },
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
            <p className="text-xs font-black uppercase tracking-widest">
              Aguardando dados de conversão
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
