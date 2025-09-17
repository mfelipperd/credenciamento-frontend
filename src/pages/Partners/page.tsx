import { useState } from "react";
import { Plus, Users, DollarSign, TrendingUp, Eye, Edit, Trash2, MoreHorizontal, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFairPartners, useAvailablePercentage, useDeleteFairPartner } from "@/hooks/useFairPartners";
import { useAuth } from "@/hooks/useAuth";
import { EUserRole } from "@/enums/user.enum";
import { FairPartnerForm } from "./components/FairPartnerForm";
import { PartnerView } from "./components/PartnerView";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import type { FairPartner } from "@/interfaces/fair-partners";

export default function PartnersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<FairPartner | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPartnerViewOpen, setIsPartnerViewOpen] = useState(false);
  const [viewingPartner, setViewingPartner] = useState<FairPartner | null>(null);

  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const fairId = searchParams.get("fairId") || "";
  
  const { data: fairPartners, isLoading } = useFairPartners(fairId);
  const { data: availablePercentage } = useAvailablePercentage(fairId);
  const deleteFairPartnerMutation = useDeleteFairPartner();

  // Verificar se o usuário é admin
  const isAdmin = auth?.user?.role === EUserRole.ADMIN;

  const formatCurrency = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === '') {
      return "R$ 0,00";
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      return "R$ 0,00";
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numValue);
  };

  const formatPercentage = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === '') {
      return "0.0%";
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      return "0.0%";
    }
    return `${numValue.toFixed(1)}%`;
  };

  const filteredPartners = fairPartners?.filter(partner =>
    (partner.partnerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (partner.partnerEmail || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (partner.partnerCpf || "").includes(searchTerm)
  ) || [];

  const totalPercentage = fairPartners?.reduce((sum, partner) => sum + partner.percentage, 0) || 0;
  const totalEarnings = fairPartners?.reduce((sum, partner) => sum + partner.totalEarnings, 0) || 0;
  const totalAvailable = fairPartners?.reduce((sum, partner) => sum + partner.availableBalance, 0) || 0;

  const handleDeletePartner = async (fairPartnerId: string) => {
    try {
      await deleteFairPartnerMutation.mutateAsync(fairPartnerId);
      toast.success("Sócio removido da feira com sucesso");
      setIsDeleteDialogOpen(false);
      setSelectedPartner(null);
    } catch (error) {
      toast.error("Erro ao remover sócio da feira");
    }
  };

  const handleViewAsPartner = (partner: FairPartner) => {
    setViewingPartner(partner);
    setIsPartnerViewOpen(true);
  };

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sócios</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestão de sócios e distribuição de lucros
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Sócio
          </Button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Total de Sócios
            </CardTitle>
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {fairPartners?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Porcentagem Utilizada
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatPercentage(totalPercentage)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Disponível: {formatPercentage(availablePercentage?.availablePercentage || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Total Ganho
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalEarnings)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Saldo Disponível
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(totalAvailable)}
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
          <Input
            placeholder="Buscar por nome, email ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Lista de Sócios */}
      <div className="space-y-4">
        {filteredPartners.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum sócio encontrado para esta feira. 
                {isAdmin && " Use o botão 'Novo Sócio' para associar um sócio à feira."}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                FairId atual: {fairId || "Não definido"}
              </p>
              <p className="text-sm text-gray-500">
                Você é admin: {isAdmin ? "Sim" : "Não"}
              </p>
            </CardContent>
          </Card>
        )}
        {filteredPartners.map((partner) => (
          <Card key={partner.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {partner.partnerName || "Nome não disponível"}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {partner.partnerEmail || "Email não disponível"} • {partner.partnerCpf || "CPF não disponível"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={partner.isActive ? "default" : "secondary"}>
                        {partner.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                      <Badge variant="outline">
                        {formatPercentage(partner.percentage)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Ganho</p>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(partner.totalEarnings)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Valor Pendente</p>
                      <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                        {formatCurrency(partner.pendingWithdrawals)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Saldo Disponível</p>
                      <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                        {formatCurrency(partner.availableBalance)}
                      </p>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSelectedPartner(partner)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuItem onClick={() => handleViewAsPartner(partner)}>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Ver como Sócio
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedPartner(partner);
                          setIsEditDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedPartner(partner);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover da Feira
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-400">
              Tem certeza que deseja remover o sócio <strong>{selectedPartner?.partnerName}</strong> desta feira?
            </p>
            <p className="text-sm text-red-600 mt-2">
              Esta ação remove apenas a associação com esta feira. O sócio continuará existindo no sistema.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedPartner && handleDeletePartner(selectedPartner.id)}
              disabled={deleteFairPartnerMutation.isPending}
            >
              {deleteFairPartnerMutation.isPending ? "Removendo..." : "Remover da Feira"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Formulário de Criação/Edição */}
      <FairPartnerForm
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        mode="create"
        fairId={fairId}
      />

      <FairPartnerForm
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        partner={selectedPartner}
        mode="edit"
        fairId={fairId}
      />

      {/* Modal de Visão do Sócio */}
      <Dialog open={isPartnerViewOpen} onOpenChange={setIsPartnerViewOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Visão do Sócio</DialogTitle>
          </DialogHeader>
          {viewingPartner && (
            <PartnerView
              partner={viewingPartner}
              fairId={undefined}
              isAdminView={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
