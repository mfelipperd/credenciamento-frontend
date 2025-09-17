// Interfaces para o módulo de feiras

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

export interface Fair {
  id: string;
  name: string;
  location: string;
  googleMapsUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  totalStands?: number;
  costPerSquareMeter?: number;
  setupCostPerSquareMeter?: number;
  expectedRevenue?: number;
  expectedProfit?: number;
  expectedProfitMargin?: number;
  isActive: boolean;
  standConfigurations?: StandConfiguration[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFairForm {
  name: string;
  location: string;
  googleMapsUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
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
  location?: string;
  googleMapsUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  totalStands?: number;
  costPerSquareMeter?: number;
  setupCostPerSquareMeter?: number;
  expectedRevenue?: number;
  expectedProfit?: number;
  expectedProfitMargin?: number;
  standConfigurations?: Omit<StandConfiguration, 'id'>[];
}

export interface FairFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  city?: string;
  state?: string;
  startDate?: string;
  endDate?: string;
}

export interface FairStats {
  totalFairs: number;
  activeFairs: number;
  inactiveFairs: number;
  totalExpectedRevenue: number;
  totalExpectedProfit: number;
  averageProfitMargin: number;
}