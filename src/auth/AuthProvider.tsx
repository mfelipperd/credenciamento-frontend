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

const STORAGE_USER_KEY = "app_user";
const STORAGE_TOKEN_KEY = "app_token";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(STORAGE_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  });

  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = !!token;

  const signIn = useCallback(({ access_token, user }: AuthResponse) => {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    localStorage.setItem(STORAGE_TOKEN_KEY, access_token);
    setUser(user);
    setToken(access_token);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
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
    if (user && user.role === "consultant") {
      // Se o usuário é um consultor, redireciona para o dashboard
      const state = location.state;
      if (state?.from) {
        const { pathname, search = "" } = state.from;
        navigate(`${pathname}${search}`, { replace: true });
      }
      navigate("/consultant-dashboard", { replace: true });
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
    } else if (user?.role === "consultant") {
      // Se veio de uma rota protegida (ex: /consultant-dashboard?fairId=...)
      const state = location.state;
      if (state?.from) {
        const { pathname, search = "" } = state.from;
        navigate(`${pathname}${search}`, { replace: true });
      }
    }
  }, [isAuthenticated, location]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const checkAuthentication = async () => {
      if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
      }
    };

    checkAuthentication();
  }, [isAuthenticated, location]);

  return <Outlet />;
};
