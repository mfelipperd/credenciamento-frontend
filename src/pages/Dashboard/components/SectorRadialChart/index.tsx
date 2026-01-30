import { useDashboardService } from "@/service/dashboard.service";
import React, { useEffect, useState, useRef } from "react";
import ReactApexChart from "react-apexcharts";
import { PieChart } from "lucide-react";
import { LogoLoading } from "@/components/LogoLoading";

const SECTOR_COLORS = ["#EB2970", "#00aacd", "#F39B0C", "#10B981", "#6366F1", "#D946EF"];

export const SectorsRadialChart: React.FC<{ fairId: string }> = ({ fairId }) => {
  const { getVisitorsBySectors, loading } = useDashboardService();
  const lastFetchedFairIdRef = useRef<string | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [absoluteValues, setAbsoluteValues] = useState<number[]>([]);
  const [series, setSeries] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      if (!fairId || fairId.trim() === "" || lastFetchedFairIdRef.current === fairId) return;

      lastFetchedFairIdRef.current = fairId;
      const data = await getVisitorsBySectors(fairId);
      if (!data) return;

      const counts = data.visitorsBySectors.map((v) => Number(v.count));
      const lbls = data.visitorsBySectors.map((v) => v.sector);
      const total = counts.reduce((sum, n) => sum + n, 0);

      const srs = counts.map((count) =>
        total > 0 ? Math.round((count / total) * 100) : 0
      );

      setAbsoluteValues(counts);
      setLabels(lbls);
      setSeries(srs);
    })();
  }, [fairId, getVisitorsBySectors]);

  const options: ApexCharts.ApexOptions = {
    chart: { type: "radialBar", background: "transparent", fontFamily: "inherit" },
    plotOptions: {
      radialBar: {
        hollow: { size: "40%" },
        track: { background: "rgba(255, 255, 255, 0.05)", strokeWidth: "97%" },
        dataLabels: {
          name: { show: true, fontSize: "11px", fontWeight: 900, color: "#ffffff", offsetY: -10 },
          value: { show: true, fontSize: "20px", fontWeight: 900, color: "#ffffff", offsetY: 5 },
          total: {
            show: true,
            label: "TOTAL",
            color: "rgba(255, 255, 255, 0.4)",
            fontSize: "9px",
            fontWeight: 900,
            formatter: () => {
              const total = absoluteValues.reduce((a, b) => a + b, 0);
              return total.toString();
            }
          }
        }
      }
    },
    colors: SECTOR_COLORS,
    labels: labels,
    stroke: { lineCap: "round" }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex-1 min-h-[250px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <LogoLoading size={48} minimal />
          </div>
        ) : series.length > 0 ? (
          <ReactApexChart
            options={options}
            series={series}
            type="radialBar"
            height="100%"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
            <PieChart size={48} className="mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">Sem dados</p>
          </div>
        )}
      </div>

      <div className="max-h-[160px] overflow-y-auto custom-scrollbar px-2 pb-2">
        <div className="grid grid-cols-2 gap-2">
          {labels.map((label, i) => (
            <div
              key={label}
              className="flex flex-col p-2.5 rounded-xl bg-white/5 border border-white/5 transition-all hover:bg-white/10"
            >
              <div className="flex items-center gap-2 mb-0.5">
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: SECTOR_COLORS[i % SECTOR_COLORS.length] }} />
                <span className="text-[8px] text-white/40 font-black uppercase tracking-widest truncate">{label}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-black text-white">{absoluteValues[i]}</span>
                <span className="text-[8px] font-bold text-white/20">{series[i]}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
