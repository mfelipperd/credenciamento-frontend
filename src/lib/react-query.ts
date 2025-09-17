import { QueryClient } from "@tanstack/react-query";

// Configuração centralizada do React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tempo de vida padrão das queries (5 minutos)
      staleTime: 5 * 60 * 1000,
      // Tempo de cache padrão (10 minutos)
      gcTime: 10 * 60 * 1000,
      // Retry automático em caso de erro
      retry: (failureCount, error) => {
        // Não retry para erros 4xx (cliente)
        if (error instanceof Error && 'status' in error && (error as any).status >= 400 && (error as any).status < 500) {
          return false;
        }
        // Retry até 3 vezes para outros erros
        return failureCount < 3;
      },
      // Retry delay exponencial
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch automático quando a janela ganha foco
      refetchOnWindowFocus: true,
      // Refetch automático quando reconecta
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry automático para mutations
      retry: (failureCount, error) => {
        // Não retry para erros 4xx (cliente)
        if (error instanceof Error && 'status' in error && (error as any).status >= 400 && (error as any).status < 500) {
          return false;
        }
        // Retry até 2 vezes para outros erros
        return failureCount < 2;
      },
      // Retry delay para mutations
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// Função para limpar todo o cache
export const clearQueryCache = () => {
  queryClient.clear();
};

// Função para limpar queries específicas
export const clearQueriesByKey = (queryKey: string[]) => {
  queryClient.removeQueries({ queryKey });
};

// Função para pré-carregar dados
export const prefetchQuery = async <T>(
  queryKey: string[],
  queryFn: () => Promise<T>
) => {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });
};

// Função para invalidar queries relacionadas
export const invalidateRelatedQueries = (baseKey: string[]) => {
  queryClient.invalidateQueries({
    queryKey: baseKey,
    refetchType: 'active',
  });
};
