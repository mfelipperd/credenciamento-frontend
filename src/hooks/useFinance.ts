import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxio } from "@/hooks/useAxio";
import { toast } from "sonner";
import type {
  RevenueFilters,
  CreateRevenueForm,
  EntryModel,
  CreateClientForm,
  EntryModelType,
  RevenueStats,
} from "@/interfaces/finance";

// Hook para buscar estatísticas de receitas
export const useRevenueStats = (fairId: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: ["finance", "revenue-stats", fairId],
    queryFn: async () => {
      const response = await api.get(`/finance/revenues/stats/${fairId}`);
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

      const url = `/finance/revenues?${params.toString()}`;
      
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
      const response = await api.get(`/finance/revenues/${id}`);
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
      const response = await api.get(`/finance/kpis${queryString}`);
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
      const response = await api.get(`/finance/top-empresas${queryString}`);
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
      const response = await api.get(`/finance/entry-models${queryString}`);
      return response.data;
    },
  });
};

// Hook para buscar entry model específico
export const useEntryModel = (id: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: ["finance", "entry-models", "detail", id],
    queryFn: async () => {
      const response = await api.get(`/finance/entry-models/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Hook para buscar clientes
export const useClients = (q?: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: ["finance", "clients", "query", q],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (q) params.append("q", q);

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const response = await api.get(`/finance/clients${queryString}`);
      return response.data;
    },
  });
};

// Hook para buscar cliente específico
export const useClient = (id: string) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: ["finance", "clients", "detail", id],
    queryFn: async () => {
      const response = await api.get(`/finance/clients/${id}`);
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
      const response = await api.post(`/finance/revenues`, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["finance", "revenues"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "kpis"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "top-empresas"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "revenue-stats"] });
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
      const response = await api.patch(`/finance/revenues/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["finance", "revenues"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "kpis"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "top-empresas"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "revenue-stats"] });
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
      await api.delete(`/finance/revenues/${id}`);
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
      const response = await api.post(`/finance/entry-models`, data);
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
      const response = await api.patch(`/finance/entry-models/${id}`, data);
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
      await api.delete(`/finance/entry-models/${id}`);
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
      const response = await api.post(`/finance/clients`, data);
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
      const response = await api.patch(`/finance/clients/${id}`, data);
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
      await api.delete(`/finance/clients/${id}`);
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
