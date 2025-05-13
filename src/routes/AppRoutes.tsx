import { PublicForm } from "@/pages/PublicForm/page";
import { SucessForm } from "@/pages/Sucess/page";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/public-form/:fairId" element={<PublicForm />} />
      <Route path="/sucess" element={<SucessForm />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
