// AuthProvider.tsx
import { useEffect, useState, type ReactNode } from "react";
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

  const signIn = ({ access_token, user }: AuthResponse) => {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    localStorage.setItem(STORAGE_TOKEN_KEY, access_token);
    setUser(user);
    setToken(access_token);
  };
  const signOut = () => {
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    setUser(null);
    setToken(null);
  };

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
  }, [token]);

  useEffect(() => {
    const isPublicForm = location.pathname.startsWith("/public-form");
    const isSucessPage = location.pathname.startsWith("/sucess");
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
    } else if (user?.role === "consultant" && location.pathname === "/") {
      navigate("/consultant-dashboard", { replace: true });
    }
  }, [isAuthenticated, location, navigate]);

  return (
    <AuthContext.Provider
      value={{ user, token, signIn, signOut, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
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
