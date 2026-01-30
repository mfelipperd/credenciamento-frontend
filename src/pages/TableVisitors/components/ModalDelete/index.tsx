import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = "Confirmar Exclusão",
  description = "Tem certeza de que deseja excluir este item? Esta ação não pode ser desfeita.",
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] bg-brand-blue mx-auto rounded-[32px] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-10 ring-1 ring-white/5">
        <DialogHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mb-2">
            <span className="text-4xl">⚠️</span>
          </div>
          <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-white/40 font-medium leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-4 mt-8 sm:mt-10">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white font-bold uppercase tracking-widest transition-all"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest shadow-lg shadow-red-900/20 transition-all active:scale-95"
            onClick={onConfirm}
          >
            Confirmar Exclusão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
