import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  User2,
  Mail,
  DollarSign,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  X,
} from "lucide-react";
import { useUserSession } from "@/hooks/useUserSession";
import { EUserRole } from "@/enums/user.enum";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  search: string;
}

const navigationItems = [
  {
    name: "Home",
    href: "/",
    icon: HomeIcon,
    roles: [EUserRole.ADMIN, EUserRole.PARTNER, EUserRole.CONSULTANT, EUserRole.RECEPTIONIST],
  },
  {
    name: "Visitantes",
    href: "/visitors-table",
    icon: User2,
    roles: [EUserRole.ADMIN, EUserRole.PARTNER, EUserRole.CONSULTANT, EUserRole.RECEPTIONIST],
  },
  {
    name: "Marketing",
    href: "/marketing",
    icon: Mail,
    roles: [EUserRole.ADMIN, EUserRole.PARTNER, EUserRole.CONSULTANT, EUserRole.RECEPTIONIST],
  },
  {
    name: "Receitas",
    href: "/financeiro/receitas",
    icon: DollarSign,
    roles: [EUserRole.ADMIN],
  },
  {
    name: "Despesas",
    href: "/expenses",
    icon: DollarSign,
    roles: [EUserRole.ADMIN],
  },
  {
    name: "Sócios",
    href: "/partners",
    icon: Users,
    roles: [EUserRole.ADMIN],
  },
  {
    name: "Meu Painel",
    href: "/partner-dashboard",
    icon: Users,
    roles: [EUserRole.PARTNER],
  },
  {
    name: "Saques",
    href: "/partners/withdrawals",
    icon: CreditCard,
    roles: [EUserRole.ADMIN],
  },
  {
    name: "Feiras",
    href: "/fairs",
    icon: BarChart3,
    roles: [EUserRole.ADMIN],
  },
  {
    name: "Usuários",
    href: "/user-management",
    icon: Settings,
    roles: [EUserRole.ADMIN],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, search }) => {
  const location = useLocation();
  const { user } = useUserSession();

  // Filtrar itens baseado no role do usuário
  const filteredItems = navigationItems.filter((item) =>
    item.roles.includes(user?.role as EUserRole)
  );

  return (
    <>
      {/* Overlay - apenas para mobile */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-8 w-auto"
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Menu
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Navegação
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6">
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={{ pathname: item.href, search: item.roles.includes(EUserRole.PARTNER) && item.href === "/partner-dashboard" ? undefined : search }}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive
                        ? "text-blue-500"
                        : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                    )}
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span>Conectado como {user?.email}</span>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar - empurra o conteúdo */}
      <div className={cn(
        "hidden lg:block w-80 bg-white dark:bg-gray-900 shadow-xl transition-all duration-300 ease-in-out",
        isOpen ? "w-80" : "w-0 overflow-hidden"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-8 w-auto"
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Menu
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Navegação
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6">
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={{ pathname: item.href, search: item.roles.includes(EUserRole.PARTNER) && item.href === "/partner-dashboard" ? undefined : search }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive
                        ? "text-blue-500"
                        : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                    )}
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span>Conectado como {user?.email}</span>
          </div>
        </div>
      </div>
    </>
  );
};
