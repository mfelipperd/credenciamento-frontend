import { useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Tag,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { Expense } from "@/interfaces/finance";
import { getCategoryColor } from "@/utils/categoryColors";

interface ExpensesTableProps {
  expenses: Expense[];
  isLoading: boolean;
  onEdit: (expense: Expense) => void;
  onView: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpensesTable({
  expenses,
  isLoading,
  onEdit,
  onView,
  onDelete,
}: ExpensesTableProps) {
  const [sortField, setSortField] = useState<keyof Expense>("data");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");


  const handleSort = (field: keyof Expense) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedExpenses = [...expenses].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    let comparison = 0;
    if (typeof aValue === "string" && typeof bValue === "string") {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      comparison = aValue - bValue;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getSortIcon = (field: keyof Expense) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[80px]" />
          </div>
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 bg-white/3 border border-white/5 rounded-xl backdrop-blur-md">
        <Building className="mx-auto h-12 w-12 text-white/20 animate-pulse" />
        <h3 className="mt-4 text-sm font-bold text-white uppercase tracking-wider">
          Nenhuma despesa encontrada
        </h3>
        <p className="mt-1 text-xs text-white/40">
          Comece criando sua primeira despesa.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card border border-white/10 bg-slate-950/20 rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-white/10 hover:bg-transparent">
            <TableHead
              className="cursor-pointer hover:bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-wider h-11"
              onClick={() => handleSort("data")}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data
                {getSortIcon("data")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-wider h-11"
              onClick={() => handleSort("descricao")}
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Descrição
                {getSortIcon("descricao")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-wider h-11"
              onClick={() => handleSort("valor")}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Valor
                {getSortIcon("valor")}
              </div>
            </TableHead>
            <TableHead className="text-white/40 text-[10px] font-black uppercase tracking-wider h-11">Categoria</TableHead>
            <TableHead className="text-white/40 text-[10px] font-black uppercase tracking-wider h-11">Conta</TableHead>
            <TableHead className="text-white/40 text-[10px] font-black uppercase tracking-wider text-right h-11">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedExpenses.map((expense) => (
            <TableRow
              key={expense.id}
              className="border-b border-white/5 hover:bg-white/3 transition-colors"
            >
              <TableCell className="font-medium text-white/80">
                {formatDate(expense.data)}
              </TableCell>
              <TableCell className="text-white font-semibold">
                <div
                  className="max-w-[200px] truncate"
                  title={expense.descricao || "Sem descrição"}
                >
                  {expense.descricao || "Sem descrição"}
                </div>
              </TableCell>
              <TableCell className="font-bold text-red-400">
                {formatCurrency(expense.valor)}
              </TableCell>
              <TableCell>
                <Badge className={`text-xs ${getCategoryColor(expense.category?.name || "")}`}>
                  {expense.category?.name || "N/A"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs bg-white/5 border border-white/10 text-white/80 hover:bg-white/10">
                  {expense.account?.nomeConta || "N/A"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onView(expense)}
                    className="h-8 w-8 p-0 border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(expense)}
                    className="h-8 w-8 p-0 border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(expense)}
                    className="h-8 w-8 p-0 border-white/10 bg-white/5 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
