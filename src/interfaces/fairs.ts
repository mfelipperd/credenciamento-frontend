// Interfaces para o módulo de feiras aprimorado

export interface Fair {
  id: string;
  name: string;
  location: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  date: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  
  // Configurações de stands
  totalStands: number;
  costPerSquareMeter: number;
  setupCostPerSquareMeter: number;
  
  // Análise de margem
  expectedRevenue: number;
  expectedProfit: number;
  expectedProfitMargin: number;
  insights: string; // JSON com insights de negócio
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface StandConfiguration {
  id: string;
  fairId: string;
  name: string;
  width: number;
  height: number;
  quantity: number;
  pricePerSquareMeter: number;
  setupCostPerSquareMeter: number;
  
  // Campos calculados automaticamente
  totalPrice: number;
  totalSetupCost: number;
  profitPerStand: number;
  profitMargin: number;
  
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StandStatistics {
  totalConfigurations: number;
  totalStands: number;
  totalArea: number;
  averagePricePerSquareMeter: number;
  averageProfitMargin: number;
  mostProfitable: {
    id: string;
    name: string;
    profitMargin: number;
  };
  leastProfitable: {
    id: string;
    name: string;
    profitMargin: number;
  };
}

export interface BusinessInsight {
  type: 'profit_optimization' | 'stand_efficiency' | 'pricing_strategy' | 'market_analysis';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  potentialIncrease: number;
  action: string;
}

export interface FairAnalysis {
  fairId: string;
  totalStands: number;
  totalArea: number;
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  profitMargin: number;
  averagePricePerSquareMeter: number;
  averageSetupCostPerSquareMeter: number;
  standConfigurations: StandConfigurationAnalysis[];
  insights: BusinessInsight[];
  recommendations: string[];
}

export interface StandConfigurationAnalysis extends StandConfiguration {
  dimensions: string;
  area: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  efficiency: number;
  recommendation: 'highly_recommended' | 'recommended' | 'moderate' | 'not_recommended';
}

export interface OptimizedPricing {
  currentAnalysis: FairAnalysis;
  optimizedConfigurations: {
    id: string;
    name: string;
    dimensions: string;
    area: number;
    quantity: number;
    pricePerSquareMeter: number;
    setupCostPerSquareMeter: number;
    totalPrice: number;
    totalSetupCost: number;
    profitPerStand: number;
    profitMargin: number;
    optimizedPricePerSquareMeter: number;
    priceIncrease: number;
    newTotalPrice: number;
    newProfitMargin: number;
  }[];
  targetMargin: number;
}

export interface StandEfficiencyAnalysis {
  fairId: string;
  standConfigurations: StandConfigurationAnalysis[];
  totalStands: number;
  totalArea: number;
  averageEfficiency: number;
}

export interface ProfitAnalysis {
  fairId: string;
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  profitMargin: number;
  averagePricePerSquareMeter: number;
  averageSetupCostPerSquareMeter: number;
  profitPerSquareMeter: number;
}

// DTOs para criação e atualização
export interface CreateStandConfigurationDto {
  name: string;
  width: number;
  height: number;
  quantity: number;
  pricePerSquareMeter: number;
  setupCostPerSquareMeter: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateStandConfigurationDto {
  name?: string;
  width?: number;
  height?: number;
  quantity?: number;
  pricePerSquareMeter?: number;
  setupCostPerSquareMeter?: number;
  description?: string;
  isActive?: boolean;
}

export interface CreateFairDto {
  name: string;
  location: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  date: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  totalStands: number;
  costPerSquareMeter: number;
  setupCostPerSquareMeter: number;
  expectedRevenue?: number;
  expectedProfit?: number;
  expectedProfitMargin?: number;
  isActive?: boolean;
}

export interface UpdateFairDto {
  name?: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  date?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  totalStands?: number;
  costPerSquareMeter?: number;
  setupCostPerSquareMeter?: number;
  expectedRevenue?: number;
  expectedProfit?: number;
  expectedProfitMargin?: number;
  isActive?: boolean;
}