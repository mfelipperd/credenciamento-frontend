// routes/AppRoutes.tsx
import { createBrowserRouter, Outlet } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/auth/AuthProvider";
import { Login } from "@/pages/Login/page";
import { PublicForm } from "@/pages/PublicForm/page";
import { SucessForm } from "@/pages/Sucess/page";
import { MainLayout } from "@/components/Layout/mainLayout";
import { Dashboard } from "@/pages/Dashboard/page";

export const AppRoutes = createBrowserRouter([
  // 1) Rotas públicas que NÃO usam AuthProvider
  {
    path: "/public-form/:fairId",
    element: <PublicForm />,
  },

  // 2) Layout de autenticação, **somente** sob "/" e subrotas
  {
    path: "/", // importante: restringir ao prefixo "/"
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      { path: "login", element: <Login /> },
      { path: "sucess", element: <SucessForm /> },

      // 3) Só aqui entram as rotas protegidas
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <MainLayout />,
            children: [
              { index: true, element: <Dashboard /> },
              // outras rotas internas, ex: { path: "profile", element: <Profile /> }
            ],
          },
        ],
      },
    ],
  },
]);
