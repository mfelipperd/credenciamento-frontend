import { CardRoot } from "@/components/Card";
import { VisitorTable } from "./components/Table";
import { useTableVisitorsController } from "./tableVisitors.controller";
import { Button } from "@/components/ui/button";
import { Plus, Download, Users, BarChart3 } from "lucide-react";
import { useSearchParams } from "@/hooks/useSearchParams";
import { ModalCreateFormPrivate } from "./components/ModalCreate";
import { Pagination } from "./components/Pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lazy, Suspense } from "react";
import { LogoLoading } from "@/components/LogoLoading";

const DashboardAnalytics = lazy(() =>
  import("@/pages/Dashboard/components/DashboardAnalytics").then((m) => ({
    default: m.DashboardAnalytics,
  }))
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
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs defaultValue="participants">
        {/* Cabeçalho: título à esquerda, tabs centralizado — mesma linha */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4 mb-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
              Gestão de <span className="text-brand-pink">Participantes</span>
            </h2>
            <div className="h-1.5 w-20 bg-linear-to-r from-brand-pink to-brand-cyan rounded-full" />
          </div>
          <TabsList className="bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
            <TabsTrigger
              value="participants"
              className="rounded-xl flex items-center gap-2 px-5 py-2 text-xs font-black uppercase tracking-wider data-[state=active]:bg-brand-pink data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-brand-pink/30 text-white/50 transition-all"
            >
              <Users className="w-3.5 h-3.5" />
              Participantes
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="rounded-xl flex items-center gap-2 px-5 py-2 text-xs font-black uppercase tracking-wider data-[state=active]:bg-brand-pink data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-brand-pink/30 text-white/50 transition-all"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Dashboard
            </TabsTrigger>
          </TabsList>
          <div className="flex items-end justify-end gap-3">
            <Button
              type="button"
              onClick={controller.handleExportPdf}
              disabled={controller.isExporting}
              className="h-10 px-5 bg-white/10 border border-white/20 rounded-2xl text-white text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Download className={`mr-2 h-4 w-4 ${controller.isExporting ? "animate-bounce" : ""}`} />
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
        <TabsContent value="participants" className="mt-0">
          <CardRoot className="bg-brand-blue border-white/5 glass-card rounded-[40px] shadow-2xl overflow-hidden p-4 lg:p-6">
            <div className="w-full flex flex-col gap-4">
              {/* Filtros */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1 group">
                    <input
                      type="text"
                      placeholder="Pesquisar por nome, email, empresa, código..."
                      value={controller.search}
                      onChange={(e) => controller.setSearch(e.target.value)}
                      className="w-full h-14 pl-6 pr-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-brand-pink/20 transition-all font-bold text-white placeholder:text-white/20 outline-none"
                    />
                  </div>
                  <select
                    value={controller.searchField}
                    onChange={(e) => controller.setSearchField(e.target.value)}
                    className="h-14 px-6 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-brand-pink/20 transition-all font-bold text-white outline-none cursor-pointer appearance-none md:min-w-[200px]"
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

                <div className="flex flex-wrap items-center gap-4 p-4 bg-white/2 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse shadow-[0_0_10px_rgba(0,170,205,0.8)]" />
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">
                      {controller.loading
                        ? "Sincronizando..."
                        : `${controller.totalItems || 0} Encontrados`}
                    </span>
                  </div>

                  {controller.search && (
                    <div className="px-3 py-1 bg-brand-pink/10 border border-brand-pink/20 text-brand-pink rounded-full text-[9px] font-black uppercase tracking-widest">
                      Filtro Ativo: {controller.searchField === "all" ? "Geral" : controller.searchField}
                    </div>
                  )}

                  {controller.paginationMeta && (
                    <div className="px-3 py-1 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                      <span className="animate-bounce">🚀</span> Busca Otimizada
                    </div>
                  )}
                </div>
              </div>

              {/* Tabela */}
              {controller.loading ? (
                <TableSkeleton />
              ) : (
                <VisitorTable {...controller} />
              )}
            </div>
          </CardRoot>

          {/* Paginação */}
          {!controller.loading && controller.totalPages > 1 && (
            <Pagination
              currentPage={controller.currentPage}
              totalPages={controller.totalPages}
              onPageChange={controller.setCurrentPage}
              totalItems={controller.totalItems}
              itemsPerPage={controller.itemsPerPage}
            />
          )}
        </TabsContent>

        {/* Tab: Dashboard — carregado apenas quando clicado */}
        <TabsContent value="analytics" className="mt-0">
          <Suspense fallback={<div className="flex justify-center py-20"><LogoLoading size={60} /></div>}>
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
