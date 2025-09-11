import type { Fair } from "@/interfaces/visitors";

export type EntryModelType = "STAND" | "PATROCINIO";
export type RevenueStatus =
  | "PENDENTE"
  | "EM_ANDAMENTO"
  | "EM_ATRASO"
  | "PAGO"
  | "CANCELADO";
export type PaymentMethod =
  | "PIX"
  | "BOLETO"
  | "CARTAO"
  | "TED"
  | "DINHEIRO"
  | "TRANSFERENCIA";
export type InstallmentStatus = "A_VENCER" | "VENCIDA" | "PAGA" | "CANCELADA";

// Stand interfaces
export interface Stand {
  id: string;
  standNumber: number;
  fairId: string;
  price?: number;
  isAvailable: boolean;
  revenueId?: string | null;
  revenue?: RevenueDetail | null;
  createdAt: string;
  updatedAt: string;

  // Dados do cliente (quando stand está ocupado)
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientCnpj?: string;

  // Dados da receita (quando stand está ocupado)
  revenueStatus?: RevenueStatus;
  paymentMethod?: PaymentMethod;
  contractValue?: number; // Valor em centavos
  numberOfInstallments?: number;
  condition?: string;
  notes?: string;
  revenueCreatedAt?: string;

  // Dados do entry model
  entryModelName?: string;
  entryModelBaseValue?: number; // Valor em centavos
}

export interface StandStats {
  fairId: string;
  total: number;
  available: number;
  occupied: number;
  occupancyRate: number;
  totalRevenue: number;
  averagePrice: number;
}

export interface ConfigureStandsForm {
  fairId: string;
  totalStands: number;
  price: number;
}

export interface ConfigureStandsResponse {
  message: string;
  fairId: string;
  totalStands: number;
  price: number;
}

export interface Client {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
}

export interface EntryModel {
  id: string;
  fairId?: string;
  type: EntryModelType;
  name: string;
  baseValue: number; // Obrigatório
  costCents?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Installment {
  id: string;
  revenueId: string;
  n: number; // Número da parcela
  valueCents: number; // Valor em centavos
  dueDate: string;
  paidAt?: string | null; // Data de pagamento (se paga)
  status: InstallmentStatus;
  proofUrl?: string | null; // URL do comprovante (se houver)
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  mime: string;
  sizeBytes: number;
}

// Interface principal para receitas (tanto listagem quanto detalhamento)
export interface RevenueListItem {
  // Informações principais da receita
  id: string;
  fairId: string;
  type: EntryModelType;
  entryModelId: string;
  clientId: string;
  standNumber: number; // Número do stand comprado

  // Valores monetários (em centavos)
  baseValue: number;
  discountCents: number;
  contractValue: number;

  // Configurações de pagamento
  paymentMethod: PaymentMethod;
  numberOfInstallments: number;

  // Status e informações adicionais
  status: RevenueStatus;
  condition?: string; // condições especiais (opcional)
  notes?: string; // observações gerais (opcional)
  createdBy: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relacionamentos (opcionais - dependem do include)
  client?: Client;
  entryModel?: EntryModel;
  installments?: Installment[];
}

// Alias para detalhamento (mesmo formato)
export interface RevenueDetail extends RevenueListItem {
  // Garantir que estes campos estão presentes no detalhamento
  client: Client;
  entryModel: EntryModel;
  stand?: Stand; // ✅ NOVO CAMPO para dados do stand vinculado
  installments: Installment[];
  attachments?: Attachment[];
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
  fairId: string; // ✅ Obrigatório
  standNumber: number; // ✅ NOVO CAMPO OBRIGATÓRIO
  type: EntryModelType; // ✅ Obrigatório - "STAND" ou "PATROCINIO"
  entryModelId: string; // ✅ Obrigatório
  clientId: string; // ✅ Obrigatório
  baseValue: number; // ✅ Obrigatório - valor em centavos
  discountCents: number; // ✅ Obrigatório - desconto em centavos
  contractValue: number; // ✅ Obrigatório - valor final em centavos
  paymentMethod: PaymentMethod; // ✅ Obrigatório
  numberOfInstallments: number; // ✅ Obrigatório - número de parcelas (padrão: 1)
  createdBy: string; // ✅ Obrigatório - ID do usuário criador
  condition?: string; // ❌ Opcional - condições especiais
  notes?: string; // ❌ Opcional - observações
}

export interface CreateClientForm {
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  fairId: string;
}

// Enums para tipos de conta
export const AccountType = {
  CORRENTE: "CORRENTE",
  POUPANCA: "POUPANCA",
  OUTRO: "OUTRO",
} as const;

export type AccountType = (typeof AccountType)[keyof typeof AccountType];

// Interfaces para categorias financeiras
export interface FinanceCategory {
  id: string;
  name: string; // Mudou de 'nome' para 'name' para consistência com a API
  parentId?: string;
  global: boolean;
  fairId?: string;
  parent?: FinanceCategory;
  children?: FinanceCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFinanceCategoryForm {
  name: string; // Mudou de 'nome' para 'name' para consistência com a API
  parentId?: string;
  global: boolean;
  fairId?: string;
}

export interface UpdateFinanceCategoryForm
  extends Partial<CreateFinanceCategoryForm> {}

// Interface para análise de fluxo de caixa
export interface CashFlowAnalysis {
  fairId: string;
  totalRevenue: number | null;
  totalExpenses: number | null;
  netProfit: number | null;
  profitMargin: number | null;
  isProfitable: boolean;
  revenueCount: number | null;
  expenseCount: number | null;
  averageRevenue: number | null;
  averageExpense: number | null;
  largestRevenue: number | null;
  largestExpense: number | null;
  performance: "excellent" | "good" | "average" | "poor" | null;
  recommendations: string[];
  summary: string | null;
}

// Interfaces para contas bancárias
export interface Account {
  id: string;
  nomeConta: string;
  banco?: string;
  tipo: AccountType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountForm {
  nomeConta: string;
  banco?: string;
  tipo: AccountType;
}

export interface UpdateAccountForm extends Partial<CreateAccountForm> {}

// Interfaces para despesas
export interface Expense {
  id: string;
  fairId: string;
  categoryId: string;
  accountId: string;
  descricao?: string;
  valor: number;
  data: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;

  // Relacionamentos
  fair?: Fair;
  category?: FinanceCategory;
  account?: Account;
}

export interface CreateExpenseForm {
  fairId: string;
  categoryId: string;
  accountId: string;
  descricao?: string;
  valor: number;
  data: string;
  observacoes?: string;
}

export interface UpdateExpenseForm extends Partial<CreateExpenseForm> {}

// Filtros para despesas
export interface ExpenseFilters {
  fairId: string;
  categoryId?: string;
  accountId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

// Respostas de relatórios
export interface ExpenseTotalByCategory {
  categoryId: string;
  categoryName: string;
  total: number;
}

export interface ExpenseTotalByAccount {
  accountId: string;
  accountName: string;
  total: number;
}

// Interface para estatísticas de receitas
export interface RevenueStats {
  totalValue: number;
  totalRevenues: number;
  averagePerRevenue: number;
}
