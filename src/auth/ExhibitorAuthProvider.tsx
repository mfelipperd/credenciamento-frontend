import { useState, useCallback, useMemo, type ReactNode } from "react";
import { ExhibitorAuthContext } from "./exhibitorAuthContext";
import type { ExhibitorAccount, ExhibitorAuthResponse } from "@/interfaces/exhibitorAuth";

const STORAGE_ACCOUNT_KEY = "exhibitor_account";
const STORAGE_TOKEN_KEY = "exhibitor_token";

export const ExhibitorAuthProvider = ({ children }: { children: ReactNode }) => {
  const [exhibitorAccount, setExhibitorAccount] = useState<ExhibitorAccount | null>(() => {
    const stored = localStorage.getItem(STORAGE_ACCOUNT_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_TOKEN_KEY)
  );

  const isAuthenticated = !!token;

  const signIn = useCallback(({ access_token, exhibitorAccount }: ExhibitorAuthResponse) => {
    localStorage.setItem(STORAGE_ACCOUNT_KEY, JSON.stringify(exhibitorAccount));
    localStorage.setItem(STORAGE_TOKEN_KEY, access_token);
    setExhibitorAccount(exhibitorAccount);
    setToken(access_token);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_ACCOUNT_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    setExhibitorAccount(null);
    setToken(null);
  }, []);

  const contextValue = useMemo(
    () => ({ exhibitorAccount, token, signIn, signOut, isAuthenticated }),
    [exhibitorAccount, token, signIn, signOut, isAuthenticated]
  );

  return (
    <ExhibitorAuthContext.Provider value={contextValue}>
      {children}
    </ExhibitorAuthContext.Provider>
  );
};
