import { createBrowserRouter, Outlet } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/auth/AuthProvider";
import { Login } from "@/pages/Login/page";
import { PublicForm } from "@/pages/PublicForm/page";
import { SucessForm } from "@/pages/Sucess/page";
import { MainLayout } from "@/components/Layout/mainLayout";
import { PublicLayout } from "@/components/Layout/PublicLayout";
import { Dashboard } from "@/pages/Dashboard/page";
import { TabeleVisitors } from "@/pages/TableVisitors";
import { Visitor } from "@/pages/Visitor/page";
import { PrivateForm } from "@/pages/PrivateForm/page";
import { PublicFormtotem } from "@/pages/PublicFormTotem/page";
import { SucessFormTotem } from "@/pages/SucessTotem/page";
import { ConsultantPage } from "@/pages/ConsultantPage";
import { ErrorTestPage } from "@/pages/ErrorTestPage";
import { MarketingPage } from "@/pages/Marketing/page";
import { FinancePage } from "@/pages/Finance/page";
import { AdminRouteGuard } from "@/components/AdminRouteGuard";
import { AdminPartnerRouteGuard } from "@/components/AdminPartnerRouteGuard";
import ExpensesPage from "@/pages/Expenses/page";
import PartnersPage from "@/pages/Partners/page";
import { PartnerDashboard } from "@/pages/Partners/PartnerDashboard";
import { WithdrawalsManagement } from "@/pages/Partners/WithdrawalsManagement";
import UserManagementPage from "@/pages/UserManagement/page";
import FairsPage from "@/pages/Fairs/page";

export const AppRoutes = createBrowserRouter([
  {
    path: "/sucess",
    element: (
      <PublicLayout>
        <SucessForm />
      </PublicLayout>
    ),
  },
  {
    path: "/public-form/:fairId",
    element: (
      <PublicLayout>
        <PublicForm />
      </PublicLayout>
    ),
  },
  {
    path: "/public-form-totem/:fairId",
    element: (
      <PublicLayout>
        <PublicFormtotem />
      </PublicLayout>
    ),
  },
  {
    path: "/sucess-totem",
    element: (
      <PublicLayout>
        <SucessFormTotem />
      </PublicLayout>
    ),
  },
  {
    path: "/error-test",
    element: (
      <PublicLayout>
        <ErrorTestPage />
      </PublicLayout>
    ),
  },

  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      {
        path: "/login",
        element: (
          <PublicLayout>
            <Login />
          </PublicLayout>
        ),
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <MainLayout />,
            children: [
              { path: "/", element: <Dashboard /> },
              { path: "/visitors-table", element: <TabeleVisitors /> },
              { path: "/visitor/:id", element: <Visitor /> },
              { path: "/marketing", element: <MarketingPage /> },
              {
                path: "/financeiro/receitas",
                element: (
                  <AdminPartnerRouteGuard>
                    <FinancePage />
                  </AdminPartnerRouteGuard>
                ),
              },
              {
                path: "/expenses",
                element: (
                  <AdminPartnerRouteGuard>
                    <ExpensesPage />
                  </AdminPartnerRouteGuard>
                ),
              },
              {
                path: "/partners",
                element: (
                  <AdminRouteGuard>
                    <PartnersPage />
                  </AdminRouteGuard>
                ),
              },
              {
                path: "/partners/withdrawals",
                element: (
                  <AdminRouteGuard>
                    <WithdrawalsManagement />
                  </AdminRouteGuard>
                ),
              },
              {
                path: "/partner-dashboard",
                element: <PartnerDashboard />,
              },
              {
                path: "/user-management",
                element: (
                  <AdminPartnerRouteGuard>
                    <UserManagementPage />
                  </AdminPartnerRouteGuard>
                ),
              },
              {
                path: "/fairs",
                element: (
                  <AdminPartnerRouteGuard>
                    <FairsPage />
                  </AdminPartnerRouteGuard>
                ),
              },
            ],
          },
        ],
      },
      {
        path: "/private-form/:fairId",
        element: (
          <PublicLayout>
            <PrivateForm />
          </PublicLayout>
        ),
      },
      { path: "/consultant-dashboard", element: <ConsultantPage /> },
    ],
  },
]);
