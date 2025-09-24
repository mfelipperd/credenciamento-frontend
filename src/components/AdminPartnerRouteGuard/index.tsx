import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { EUserRole } from "@/enums/user.enum";

interface AdminPartnerRouteGuardProps {
  children: React.ReactNode;
}

export function AdminPartnerRouteGuard({ children }: AdminPartnerRouteGuardProps) {
  const { user } = useAuth();

  // Se não há usuário logado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário não é admin nem partner, redireciona para dashboard
  if (user.role !== EUserRole.ADMIN && user.role !== EUserRole.PARTNER) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se é admin ou partner, renderiza o conteúdo
  return <>{children}</>;
}
