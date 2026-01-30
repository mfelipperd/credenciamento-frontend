import { useAxio } from "@/hooks/useAxio";
import { handleRequest } from "@/utils/handleRequest";
import type {
  Partner,
  CreatePartnerForm,
  UpdatePartnerForm,
  Withdrawal,
  CreateWithdrawalForm,
  RejectWithdrawalForm,
  FinancialSummary,
  AvailablePercentage,
  ProfitDistribution,
  PartnerFilters,
  WithdrawalFilters,
} from "@/interfaces/partners";

import { AppEndpoints } from "@/constants/AppEndpoints";

// Hook para gestão de sócios
export const usePartnersService = () => {
  const api = useAxio();

  // Gestão de Sócios
  const createPartner = async (data: CreatePartnerForm): Promise<Partner | undefined> => {
    return handleRequest<Partner>({
      request: () => api.post(AppEndpoints.PARTNERS.BASE, data),
    });
  };

  const getPartners = async (filters?: PartnerFilters): Promise<Partner[] | undefined> => {
    return handleRequest<Partner[]>({
      request: () => api.get(AppEndpoints.PARTNERS.BASE, { params: filters }),
    });
  };

  const getPartnerMe = async (): Promise<Partner | undefined> => {
    return handleRequest<Partner>({
      request: () => api.get(AppEndpoints.PARTNERS.ME),
    });
  };

  const getPartnerById = async (id: string): Promise<Partner | undefined> => {
    return handleRequest<Partner>({
      request: () => api.get(AppEndpoints.PARTNERS.BY_ID(id)),
    });
  };

  const updatePartner = async (id: string, data: UpdatePartnerForm): Promise<Partner | undefined> => {
    return handleRequest<Partner>({
      request: () => api.patch(AppEndpoints.PARTNERS.BY_ID(id), data),
    });
  };

  const deletePartner = async (id: string): Promise<{ message: string } | undefined> => {
    return handleRequest<{ message: string }>({
      request: () => api.delete(AppEndpoints.PARTNERS.BY_ID(id)),
    });
  };

  // Controle Financeiro
  const getPartnerFinancialSummary = async (id: string, fairId: string): Promise<FinancialSummary | undefined> => {
    return handleRequest<FinancialSummary>({
      request: () => api.get(`${AppEndpoints.PARTNERS.FINANCIAL_SUMMARY(id)}?fairId=${fairId}`),
    });
  };

  const getAvailablePercentage = async (): Promise<AvailablePercentage | undefined> => {
    return handleRequest<AvailablePercentage>({
      request: () => api.get(AppEndpoints.PARTNERS.AVAILABLE_PERCENTAGE),
    });
  };

  // Sistema de Saques
  const createWithdrawal = async (partnerId: string, data: CreateWithdrawalForm): Promise<Withdrawal | undefined> => {
    return handleRequest<Withdrawal>({
      request: () => api.post(AppEndpoints.PARTNERS.WITHDRAWALS(partnerId), data),
    });
  };

  const getPartnerWithdrawals = async (partnerId: string, filters?: WithdrawalFilters): Promise<Withdrawal[] | undefined> => {
    return handleRequest<Withdrawal[]>({
      request: () => api.get(AppEndpoints.PARTNERS.WITHDRAWALS(partnerId), { params: filters }),
    });
  };

  const getAllWithdrawals = async (filters?: WithdrawalFilters): Promise<Withdrawal[] | undefined> => {
    if (!filters?.fairId) {
      throw new Error('fairId é obrigatório para listar saques');
    }

    if (!filters?.partnerId) {
      throw new Error('partnerId é obrigatório para listar saques');
    }

    return handleRequest<Withdrawal[]>({
      request: () => api.get(AppEndpoints.PARTNERS.WITHDRAWALS(filters.partnerId || ""), { params: { fairId: filters.fairId } }),
    });
  };

  const approveWithdrawal = async (withdrawalId: string): Promise<Withdrawal | undefined> => {
    return handleRequest<Withdrawal>({
      request: () => api.post(AppEndpoints.PARTNERS.APPROVE_WITHDRAWAL(withdrawalId)),
    });
  };

  const rejectWithdrawal = async (withdrawalId: string, data: RejectWithdrawalForm): Promise<Withdrawal | undefined> => {
    return handleRequest<Withdrawal>({
      request: () => api.post(AppEndpoints.PARTNERS.REJECT_WITHDRAWAL(withdrawalId), data),
    });
  };

  // Distribuição de Lucros
  const distributeProfit = async (fairId: string): Promise<ProfitDistribution | undefined> => {
    return handleRequest<ProfitDistribution>({
      request: () => api.post(AppEndpoints.FINANCE.CASH_FLOW_DISTRIBUTE(fairId)),
    });
  };

  return {
    createPartner,
    getPartners,
    getPartnerMe,
    getPartnerById,
    updatePartner,
    deletePartner,
    getPartnerFinancialSummary,
    getAvailablePercentage,
    createWithdrawal,
    getPartnerWithdrawals,
    getAllWithdrawals,
    approveWithdrawal,
    rejectWithdrawal,
    distributeProfit,
  };
};