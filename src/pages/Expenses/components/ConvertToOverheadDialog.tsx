import { useState, useEffect } from "react";
import {
  AlertCircle,
  ArrowRightLeft,
  Check,
  DollarSign,
  SlidersHorizontal,
  Trash2,
  Tag,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Expense } from "@/interfaces/finance";
import type { FinanceCategory } from "@/interfaces/categories";
import type { Fair } from "@/interfaces/fairs";

export interface ConvertToOverheadPayload {
  financeCategoryId?: string;
  /** Omitir `percentual` por item faz o backend dividir igualmente */
  fairs: Array<{ fairId: string; percentual?: number }>;
}

interface ConvertToOverheadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  fairs: Fair[];
  overheadCategories: FinanceCategory[];
  onConfirm: (expenseId: string, payload: ConvertToOverheadPayload) => void;
  isLoading: boolean;
  /** ID da feira atual — pré-selecionada ao abrir */
  currentFairId?: string;
}

export function ConvertToOverheadDialog({
  isOpen,
  onClose,
  expense,
  fairs,
  overheadCategories,
  onConfirm,
  isLoading,
  currentFairId,
}: ConvertToOverheadDialogProps) {
  const [selectedFairs, setSelectedFairs] = useState<Record<string, boolean>>({});
  const [fairPercentages, setFairPercentages] = useState<Record<string, number>>({});
  const [financeCategoryId, setFinanceCategoryId] = useState<string>("");
  /**
   * false = Automático: backend divide igualmente (não envia percentual)
   * true  = Manual: usuário define os percentuais explicitamente
   */
  const [manualMode, setManualMode] = useState(false);

  // Reset ao abrir — pré-seleciona a feira corrente
  useEffect(() => {
    if (isOpen && expense) {
      const initialSelected: Record<string, boolean> = {};
      if (currentFairId) initialSelected[currentFairId] = true;
      setSelectedFairs(initialSelected);
      setFairPercentages({});
      setFinanceCategoryId("");
      setManualMode(false);
    }
  }, [isOpen, expense?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeFairIds = Object.keys(selectedFairs).filter((id) => selectedFairs[id]);
  const availableFairs = fairs.filter((f) => !selectedFairs[f.id]);
  const selectedFairsList = fairs.filter((f) => !!selectedFairs[f.id]);

  const totalPercentage = activeFairIds.reduce(
    (sum, id) => sum + (fairPercentages[id] || 0),
    0
  );
  const isPercentageSumValid = Math.abs(totalPercentage - 100) < 0.05;
  const canSubmit =
    activeFairIds.length > 0 && (!manualMode || isPercentageSumValid);

  const handleAddFair = (id: string) => {
    if (!id) return;
    setSelectedFairs((prev) => ({ ...prev, [id]: true }));
    setFairPercentages((prev) => ({ ...prev, [id]: prev[id] || 0 }));
  };

  const handleRemoveFair = (id: string) => {
    setSelectedFairs((prev) => ({ ...prev, [id]: false }));
    setFairPercentages((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handlePercentageChange = (id: string, value: string) => {
    setFairPercentages((prev) => ({ ...prev, [id]: parseFloat(value) || 0 }));
  };

  const handleDivideEqually = () => {
    if (activeFairIds.length === 0) return;
    const equalShare = parseFloat((100 / activeFairIds.length).toFixed(2));
    const next: Record<string, number> = {};
    activeFairIds.forEach((id) => (next[id] = equalShare));
    setFairPercentages(next);
  };

  const handleConfirm = () => {
    if (!expense || !canSubmit) return;

    const payload: ConvertToOverheadPayload = {
      financeCategoryId: financeCategoryId || undefined,
      fairs: activeFairIds.map((id) =>
        manualMode
          ? { fairId: id, percentual: (fairPercentages[id] || 0) / 100 }
          : { fairId: id } // sem percentual → backend divide igualmente
      ),
    };

    onConfirm(expense.id, payload);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        aria-describedby="convert-overhead-desc"
        className="max-w-lg w-[95vw] bg-slate-950 border border-white/10 text-white p-0 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <DialogHeader className="relative h-14 flex flex-row items-center px-6 bg-linear-to-br from-amber-500 to-orange-600 overflow-hidden rounded-t-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <ArrowRightLeft className="w-5 h-5 text-white mr-3 relative z-10 shrink-0" />
          <DialogTitle className="text-base font-black text-white tracking-tight relative z-10">
            Converter para Overhead
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(92vh-3.5rem-5rem)]">
          <DialogDescription id="convert-overhead-desc" className="sr-only">
            Converta esta despesa direta em uma despesa overhead rateada entre feiras.
          </DialogDescription>

          {/* Resumo da despesa */}
          {expense && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Despesa a converter
              </p>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {expense.descricao || "Sem descrição"}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="text-[10px] bg-white/10 border border-white/10 text-white/70">
                      <Tag className="w-3 h-3 mr-1" />
                      {expense.category?.name || expense.categoryId}
                    </Badge>
                    <Badge className="text-[10px] bg-white/10 border border-white/10 text-white/70">
                      {new Date(expense.data).toLocaleDateString("pt-BR")}
                    </Badge>
                  </div>
                </div>
                <p className="text-lg font-black text-amber-400 shrink-0 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {formatCurrency(expense.valor)}
                </p>
              </div>
            </div>
          )}

          {/* Categoria overhead (opcional) */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-white/60">
              Categoria Overhead{" "}
              <span className="text-white/30 normal-case font-normal">
                (opcional — usa categoria original se omitida)
              </span>
            </Label>
            <Select
              value={financeCategoryId || "__none__"}
              onValueChange={(val) =>
                setFinanceCategoryId(val === "__none__" ? "" : val)
              }
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-xs">
                <SelectValue placeholder="Usar categoria da despesa original..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border border-white/10 text-white max-h-48 overflow-y-auto">
                <SelectItem
                  value="__none__"
                  className="hover:bg-white/10 cursor-pointer text-xs text-white/50"
                >
                  ↩ Usar categoria original
                </SelectItem>
                {overheadCategories.map((cat) => (
                  <SelectItem
                    key={cat.id}
                    value={cat.id}
                    className="hover:bg-white/10 cursor-pointer text-xs"
                  >
                    {cat.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Toggle modo de rateio */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setManualMode(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                !manualMode
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                  : "bg-white/3 border-white/10 text-white/40 hover:bg-white/5"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Automático (igual)
            </button>
            <button
              type="button"
              onClick={() => setManualMode(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                manualMode
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                  : "bg-white/3 border-white/10 text-white/40 hover:bg-white/5"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Manual (%)
            </button>
          </div>

          {/* Descrição do modo */}
          <p className="text-[10px] text-white/40 -mt-2 leading-relaxed">
            {manualMode
              ? "Defina o percentual de cada feira. A soma deve ser exatamente 100%."
              : "O backend divide o custo igualmente entre as feiras selecionadas. Nenhum percentual será enviado."}
          </p>

          {/* Seleção de feiras */}
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-white/60">
              Feiras no Rateio *
            </Label>

            {availableFairs.length > 0 ? (
              <Select onValueChange={handleAddFair} value="">
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-xs">
                  <SelectValue placeholder="Adicionar feira..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border border-white/10 text-white max-h-48 overflow-y-auto">
                  {availableFairs.map((fair) => (
                    <SelectItem
                      key={fair.id}
                      value={fair.id}
                      className="hover:bg-white/10 cursor-pointer text-xs"
                    >
                      {fair.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : selectedFairsList.length > 0 ? (
              <p className="text-[10px] text-white/40 text-center border border-dashed border-white/10 rounded-xl py-2">
                Todas as feiras adicionadas
              </p>
            ) : null}

            {/* Lista de feiras selecionadas */}
            <div className="space-y-2 max-h-44 overflow-y-auto">
              {selectedFairsList.length === 0 ? (
                <div className="flex items-center justify-center border border-dashed border-white/10 rounded-xl p-6">
                  <p className="text-xs text-white/40">
                    Selecione pelo menos uma feira acima.
                  </p>
                </div>
              ) : (
                selectedFairsList.map((fair) => (
                  <div
                    key={fair.id}
                    className="flex items-center justify-between gap-3 p-2.5 bg-slate-900/40 border border-white/5 rounded-xl"
                  >
                    <span className="text-xs font-semibold text-white/80 truncate flex-1">
                      {fair.name}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Inputs de percentual apenas no modo manual */}
                      {manualMode && (
                        <>
                          <Input
                            type="number"
                            value={fairPercentages[fair.id] || ""}
                            placeholder="0"
                            min="0"
                            max="100"
                            onChange={(e) =>
                              handlePercentageChange(fair.id, e.target.value)
                            }
                            className="bg-white/5 border-white/10 text-white rounded-lg w-16 text-right h-8 text-xs"
                          />
                          <span className="text-[10px] text-white/60">%</span>
                        </>
                      )}
                      {/* No modo automático mostra "auto" */}
                      {!manualMode && (
                        <span className="text-[10px] text-amber-400/70 font-bold px-2">
                          auto
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFair(fair.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totalizador — apenas no modo manual */}
            {manualMode && selectedFairsList.length > 0 && (
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDivideEqually}
                  className="border-white/10 bg-white/5 text-white/80 hover:bg-white/10 rounded-xl font-bold h-8 text-xs px-3"
                >
                  Dividir igualmente
                </Button>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-white/60">Soma:</span>
                  <span
                    className={`font-black flex items-center gap-1 text-sm ${
                      isPercentageSumValid ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {totalPercentage.toFixed(1)}%
                    {isPercentageSumValid ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Aviso */}
          <div className="flex gap-2 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-white/60 leading-relaxed">
              A despesa direta será{" "}
              <strong className="text-white/80">removida</strong> e recriada
              como overhead. O rateio entre as feiras será aplicado
              imediatamente.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-end gap-3 border-t border-white/5 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-white/10 text-white/60 hover:text-white rounded-xl px-5 font-bold h-10 text-xs"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canSubmit || isLoading}
            className="bg-linear-to-br from-amber-500 to-orange-600 text-white rounded-xl px-6 font-bold h-10 text-xs shadow-lg hover:scale-105 transition-transform active:scale-95 disabled:opacity-60 disabled:scale-100"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            {isLoading ? "Convertendo..." : "Converter"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
