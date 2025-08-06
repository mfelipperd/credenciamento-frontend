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
      <DialogContent className="w-[95vw] max-w-2xl bg-neutral-100 mx-auto my-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-800">
            Cadastrar Participante
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <FormularioCredenciamento />
        </div>
      </DialogContent>
    </Dialog>
  );
};
