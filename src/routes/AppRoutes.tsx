import { createBrowserRouter, Outlet } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/auth/AuthProvider";
import { Login } from "@/pages/Login/page";
import { PublicForm } from "@/pages/PublicForm/page";
import { SucessForm } from "@/pages/Sucess/page";
import { MainLayout } from "@/components/Layout/mainLayout";
import { Dashboard } from "@/pages/Dashboard/page";
import { TabeleVisitors } from "@/pages/TableVisitors";
import { Visitor } from "@/pages/Visitor/page";
import { PrivateForm } from "@/pages/PrivateForm/page";
import { PublicFormtotem } from "@/pages/PublicFormTotem/page";
import { SucessFormTotem } from "@/pages/SucessTotem/page";

export const AppRoutes = createBrowserRouter([
  { path: "/sucess", element: <SucessForm /> },
  { path: "/public-form/:fairId", element: <PublicForm /> },
  { path: "/public-form-totem/:fairId", element: <PublicFormtotem /> },
  { path: "/sucess-totem", element: <SucessFormTotem /> },
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      { path: "/login", element: <Login /> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <MainLayout />,
            children: [
              { path: "/", element: <Dashboard /> },
              { path: "/visitors-table", element: <TabeleVisitors /> },
              { path: "/visitor/:id", element: <Visitor /> },
            ],
          },
        ],
      },
      { path: "/private-form/:fairId", element: <PrivateForm /> },
    ],
  },
]);
