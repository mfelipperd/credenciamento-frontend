import { useState } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteUser } from "@/hooks/useUsers";
import { toast } from "sonner";
import { Trash2, AlertTriangle } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DeleteUserDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteUserDialog({ user, isOpen, onClose }: DeleteUserDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteUserMutation = useDeleteUser();

  const handleDelete = async () => {
    if (!user) return;

    try {
      setIsDeleting(true);
      await deleteUserMutation.mutateAsync(user.id);
      toast.success("Usuário excluído com sucesso!");
      onClose();
    } catch (error) {
      toast.error("Erro ao excluir usuário");
      console.error("Erro ao excluir usuário:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Tem certeza que deseja excluir o usuário <strong>{user.name}</strong>?
            </p>
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {user.email}
            </p>
            {user.cpf && (
              <p className="text-sm text-gray-600">
                <strong>CPF:</strong> {user.cpf}
              </p>
            )}
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ Esta ação não pode ser desfeita!
              </p>
              <p className="text-sm text-red-700 mt-1">
                Todos os dados do usuário serão permanentemente removidos do sistema.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Excluindo...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Excluir Usuário
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
