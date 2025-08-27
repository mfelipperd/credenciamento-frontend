// main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppWrapper } from "./components/AppWrapper";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/react-query";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AppWrapper />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>
);
