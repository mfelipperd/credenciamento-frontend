import React from "react";
import { RouterProvider } from "react-router-dom";
import { AppRoutes } from "@/routes/AppRoutes";
import { Toaster } from "sonner";
import { useGlobalErrorHandler } from "@/hooks/useGlobalErrorHandler";
import { ThemeProvider } from "@/hooks/useTheme";

export const AppWrapper: React.FC = () => {
  // Hook para capturar erros globais
  useGlobalErrorHandler();

  return (
    <ThemeProvider defaultTheme="system" storageKey="credenciamento-ui-theme">
      <RouterProvider router={AppRoutes} />
      <Toaster />
    </ThemeProvider>
  );
};
