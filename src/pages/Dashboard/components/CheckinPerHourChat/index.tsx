import React, { useEffect, useState, useRef } from "react";
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

  const lastRequestRef = useRef<string>("");

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
        toolbar: { show: false },
        zoom: { enabled: false },
        width: "100%",
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 2,
        },
      },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 1, colors: ["#fff"] },

      legend: {
        position: "top",
        horizontalAlign: "center",
        fontSize: "12px",
        offsetY: -5,
        labels: {
          colors: "#ffffff",
        },
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
      xaxis: {
        labels: {
          style: {
            colors: "#ffffff",
            fontSize: "12px",
          },
        },
        categories: [],
      },
      yaxis: {
        labels: {
          show: false,
        },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 300,
            },
            legend: {
              position: "bottom",
              fontSize: "10px",
              labels: {
                colors: "#ffffff",
              },
            },
            plotOptions: {
              bar: {
                columnWidth: "60%",
              },
            },
          },
        },
        {
          breakpoint: 640,
          options: {
            chart: {
              height: 250,
            },
            legend: {
              position: "bottom",
              fontSize: "9px",
              offsetY: 5,
              labels: {
                colors: "#ffffff",
              },
            },
            plotOptions: {
              bar: {
                columnWidth: "70%",
              },
            },
          },
        },
      ],
    },
  });

  // 1) Recarrega dados sempre que fairId ou selectedDate mudarem
  useEffect(() => {
    if (!fairId) return;

    const isoDay = selectedDate
      ? format(selectedDate, "yyyy-MM-dd")
      : undefined;

    // Criar uma chave única para evitar requisições duplicadas
    const requestKey = `${fairId}-${isoDay || "all"}`;
    if (lastRequestRef.current === requestKey) return;

    lastRequestRef.current = requestKey;
    getCheckinPerHour(fairId, isoDay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fairId, selectedDate]); // SEM getCheckinPerHour nas dependências

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
    const rawSeries = result.data; // ex: [{ name: "01/07/2025", data: [0, 0, 14, 16, 48, ...] }, ...];

    // 1) Descobre quais índices têm ao menos um valor > 0
    const validIndices = rawHours
      .map((_, i) => (rawSeries.some((s) => s.data[i] > 0) ? i : null))
      .filter((i): i is number => i !== null);

    // 2) Monta categorias filtradas
    const filteredHours = validIndices.map((i) => rawHours[i]);

    // 3) Monta séries só com esses slots
    const filteredSeries = rawSeries.map((s) => ({
      name: s.name + " " + s.data.reduce((acc, i) => acc + i, 0),
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
    <div className="w-full h-full p-4 flex flex-col min-h-[400px]">
      {/* Date picker para filtrar o dia */}
      <div className="mb-4 w-full flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-36 sm:w-44 justify-between text-xs sm:text-sm"
            >
              {selectedDate
                ? format(selectedDate, "dd/MM/yyyy")
                : "Todos os dias"}
              <CalendarIcon className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="p-0 bg-popover border border-border"
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date: Date | undefined) =>
                setSelectedDate(date ?? undefined)
              }
              initialFocus
              className="bg-popover"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Gráfico */}
      <div className="flex-1 w-full">
        <div className="w-full max-w-full h-full">
          <ReactApexChart
            options={{
              ...chart.options,
              chart: {
                ...chart.options.chart,
                height: 320,
                width: "100%",
                parentHeightOffset: 0,
                offsetX: 0,
                offsetY: 0,
              },
            }}
            series={chart.series}
            type="area"
            height={320}
            width="100%"
          />
        </div>
      </div>
    </div>
  );
};
