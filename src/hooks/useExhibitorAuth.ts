import { ExhibitorAuthContext } from "@/auth/exhibitorAuthContext";
import { useContext } from "react";

export const useExhibitorAuth = () => {
  const context = useContext(ExhibitorAuthContext);
  if (!context) {
    throw new Error("useExhibitorAuth deve ser usado dentro de ExhibitorAuthProvider");
  }
  return context;
};
