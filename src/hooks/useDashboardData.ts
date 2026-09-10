import { useQuery } from "@tanstack/react-query";
import { useAxio } from "@/hooks/useAxio";

// Compartilha consultas entre gráficos e remontagens da mesma feira.
export function useDashboardData<T>(endpoint: string, fairId?: string, filterDay?: string) {
  const api = useAxio();
  return useQuery({
    queryKey: ["dashboard-data", endpoint, fairId, filterDay],
    queryFn: async () => {
      const response = await api.get<T>(endpoint, {
        params: { fairId, ...(filterDay ? { filterDay } : {}) },
      });
      return response.data;
    },
    enabled: !!fairId?.trim(),
    staleTime: 30_000,
  });
}
