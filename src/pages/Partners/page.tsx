import { useState } from "react";
import { Plus, Users, DollarSign, TrendingUp, Eye, Edit, Trash2, MoreHorizontal, UserCheck, BarChart3, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PageTabsList, PageTabsTrigger } from "@/components/ui/page-tabs";
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
import { FairFinancialOverview } from "./components/FairFinancialOverview";
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

  const totalPercentage = fairPartners?.reduce((sum, partner) => sum + Number(partner.percentage || 0), 0) || 0;
  const totalEarnings = fairPartners?.reduce((sum, partner) => sum + Number(partner.totalEarnings || 0), 0) || 0;
  const totalAvailable = fairPartners?.reduce((sum, partner) => sum + Number(partner.availableBalance || 0), 0) || 0;

  const handleDeletePartner = async (fairPartnerId: string) => {
    try {
      await deleteFairPartnerMutation.mutateAsync(fairPartnerId);
      toast.success("Sócio removido da feira com sucesso");
      setIsDeleteDialogOpen(false);
      setSelectedPartner(null);
    } catch {
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
    <div className="min-h-screen space-y-6 p-4 pb-10 text-white sm:p-6">
      <Tabs defaultValue="socios">
        {/* Header: título à esquerda, tabs centralizado, botão à direita */}
        <div className="mb-6 flex flex-col gap-5 xl:grid xl:grid-cols-[1fr_auto_1fr] xl:items-end">
          <div>
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Participações e resultados</p>
            <h1 className="flex items-center gap-3 text-3xl font-black tracking-tighter text-white sm:text-4xl">
              <Users className="h-8 w-8 text-brand-pink" />
              Gestão de <span className="text-brand-cyan">Sócios</span>
            </h1>
            <p className="mt-1 text-sm font-medium text-white/40">
              Gestão de sócios e distribuição de lucros
            </p>
          </div>
          <PageTabsList>
            <PageTabsTrigger value="socios">
              <Users className="w-4 h-4" />
              Sócios
            </PageTabsTrigger>
            {isAdmin && (
              <PageTabsTrigger value="financeiro">
                <BarChart3 className="w-4 h-4" />
                Visão Financeira
              </PageTabsTrigger>
            )}
          </PageTabsList>
          <div className="flex justify-start xl:justify-end">
            {isAdmin && (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="h-11 rounded-xl border-none bg-linear-to-br from-[#00aacd] to-[#EB2970] px-6 font-bold text-white shadow-lg shadow-pink-500/20 transition-all hover:scale-105 active:scale-95">
                <Plus className="w-4 h-4 mr-2" />
                Novo Sócio
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="financeiro">
          <FairFinancialOverview fairId={fairId} />
        </TabsContent>

        <TabsContent value="socios" className="space-y-4">

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="glass-card border border-white/5 bg-white/3">
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

        <Card className="glass-card border border-white/5 bg-white/3">
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

        <Card className="glass-card border border-white/5 bg-white/3">
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

        <Card className="glass-card border border-white/5 bg-white/3">
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

      {/* Busca compacta */}
      <div className="glass-card rounded-2xl border border-white/5 bg-white/3 p-3">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input
            placeholder="Buscar por nome, email ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 border-white/10 bg-white/5 pl-9 text-white placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Lista de Sócios */}
      <div className="space-y-3">
        {filteredPartners.length === 0 && !isLoading && (
          <Card className="glass-card border border-white/5 bg-white/3">
            <CardContent className="p-6 text-center">
              <p className="text-white/50">
                Nenhum sócio encontrado para esta feira. 
                {isAdmin && " Use o botão 'Novo Sócio' para associar um sócio à feira."}
              </p>
            </CardContent>
          </Card>
        )}
        {filteredPartners.map((partner) => (
          <Card key={partner.id} className="glass-card relative border border-white/5 bg-white/3 py-0 transition-all hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/5">
            <CardContent className="p-4 pr-12 lg:pr-4">
              <div className="grid gap-4 lg:grid-cols-[minmax(240px,1.4fr)_repeat(3,minmax(120px,1fr))_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                        {partner.partnerName || "Nome não disponível"}
                      </h3>
                      <p className="truncate text-xs text-gray-600 dark:text-gray-400">
                        {partner.partnerEmail || "Email não disponível"} • {partner.partnerCpf || "CPF não disponível"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Badge variant={partner.isActive ? "default" : "secondary"} className="h-6 px-2 text-[10px]">
                        {partner.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                      <Badge variant="outline" className="h-6 px-2 text-[10px]">
                        {formatPercentage(partner.percentage)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-3 lg:contents">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Total ganho</p>
                    <p className="mt-0.5 text-sm font-semibold text-green-600 dark:text-green-400">{formatCurrency(partner.totalEarnings)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Pendente</p>
                    <p className="mt-0.5 text-sm font-semibold text-orange-600 dark:text-orange-400">{formatCurrency(partner.pendingWithdrawals)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Disponível</p>
                    <p className="mt-0.5 text-sm font-semibold text-purple-600 dark:text-purple-400">{formatCurrency(partner.availableBalance)}</p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="absolute right-3 top-3 h-8 w-8 p-0 text-white/50 lg:static">
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

        </TabsContent>
      </Tabs>
    </div>
  );
}
