import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  Tag,
  Building,
  Plus,
  Check,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Expense,
  DirectExpenseCategory,
  Account,
  OverheadExpense,
  AllocatedOverheadExpense,
  OverheadAllocation,
  CreateExpenseForm,
  CreateOverheadExpenseForm,
} from "@/interfaces/finance";
import type { FinanceCategory } from "@/interfaces/categories";
import { AccountType } from "@/interfaces/finance";
import { useExpensesService } from "@/service/expenses.service";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { maskCurrencyBRL, unmaskCurrencyBRL } from "@/utils/masks";
import type { Fair } from "@/interfaces/fairs";

// Schema de validação
const expenseSchema = z
  .object({
    isShared: z.boolean(),
    categoryId: z.string().optional(),
    categoria: z.string().optional(),
    accountId: z.string().min(1, "Conta bancária é obrigatória"),
    descricao: z
      .string()
      .max(500, "Descrição deve ter no máximo 500 caracteres")
      .optional(),
    valorDisplay: z.string().min(1, "Valor é obrigatório"),
    data: z.string().min(1, "Data é obrigatória"),
    observacoes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.isShared) {
        return !!data.categoria && data.categoria.trim() !== "";
      } else {
        return !!data.categoryId && data.categoryId.trim() !== "";
      }
    },
    {
      message: "Categoria é obrigatória",
      path: ["categoryId"],
    }
  );

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: "direct" | "overhead";
    payload: CreateExpenseForm | CreateOverheadExpenseForm;
    previousType?: "direct" | "overhead";
    previousId?: string;
  }) => void;
  expense?: Expense | AllocatedOverheadExpense | OverheadExpense | null;
  categories?: DirectExpenseCategory[];
  overheadCategories?: FinanceCategory[];
  accounts?: Account[];
  fairsList?: Fair[];
  isLoading?: boolean;
  fairId?: string;
  onCategoryCreated?: () => void;
  onAccountCreated?: () => void;
  defaultShared?: boolean;
}

export function ExpenseForm({
  isOpen,
  onClose,
  onSubmit,
  expense,
  categories = [],
  overheadCategories = [],
  accounts = [],
  fairsList = [],
  isLoading = false,
  fairId,
  onCategoryCreated,
  onAccountCreated,
  defaultShared = false,
}: ExpenseFormProps) {
  const [isShared, setIsShared] = useState(defaultShared);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const [selectedFairs, setSelectedFairs] = useState<Record<string, boolean>>({});
  const [fairPercentages, setFairPercentages] = useState<Record<string, number>>({});

  const expensesService = useExpensesService();
  const queryClient = useQueryClient();

  // Console.log das categorias recebidas via prop (do endpoint)
  useEffect(() => {
    console.log("[ExpenseForm] categories recebidas do endpoint:", categories);
  }, [categories]);

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      isShared: defaultShared,
      categoryId: "",
      categoria: "",
      accountId: "",
      descricao: "",
      valorDisplay: "R$ 0,00",
      data: "",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (expense) {
      const isOverhead =
        "allocations" in expense ||
        "feirasRateadas" in expense ||
        !("categoryId" in expense);

      setIsShared(isOverhead);

      const initialFairs: Record<string, number> = {};
      const initialChecked: Record<string, boolean> = {};

      if (isOverhead) {
        if ("feirasRateadas" in expense && expense.feirasRateadas) {
          (expense as AllocatedOverheadExpense).feirasRateadas.forEach((f) => {
            initialFairs[f.fairId] = parseFloat((f.percentual * 100).toFixed(2));
            initialChecked[f.fairId] = true;
          });
        } else if ("allocations" in expense && expense.allocations) {
          (expense as OverheadExpense).allocations.forEach(
            (alloc: OverheadAllocation) => {
              initialFairs[alloc.fairId] = parseFloat(
                (alloc.percentual * 100).toFixed(2)
              );
              initialChecked[alloc.fairId] = true;
            }
          );
        }
      } else if (fairId) {
        initialFairs[fairId] = 100;
        initialChecked[fairId] = true;
      }

      setSelectedFairs(initialChecked);
      setFairPercentages(initialFairs);

      const categoryVal =
        "categoria" in expense
          ? (expense as AllocatedOverheadExpense).categoria
          : "";
      const categoryIdVal =
        "categoryId" in expense ? (expense as Expense).categoryId : "";

      const accountIdVal =
        "accountId" in expense
          ? (expense as Expense).accountId
          : (expense as AllocatedOverheadExpense).account?.id ?? "";

      const valorDisplay = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(
        "valorTotal" in expense
          ? (expense as AllocatedOverheadExpense).valorTotal
          : (expense as Expense).valor ?? 0
      );

      const observacoesVal =
        "observacoes" in expense
          ? ((expense as Expense | OverheadExpense).observacoes ?? "")
          : "";

      form.reset({
        isShared: isOverhead,
        categoria: categoryVal ?? "",
        categoryId: categoryIdVal ?? "",
        accountId: accountIdVal,
        descricao: expense.descricao ?? "",
        valorDisplay,
        data: expense.data ? expense.data.split("T")[0] : "",
        observacoes: observacoesVal,
      });
    } else {
      setIsShared(defaultShared);
      setSelectedFairs(fairId ? { [fairId]: true } : {});
      setFairPercentages(fairId ? { [fairId]: 100 } : {});
      form.reset({
        isShared: defaultShared,
        categoria: "",
        categoryId: "",
        accountId: "",
        descricao: "",
        valorDisplay: "R$ 0,00",
        data: "",
        observacoes: "",
      });
    }
    setShowCategoryForm(false);
    setShowAccountForm(false);
  }, [expense, form, fairId, isOpen, defaultShared]);

  const selectedFairsList = (fairsList || []).filter((f) => !!selectedFairs[f.id]);
  const availableFairsToAdd = (fairsList || []).filter((f) => !selectedFairs[f.id]);

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
    const val = parseFloat(value) || 0;
    setFairPercentages((prev) => ({ ...prev, [id]: val }));
  };

  const handleDivideEqually = () => {
    const activeIds = Object.keys(selectedFairs).filter((id) => selectedFairs[id]);
    if (activeIds.length === 0) return;
    const equalShare = parseFloat((100 / activeIds.length).toFixed(2));
    const nextPercentages: Record<string, number> = {};
    activeIds.forEach((id) => {
      nextPercentages[id] = equalShare;
    });
    setFairPercentages(nextPercentages);
  };

  const totalPercentage = Object.keys(selectedFairs)
    .filter((id) => selectedFairs[id])
    .reduce((sum, id) => sum + (fairPercentages[id] || 0), 0);
  const isPercentageSumValid = Math.abs(totalPercentage - 100) < 0.05;

  const handleSubmit = (data: ExpenseFormData) => {
    const valorEmCentavos = unmaskCurrencyBRL(data.valorDisplay);
    const valorEmReais = valorEmCentavos / 100;
    const dataFormatada: string = data.data
      ? new Date(data.data).toISOString().split("T")[0]
      : "";

    let payload: CreateExpenseForm | CreateOverheadExpenseForm;
    let type: "direct" | "overhead";

    if (isShared) {
      type = "overhead";
      const activeFairs = Object.keys(selectedFairs).filter((id) => selectedFairs[id]);

      if (activeFairs.length === 0) {
        toast.error("Selecione pelo menos uma feira.");
        return;
      }

      if (!isPercentageSumValid) {
        toast.error("A soma deve ser 100%");
        return;
      }

      payload = {
        categoria: data.categoria ?? "",
        accountId: data.accountId,
        descricao: data.descricao,
        valor: valorEmReais,
        data: dataFormatada,
        observacoes: data.observacoes,
        fairs: activeFairs.map((id) => ({
          fairId: id,
          percentual: (fairPercentages[id] || 0) / 100,
        })),
      } satisfies CreateOverheadExpenseForm;
    } else {
      type = "direct";
      payload = {
        fairId: fairId ?? "",
        categoryId: data.categoryId ?? "",
        accountId: data.accountId,
        descricao: data.descricao,
        valor: valorEmReais,
        data: dataFormatada,
        observacoes: data.observacoes,
      } satisfies CreateExpenseForm;
    }

    let previousType: "direct" | "overhead" | undefined;
    let previousId: string | undefined;

    if (expense) {
      previousId = expense.id;
      previousType =
        "allocations" in expense ||
        "feirasRateadas" in expense ||
        !("categoryId" in expense)
          ? "overhead"
          : "direct";
    }

    onSubmit({ type, payload, previousType, previousId });
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    global: false,
  });
  const [accountFormData, setAccountFormData] = useState<{
    nomeConta: string;
    banco: string;
    tipo: AccountType;
  }>({ nomeConta: "", banco: "", tipo: AccountType.CORRENTE });

  const handleCreateCategory = async () => {
    if (!categoryFormData.name.trim()) return;
    setIsCreatingCategory(true);
    try {
      const newCategory = await expensesService.createFinanceCategory({
        nome: categoryFormData.name,
        global: categoryFormData.global,
        fairId: fairId,
        isRequired: false,
      });
      setCategoryFormData({ name: "", global: false });
      setShowCategoryForm(false);
      await queryClient.refetchQueries({ queryKey: ["finance-categories", fairId] });
      onCategoryCreated?.();
      if (newCategory?.id) form.setValue("categoryId", newCategory.id);
      toast.success("Categoria criada!");
    } catch {
      toast.error("Erro ao criar categoria.");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!accountFormData.nomeConta.trim()) return;
    setIsCreatingAccount(true);
    try {
      const newAccount = await expensesService.createAccount(accountFormData);
      setAccountFormData({ nomeConta: "", banco: "", tipo: AccountType.CORRENTE });
      setShowAccountForm(false);
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      onAccountCreated?.();
      if (newAccount?.id) form.setValue("accountId", newAccount.id);
      toast.success("Conta criada!");
    } catch {
      toast.error("Erro ao criar conta.");
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const isExpanded = isShared;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        aria-describedby={undefined}
        className={`transition-all duration-300 ${
          isExpanded ? "max-w-3xl w-[95vw]" : "max-w-lg w-[95vw]"
        } bg-slate-950 border border-white/10 text-white p-0 rounded-2xl shadow-2xl overflow-hidden flex flex-col`}
        style={{ maxHeight: "min(92vh, 720px)" }}
      >
        {/* Header */}
        <DialogHeader className="relative shrink-0 h-14 flex flex-row items-center justify-between px-6 bg-linear-to-br from-[#00aacd] to-[#EB2970] overflow-hidden rounded-t-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <DialogTitle className="text-base font-black text-white tracking-tight relative z-10">
            {expense ? "Editar Lançamento" : "Novo Lançamento Financeiro"}
          </DialogTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded-full relative z-10 cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Form */}
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex-1 flex flex-col min-h-0"
        >
          {/* Body */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <div
              className={`h-full grid ${
                isExpanded ? "grid-cols-1 md:grid-cols-[1fr_1px_1fr]" : "grid-cols-1"
              }`}
            >
              {/* ── Coluna Esquerda ── */}
              <div className="overflow-y-auto p-5 space-y-4">
                {/* Toggle Rateio */}
                <div className="flex items-center justify-between p-3.5 bg-white/3 border border-white/5 rounded-xl">
                  <div>
                    <p className="text-sm font-black text-white leading-tight">
                      Compartilhar Custo (Rateio)
                    </p>
                    <p className="text-[10px] text-white/40 mt-0.5">
                      Divida este custo entre feiras
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isShared}
                    onChange={(e) => {
                      setIsShared(e.target.checked);
                      form.setValue("isShared", e.target.checked);
                    }}
                    className="w-10 h-5 bg-white/10 border border-white/10 rounded-full appearance-none checked:bg-brand-pink relative transition-all duration-300 before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-px before:left-px checked:before:translate-x-5 before:transition-all cursor-pointer shrink-0"
                  />
                </div>

                {/* Categoria */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                      Categoria *
                    </Label>
                    {!isShared && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCategoryForm(true)}
                        className="h-5 w-5 p-0 text-brand-cyan hover:text-white hover:bg-white/10 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>

                  {isShared ? (
                    /* Overhead: Select das finance_categories globais; fallback para texto livre */
                    overheadCategories.length > 0 ? (
                      <Select
                        value={form.watch("categoria")}
                        onValueChange={(val) => form.setValue("categoria", val)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-xs">
                          <SelectValue placeholder="Selecione a categoria..." />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border border-white/10 text-white max-h-48 overflow-y-auto">
                          {overheadCategories.map((cat) => (
                            <SelectItem
                              key={cat.id}
                              value={cat.nome}
                              className="hover:bg-white/10 cursor-pointer text-xs"
                            >
                              <div className="flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                                {cat.nome}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder="Ex: Aluguel, Pessoal, TI..."
                        {...form.register("categoria")}
                        className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-xs"
                      />
                    )
                  ) : (
                    /* Direto: categoria vem do endpoint */
                    <div className="relative">
                      <Select
                        value={form.watch("categoryId")}
                        onValueChange={(value) =>
                          form.setValue("categoryId", value)
                        }
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-xs">
                          <SelectValue placeholder="Selecione a categoria..." />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border border-white/10 text-white max-h-48 overflow-y-auto">
                          {categories.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-white/40">
                              Nenhuma categoria cadastrada
                            </div>
                          ) : (
                            categories.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.id}
                                className="hover:bg-white/10 cursor-pointer text-xs"
                              >
                                <div className="flex items-center gap-1.5">
                                  <Tag className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                                  {category.name}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {form.formState.errors.categoryId && (
                    <p className="text-[10px] text-red-400">
                      {form.formState.errors.categoryId.message}
                    </p>
                  )}
                </div>

                {/* Conta */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                      Conta *
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAccountForm(true)}
                      className="h-5 w-5 p-0 text-brand-cyan hover:text-white hover:bg-white/10 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <Select
                    value={form.watch("accountId")}
                    onValueChange={(val) => form.setValue("accountId", val)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-xs">
                      <SelectValue placeholder="Selecione a conta..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border border-white/10 text-white max-h-48 overflow-y-auto">
                      {accounts.length === 0 ? (
                        <div className="px-3 py-4 text-center text-xs text-white/40">
                          Nenhuma conta cadastrada
                        </div>
                      ) : (
                        accounts.map((account) => (
                          <SelectItem
                            key={account.id}
                            value={account.id}
                            className="hover:bg-white/10 cursor-pointer text-xs"
                          >
                            <div className="flex items-center gap-1.5">
                              <Building className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                              {account.nomeConta}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.accountId && (
                    <p className="text-[10px] text-red-400">
                      {form.formState.errors.accountId.message}
                    </p>
                  )}
                </div>

                {/* Descrição */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                    Descrição
                  </Label>
                  <Input
                    placeholder="Descrição da despesa"
                    {...form.register("descricao")}
                    className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-xs"
                  />
                </div>

                {/* Valor + Data */}
                <div className="grid grid-cols-2 gap-3">
                  <ControlledInput
                    control={form.control}
                    name="valorDisplay"
                    label="Valor *"
                    placeholder="0,00"
                    mask={maskCurrencyBRL}
                  />
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                      Data *
                    </Label>
                    <Input
                      type="date"
                      {...form.register("data")}
                      className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-xs"
                    />
                  </div>
                </div>

                {/* Observações */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                    Observações
                  </Label>
                  <Input
                    placeholder="Observações adicionais..."
                    {...form.register("observacoes")}
                    className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-xs"
                  />
                </div>
              </div>

              {/* Divisória vertical (apenas quando expandido) */}
              {isExpanded && (
                <div className="hidden md:block w-px bg-white/10 my-5" />
              )}

              {/* ── Coluna Direita: Rateio ── */}
              {isExpanded && (
                <div className="overflow-y-auto p-5 flex flex-col gap-4">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-white/60 shrink-0">
                    Feiras no Rateio
                  </Label>

                  {/* Adicionar feira */}
                  {availableFairsToAdd.length > 0 ? (
                    <Select onValueChange={handleAddFair} value="">
                      <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-xs shrink-0">
                        <SelectValue placeholder="Adicionar feira..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border border-white/10 text-white max-h-48 overflow-y-auto">
                        {availableFairsToAdd.map((fair) => (
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
                  ) : (
                    <div className="p-2 border border-dashed border-white/10 rounded-xl text-[10px] text-center text-white/40">
                      Todas as feiras adicionadas
                    </div>
                  )}

                  {/* Lista de feiras selecionadas */}
                  <div className="flex-1 space-y-2 min-h-0">
                    {selectedFairsList.length === 0 ? (
                      <div className="flex items-center justify-center border border-dashed border-white/10 rounded-xl p-6 text-center min-h-[80px]">
                        <p className="text-xs text-white/40 font-medium">
                          Nenhuma feira selecionada.
                        </p>
                      </div>
                    ) : (
                      selectedFairsList.map((fair) => {
                        const percentage = fairPercentages[fair.id] ?? 0;
                        return (
                          <div
                            key={fair.id}
                            className="flex items-center justify-between gap-3 p-2.5 bg-slate-900/40 border border-white/5 rounded-xl"
                          >
                            <span className="text-xs font-semibold text-white/80 truncate flex-1">
                              {fair.name}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Input
                                type="number"
                                value={percentage || ""}
                                placeholder="0"
                                min="0"
                                max="100"
                                onChange={(e) =>
                                  handlePercentageChange(fair.id, e.target.value)
                                }
                                className="bg-white/5 border-white/10 text-white rounded-lg w-16 text-right h-8 text-xs"
                              />
                              <span className="text-[10px] text-white/60">%</span>
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
                        );
                      })
                    )}
                  </div>

                  {/* Totalizador */}
                  <div className="shrink-0 pt-3 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      {selectedFairsList.length > 0 && (
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
                      <div className="flex items-center gap-1.5 text-xs ml-auto">
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
                    {!isPercentageSumValid && selectedFairsList.length > 0 && (
                      <p className="text-[10px] text-red-400/80 font-medium leading-tight">
                        * A soma dos percentuais deve ser 100%
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 px-5 py-4 border-t border-white/10 flex justify-end gap-3 bg-slate-950">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-white/10 text-white/60 hover:text-white rounded-xl px-5 font-bold h-10 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || (isShared && !isPercentageSumValid)}
              className="bg-linear-to-br from-[#00aacd] to-[#EB2970] text-white rounded-xl px-7 font-bold h-10 text-xs shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform active:scale-95 disabled:opacity-60 disabled:scale-100"
            >
              {isLoading ? "Salvando..." : expense ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>

        {/* Overlay: Nova Categoria */}
        {showCategoryForm && (
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-md p-6 flex flex-col justify-center z-30 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-white uppercase tracking-wider">
                Nova Categoria
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCategoryForm(false)}
                className="h-7 w-7 p-0 text-white/60 hover:text-white rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                  Nome
                </Label>
                <Input
                  placeholder="Nome da categoria"
                  value={categoryFormData.name}
                  onChange={(e) =>
                    setCategoryFormData({ ...categoryFormData, name: e.target.value })
                  }
                  className="bg-white/5 border-white/10 text-white rounded-xl text-xs h-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="category-global"
                  checked={categoryFormData.global}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      global: e.target.checked,
                    })
                  }
                  className="rounded border-white/10 bg-white/5 h-4 w-4 accent-brand-pink"
                />
                <label
                  htmlFor="category-global"
                  className="text-[10px] text-white/60 cursor-pointer"
                >
                  Disponível para todas as feiras
                </label>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCategoryForm(false)}
                  className="flex-1 h-10 text-xs border-white/10 text-white/60 hover:text-white rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={!categoryFormData.name.trim() || isCreatingCategory}
                  className="flex-1 h-10 text-xs bg-linear-to-br from-[#00aacd] to-[#EB2970] font-bold text-white rounded-xl"
                >
                  {isCreatingCategory ? "Criando..." : "Criar Categoria"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Overlay: Nova Conta */}
        {showAccountForm && (
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-md p-6 flex flex-col justify-center z-30 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-white uppercase tracking-wider">
                Nova Conta Bancária
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAccountForm(false)}
                className="h-7 w-7 p-0 text-white/60 hover:text-white rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                  Identificação
                </Label>
                <Input
                  placeholder="Nome da conta"
                  value={accountFormData.nomeConta}
                  onChange={(e) =>
                    setAccountFormData({
                      ...accountFormData,
                      nomeConta: e.target.value,
                    })
                  }
                  className="bg-white/5 border-white/10 text-white rounded-xl text-xs h-10"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                  Banco
                </Label>
                <Input
                  placeholder="Nome do banco"
                  value={accountFormData.banco}
                  onChange={(e) =>
                    setAccountFormData({ ...accountFormData, banco: e.target.value })
                  }
                  className="bg-white/5 border-white/10 text-white rounded-xl text-xs h-10"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                  Tipo
                </Label>
                <div className="flex gap-2">
                  {Object.values(AccountType).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setAccountFormData({ ...accountFormData, tipo: type })
                      }
                      className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                        accountFormData.tipo === type
                          ? "bg-brand-pink text-white shadow-md"
                          : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAccountForm(false)}
                  className="flex-1 h-10 text-xs border-white/10 text-white/60 hover:text-white rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateAccount}
                  disabled={!accountFormData.nomeConta.trim() || isCreatingAccount}
                  className="flex-1 h-10 text-xs bg-linear-to-br from-[#00aacd] to-[#EB2970] font-bold text-white rounded-xl"
                >
                  {isCreatingAccount ? "Criando..." : "Criar Conta"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
