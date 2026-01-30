import { handleRequest } from "@/utils/handleRequest";
import { useAxio } from "@/hooks/useAxio";
import type {
  RevenueListItem,
  RevenueDetail,
  RevenueFilters,
  PagedResponse,
  Kpis,
  TopEmpresa,
  CreateRevenueForm,
  EntryModel,
  Client,
  CreateClientForm,
  Installment,
  EntryModelType,
  CashFlowAnalysis,
} from "@/interfaces/finance";

import { AppEndpoints } from "@/constants/AppEndpoints";

// Hook personalizado para o serviço financeiro
export const useFinanceService = () => {
  const api = useAxio();

  // Entry Models
  const getEntryModels = async (
    fairId?: string,
    type?: EntryModelType
  ): Promise<EntryModel[] | undefined> => {
    const params = new URLSearchParams();
    if (fairId) params.append("fairId", fairId);
    if (type) params.append("type", type);

    return handleRequest<EntryModel[]>({
      request: () =>
        api.get(
          `${AppEndpoints.FINANCE.ENTRY_MODELS}${
            params.toString() ? `?${params.toString()}` : ""
          }`
        ),
    });
  };

  const getEntryModel = async (id: string): Promise<EntryModel | undefined> => {
    return handleRequest<EntryModel>({
      request: () => api.get(AppEndpoints.FINANCE.ENTRY_MODEL_BY_ID(id)),
    });
  };

  const createEntryModel = async (
    data: Omit<EntryModel, "id" | "createdAt" | "updatedAt">
  ): Promise<EntryModel | undefined> => {
    return handleRequest<EntryModel>({
      request: () => api.post(AppEndpoints.FINANCE.ENTRY_MODELS, data),
      successMessage: "Modelo de entrada criado com sucesso!",
    });
  };

  const updateEntryModel = async (
    id: string,
    data: Partial<Omit<EntryModel, "id" | "createdAt" | "updatedAt">>
  ): Promise<EntryModel | undefined> => {
    return handleRequest<EntryModel>({
      request: () => api.patch(AppEndpoints.FINANCE.ENTRY_MODEL_BY_ID(id), data),
      successMessage: "Modelo de entrada atualizado com sucesso!",
    });
  };

  const deleteEntryModel = async (
    id: string,
    _fairId?: string
  ): Promise<void> => {
    await handleRequest<{ success: boolean }>({
      request: () => api.delete(AppEndpoints.FINANCE.ENTRY_MODEL_BY_ID(id)),
      successMessage: "Modelo de entrada removido com sucesso!",
    });
  };

  // Clients
  const getClients = async (q?: string): Promise<Client[] | undefined> => {
    const params = new URLSearchParams();
    if (q) params.append("q", q);

    return handleRequest<Client[]>({
      request: () =>
        api.get(
          `${AppEndpoints.FINANCE.CLIENTS}${
            params.toString() ? `?${params.toString()}` : ""
          }`
        ),
    });
  };

  const getClient = async (id: string): Promise<Client | undefined> => {
    return handleRequest<Client>({
      request: () => api.get(AppEndpoints.FINANCE.CLIENT_BY_ID(id)),
    });
  };

  const getClientByEmail = async (
    email: string
  ): Promise<Client | undefined> => {
    return handleRequest<Client>({
      request: () => api.get(AppEndpoints.FINANCE.CLIENT_BY_EMAIL(email)),
    });
  };

  const getClientByCnpj = async (cnpj: string): Promise<Client | undefined> => {
    return handleRequest<Client>({
      request: () => api.get(AppEndpoints.FINANCE.CLIENT_BY_CNPJ(cnpj)),
    });
  };

  const searchClients = async (q: string): Promise<Client[] | undefined> => {
    return getClients(q);
  };

  const createClient = async (
    data: CreateClientForm
  ): Promise<Client | undefined> => {
    return handleRequest<Client>({
      request: () => api.post(AppEndpoints.FINANCE.CLIENTS, data),
      successMessage: "Cliente criado com sucesso!",
    });
  };

  const updateClient = async (
    id: string,
    data: Partial<CreateClientForm>
  ): Promise<Client | undefined> => {
    return handleRequest<Client>({
      request: () => api.patch(AppEndpoints.FINANCE.CLIENT_BY_ID(id), data),
      successMessage: "Cliente atualizado com sucesso!",
    });
  };

  const deleteClient = async (id: string): Promise<void> => {
    await handleRequest<{ success: boolean }>({
      request: () => api.delete(AppEndpoints.FINANCE.CLIENT_BY_ID(id)),
      successMessage: "Cliente removido com sucesso!",
    });
  };

  // Revenues
  const getRevenues = async (
    filters: RevenueFilters
  ): Promise<PagedResponse<RevenueListItem> | undefined> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await handleRequest<
      PagedResponse<RevenueListItem> | RevenueListItem[]
    >({
      request: () => api.get(`${AppEndpoints.FINANCE.REVENUES}?${params.toString()}`),
    });

    // Se a resposta for um array, convertemos para o formato PagedResponse
    if (Array.isArray(response)) {
      return {
        items: response,
        page: filters.page || 1,
        pageSize: filters.pageSize || 20,
        total: response.length,
      };
    }

    return response as PagedResponse<RevenueListItem>;
  };

  const getRevenueDetail = async (
    id: string,
    fairId?: string
  ): Promise<RevenueDetail | undefined> => {
    const params = new URLSearchParams();
    if (fairId) params.append("fairId", fairId);

    return handleRequest<RevenueDetail>({
      request: () =>
        api.get(
          `${AppEndpoints.FINANCE.REVENUE_BY_ID(id)}${
            params.toString() ? `?${params.toString()}` : ""
          }`
        ),
    });
  };

  const getRevenuesByClient = async (
    clientId: string,
    fairId?: string
  ): Promise<RevenueListItem[] | undefined> => {
    const params = new URLSearchParams();
    if (fairId) params.append("fairId", fairId);

    const url = `${AppEndpoints.FINANCE.REVENUE_BY_CLIENT(clientId)}${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    return handleRequest<RevenueListItem[]>({
      request: () => api.get(url),
    });
  };

  const createRevenue = async (
    data: CreateRevenueForm
  ): Promise<RevenueDetail | undefined> => {
    return handleRequest<RevenueDetail>({
      request: () => api.post(AppEndpoints.FINANCE.REVENUES, data),
      successMessage: "Receita criada com sucesso!",
    });
  };

  const updateRevenue = async (
    id: string,
    data: Partial<CreateRevenueForm>,
    fairId?: string
  ): Promise<RevenueDetail | undefined> => {
    const params = new URLSearchParams();
    if (fairId) params.append("fairId", fairId);

    return handleRequest<RevenueDetail>({
      request: () =>
        api.patch(
          `${AppEndpoints.FINANCE.REVENUE_BY_ID(id)}${
            params.toString() ? `?${params.toString()}` : ""
          }`,
          data
        ),
      successMessage: "Receita atualizada com sucesso!",
    });
  };

  const deleteRevenue = async (id: string, fairId?: string): Promise<void> => {
    const params = new URLSearchParams();
    if (fairId) params.append("fairId", fairId);

    const url = `${AppEndpoints.FINANCE.REVENUES}/${id}${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    await handleRequest<{ success: boolean }>({
      request: () => api.delete(url),
      successMessage: "Receita removida com sucesso!",
    });
  };

  const cancelRevenue = async (id: string, fairId?: string): Promise<void> => {
    const params = new URLSearchParams();
    if (fairId) params.append("fairId", fairId);

    const url = `${AppEndpoints.FINANCE.REVENUES}/${id}/cancel${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    await handleRequest<{ success: boolean }>({
      request: () => api.patch(url),
      successMessage: "Receita cancelada com sucesso!",
    });
  };

  // KPIs
  const getKpis = async (
    fairId: string,
    from?: string,
    to?: string
  ): Promise<Kpis | undefined> => {
    const params = new URLSearchParams({ fairId });
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    return handleRequest<Kpis>({
      request: () => api.get(`${AppEndpoints.FINANCE.REVENUE_KPIS}?${params.toString()}`),
    });
  };

  const getTopCompanies = async (
    fairId: string,
    metric: "contratado" | "pago" = "contratado",
    limit: number = 10,
    from?: string,
    to?: string
  ): Promise<TopEmpresa[] | undefined> => {
    const params = new URLSearchParams({
      fairId,
      metric,
      limit: limit.toString(),
    });
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    return handleRequest<TopEmpresa[]>({
      request: () =>
        api.get(
          `${AppEndpoints.FINANCE.REVENUE_TOP_COMPANIES}?${params.toString()}`
        ),
    });
  };

  const getRevenuesByType = async (
    fairId: string,
    from?: string,
    to?: string
  ): Promise<Array<{ tipo: string; totalContrato: number }> | undefined> => {
    const params = new URLSearchParams({ fairId });
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    return handleRequest<Array<{ tipo: string; totalContrato: number }>>({
      request: () =>
        api.get(`${AppEndpoints.FINANCE.REVENUE_BY_TYPE}?${params.toString()}`),
    });
  };

  const getRevenuesByModel = async (
    fairId: string,
    tipo: EntryModelType,
    from?: string,
    to?: string
  ): Promise<
    Array<{ modeloId: string; nome: string; totalContrato: number }> | undefined
  > => {
    const params = new URLSearchParams({ fairId, tipo });
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    return handleRequest<
      Array<{ modeloId: string; nome: string; totalContrato: number }>
    >({
      request: () =>
        api.get(`${AppEndpoints.FINANCE.REVENUE_BY_MODEL}?${params.toString()}`),
    });
  };

  // Installments
  const generateInstallments = async (revenueId: string): Promise<void> => {
    await handleRequest<{ success: boolean }>({
      request: () =>
        api.post(AppEndpoints.FINANCE.REVENUE_INSTALLMENTS_GENERATE(revenueId)),
      successMessage: "Parcelas geradas com sucesso!",
    });
  };

  const updateInstallment = async (
    id: string,
    data: { dueDate?: string; valueCents?: number }
  ): Promise<Installment | undefined> => {
    return handleRequest<Installment>({
      request: () => api.put(AppEndpoints.FINANCE.REVENUE_INSTALLMENT_UPDATE(id), data),
      successMessage: "Parcela atualizada com sucesso!",
    });
  };

  const payInstallment = async (
    id: string,
    data: { paidAt: string; proofUrl?: string; fairId: string }
  ): Promise<Installment | undefined> => {
    const { fairId, ...bodyData } = data;
    return handleRequest<Installment>({
      request: () =>
        api.patch(
          `${AppEndpoints.FINANCE.REVENUE_INSTALLMENT_PAY(id)}?fairId=${fairId}`,
          bodyData
        ),
      successMessage: "Parcela baixada com sucesso!",
    });
  };

  // Alias para melhor clareza
  const confirmInstallmentPayment = async (
    installmentId: string,
    paidAt: string,
    fairId: string,
    proofUrl?: string
  ): Promise<Installment | undefined> => {
    return payInstallment(installmentId, { paidAt, proofUrl, fairId });
  };

  // Attachments
  const uploadAttachment = async (
    revenueId: string,
    file: File
  ): Promise<{ id: string; url: string } | undefined> => {
    const formData = new FormData();
    formData.append("file", file);

    return handleRequest<{ id: string; url: string }>({
      request: () =>
        api.post(AppEndpoints.FINANCE.REVENUE_ATTACHMENTS(revenueId), formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }),
      successMessage: "Arquivo anexado com sucesso!",
    });
  };

  const deleteAttachment = async (
    revenueId: string,
    attachmentId: string
  ): Promise<void> => {
    await handleRequest<{ success: boolean }>({
      request: () =>
        api.delete(
          AppEndpoints.FINANCE.REVENUE_ATTACHMENT_BY_ID(revenueId, attachmentId)
        ),
      successMessage: "Arquivo removido com sucesso!",
    });
  };

  // Cash Flow Analysis
  const getCashFlowAnalysis = async (fairId: string): Promise<CashFlowAnalysis | undefined> => {
    return handleRequest<CashFlowAnalysis>({
      request: () => api.get(AppEndpoints.FINANCE.CASH_FLOW_ANALYSIS(fairId)),
    });
  };

  return {
    // Entry Models
    getEntryModels,
    getEntryModel,
    createEntryModel,
    updateEntryModel,
    deleteEntryModel,

    // Clients
    getClients,
    getClient,
    getClientByEmail,
    getClientByCnpj,
    searchClients,
    createClient,
    updateClient,
    deleteClient,

    // Revenues
    getRevenues,
    getRevenueDetail,
    getRevenuesByClient,
    createRevenue,
    updateRevenue,
    deleteRevenue,
    cancelRevenue,

    // KPIs
    getKpis,

    // Analytics
    getTopCompanies,
    getRevenuesByType,
    getRevenuesByModel,

    // Installments
    generateInstallments,
    updateInstallment,
    payInstallment,
    confirmInstallmentPayment,

    // Attachments
    uploadAttachment,
    deleteAttachment,

    // Cash Flow Analysis
    getCashFlowAnalysis,
  };
};
