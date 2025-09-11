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
import { useCreateWithdrawal, usePartnerMe } from "@/hooks/usePartners";
import { toast } from "sonner";
import type { CreateWithdrawalForm } from "@/interfaces/partners";

const withdrawalSchema = z.object({
  amount: z.number().min(0.01, "Valor deve ser maior que R$ 0,01"),
  reason: z.string().min(5, "Motivo deve ter pelo menos 5 caracteres"),
  bankDetails: z.string().min(10, "Dados bancários devem ter pelo menos 10 caracteres"),
  notes: z.string().optional(),
});

interface WithdrawalFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawalForm({ isOpen, onClose }: WithdrawalFormProps) {
  const { data: partner } = usePartnerMe();
  const createWithdrawalMutation = useCreateWithdrawal();

  const form = useForm<CreateWithdrawalForm>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 0,
      reason: "",
      bankDetails: "",
      notes: "",
    },
  });

  const onSubmit = async (data: CreateWithdrawalForm) => {
    if (!partner) {
      toast.error("Dados do sócio não encontrados");
      return;
    }

    // Validar se o valor não excede o saldo disponível
    if (data.amount > partner.availableBalance) {
      toast.error("Valor solicitado excede o saldo disponível");
      return;
    }

    try {
      await createWithdrawalMutation.mutateAsync({
        partnerId: partner.id,
        data,
      });
      toast.success("Solicitação de saque enviada com sucesso");
      form.reset();
      onClose();
    } catch (error) {
      toast.error("Erro ao solicitar saque");
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "R$ 0,00";
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value));
  };

  const isLoading = createWithdrawalMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Solicitar Saque</DialogTitle>
        </DialogHeader>

        {/* Informações do Saldo */}
        {partner && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Saldo Disponível
            </h4>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(partner.availableBalance)}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Porcentagem de participação: {partner.percentage ? Number(partner.percentage).toFixed(1) : "0.0"}%
            </p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Saque</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={partner?.availableBalance || 0}
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <div className="text-sm text-gray-500">
                    Máximo: {formatCurrency(partner?.availableBalance || 0)}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo do Saque</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Retirada mensal de lucros, emergência, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dados Bancários</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Banco: 001, Agência: 1234, Conta: 56789-0, Titular: João Silva Santos"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="text-sm text-gray-500">
                    Inclua banco, agência, conta e nome do titular
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais sobre o saque..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                ⚠️ Importante
              </h4>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                <li>• O saque será analisado por um administrador</li>
                <li>• Você receberá uma notificação quando aprovado ou rejeitado</li>
                <li>• Verifique se os dados bancários estão corretos</li>
                <li>• O processamento pode levar até 2 dias úteis</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || !partner}>
                {isLoading ? "Enviando..." : "Solicitar Saque"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
