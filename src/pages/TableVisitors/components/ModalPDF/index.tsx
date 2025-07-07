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
      <DialogTrigger>
        <Button
          className="px-6 bg-purple-500 rounded-full text-white hover:bg-purple-600 transition-colors mb-4 cursor-pointer"
          disabled={data.length === 0}
        >
          <File /> Exportar PDF
        </Button>
      </DialogTrigger>

      <DialogContent className="min-w-fit bg-white h-[80vh] overflow-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>Exportar PDF</DialogTitle>
          <DialogDescription>
            Você pode exportar os dados da tabela em formato PDF.
          </DialogDescription>
        </DialogHeader>

        {/* Botão de Carregar Mais */}
        {canLoadMore && (
          <div className="px-4 mb-2">
            <Button
              onClick={handleLoadMore}
              className="px-6 bg-orange-500 rounded-full text-white hover:bg-orange-600 transition-colors mb-4 cursor-pointer"
            >
              Carregar mais ({shownCount}/{data.length})
            </Button>
          </div>
        )}

        <div className="flex-1">
          <PDFViewer key={shownCount} className="w-full h-full">
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
