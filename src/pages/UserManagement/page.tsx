import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import { EUserRole } from "@/enums/user.enum";
import { Button } from "@/components/ui/button";
import { Plus, Users, ShieldX } from "lucide-react";
import { UserDetailModal } from "./components/UserDetailModal";
import { UserFormModal } from "./components/UserFormModal";
import { DeleteUserDialog } from "./components/DeleteUserDialog";
import { UserStats } from "./components/UserStats";
import { UserList } from "./components/UserList";
import type { User } from "@/interfaces/user";

export default function UserManagementPage() {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: users, isLoading } = useUsers();

  if (user?.role !== EUserRole.ADMIN) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-12 text-center max-w-md">
          <ShieldX className="h-12 w-12 mx-auto text-brand-pink mb-4" />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">
            Acesso Restrito
          </h2>
          <p className="text-white/40 text-sm">
            Apenas administradores podem acessar esta área.
          </p>
        </div>
      </div>
    );
  }

  const totalUsers = users?.length ?? 0;
  const activeUsers = users?.filter((u) => u.isActive).length ?? 0;
  const inactiveUsers = totalUsers - activeUsers;

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsFormModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsFormModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-6 p-6">
        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <Users className="h-8 w-8 text-brand-pink" />
              GESTÃO DE <span className="text-brand-cyan">OPERADORES</span>
            </h1>
            <div className="h-1.5 w-24 bg-linear-to-r from-brand-pink to-brand-cyan rounded-full" />
          </div>
          <Button
            onClick={handleCreateUser}
            className="bg-linear-to-br from-[#00aacd] to-[#EB2970] text-white rounded-xl px-6 font-bold shadow-lg shadow-pink-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Operador
          </Button>
        </div>

        {/* ── Estatísticas ──────────────────────────────────────────── */}
        <UserStats
          total={totalUsers}
          active={activeUsers}
          inactive={inactiveUsers}
          isLoading={isLoading}
        />

        {/* ── Lista ─────────────────────────────────────────────────── */}
        <UserList
          users={users ?? []}
          isLoading={isLoading}
          onView={handleViewUser}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      </div>

      <UserDetailModal
        user={selectedUser}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

      <UserFormModal
        user={editingUser}
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
      />

      <DeleteUserDialog
        user={selectedUser}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
