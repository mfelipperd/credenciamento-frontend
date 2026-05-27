import {
  MoreHorizontal,
  Edit,
  Trash2,
  Building,
  ArrowRightLeft,
  Info,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { AllocatedLegacy, AllocatedDirect } from "@/interfaces/finance";
import { getCategoryColor } from "@/utils/categoryColors";

/** Entrada unificada para a tabela overhead — cobre legado e sistema novo */
export type CombinedOverheadEntry =
  | (AllocatedLegacy & { source?: undefined })
  | AllocatedDirect;

/** Extrai o nome de categoria tanto do legado (nome) quanto do novo (name) */
function getCategoryName(entry: CombinedOverheadEntry): string {
  if (!entry.category) return "N/A";
  return (
    (entry.category as { name?: string; nome?: string }).name ||
    (entry.category as { name?: string; nome?: string }).nome ||
    "N/A"
  );
}

interface OverheadExpensesTableProps {
  expenses: CombinedOverheadEntry[];
  isLoading: boolean;
  onEdit: (expense: CombinedOverheadEntry) => void;
  onDelete: (expense: CombinedOverheadEntry) => void;
  onView?: (expense: CombinedOverheadEntry) => void;
}

export function OverheadExpensesTable({
  expenses,
  isLoading,
  onEdit,
  onDelete,
  onView,
}: OverheadExpensesTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });

  const sorted = [...expenses].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/3">
            <Skeleton className="h-4 w-14" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-24" />
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
          Nenhum custo overhead alocado
        </p>
        <p className="mt-1 text-xs text-white/30">
          Esta feira não possui custos fixos compartilhados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {sorted.map((expense) => {
        const categoryName = getCategoryName(expense);
        const isNew = expense.source === "direct_overhead";

        return (
          <div
            key={expense.id}
            onClick={() => onView?.(expense)}
            className="group flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/3 hover:bg-white/6 border border-white/5 hover:border-white/10 cursor-pointer transition-all duration-150"
          >
            {/* Data */}
            <div className="text-[11px] font-semibold text-white/40 w-14 shrink-0 text-center">
              {formatDate(expense.data)}
            </div>

            {/* Separador */}
            <div className="w-px h-8 bg-white/8 shrink-0" />

            {/* Descrição + Categoria + Sistema */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">
                {expense.descricao || "Sem descrição"}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge
                  className={`text-[10px] px-1.5 py-0 h-4 ${getCategoryColor(categoryName)}`}
                >
                  {categoryName}
                </Badge>
                {expense.account?.nomeConta && (
                  <span className="text-[10px] text-white/30">
                    {expense.account.nomeConta}
                  </span>
                )}
                {isNew ? (
                  <Badge className="text-[10px] h-4 px-1.5 py-0 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 gap-1">
                    <ArrowRightLeft className="w-2.5 h-2.5" />
                    Rateio
                  </Badge>
                ) : (
                  <Badge className="text-[10px] h-4 px-1.5 py-0 bg-white/5 border border-white/10 text-white/30">
                    Legado
                  </Badge>
                )}
              </div>
            </div>

            {/* Valores */}
            <div className="text-right shrink-0 hidden sm:block">
              <p className="text-sm font-black text-red-400 tabular-nums">
                {formatCurrency(expense.valorAlocado)}
              </p>
              <p className="text-[10px] text-white/30 tabular-nums">
                {(expense.percentualDesteFair * 100).toFixed(0)}% de{" "}
                {formatCurrency(expense.valorTotal)}
              </p>
            </div>

            {/* Popover de rateio entre feiras */}
            <Popover>
              <PopoverTrigger
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white/30 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  title={`${expense.feirasRateadas?.length || 0} feiras no rateio`}
                >
                  <Info className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-72 p-4 bg-slate-950 border border-white/10 text-white rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h5 className="font-black text-[10px] uppercase tracking-wider text-white/50 mb-3 border-b border-white/5 pb-2">
                  Rateio entre{" "}
                  {expense.feirasRateadas?.length || 0} feiras
                </h5>
                <div className="space-y-2">
                  {expense.feirasRateadas?.map((rateio) => (
                    <div
                      key={rateio.fairId}
                      className="flex justify-between items-center"
                    >
                      <span className="text-xs text-white/60 truncate max-w-[160px]">
                        {rateio.fairName}
                      </span>
                      <span className="text-xs font-bold text-white tabular-nums">
                        {(rateio.percentual * 100).toFixed(0)}%{" "}
                        <span className="text-white/40 font-normal">
                          ({formatCurrency(expense.valorTotal * rateio.percentual)})
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Menu de ações */}
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
                className="bg-slate-900/95 backdrop-blur-xl border border-white/10 text-white rounded-xl w-40 p-1"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  onClick={() => onEdit(expense)}
                  className="cursor-pointer hover:bg-white/8 rounded-lg text-xs gap-2 px-3 py-2"
                >
                  <Edit className="w-3.5 h-3.5 text-white/60" />
                  Editar
                </DropdownMenuItem>
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
        );
      })}
    </div>
  );
}
