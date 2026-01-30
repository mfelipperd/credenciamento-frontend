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

import { AppEndpoints } from "@/constants/AppEndpoints";

// Hook para gestão de sócios por feira
export const useFairPartnersService = () => {
  const api = useAxio();

  // Gestão de Associações Feira-Sócio
  const createFairPartner = async (data: CreateFairPartnerForm): Promise<FairPartner | undefined> => {
    return handleRequest<FairPartner>({
      request: () => api.post(AppEndpoints.FAIR_PARTNERS.BASE, data),
    });
  };

  const getFairPartners = async (fairId: string): Promise<FairPartner[] | undefined> => {
    return handleRequest<FairPartner[]>({
      request: () => api.get(AppEndpoints.FAIR_PARTNERS.BY_FAIR(fairId)),
    });
  };

  const getPartnerFairs = async (partnerId: string): Promise<FairPartner[] | undefined> => {
    return handleRequest<FairPartner[]>({
      request: () => api.get(AppEndpoints.FAIR_PARTNERS.BY_PARTNER(partnerId)),
    });
  };

  const getMyFairs = async (): Promise<FairPartner[] | undefined> => {
    return handleRequest<FairPartner[]>({
      request: () => api.get(AppEndpoints.FAIR_PARTNERS.ME_FAIRS),
    });
  };

  const getFairPartnerById = async (id: string): Promise<FairPartner | undefined> => {
    return handleRequest<FairPartner>({
      request: () => api.get(AppEndpoints.FAIR_PARTNERS.BY_ID(id)),
    });
  };

  const updateFairPartner = async (id: string, data: UpdateFairPartnerForm): Promise<FairPartner | undefined> => {
    return handleRequest<FairPartner>({
      request: () => api.patch(AppEndpoints.FAIR_PARTNERS.BY_ID(id), data),
    });
  };

  const deleteFairPartner = async (id: string): Promise<{ message: string } | undefined> => {
    return handleRequest<{ message: string }>({
      request: () => api.delete(AppEndpoints.FAIR_PARTNERS.BY_ID(id)),
    });
  };

  // Controle Financeiro por Feira
  const getFairPartnersSummary = async (fairId: string): Promise<FairPartnerSummary | undefined> => {
    return handleRequest<FairPartnerSummary>({
      request: () => api.get(AppEndpoints.FAIR_PARTNERS.SUMMARY(fairId)),
    });
  };

  const getFairPartnerFinancialSummary = async (fairId: string, partnerId: string): Promise<FairPartnerFinancialSummary | undefined> => {
    return handleRequest<FairPartnerFinancialSummary>({
      request: () => api.get(AppEndpoints.FAIR_PARTNERS.FINANCIAL_SUMMARY(fairId, partnerId)),
    });
  };

  const getAvailablePercentage = async (fairId: string): Promise<AvailablePercentage | undefined> => {
    return handleRequest<AvailablePercentage>({
      request: () => api.get(AppEndpoints.FAIR_PARTNERS.AVAILABLE_PERCENTAGE(fairId)),
    });
  };

  // Gestão de Sócios (básicos)
  const createPartner = async (data: CreatePartnerForm): Promise<Partner | undefined> => {
    return handleRequest<Partner>({
      request: () => api.post(AppEndpoints.PARTNERS.BASE, data),
    });
  };

  const getPartners = async (filters?: { search?: string; isActive?: boolean }): Promise<Partner[] | undefined> => {
    return handleRequest<Partner[]>({
      request: () => api.get(AppEndpoints.PARTNERS.BASE, { params: filters }),
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

  // Distribuição de Lucros
  const distributeProfit = async (fairId: string): Promise<any | undefined> => {
    return handleRequest<any>({
      request: () => api.post(AppEndpoints.FINANCE.CASH_FLOW_DISTRIBUTE(fairId)),
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
