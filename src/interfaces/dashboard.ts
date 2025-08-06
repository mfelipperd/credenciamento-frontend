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
}

export interface DashboardConversionResponse {
  fairId: string;
  conversions: ConversionByHowDidYouKnow[];
}
