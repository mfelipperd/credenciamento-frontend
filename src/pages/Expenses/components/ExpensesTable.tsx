import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ArrowRightLeft,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Expense } from "@/interfaces/finance";
import { getCategoryColor } from "@/utils/categoryColors";

interface ExpensesTableProps {
  expenses: Expense[];
  isLoading: boolean;
  onEdit: (expense: Expense) => void;
  onView: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onConvertToOverhead?: (expense: Expense) => void;
}

export function ExpensesTable({
  expenses,
  isLoading,
  onEdit,
  onView,
  onDelete,
  onConvertToOverhead,
}: ExpensesTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });

  // Ordena por data decrescente por padrão
  const sorted = [...expenses].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/3">
            <Skeleton className="h-4 w-14" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-16 bg-white/3 border border-white/5 rounded-xl">
        <Building className="mx-auto h-10 w-10 text-white/20 mb-3" />
        <p className="text-sm font-bold text-white/50 uppercase tracking-wider">
          Nenhuma despesa encontrada
        </p>
        <p className="mt-1 text-xs text-white/30">Comece criando sua primeira despesa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {sorted.map((expense) => (
        <div
          key={expense.id}
          onClick={() => onView(expense)}
          className="group flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/3 hover:bg-white/6 border border-white/5 hover:border-white/10 cursor-pointer transition-all duration-150"
        >
          {/* Data */}
          <div className="text-[11px] font-semibold text-white/40 w-14 shrink-0 text-center">
            {formatDate(expense.data)}
          </div>

          {/* Separador vertical */}
          <div className="w-px h-8 bg-white/8 shrink-0" />

          {/* Descrição + Categoria + Conta */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {expense.descricao || "Sem descrição"}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge
                className={`text-[10px] px-1.5 py-0 h-4 ${getCategoryColor(
                  expense.category?.name || ""
                )}`}
              >
                {expense.category?.name || "N/A"}
              </Badge>
              {expense.account?.nomeConta && (
                <span className="text-[10px] text-white/30">
                  {expense.account.nomeConta}
                </span>
              )}
            </div>
          </div>

          {/* Valor */}
          <div className="text-sm font-black text-red-400 shrink-0 tabular-nums">
            {formatCurrency(expense.valor)}
          </div>

          {/* Menu de ações — três pontinhos */}
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white/30 hover:text-white hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-slate-900/95 backdrop-blur-xl border border-white/10 text-white rounded-xl w-48 p-1"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                onClick={() => onView(expense)}
                className="cursor-pointer hover:bg-white/8 rounded-lg text-xs gap-2 px-3 py-2"
              >
                <Eye className="w-3.5 h-3.5 text-white/60" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(expense)}
                className="cursor-pointer hover:bg-white/8 rounded-lg text-xs gap-2 px-3 py-2"
              >
                <Edit className="w-3.5 h-3.5 text-white/60" />
                Editar
              </DropdownMenuItem>
              {onConvertToOverhead && (
                <DropdownMenuItem
                  onClick={() => onConvertToOverhead(expense)}
                  className="cursor-pointer hover:bg-amber-500/10 rounded-lg text-xs gap-2 px-3 py-2 text-amber-400"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Converter para Overhead
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-white/8 my-1" />
              <DropdownMenuItem
                onClick={() => onDelete(expense)}
                className="cursor-pointer hover:bg-red-500/10 rounded-lg text-xs gap-2 px-3 py-2 text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}
