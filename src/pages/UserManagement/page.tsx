import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import { useFairService } from "@/service/fair.service";
import { EUserRole } from "@/enums/user.enum";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  Users,
  UserCheck,
  UserX
} from "lucide-react";
import { UserDetailModal } from "./components/UserDetailModal";
import { UserFormModal } from "./components/UserFormModal";
import { DeleteUserDialog } from "./components/DeleteUserDialog";

interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  role: EUserRole;
  isActive: boolean;
  fairIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function UserManagementPage() {
  const { user } = useAuth();
  const { getFairs } = useFairService();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Buscar feiras ao carregar a página
  React.useEffect(() => {
    getFairs();
  }, [getFairs]);

  // Verificar se é admin
  if (user?.role !== EUserRole.ADMIN) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <UserX className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Acesso Negado
            </h2>
            <p className="text-gray-600">
              Apenas administradores podem acessar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: users, isLoading, error } = useUsers();

  // Filtrar usuários por termo de busca
  const filteredUsers = users?.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.cpf && user.cpf.includes(searchTerm))
  ) || [];

  // Estatísticas
  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter(user => user.isActive).length || 0;
  const inactiveUsers = totalUsers - activeUsers;

  const getRoleBadgeVariant = (role: EUserRole) => {
    switch (role) {
      case EUserRole.ADMIN:
        return "destructive";
      case EUserRole.PARTNER:
        return "default";
      default:
        return "secondary";
    }
  };

  const getRoleLabel = (role: EUserRole) => {
    switch (role) {
      case EUserRole.ADMIN:
        return "Administrador";
      case EUserRole.PARTNER:
        return "Sócio";
      case EUserRole.CONSULTANT:
        return "Consultor";
      default:
        return "Usuário";
    }
  };


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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <UserX className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Erro ao carregar usuários
            </h2>
            <p className="text-gray-600">
              Não foi possível carregar a lista de usuários.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-900 min-h-screen">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Gerenciamento de Usuários</h1>
            <p className="text-gray-300">Gerencie usuários do sistema</p>
          </div>
          <Button onClick={handleCreateUser} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Total de Usuários</p>
                  <p className="text-2xl font-bold text-white">{totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-green-400">{activeUsers}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Usuários Inativos</p>
                  <p className="text-2xl font-bold text-red-400">{inactiveUsers}</p>
                </div>
                <UserX className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Usuários */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-white">{user.name}</CardTitle>
                    <p className="text-sm text-gray-300">{user.email}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                      <DropdownMenuItem onClick={() => handleViewUser(user)} className="text-gray-300 hover:text-white hover:bg-gray-700">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditUser(user)} className="text-gray-300 hover:text-white hover:bg-gray-700">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Função:</span>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Status:</span>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>

                  {user.cpf && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">CPF:</span>
                      <span className="text-sm font-mono text-gray-300">{user.cpf}</span>
                    </div>
                  )}

                  {user.fairIds && user.fairIds.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Feiras:</span>
                      <span className="text-sm text-gray-300">{user.fairIds.length} feira(s)</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Criado em:</span>
                    <span className="text-sm text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                Nenhum usuário encontrado
              </h3>
              <p className="text-gray-400">
                {searchTerm ? "Tente ajustar os filtros de busca." : "Comece criando um novo usuário."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modais */}
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
