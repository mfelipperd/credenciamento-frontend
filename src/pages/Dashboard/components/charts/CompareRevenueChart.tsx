import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { ApexBarData } from "../../types/charts";
import { darkBase, ptBRCurrency, shortCurrency } from "./chartTheme";
import { EmptyChart } from "./EmptyChart";

interface Props {
  data: ApexBarData | null;
  loading?: boolean;
}

export function CompareRevenueChart({ data, loading }: Props) {
  const hasData = data && data.series.length > 0;

  if (!hasData) return <EmptyChart label="Receita × Despesas × Lucro por Feira" loading={loading} height={320} />;

  const options: ApexOptions = {
    ...darkBase,
    chart: { ...darkBase.chart, type: "bar" },
    colors: ["#00E396", "#FF4560", "#008FFB"],
    xaxis: {
      categories: data.categories,
      labels: {
        rotate: -20,
        style: { colors: "rgba(255,255,255,0.4)", fontSize: "11px" },
        trim: true,
        maxHeight: 80,
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
    plotOptions: { bar: { borderRadius: 4, columnWidth: "65%" } },
    legend: { ...darkBase.legend, position: "top" },
  };

  return <Chart type="bar" series={data.series} options={options} height={320} />;
}
