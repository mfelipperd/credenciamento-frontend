// Interfaces para o módulo de feiras

export type FairStatus = 'upcoming' | 'ongoing' | 'ended' | 'cancelled';

export interface StandConfiguration {
  id?: string;
  name: string;
  width: number;
  height: number;
  quantity: number;
  pricePerSquareMeter: number;
  setupCostPerSquareMeter: number;
  description?: string;
}

export interface DaySchedule {
  id?: string;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
  note?: string | null;
}

export interface TransportLinks {
  googleMaps?: string | null;
  waze?: string | null;
  uber?: string | null;
  taxi99?: string | null;
}

export interface Fair {
  id: string;
  name: string;
  edition?: string | null;
  description?: string | null;
  bannerUrl?: string | null;
  status: FairStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;

  // Local (legado)
  location: string;

  // Endereço estruturado
  venueName?: string | null;
  address?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;   // "AM", "PA" etc. — 2 letras
  zipCode?: string | null;
  country?: string | null;
  googleMapsUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;

  // Links de transporte (gerados automaticamente pela API)
  transportLinks?: TransportLinks;

  // Datas e horários
  startDate?: string | null;    // "YYYY-MM-DD"
  endDate?: string | null;      // "YYYY-MM-DD"
  startTime?: string | null;    // "HH:mm"
  endTime?: string | null;      // "HH:mm"
  startDateTime?: string | null; // legado
  endDateTime?: string | null;   // legado
  durationDays?: number | null;  // calculado

  // Programação por dia
  daySchedules?: DaySchedule[];

  // Planejamento
  expectedVisitors?: number | null;
  expectedExhibitors?: number | null;

  // Financeiro (existente)
  totalStands?: number;
  costPerSquareMeter?: number;
  setupCostPerSquareMeter?: number;
  expectedRevenue?: number;
  expectedProfit?: number;
  expectedProfitMargin?: number;
  insights?: string | null;
  standConfigurations?: StandConfiguration[];

  // Financeiro calculado
  totalRevenue?: number;
  totalExpenses?: number;
  netBalance?: number;
  profitMargin?: number;
  totalRevenues?: number;
  totalExpensesCount?: number;
}

export interface CreateFairForm {
  name: string;
  edition?: string;
  description?: string;
  bannerUrl?: string;
  status?: FairStatus;

  // Local
  location?: string;
  venueName?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;

  // Datas e horários
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  daySchedules?: Omit<DaySchedule, 'id'>[];

  // Planejamento
  expectedVisitors?: number;
  expectedExhibitors?: number;

  // Financeiro
  totalStands?: number;
  costPerSquareMeter?: number;
  setupCostPerSquareMeter?: number;
  expectedRevenue?: number;
  expectedProfit?: number;
  expectedProfitMargin?: number;
  standConfigurations?: Omit<StandConfiguration, 'id'>[];
}

export interface UpdateFairForm {
  name?: string;
  edition?: string;
  description?: string;
  bannerUrl?: string;
  status?: FairStatus;

  // Local
  location?: string;
  venueName?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;

  // Datas e horários
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  daySchedules?: Omit<DaySchedule, 'id'>[];

  // Planejamento
  expectedVisitors?: number;
  expectedExhibitors?: number;

  // Financeiro
  totalStands?: number;
  costPerSquareMeter?: number;
  setupCostPerSquareMeter?: number;
  expectedRevenue?: number;
  expectedProfit?: number;
  expectedProfitMargin?: number;
  standConfigurations?: Omit<StandConfiguration, 'id'>[];
}

export interface FairFilters {
  search?: string;
  isActive?: boolean;
  status?: FairStatus;
  uf?: string;
}

export interface FairStats {
  totalFairs: number;
  activeFairs: number;
  inactiveFairs: number;
  totalExpectedRevenue: number;
  totalExpectedProfit: number;
  averageProfitMargin: number;
}
