import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useDashboardController } from "../../dashboard.controller";

export interface CheckinSeries {
  name: string; // Ex: "24/06"
  data: number[]; // Ex: [2, 4, 0, ...] por hora
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
  const { checkinPerHour: result } = useDashboardController();

  const [chart, setChart] = useState<CheckinChartState>({
    series: [],
    options: {
      chart: {
        type: "bar",
        height: 350,
        stacked: true,
        toolbar: { show: true },
        zoom: { enabled: true },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "40%",
        },
      },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 1, colors: ["#fff"] },
      xaxis: {
        categories: [],
        title: { text: "Horário" },
      },
      yaxis: {
        title: { text: "Check-ins" },
      },
      legend: {
        position: "top",
        horizontalAlign: "center",
        offsetY: 0,
      },
      fill: {
        opacity: 1,
      },
    },
  });

  useEffect(() => {
    (async () => {
      if (!result) return;

      setChart((prev) => ({
        series: result.data,
        options: {
          ...prev.options,
          colors: CHART_COLORS,
          xaxis: {
            ...prev.options.xaxis,
            categories: result.hours,
          },
        },
      }));
    })();
  }, [fairId]);

  // if (chart.series.length === 0)
  //   return <p>Sem dados de check-in por horário.</p>;

  return (
    <div id="checkin-per-hour-chart" className="w-full overflow-x-auto">
      <ReactApexChart
        options={chart.options}
        series={chart.series}
        type="bar"
        height={400}
      />
    </div>
  );
};
