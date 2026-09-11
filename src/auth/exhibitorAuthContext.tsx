import type { ExhibitorAccount, ExhibitorAuthResponse } from "@/interfaces/exhibitorAuth";
import { createContext } from "react";

interface ExhibitorAuthContextType {
  exhibitorAccount: ExhibitorAccount | null;
  token: string | null;
  signIn: (auth: ExhibitorAuthResponse) => void;
  signOut: () => void;
  isAuthenticated: boolean;
}

export const ExhibitorAuthContext = createContext<
  ExhibitorAuthContextType | undefined
>(undefined);
