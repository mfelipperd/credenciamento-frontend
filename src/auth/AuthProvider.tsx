// AuthProvider.tsx
import { jwtDecode } from "jwt-decode";
import { useState, useEffect, type ReactNode } from "react";
import { useNavigate, useLocation, Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "./authContext";
import type { AuthResponse } from "@/interfaces/auth";
import type { User } from "@/interfaces/user";
import { useAuth } from "@/hooks/useAuth";

interface JWTPayload {
  exp: number;
  iat?: number;
}

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

  // 1️⃣ Verifica exp no JWT
  useEffect(() => {
    if (!token) return;

    try {
      const { exp } = jwtDecode<JWTPayload>(token);
      const now = Date.now() / 1000;
      if (exp < now) {
        // expirou!
        signOut();
      }
    } catch {
      // token mal formado
      signOut();
    }
  }, [token]);

  // 2️⃣ Redireciona pro login se não autenticado
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== "/login") {
      navigate("/login", {
        replace: true,
        state: { from: location },
      });
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
