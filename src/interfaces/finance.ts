export type EntryModelType = "STAND" | "PATROCINIO";
export type RevenueStatus =
  | "PENDENTE"
  | "EM_ANDAMENTO"
  | "EM_ATRASO"
  | "PAGO"
  | "CANCELADO";
export type PaymentMethod = "PIX" | "BOLETO" | "CARTAO" | "TED" | "DINHEIRO";
export type InstallmentStatus = "A_VENCER" | "VENCIDA" | "PAGA" | "CANCELADA";

export interface Client {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
}

export interface EntryModel {
  id: string;
  fairId: string;
  type: EntryModelType;
  name: string;
  baseValue: number;
  costCents?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RevenueListItem {
  id: string;
  fairId: string;
  type: EntryModelType;
  status: RevenueStatus;
  client: { id: string; name: string };
  entryModel: { id: string; name: string };
  baseValue: number | string;
  discountCents: number | string;
  contractValue: number | string;
  paidCents?: number | string;
  openCents?: number | string;
  paymentMethod: PaymentMethod;
  nextDueDate?: string;
  createdAt: string;
}

export interface Installment {
  id: string;
  n: number;
  dueDate: string;
  valueCents: number;
  status: InstallmentStatus;
  paidAt?: string;
  proofUrl?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  mime: string;
  sizeBytes: number;
}

export interface RevenueDetail
  extends Omit<RevenueListItem, "paidCents" | "openCents" | "nextDueDate"> {
  condition?: "avista" | "parcelado";
  notes?: string;
  installments: Installment[];
  attachments: Attachment[];
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface Kpis {
  totalContractedCents: number;
  totalContracts: number;
  contractedGrowth?: number;
  totalReceivedCents: number;
  receivedPercentage: number;
  receivedGrowth?: number;
  totalPendingCents: number;
  pendingPercentage: number;
  totalOverdueCents: number;
  overdueCount: number;
  // Campos originais mantidos para compatibilidade
  totalStandsVendidos?: number;
  totalPatrocinios?: number;
  totalPago?: number;
  totalEstimado?: number;
}

export interface BucketValue {
  period: string;
  qtd?: number;
  totalContrato?: number;
  totalRecebido?: number;
}

export interface TopEmpresa {
  clientId: string;
  client: string;
  totalContrato?: number;
  totalPago?: number;
}

// Filtros para receitas
export interface RevenueFilters {
  fairId: string;
  page?: number;
  pageSize?: number;
  type?: EntryModelType | "all";
  status?: RevenueStatus | "all";
  q?: string;
  dateField?: "contrato" | "vencimento" | "pagamento";
  from?: string;
  to?: string;
}

// Form types
export interface CreateRevenueForm {
  fairId: string;
  entryModelId: string;
  clientId: string;
  baseValue: number;
  contractValue: number;
  discountCents: number;
  paymentMethod: PaymentMethod;
  condition: "avista" | "parcelado";
  notes?: string;
  createdBy: string;
  installmentsConfig?:
    | {
        count: number;
        firstDueDate: string;
        periodicity?: "MENSAL";
      }
    | {
        customDates: Array<{ dueDate: string; valueCents: number }>;
      };
}

export interface CreateClientForm {
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
}
