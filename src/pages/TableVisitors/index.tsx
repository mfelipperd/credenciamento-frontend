import { VisitorTable } from "./components/Table";
import { useTableVisitorsController } from "./tableVisitors.controller";
import { Button } from "@/components/ui/button";
import { Plus, Download, Users, BarChart3 } from "lucide-react";
import { useSearchParams } from "@/hooks/useSearchParams";
import { ModalCreateFormPrivate } from "./components/ModalCreate";
import { Pagination } from "./components/Pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PageTabsList, PageTabsTrigger } from "@/components/ui/page-tabs";
import { lazy, Suspense } from "react";
import { LogoLoading } from "@/components/LogoLoading";

const DashboardAnalytics = lazy(() =>
  import("@/pages/Dashboard/components/DashboardAnalytics").then((m) => ({
    default: m.DashboardAnalytics,
  })),
);

export const TableVisitors = () => {
  const controller = useTableVisitorsController();
  const [, , fairId] = useSearchParams();

  const handleClick = () => {
    if (!fairId) {
      return alert("ID da feira não encontrado na URL");
    }
    controller.handleCreateForm();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Tabs
        defaultValue="participants"
        className="flex-1 flex flex-col min-h-0"
      >
        {/* Cabeçalho: título à esquerda, tabs centralizado, botões à direita */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4 shrink-0 mb-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
              Gestão de <span className="text-brand-pink">Participantes</span>
            </h2>
            <div className="h-1.5 w-20 bg-linear-to-r from-brand-pink to-brand-cyan rounded-full" />
          </div>
          <PageTabsList>
            <PageTabsTrigger value="participants">
              <Users className="w-3.5 h-3.5" />
              Participantes
            </PageTabsTrigger>
            <PageTabsTrigger value="analytics">
              <BarChart3 className="w-3.5 h-3.5" />
              Dashboard
            </PageTabsTrigger>
          </PageTabsList>
          <div className="flex items-end justify-end gap-3">
            <Button
              type="button"
              onClick={controller.handleExportPdf}
              disabled={controller.isExporting}
              className="h-10 px-5 bg-white/10 border border-white/20 rounded-2xl text-white text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Download
                className={`mr-2 h-4 w-4 ${controller.isExporting ? "animate-bounce" : ""}`}
              />
              {controller.isExporting ? "Gerando..." : "Exportar PDF"}
            </Button>
            <Button
              type="button"
              onClick={handleClick}
              className="h-10 px-5 bg-brand-pink rounded-2xl text-white text-xs font-black uppercase tracking-widest hover:bg-brand-pink/90 transition-all shadow-lg shadow-brand-pink/20 active:scale-[0.98] cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Novo
            </Button>
          </div>
        </div>

        {/* Tab: Participantes */}
        <TabsContent
          value="participants"
          className="mt-0 flex-1 flex flex-col min-h-0"
        >
          {/* Card — cresce para preencher o espaço, somente a tabela faz scroll */}
          <div className="glass-card rounded-[40px] shadow-2xl overflow-hidden p-4 lg:p-6 flex flex-col flex-1 min-h-0">
            <div className="flex flex-col gap-3 flex-1 min-h-0">
              {/* ── Filtros (altura fixa, linha única) ── */}
              <div className="flex items-center gap-2 shrink-0 h-11">
                {/* Busca + contador */}
                <div className="flex flex-1 h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-pink/20 transition-all min-w-0">
                  <div className="flex items-center pl-4 pr-3 border-r border-white/5 shrink-0 gap-1.5">
                    {controller.loading ? (
                      <div className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-pulse" />
                    ) : (
                      <div className="w-1.5 h-1.5 bg-brand-cyan/50 rounded-full" />
                    )}
                    <span className="text-[9px] text-white/30 font-black uppercase tracking-widest whitespace-nowrap tabular-nums">
                      {controller.loading ? "..." : `${controller.totalItems || 0}`}
                    </span>
                    {controller.paginationMeta && (
                      <span className="text-[8px] text-brand-cyan/60 font-black uppercase tracking-widest ml-1">⚡</span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Pesquisar..."
                    value={controller.search}
                    onChange={(e) => controller.setSearch(e.target.value)}
                    className="flex-1 h-full px-3 bg-transparent outline-none font-bold text-white placeholder:text-white/20 text-sm min-w-0"
                  />
                </div>

                {/* De */}
                <div className="flex h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-cyan/20 transition-all shrink-0">
                  <div className="flex items-center pl-3 pr-2 border-r border-white/5 shrink-0">
                    <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">De</span>
                  </div>
                  <input
                    type="date"
                    value={controller.dateFrom}
                    onChange={(e) => controller.setDateFrom(e.target.value)}
                    className="h-full px-2 bg-transparent outline-none text-white/70 text-xs font-bold scheme-dark w-32"
                  />
                  {controller.dateFrom && (
                    <button type="button" onClick={() => controller.setDateFrom("")} className="px-2 text-white/20 hover:text-white/60 transition-colors text-xs">×</button>
                  )}
                </div>

                {/* Até */}
                <div className="flex h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-cyan/20 transition-all shrink-0">
                  <div className="flex items-center pl-3 pr-2 border-r border-white/5 shrink-0">
                    <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">Até</span>
                  </div>
                  <input
                    type="date"
                    value={controller.dateTo}
                    onChange={(e) => controller.setDateTo(e.target.value)}
                    className="h-full px-2 bg-transparent outline-none text-white/70 text-xs font-bold scheme-dark w-32"
                  />
                  {controller.dateTo && (
                    <button type="button" onClick={() => controller.setDateTo("")} className="px-2 text-white/20 hover:text-white/60 transition-colors text-xs">×</button>
                  )}
                </div>

                {/* Limpar datas */}
                {(controller.dateFrom || controller.dateTo) && (
                  <button
                    type="button"
                    onClick={() => { controller.setDateFrom(""); controller.setDateTo(""); }}
                    className="h-full px-3 bg-white/5 border border-white/10 rounded-2xl text-white/30 hover:text-white/60 text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0"
                  >
                    Limpar
                  </button>
                )}

                {/* Select de campo */}
                <select
                  value={controller.searchField}
                  onChange={(e) => controller.setSearchField(e.target.value)}
                  className="h-full px-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-brand-pink/20 transition-all font-bold text-white text-xs outline-none cursor-pointer appearance-none shrink-0"
                  aria-label="Filtrar por campo"
                  title="Filtrar por campo"
                >
                  <option value="all" className="bg-brand-blue">Todos os campos</option>
                  <option value="name" className="bg-brand-blue">Nome</option>
                  <option value="email" className="bg-brand-blue">Email</option>
                  <option value="company" className="bg-brand-blue">Empresa</option>
                  <option value="phone" className="bg-brand-blue">Telefone</option>
                  <option value="registrationCode" className="bg-brand-blue">Código</option>
                </select>
              </div>

              {/* ── Tabela (cresce, faz scroll interno) ── */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                {controller.loading ? (
                  <TableSkeleton />
                ) : (
                  <VisitorTable {...controller} />
                )}
              </div>
            </div>
          </div>

          {/* Paginação fora do card */}
          {!controller.loading && controller.totalPages > 1 && (
            <div className="shrink-0 mt-3">
              <Pagination
                currentPage={controller.currentPage}
                totalPages={controller.totalPages}
                onPageChange={controller.setCurrentPage}
                totalItems={controller.totalItems}
                itemsPerPage={controller.itemsPerPage}
              />
            </div>
          )}
        </TabsContent>

        {/* Tab: Dashboard */}
        <TabsContent value="analytics" className="mt-0 flex-1 overflow-y-auto">
          <Suspense
            fallback={
              <div className="flex justify-center py-20">
                <LogoLoading size={60} />
              </div>
            }
          >
            <DashboardAnalytics />
          </Suspense>
        </TabsContent>
      </Tabs>

      <ModalCreateFormPrivate
        onOpenChange={controller.handleCreateForm}
        open={controller.openCreateForm}
      />
    </div>
  );
};
