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
          className="w-full sm:w-auto px-6 h-12 bg-white/5 hover:bg-white/10 text-brand-cyan border border-white/10 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
          disabled={data.length === 0}
        >
          <File className="mr-3 h-5 w-5 shrink-0" />
          Exportar PDF
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[98vw] sm:min-w-[70vw] sm:max-w-6xl bg-brand-blue h-[92vh] overflow-hidden flex flex-col mx-auto rounded-[32px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] p-0 ring-1 ring-white/5">
        <DialogHeader className="p-8 border-b border-white/5 bg-white/2">
          <div className="flex flex-col gap-1">
             <span className="text-brand-cyan font-black text-[10px] uppercase tracking-[0.4em]">Relatório de Visitantes</span>
             <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">
               Exportação Consolidada
             </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-white/40 font-medium">
             Prepare e revise os dados para geração do arquivo PDF oficial.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col p-6 space-y-6">
          {canLoadMore && (
            <div className="flex items-center justify-center p-4 bg-brand-orange/5 border border-brand-orange/20 rounded-2xl group transition-all hover:bg-brand-orange/10">
              <Button
                onClick={handleLoadMore}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl px-10 font-black uppercase tracking-widest shadow-lg shadow-brand-orange/20 transition-all active:scale-95"
              >
                Carregar Próximo Lote ({shownCount}/{data.length})
              </Button>
            </div>
          )}

          <div className="flex-1 relative glass-card rounded-2xl border border-white/10 overflow-hidden shadow-inner bg-black/40">
            <PDFViewer
              key={shownCount}
              className="w-full h-full invert-[0.05] grayscale-[0.2]"
              showToolbar={true}
            >
              <PdfVisitorsReport data={visibleData} />
            </PDFViewer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
