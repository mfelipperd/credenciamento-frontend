import React, { useEffect, useState, useRef } from "react";
import ReactApexChart from "react-apexcharts";
import { useDashboardService } from "@/service/dashboard.service";
import { UserCircle2 } from "lucide-react";
import { LogoLoading } from "@/components/LogoLoading";

const CATEGORY_COLORS = ["#EB2970", "#00aacd", "#F39B0C", "#10B981"];

export const CategoryRadialChart: React.FC<{ fairId: string }> = ({ fairId }) => {
  const { getVisitorsByCategory, loading } = useDashboardService();
  const lastFetchedFairIdRef = useRef<string | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [absoluteValues, setAbsoluteValues] = useState<number[]>([]);
  const [series, setSeries] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      if (!fairId || fairId.trim() === "" || lastFetchedFairIdRef.current === fairId) return;

      lastFetchedFairIdRef.current = fairId;
      const data = await getVisitorsByCategory(fairId);
      if (!data) return;

      const counts = data.visitorsByCategory.map((v) => Number(v.count));
      const lbls = data.visitorsByCategory.map((v) => v.visitor_category);
      const total = counts.reduce((sum, n) => sum + n, 0);

      const srs = counts.map((count) =>
        total > 0 ? Math.round((count / total) * 100) : 0
      );

      setAbsoluteValues(counts);
      setLabels(lbls);
      setSeries(srs);
    })();
  }, [fairId, getVisitorsByCategory]);

  const options: ApexCharts.ApexOptions = {
    chart: { type: "radialBar", background: "transparent", fontFamily: "inherit" },
    plotOptions: {
      radialBar: {
        hollow: { size: "45%" },
        track: { background: "rgba(255, 255, 255, 0.05)", strokeWidth: "97%" },
        dataLabels: {
          name: { show: true, fontSize: "12px", fontWeight: 900, color: "#ffffff", offsetY: -10 },
          value: { show: true, fontSize: "24px", fontWeight: 900, color: "#ffffff", offsetY: 5 },
          total: {
            show: true,
            label: "TOTAL",
            color: "rgba(255, 255, 255, 0.4)",
            fontSize: "10px",
            fontWeight: 900,
            formatter: () => {
              const total = absoluteValues.reduce((a, b) => a + b, 0);
              return total.toString();
            }
          }
        }
      }
    },
    colors: CATEGORY_COLORS,
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
            <UserCircle2 size={48} className="mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">Sem registros</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 px-2 pb-2">
        {labels.map((label, i) => (
          <div
            key={label}
            className="flex flex-col p-3 rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/10"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
              <span className="text-[9px] text-white/40 font-black uppercase tracking-widest truncate">{label}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-black text-white">{absoluteValues[i]}</span>
              <span className="text-[10px] font-bold text-white/20">{series[i]}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
