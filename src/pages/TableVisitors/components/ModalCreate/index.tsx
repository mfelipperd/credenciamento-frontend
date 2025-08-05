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
      <DialogContent className="max-w-2xl bg-neutral-100 min-w-[50rem] ">
        <DialogHeader>
          <DialogTitle>Cadastrar Participante</DialogTitle>
        </DialogHeader>
        <FormularioCredenciamento />
      </DialogContent>
    </Dialog>
  );
};
