import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateWithdrawal, usePartnerFinancialSummary } from "@/hooks/useWithdrawals";
import { DollarSign, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const withdrawalSchema = z.object({
  amount: z
    .number({ required_error: "Valor é obrigatório" })
    .min(0.01, "Valor mínimo é R$ 0,01")
    .max(999999.99, "Valor máximo é R$ 999.999,99"),
  reason: z.string().optional(),
  bankDetails: z.string().min(1, "Dados bancários são obrigatórios"),
  notes: z.string().optional(),
});

type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

interface WithdrawalFormProps {
  partnerId: string;
  onSuccess?: () => void;
}

export const WithdrawalForm: React.FC<WithdrawalFormProps> = ({ partnerId, onSuccess }) => {
  const { data: summary } = usePartnerFinancialSummary(partnerId);
  const createWithdrawalMutation = useCreateWithdrawal();

  const form = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 0,
      reason: "",
      bankDetails: "",
      notes: "",
    },
  });

  const onSubmit = async (data: WithdrawalFormData) => {
    try {
      await createWithdrawalMutation.mutateAsync({
        partnerId,
        data,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const availableBalance = summary?.availableBalance || 0;
  const maxAmount = Math.min(availableBalance, 999999.99);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Solicitar Saque
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Saldo Disponível */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Saldo Disponível:
              </span>
              <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(availableBalance)}
              </span>
            </div>
          </div>

          {/* Valor do Saque */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor do Saque *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={maxAmount}
              placeholder="0,00"
              {...form.register("amount", { valueAsNumber: true })}
              className={form.formState.errors.amount ? "border-red-500" : ""}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-red-500">
                {form.formState.errors.amount.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Valor mínimo: R$ 0,01 | Valor máximo: {formatCurrency(maxAmount)}
            </p>
          </div>

          {/* Motivo do Saque */}
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo do Saque (Opcional)</Label>
            <Input
              id="reason"
              placeholder="Ex: Retirada mensal de lucros"
              {...form.register("reason")}
            />
          </div>

          {/* Dados Bancários */}
          <div className="space-y-2">
            <Label htmlFor="bankDetails">Dados Bancários *</Label>
            <Textarea
              id="bankDetails"
              placeholder="Banco: 001, Agência: 1234, Conta: 56789-0, CPF: 123.456.789-00"
              rows={3}
              {...form.register("bankDetails")}
              className={form.formState.errors.bankDetails ? "border-red-500" : ""}
            />
            {form.formState.errors.bankDetails && (
              <p className="text-sm text-red-500">
                {form.formState.errors.bankDetails.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Inclua banco, agência, conta e CPF para processamento
            </p>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (Opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Informações adicionais sobre o saque"
              rows={2}
              {...form.register("notes")}
            />
          </div>

          {/* Alertas */}
          {availableBalance === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Você não possui saldo disponível para saque. Aguarde a distribuição de lucros.
              </AlertDescription>
            </Alert>
          )}

          {availableBalance > 0 && availableBalance < 100 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Seu saldo está baixo. Considere aguardar mais distribuições de lucro.
              </AlertDescription>
            </Alert>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={createWithdrawalMutation.isPending || availableBalance === 0}
              className="flex-1"
            >
              {createWithdrawalMutation.isPending ? "Enviando..." : "Solicitar Saque"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={createWithdrawalMutation.isPending}
            >
              Limpar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};