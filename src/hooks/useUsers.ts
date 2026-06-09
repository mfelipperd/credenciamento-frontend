import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxio } from "@/hooks/useAxio";
import { handleRequest } from "@/utils/handleRequest";
import { toast } from "sonner";
import type { User } from "@/interfaces/user";

const USERS_BASE_URL = "/users";

interface CreateUserInput {
  name: string;
  email: string;
  password?: string;
  role: string;
  cpf?: string;
  phone?: string;
  isActive?: boolean;
  fairIds?: string[];
}

// Hook para buscar usuários
export const useUsers = (filters?: { role?: string; isActive?: boolean }) => {
  const api = useAxio();

  return useQuery({
    queryKey: ["users", filters],
    queryFn: async () => {
      return handleRequest<User[]>({
        request: () => api.get(USERS_BASE_URL, { params: filters }),
      });
    },
  });
};

// Hook para buscar usuários por role
export const useUsersByRole = (role: string) => {
  const api = useAxio();

  return useQuery({
    queryKey: ["users", "role", role],
    queryFn: async () => {
      return handleRequest<User[]>({
        request: () => api.get(`${USERS_BASE_URL}/role/${role}`),
      });
    },
    enabled: !!role,
  });
};

// Hook para buscar usuários ativos
export const useActiveUsers = () => {
  const api = useAxio();

  return useQuery({
    queryKey: ["users", "active"],
    queryFn: async () => {
      return handleRequest<User[]>({
        request: () => api.get(`${USERS_BASE_URL}/active`),
      });
    },
  });
};

// Hook para buscar apenas sócios (usuários com role partner)
export const usePartners = () => {
  return useUsersByRole("partner");
};

// Hook para criar usuário
export const useCreateUser = () => {
  const api = useAxio();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUserInput) => {
      return handleRequest<User>({
        request: () => api.post(USERS_BASE_URL, userData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuário criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar usuário:", error);
      toast.error("Erro ao criar usuário");
    },
  });
};

// Hook para atualizar usuário
export const useUpdateUser = () => {
  const api = useAxio();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateUserInput> }) => {
      return handleRequest<User>({
        request: () => api.patch(`${USERS_BASE_URL}/${id}`, data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuário atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar usuário:", error);
      toast.error("Erro ao atualizar usuário");
    },
  });
};

// Hook para deletar usuário
export const useDeleteUser = () => {
  const api = useAxio();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return handleRequest<void>({
        request: () => api.delete(`${USERS_BASE_URL}/${id}`),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuário excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir usuário:", error);
      toast.error("Erro ao excluir usuário");
    },
  });
};
