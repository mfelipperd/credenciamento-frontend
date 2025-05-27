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
    element: <PublicForm />,
    path: "/public-form/:fairId",
  },
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      { path: "/login", element: <Login /> },
      { path: "/sucess", element: <SucessForm /> },

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
