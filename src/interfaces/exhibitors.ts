import type { Client } from "@/interfaces/finance";
import type { Fair } from "@/interfaces/fairs";

export type ExhibitorType = "BRAND" | "FACTORY" | "DISTRIBUTOR" | "OTHER";
export type MemberRole = "OWNER" | "ADMIN" | "FINANCE" | "MANAGER" | "STAFF";
export type ParticipationStatus = "INVITED" | "CONFIRMED" | "CANCELLED";
export type CredentialStatus = "PENDING" | "ACTIVE" | "REVOKED";

export interface ExhibitorFinanceClient { id: string; exhibitorId: string; clientId: string; createdAt: string; client: Client }
export interface Exhibitor { id: string; name: string; normalizedName: string; type: ExhibitorType; cnpj: string | null; isActive: boolean; createdAt: string; updatedAt: string; financeClients: ExhibitorFinanceClient[] }
export interface ExhibitorMember { id: string; exhibitorId: string; userId: number | null; name: string; normalizedName: string; email: string | null; phone: string | null; jobTitle: string | null; role: MemberRole; isActive: boolean; createdAt: string; updatedAt: string }
export interface ExhibitorCredential { id: string; exhibitorFairId: string; memberId: string; credentialCode: string; status: CredentialStatus; createdAt: string; updatedAt: string; member: ExhibitorMember }
export interface ExhibitorFair { id: string; exhibitorId: string; fairId: string; status: ParticipationStatus; source: string | null; createdAt: string; updatedAt: string; fair: Fair; members: ExhibitorCredential[] }
export interface CreateExhibitor { name: string; type?: ExhibitorType; cnpj?: string }
export interface CreateExhibitorMember { name: string; email?: string; phone?: string; jobTitle?: string; role?: MemberRole }
export interface CreateExhibitorFair { fairId: string; status?: ParticipationStatus; source?: string }

export const exhibitorTypeLabels: Record<ExhibitorType, string> = { BRAND: "Marca", FACTORY: "Fábrica", DISTRIBUTOR: "Distribuidora", OTHER: "Outro" };
export const memberRoleLabels: Record<MemberRole, string> = { OWNER: "Proprietário", ADMIN: "Administrador", FINANCE: "Financeiro", MANAGER: "Gerente", STAFF: "Equipe" };
export const participationStatusLabels: Record<ParticipationStatus, string> = { INVITED: "Convidado", CONFIRMED: "Confirmado", CANCELLED: "Cancelado" };
export const credentialStatusLabels: Record<CredentialStatus, string> = { PENDING: "Pendente", ACTIVE: "Ativa", REVOKED: "Revogada" };
