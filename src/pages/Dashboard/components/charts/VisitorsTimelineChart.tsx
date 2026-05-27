import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { ApexBarData } from "../../types/charts";
import { darkBase } from "./chartTheme";
import { EmptyChart } from "./EmptyChart";

interface Props {
  data: ApexBarData | null;
  loading?: boolean;
}

export function VisitorsTimelineChart({ data, loading }: Props) {
  const hasData = data && data.series.length > 0 && data.series.some((s) => s.data.some((v) => v > 0));

  if (!hasData) return <EmptyChart label="Evolução de Inscrições" loading={loading} height={260} />;

  const options: ApexOptions = {
    ...darkBase,
    chart: { ...darkBase.chart, type: "line" },
    colors: ["#00aacd", "#EB2970"],
    stroke: { curve: "smooth", width: [3, 2] },
    xaxis: {
      categories: data.categories,
      tickAmount: 8,
      labels: { style: { colors: "rgba(255,255,255,0.4)", fontSize: "10px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: [
      {
        title: { text: "Acumulado", style: { color: "rgba(255,255,255,0.3)", fontSize: "10px" } },
        labels: { style: { colors: "rgba(255,255,255,0.4)", fontSize: "10px" } },
      },
      {
        opposite: true,
        title: { text: "No dia", style: { color: "rgba(255,255,255,0.3)", fontSize: "10px" } },
        labels: { style: { colors: "rgba(255,255,255,0.4)", fontSize: "10px" } },
      },
    ],
    markers: { size: 3 },
    legend: { ...darkBase.legend, position: "top" },
    tooltip: { ...darkBase.tooltip, shared: true },
  };

  return <Chart type="line" series={data.series} options={options} height={260} />;
}
