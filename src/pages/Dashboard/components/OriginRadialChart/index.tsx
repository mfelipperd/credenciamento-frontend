import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useDashboardService } from "@/service/dashboard.service";
import { Share2 } from "lucide-react";
import { LogoLoading } from "@/components/LogoLoading";

const ORIGIN_COLORS = ["#5CB1FC"];

export const OriginBarChart: React.FC<{ fairId: string }> = ({ fairId }) => {
  const { getVisitorsByOrigin, loading } = useDashboardService();
  const lastFetchedRef = React.useRef<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [series, setSeries] = useState<number[]>([]);

  useEffect(() => {
    if (!fairId || fairId.trim() === "" || lastFetchedRef.current === fairId) return;
    lastFetchedRef.current = fairId;

    (async () => {
      const data = await getVisitorsByOrigin(fairId);
      if (!data) return;

      const counts = data.visitorsByOrigin.map((v) => Number(v.count));
      const origins = data.visitorsByOrigin.map((v) => v.origin);

      setSeries(counts);
      setCategories(origins);
    })();
  }, [fairId, getVisitorsByOrigin]);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      background: "transparent",
      fontFamily: "inherit",
    },
    colors: ORIGIN_COLORS,
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "50%",
        distributed: false,
        dataLabels: { position: "top" }
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: {
        fontSize: "10px",
        fontWeight: 900,
        colors: ["#ffffff"]
      }
    },
    grid: {
      show: false,
    },
    xaxis: {
      categories: categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "rgba(255, 255, 255, 0.4)",
          fontSize: "10px",
          fontWeight: 700,
        },
        rotate: -45,
        offsetY: 5,
      },
    },
    yaxis: {
      show: false,
    },
    tooltip: {
      theme: "dark",
      y: { formatter: (val) => `${val} visitantes` },
    },
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-[300px]">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <LogoLoading size={48} minimal />
          </div>
        ) : series.length > 0 ? (
          <ReactApexChart
            options={options}
            series={[{ name: "Visitantes", data: series }]}
            type="bar"
            height="100%"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
            <Share2 size={48} className="mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">Sem dados de origem</p>
          </div>
        )}
      </div>
    </div>
  );
};
