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
          "fixed top-0 left-0 h-full w-80 bg-[#0A1E3B] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden border-r border-white/5",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-8 w-auto"
            />
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tighter">
                Menu
              </h2>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                Navegação
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5 text-white/60" />
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
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 group",
                    isActive
                      ? "bg-brand-pink text-white shadow-lg shadow-brand-pink/20 translate-x-1"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-white/30 group-hover:text-white/60"
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
        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3 text-[10px] text-white/40 font-bold uppercase tracking-wider">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="truncate">Conectado: {user?.email}</span>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar - fixed for branding */}
      <div className={cn(
        "hidden lg:block bg-[#0A1E3B] shadow-2xl transition-all duration-500 ease-in-out border-r border-white/5 flex-col",
        isOpen ? "w-72" : "w-0 overflow-hidden opacity-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-7 border-b border-white/5 bg-white/2">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-9 w-auto"
            />
            <div className={cn("transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")}>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter leading-none">
                Menu
              </h2>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mt-1">
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
                    "flex items-center gap-3 px-4 py-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 group relative",
                    isActive
                      ? "bg-linear-to-r from-brand-pink to-brand-pink/80 text-white shadow-lg shadow-brand-pink/20 translate-x-2"
                      : "text-white/50 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-y-2 -left-4 w-1 bg-brand-cyan rounded-full" />
                  )}
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-white/20 group-hover:text-brand-cyan"
                    )}
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="ml-auto">
                      <div className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-pulse shadow-[0_0_10px_rgba(0,170,205,0.8)]" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-7 border-t border-white/5 mt-auto">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3 text-[10px] text-white/40 font-black uppercase tracking-widest break-all">
              <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)] animate-pulse" />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
