import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "@/pages/Login/page";
import { PublicForm } from "@/pages/PublicForm/page";
import { SucessForm } from "@/pages/Sucess/page";
import { AuthProvider, ProtectedRoute } from "@/auth/AuthProvider";

export const AppRoutes: React.FC = () => (
  <AuthProvider>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/public-form/:fairId" element={<PublicForm />} />
      <Route path="/sucess" element={<SucessForm />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div>teste</div>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </AuthProvider>
);
