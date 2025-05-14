import { useAuth } from "@/hooks/useAuth";
import type { AuthResponse } from "@/interfaces/auth";
import type { User } from "@/interfaces/user";
import { useState, useEffect, type ReactNode } from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "./authContext";

const STORAGE_USER_KEY = "app_user";
const STORAGE_TOKEN_KEY = "app_token";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_USER_KEY);
    const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

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

  const isAuthenticated = !!token;

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

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
