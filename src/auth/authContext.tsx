import type { AuthResponse } from "@/interfaces/auth";
import type { User } from "@/interfaces/user";
import { createContext } from "react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  signIn: (auth: AuthResponse) => void;
  signOut: () => void;
  isAuthenticated: boolean;
}
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
