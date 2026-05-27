import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { ApexDonutData } from "../../types/charts";
import { darkBase, ptBRCurrency } from "./chartTheme";
import { EmptyChart } from "./EmptyChart";

interface Props {
  data: ApexDonutData | null;
  loading?: boolean;
}

export function RevenuesByStatusChart({ data, loading }: Props) {
  const hasData = data && data.series.length > 0 && data.series.some((v) => v > 0);

  if (!hasData) return <EmptyChart label="Receitas por Status" loading={loading} height={320} />;

  const options: ApexOptions = {
    ...darkBase,
    chart: { ...darkBase.chart, type: "donut" },
    labels: data.labels,
    colors: data.colors?.length ? data.colors : ["#00E396", "#008FFB", "#FEB019", "#FF4560"],
    legend: { ...darkBase.legend, position: "bottom" },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      style: { fontSize: "11px", colors: ["rgba(255,255,255,0.8)"] },
      dropShadow: { enabled: false },
    },
    tooltip: {
      ...darkBase.tooltip,
      y: { formatter: ptBRCurrency },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Contratos",
              color: "rgba(255,255,255,0.4)",
              fontSize: "11px",
              fontWeight: 700,
              formatter: () => ptBRCurrency(data.total),
            },
            value: {
              color: "#fff",
              fontSize: "20px",
              fontWeight: 900,
              formatter: (val: string) => ptBRCurrency(Number(val)),
            },
          },
        },
      },
    },
  };

  return <Chart type="donut" series={data.series} options={options} height={320} />;
}
