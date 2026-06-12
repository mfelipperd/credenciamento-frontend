import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "@/hooks/useSearchParams";
import { useFinanceService } from "@/service/finance.service";
import { useStandService } from "@/service/stands.service";
import { FinanceTable } from "./components/FinanceTable";
import { RevenueStats } from "./components/RevenueStats";
import { ReceitaDrawer } from "./components/ReceitaDrawer";
import { RevenueDetailModal } from "./components/RevenueDetailModal";
import { CashFlowModal } from "./components/CashFlowModal";
import { StandMap } from "@/components/StandMap";
import { StandConfigurator } from "@/components/StandConfigurator";
import type { RevenueFilters } from "@/interfaces/finance";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Grid, DollarSign, ChevronDown, ChevronUp } from "lucide-react";

export function FinancePage() {
  const [, , fairId] = useSearchParams();
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
  const [showCashFlowModal, setShowCashFlowModal] = useState(false);
  const [selectedRevenueForDetail, setSelectedRevenueForDetail] = useState<
    string | null
  >(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [standsRefreshKey, setStandsRefreshKey] = useState(0);
  const [isStandsExpanded, setIsStandsExpanded] = useState(true);
  const [selectedStandNumber, setSelectedStandNumber] = useState<number | null>(
    null
  );

  const financeService = useFinanceService();
  const standService = useStandService();

  // Query para buscar receitas
  const {
    data: revenuesData,
    isLoading: isLoadingRevenues,
  } = useQuery({
    queryKey: ["finance-revenues", filters],
    queryFn: () => financeService.getRevenues(filters),
    enabled: !!filters.fairId,
  });

  // Query para estatísticas de stands
  const { data: standStats } = useQuery({
    queryKey: ["stand-stats", filters.fairId, standsRefreshKey],
    queryFn: () => standService.getStandStats(filters.fairId!),
    enabled: !!filters.fairId,
  });

  // Mutation para deletar receita
  const deleteRevenueMutation = useMutation({
    mutationFn: (revenueId: string) =>
      financeService.deleteRevenue(revenueId, filters.fairId),
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
    setSelectedStandNumber(null);
    setIsDrawerOpen(true);
  };

  const handleCreateRevenueFromStand = (standNumber: number) => {
    setSelectedRevenueId(null);
    setSelectedStandNumber(standNumber);
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
    setSelectedStandNumber(null);
    // Query invalidation is handled automatically by useCreateRevenue/useUpdateRevenue hooks
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedRevenueForDetail(null);
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return "text-red-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="min-h-screen ">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-brand-pink" />
              GESTÃO DE <span className="text-brand-cyan">RECEITAS</span>
            </h1>
            <div className="h-1.5 w-24 bg-linear-to-r from-brand-pink to-brand-cyan rounded-full" />
          </div>
          <Button
            type="button"
            onClick={handleCreateRevenue}
            className="bg-linear-to-br from-[#00aacd] to-[#EB2970] text-white rounded-xl px-6 font-bold shadow-lg shadow-pink-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Receita
          </Button>
        </div>

        {/* Estatísticas de Receitas */}
        {filters.fairId && (
          <RevenueStats
            fairId={filters.fairId}
            onTotalRevenueClick={() => setShowCashFlowModal(true)}
          />
        )}

        {/* Seção de Stands */}
        {filters.fairId && (
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Grid className="h-5 w-5" />
                  Stands da Feira
                </CardTitle>
                <div className="flex items-center gap-2">
                  <StandConfigurator
                    fairId={filters.fairId}
                    currentStandCount={standStats?.total || 0}
                    onConfigurationChange={() =>
                      setStandsRefreshKey((prev) => prev + 1)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsStandsExpanded((prev) => !prev)}
                    className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/10"
                  >
                    {isStandsExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            {isStandsExpanded && (
              <CardContent className="space-y-4">
                <StandMap
                  fairId={filters.fairId}
                  key={standsRefreshKey}
                  onCreateRevenue={handleCreateRevenueFromStand}
                />
                {standStats && (
                  <div className="flex items-center gap-6 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-sm bg-green-500/80" />
                      <span className="text-sm text-white/60">
                        Disponíveis <span className="font-bold text-white">{standStats.available}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-sm bg-red-500/80" />
                      <span className="text-sm text-white/60">
                        Ocupados <span className="font-bold text-white">{standStats.occupied}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-sm text-white/60">Ocupação</span>
                      <span
                        className={`text-sm font-black tracking-tight ${getOccupancyColor(standStats.occupancyRate)}`}
                      >
                        {standStats.occupancyRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )}

        {/* Tabela de Receitas */}
        {filters.fairId && (
          <FinanceTable
            data={revenuesData}
            isLoading={isLoadingRevenues}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onViewDetail={handleViewRevenueDetail}
            onDeleteRevenue={handleDeleteRevenue}
            isDeletingRevenue={deleteRevenueMutation.isPending}
          />
        )}

        {/* Drawer para criar/editar receita */}
        <ReceitaDrawer
          isOpen={isDrawerOpen}
          onClose={handleDrawerClose}
          revenueId={selectedRevenueId}
          fairId={filters.fairId}
          prefilledStandNumber={selectedStandNumber}
        />

        {/* Modal de detalhamento da receita */}
        <RevenueDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleDetailModalClose}
          revenueId={selectedRevenueForDetail}
          fairId={filters.fairId}
        />

        {/* Modal de fluxo de caixa */}
        {filters.fairId && (
          <CashFlowModal
            isOpen={showCashFlowModal}
            onClose={() => setShowCashFlowModal(false)}
            fairId={filters.fairId}
          />
        )}
      </div>
    </div>
  );
}
