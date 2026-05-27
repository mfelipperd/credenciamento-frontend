import type { ApexOptions } from "apexcharts";

export const darkBase: ApexOptions = {
  chart: {
    background: "transparent",
    foreColor: "rgba(255,255,255,0.4)",
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: true, speed: 400 },
  },
  theme: { mode: "dark" },
  grid: {
    borderColor: "rgba(255,255,255,0.05)",
    strokeDashArray: 4,
  },
  tooltip: {
    theme: "dark",
    style: { fontSize: "12px" },
  },
  legend: {
    labels: { colors: "rgba(255,255,255,0.5)" },
    fontSize: "11px",
  },
};

export const ptBRCurrency = (val: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

export const shortCurrency = (val: number) => {
  if (val >= 1_000_000) return `R$ ${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `R$ ${(val / 1_000).toFixed(0)}k`;
  return ptBRCurrency(val);
};
