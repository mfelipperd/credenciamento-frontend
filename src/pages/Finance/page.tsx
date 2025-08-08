import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useFinanceService } from "@/service/finance.service";
import { FinanceFiltersSheet } from "./components/FinanceFiltersSheet";
import { FinanceKpis } from "./components/FinanceKpis";
import { FinanceTable } from "./components/FinanceTable";
import { ReceitaDrawer } from "./components/ReceitaDrawer";
import { EntryModelsDialog } from "./components/EntryModelsDialog";
import { RevenueDetailModal } from "./components/RevenueDetailModal";
import type { RevenueFilters } from "@/interfaces/finance";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Filter } from "lucide-react";

export function FinancePage() {
  const [searchParams] = useSearchParams();
  const fairId = searchParams.get("fairId");
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<RevenueFilters>({
    page: 1,
    pageSize: 20,
    fairId: fairId || "",
  });

  // Atualiza o fairId nos filtros quando a URL muda
  useEffect(() => {
    if (fairId) {
      setFilters((prev) => ({
        ...prev,
        fairId: fairId,
      }));
    }
  }, [fairId]);

  const [selectedRevenueId, setSelectedRevenueId] = useState<string | null>(
    null
  );
  const [selectedRevenueForDetail, setSelectedRevenueForDetail] = useState<
    string | null
  >(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isFiltersSheetOpen, setIsFiltersSheetOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const financeService = useFinanceService();

  // Query para buscar receitas
  const {
    data: revenuesData,
    isLoading: isLoadingRevenues,
    refetch: refetchRevenues,
  } = useQuery({
    queryKey: ["finance-revenues", filters],
    queryFn: () => financeService.getRevenues(filters),
    enabled: !!filters.fairId,
  });

  // Query para KPIs
  const { data: kpisData, isLoading: isLoadingKpis } = useQuery({
    queryKey: ["finance-kpis", filters.fairId, filters.from, filters.to],
    queryFn: () =>
      financeService.getKpis(filters.fairId!, filters.from, filters.to),
    enabled: !!filters.fairId,
  });

  // Mutation para deletar receita
  const deleteRevenueMutation = useMutation({
    mutationFn: financeService.deleteRevenue,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["finance-revenues"],
      });
      queryClient.invalidateQueries({
        queryKey: ["finance-kpis"],
      });
    },
  });

  const handleFiltersChange = (newFilters: Partial<RevenueFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page ?? 1, // Reset page quando outros filtros mudam
    }));
  };

  const handleCreateRevenue = () => {
    setSelectedRevenueId(null);
    setIsDrawerOpen(true);
  };

  const handleEditRevenue = (revenueId: string) => {
    setSelectedRevenueId(revenueId);
    setIsDrawerOpen(true);
  };

  const handleViewRevenueDetail = (revenueId: string) => {
    setSelectedRevenueForDetail(revenueId);
    setIsDetailModalOpen(true);
  };

  const handleDeleteRevenue = async (revenueId: string) => {
    if (
      confirm(
        "Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita."
      )
    ) {
      deleteRevenueMutation.mutate(revenueId);
    }
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedRevenueId(null);
    refetchRevenues();
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedRevenueForDetail(null);
  };

  // Função para detectar se há filtros ativos
  const hasActiveFilters = () => {
    return !!(
      filters.q ||
      (filters.status && filters.status !== "all") ||
      (filters.type && filters.type !== "all") ||
      filters.from ||
      filters.to
    );
  };

  return (
    <div className="min-h-screen ">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestão Financeira
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Controle de receitas e análise de resultados
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setIsFiltersSheetOpen(true)}
              variant="outline"
              className={`text-gray-900 dark:text-white relative ${
                hasActiveFilters()
                  ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950"
                  : ""
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {hasActiveFilters() && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </Button>
            <Button
              onClick={() => setIsConfigDialogOpen(true)}
              variant="outline"
              className="text-gray-900 dark:text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurar
            </Button>
            <Button
              onClick={handleCreateRevenue}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Receita
            </Button>
          </div>
        </div>

        {/* Filtros removidos da área principal - agora em Sheet */}

        {/* KPIs */}
        {filters.fairId && (
          <FinanceKpis data={kpisData} isLoading={isLoadingKpis} />
        )}

        {/* Tabela de Receitas - Movida para cima */}
        {filters.fairId && (
          <Card className="glass-card">
            <FinanceTable
              data={revenuesData}
              isLoading={isLoadingRevenues}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onEditRevenue={handleEditRevenue}
              onViewDetail={handleViewRevenueDetail}
              onDeleteRevenue={handleDeleteRevenue}
              isDeletingRevenue={deleteRevenueMutation.isPending}
            />
          </Card>
        )}

        {/* Drawer para criar/editar receita */}
        <ReceitaDrawer
          isOpen={isDrawerOpen}
          onClose={handleDrawerClose}
          revenueId={selectedRevenueId}
          fairId={filters.fairId}
        />

        {/* Dialog para gerenciar modelos de entrada */}
        <EntryModelsDialog
          isOpen={isConfigDialogOpen}
          onClose={() => setIsConfigDialogOpen(false)}
          fairId={filters.fairId}
        />

        {/* Sheet para filtros avançados */}
        <FinanceFiltersSheet
          isOpen={isFiltersSheetOpen}
          onClose={() => setIsFiltersSheetOpen(false)}
          filters={filters}
          onChange={handleFiltersChange}
        />

        {/* Modal de detalhamento da receita */}
        <RevenueDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleDetailModalClose}
          revenueId={selectedRevenueForDetail}
          fairId={fairId || ""}
          onEditRevenue={handleEditRevenue}
        />
      </div>
    </div>
  );
}
