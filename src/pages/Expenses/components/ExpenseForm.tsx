import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  Tag,
  Building,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
  Expense,
  CreateExpenseForm,
  UpdateExpenseForm,
  ExpenseCategory,
  Account,
  CreateAccountForm,
} from "@/interfaces/finance";
import { AccountType } from "@/interfaces/finance";
import type { FinanceCategory, CreateCategoryDto } from "@/interfaces/categories";
import { useExpensesService } from "@/service/expenses.service";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { maskCurrencyBRL, unmaskCurrencyBRL } from "@/utils/masks";

// Schema de validação
const expenseSchema = z.object({
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  accountId: z.string().min(1, "Conta bancária é obrigatória"),
  descricao: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
  valorDisplay: z.string().min(1, "Valor é obrigatório"),
  data: z.string().min(1, "Data é obrigatória"),
  observacoes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExpenseForm | UpdateExpenseForm) => void;
  expense?: Expense | null;
  categories: ExpenseCategory[];
  accounts: Account[];
  isLoading?: boolean;
  fairId?: string;
  onCategoryCreated?: () => void;
  onAccountCreated?: () => void;
}

export function ExpenseForm({
  isOpen,
  onClose,
  onSubmit,
  expense,
  categories,
  accounts,
  isLoading = false,
  fairId,
  onCategoryCreated,
  onAccountCreated,
}: ExpenseFormProps) {
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const expensesService = useExpensesService();
  const queryClient = useQueryClient();

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      categoryId: "",
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
      form.reset({
        categoryId: expense.categoryId,
        accountId: expense.accountId,
        descricao: expense.descricao || "",
        valorDisplay: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(expense.valor),
        data: expense.data,
        observacoes: expense.observacoes || "",
      });
    } else {
      form.reset({
        categoryId: "",
        accountId: "",
        descricao: "",
        valorDisplay: "R$ 0,00",
        data: "",
        observacoes: "",
      });
    }
  }, [expense, form]);

  const handleSubmit = (data: ExpenseFormData) => {
    // Converter valor mascarado para número em reais (não centavos)
    const valorEmCentavos = unmaskCurrencyBRL(data.valorDisplay);
    const valorEmReais = valorEmCentavos / 100; // Converter centavos para reais
    
    // Garantir que a data esteja no formato ISO (YYYY-MM-DD)
    const dataFormatada = data.data ? new Date(data.data).toISOString().split('T')[0] : data.data;
    
    const formData = {
      ...data,
      valor: valorEmReais,
      data: dataFormatada,
    };
    
    if (expense) {
      // Atualizar despesa existente - remover campos desnecessários
      const updateData: UpdateExpenseForm = {
        categoryId: formData.categoryId,
        accountId: formData.accountId,
        descricao: formData.descricao,
        valor: formData.valor,
        data: formData.data,
        observacoes: formData.observacoes,
      };
      onSubmit(updateData);
    } else {
      // Criar nova despesa
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  // Watch do valor para o resumo
  const valorDisplay = form.watch("valorDisplay");

  const getAccountTypeLabel = (type: AccountType) => {
    const labels = {
      [AccountType.CORRENTE]: "Conta Corrente",
      [AccountType.POUPANCA]: "Conta Poupança",
      [AccountType.OUTRO]: "Outro",
    };
    return labels[type];
  };

  // Estados para os formulários inline
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    global: false,
  });

  const [accountFormData, setAccountFormData] = useState({
    nomeConta: "",
    banco: "",
    tipo: AccountType.CORRENTE as AccountType,
  });

  // Funções para criar categoria
  const handleCreateCategory = async () => {
    if (!categoryFormData.name.trim()) return;

    setIsCreatingCategory(true);
    try {
      const categoryData: CreateCategoryDto = {
        nome: categoryFormData.name,
        global: categoryFormData.global,
        fairId: fairId,
        isRequired: false,
      };

      const newCategory = await expensesService.createFinanceCategory(
        categoryData
      );

      // Reset do formulário
      setCategoryFormData({ name: "", global: false });
      setShowCategoryForm(false);

      // Recarregar as categorias
      await queryClient.refetchQueries({
        queryKey: ["finance-categories", fairId],
      });
      onCategoryCreated?.();

      // Selecionar automaticamente a nova categoria
      if (newCategory && newCategory.id) {
        form.setValue("categoryId", newCategory.id);
      }

      toast.success("Categoria criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      toast.error("Erro ao criar categoria. Tente novamente.");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Funções para criar conta
  const handleCreateAccount = async () => {
    if (!accountFormData.nomeConta.trim()) return;

    setIsCreatingAccount(true);
    try {
      const accountData: CreateAccountForm = {
        nomeConta: accountFormData.nomeConta,
        banco: accountFormData.banco || undefined,
        tipo: accountFormData.tipo,
      };

      const newAccount = await expensesService.createAccount(accountData);

      // Reset do formulário
      setAccountFormData({
        nomeConta: "",
        banco: "",
        tipo: AccountType.CORRENTE as AccountType,
      });
      setShowAccountForm(false);

      // Recarregar as contas
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      onAccountCreated?.();

      // Selecionar automaticamente a nova conta
      if (newAccount && newAccount.id) {
        form.setValue("accountId", newAccount.id);
      }

      toast.success("Conta bancária criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      toast.error("Erro ao criar conta. Tente novamente.");
    } finally {
      setIsCreatingAccount(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-white/10 text-white p-0 rounded-2xl shadow-2xl">
        <DialogHeader className="relative h-24 w-full flex items-end p-6 bg-linear-to-br from-[#00aacd] to-[#EB2970] overflow-hidden rounded-t-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 w-full flex items-center justify-between">
            <DialogTitle className="text-xl font-black text-white tracking-tight">
              {expense ? "Editar Despesa Direta" : "Nova Despesa Direta"}
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
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="categoryId"
                  className="text-xs font-bold uppercase tracking-wider text-white/60"
                >
                  Categoria *
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCategoryForm(!showCategoryForm)}
                  className="h-8 w-8 p-0 text-brand-cyan hover:text-white hover:bg-white/10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Select
                value={form.watch("categoryId")}
                onValueChange={(value) => form.setValue("categoryId", value)}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl focus:border-brand-pink/50 focus:ring-brand-pink/20 placeholder:text-white/20">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border border-white/10 text-white">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="hover:bg-white/10 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-brand-cyan" />
                        {category.name}
                        {category.global && (
                          <span className="text-xs text-white/40">
                            (Global)
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Formulário inline para criar categoria */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  showCategoryForm
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="mt-3 p-4 border border-white/10 rounded-xl bg-white/3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">
                      Nova Categoria
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCategoryForm(false)}
                      className="h-6 w-6 p-0 text-white/60 hover:text-white"
                    >
                      {showCategoryForm ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder="Nome da categoria"
                      value={categoryFormData.name}
                      onChange={(e) =>
                        setCategoryFormData({
                          ...categoryFormData,
                          name: e.target.value,
                        })
                      }
                      className="bg-white/5 border-white/10 text-white rounded-xl text-sm"
                    />

                    <div className="flex items-center space-x-2 text-white/80">
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
                        className="text-xs text-white/60 cursor-pointer"
                      >
                        Categoria global (disponível para todas as feiras)
                      </label>
                    </div>

                    <Button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={
                        !categoryFormData.name.trim() || isCreatingCategory
                      }
                      className="w-full h-9 text-xs bg-linear-to-br from-[#00aacd] to-[#EB2970] font-bold text-white rounded-xl cursor-pointer"
                      size="sm"
                    >
                      {isCreatingCategory ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          Criando...
                        </div>
                      ) : (
                        "Criar Categoria"
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {form.formState.errors.categoryId && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>

            {/* Conta Bancária */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="accountId"
                  className="text-xs font-bold uppercase tracking-wider text-white/60"
                >
                  Conta Bancária *
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAccountForm(!showAccountForm)}
                  className="h-8 w-8 p-0 text-brand-cyan hover:text-white hover:bg-white/10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Select
                value={form.watch("accountId")}
                onValueChange={(value) => form.setValue("accountId", value)}
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
                            ({account.banco} -{" "}
                            {getAccountTypeLabel(account.tipo)})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Formulário inline para criar conta */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  showAccountForm ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="mt-3 p-4 border border-white/10 rounded-xl bg-white/3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">
                      Nova Conta Bancária
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAccountForm(false)}
                      className="h-6 w-6 p-0 text-white/60 hover:text-white"
                    >
                      {showAccountForm ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder="Nome da conta"
                      value={accountFormData.nomeConta}
                      onChange={(e) =>
                        setAccountFormData({
                          ...accountFormData,
                          nomeConta: e.target.value,
                        })
                      }
                      className="bg-white/5 border-white/10 text-white rounded-xl text-sm"
                    />

                    <Input
                      placeholder="Banco (opcional)"
                      value={accountFormData.banco}
                      onChange={(e) =>
                        setAccountFormData({
                          ...accountFormData,
                          banco: e.target.value,
                        })
                      }
                      className="bg-white/5 border-white/10 text-white rounded-xl text-sm"
                    />

                    <Select
                      value={accountFormData.tipo}
                      onValueChange={(value) =>
                        setAccountFormData({
                          ...accountFormData,
                          tipo: value as AccountType,
                        })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl text-sm">
                        <SelectValue placeholder="Tipo de conta" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border border-white/10 text-white">
                        <SelectItem value={AccountType.CORRENTE}>
                          Conta Corrente
                        </SelectItem>
                        <SelectItem value={AccountType.POUPANCA}>
                          Conta Poupança
                        </SelectItem>
                        <SelectItem value={AccountType.OUTRO}>Outro</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      onClick={handleCreateAccount}
                      disabled={
                        !accountFormData.nomeConta.trim() || isCreatingAccount
                      }
                      className="w-full h-9 text-xs bg-linear-to-br from-[#00aacd] to-[#EB2970] font-bold text-white rounded-xl cursor-pointer"
                      size="sm"
                    >
                      {isCreatingAccount ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          Criando...
                        </div>
                      ) : (
                        "Criar Conta"
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {form.formState.errors.accountId && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.accountId.message}
                </p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label
              htmlFor="descricao"
              className="text-xs font-bold uppercase tracking-wider text-white/60"
            >
              Descrição
            </Label>
            <Input
              id="descricao"
              placeholder="Descrição da despesa (opcional)"
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
                label="Valor (R$) *"
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
              <Label
                htmlFor="data"
                className="text-xs font-bold uppercase tracking-wider text-white/60"
              >
                Data *
              </Label>
              <Input
                id="data"
                type="date"
                {...form.register("data")}
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-brand-pink/50 focus:ring-brand-pink/20 placeholder:text-white/20 h-10"
                onChange={(e) => {
                  form.setValue("data", e.target.value);
                }}
              />
              {form.formState.errors.data && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.data.message}
                </p>
              )}
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label
              htmlFor="observacoes"
              className="text-xs font-bold uppercase tracking-wider text-white/60"
            >
              Observações
            </Label>
            <Textarea
              id="observacoes"
              placeholder="Observações adicionais (opcional)"
              rows={3}
              {...form.register("observacoes")}
              className="bg-white/5 border-white/10 text-white rounded-xl focus:border-brand-pink/50 focus:ring-brand-pink/20 placeholder:text-white/20"
            />
            {form.formState.errors.observacoes && (
              <p className="text-sm text-red-400">
                {form.formState.errors.observacoes.message}
              </p>
            )}
          </div>

          {/* Resumo */}
          {valorDisplay && valorDisplay !== "R$ 0,00" && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <h4 className="text-sm font-bold text-white">
                Resumo da Despesa
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
                <p>
                  <strong>Valor:</strong> <span className="text-red-400 font-bold">{valorDisplay}</span>
                </p>
                <p>
                  <strong>Data:</strong>{" "}
                  {form.watch("data")
                    ? new Date(form.watch("data")).toLocaleDateString("pt-BR")
                    : "Não selecionada"}
                </p>
                {form.watch("categoryId") && (
                  <p>
                    <strong>Categoria:</strong>{" "}
                    {
                      categories.find((c) => c.id === form.watch("categoryId"))
                        ?.name
                    }
                  </p>
                )}
                {form.watch("accountId") && (
                  <p>
                    <strong>Conta:</strong>{" "}
                    {
                      accounts.find((a) => a.id === form.watch("accountId"))
                        ?.nomeConta
                    }
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Botões */}
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
              disabled={isLoading}
              className="bg-linear-to-br from-[#00aacd] to-[#EB2970] text-white rounded-xl px-6 font-bold shadow-lg shadow-pink-500/20 transition-all hover:scale-105 active:scale-95 h-11 border-none cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </div>
              ) : expense ? (
                "Atualizar Despesa"
              ) : (
                "Criar Despesa"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
