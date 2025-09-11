// Interfaces para o módulo de sócios

export interface Partner {
  id: string;
  userId: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  percentage: number;
  totalEarnings: number;
  totalWithdrawn: number;
  availableBalance: number;
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
  percentage: number;
  notes?: string;
  isActive?: boolean;
}

export interface UpdatePartnerForm {
  name?: string;
  email?: string;
  phone?: string;
  percentage?: number;
  notes?: string;
  isActive?: boolean;
}

export interface Withdrawal {
  id: string;
  partnerId: string;
  amount: number;
  status: WithdrawalStatus;
  reason: string;
  bankDetails: string;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface CreateWithdrawalForm {
  amount: number;
  reason: string;
  bankDetails: string;
  notes?: string;
}

export interface RejectWithdrawalForm {
  rejectionReason: string;
}

export interface FinancialSummary {
  totalEarnings: number;
  totalWithdrawn: number;
  availableBalance: number;
  pendingWithdrawals: number;
  totalWithdrawals: number;
}

export interface AvailablePercentage {
  availablePercentage: number;
  usedPercentage: number;
  totalPercentage: number;
}

export interface ProfitDistribution {
  fairId: string;
  totalProfit: number;
  distribution: PartnerDistribution[];
}

export interface PartnerDistribution {
  partnerId: string;
  partnerName: string;
  percentage: number;
  share: number;
}

// Filtros para listagem
export interface PartnerFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export interface WithdrawalFilters {
  page?: number;
  pageSize?: number;
  status?: WithdrawalStatus;
  partnerId?: string;
}
