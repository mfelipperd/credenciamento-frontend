import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormularioCredenciamento } from "@/pages/PrivateForm/FormCreateVisitor";

export const ModalCreateFormPrivate = ({
  ...props
}: {
  open: boolean;
  onOpenChange: () => void;
}) => {
  return (
    <Dialog {...props}>
      <DialogContent className="w-[98vw] sm:min-w-[80vw] sm:max-w-7xl bg-brand-blue mx-auto my-4 max-h-[96vh] overflow-y-auto rounded-[40px] p-0 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
        <DialogHeader className="p-6 border-b border-white/5 bg-white/2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">
                Credenciamento
              </DialogTitle>
              <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">
                Painel Administrativo • Expo Multi Mix
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
               <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Sistema Ativo</span>
            </div>
          </div>
        </DialogHeader>
        <div className="p-6">
          <FormularioCredenciamento />
        </div>
      </DialogContent>
    </Dialog>
  );
};
