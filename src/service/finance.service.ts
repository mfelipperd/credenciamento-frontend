import { handleRequest } from "@/utils/handleRequest";
import { useAxios } from "@/hooks/useAxio";
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
} from "@/interfaces/finance";

const BASE_URL = "/finance";

// Hook personalizado para o serviço financeiro
export const useFinanceService = () => {
  const api = useAxios();

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
          `${BASE_URL}/entry-models${
            params.toString() ? `?${params.toString()}` : ""
          }`
        ),
    });
  };

  const getEntryModel = async (id: string): Promise<EntryModel | undefined> => {
    return handleRequest<EntryModel>({
      request: () => api.get(`${BASE_URL}/entry-models/${id}`),
    });
  };

  const createEntryModel = async (
    data: Omit<EntryModel, "id" | "createdAt" | "updatedAt">
  ): Promise<EntryModel | undefined> => {
    return handleRequest<EntryModel>({
      request: () => api.post(`${BASE_URL}/entry-models`, data),
      successMessage: "Modelo de entrada criado com sucesso!",
    });
  };

  const updateEntryModel = async (
    id: string,
    data: Partial<Omit<EntryModel, "id" | "createdAt" | "updatedAt">>
  ): Promise<EntryModel | undefined> => {
    return handleRequest<EntryModel>({
      request: () => api.patch(`${BASE_URL}/entry-models/${id}`, data),
      successMessage: "Modelo de entrada atualizado com sucesso!",
    });
  };

  const deleteEntryModel = async (id: string, fairId?: string): Promise<void> => {
    console.log("Deleting entry model:", { id, fairId });
    
    const body = fairId ? { fairId } : {};
    console.log("DELETE body:", body);

    await handleRequest<{ success: boolean }>({
      request: () => api.delete(`${BASE_URL}/entry-models/${id}`, { data: body }),
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
          `${BASE_URL}/clients${
            params.toString() ? `?${params.toString()}` : ""
          }`
        ),
    });
  };

  const getClient = async (id: string): Promise<Client | undefined> => {
    return handleRequest<Client>({
      request: () => api.get(`${BASE_URL}/clients/${id}`),
    });
  };

  const getClientByEmail = async (
    email: string
  ): Promise<Client | undefined> => {
    return handleRequest<Client>({
      request: () => api.get(`${BASE_URL}/clients/email/${email}`),
    });
  };

  const getClientByCnpj = async (cnpj: string): Promise<Client | undefined> => {
    return handleRequest<Client>({
      request: () => api.get(`${BASE_URL}/clients/cnpj/${cnpj}`),
    });
  };

  const searchClients = async (q: string): Promise<Client[] | undefined> => {
    return getClients(q);
  };

  const createClient = async (
    data: CreateClientForm
  ): Promise<Client | undefined> => {
    return handleRequest<Client>({
      request: () => api.post(`${BASE_URL}/clients`, data),
      successMessage: "Cliente criado com sucesso!",
    });
  };

  const updateClient = async (
    id: string,
    data: Partial<CreateClientForm>
  ): Promise<Client | undefined> => {
    return handleRequest<Client>({
      request: () => api.patch(`${BASE_URL}/clients/${id}`, data),
      successMessage: "Cliente atualizado com sucesso!",
    });
  };

  const deleteClient = async (id: string): Promise<void> => {
    await handleRequest<{ success: boolean }>({
      request: () => api.delete(`${BASE_URL}/clients/${id}`),
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
      request: () => api.get(`${BASE_URL}/revenues?${params.toString()}`),
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
    id: string
  ): Promise<RevenueDetail | undefined> => {
    return handleRequest<RevenueDetail>({
      request: () => api.get(`${BASE_URL}/revenues/${id}`),
    });
  };

  const getRevenuesByClient = async (
    clientId: string
  ): Promise<RevenueListItem[] | undefined> => {
    return handleRequest<RevenueListItem[]>({
      request: () => api.get(`${BASE_URL}/revenues/client/${clientId}`),
    });
  };

  const createRevenue = async (
    data: CreateRevenueForm
  ): Promise<RevenueDetail | undefined> => {
    return handleRequest<RevenueDetail>({
      request: () => api.post(`${BASE_URL}/revenues`, data),
      successMessage: "Receita criada com sucesso!",
    });
  };

  const updateRevenue = async (
    id: string,
    data: Partial<CreateRevenueForm>
  ): Promise<RevenueDetail | undefined> => {
    return handleRequest<RevenueDetail>({
      request: () => api.patch(`${BASE_URL}/revenues/${id}`, data),
      successMessage: "Receita atualizada com sucesso!",
    });
  };

  const deleteRevenue = async (id: string): Promise<void> => {
    await handleRequest<{ success: boolean }>({
      request: () => api.delete(`${BASE_URL}/revenues/${id}`),
      successMessage: "Receita removida com sucesso!",
    });
  };

  const cancelRevenue = async (id: string): Promise<void> => {
    await handleRequest<{ success: boolean }>({
      request: () => api.patch(`${BASE_URL}/revenues/${id}/cancel`),
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
      request: () => api.get(`${BASE_URL}/revenues/kpis?${params.toString()}`),
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
          `${BASE_URL}/revenues/analytics/top-companies?${params.toString()}`
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
        api.get(`${BASE_URL}/revenues/analytics/by-type?${params.toString()}`),
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
        api.get(`${BASE_URL}/revenues/analytics/by-model?${params.toString()}`),
    });
  };

  // Installments
  const generateInstallments = async (revenueId: string): Promise<void> => {
    await handleRequest<{ success: boolean }>({
      request: () =>
        api.post(`${BASE_URL}/revenues/${revenueId}/installments/generate`),
      successMessage: "Parcelas geradas com sucesso!",
    });
  };

  const updateInstallment = async (
    id: string,
    data: { dueDate?: string; valueCents?: number }
  ): Promise<Installment | undefined> => {
    return handleRequest<Installment>({
      request: () => api.put(`${BASE_URL}/revenues/installment/${id}`, data),
      successMessage: "Parcela atualizada com sucesso!",
    });
  };

  const payInstallment = async (
    id: string,
    data: { paidAt: string; proofUrl?: string }
  ): Promise<Installment | undefined> => {
    return handleRequest<Installment>({
      request: () =>
        api.patch(
          `${BASE_URL}/revenues/installment/${id}/confirm-payment`,
          data
        ),
      successMessage: "Parcela baixada com sucesso!",
    });
  };

  // Alias para melhor clareza
  const confirmInstallmentPayment = async (
    installmentId: string,
    paidAt: string,
    proofUrl?: string
  ): Promise<Installment | undefined> => {
    return payInstallment(installmentId, { paidAt, proofUrl });
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
        api.post(`${BASE_URL}/revenues/${revenueId}/attachments`, formData, {
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
          `${BASE_URL}/revenues/${revenueId}/attachments/${attachmentId}`
        ),
      successMessage: "Arquivo removido com sucesso!",
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
  };
};
