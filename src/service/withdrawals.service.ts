import { useAxio } from "@/hooks/useAxio";
import type {
  PartnerWithdrawal,
  CreateWithdrawalDto,
  ApproveWithdrawalDto,
  RejectWithdrawalDto,
  PartnerFinancialSummary,
  ProfitDistribution,
  AvailablePercentage,
  WithdrawalFilters,
} from "@/interfaces/withdrawals";
import { AppEndpoints } from "@/constants/AppEndpoints";

export const useWithdrawalsService = () => {
  const api = useAxio();

  // Distribuir lucros de uma feira
  const distributeProfit = async (fairId: string): Promise<ProfitDistribution> => {
    const response = await api.post(AppEndpoints.FINANCE.CASH_FLOW_DISTRIBUTE(fairId));
    return response.data;
  };

  // Criar solicitação de saque
  const createWithdrawal = async (
    partnerId: string,
    fairId: string,
    data: CreateWithdrawalDto
  ): Promise<PartnerWithdrawal> => {
    const payload = {
      ...data,
      fairId,
    };
    const response = await api.post(AppEndpoints.PARTNERS.WITHDRAWALS(partnerId), payload);
    return response.data;
  };

  // Listar saques de um sócio
  const getPartnerWithdrawals = async (
    partnerId: string,
    filters?: WithdrawalFilters
  ): Promise<PartnerWithdrawal[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const url = `${AppEndpoints.PARTNERS.WITHDRAWALS(partnerId)}${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  };

  // Listar saques de um sócio por feira específica
  const getPartnerWithdrawalsByFair = async (
    partnerId: string,
    fairId: string,
    filters?: WithdrawalFilters
  ): Promise<PartnerWithdrawal[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const url = `${AppEndpoints.PARTNERS.WITHDRAWALS_BY_FAIR(partnerId, fairId)}${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  };

  // Listar todos os saques (admin) - endpoint específico para admin
  const getAllWithdrawals = async (filters?: WithdrawalFilters): Promise<PartnerWithdrawal[]> => {
    if (!filters?.fairId) {
      throw new Error('fairId é obrigatório para listar saques');
    }

    // Usar fairId como partnerId no endpoint
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const url = `${AppEndpoints.PARTNERS.WITHDRAWALS(filters.fairId)}${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  };


  // Aprovar saque
  const approveWithdrawal = async (
    withdrawalId: string,
    data: ApproveWithdrawalDto
  ): Promise<PartnerWithdrawal> => {
    const response = await api.post(AppEndpoints.WITHDRAWALS.APPROVE(withdrawalId), data);
    return response.data;
  };

  // Rejeitar saque
  const rejectWithdrawal = async (
    withdrawalId: string,
    data: RejectWithdrawalDto
  ): Promise<PartnerWithdrawal> => {
    const response = await api.post(AppEndpoints.WITHDRAWALS.REJECT(withdrawalId), data);
    return response.data;
  };

  // Obter resumo financeiro de um sócio
  const getPartnerFinancialSummary = async (partnerId: string, fairId: string): Promise<PartnerFinancialSummary> => {
    const response = await api.get(`${AppEndpoints.PARTNERS.FINANCIAL_SUMMARY(partnerId)}?fairId=${fairId}`);
    return response.data;
  };

  // Obter porcentagem disponível para novos sócios
  const getAvailablePercentage = async (): Promise<AvailablePercentage> => {
    const response = await api.get(AppEndpoints.PARTNERS.AVAILABLE_PERCENTAGE);
    return response.data;
  };

  // Obter detalhes de um saque específico
  const getWithdrawalById = async (withdrawalId: string): Promise<PartnerWithdrawal> => {
    const response = await api.get(AppEndpoints.WITHDRAWALS.BY_ID(withdrawalId));
    return response.data;
  };

  // Atualizar status de um saque (ex: voltar para pendente)
  const updateWithdrawal = async (
    withdrawalId: string,
    data: { status?: PartnerWithdrawal['status']; reason?: string; bankDetails?: string; notes?: string }
  ): Promise<PartnerWithdrawal> => {
    const response = await api.patch(AppEndpoints.WITHDRAWALS.BY_ID(withdrawalId), data);
    return response.data;
  };

  // Excluir um saque
  const deleteWithdrawal = async (withdrawalId: string): Promise<{ message: string }> => {
    const response = await api.delete(AppEndpoints.WITHDRAWALS.BY_ID(withdrawalId));
    return response.data;
  };

  return {
    distributeProfit,
    createWithdrawal,
    getPartnerWithdrawals,
    getAllWithdrawals,
    approveWithdrawal,
    rejectWithdrawal,
    getPartnerFinancialSummary,
    getAvailablePercentage,
    getWithdrawalById,
    updateWithdrawal,
    deleteWithdrawal,
    getPartnerWithdrawalsByFair,
  };
};
