const ptBR = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export const currency = ptBR;

export const currencyShort = (value: number): string => {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`;
  return ptBR(value);
};

export const percent = (value: number | null | undefined, decimals = 1) =>
  value == null || !Number.isFinite(value) ? "—" : `${value.toFixed(decimals)}%`;

export const integer = (value: number) =>
  new Intl.NumberFormat("pt-BR").format(Math.round(value));

export const profitColor = (value: number | null | undefined): string => {
  if (value == null || !Number.isFinite(value)) return "#FEB019";
  if (value > 0) return "#00E396";
  if (value === 0) return "#FEB019";
  return "#FF4560";
};

export const marginColor = (pct: number | null | undefined): string => {
  if (pct == null || !Number.isFinite(pct)) return "#FEB019";
  if (pct >= 20) return "#00E396";
  if (pct >= 0) return "#FEB019";
  return "#FF4560";
};

export const inadimplenciaColor = (pct: number | null | undefined): string => {
  if (pct == null || !Number.isFinite(pct)) return "#FEB019";
  if (pct < 5) return "#00E396";
  if (pct < 15) return "#FEB019";
  return "#FF4560";
};
