export interface PartnerWithdrawal {
  id: string;
  partnerId: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  reason?: string;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  bankDetails?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWithdrawalDto {
  fairId: string;
  amount: number;
  reason?: string;
  bankDetails?: string;
  notes?: string;
}

export interface ApproveWithdrawalDto {
  approvedBy: string;
}

export interface RejectWithdrawalDto {
  rejectionReason: string;
}

export interface FairEarning {
  fairId: string;
  fairName: string;
  percentage: string;
  earnings: number;
  isProfitable: boolean;
}

export interface PartnerFinancialSummary {
  totalEarnings: number;
  totalWithdrawn: number;
  availableBalance: number;
  pendingWithdrawals: number;
  totalWithdrawals: number;
  percentage: number | null;
  fairEarnings: FairEarning[];
}

export interface ProfitDistribution {
  fairId: string;
  totalProfit: number;
  distribution: {
    partnerId: string;
    partnerName: string;
    percentage: number;
    share: number;
  }[];
}

export interface AvailablePercentage {
  availablePercentage: number;
  usedPercentage: number;
  totalPercentage: number;
}

export interface WithdrawalFilters {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  partnerId?: string;
  fairId?: string;
  startDate?: string;
  endDate?: string;
}
