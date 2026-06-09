import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useNavigate, useLocation, Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./authContext";
import type { AuthResponse } from "@/interfaces/auth";
import type { User } from "@/interfaces/user";
import { useAuth } from "@/hooks/useAuth";
import { EUserRole } from "@/enums/user.enum";

const STORAGE_USER_KEY = "app_user";
const STORAGE_TOKEN_KEY = "app_token";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(STORAGE_USER_KEY) || sessionStorage.getItem(STORAGE_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_TOKEN_KEY) || sessionStorage.getItem(STORAGE_TOKEN_KEY);
  });

  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = !!token;

  const signIn = useCallback(({ access_token, user }: AuthResponse) => {
    const rememberMe = localStorage.getItem("remember_me") === "true";
    
    if (rememberMe) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
      localStorage.setItem(STORAGE_TOKEN_KEY, access_token);
      sessionStorage.removeItem(STORAGE_USER_KEY);
      sessionStorage.removeItem(STORAGE_TOKEN_KEY);
    } else {
      sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
      sessionStorage.setItem(STORAGE_TOKEN_KEY, access_token);
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_TOKEN_KEY);
    }
    setUser(user);
    setToken(access_token);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    sessionStorage.removeItem(STORAGE_USER_KEY);
    sessionStorage.removeItem(STORAGE_TOKEN_KEY);
    setUser(null);
    setToken(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      token,
      signIn,
      signOut,
      isAuthenticated,
    }),
    [user, token, signIn, signOut, isAuthenticated]
  );

  // Valida exp do JWT
  useEffect(() => {
    if (!token) return;
    try {
      const { exp } = jwtDecode<{ exp: number }>(token);
      if (exp * 1000 < Date.now()) {
        signOut();
      }
    } catch {
      signOut();
    }
  }, [token, signOut]);

  useEffect(() => {
    const isPublicForm = location.pathname.startsWith("/public-form");
    const isSucessPage = location.pathname.startsWith("/sucess");
    
    if (user && user.role === EUserRole.RECEPTIONIST) {
      const restrictedPaths = ["/", "", "/marketing"];
      if (restrictedPaths.includes(location.pathname)) {
        navigate("/visitors-table", { replace: true });
      }
      return;
    }

    if (user && user.role === EUserRole.CONSULTANT) {
      // Se o usuário é um consultor, verificar se tem feiras associadas
      const userFairIds = user.fairIds || [];
      
      if (userFairIds.length === 0) {
        // Se não tem feiras associadas, redirecionar para login com mensagem
        navigate("/login", {
          replace: true,
          state: { 
            from: location,
            message: "Seu perfil não possui feiras associadas. Entre em contato para adquirir acesso."
          },
        });
        return;
      }
      
      // Se tem feiras associadas, redirecionar se estiver em páginas públicas/gerais
      const restrictedPaths = ["/login", "/", ""];
      if (restrictedPaths.includes(location.pathname)) {
        const state = location.state;
        if (state?.from) {
          const { pathname, search = "" } = state.from;
          if (location.pathname !== pathname) {
            navigate(`${pathname}${search}`, { replace: true });
            return;
          }
        }
        
        // Se não tem de onde vir, vai para o dashboard do consultor
        if (location.pathname !== "/consultant-dashboard") {
          navigate("/consultant-dashboard", { replace: true });
        }
      }
      return;
    }
    
    if (
      !isAuthenticated &&
      !isPublicForm &&
      !isSucessPage &&
      location.pathname !== "/login"
    ) {
      navigate("/login", {
        replace: true,
        state: { from: location },
      });
    }
  }, [isAuthenticated, user, location, navigate]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
