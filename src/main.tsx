// main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppWrapper } from "./components/AppWrapper";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppWrapper />
    </ErrorBoundary>
  </StrictMode>
);
