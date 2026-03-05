import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateFairPartner, useUpdateFairPartner, useAvailablePercentage } from "@/hooks/useFairPartners";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { EUserRole } from "@/enums/user.enum";

import type { FairPartner, CreateFairPartnerForm } from "@/interfaces/fair-partners";

const createFairPartnerSchema = z.object({
  fairId: z.string().min(1, "ID da feira é obrigatório"),
  partnerId: z.string().min(1, "Sócio é obrigatório"),
  percentage: z.number().min(0.1, "Porcentagem deve ser maior que 0").max(100, "Porcentagem não pode ser maior que 100"),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});

interface FairPartnerFormProps {
  isOpen: boolean;
  onClose: () => void;
  partner?: FairPartner | null;
  mode: "create" | "edit";
  fairId: string;
}

export function FairPartnerForm({ isOpen, onClose, partner, mode, fairId }: FairPartnerFormProps) {
  const [maxPercentage, setMaxPercentage] = useState(100);
  const auth = useAuth();
  
  const createMutation = useCreateFairPartner();
  const updateMutation = useUpdateFairPartner();
  const { data: availablePercentage } = useAvailablePercentage(fairId);
  const { data: users } = useUsers({ role: "partner", isActive: true });

  const form = useForm<CreateFairPartnerForm>({
    resolver: zodResolver(createFairPartnerSchema),
    defaultValues: {
      fairId: fairId,
      partnerId: "",
      percentage: 0,
      isActive: true,
      notes: "",
    },
  });

  // Atualizar maxPercentage quando availablePercentage mudar
  useEffect(() => {
    if (availablePercentage) {
      setMaxPercentage(availablePercentage.availablePercentage);
    }
  }, [availablePercentage]);

  // Preencher formulário quando editando
  useEffect(() => {
    if (partner && mode === "edit") {
      form.reset({
        fairId: partner.fairId,
        partnerId: partner.partnerId,
        percentage: partner.percentage,
        isActive: partner.isActive,
        notes: partner.notes || "",
      });
    } else {
      form.reset({
        fairId: fairId,
        partnerId: "",
        percentage: 0,
        isActive: true,
        notes: "",
      });
    }
  }, [partner, mode, fairId, form]);

  const onSubmit = async (data: CreateFairPartnerForm) => {
    try {
      if (mode === "create") {
        await createMutation.mutateAsync(data);
        // toast.success removido - já está no hook
      } else if (partner) {
        await updateMutation.mutateAsync({
          id: partner.id,
          data: {
            percentage: data.percentage,
            isActive: data.isActive,
            notes: data.notes,
          },
        });
        // toast.success removido - já está no hook
      }
      onClose();
    } catch (error) {
      // toast.error removido - já está no hook
    }
  };

  // Verificar se o usuário é admin
  const isAdmin = auth?.user?.role === EUserRole.ADMIN;

  if (!isAdmin) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acesso Negado</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-400">
              Apenas administradores podem gerenciar associações de sócios.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {mode === "create" ? "Associar Sócio à Feira" : "Editar Associação"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="partnerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Sócio</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Selecione um sócio</option>
                      {users?.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} - {user.email}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">
                    Porcentagem (Máximo: {maxPercentage.toFixed(1)}%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max={maxPercentage}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Observações sobre a associação..."
                      className="text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded"
                    />
                  </FormControl>
                  <FormLabel className="text-white">Ativo</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending 
                  ? "Salvando..." 
                  : mode === "create" ? "Associar" : "Atualizar"
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
