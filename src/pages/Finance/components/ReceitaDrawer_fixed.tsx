import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useFinanceService } from "@/service/finance.service";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ControlledInput } from "@/components/ControlledInput";
import { ControlledSelect } from "@/components/ControlledSelect";
import { X, Search, Plus, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { CreateRevenueForm, EntryModelType } from "@/interfaces/finance";

interface ReceitaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  revenueId?: string | null;
  fairId?: string;
}

// Schema de validação completo com validações contextuais
const revenueSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
  entryModelId: z.string().min(1, "Selecione um stand/patrocínio"),
  discountCents: z
    .number({
      required_error: "Desconto é obrigatório",
      invalid_type_error: "Desconto deve ser um número válido",
    })
    .int("Desconto deve ser um número inteiro")
    .min(0, "Desconto não pode ser negativo"),
  installmentsCount: z.string().min(1, "Quantidade de parcelas inválida"),
  notes: z.string().optional(),
});

const createClientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  fairId: z.string().min(1, "FairId é obrigatório"),
});

type RevenueFormData = z.infer<typeof revenueSchema>;
type CreateClientData = z.infer<typeof createClientSchema>;

interface AttachedFile {
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

export function ReceitaDrawer({ isOpen, onClose, fairId }: ReceitaDrawerProps) {
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedEntryModel, setSelectedEntryModel] = useState<{
    id: string;
    name: string;
    baseValue: number;
    type: string;
  } | null>(null);
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);

  const { user } = useAuth();
  const financeService = useFinanceService();
  const queryClient = useQueryClient();

  // Form principal
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control,
  } = useForm<RevenueFormData>({
    resolver: zodResolver(revenueSchema),
    defaultValues: {
      installmentsCount: "1",
      discountCents: 0,
    },
  });

  // Form para criar cliente
  const {
    control: controlClient,
    handleSubmit: handleSubmitClient,
    reset: resetClient,
  } = useForm<CreateClientData>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      fairId: fairId || "",
    },
  });

  const watchedValues = watch();

  // Query para buscar clientes
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ["search-clients", clientSearch],
    queryFn: () => financeService.searchClients(clientSearch),
    enabled: clientSearch.length >= 2,
  });

  // Query para buscar modelos de entrada
  const { data: entryModels = [] } = useQuery({
    queryKey: ["entry-models", fairId],
    queryFn: () => financeService.getEntryModels(fairId!),
    enabled: !!fairId,
  });

  // Mutation para criar cliente
  const createClientMutation = useMutation({
    mutationFn: (data: CreateClientData) => financeService.createClient(data),
    onSuccess: (newClient) => {
      if (newClient) {
        toast.success("Cliente criado com sucesso!");
        setSelectedClient({ id: newClient.id, name: newClient.name });
        setValue("clientId", newClient.id);
        setShowCreateClient(false);
        resetClient();
        queryClient.invalidateQueries({ queryKey: ["search-clients"] });
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar cliente: ${error.message}`);
    },
  });

  // Mutation para criar receita
  const createRevenueMutation = useMutation({
    mutationFn: (data: CreateRevenueForm) => financeService.createRevenue(data),
    onSuccess: () => {
      toast.success("Receita criada com sucesso!");
      // Invalidar todas as queries relacionadas a receitas
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "finance-revenues" ||
          query.queryKey[0] === "finance-kpis" ||
          query.queryKey[0] === "entry-models",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar receita: ${error.message}`);
    },
  });

  // Reset form quando drawer fecha
  useEffect(() => {
    if (!isOpen) {
      reset();
      setSelectedClient(null);
      setSelectedEntryModel(null);
      setClientSearch("");
      setShowCreateClient(false);
      setAttachedFile(null);
    }
  }, [isOpen]);

  // Helpers
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const calculateContractValue = () => {
    if (!selectedEntryModel) return 0;
    const discount = watchedValues.discountCents || 0;
    return Math.max(0, selectedEntryModel.baseValue - discount);
  };

  // Handlers
  const handleClientSelect = (client: { id: string; name: string }) => {
    setSelectedClient(client);
    setValue("clientId", client.id);
    setClientSearch("");
  };

  const handleEntryModelSelect = (modelId: string) => {
    const model = entryModels.find((m) => m.id === modelId);
    if (model) {
      setSelectedEntryModel({
        id: model.id,
        name: model.name,
        baseValue: model.baseValue,
        type: model.type,
      });
      setValue("entryModelId", model.id);
      setValue("discountCents", 0); // Zerar desconto ao trocar modelo
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validações do arquivo
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg"];

    if (file.size > maxSize) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de arquivo não permitido. Use PDF ou JPG.");
      return;
    }

    setAttachedFile({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  };

  const handleCreateClient = (data: CreateClientData) => {
    if (!fairId) {
      toast.error("FairId não encontrado");
      return;
    }

    const clientData: CreateClientData = {
      ...data,
      fairId: fairId,
    };

    createClientMutation.mutate(clientData);
  };

  const onSubmit = (data: RevenueFormData) => {
    if (!selectedClient) {
      toast.error("Selecione um cliente");
      return;
    }

    if (!selectedEntryModel) {
      toast.error("Selecione um stand/patrocínio");
      return;
    }

    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }

    // Validação contextual do desconto em relação ao valor base
    if (data.discountCents > selectedEntryModel.baseValue) {
      toast.error("Desconto não pode ser maior que o valor base");
      return;
    }

    // Calcular os valores obrigatórios
    const baseValue = selectedEntryModel.baseValue; // já está em centavos
    const contractValue = baseValue - data.discountCents; // baseValue - desconto

    // Garantir que os valores são números válidos
    const numericBaseValue = Number(baseValue);
    const numericContractValue = Number(contractValue);
    const numericDiscountCents = Number(data.discountCents);

    console.log("Valores sendo enviados:", {
      baseValue: numericBaseValue,
      contractValue: numericContractValue,
      discountCents: numericDiscountCents,
      typeof_baseValue: typeof numericBaseValue,
      typeof_contractValue: typeof numericContractValue,
      typeof_discountCents: typeof numericDiscountCents,
    });

    const formData: CreateRevenueForm = {
      fairId: fairId!,
      type: selectedEntryModel.type as EntryModelType, // Tipo do modelo (STAND ou PATROCINIO)
      entryModelId: selectedEntryModel.id,
      clientId: selectedClient.id,
      baseValue: numericBaseValue,
      discountCents: numericDiscountCents,
      contractValue: numericContractValue,
      paymentMethod: "PIX", // Padrão por enquanto
      numberOfInstallments: parseInt(data.installmentsCount), // Número de parcelas
      createdBy: user.id.toString(), // ID do usuário logado como string
      condition: data.installmentsCount === "1" ? "À vista" : "Parcelado", // Condição opcional
      notes: data.notes, // Observações opcionais
      standNumber: 0, // TODO: Implementar seleção de stand específico
    };

    createRevenueMutation.mutate(formData);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full max-w-4xl min-w-[40rem] overflow-y-auto bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 p-6">
        <SheetHeader className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Nova Receita
            </SheetTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4 text-gray-600 dark:text-white" />
            </Button>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Seção 1: Informações do Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              1. Informações do Cliente
            </h3>

            {/* Cliente */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-base font-medium text-gray-900 dark:text-white">
                  Cliente *
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateClient(!showCreateClient)}
                >
                  <Plus className="w-4 h-4 text-gray-600 dark:text-white" />
                </Button>
              </div>

              {selectedClient ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      {selectedClient.name}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedClient(null)}
                  >
                    <X className="w-4 h-4 text-gray-600 dark:text-white" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar cliente por nome..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="sm">
                      <Search className="w-4 h-4 text-gray-600 dark:text-white" />
                    </Button>
                  </div>

                  {isLoadingClients && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Buscando clientes...
                    </div>
                  )}

                  {clients.length > 0 && (
                    <div className="max-h-32 overflow-y-auto border rounded p-2 space-y-1 bg-white dark:bg-gray-800">
                      {clients.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-gray-900 dark:text-white"
                          onClick={() => handleClientSelect(client)}
                        >
                          {client.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {errors.clientId && (
                <span className="text-sm text-red-500">
                  {errors.clientId.message}
                </span>
              )}

              {/* Mini form criar cliente */}
              {showCreateClient && (
                <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium mb-3 text-gray-900 dark:text-white">
                    Criar novo cliente
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <ControlledInput
                      control={controlClient}
                      name="name"
                      label="Nome *"
                      placeholder="Nome do cliente"
                    />
                    <ControlledInput
                      control={controlClient}
                      name="cnpj"
                      label="CNPJ"
                      placeholder="00.000.000/0000-00"
                    />
                    <ControlledInput
                      control={controlClient}
                      name="email"
                      label="Email"
                      type="email"
                      placeholder="email@exemplo.com"
                    />
                    <ControlledInput
                      control={controlClient}
                      name="phone"
                      label="Telefone"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSubmitClient(handleCreateClient)}
                      disabled={createClientMutation.isPending}
                    >
                      {createClientMutation.isPending
                        ? "Salvando..."
                        : "Salvar Cliente"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreateClient(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Seção 2: Tipo e Valores */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              2. Tipo e Valores
            </h3>

            {/* Modelo */}
            <div className="space-y-2">
              <Label className="text-base font-medium text-gray-900 dark:text-white">
                Tipo / Modelo (Stand/Patrocínio) *
              </Label>
              <Select onValueChange={handleEntryModelSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o stand ou patrocínio" />
                </SelectTrigger>
                <SelectContent>
                  {entryModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} — {formatCurrency(model.baseValue)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.entryModelId && (
                <span className="text-sm text-red-500">
                  {errors.entryModelId.message}
                </span>
              )}
            </div>

            {/* Grid de valores */}
            {selectedEntryModel && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Valor base */}
                <div className="space-y-2">
                  <Label className="text-base font-medium text-gray-900 dark:text-white">
                    Valor Base
                  </Label>
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 border rounded">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(selectedEntryModel.baseValue)}
                    </span>
                  </div>
                </div>

                {/* Desconto */}
                <div className="space-y-2">
                  <Label className="text-base font-medium text-gray-900 dark:text-white">
                    Desconto (R$)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max={(selectedEntryModel.baseValue / 100).toFixed(2)}
                    placeholder="0,00"
                    {...register("discountCents", {
                      setValueAs: (value) => {
                        const numValue = parseFloat(value || "0");
                        const centValue = Math.round(numValue * 100);
                        return isNaN(centValue) ? 0 : centValue;
                      },
                    })}
                  />
                  {errors.discountCents && (
                    <span className="text-sm text-red-500">
                      {errors.discountCents.message}
                    </span>
                  )}
                </div>

                {/* Valor do contrato */}
                <div className="space-y-2">
                  <Label className="text-base font-medium text-gray-900 dark:text-white">
                    Valor do Contrato
                  </Label>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                    <span className="text-xl font-bold text-blue-800 dark:text-blue-200">
                      {formatCurrency(calculateContractValue())}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Seção 3: Forma de Pagamento */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              3. Forma de Pagamento
            </h3>

            {/* Parcelas */}
            <div className="space-y-2">
              <ControlledSelect
                control={control}
                name="installmentsCount"
                label="Parcelas"
                placeholder="Selecione"
                options={[
                  { value: "1", label: "1 (à vista)" },
                  { value: "2", label: "2 parcelas" },
                  { value: "3", label: "3 parcelas" },
                  { value: "4", label: "4 parcelas" },
                  { value: "6", label: "6 parcelas" },
                  { value: "12", label: "12 parcelas" },
                ]}
              />
              {errors.installmentsCount && (
                <span className="text-sm text-red-500">
                  {errors.installmentsCount.message}
                </span>
              )}

              {/* Prévia das parcelas */}
              {parseInt(watchedValues.installmentsCount || "1") > 1 &&
                selectedEntryModel && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Prévia:</strong> {watchedValues.installmentsCount}
                      x de{" "}
                      {formatCurrency(
                        Math.floor(
                          calculateContractValue() /
                            parseInt(watchedValues.installmentsCount)
                        )
                      )}
                      {calculateContractValue() %
                        parseInt(watchedValues.installmentsCount) >
                        0 &&
                        ` (última: ${formatCurrency(
                          Math.floor(
                            calculateContractValue() /
                              parseInt(watchedValues.installmentsCount)
                          ) +
                            (calculateContractValue() %
                              parseInt(watchedValues.installmentsCount))
                        )})`}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Seção 4: Documentos e Observações */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              4. Documentos e Observações
            </h3>

            {/* Comprovante */}
            <div className="space-y-2">
              <Label className="text-base font-medium text-gray-900 dark:text-white">
                Anexar Comprovante (opcional)
              </Label>
              {!attachedFile ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-300" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Clique para anexar PDF ou JPG (máx. 10MB)
                    </p>
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      {attachedFile.name}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-300">
                      {(attachedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAttachedFile(null)}
                  >
                    <Trash2 className="w-4 h-4 text-gray-600 dark:text-white" />
                  </Button>
                </div>
              )}
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label className="text-base font-medium text-gray-900 dark:text-white">
                Observações (opcional)
              </Label>
              <textarea
                {...register("notes")}
                placeholder="Observações sobre a receita..."
                rows={3}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createRevenueMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={
                createRevenueMutation.isPending ||
                !selectedClient ||
                !selectedEntryModel
              }
            >
              {createRevenueMutation.isPending
                ? "Salvando..."
                : "Salvar Receita"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
