import { useQuery } from "@tanstack/react-query";
import { useAxio } from "@/hooks/useAxio";
import { AppEndpoints } from "@/constants/AppEndpoints";
import type { Stand } from "@/interfaces/finance";

export function useAvailableStands(fairId?: string, enabled = true) {
  const api = useAxio();
  return useQuery({
    queryKey: ["stands", fairId, "available"],
    queryFn: async () => {
      const response = await api.get<Stand[]>(AppEndpoints.STANDS.AVAILABLE, {
        params: { fairId },
      });
      return response.data;
    },
    enabled: enabled && !!fairId,
    staleTime: 30_000,
  });
}
