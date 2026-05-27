import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { ApexBarData } from "../../types/charts";
import { darkBase, ptBRCurrency, shortCurrency } from "./chartTheme";
import { EmptyChart } from "./EmptyChart";

interface Props {
  data: ApexBarData | null;
  loading?: boolean;
}

export function ExpensesBreakdownChart({ data, loading }: Props) {
  const hasData = data && data.series.length > 0;

  if (!hasData) return <EmptyChart label="Composição das Despesas" loading={loading} height={280} />;

  const options: ApexOptions = {
    ...darkBase,
    chart: { ...darkBase.chart, type: "bar", stacked: true },
    colors: ["#008FFB", "#775DD0"],
    xaxis: {
      categories: data.categories,
      labels: {
        rotate: -15,
        style: { colors: "rgba(255,255,255,0.4)", fontSize: "11px" },
        trim: true,
        maxHeight: 70,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: shortCurrency,
        style: { colors: "rgba(255,255,255,0.4)", fontSize: "10px" },
      },
    },
    tooltip: { ...darkBase.tooltip, y: { formatter: ptBRCurrency } },
    dataLabels: { enabled: false },
    legend: { ...darkBase.legend, position: "top" },
    plotOptions: { bar: { borderRadius: 4 } },
  };

  return <Chart type="bar" series={data.series} options={options} height={280} />;
}
