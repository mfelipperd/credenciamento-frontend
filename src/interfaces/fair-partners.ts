// Interfaces para o módulo de sócios por feira

export interface FairPartner {
  id: string;
  fairId: string;
  partnerId: string;
  percentage: number;
  totalEarnings: number;
  totalWithdrawn: number;
  availableBalance: number;
  pendingWithdrawals: number;
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
  pendingWithdrawals: number;
}

export interface AvailablePercentage {
  fairId: string;
  availablePercentage: number;
  usedPercentage: number;
  totalPercentage: number;
}

// ─── Financial Overview (GET /fair-partners/fair/:fairId/financial-overview) ──

export type PartnerAlertType =
  | "overdraw"
  | "pending_exceeds_balance"
  | "inactive"
  | "withdrawal_in_unprofitable_fair";

export interface PartnerAlert {
  type: PartnerAlertType;
  message: string;
}

export interface PartnerFinancialOverviewItem {
  partnerId: string;
  partnerName: string;
  partnerEmail?: string;
  percentage: number;
  projectedEarnings: number;
  sacadoAprovado: number;
  sacadoPendente: number;
  saldoDisponivel: number;
  saldoConsiderandoPendentes: number;
  valorExcedente: number;
  isOverdrawn: boolean;
  taxaSaque: number;
  alertas: PartnerAlert[];
}

export interface FairFinancialOverview {
  fairId: string;
  lucroFeira: number;
  isProfitable: boolean;
  percentagemEmpresa: number;
  totalSacado: number;
  totalPendente: number;
  totalDisponivelSocios: number;
  sociosEmExcesso: string[];
  sociosComPendentes: string[];
  socios: PartnerFinancialOverviewItem[];
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
