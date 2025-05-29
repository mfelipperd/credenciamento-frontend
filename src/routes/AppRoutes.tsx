import { createBrowserRouter, Outlet } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/auth/AuthProvider";
import { Login } from "@/pages/Login/page";
import { PublicForm } from "@/pages/PublicForm/page";
import { SucessForm } from "@/pages/Sucess/page";
import { MainLayout } from "@/components/Layout/mainLayout";
import { Dashboard } from "@/pages/Dashboard/page";
import { TabeleVisitors } from "@/pages/TableVisitors";

export const AppRoutes = createBrowserRouter([
  { path: "/sucess", element: <SucessForm /> },
  { path: "/public-form/:fairId", element: <PublicForm /> },
  {
    // <-- Aqui injetamos o AuthProvider DENTRO do Router
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      // Rotas que precisam de autenticação
      { path: "/login", element: <Login /> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <MainLayout />,
            children: [
              { path: "/", element: <Dashboard /> },
              { path: "/visitors-table", element: <TabeleVisitors /> },
            ],
          },
        ],
      },
    ],
  },
]);
