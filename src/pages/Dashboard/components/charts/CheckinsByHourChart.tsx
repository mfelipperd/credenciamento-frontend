import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { ApexBarData } from "../../types/charts";
import { darkBase } from "./chartTheme";
import { EmptyChart } from "./EmptyChart";

interface Props {
  data: ApexBarData | null;
  loading?: boolean;
}

export function CheckinsByHourChart({ data, loading }: Props) {
  const hasData = data && data.series.length > 0 && data.series[0].data.some((v) => v > 0);

  if (!hasData) return <EmptyChart label="Check-ins por Horário" loading={loading} height={260} />;

  const values = data.series[0].data;
  const maxVal = Math.max(...values);
  const peakHour = data.categories[values.indexOf(maxVal)];

  const options: ApexOptions = {
    ...darkBase,
    chart: { ...darkBase.chart, type: "bar" },
    colors: ["#775DD0"],
    xaxis: {
      categories: data.categories,
      tickAmount: 12,
      labels: { style: { colors: "rgba(255,255,255,0.4)", fontSize: "10px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: { text: "Check-ins", style: { color: "rgba(255,255,255,0.3)", fontSize: "10px" } },
      labels: { style: { colors: "rgba(255,255,255,0.4)", fontSize: "10px" } },
    },
    dataLabels: { enabled: false },
    plotOptions: {
      bar: { borderRadius: 3, columnWidth: "70%" },
    },
    tooltip: { ...darkBase.tooltip, y: { formatter: (val) => `${val} check-ins` } },
    annotations: {
      xaxis: [
        {
          x: peakHour,
          borderColor: "#EB2970",
          label: {
            text: `Pico: ${peakHour}`,
            style: { color: "#fff", background: "#EB2970", fontSize: "10px" },
          },
        },
      ],
    },
  };

  return <Chart type="bar" series={data.series} options={options} height={260} />;
}
