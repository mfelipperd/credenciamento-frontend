import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useDashboardService } from "@/service/dashboard.service";

interface OriginChartState {
  series: { name: string; data: number[] }[];
  options: ApexCharts.ApexOptions;
}

const ORIGIN_COLORS = [
  "#EB2970", // cor 1
  "#F39B0C", // cor 2
  "#5CB1FC", // cor 3
  "#2CA02C", // cor 4
  "#9467BD", // cor 5
  "#8C564B", // cor 6
];

export const OriginBarChart: React.FC<{ fairId: string }> = ({ fairId }) => {
  const { getVisitorsByOrigin, loading } = useDashboardService();

  const [chart, setChart] = useState<OriginChartState>({
    series: [
      {
        name: "Visitantes",
        data: [],
      },
    ],
    options: {
      chart: {
        type: "bar",
        toolbar: { show: false },
        zoom: { enabled: false },
        width: "100%",
      },
      colors: ORIGIN_COLORS,
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "60%",
          borderRadius: 6,
        },
      },
      dataLabels: {
        enabled: false,
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
      xaxis: {
        labels: {
          style: {
            fontSize: "11px",
            fontWeight: 500,
            colors: "#ffffff",
          },
          rotate: -45,
        },
      },
      tooltip: {
        y: {
          formatter: (val) => `${val} visitantes`,
        },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            plotOptions: {
              bar: {
                columnWidth: "70%",
                borderRadius: 4,
              },
            },
            xaxis: {
              labels: {
                style: {
                  fontSize: "10px",
                  colors: "#ffffff",
                },
                rotate: -45,
              },
            },
          },
        },
        {
          breakpoint: 640,
          options: {
            plotOptions: {
              bar: {
                columnWidth: "80%",
                borderRadius: 3,
              },
            },
            xaxis: {
              labels: {
                style: {
                  fontSize: "9px",
                  colors: "#ffffff",
                },
                rotate: -50,
              },
            },
          },
        },
      ],
    },
  });

  useEffect(() => {
    (async () => {
      const data = await getVisitorsByOrigin(fairId);
      if (!data) return;

      const counts = data.visitorsByOrigin.map((v) => Number(v.count));
      const origins = data.visitorsByOrigin.map((v) => v.origin);

      setChart((cur) => ({
        series: [
          {
            name: "Visitantes",
            data: counts,
          },
        ],
        options: {
          ...cur.options,
          xaxis: {
            ...cur.options.xaxis!,
            categories: origins,
          },
        },
      }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fairId]);

  if (loading) return <p>Carregando...</p>;
  if (chart.series[0].data.length === 0) return <p>Sem dados para exibir.</p>;

  return (
    <div className="w-full h-full flex flex-col min-h-[320px]">
      <div className="w-full flex-1">
        <ReactApexChart
          options={{
            ...chart.options,
            chart: {
              ...chart.options.chart,
              height: "100%",
              width: "100%",
              parentHeightOffset: 0,
              offsetX: 0,
              offsetY: 0,
            },
          }}
          series={chart.series}
          type="bar"
          height="100%"
          width="100%"
        />
      </div>
    </div>
  );
};
