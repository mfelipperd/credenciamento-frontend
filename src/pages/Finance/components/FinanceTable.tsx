import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import type {
  PagedResponse,
  RevenueListItem,
  RevenueFilters,
  RevenueStatus,
} from "@/interfaces/finance";

interface FinanceTableProps {
  data?: PagedResponse<RevenueListItem>;
  isLoading: boolean;
  filters: RevenueFilters;
  onFiltersChange: (filters: Partial<RevenueFilters>) => void;
  onViewDetail?: (revenueId: string) => void;
  onDeleteRevenue?: (revenueId: string) => void;
  isDeletingRevenue?: boolean;
}

// Componente Badge simples
function Badge({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: string;
}) {
  const variantClasses = {
    secondary: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
    warning: "bg-orange-500/10 text-orange-500 border border-orange-500/20",
    success: "bg-green-500/10 text-green-500 border border-green-500/20",
    destructive: "bg-pink-500/10 text-pink-500 border border-pink-500/20",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm ${
        variantClasses[variant as keyof typeof variantClasses] ||
        variantClasses.secondary
      }`}
    >
      {children}
    </span>
  );
}

export function FinanceTable({
  data,
  isLoading,
  filters,
  onFiltersChange,
  onViewDetail,
  onDeleteRevenue,
  isDeletingRevenue,
}: FinanceTableProps) {
  const formatCurrency = (cents: number | string) => {
    const numericCents =
      typeof cents === "string" ? parseInt(cents, 10) : cents;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numericCents / 100);
  };

  const getStatusBadge = (status: RevenueStatus) => {
    const statusConfig = {
      PENDING: { label: "Pendente", variant: "secondary" },
      PARTIAL: { label: "Parcial", variant: "warning" },
      PAID: { label: "Pago", variant: "success" },
      OVERDUE: { label: "Atrasado", variant: "destructive" },
      CANCELLED: { label: "Cancelado", variant: "destructive" },
      PENDENTE: { label: "Pendente", variant: "secondary" },
      PARCIAL: { label: "Parcial", variant: "warning" },
      PAGO: { label: "Pago", variant: "success" },
      ATRASADO: { label: "Atrasado", variant: "destructive" },
      CANCELADO: { label: "Cancelado", variant: "destructive" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handlePageChange = (newPage: number) => {
    onFiltersChange({ page: newPage });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const revenues = data?.items || [];
  const totalPages = Math.ceil((data?.total || 0) / (data?.pageSize || 20));
  const currentPage = filters.page || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        <div>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Visão Geral</p>
          <h3 className="text-xl font-black text-white tracking-tighter">
            Receitas
          </h3>
          <p className="text-xs text-white/40">
            {data?.total || 0} registros encontrados
          </p>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-[32px] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="hidden lg:table-cell">Status</TableHead>
              <TableHead className="hidden lg:table-cell">Data Contrato</TableHead>
              <TableHead className="hidden xl:table-cell">Próx. Vencimento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {revenues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400">
                    Nenhuma receita encontrada
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              revenues.map((revenue: RevenueListItem) => (
                <TableRow
                  key={revenue.id}
                  className="group cursor-pointer border-white/5 hover:bg-white/5 transition-all duration-300"
                  onClick={() => onViewDetail?.(revenue.id)}
                >
                  <TableCell className="py-4">
                    <div>
                      <div className="font-bold text-white tracking-tight">
                        {revenue.client?.name || "Cliente não informado"}
                      </div>
                      <div className="text-[10px] text-white/40 font-black uppercase tracking-wider">
                        Stand #{revenue.standNumber}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div>
                      <div className="font-bold text-white tracking-tight">
                        {revenue.entryModel?.name || "Modelo não informado"}
                      </div>
                      <div className="text-[10px] text-white/40 font-black uppercase tracking-wider">
                        {revenue.type}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div>
                      <div className="font-bold text-white tracking-tight">
                        {formatCurrency(revenue.contractValue)}
                      </div>
                      <div className="text-[10px] text-white/40 font-black uppercase tracking-wider">
                        {revenue.paymentMethod}
                      </div>
                      {/* Mostrar status e data em mobile */}
                      <div className="flex gap-2 mt-1 lg:hidden">
                        {getStatusBadge(revenue.status)}
                        <span className="text-xs text-white/40">
                          {dayjs(revenue.createdAt).format("DD/MM/YY")}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="hidden lg:table-cell py-4">{getStatusBadge(revenue.status)}</TableCell>

                  <TableCell className="hidden lg:table-cell py-4">
                    <div className="text-sm text-white/60">
                      {dayjs(revenue.createdAt).format("DD/MM/YYYY")}
                    </div>
                  </TableCell>

                  <TableCell className="hidden xl:table-cell py-4">
                    {(() => {
                      // Buscar a próxima parcela não paga
                      const nextInstallment = revenue.installments?.find(
                        (inst) =>
                          inst.status === "A_VENCER" ||
                          inst.status === "VENCIDA"
                      );

                      return nextInstallment ? (
                        <div className="text-sm text-white font-bold">
                          {dayjs(nextInstallment.dueDate).format("DD/MM/YYYY")}
                        </div>
                      ) : (
                        <span className="text-sm text-white/20">
                          -
                        </span>
                      );
                    })()}
                  </TableCell>

                  <TableCell className="text-right py-4">
                    <div className="flex items-center justify-end space-x-2">
                      {onViewDetail && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetail(revenue.id);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {onDeleteRevenue && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteRevenue(revenue.id);
                          }}
                          disabled={isDeletingRevenue}
                          className="h-8 w-8 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Página {currentPage} de {totalPages}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
