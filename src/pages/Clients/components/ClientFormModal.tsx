import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ControlledInput } from "@/components/ControlledInput";
import type { Client } from "@/interfaces/finance";

const clientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  responsavel: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => void;
  isPending: boolean;
  editingClient?: Client | null;
}

export function ClientFormModal({
  open,
  onClose,
  onSubmit,
  isPending,
  editingClient,
}: ClientFormModalProps) {
  const isEditing = !!editingClient;

  const { control, handleSubmit, reset } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      email: "",
      phone: "",
      responsavel: "",
    },
  });

  useEffect(() => {
    if (editingClient) {
      reset({
        name: editingClient.name,
        cnpj: editingClient.cnpj ?? "",
        email: editingClient.email ?? "",
        phone: editingClient.phone ?? "",
        responsavel: editingClient.responsavel ?? "",
      });
    } else {
      reset({ name: "", cnpj: "", email: "", phone: "", responsavel: "" });
    }
  }, [editingClient, open, reset]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-black tracking-tighter">
            {isEditing ? "Editar Expositor" : "Novo Expositor"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <ControlledInput
            control={control}
            name="name"
            label="Nome / Razão Social *"
            placeholder="Empresa X Ltda"
          />
          <div className="grid grid-cols-2 gap-4">
            <ControlledInput
              control={control}
              name="cnpj"
              label="CNPJ / CPF"
              placeholder="00.000.000/0001-00"
            />
            <ControlledInput
              control={control}
              name="phone"
              label="Telefone"
              placeholder="(00) 00000-0000"
            />
          </div>
          <ControlledInput
            control={control}
            name="email"
            label="Email"
            type="email"
            placeholder="contato@empresa.com"
          />
          <ControlledInput
            control={control}
            name="responsavel"
            label="Responsável"
            placeholder="Nome do contato"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-linear-to-br from-[#00aacd] to-[#EB2970] text-white font-bold"
            >
              {isPending ? "Salvando..." : isEditing ? "Salvar" : "Criar Expositor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
