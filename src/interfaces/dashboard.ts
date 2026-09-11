import type { AbsentVisitor } from "./visitors";

export interface DashboardOverviewReponse {
  fairId: string;
  totalVisitors: number;
  totalCheckIns: number;
}

export type DashboardCheckedInResponse = object; // Replace with 'unknown' if any value is acceptable

export interface VisitorByCategory {
  visitor_category: string;
  count: string;
}

export interface DashboardByCategoryResponse {
  fairId: string;
  visitorsByCategory: VisitorByCategory[];
}
export interface VisitorByOrigin {
  origin: string;
  count: string;
}
export interface DashboardByOriginResponse {
  fairId: string;
  visitorsByOrigin: VisitorByOrigin[];
}
export interface VisitorBySector {
  sector: string;
  count: string;
}

export interface DashboardBySectorsResponse {
  fairId: string;
  visitorsBySectors: VisitorBySector[];
}

export interface DashboardByabsentVisitorsResponse {
  fairId: string;
  absentVisitors: AbsentVisitor[];
}

export interface ConversionByHowDidYouKnow {
  howDidYouKnow: string;
  totalRegistered: number;
  visitorsWithCheckins: number;
  totalCheckIns: number;
  conversionRate: number;
  percentOfTotal: number;
  /** Gasto de mídia paga casado por palavra-chave (categoria/descrição da despesa). Null quando o canal é orgânico ou não tem despesa casada. */
  spend: number | null;
  /** Custo por lead: spend / totalRegistered. Mede a eficiência do canal em gerar inscrição. */
  cpl: number | null;
  /** Custo por comparecimento: spend / visitorsWithCheckins. Mede a eficiência do canal em levar a pessoa até a feira de fato. */
  cpa: number | null;
  /**
   * Outras respostas de canal que compartilham a MESMA despesa/verba que esta
   * (ex: "instagram" e "facebook" pagos por uma única despesa de Meta Ads).
   * Ao exibir `spend`, nunca some entre canais que aparecem na lista um do
   * outro — é o mesmo dinheiro contado uma vez por canal, não dinheiro extra.
   */
  sharedWithChannels: string[];
}

export interface DashboardConversionResponse {
  fairId: string;
  totalVisitors: number;
  conversions: ConversionByHowDidYouKnow[];
}
