// routes/AppRoutes.tsx
import { createBrowserRouter, Outlet } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/auth/AuthProvider";
import { Login } from "@/pages/Login/page";
import { PublicForm } from "@/pages/PublicForm/page";
import { SucessForm } from "@/pages/Sucess/page";
import { MainLayout } from "@/components/Layout/mainLayout";
import { Dashboard } from "@/pages/Dashboard/page";

export const AppRoutes = createBrowserRouter([
  {
    // <-- Aqui injetamos o AuthProvider DENTRO do Router
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      { path: "/login", element: <Login /> },
      { path: "/sucess", element: <SucessForm /> },
      { path: "/public-form/:fairId", element: <PublicForm /> },

      // Rotas que precisam de autenticação
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <MainLayout />,
            children: [
              { path: "/", element: <Dashboard /> },
              // outras rotas internas
            ],
          },
        ],
      },
    ],
  },
]);
