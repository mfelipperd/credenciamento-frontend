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

export const useWithdrawalsService = () => {
  const api = useAxio();

  // Distribuir lucros de uma feira
  const distributeProfit = async (fairId: string): Promise<ProfitDistribution> => {
    const response = await api.post(`/cash-flow/distribute-profit/${fairId}`);
    return response.data;
  };

  // Criar solicitação de saque
  const createWithdrawal = async (
    partnerId: string,
    data: CreateWithdrawalDto
  ): Promise<PartnerWithdrawal> => {
    const response = await api.post(`/partners/${partnerId}/withdrawals`, data);
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
    const url = `/partners/${partnerId}/withdrawals${queryString ? `?${queryString}` : ''}`;
    
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
    const url = `/partners/${filters.fairId}/withdrawals${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  };


  // Aprovar saque
  const approveWithdrawal = async (
    withdrawalId: string,
    data: ApproveWithdrawalDto
  ): Promise<PartnerWithdrawal> => {
    const response = await api.post(`/partners/withdrawals/${withdrawalId}/approve`, data);
    return response.data;
  };

  // Rejeitar saque
  const rejectWithdrawal = async (
    withdrawalId: string,
    data: RejectWithdrawalDto
  ): Promise<PartnerWithdrawal> => {
    const response = await api.post(`/partners/withdrawals/${withdrawalId}/reject`, data);
    return response.data;
  };

  // Obter resumo financeiro de um sócio
  const getPartnerFinancialSummary = async (partnerId: string): Promise<PartnerFinancialSummary> => {
    const response = await api.get(`/partners/${partnerId}/financial-summary`);
    return response.data;
  };

  // Obter porcentagem disponível para novos sócios
  const getAvailablePercentage = async (): Promise<AvailablePercentage> => {
    const response = await api.get('/partners/available-percentage');
    return response.data;
  };

  // Obter detalhes de um saque específico
  const getWithdrawalById = async (withdrawalId: string): Promise<PartnerWithdrawal> => {
    const response = await api.get(`/partners/withdrawals/${withdrawalId}`);
    return response.data;
  };

  // Atualizar status de um saque (ex: voltar para pendente)
  const updateWithdrawal = async (
    withdrawalId: string,
    data: { status?: PartnerWithdrawal['status']; reason?: string; bankDetails?: string; notes?: string }
  ): Promise<PartnerWithdrawal> => {
    const response = await api.patch(`/partners/withdrawals/${withdrawalId}`, data);
    return response.data;
  };

  // Excluir um saque
  const deleteWithdrawal = async (withdrawalId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/partners/withdrawals/${withdrawalId}`);
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
  };
};
