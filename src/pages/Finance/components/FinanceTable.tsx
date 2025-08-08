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
import { Edit, Eye, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
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
  onEditRevenue: (revenueId: string) => void;
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
    secondary: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    success:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    destructive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
  onEditRevenue,
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
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Receitas
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data?.total || 0} receitas encontradas
          </p>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-md border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data Contrato</TableHead>
              <TableHead>Próx. Vencimento</TableHead>
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
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => onViewDetail?.(revenue.id)}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {revenue.client?.name || "Cliente não informado"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {revenue.client?.id || revenue.clientId}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {revenue.entryModel?.name || "Modelo não informado"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {revenue.type}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(revenue.contractValue)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {revenue.paymentMethod}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{getStatusBadge(revenue.status)}</TableCell>

                  <TableCell>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {dayjs(revenue.createdAt).format("DD/MM/YYYY")}
                    </div>
                  </TableCell>

                  <TableCell>
                    {(() => {
                      // Buscar a próxima parcela não paga
                      const nextInstallment = revenue.installments?.find(
                        (inst) =>
                          inst.status === "A_VENCER" ||
                          inst.status === "VENCIDA"
                      );

                      return nextInstallment ? (
                        <div className="text-sm text-gray-900 dark:text-white">
                          {dayjs(nextInstallment.dueDate).format("DD/MM/YYYY")}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          -
                        </span>
                      );
                    })()}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {onViewDetail && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetail(revenue.id);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditRevenue(revenue.id);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {onDeleteRevenue && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteRevenue(revenue.id);
                          }}
                          disabled={isDeletingRevenue}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 disabled:opacity-50"
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
