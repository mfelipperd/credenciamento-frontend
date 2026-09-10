export type AppMode = "credenciamento" | "gestao";

function detectAppMode(): AppMode {
  const host = window.location.hostname;
  return host.startsWith("credenciamento.") ? "credenciamento" : "gestao";
}

export const APP_MODE: AppMode = detectAppMode();

export const isCredenciamentoMode = APP_MODE === "credenciamento";
