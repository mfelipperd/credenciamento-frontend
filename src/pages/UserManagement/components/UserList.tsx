import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Edit,
  Trash2,
  Search,
  Users,
  CheckCircle,
  XCircle,
  Shield,
  Mail,
  Phone,
  CalendarDays,
} from "lucide-react";
import { EUserRole } from "@/enums/user.enum";
import type { User } from "@/interfaces/user";

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<EUserRole, { label: string; color: string; dot: string; badge: string }> = {
  [EUserRole.ADMIN]: {
    label: "Administrador",
    color: "#EB2970",
    dot: "bg-[#EB2970]",
    badge: "bg-[#EB2970]/15 text-[#EB2970] border-[#EB2970]/20",
  },
  [EUserRole.PARTNER]: {
    label: "Sócio",
    color: "#00aacd",
    dot: "bg-[#00aacd]",
    badge: "bg-[#00aacd]/15 text-[#00aacd] border-[#00aacd]/20",
  },
  [EUserRole.CONSULTANT]: {
    label: "Consultor",
    color: "#F39B0C",
    dot: "bg-[#F39B0C]",
    badge: "bg-[#F39B0C]/15 text-[#F39B0C] border-[#F39B0C]/20",
  },
  [EUserRole.RECEPTIONIST]: {
    label: "Recepcionista",
    color: "#a855f7",
    dot: "bg-purple-400",
    badge: "bg-purple-500/15 text-purple-300 border-purple-500/20",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("pt-BR") : null;

// ─── Props ────────────────────────────────────────────────────────────────────

interface UserListProps {
  users: User[];
  isLoading: boolean;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function UserCardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[32px] p-5 space-y-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 rounded-2xl bg-white/10 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3 bg-white/10" />
          <Skeleton className="h-3 w-1/2 bg-white/10" />
        </div>
        <Skeleton className="h-5 w-24 rounded-full bg-white/10" />
      </div>
      <Skeleton className="h-px w-full bg-white/5" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full bg-white/10" />
        <Skeleton className="h-3 w-3/4 bg-white/10" />
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export const UserList: React.FC<UserListProps> = ({
  users,
  isLoading,
  onView,
  onEdit,
  onDelete,
}) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<EUserRole | "">("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.cpf && u.cpf.includes(search));
    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesActive =
      activeFilter === "all" ||
      (activeFilter === "active" && u.isActive) ||
      (activeFilter === "inactive" && !u.isActive);
    return matchesSearch && matchesRole && matchesActive;
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-64 bg-white/10 rounded-xl" />
          <Skeleton className="h-10 w-40 bg-white/10 rounded-xl" />
          <Skeleton className="h-10 w-40 bg-white/10 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <UserCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Filtros ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            placeholder="Buscar por nome, email ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-10 w-72"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as EUserRole | "")}
          className="px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white/70 outline-none focus:border-white/30 transition-colors"
        >
          <option value="">Todos os perfis</option>
          <option value={EUserRole.ADMIN}>Administrador</option>
          <option value={EUserRole.PARTNER}>Sócio</option>
          <option value={EUserRole.CONSULTANT}>Consultor</option>
          <option value={EUserRole.RECEPTIONIST}>Recepcionista</option>
        </select>

        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value as "all" | "active" | "inactive")}
          className="px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white/70 outline-none focus:border-white/30 transition-colors"
        >
          <option value="all">Ativos e Inativos</option>
          <option value="active">Somente ativos</option>
          <option value="inactive">Somente inativos</option>
        </select>
      </div>

      {/* ── Lista ──────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-[32px] py-16 text-center">
          <Users className="h-8 w-8 mx-auto text-white/20 mb-3" />
          <p className="text-white/30 text-sm font-medium">
            {search || roleFilter || activeFilter !== "all"
              ? "Nenhum operador encontrado com os filtros aplicados."
              : "Nenhum operador cadastrado."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((user) => {
            const role = ROLE_CONFIG[user.role] ?? ROLE_CONFIG[EUserRole.CONSULTANT];
            const initials = getInitials(user.name);
            const createdFmt = fmtDate(user.createdAt);

            return (
              <div
                key={user.id}
                className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] flex flex-col cursor-pointer transition-all duration-300 hover:bg-white/8 hover:border-white/20 hover:scale-[1.01] shadow-xl"
                onClick={() => onView(user)}
              >
                {/* Glow de role */}
                <div
                  className="absolute -right-6 -top-6 w-32 h-32 blur-3xl opacity-10 transition-opacity duration-300 group-hover:opacity-20 pointer-events-none"
                  style={{ backgroundColor: role.color }}
                />

                {/* Barra de cor no topo */}
                <div
                  className="h-1.5 rounded-t-[32px] shrink-0"
                  style={{ backgroundColor: role.color, opacity: 0.4 }}
                />

                <div className="p-5 flex flex-col gap-3 flex-1 relative z-10">
                  {/* Avatar + nome + menu */}
                  <div className="flex items-start gap-3">
                    <div
                      className="h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-black text-white shrink-0"
                      style={{ backgroundColor: `${role.color}25`, border: `1px solid ${role.color}30` }}
                    >
                      <span style={{ color: role.color }}>{initials}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-black text-white text-sm leading-snug line-clamp-1 tracking-tight">
                        {user.name}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${role.badge}`}
                      >
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${role.dot}`} />
                        {role.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {user.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400/60" />
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-white/30 hover:text-white hover:bg-white/10 rounded-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); onEdit(user); }}
                          >
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                            onClick={(e) => { e.stopPropagation(); onDelete(user); }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="h-px bg-white/5" />

                  {/* Dados */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-[#00aacd]" />
                      <span className="text-xs text-white/50 line-clamp-1">{user.email}</span>
                    </div>

                    {user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-[#F39B0C]" />
                        <span className="text-xs text-white/50">{user.phone}</span>
                      </div>
                    )}

                    {createdFmt && (
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-white/30" />
                        <span className="text-xs text-white/35">Desde {createdFmt}</span>
                      </div>
                    )}

                    {user.fairIds && user.fairIds.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 shrink-0 text-white/30" />
                        <span className="text-xs text-white/35">
                          {user.fairIds.length} feira{user.fairIds.length !== 1 ? "s" : ""} vinculada{user.fairIds.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {!user.isActive && (
                    <div className="mt-auto pt-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-400/60">
                        Acesso Suspenso
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
