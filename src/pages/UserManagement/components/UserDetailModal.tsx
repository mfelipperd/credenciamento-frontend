import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Calendar, 
  Shield,
  CheckCircle,
  XCircle
} from "lucide-react";
import { EUserRole } from "@/enums/user.enum";

interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  role: EUserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailModal({ user, isOpen, onClose }: UserDetailModalProps) {
  if (!user) return null;

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
      default:
        return "Usuário";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalhes do Usuário
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Nome Completo</label>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                    {user.name}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                </div>

                {user.cpf && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">CPF</label>
                    <p className="text-sm font-mono bg-gray-50 p-2 rounded flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {user.cpf}
                    </p>
                  </div>
                )}

                {user.phone && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Telefone</label>
                    <p className="text-sm font-mono bg-gray-50 p-2 rounded flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {user.phone}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informações de Acesso */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações de Acesso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Função</label>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="flex items-center gap-2">
                    {user.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações de Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Data de Criação</label>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(user.createdAt)}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Última Atualização</label>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(user.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
