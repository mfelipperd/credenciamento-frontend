import type { Client } from "@/interfaces/finance";
import type { Fair } from "@/interfaces/fairs";

export type ExhibitorType = "BRAND" | "FACTORY" | "DISTRIBUTOR" | "OTHER";
export type MemberRole = "OWNER" | "ADMIN" | "FINANCE" | "MANAGER" | "STAFF";
export type ParticipationStatus = "INVITED" | "CONFIRMED" | "CANCELLED";
export type CredentialStatus = "PENDING" | "ACTIVE" | "REVOKED";

export interface ExhibitorFinanceClient { id: string; exhibitorId: string; clientId: string; createdAt: string; client: Client }
export interface Exhibitor { id: string; name: string; normalizedName: string; type: ExhibitorType; cnpj: string | null; isActive: boolean; fairCount: number; standCount: number; peopleCount: number; financeClientCount: number; totalStandRevenueCents: number; lastStandPurchaseAt: string | null; createdAt: string; updatedAt: string }
export interface ExhibitorMember { id: string; exhibitorId: string; userId: number | null; name: string; normalizedName: string; email: string | null; phone: string | null; jobTitle: string | null; role: MemberRole; isActive: boolean; createdAt: string; updatedAt: string }
export interface ExhibitorCredential { id: string; exhibitorFairId: string; memberId: string; credentialCode: string; status: CredentialStatus; createdAt: string; updatedAt: string; member: ExhibitorMember }
export interface ExhibitorFair { id: string; exhibitorId: string; fairId: string; status: ParticipationStatus; source: string | null; createdAt: string; updatedAt: string; fair: Fair; members: ExhibitorCredential[] }
export interface ExhibitorInvitation { id: string; exhibitorId: string; email: string; role: MemberRole; status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED"; expiresAt: string; invitedBy: number | null; createdAt: string; updatedAt: string }
export interface ExhibitorCompleteDetails {
  exhibitor: Omit<Exhibitor, "fairCount" | "standCount" | "peopleCount" | "financeClientCount" | "totalStandRevenueCents" | "lastStandPurchaseAt">;
  counts: { fairs: number; stands: number; people: number; financeClients: number; credentials: number; activeCredentials: number };
  commercial: { primaryContact: { source: "TEAM" | "FINANCE_CLIENT"; id: string; name: string; role: MemberRole | null; jobTitle: string | null; email: string | null; phone: string | null } | null; firstParticipationAt: string | null; lastParticipationAt: string | null; yearsAsCustomer: number; isRecurring: boolean; participationRate: number; totalFairsAvailable: number };
  financial: { totalStandsPurchased: number; mappedStands: number; totalStandRevenueCents: number; totalSponsorships: number; totalSponsorshipRevenueCents: number; fairsWithStandPurchases: number; status: { paid: number; pending: number; inProgress: number; overdue: number; cancelled: number }; lastStandPurchaseAt: string | null; totalContractedCents: number; totalPaidCents: number; totalPendingCents: number; totalOverdueCents: number; availableToPayCents: number; averageStandTicketCents: number; financialStatus: "ADIMPLENTE" | "PENDENTE" | "INADIMPLENTE"; firstPurchaseAt: string | null; lastPurchaseAt: string | null };
  fairFinancials: Array<{ fairId: string; fairName: string; standsPurchased: number; mappedStands: number; standRevenueCents: number; sponsorshipRevenueCents: number; lastStandPurchaseAt: string | null }>;
  yearlyEvolution: Array<{ year: number; fairs: number; stands: number; contractedCents: number; paidCents: number }>;
  purchases: Array<{ revenueId: string; fairId: string; fairName: string; clientId: string; clientName: string; status: "PENDENTE" | "EM_ANDAMENTO" | "EM_ATRASO" | "PAGO" | "CANCELADO"; contractValueCents: number; paymentMethod: "PIX" | "BOLETO" | "CARTAO" | "TED" | "DINHEIRO"; numberOfInstallments: number; createdAt: string; standId: number | null; standNumber: number | null }>;
  participations: ExhibitorFair[]; team: ExhibitorMember[]; financeClients: ExhibitorFinanceClient[]; invitations: ExhibitorInvitation[];
}
export interface CreateExhibitor { name: string; type?: ExhibitorType; cnpj?: string }
export interface CreateExhibitorMember { name: string; email?: string; phone?: string; jobTitle?: string; role?: MemberRole }
export interface CreateExhibitorFair { fairId: string; status?: ParticipationStatus; source?: string }

export const exhibitorTypeLabels: Record<ExhibitorType, string> = { BRAND: "Marca", FACTORY: "Fábrica", DISTRIBUTOR: "Distribuidora", OTHER: "Outro" };
export const memberRoleLabels: Record<MemberRole, string> = { OWNER: "Proprietário", ADMIN: "Administrador", FINANCE: "Financeiro", MANAGER: "Gerente", STAFF: "Equipe" };
export const participationStatusLabels: Record<ParticipationStatus, string> = { INVITED: "Convidado", CONFIRMED: "Confirmado", CANCELLED: "Cancelado" };
export const credentialStatusLabels: Record<CredentialStatus, string> = { PENDING: "Pendente", ACTIVE: "Ativa", REVOKED: "Revogada" };
