import { useQuery } from "@tanstack/react-query";
import { useAxio } from "@/hooks/useAxio";
import { handleRequest } from "@/utils/handleRequest";

const USERS_BASE_URL = "/users";

// Hook para buscar usuários
export const useUsers = (filters?: { role?: string; isActive?: boolean }) => {
  const api = useAxio();
  
  return useQuery({
    queryKey: ["users", filters],
    queryFn: async () => {
      return handleRequest<any[]>({
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
      return handleRequest<any[]>({
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
      return handleRequest<any[]>({
        request: () => api.get(`${USERS_BASE_URL}/active`),
      });
    },
  });
};

// Hook para buscar apenas sócios (usuários com role partner)
export const usePartners = () => {
  return useUsersByRole("partner");
};
