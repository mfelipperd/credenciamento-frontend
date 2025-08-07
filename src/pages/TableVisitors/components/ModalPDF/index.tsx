import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Visitor } from "@/interfaces/visitors";
import PdfVisitorsReport from "../PDFComponent";
import { File } from "lucide-react";
import { PDFViewer } from "@react-pdf/renderer";

interface ExportModalPDFProps {
  open?: boolean;
  onOpenChange?: () => void;
  data: Visitor[];
}

const ITEMS_PER_BATCH = 100;

export const ExportModalPDF = ({ data, ...props }: ExportModalPDFProps) => {
  const [shownCount, setShownCount] = useState(() =>
    Math.min(ITEMS_PER_BATCH, data.length)
  );

  const canLoadMore = shownCount < data.length;
  const visibleData = data.slice(0, shownCount);

  function handleLoadMore() {
    setShownCount((prev) => Math.min(prev + ITEMS_PER_BATCH, data.length));
  }

  return (
    <Dialog {...props}>
      <DialogTrigger asChild>
        <Button
          className="w-full sm:w-auto px-4 sm:px-6 bg-purple-500 rounded-full text-white hover:bg-purple-600 transition-colors shadow-sm"
          disabled={data.length === 0}
        >
          <File className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">Exportar PDF</span>
          <span className="sm:hidden">PDF</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] overflow-hidden flex flex-col mx-auto my-2">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <DialogTitle className="text-lg font-semibold">
            Exportar PDF
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Você pode exportar os dados da tabela em formato PDF.
          </DialogDescription>
        </DialogHeader>

        {/* Botão de Carregar Mais */}
        {canLoadMore && (
          <div className="px-2 sm:px-4 mb-2">
            <Button
              onClick={handleLoadMore}
              className="w-full sm:w-auto px-4 sm:px-6 bg-orange-500 rounded-full text-white hover:bg-orange-600 transition-colors text-sm"
            >
              Carregar mais ({shownCount}/{data.length})
            </Button>
          </div>
        )}

        <div className="flex-1 min-h-0">
          <PDFViewer
            key={shownCount}
            className="w-full h-full border rounded-lg"
          >
            {/* 
              A chave (key) força remount toda vez que shownCount muda,
              garantindo que o PDFRenderer recompute as páginas.
            */}
            <PdfVisitorsReport data={visibleData} />
          </PDFViewer>
        </div>
      </DialogContent>
    </Dialog>
  );
};
