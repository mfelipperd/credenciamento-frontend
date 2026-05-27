import { createBrowserRouter, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider, ProtectedRoute } from "@/auth/AuthProvider";
import { MainLayout } from "@/components/Layout/mainLayout";
import { PublicLayout } from "@/components/Layout/PublicLayout";
import { AdminRouteGuard } from "@/components/AdminRouteGuard";
import { LogoLoading } from "@/components/LogoLoading";

// Eager — páginas críticas do caminho de autenticação
import { Login } from "@/pages/Login/page";
import { PublicForm } from "@/pages/PublicForm/page";
import { SucessForm } from "@/pages/Sucess/page";

// Lazy — tudo o que não é necessário no primeiro render
const Dashboard = lazy(() => import("@/pages/Dashboard/page").then(m => ({ default: m.Dashboard })));
const TableVisitors = lazy(() => import("@/pages/TableVisitors").then(m => ({ default: m.TableVisitors })));
const Visitor = lazy(() => import("@/pages/Visitor/page").then(m => ({ default: m.Visitor })));
const PrivateForm = lazy(() => import("@/pages/PrivateForm/page").then(m => ({ default: m.PrivateForm })));
const PublicFormtotem = lazy(() => import("@/pages/PublicFormTotem/page").then(m => ({ default: m.PublicFormtotem })));
const SucessFormTotem = lazy(() => import("@/pages/SucessTotem/page").then(m => ({ default: m.SucessFormTotem })));
const ConsultantPage = lazy(() => import("@/pages/ConsultantPage").then(m => ({ default: m.ConsultantPage })));
const ErrorTestPage = lazy(() => import("@/pages/ErrorTestPage").then(m => ({ default: m.ErrorTestPage })));
const MarketingPage = lazy(() => import("@/pages/Marketing/page").then(m => ({ default: m.MarketingPage })));
const FinancePage = lazy(() => import("@/pages/Finance/page").then(m => ({ default: m.FinancePage })));
const ExpensesPage = lazy(() => import("@/pages/Expenses/page"));
const PartnersPage = lazy(() => import("@/pages/Partners/page"));
const PartnerDashboard = lazy(() => import("@/pages/Partners/PartnerDashboard").then(m => ({ default: m.PartnerDashboard })));
const WithdrawalsManagement = lazy(() => import("@/pages/Partners/WithdrawalsManagement").then(m => ({ default: m.WithdrawalsManagement })));
const UserManagementPage = lazy(() => import("@/pages/UserManagement/page"));
const FairsPage = lazy(() => import("@/pages/Fairs/page"));
const FairDetailPage = lazy(() => import("@/pages/Fairs/FairDetail/page"));

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <LogoLoading size={60} />
  </div>
);

const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageFallback />}>{children}</Suspense>
);

export const AppRoutes = createBrowserRouter([
  {
    path: "/sucess",
    element: <PublicLayout><SucessForm /></PublicLayout>,
  },
  {
    path: "/public-form/:fairId",
    element: <PublicLayout><PublicForm /></PublicLayout>,
  },
  {
    path: "/public-form-totem/:fairId",
    element: <PublicLayout><Lazy><PublicFormtotem /></Lazy></PublicLayout>,
  },
  {
    path: "/sucess-totem",
    element: <PublicLayout><Lazy><SucessFormTotem /></Lazy></PublicLayout>,
  },
  {
    path: "/error-test",
    element: <PublicLayout><Lazy><ErrorTestPage /></Lazy></PublicLayout>,
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
        element: <PublicLayout><Login /></PublicLayout>,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <MainLayout />,
            children: [
              { path: "/", element: <Lazy><Dashboard /></Lazy> },
              { path: "/visitors-table", element: <Lazy><TableVisitors /></Lazy> },
              { path: "/visitor/:id", element: <Lazy><Visitor /></Lazy> },
              { path: "/marketing", element: <Lazy><MarketingPage /></Lazy> },
              {
                path: "/financeiro/receitas",
                element: <AdminRouteGuard><Lazy><FinancePage /></Lazy></AdminRouteGuard>,
              },
              {
                path: "/expenses",
                element: <AdminRouteGuard><Lazy><ExpensesPage /></Lazy></AdminRouteGuard>,
              },
              {
                path: "/partners",
                element: <AdminRouteGuard><Lazy><PartnersPage /></Lazy></AdminRouteGuard>,
              },
              {
                path: "/partners/withdrawals",
                element: <AdminRouteGuard><Lazy><WithdrawalsManagement /></Lazy></AdminRouteGuard>,
              },
              {
                path: "/partner-dashboard",
                element: <Lazy><PartnerDashboard /></Lazy>,
              },
              {
                path: "/user-management",
                element: <AdminRouteGuard><Lazy><UserManagementPage /></Lazy></AdminRouteGuard>,
              },
              {
                path: "/fairs",
                element: <AdminRouteGuard><Lazy><FairsPage /></Lazy></AdminRouteGuard>,
              },
              {
                path: "/fairs/:id",
                element: <AdminRouteGuard><Lazy><FairDetailPage /></Lazy></AdminRouteGuard>,
              },
              { path: "/consultant-dashboard", element: <Lazy><ConsultantPage /></Lazy> },
            ],
          },
        ],
      },
      {
        path: "/private-form/:fairId",
        element: <PublicLayout><Lazy><PrivateForm /></Lazy></PublicLayout>,
      },
    ],
  },
]);
