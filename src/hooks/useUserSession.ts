import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { useUserFairs } from "./useUserFairs";

/**
 * Hook para gerenciar a sessão do usuário de forma completa
 * Combina autenticação com gerenciamento de feiras
 */
export const useUserSession = () => {
  const { user, token, isAuthenticated } = useAuth();
  const {
    currentFairId,
    shouldShowFairSelector,
    fairStatus,
    availableFairIds,
    hasAccessToCurrentFair,
    setSelectedFairId,
  } = useUserFairs();

  // Status geral da sessão
  const sessionStatus = useMemo(() => {
    if (!isAuthenticated) {
      return {
        type: "unauthenticated" as const,
        message: "Usuário não autenticado",
        canAccess: false,
      };
    }

    if (!user) {
      return {
        type: "no_user" as const,
        message: "Dados do usuário não encontrados",
        canAccess: false,
      };
    }

    if (user.role === "consultant") {
      if (fairStatus.type === "no_fairs") {
        return {
          type: "no_fair_access" as const,
          message: "Consultor sem feiras associadas",
          canAccess: false,
        };
      }

      if (!currentFairId) {
        return {
          type: "no_fair_selected" as const,
          message: "Nenhuma feira selecionada",
          canAccess: false,
        };
      }

      if (!hasAccessToCurrentFair) {
        return {
          type: "no_fair_permission" as const,
          message: "Sem permissão para acessar esta feira",
          canAccess: false,
        };
      }

      return {
        type: "authenticated" as const,
        message: "Acesso liberado",
        canAccess: true,
      };
    }

    // Para outros roles (admin, partner), sempre permitir acesso
    return {
      type: "authenticated" as const,
      message: "Acesso liberado",
      canAccess: true,
    };
  }, [isAuthenticated, user, fairStatus, currentFairId, hasAccessToCurrentFair]);

  // Verificar se pode acessar dados específicos
  const canAccessData = useMemo(() => {
    if (!isAuthenticated || !user) return false;
    
    // Admins e partners sempre podem acessar
    if (user.role === "admin" || user.role === "partner") return true;
    
    // Consultants precisam ter feira selecionada e acesso a ela
    if (user.role === "consultant") {
      return currentFairId && hasAccessToCurrentFair;
    }
    
    return false;
  }, [isAuthenticated, user, currentFairId, hasAccessToCurrentFair]);

  // Informações do usuário para exibição
  const userInfo = useMemo(() => {
    if (!user) return null;
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      fairIds: user.fairIds || [],
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }, [user]);

  // Configurações de UI baseadas no usuário
  const uiConfig = useMemo(() => {
    if (!user) return { showFairSelector: false, showAdminFeatures: false };
    
    return {
      showFairSelector: shouldShowFairSelector,
      showAdminFeatures: user.role === "admin",
      showPartnerFeatures: user.role === "partner" || user.role === "admin",
      showConsultantFeatures: user.role === "consultant" || user.role === "admin",
    };
  }, [user, shouldShowFairSelector]);

  return {
    // Dados do usuário
    user: userInfo,
    token,
    isAuthenticated,
    
    // Status da sessão
    sessionStatus,
    canAccessData,
    
    // Configurações de feiras
    currentFairId,
    availableFairIds,
    fairStatus,
    hasAccessToCurrentFair,
    shouldShowFairSelector,
    setSelectedFairId,
    
    // Configurações de UI
    uiConfig,
  };
};
