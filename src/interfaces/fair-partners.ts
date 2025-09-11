// Interfaces para o módulo de sócios por feira

export interface FairPartner {
  id: string;
  fairId: string;
  partnerId: string;
  percentage: number;
  totalEarnings: number;
  totalWithdrawn: number;
  availableBalance: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Dados do sócio (populados)
  partnerName?: string;
  partnerCpf?: string;
  partnerEmail?: string;
}

export interface CreateFairPartnerForm {
  fairId: string;
  partnerId: string;
  percentage: number;
  isActive?: boolean;
  notes?: string;
}

export interface UpdateFairPartnerForm {
  percentage?: number;
  isActive?: boolean;
  notes?: string;
}

export interface FairPartnerSummary {
  fairId: string;
  totalPartners: number;
  totalPercentage: number;
  partners: FairPartnerSummaryItem[];
}

export interface FairPartnerSummaryItem {
  partnerId: string;
  partnerName: string;
  percentage: number;
  totalEarnings: number;
  availableBalance: number;
}

export interface FairPartnerFinancialSummary {
  fairId: string;
  partnerId: string;
  percentage: number;
  totalEarnings: number;
  totalWithdrawn: number;
  availableBalance: number;
}

export interface AvailablePercentage {
  fairId: string;
  availablePercentage: number;
  usedPercentage: number;
  totalPercentage: number;
}

// Filtros para listagem
export interface FairPartnerFilters {
  fairId?: string;
  partnerId?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

// Interface para o partner básico (sem dados de feira)
export interface Partner {
  id: string;
  userId: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartnerForm {
  userId: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdatePartnerForm {
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
  isActive?: boolean;
}
