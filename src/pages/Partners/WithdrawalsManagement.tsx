import { useState } from "react";
import { Check, X, Eye, Filter, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAllWithdrawals, useApproveWithdrawal, useRejectWithdrawal } from "@/hooks/useWithdrawals";
import { useSearchParams } from "@/hooks/useSearchParams";
import { toast } from "sonner";
import type { PartnerWithdrawal, WithdrawalFilters } from "@/interfaces/withdrawals";

export function WithdrawalsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PartnerWithdrawal['status'] | "all">("all");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<PartnerWithdrawal | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  
  // Obter fairId da URL
  const [, , fairId] = useSearchParams();
  
  // Configurar filtros para o hook
  const filters: WithdrawalFilters = {
    fairId: fairId || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  };

  const { data: withdrawals, isLoading } = useAllWithdrawals(filters);
  const approveWithdrawalMutation = useApproveWithdrawal();
  const rejectWithdrawalMutation = useRejectWithdrawal();
  // Removed useUpdateWithdrawal and useDeleteWithdrawal - these hooks don't exist

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: PartnerWithdrawal['status']) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "APPROVED":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getStatusLabel = (status: PartnerWithdrawal['status']) => {
    switch (status) {
      case "PENDING":
        return "Pendente";
      case "APPROVED":
        return "Aprovado";
      case "REJECTED":
        return "Rejeitado";
      case "COMPLETED":
        return "Concluído";
      default:
        return "Desconhecido";
    }
  };

  const filteredWithdrawals = withdrawals?.filter((withdrawal: PartnerWithdrawal) => {
    const matchesSearch = 
      (withdrawal.reason?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (withdrawal.bankDetails?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === "all" || withdrawal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleApproveWithdrawal = async (withdrawalId: string) => {
    try {
      await approveWithdrawalMutation.mutateAsync(withdrawalId);
      // toast.success removido - já está no hook
    } catch (error) {
      // toast.error removido - já está no hook
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    const rejectionReason = prompt("Motivo da rejeição:");
    if (!rejectionReason) {
      toast.error("Motivo da rejeição é obrigatório");
      return;
    }

    try {
      await rejectWithdrawalMutation.mutateAsync({
        withdrawalId,
        data: { rejectionReason },
      });
      // toast.success removido - já está no hook
    } catch (error) {
      // toast.error removido - já está no hook
    }
  };

  // COMMENTED OUT: These functions use hooks that don't exist yet
  // const handleUpdateWithdrawalStatus = async (withdrawalId: string, newStatus: PartnerWithdrawal['status']) => {
  //   try {
  //     await updateWithdrawalMutation.mutateAsync({
  //       withdrawalId,
  //       data: { status: newStatus },
  //     });
  //     toast.success(`Saque ${newStatus === 'PENDING' ? 'marcado como pendente' : 'atualizado'} com sucesso`);
  //   } catch (error) {
  //     toast.error("Erro ao atualizar saque");
  //   }
  // };

  // const handleDeleteWithdrawal = async (withdrawalId: string) => {
  //   if (window.confirm("Tem certeza que deseja excluir este saque? Esta ação não pode ser desfeita.")) {
  //     try {
  //       await deleteWithdrawalMutation.mutateAsync(withdrawalId);
  //       toast.success("Saque excluído com sucesso");
  //     } catch (error) {
  //       toast.error("Erro ao excluir saque");
  //     }
  //   }
  // };

  // Função auxiliar para calcular valor total de saques por status
  const calculateAmountByStatus = (status: string) => {
    return withdrawals?.filter((w: PartnerWithdrawal) => w.status === status).reduce((sum: number, w: PartnerWithdrawal) => {
      if (!w || w.amount === undefined || w.amount === null) return sum;
      const amount = typeof w.amount === 'number' ? w.amount : parseFloat(String(w.amount));
      return isNaN(amount) ? sum : sum + amount;
    }, 0) || 0;
  };

  const pendingCount = withdrawals?.filter((w: PartnerWithdrawal) => w.status === "PENDING").length || 0;
  const approvedCount = withdrawals?.filter((w: PartnerWithdrawal) => w.status === "APPROVED").length || 0;
  const rejectedCount = withdrawals?.filter((w: PartnerWithdrawal) => w.status === "REJECTED").length || 0;
  
  // Debug: verificar dados dos saques
  console.log("Withdrawals data:", withdrawals);
  console.log("First withdrawal:", withdrawals?.[0]);
  
  const totalAmount = withdrawals?.reduce((sum: number, w: PartnerWithdrawal) => {
    // Verificar se o withdrawal e amount existem
    if (!w || w.amount === undefined || w.amount === null) {
      console.log("Invalid withdrawal or amount:", w);
      return sum;
    }
    
    // Converter para número se necessário
    const amount = typeof w.amount === 'number' ? w.amount : parseFloat(String(w.amount));
    
    // Verificar se é um número válido
    if (isNaN(amount)) {
      console.log("Invalid amount:", w.amount, "for withdrawal:", w.id);
      return sum;
    }
    
    console.log("Withdrawal amount:", w.amount, "Parsed:", amount);
    return sum + amount;
  }, 0) || 0;
  
  console.log("Total amount calculated:", totalAmount);

  // Calcular valores por status
  const approvedAmount = calculateAmountByStatus("APPROVED");
  const rejectedAmount = calculateAmountByStatus("REJECTED");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestão de Saques</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Aprovar e gerenciar solicitações de saque dos sócios
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Pendentes
            </CardTitle>
            <Filter className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {pendingCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Aprovados
            </CardTitle>
            <Check className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {approvedCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Rejeitados
            </CardTitle>
            <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {rejectedCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Valor Total
            </CardTitle>
            <Filter className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {isNaN(totalAmount) ? "R$ 0,00" : formatCurrency(totalAmount)}
              </div>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Aprovado:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {formatCurrency(approvedAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Rejeitado:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {formatCurrency(rejectedAmount)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por motivo ou dados bancários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PartnerWithdrawal['status'] | "all")}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="APPROVED">Aprovado</SelectItem>
                <SelectItem value="REJECTED">Rejeitado</SelectItem>
                <SelectItem value="COMPLETED">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Saques */}
      <div className="space-y-4">
        {filteredWithdrawals.map((withdrawal: PartnerWithdrawal) => (
          <Card key={withdrawal.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(withdrawal.amount)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {withdrawal.reason || "Sem motivo especificado"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(withdrawal.createdAt)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(withdrawal.status)}>
                      {getStatusLabel(withdrawal.status)}
                    </Badge>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Dados Bancários</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {withdrawal.bankDetails || "Dados bancários não informados"}
                    </p>
                    {withdrawal.notes && (
                      <>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Observações</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {withdrawal.notes}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedWithdrawal(withdrawal)}
                    title="Ver detalhes"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" title="Ações">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {withdrawal.status === "PENDING" && (
                        <>
                          <DropdownMenuItem 
                            onClick={() => handleApproveWithdrawal(withdrawal.id)}
                            className="text-green-600"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Aprovar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal);
                              setIsRejectDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Rejeitar
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {/* COMMENTED OUT: Function doesn't exist yet
                      {withdrawal.status !== "PENDING" && (
                        <DropdownMenuItem 
                          onClick={() => handleUpdateWithdrawalStatus(withdrawal.id, "PENDING")}
                          className="text-yellow-600"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Voltar para Pendente
                        </DropdownMenuItem>
                      )}
                      */}
                      
                      <DropdownMenuItem 
                        onClick={() => setSelectedWithdrawal(withdrawal)}
                        className="text-blue-600"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      
                      {/* COMMENTED OUT: Function doesn't exist yet
                      <DropdownMenuItem 
                        onClick={() => handleDeleteWithdrawal(withdrawal.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                      */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Detalhes do Saque */}
      {selectedWithdrawal && (
        <Dialog open={!!selectedWithdrawal} onOpenChange={() => setSelectedWithdrawal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes do Saque</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Valor</p>
                <p className="text-lg font-semibold">{formatCurrency(selectedWithdrawal.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <Badge className={getStatusColor(selectedWithdrawal.status)}>
                  {getStatusLabel(selectedWithdrawal.status)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Motivo</p>
                <p className="font-semibold">{selectedWithdrawal.reason}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Dados Bancários</p>
                <p className="font-semibold">{selectedWithdrawal.bankDetails}</p>
              </div>
              {selectedWithdrawal.notes && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Observações</p>
                  <p className="font-semibold">{selectedWithdrawal.notes}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Data de Criação</p>
                <p className="font-semibold">{formatDate(selectedWithdrawal.createdAt)}</p>
              </div>
              {selectedWithdrawal.approvedAt && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Data de Aprovação</p>
                  <p className="font-semibold">{formatDate(selectedWithdrawal.approvedAt)}</p>
                </div>
              )}
              {selectedWithdrawal.rejectionReason && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Motivo da Rejeição</p>
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    {selectedWithdrawal.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de Rejeição */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Saque</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valor do Saque</p>
              <p className="font-semibold">
                {selectedWithdrawal && formatCurrency(selectedWithdrawal.amount)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Motivo da Rejeição
              </label>
              <textarea
                className="w-full mt-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md resize-none"
                rows={4}
                placeholder="Explique o motivo da rejeição..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedWithdrawal && handleRejectWithdrawal(selectedWithdrawal.id)}
              disabled={rejectWithdrawalMutation.isPending || !rejectionReason.trim()}
            >
              {rejectWithdrawalMutation.isPending ? "Rejeitando..." : "Rejeitar Saque"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
