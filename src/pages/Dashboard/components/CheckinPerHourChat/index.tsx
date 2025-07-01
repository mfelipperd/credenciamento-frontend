import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useDashboardController } from "../../dashboard.controller";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

interface CheckinSeries {
  name: string; // ex.: "01/07/2025"
  data: number[]; // ex.: [0,0,14,16,48,...]
}

interface CheckinChartState {
  series: CheckinSeries[];
  options: ApexCharts.ApexOptions;
}

const CHART_COLORS = [
  "#5CB1FC",
  "#F39B0C",
  "#EB2970",
  "#10B981",
  "#6366F1",
  "#D946EF",
  "#FACC15",
  "#FB7185",
  "#60A5FA",
  "#34D399",
];

export const CheckinPerHourChart: React.FC<{ fairId: string }> = ({
  fairId,
}) => {
  const {
    getCheckinPerHour,
    checkinPerHour: result,
    loading,
  } = useDashboardController();

  // seleciona filtro de data: undefined = todos os dias
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const [chart, setChart] = useState<CheckinChartState>({
    series: [],
    options: {
      chart: {
        type: "bar",
        height: 350,
        animations: {
          enabled: true,
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350,
          },
        },
        toolbar: { show: false },
        zoom: { enabled: false },
        width: "100%",
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "40%",
        },
        radar: {
          size: 140,
          polygons: {
            connectorColors: "#e9e9e9",
          },
        },
      },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 1, colors: ["#fff"] },

      legend: {
        position: "top",
        horizontalAlign: "center",
      },
      fill: {
        opacity: 1,
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
    },
  });

  // 1) Recarrega dados sempre que fairId ou selectedDate mudarem
  useEffect(() => {
    if (!fairId) return;
    const isoDay = selectedDate
      ? format(selectedDate, "yyyy-MM-dd")
      : undefined;
    getCheckinPerHour(fairId, isoDay);
  }, [fairId, selectedDate]);

  // 2) Quando chegar resultado, atualiza gráfico
  useEffect(() => {
    if (!result) return;
    setChart((prev) => ({
      series: result.data,
      options: {
        ...prev.options,
        colors: CHART_COLORS,
        xaxis: {
          ...prev.options.xaxis!,
          categories: result.hours,
        },
      },
    }));
  }, [result]);

  useEffect(() => {
    if (!result) return;

    const rawHours = result.hours; // ex: ["08:00", …, "21:00"]
    const rawSeries = result.data; // ex: [{ name: "01/07/2025", data: [0,0,14,…] }]

    // 1) Descobre quais índices têm ao menos um valor > 0
    const validIndices = rawHours
      .map((_, i) => (rawSeries.some((s) => s.data[i] > 0) ? i : null))
      .filter((i): i is number => i !== null);

    // 2) Monta categorias filtradas
    const filteredHours = validIndices.map((i) => rawHours[i]);

    // 3) Monta séries só com esses slots
    const filteredSeries = rawSeries.map((s) => ({
      name: s.name,
      data: validIndices.map((i) => s.data[i]),
    }));

    // 4) Atualiza o chart
    setChart((prev) => ({
      series: filteredSeries,
      options: {
        ...prev.options,
        colors: CHART_COLORS,
        xaxis: {
          ...prev.options.xaxis!,
          categories: filteredHours,
        },
      },
    }));
  }, [result]);

  if (loading) {
    return <p>Carregando dados...</p>;
  }

  return (
    <div>
      {/* Date picker para filtrar o dia */}
      <div className="mb-6 w-full flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-44 justify-between">
              {selectedDate
                ? format(selectedDate, "dd/MM/yyyy")
                : "Todos os dias"}
              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="p-0 bg-white">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date: Date | undefined) =>
                setSelectedDate(date ?? undefined)
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Gráfico */}
      <div id="checkin-per-hour-chart" className="w-full overflow-x-auto">
        <ReactApexChart
          options={chart.options}
          series={chart.series}
          type="area"
          width={400}
        />
      </div>
    </div>
  );
};
