import React, { useEffect, useState, useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { useVisitorsService } from "@/service/visitors.service";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Activity } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { LogoLoading } from "@/components/LogoLoading";

const CHART_COLORS = ["#00aacd", "#EB2970", "#F39B0C", "#10B981"];

export const CheckinPerHourChart: React.FC<{ fairId: string }> = ({ fairId }) => {
  const { getCheckinPerHour, checkinPerHour: result, loading } = useVisitorsService();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const lastFetchedRef = React.useRef<string>("");

  useEffect(() => {
    const isoDay = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "all";
    const cacheKey = `${fairId}-${isoDay}`;

    if (fairId && lastFetchedRef.current !== cacheKey) {
      lastFetchedRef.current = cacheKey;
      getCheckinPerHour(fairId, isoDay === "all" ? undefined : isoDay);
    }
  }, [fairId, selectedDate, getCheckinPerHour]);

  const chartData = useMemo(() => {
    if (!result) return { series: [], categories: [] };

    const rawHours = result.hours;
    const rawSeries = result.data;

    // Apenas horários que contêm algum dado em qualquer série
    const validIndices = rawHours
      .map((_, i) => (rawSeries.some((s) => s.data[i] > 0) ? i : null))
      .filter((i): i is number => i !== null);

    // Se estiver vazio, pega todos os horários (fallback)
    const indicesToUse = validIndices.length > 0 ? validIndices : rawHours.map((_, i) => i);

    return {
      categories: indicesToUse.map((i) => rawHours[i]),
      series: rawSeries.map((s) => ({
        name: s.name,
        data: indicesToUse.map((i) => s.data[i]),
      })),
    };
  }, [result]);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "inherit",
      background: "transparent",
    },
    colors: CHART_COLORS,
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100, 100],
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    grid: {
      borderColor: "rgba(255, 255, 255, 0.05)",
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 },
    },
    xaxis: {
      categories: chartData.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "rgba(255, 255, 255, 0.4)",
          fontSize: "10px",
          fontWeight: 600,
        },
      },
    },
    yaxis: {
      min: 0,
      labels: {
        style: {
          colors: "rgba(255, 255, 255, 0.4)",
          fontSize: "10px",
          fontWeight: 600,
        },
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      fontSize: "10px",
      fontWeight: 700,
      fontFamily: "inherit",
      labels: { colors: "rgba(255, 255, 255, 0.6)" },
      markers: { size: 4 },
      itemMargin: { horizontal: 10 },
    },
    tooltip: {
      theme: "dark",
      x: { show: true },
    },
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl bg-brand-cyan/10 text-brand-cyan">
            <Activity size={18} />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm tracking-tight">Estatísticas de Fluxo</h4>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">
              {selectedDate ? format(selectedDate, "dd 'de' MMMM") : "Todos os períodos"}
            </p>
          </div>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-11 bg-white/5 border-white/5 text-white/60 hover:text-white rounded-xl text-xs gap-3 px-4 transition-all"
            >
              {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecionar Data"}
              <CalendarIcon size={14} className="text-brand-cyan" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="p-0 border-white/5 bg-brand-blue shadow-2xl">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
              className="bg-transparent"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex-1 min-h-[300px]">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <LogoLoading size={48} minimal />
          </div>
        ) : chartData.series.length > 0 ? (
          <ReactApexChart
            options={options}
            series={chartData.series}
            type="area"
            height="100%"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
            <Activity size={48} className="mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">Sem dados para este período</p>
          </div>
        )}
      </div>
    </div>
  );
};
