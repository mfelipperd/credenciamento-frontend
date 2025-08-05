import React from "react";
import { RouterProvider } from "react-router-dom";
import { AppRoutes } from "@/routes/AppRoutes";
import { Toaster } from "sonner";
import { useGlobalErrorHandler } from "@/hooks/useGlobalErrorHandler";

export const AppWrapper: React.FC = () => {
  // Hook para capturar erros globais
  useGlobalErrorHandler();

  return (
    <>
      <RouterProvider router={AppRoutes} />
      <Toaster />
    </>
  );
};
