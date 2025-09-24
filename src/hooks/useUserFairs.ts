import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { useCookie } from "./useCookie";
import { useSearchParams } from "react-router-dom";

/**
 * Hook para gerenciar as feiras do usuário de forma inteligente
 * Combina feiras associadas (fairIds) com seleção manual
 */
export const useUserFairs = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedFairId, setSelectedFairId] = useCookie("selectedFairId");

  // Feiras associadas ao usuário (vindas do backend)
  const userFairIds = user?.fairIds || [];

  // FairId atual (prioridade: URL > seleção manual > primeira feira do usuário)
  const currentFairId = useMemo(() => {
    // 1. FairId da URL (maior prioridade)
    const fairIdFromUrl = searchParams.get("fairId");
    if (fairIdFromUrl) return fairIdFromUrl;

    // 2. FairId selecionado manualmente
    if (selectedFairId) return selectedFairId;

    // 3. Primeira feira do usuário (se tiver feiras associadas)
    if (userFairIds.length > 0) {
      return userFairIds[0];
    }

    return "";
  }, [searchParams, selectedFairId, userFairIds]);

  // Verificar se o usuário tem acesso à feira atual
  const hasAccessToCurrentFair = useMemo(() => {
    if (!currentFairId) return false;
    
    // Usuários PARTNER e ADMIN sempre têm acesso a todas as feiras
    if (user?.role === "partner" || user?.role === "admin") return true;
    
    // Se não tem feiras associadas, tem acesso a todas
    if (userFairIds.length === 0) return true;
    
    // Se tem feiras associadas, verificar se a feira atual está na lista
    return userFairIds.includes(currentFairId);
  }, [currentFairId, userFairIds, user?.role]);

  // Verificar se deve mostrar seletor de feiras
  const shouldShowFairSelector = useMemo(() => {
    // Usuários PARTNER e ADMIN sempre mostram seletor (acesso a todas as feiras)
    if (user?.role === "partner" || user?.role === "admin") return true;
    
    // Se não tem feiras associadas, sempre mostrar
    if (userFairIds.length === 0) return true;
    
    // Se tem apenas uma feira associada, não mostrar
    if (userFairIds.length === 1) return false;
    
    // Se tem múltiplas feiras, mostrar
    return true;
  }, [userFairIds, user?.role]);

  // Feiras disponíveis para seleção
  const availableFairIds = useMemo(() => {
    // Se não tem feiras associadas, retornar array vazio (será preenchido com todas as feiras)
    if (userFairIds.length === 0) return [];
    
    // Se tem feiras associadas, retornar apenas essas
    return userFairIds;
  }, [userFairIds]);

  // Status do usuário em relação às feiras
  const fairStatus = useMemo(() => {
    if (userFairIds.length === 0) {
      return {
        type: "no_fairs" as const,
        message: "Nenhuma feira associada. Entre em contato para adquirir seu acesso.",
        showSelector: true,
      };
    }

    if (userFairIds.length === 1) {
      return {
        type: "single_fair" as const,
        message: `Acesso liberado para a feira associada`,
        showSelector: false,
      };
    }

    return {
      type: "multiple_fairs" as const,
      message: `Acesso liberado para ${userFairIds.length} feiras - Use o filtro para alternar entre elas`,
      showSelector: true,
    };
  }, [userFairIds]);

  return {
    // Dados das feiras
    userFairIds,
    currentFairId,
    availableFairIds,
    
    // Estados
    hasAccessToCurrentFair,
    shouldShowFairSelector,
    fairStatus,
    
    // Ações
    setSelectedFairId,
  };
};
