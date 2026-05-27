import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { ApexBarData } from "../../types/charts";
import { darkBase } from "./chartTheme";
import { EmptyChart } from "./EmptyChart";

interface Props {
  data: ApexBarData | null;
  loading?: boolean;
}

export function MarginsChart({ data, loading }: Props) {
  const hasData = data && data.series.length > 0;

  if (!hasData) return <EmptyChart label="Margem Líquida por Feira" loading={loading} height={220} />;

  const values = data.series[0].data as number[];
  const colors = values.map((v) => (v >= 20 ? "#00E396" : v >= 0 ? "#FEB019" : "#FF4560"));

  const options: ApexOptions = {
    ...darkBase,
    chart: { ...darkBase.chart, type: "bar" },
    colors,
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        borderRadius: 4,
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      offsetX: 8,
      style: { colors: ["rgba(255,255,255,0.7)"], fontSize: "11px", fontWeight: 700 },
    },
    xaxis: {
      categories: data.categories,
      labels: {
        formatter: (val) => `${val}%`,
        style: { colors: "rgba(255,255,255,0.4)", fontSize: "10px" },
      },
      max: Math.max(...values) + 10,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: "rgba(255,255,255,0.4)", fontSize: "11px" } },
    },
    legend: { show: false },
    tooltip: { ...darkBase.tooltip, y: { formatter: (val) => `${(val as number).toFixed(2)}%` } },
  };

  return <Chart type="bar" series={data.series} options={options} height={220} />;
}
