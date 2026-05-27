import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { ApexBarData } from "../../types/charts";
import { darkBase, ptBRCurrency, shortCurrency } from "./chartTheme";
import { EmptyChart } from "./EmptyChart";

interface Props {
  data: ApexBarData | null;
  loading?: boolean;
}

export function RevenueForecastChart({ data, loading }: Props) {
  const hasData = data && data.series.length > 0 && data.series.some((s) => s.data.some((v) => v > 0));

  if (!hasData) return <EmptyChart label="Forecast de Recebimento" loading={loading} height={280} />;

  const options: ApexOptions = {
    ...darkBase,
    chart: { ...darkBase.chart, type: "bar", stacked: true },
    colors: ["#008FFB", "#FF4560"],
    xaxis: {
      categories: data.categories,
      labels: { style: { colors: "rgba(255,255,255,0.4)", fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: shortCurrency,
        style: { colors: "rgba(255,255,255,0.4)", fontSize: "11px" },
      },
    },
    tooltip: { ...darkBase.tooltip, y: { formatter: ptBRCurrency } },
    dataLabels: { enabled: false },
    legend: { ...darkBase.legend, position: "top" },
    plotOptions: {
      bar: { horizontal: false, borderRadius: 4, columnWidth: "60%" },
    },
  };

  return <Chart type="bar" series={data.series} options={options} height={280} />;
}
