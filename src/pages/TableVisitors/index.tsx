import { CardRoot } from "@/components/Card";
import { VisitorTable } from "./components/Table";
import { useTableVisitorsController } from "./tableVisitors.controller";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { ModalCreateFormPrivate } from "./components/ModalCreate";
import { ExportModalPDF } from "./components/ModalPDF";
import { Pagination } from "./components/Pagination";
import { TableSkeleton } from "@/components/ui/skeleton";

export const TabeleVisitors = () => {
  const controller = useTableVisitorsController();
  const [searchParams] = useSearchParams();
  const fairId = searchParams.get("fairId");

  const handleClick = () => {
    if (!fairId) {
      return alert("ID da feira não encontrado na URL");
    }
    controller.handleCreateForm();
  };

  return (
    <div className="space-y-4">
      <CardRoot className="bg-white">
        <>
          <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Pesquisar por nome, email, empresa, código..."
                  value={controller.search}
                  onChange={(e) => controller.setSearch(e.target.value)}
                  className="flex-1 sm:max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
                <select
                  value={controller.searchField}
                  onChange={(e) => controller.setSearchField(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="all">Todos os campos</option>
                  <option value="name">Nome</option>
                  <option value="email">Email</option>
                  <option value="company">Empresa</option>
                  <option value="phone">Telefone</option>
                  <option value="registrationCode">Código</option>
                </select>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">
                  {controller.loading
                    ? "Carregando..."
                    : controller.paginationMeta
                    ? `${controller.paginationMeta.totalItems} visitante${
                        controller.paginationMeta.totalItems !== 1 ? "s" : ""
                      } encontrado${
                        controller.paginationMeta.totalItems !== 1 ? "s" : ""
                      } (página ${controller.paginationMeta.page} de ${
                        controller.paginationMeta.totalPages
                      })`
                    : `${controller.totalItems} visitante${
                        controller.totalItems !== 1 ? "s" : ""
                      } encontrado${controller.totalItems !== 1 ? "s" : ""}`}
                </span>

                {controller.search && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    Busca:{" "}
                    {controller.searchField === "all"
                      ? "geral"
                      : controller.searchField === "name"
                      ? "nome"
                      : controller.searchField === "email"
                      ? "email"
                      : controller.searchField === "company"
                      ? "empresa"
                      : controller.searchField === "phone"
                      ? "telefone"
                      : controller.searchField === "registrationCode"
                      ? "código"
                      : controller.searchField}
                  </span>
                )}
                {controller.paginationMeta && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    🚀 Busca Otimizada
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-3">
              <ExportModalPDF data={controller.filteredData} />
              <Button
                type="button"
                onClick={handleClick}
                className="w-full sm:w-auto px-4 sm:px-6 bg-orange-500 rounded-full text-white hover:bg-orange-600 transition-colors shadow-sm"
              >
                <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Cadastrar Participante</span>
                <span className="sm:hidden">Cadastrar</span>
              </Button>
            </div>
          </div>

          {controller.loading ? (
            <TableSkeleton />
          ) : (
            <VisitorTable {...controller} />
          )}
        </>
      </CardRoot>

      {/* Componente de paginação */}
      {!controller.loading && controller.totalPages > 1 && (
        <Pagination
          currentPage={controller.currentPage}
          totalPages={controller.totalPages}
          onPageChange={controller.setCurrentPage}
          totalItems={controller.totalItems}
          itemsPerPage={controller.itemsPerPage}
        />
      )}

      <ModalCreateFormPrivate
        onOpenChange={controller.handleCreateForm}
        open={controller.openCreateForm}
      />
    </div>
  );
};
