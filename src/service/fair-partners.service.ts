import { useAxio } from "@/hooks/useAxio";
import { handleRequest } from "@/utils/handleRequest";
import type {
  FairPartner,
  CreateFairPartnerForm,
  UpdateFairPartnerForm,
  FairPartnerSummary,
  FairPartnerFinancialSummary,
  AvailablePercentage,
  Partner,
  CreatePartnerForm,
  UpdatePartnerForm,
} from "@/interfaces/fair-partners";

const FAIR_PARTNERS_BASE_URL = "/fair-partners";
const PARTNERS_BASE_URL = "/partners";

// Hook para gestão de sócios por feira
export const useFairPartnersService = () => {
  const api = useAxio();

  // Gestão de Associações Feira-Sócio
  const createFairPartner = async (data: CreateFairPartnerForm): Promise<FairPartner | undefined> => {
    return handleRequest<FairPartner>({
      request: () => api.post(`${FAIR_PARTNERS_BASE_URL}`, data),
    });
  };

  const getFairPartners = async (fairId: string): Promise<FairPartner[] | undefined> => {
    return handleRequest<FairPartner[]>({
      request: () => api.get(`${FAIR_PARTNERS_BASE_URL}/fair/${fairId}`),
    });
  };

  const getPartnerFairs = async (partnerId: string): Promise<FairPartner[] | undefined> => {
    return handleRequest<FairPartner[]>({
      request: () => api.get(`${FAIR_PARTNERS_BASE_URL}/partner/${partnerId}`),
    });
  };

  const getMyFairs = async (): Promise<FairPartner[] | undefined> => {
    return handleRequest<FairPartner[]>({
      request: () => api.get(`${FAIR_PARTNERS_BASE_URL}/me/fairs`),
    });
  };

  const getFairPartnerById = async (id: string): Promise<FairPartner | undefined> => {
    return handleRequest<FairPartner>({
      request: () => api.get(`${FAIR_PARTNERS_BASE_URL}/${id}`),
    });
  };

  const updateFairPartner = async (id: string, data: UpdateFairPartnerForm): Promise<FairPartner | undefined> => {
    return handleRequest<FairPartner>({
      request: () => api.patch(`${FAIR_PARTNERS_BASE_URL}/${id}`, data),
    });
  };

  const deleteFairPartner = async (id: string): Promise<{ message: string } | undefined> => {
    return handleRequest<{ message: string }>({
      request: () => api.delete(`${FAIR_PARTNERS_BASE_URL}/${id}`),
    });
  };

  // Controle Financeiro por Feira
  const getFairPartnersSummary = async (fairId: string): Promise<FairPartnerSummary | undefined> => {
    return handleRequest<FairPartnerSummary>({
      request: () => api.get(`${FAIR_PARTNERS_BASE_URL}/fair/${fairId}/summary`),
    });
  };

  const getFairPartnerFinancialSummary = async (fairId: string, partnerId: string): Promise<FairPartnerFinancialSummary | undefined> => {
    return handleRequest<FairPartnerFinancialSummary>({
      request: () => api.get(`${FAIR_PARTNERS_BASE_URL}/fair/${fairId}/partner/${partnerId}/financial-summary`),
    });
  };

  const getAvailablePercentage = async (fairId: string): Promise<AvailablePercentage | undefined> => {
    return handleRequest<AvailablePercentage>({
      request: () => api.get(`${FAIR_PARTNERS_BASE_URL}/fair/${fairId}/available-percentage`),
    });
  };

  // Gestão de Sócios (básicos)
  const createPartner = async (data: CreatePartnerForm): Promise<Partner | undefined> => {
    return handleRequest<Partner>({
      request: () => api.post(`${PARTNERS_BASE_URL}`, data),
    });
  };

  const getPartners = async (filters?: { search?: string; isActive?: boolean }): Promise<Partner[] | undefined> => {
    return handleRequest<Partner[]>({
      request: () => api.get(`${PARTNERS_BASE_URL}`, { params: filters }),
    });
  };

  const getPartnerById = async (id: string): Promise<Partner | undefined> => {
    return handleRequest<Partner>({
      request: () => api.get(`${PARTNERS_BASE_URL}/${id}`),
    });
  };

  const updatePartner = async (id: string, data: UpdatePartnerForm): Promise<Partner | undefined> => {
    return handleRequest<Partner>({
      request: () => api.patch(`${PARTNERS_BASE_URL}/${id}`, data),
    });
  };

  const deletePartner = async (id: string): Promise<{ message: string } | undefined> => {
    return handleRequest<{ message: string }>({
      request: () => api.delete(`${PARTNERS_BASE_URL}/${id}`),
    });
  };

  // Distribuição de Lucros
  const distributeProfit = async (fairId: string): Promise<any | undefined> => {
    return handleRequest<any>({
      request: () => api.post(`/cash-flow/distribute-profit/${fairId}`),
    });
  };

  return {
    // Associações Feira-Sócio
    createFairPartner,
    getFairPartners,
    getPartnerFairs,
    getMyFairs,
    getFairPartnerById,
    updateFairPartner,
    deleteFairPartner,
    
    // Controle Financeiro
    getFairPartnersSummary,
    getFairPartnerFinancialSummary,
    getAvailablePercentage,
    
    // Gestão de Sócios
    createPartner,
    getPartners,
    getPartnerById,
    updatePartner,
    deletePartner,
    
    // Distribuição
    distributeProfit,
  };
};
