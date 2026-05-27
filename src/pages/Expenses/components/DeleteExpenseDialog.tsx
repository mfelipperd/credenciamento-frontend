import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Expense } from "@/interfaces/finance";

interface DeleteExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteExpenseDialog({
  isOpen,
  onClose,
  expense,
  onConfirm,
  isLoading = false,
}: DeleteExpenseDialogProps) {
  if (!expense) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-slate-950 border border-white/10 text-white p-6 rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-white tracking-tight">
                Confirmar Exclusão
              </DialogTitle>
              <DialogDescription className="text-white/40 text-sm">
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-white/80 mb-4 text-sm">
            Tem certeza que deseja excluir a seguinte despesa?
          </p>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                Descrição:
              </span>
              <span className="font-semibold text-white">
                {expense.descricao || "Sem descrição"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                Valor:
              </span>
              <span className="font-bold text-red-400">
                {formatCurrency(expense.valor)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                Data:
              </span>
              <span className="font-semibold text-white">
                {formatDate(expense.data)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                Categoria:
              </span>
              <span className="font-semibold text-white">
                {expense.category?.name || "N/A"}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-xs text-red-400 font-medium">
              <strong>Atenção:</strong> Esta ação removerá permanentemente a
              despesa e não poderá ser desfeita.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-white/10 bg-white/5 text-white/80 hover:bg-white/10 rounded-xl font-bold h-11 flex-1 transition-all duration-200"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold h-11 border-none cursor-pointer flex-1 transition-all duration-200 active:scale-95"
          >
            {isLoading ? (
              <div className="flex items-center gap-2 justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Excluindo...
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center">
                <Trash2 className="w-4 h-4" />
                Excluir Despesa
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
