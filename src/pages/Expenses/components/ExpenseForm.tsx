import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  Calendar as CalendarIcon,
  DollarSign,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type {
  Expense,
  CreateExpenseForm,
  UpdateExpenseForm,
  FinanceCategory,
  Account,
  CreateFinanceCategoryForm,
  CreateAccountForm,
} from "@/interfaces/finance";
import { AccountType } from "@/interfaces/finance";
import { useExpensesService } from "@/service/expenses.service";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Schema de validação
const expenseSchema = z.object({
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  accountId: z.string().min(1, "Conta bancária é obrigatória"),
  descricao: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
  valor: z.number().min(0.01, "Valor deve ser maior que zero"),
  data: z.string().min(1, "Data é obrigatória"),
  observacoes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExpenseForm | UpdateExpenseForm) => void;
  expense?: Expense | null;
  categories: FinanceCategory[];
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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
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
      valor: 0,
      data: new Date().toISOString().split("T")[0],
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
        valor: expense.valor,
        data: expense.data,
        observacoes: expense.observacoes || "",
      });
    } else {
      form.reset({
        categoryId: "",
        accountId: "",
        descricao: "",
        valor: 0,
        data: new Date().toISOString().split("T")[0],
        observacoes: "",
      });
    }
  }, [expense, form]);

  const handleSubmit = (data: ExpenseFormData) => {
    if (expense) {
      // Atualizar despesa existente
      onSubmit({ ...data } as UpdateExpenseForm);
    } else {
      // Criar nova despesa
      onSubmit(data);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

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
    nome: "",
    global: false,
  });

  const [accountFormData, setAccountFormData] = useState({
    nomeConta: "",
    banco: "",
    tipo: AccountType.CORRENTE as AccountType,
  });

  // Funções para criar categoria
  const handleCreateCategory = async () => {
    if (!categoryFormData.nome.trim()) return;

    setIsCreatingCategory(true);
    try {
      const categoryData: CreateFinanceCategoryForm = {
        nome: categoryFormData.nome,
        global: categoryFormData.global,
        fairId: fairId, // Sempre incluir fairId quando disponível
      };

      const newCategory = await expensesService.createFinanceCategory(
        categoryData
      );

      // Reset do formulário
      setCategoryFormData({ nome: "", global: false });
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {expense ? "Editar Despesa" : "Nova Despesa"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Categoria e Conta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoria */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="categoryId"
                  className="text-gray-900 dark:text-gray-100"
                >
                  Categoria *
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCategoryForm(!showCategoryForm)}
                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Select
                value={form.watch("categoryId")}
                onValueChange={(value) => form.setValue("categoryId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        {category.nome}
                        {category.global && (
                          <span className="text-xs text-gray-500">
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
                <div className="mt-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Nova Categoria
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCategoryForm(false)}
                      className="h-6 w-6 p-0"
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
                      value={categoryFormData.nome}
                      onChange={(e) =>
                        setCategoryFormData({
                          ...categoryFormData,
                          nome: e.target.value,
                        })
                      }
                      className="text-sm"
                    />

                    <div className="flex items-center space-x-2">
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
                        className="rounded border-gray-300"
                      />
                      <label
                        htmlFor="category-global"
                        className="text-xs text-gray-600 dark:text-gray-400"
                      >
                        Categoria global (disponível para todas as feiras)
                      </label>
                    </div>

                    <Button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={
                        !categoryFormData.nome.trim() || isCreatingCategory
                      }
                      className="w-full h-8 text-xs"
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
                <p className="text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>

            {/* Conta Bancária */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="accountId"
                  className="text-gray-900 dark:text-gray-100"
                >
                  Conta Bancária *
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAccountForm(!showAccountForm)}
                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Select
                value={form.watch("accountId")}
                onValueChange={(value) => form.setValue("accountId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        {account.nomeConta}
                        {account.banco && (
                          <span className="text-xs text-gray-500">
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
                <div className="mt-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Nova Conta Bancária
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAccountForm(false)}
                      className="h-6 w-6 p-0"
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
                      className="text-sm"
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
                      className="text-sm"
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
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Tipo de conta" />
                      </SelectTrigger>
                      <SelectContent>
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
                      className="w-full h-8 text-xs"
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
                <p className="text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.accountId.message}
                </p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label
              htmlFor="descricao"
              className="text-gray-900 dark:text-gray-100"
            >
              Descrição
            </Label>
            <Input
              id="descricao"
              placeholder="Descrição da despesa (opcional)"
              {...form.register("descricao")}
              className="text-gray-900 dark:text-gray-100"
            />
            {form.formState.errors.descricao && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.descricao.message}
              </p>
            )}
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="valor"
                className="text-gray-900 dark:text-gray-100"
              >
                Valor (R$) *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  {...form.register("valor", { valueAsNumber: true })}
                  className="pl-10 text-gray-900 dark:text-gray-100"
                />
              </div>
              {form.formState.errors.valor && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.valor.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="data"
                className="text-gray-900 dark:text-gray-100"
              >
                Data *
              </Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("data") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("data") ? (
                      new Date(form.watch("data")).toLocaleDateString("pt-BR")
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      form.watch("data")
                        ? new Date(form.watch("data"))
                        : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        form.setValue("data", date.toISOString().split("T")[0]);
                        setIsCalendarOpen(false);
                      }
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.data && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.data.message}
                </p>
              )}
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label
              htmlFor="observacoes"
              className="text-gray-900 dark:text-gray-100"
            >
              Observações
            </Label>
            <Textarea
              id="observacoes"
              placeholder="Observações adicionais (opcional)"
              rows={3}
              {...form.register("observacoes")}
              className="text-gray-900 dark:text-gray-100"
            />
            {form.formState.errors.observacoes && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.observacoes.message}
              </p>
            )}
          </div>

          {/* Resumo */}
          {form.watch("valor") > 0 && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Resumo da Despesa
              </h4>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <strong>Valor:</strong> {formatCurrency(form.watch("valor"))}
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
                        ?.nome
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
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
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
