import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Building, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ControlledInput } from "@/components/ControlledInput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Account,
  CreateOverheadExpenseForm,
  UpdateOverheadExpenseForm,
  OverheadExpense,
  AllocatedOverheadExpense,
  OverheadAllocation,
} from "@/interfaces/finance";
import type { Fair } from "@/interfaces/fairs";
import { maskCurrencyBRL, unmaskCurrencyBRL } from "@/utils/masks";

const overheadExpenseSchema = z.object({
  categoria: z.string().min(1, "Categoria é obrigatória"),
  customCategoria: z.string().optional(),
  accountId: z.string().min(1, "Conta bancária é obrigatória"),
  descricao: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
  valorDisplay: z.string().min(1, "Valor é obrigatório"),
  data: z.string().min(1, "Data é obrigatória"),
  observacoes: z.string().optional(),
});

type OverheadExpenseFormData = z.infer<typeof overheadExpenseSchema>;

interface OverheadExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOverheadExpenseForm | UpdateOverheadExpenseForm) => void;
  expense?: OverheadExpense | AllocatedOverheadExpense | null;
  accounts: Account[];
  fairsList: Fair[];
  isLoading?: boolean;
}

const TYPICAL_CATEGORIES = [
  "Aluguel",
  "Pessoal",
  "Infraestrutura",
  "Fiscal",
  "Administrativo",
  "TI",
  "Viagem",
  "Outro",
];

export function OverheadExpenseForm({
  isOpen,
  onClose,
  onSubmit,
  expense,
  accounts,
  fairsList,
  isLoading = false,
}: OverheadExpenseFormProps) {
  const [selectedFairs, setSelectedFairs] = useState<Record<string, boolean>>({});
  const [fairPercentages, setFairPercentages] = useState<Record<string, number>>({});
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const form = useForm<OverheadExpenseFormData>({
    resolver: zodResolver(overheadExpenseSchema),
    defaultValues: {
      categoria: "",
      customCategoria: "",
      accountId: "",
      descricao: "",
      valorDisplay: "R$ 0,00",
      data: "",
      observacoes: "",
    },
  });

  // Preenche o formulário quando editar
  useEffect(() => {
    if (expense) {
      const initialFairs: Record<string, number> = {};
      const initialChecked: Record<string, boolean> = {};

      if ("feirasRateadas" in expense && expense.feirasRateadas) {
        (expense as AllocatedOverheadExpense).feirasRateadas.forEach((f) => {
          initialFairs[f.fairId] = parseFloat((f.percentual * 100).toFixed(2));
          initialChecked[f.fairId] = true;
        });
      } else if ("allocations" in expense && expense.allocations) {
        (expense as OverheadExpense).allocations.forEach((alloc: OverheadAllocation) => {
          initialFairs[alloc.fairId] = parseFloat(
            (alloc.percentual * 100).toFixed(2)
          );
          initialChecked[alloc.fairId] = true;
        });
      }

      setSelectedFairs(initialChecked);
      setFairPercentages(initialFairs);

      const categoryVal = expense.categoria || "";
      const isTypical = TYPICAL_CATEGORIES.includes(categoryVal);
      setIsCustomCategory(!isTypical);

      form.reset({
        categoria: isTypical ? categoryVal : "Outro",
        customCategoria: isTypical ? "" : categoryVal,
        accountId: ("accountId" in expense ? (expense as OverheadExpense).accountId : expense.account?.id) || "",
        descricao: expense.descricao || "",
        valorDisplay: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(
          "valorTotal" in expense
            ? (expense as AllocatedOverheadExpense).valorTotal
            : (expense as OverheadExpense).valor
        ),
        data: expense.data ? expense.data.split("T")[0] : "",
        observacoes: "observacoes" in expense ? (expense as OverheadExpense).observacoes || "" : "",
      });
    } else {
      setSelectedFairs({});
      setFairPercentages({});
      setIsCustomCategory(false);
      form.reset({
        categoria: "",
        customCategoria: "",
        accountId: "",
        descricao: "",
        valorDisplay: "R$ 0,00",
        data: "",
        observacoes: "",
      });
    }
  }, [expense, form, isOpen]);

  // Calcula a soma dos percentuais
  const checkedFairsCount = Object.keys(selectedFairs).filter((id) => selectedFairs[id]).length;
  const totalPercentage = Object.keys(selectedFairs)
    .filter((id) => selectedFairs[id])
    .reduce((sum, id) => sum + (fairPercentages[id] || 0), 0);

  const isPercentageSumValid = Math.abs(totalPercentage - 100) < 0.01;

  const handleFairCheckboxChange = (fairId: string, checked: boolean) => {
    setSelectedFairs((prev) => ({
      ...prev,
      [fairId]: checked,
    }));

    if (!checked) {
      setFairPercentages((prev) => {
        const next = { ...prev };
        delete next[fairId];
        return next;
      });
    } else {
      // Valor padrão inicial para o percentual se for marcado
      setFairPercentages((prev) => ({
        ...prev,
        [fairId]: 0,
      }));
    }
  };

  const handlePercentageChange = (fairId: string, value: string) => {
    const num = parseFloat(value) || 0;
    setFairPercentages((prev) => ({
      ...prev,
      [fairId]: num,
    }));
  };

  const handleDivideEqually = () => {
    const activeCheckedFairs = Object.keys(selectedFairs).filter((id) => selectedFairs[id]);
    if (activeCheckedFairs.length === 0) return;

    const baseVal = Math.floor(100 / activeCheckedFairs.length);
    const remainder = 100 - baseVal * activeCheckedFairs.length;

    const newPercentages: Record<string, number> = {};
    activeCheckedFairs.forEach((id, idx) => {
      // Adiciona o restante na última feira para garantir que feche em exatamente 100
      newPercentages[id] = baseVal + (idx === activeCheckedFairs.length - 1 ? remainder : 0);
    });

    setFairPercentages(newPercentages);
  };

  const handleSubmit = (data: OverheadExpenseFormData) => {
    if (checkedFairsCount === 0) {
      return;
    }

    if (!isPercentageSumValid) {
      return;
    }

    // Converter valor display
    const valorEmCentavos = unmaskCurrencyBRL(data.valorDisplay);
    const valorEmReais = valorEmCentavos / 100;

    const dataFormatada = data.data ? new Date(data.data).toISOString().split("T")[0] : data.data;

    const finalCategory = isCustomCategory ? data.customCategoria || "Outro" : data.categoria;

    // Objeto final formatado como a API espera (percentual em decimal de 0 a 1)
    const fairsPayload = Object.keys(selectedFairs)
      .filter((id) => selectedFairs[id])
      .map((id) => ({
        fairId: id,
        percentual: (fairPercentages[id] || 0) / 100,
      }));

    const formData = {
      categoria: finalCategory,
      accountId: data.accountId,
      descricao: data.descricao,
      valor: valorEmReais,
      data: dataFormatada,
      observacoes: data.observacoes,
      fairs: fairsPayload,
    };

    onSubmit(formData);
  };

  const handleClose = () => {
    form.reset();
    setSelectedFairs({});
    setFairPercentages({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-white/10 text-white p-0 rounded-2xl shadow-2xl">
        <DialogHeader className="relative h-24 w-full flex items-end p-6 bg-linear-to-br from-[#00aacd] to-[#EB2970] overflow-hidden rounded-t-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 w-full flex items-center justify-between">
            <DialogTitle className="text-xl font-black text-white tracking-tight">
              {expense ? "Editar Despesa Overhead" : "Nova Despesa Overhead"}
            </DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6 bg-slate-950 text-white">
          {/* Categoria e Conta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoria */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-white/60">Categoria *</Label>
              <Select
                value={form.watch("categoria")}
                onValueChange={(val) => {
                  form.setValue("categoria", val);
                  setIsCustomCategory(val === "Outro");
                }}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl focus:border-brand-pink/50 focus:ring-brand-pink/20 placeholder:text-white/20">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border border-white/10 text-white">
                  {TYPICAL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="hover:bg-white/10 cursor-pointer">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {isCustomCategory && (
                <div className="mt-2">
                  <Input
                    placeholder="Especifique a categoria"
                    {...form.register("customCategoria")}
                    className="bg-white/5 border-white/10 text-white rounded-xl text-sm"
                  />
                </div>
              )}

              {form.formState.errors.categoria && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.categoria.message}
                </p>
              )}
            </div>

            {/* Conta Bancária */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-white/60">Conta Bancária *</Label>
              <Select
                value={form.watch("accountId")}
                onValueChange={(val) => form.setValue("accountId", val)}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl focus:border-brand-pink/50 focus:ring-brand-pink/20 placeholder:text-white/20">
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border border-white/10 text-white">
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id} className="hover:bg-white/10 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-brand-cyan" />
                        {account.nomeConta}
                        {account.banco && (
                          <span className="text-xs text-white/40">
                            ({account.banco})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.accountId && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.accountId.message}
                </p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-white/60">Descrição</Label>
            <Input
              id="descricao"
              placeholder="Descrição da despesa overhead (ex: Aluguel escritório - junho 2026)"
              {...form.register("descricao")}
              className="bg-white/5 border-white/10 text-white rounded-xl focus:border-brand-pink/50 focus:ring-brand-pink/20 placeholder:text-white/20"
            />
            {form.formState.errors.descricao && (
              <p className="text-sm text-red-400">
                {form.formState.errors.descricao.message}
              </p>
            )}
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <ControlledInput
                control={form.control}
                name="valorDisplay"
                label="Valor Total (R$) *"
                placeholder="0,00"
                mask={maskCurrencyBRL}
              />
              {form.formState.errors.valorDisplay && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.valorDisplay.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-white/60" htmlFor="data">Data *</Label>
              <Input 
                id="data" 
                type="date" 
                {...form.register("data")} 
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-brand-pink/50 focus:ring-brand-pink/20 placeholder:text-white/20 h-10"
              />
              {form.formState.errors.data && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.data.message}
                </p>
              )}
            </div>
          </div>

          {/* Rateio entre feiras */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-white/60">
                Feiras que compartilham este custo *
              </Label>
              {checkedFairsCount > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDivideEqually}
                  className="border-white/10 bg-white/5 text-white/80 hover:bg-white/10 rounded-xl font-bold h-8 text-xs px-3"
                >
                  Dividir igualmente
                </Button>
              )}
            </div>

            <div className="border border-white/10 rounded-xl p-4 bg-white/3 max-h-60 overflow-y-auto space-y-3">
              {fairsList.map((fair) => {
                const isChecked = !!selectedFairs[fair.id];
                const percentage = fairPercentages[fair.id] || 0;

                return (
                  <div
                    key={fair.id}
                    className="flex items-center justify-between gap-4 p-3 bg-slate-900/40 rounded-xl border border-white/5"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        id={`fair-${fair.id}`}
                        checked={isChecked}
                        onChange={(e) =>
                          handleFairCheckboxChange(fair.id, e.target.checked)
                        }
                        className="rounded border-white/15 bg-white/5 h-4 w-4 accent-brand-pink cursor-pointer"
                      />
                      <label
                        htmlFor={`fair-${fair.id}`}
                        className="text-sm font-medium text-white/80 truncate cursor-pointer"
                      >
                        {fair.name}
                        {!fair.isActive && (
                          <span className="text-xs text-white/40 ml-2">
                            (encerrada)
                          </span>
                        )}
                      </label>
                    </div>

                    {isChecked && (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={percentage || ""}
                          placeholder="0"
                          min="0"
                          max="100"
                          onChange={(e) =>
                            handlePercentageChange(fair.id, e.target.value)
                          }
                          className="bg-white/5 border-white/10 text-white rounded-xl w-24 text-right h-9 focus:border-brand-pink/50"
                        />
                        <span className="text-sm text-white/60">%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Rodapé do Rateio com Validação */}
            <div className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-xl text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-white/60">Soma selecionada:</span>
                <span
                  className={`font-black flex items-center gap-1 text-sm ${
                    isPercentageSumValid
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {totalPercentage.toFixed(1)}%
                  {isPercentageSumValid ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                </span>
              </div>
              <span className="text-[10px] text-white/40 font-medium">
                A soma das feiras selecionadas deve ser exatamente 100%
              </span>
            </div>
            {checkedFairsCount === 0 && (
              <p className="text-sm text-red-400">
                Selecione pelo menos uma feira para compartilhar a despesa.
              </p>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-white/60">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações adicionais (opcional)"
              rows={3}
              {...form.register("observacoes")}
              className="bg-white/5 border-white/10 text-white rounded-xl focus:border-brand-pink/50 focus:ring-brand-pink/20 placeholder:text-white/20"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="border-white/10 bg-white/5 text-white/80 hover:bg-white/10 rounded-xl font-bold h-11"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || checkedFairsCount === 0 || !isPercentageSumValid}
              className="bg-linear-to-br from-[#00aacd] to-[#EB2970] text-white rounded-xl px-6 font-bold shadow-lg shadow-pink-500/20 transition-all hover:scale-105 active:scale-95 h-11 border-none cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </div>
              ) : expense ? (
                "Atualizar Despesa Overhead"
              ) : (
                "Criar Despesa Overhead"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
