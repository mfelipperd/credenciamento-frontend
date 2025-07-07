import { CardRoot } from "@/components/Card";
import { VisitorTable } from "./components/Table";
import { useTableVisitorsController } from "./tableVisitors.controller";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { ModalCreateFormPrivate } from "./components/ModalCreate";
import { ExportModalPDF } from "./components/ModalPDF";

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
    <div>
      <CardRoot className="h-[60vh] lg:h-[70vh] scrollable-content relative bg-white ">
        <>
          <div className="w-full flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Pesquisar..."
              value={controller.search}
              onChange={(e) => controller.setSearch(e.target.value)}
              className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
            />
            <div className="flex items-center gap-2">
              <ExportModalPDF data={controller.filteredData} />

              <Button
                type="button"
                onClick={handleClick}
                className="px-6 bg-orange-500 rounded-full text-white hover:bg-orange-600 transition-colors mb-4 cursor-pointer"
              >
                <Plus />
                Cadastrar Participante
              </Button>
            </div>
          </div>
          <VisitorTable {...controller} />
        </>
      </CardRoot>
      <ModalCreateFormPrivate
        onOpenChange={controller.handleCreateForm}
        open={controller.openCreateForm}
      />
    </div>
  );
};
