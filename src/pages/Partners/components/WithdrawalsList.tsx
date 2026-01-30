import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePartnerWithdrawals } from "@/hooks/useWithdrawals";
import type { PartnerWithdrawal } from "@/interfaces/withdrawals";
import { format } from "date-fns";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  Calendar,
  User
} from "lucide-react";

interface WithdrawalsListProps {
  partnerId: string;
  fairId: string;
  showPartnerColumn?: boolean;
}

export const WithdrawalsList: React.FC<WithdrawalsListProps> = ({ 
  partnerId, 
  fairId,
  showPartnerColumn = false 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<PartnerWithdrawal | null>(null);

  const { data: withdrawals, isLoading, error } = usePartnerWithdrawals(partnerId, {
    fairId,
    status: statusFilter === "all" ? undefined : statusFilter as any,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, label: "Pendente", icon: Clock },
      APPROVED: { variant: "default" as const, label: "Aprovado", icon: CheckCircle },
      REJECTED: { variant: "destructive" as const, label: "Rejeitado", icon: XCircle },
      COMPLETED: { variant: "default" as const, label: "Concluído", icon: CheckCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredWithdrawals = withdrawals?.filter((withdrawal) => {
    const matchesSearch = 
      withdrawal.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.bankDetails?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  }) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Saques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Erro ao carregar histórico de saques</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Histórico de Saques
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por motivo, dados bancários ou observações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="APPROVED">Aprovado</SelectItem>
                <SelectItem value="REJECTED">Rejeitado</SelectItem>
                <SelectItem value="COMPLETED">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela */}
        {filteredWithdrawals.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum saque encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Criado em</TableHead>
                  {showPartnerColumn && <TableHead>Sócio</TableHead>}
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWithdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell className="font-medium">
                      {formatCurrency(withdrawal.amount)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(withdrawal.status)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {withdrawal.reason || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(withdrawal.createdAt)}
                      </div>
                    </TableCell>
                    {showPartnerColumn && (
                      <TableCell className="text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {withdrawal.partnerId}
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedWithdrawal(withdrawal)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Saque</DialogTitle>
                          </DialogHeader>
                          {selectedWithdrawal && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Valor</label>
                                  <p className="text-lg font-semibold">
                                    {formatCurrency(selectedWithdrawal.amount)}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Status</label>
                                  <div className="mt-1">
                                    {getStatusBadge(selectedWithdrawal.status)}
                                  </div>
                                </div>
                              </div>

                              {selectedWithdrawal.reason && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Motivo</label>
                                  <p className="mt-1">{selectedWithdrawal.reason}</p>
                                </div>
                              )}

                              {selectedWithdrawal.bankDetails && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Dados Bancários</label>
                                  <p className="mt-1 whitespace-pre-wrap">{selectedWithdrawal.bankDetails}</p>
                                </div>
                              )}

                              {selectedWithdrawal.notes && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Observações</label>
                                  <p className="mt-1">{selectedWithdrawal.notes}</p>
                                </div>
                              )}

                              {selectedWithdrawal.rejectionReason && (
                                <div>
                                  <label className="text-sm font-medium text-red-500">Motivo da Rejeição</label>
                                  <p className="mt-1 text-red-600">{selectedWithdrawal.rejectionReason}</p>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Criado em</label>
                                  <p className="text-sm">{formatDate(selectedWithdrawal.createdAt)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Atualizado em</label>
                                  <p className="text-sm">{formatDate(selectedWithdrawal.updatedAt)}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
