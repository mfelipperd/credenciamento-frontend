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

const BASE_URL = "/partners";

// Hook para gestão de sócios
export const usePartnersService = () => {
  const api = useAxio();

  // Gestão de Sócios
  const createPartner = async (data: CreatePartnerForm): Promise<Partner | undefined> => {
    return handleRequest<Partner>({
      request: () => api.post(`${BASE_URL}`, data),
    });
  };

  const getPartners = async (filters?: PartnerFilters): Promise<Partner[] | undefined> => {
    return handleRequest<Partner[]>({
      request: () => api.get(`${BASE_URL}`, { params: filters }),
    });
  };

  const getPartnerMe = async (): Promise<Partner | undefined> => {
    return handleRequest<Partner>({
      request: () => api.get(`${BASE_URL}/me`),
    });
  };

  const getPartnerById = async (id: string): Promise<Partner | undefined> => {
    return handleRequest<Partner>({
      request: () => api.get(`${BASE_URL}/${id}`),
    });
  };

  const updatePartner = async (id: string, data: UpdatePartnerForm): Promise<Partner | undefined> => {
    return handleRequest<Partner>({
      request: () => api.patch(`${BASE_URL}/${id}`, data),
    });
  };

  const deletePartner = async (id: string): Promise<{ message: string } | undefined> => {
    return handleRequest<{ message: string }>({
      request: () => api.delete(`${BASE_URL}/${id}`),
    });
  };

  // Controle Financeiro
  const getPartnerFinancialSummary = async (id: string): Promise<FinancialSummary | undefined> => {
    return handleRequest<FinancialSummary>({
      request: () => api.get(`${BASE_URL}/${id}/financial-summary`),
    });
  };

  const getAvailablePercentage = async (): Promise<AvailablePercentage | undefined> => {
    return handleRequest<AvailablePercentage>({
      request: () => api.get(`${BASE_URL}/available-percentage`),
    });
  };

  // Sistema de Saques
  const createWithdrawal = async (partnerId: string, data: CreateWithdrawalForm): Promise<Withdrawal | undefined> => {
    return handleRequest<Withdrawal>({
      request: () => api.post(`${BASE_URL}/${partnerId}/withdrawals`, data),
    });
  };

  const getPartnerWithdrawals = async (partnerId: string, filters?: WithdrawalFilters): Promise<Withdrawal[] | undefined> => {
    return handleRequest<Withdrawal[]>({
      request: () => api.get(`${BASE_URL}/${partnerId}/withdrawals`, { params: filters }),
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
      request: () => api.get(`${BASE_URL}/${filters.partnerId}/withdrawals`, { params: { fairId: filters.fairId } }),
    });
  };

  const approveWithdrawal = async (withdrawalId: string): Promise<Withdrawal | undefined> => {
    return handleRequest<Withdrawal>({
      request: () => api.post(`${BASE_URL}/withdrawals/${withdrawalId}/approve`),
    });
  };

  const rejectWithdrawal = async (withdrawalId: string, data: RejectWithdrawalForm): Promise<Withdrawal | undefined> => {
    return handleRequest<Withdrawal>({
      request: () => api.post(`${BASE_URL}/withdrawals/${withdrawalId}/reject`, data),
    });
  };

  // Distribuição de Lucros
  const distributeProfit = async (fairId: string): Promise<ProfitDistribution | undefined> => {
    return handleRequest<ProfitDistribution>({
      request: () => api.post(`/cash-flow/distribute-profit/${fairId}`),
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