import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxio } from "@/hooks/useAxio";
import { toast } from "sonner";
import { getAxiosErrorMessage } from "@/utils/handleAxiosError";
import type {
  RevenueFilters,
  CreateRevenueForm,
  EntryModel,
  CreateClientForm,
  EntryModelType,
  RevenueStats,
  UpdateExpenseForm,
  Brand,
  Client,
  ClientImage,
} from "@/interfaces/finance";

import { AppEndpoints } from "@/constants/AppEndpoints";

// Hook para buscar estatísticas de receitas
export const useRevenueStats = (fairId: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: ["finance", "revenue-stats", fairId],
    queryFn: async () => {
      const response = await api.get(AppEndpoints.FINANCE.REVENUE_STATS(fairId));
      return response.data as RevenueStats;
    },
    enabled: !!fairId,
  });
};

// Hook para buscar receitas
export const useRevenues = (filters: RevenueFilters) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: ["finance", "revenues", "list", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("fairId", filters.fairId);
      
      // Adicionar outros filtros se presentes
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.pageSize) params.append("pageSize", filters.pageSize.toString());
      if (filters.type && filters.type !== "all") params.append("type", filters.type);
      if (filters.status && filters.status !== "all") params.append("status", filters.status);
      if (filters.q) params.append("q", filters.q);
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      if (filters.dateField) params.append("dateField", filters.dateField);

      const url = `${AppEndpoints.FINANCE.REVENUES}?${params.toString()}`;
      
      const response = await api.get(url);
      
      // Normalizar a resposta da API
      // Se a API retorna um array diretamente, convertemos para PagedResponse
      if (Array.isArray(response.data)) {
        return {
          items: response.data,
          page: filters.page || 1,
          pageSize: filters.pageSize || 20,
          total: response.data.length
        };
      }
      
      // Se já é um PagedResponse, retorna como está
      return response.data;
    },
    enabled: !!filters.fairId,
  });
};

// Hook para buscar detalhes de uma receita
export const useRevenueDetail = (id: string, fairId: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: ["finance", "revenues", "detail", id],
    queryFn: async () => {
      const response = await api.get(AppEndpoints.FINANCE.REVENUE_BY_ID(id));
      return response.data;
    },
    enabled: !!id && !!fairId,
  });
};

// Hook para buscar KPIs
export const useFinanceKpis = (fairId: string, from?: string, to?: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: ["finance", "kpis", fairId, from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);
      
      const queryString = params.toString() ? `?${params.toString()}` : "";
      const response = await api.get(`${AppEndpoints.FINANCE.REVENUE_KPIS}${queryString}`);
      return response.data;
    },
    enabled: !!fairId,
  });
};

// Hook para buscar top empresas
export const useTopEmpresas = (fairId: string, from?: string, to?: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: ["finance", "top-empresas", fairId, from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);
      
      const queryString = params.toString() ? `?${params.toString()}` : "";
      const response = await api.get(`${AppEndpoints.FINANCE.REVENUE_TOP_COMPANIES}${queryString}`);
      return response.data;
    },
    enabled: !!fairId,
  });
};

// Hook para buscar entry models
export const useEntryModels = (fairId?: string, type?: EntryModelType) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: ["finance", "entry-models", fairId, type],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (fairId) params.append("fairId", fairId);
      if (type) params.append("type", type);

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const response = await api.get(`${AppEndpoints.FINANCE.ENTRY_MODELS}${queryString}`);
      return response.data as EntryModel[];
    },
  });
};

// Hook para buscar entry model específico
export const useEntryModel = (id: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: ["finance", "entry-models", "detail", id],
    queryFn: async () => {
      const response = await api.get(AppEndpoints.FINANCE.ENTRY_MODEL_BY_ID(id));
      return response.data;
    },
    enabled: !!id,
  });
};

// Hook para buscar clientes
export const useClients = (fairId?: string, q?: string) => {
  const api = useAxio();

  return useQuery({
    queryKey: ["finance", "clients", "query", fairId, q],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (fairId) params.append("fairId", fairId);
      if (q) params.append("q", q);

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const response = await api.get(`${AppEndpoints.FINANCE.CLIENTS}${queryString}`);
      return response.data as Client[];
    },
  });
};

// Hook para buscar cliente específico
export const useClient = (id: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: ["finance", "clients", "detail", id],
    queryFn: async () => {
      const response = await api.get(AppEndpoints.FINANCE.CLIENT_BY_ID(id));
      return response.data;
    },
    enabled: !!id,
  });
};

// Mutations
export const useCreateRevenue = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async (data: CreateRevenueForm) => {
      const response = await api.post(AppEndpoints.FINANCE.REVENUES, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["finance", "revenues"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "kpis"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "top-empresas"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "revenue-stats"] });
      queryClient.invalidateQueries({ queryKey: ["stand-stats"] }); // Atualiza estatísticas de stands
      toast.success("Receita criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar receita: " + error.message);
    },
  });
};

export const useUpdateRevenue = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateRevenueForm> }) => {
      const response = await api.patch(AppEndpoints.FINANCE.REVENUE_BY_ID(id), data);
      return response.data;
    },
    onSuccess: () => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["finance", "revenues"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "kpis"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "top-empresas"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "revenue-stats"] });
      queryClient.invalidateQueries({ queryKey: ["stand-stats"] }); // Atualiza estatísticas de stands
      toast.success("Receita atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar receita: " + error.message);
    },
  });
};

export const useDeleteRevenue = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(AppEndpoints.FINANCE.REVENUE_BY_ID(id));
    },
    onSuccess: () => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["finance", "revenues"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "kpis"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "top-empresas"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "revenue-stats"] });
      toast.success("Receita excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir receita: " + error.message);
    },
  });
};

export const useCreateEntryModel = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async (data: Omit<EntryModel, "id" | "createdAt" | "updatedAt">) => {
      const response = await api.post(AppEndpoints.FINANCE.ENTRY_MODELS, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalida queries de entry models
      queryClient.invalidateQueries({ queryKey: ["finance", "entry-models"] });
      toast.success("Modelo de entrada criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar modelo de entrada: " + error.message);
    },
  });
};

export const useUpdateEntryModel = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<EntryModel, "id" | "createdAt" | "updatedAt">> }) => {
      const response = await api.patch(AppEndpoints.FINANCE.ENTRY_MODEL_BY_ID(id), data);
      return response.data;
    },
    onSuccess: () => {
      // Invalida queries de entry models
      queryClient.invalidateQueries({ queryKey: ["finance", "entry-models"] });
      toast.success("Modelo de entrada atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar modelo de entrada: " + error.message);
    },
  });
};

export const useDeleteEntryModel = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(AppEndpoints.FINANCE.ENTRY_MODEL_BY_ID(id));
    },
    onSuccess: () => {
      // Invalida queries de entry models
      queryClient.invalidateQueries({ queryKey: ["finance", "entry-models"] });
      toast.success("Modelo de entrada removido com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao remover modelo de entrada: " + error.message);
    },
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async (data: CreateClientForm) => {
      const response = await api.post(AppEndpoints.FINANCE.CLIENTS, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalida queries de clientes
      queryClient.invalidateQueries({ queryKey: ["finance", "clients"] });
      toast.success("Cliente criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar cliente: " + error.message);
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateClientForm> }) => {
      const response = await api.patch(AppEndpoints.FINANCE.CLIENT_BY_ID(id), data);
      return response.data;
    },
    onSuccess: () => {
      // Invalida queries de clientes
      queryClient.invalidateQueries({ queryKey: ["finance", "clients"] });
      toast.success("Cliente atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar cliente: " + error.message);
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(AppEndpoints.FINANCE.CLIENT_BY_ID(id));
    },
    onSuccess: () => {
      // Invalida queries de clientes
      queryClient.invalidateQueries({ queryKey: ["finance", "clients"] });
      toast.success("Cliente removido com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao remover cliente: " + error.message);
    },
  });
};

export const useAddBrand = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({ clientId, name, logo }: { clientId: string; name: string; logo: File }) => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("logo", logo);
      const response = await api.post(AppEndpoints.FINANCE.CLIENT_BRANDS(clientId), formData);
      return response.data as Brand;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance", "clients"] });
      toast.success("Marca adicionada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar marca: " + error.message);
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({ id, name, logo }: { id: string; name?: string; logo?: File }) => {
      const formData = new FormData();
      if (name) formData.append("name", name);
      if (logo) formData.append("logo", logo);
      const response = await api.patch(AppEndpoints.FINANCE.BRAND_BY_ID(id), formData);
      return response.data as Brand;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance", "clients"] });
      toast.success("Marca atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar marca: " + error.message);
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(AppEndpoints.FINANCE.BRAND_BY_ID(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance", "clients"] });
      toast.success("Marca removida com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao remover marca: " + error.message);
    },
  });
};

// Hook para atualizar despesa
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({ id, data, fairId }: { id: string; data: UpdateExpenseForm; fairId: string }) => {
      const response = await api.patch(AppEndpoints.FINANCE.EXPENSE_BY_ID(fairId, id), data);
      return response.data;
    },
    onSuccess: () => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-total"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-total-by-category"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-total-by-account"] });
      toast.success("Despesa atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar despesa: " + error.message);
    },
  });
};

// Hooks para imagens de clientes
export const useClientImages = (clientId: string, fairId?: string) => {
  const api = useAxio();

  return useQuery({
    queryKey: ["finance", "client-images", clientId, fairId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (fairId) params.append("fairId", fairId);
      const qs = params.toString();
      const response = await api.get(
        `${AppEndpoints.FINANCE.CLIENT_IMAGES(clientId)}${qs ? `?${qs}` : ""}`
      );
      return response.data as ClientImage[];
    },
    enabled: !!clientId,
  });
};

export const useUploadClientImages = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({
      clientId,
      fairId,
      files,
      caption,
    }: {
      clientId: string;
      fairId: string;
      files: File[];
      caption?: string;
    }) => {
      const formData = new FormData();
      files.forEach((f) => formData.append("images", f));
      if (caption?.trim()) formData.append("caption", caption.trim());
      const response = await api.post(
        `${AppEndpoints.FINANCE.CLIENT_IMAGES(clientId)}?fairId=${fairId}`,
        formData
      );
      return response.data as ClientImage[];
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ["finance", "client-images", clientId] });
      toast.success("Fotos enviadas com sucesso!");
    },
    onError: (error: unknown) => {
      toast.error("Erro ao enviar fotos: " + getAxiosErrorMessage(error));
    },
  });
};

// Hooks para galeria de imagens da feira (sem vínculo com cliente)
export const useFairImages = (fairId?: string) => {
  const api = useAxio();

  return useQuery({
    queryKey: ["finance", "fair-images", fairId],
    queryFn: async () => {
      const qs = fairId ? `?fairId=${fairId}` : "";
      const response = await api.get(`${AppEndpoints.FINANCE.CLIENT_IMAGES_ALL}${qs}`);
      return response.data as ClientImage[];
    },
    enabled: !!fairId,
  });
};

export const useUploadFairImages = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({
      fairId,
      files,
      caption,
    }: {
      fairId: string;
      files: File[];
      caption?: string;
    }) => {
      const formData = new FormData();
      files.forEach((f) => formData.append("images", f));
      if (caption?.trim()) formData.append("caption", caption.trim());
      const response = await api.post(AppEndpoints.FAIR_IMAGES.UPLOAD(fairId), formData);
      return response.data as ClientImage[];
    },
    onSuccess: (_, { fairId }) => {
      queryClient.invalidateQueries({ queryKey: ["finance", "fair-images", fairId] });
      toast.success("Imagens enviadas com sucesso!");
    },
    onError: (error: unknown) => {
      toast.error("Erro ao enviar imagens: " + getAxiosErrorMessage(error));
    },
  });
};

export const useDeleteFairImage = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({ imageId }: { imageId: string; fairId: string }) => {
      await api.delete(AppEndpoints.FINANCE.CLIENT_IMAGE_BY_ID(imageId));
    },
    onSuccess: (_, { fairId }) => {
      queryClient.invalidateQueries({ queryKey: ["finance", "fair-images", fairId] });
      toast.success("Imagem removida com sucesso!");
    },
    onError: (error: unknown) => {
      toast.error("Erro ao remover imagem: " + getAxiosErrorMessage(error));
    },
  });
};

export const useClientImagesByFair = (fairId?: string) => {
  const api = useAxio();

  return useQuery({
    queryKey: ["finance", "client-images-by-fair", fairId],
    queryFn: async () => {
      const response = await api.get(AppEndpoints.FINANCE.CLIENT_IMAGES_BY_FAIR(fairId!));
      return response.data as ClientImage[];
    },
    enabled: !!fairId,
  });
};

export const useDeleteClientImage = () => {
  const queryClient = useQueryClient();
  const api = useAxio();

  return useMutation({
    mutationFn: async ({ imageId }: { imageId: string; clientId: string }) => {
      await api.delete(AppEndpoints.FINANCE.CLIENT_IMAGE_BY_ID(imageId));
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ["finance", "client-images", clientId] });
      toast.success("Foto removida com sucesso!");
    },
    onError: (error: unknown) => {
      toast.error("Erro ao remover foto: " + getAxiosErrorMessage(error));
    },
  });
};

// Hook para análise de fluxo de caixa
export const useCashFlowAnalysis = (fairId: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: ["cash-flow-analysis", fairId],
    queryFn: async () => {
      const response = await api.get(AppEndpoints.FINANCE.CASH_FLOW_ANALYSIS(fairId));
      return response.data;
    },
    enabled: !!fairId,
  });
};
