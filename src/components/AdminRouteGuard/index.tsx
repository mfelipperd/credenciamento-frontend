import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { EUserRole } from "@/enums/user.enum";
import type { ReactNode } from "react";

interface AdminRouteGuardProps {
  children: ReactNode;
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user } = useAuth();

  // Se não há usuário logado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário não é admin, redireciona para dashboard
  if (user.role !== EUserRole.ADMIN) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se é admin, renderiza o conteúdo
  return <>{children}</>;
}
