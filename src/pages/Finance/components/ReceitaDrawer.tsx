import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useStandService } from "@/service/stands.service";
import { 
  useClients, 
  useCreateClient, 
  useEntryModels, 
  useCreateRevenue 
} from "@/hooks/useFinance";
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
import { StandSelector } from "@/components/StandSelector";
import { X, Search, Plus, Upload, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { maskCurrencyBRL } from "@/utils/masks";

import type {
  CreateRevenueForm,
  EntryModelType,
  Stand,
} from "@/interfaces/finance";

interface ReceitaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  revenueId?: string | null;
  fairId?: string;
  prefilledStandNumber?: number | null;
}

// Schema de validação completo com validações contextuais
const revenueSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
  standNumber: z.number().optional(), // Stand é opcional para patrocínios
  entryModelId: z.string().min(1, "Selecione um stand/patrocínio"),
  baseValueCents: z.string().min(1, "Valor base é obrigatório"),
  contractValueCents: z.string().min(1, "Valor do contrato é obrigatório"),
  discountCents: z.string().min(1, "Desconto é obrigatório"),
  paymentMethod: z.enum(
    ["PIX", "BOLETO", "CARTAO", "TED", "DINHEIRO", "TRANSFERENCIA"],
    {
      required_error: "Selecione um método de pagamento",
    }
  ),
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

export function ReceitaDrawer({
  isOpen,
  onClose,
  fairId,
  prefilledStandNumber,
}: ReceitaDrawerProps) {
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedStand, setSelectedStand] = useState<{
    standNumber: number;
    stand: Stand;
  } | null>(null);
  const [selectedEntryModel, setSelectedEntryModel] = useState<{
    id: string;
    name: string;
    baseValue: number;
    type: string;
  } | null>(null);
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [showStandConfirmation, setShowStandConfirmation] = useState(false);

  const { user } = useAuth();
  const standService = useStandService();

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
      clientId: "",
      standNumber: 0,
      entryModelId: "",
      baseValueCents: "R$ 0,00",
      contractValueCents: "R$ 0,00",
      discountCents: "R$ 0,00",
      installmentsCount: "1",
      paymentMethod: "PIX", // Valor padrão
      notes: "",
    },
  });

  // Form para criar cliente
  const {
    control: controlClient,
    handleSubmit: handleSubmitClient,
    reset: resetClient,
    setValue: setValueClient,
  } = useForm<CreateClientData>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      fairId: fairId || "",
    },
  });

  // Watch apenas os valores necessários para evitar re-renders excessivos
  const contractValueCents = watch("contractValueCents");
  const installmentsCount = watch("installmentsCount");
  const standNumber = watch("standNumber");

  // Query para buscar todos os clientes quando o formulário abrir
  const { data: allClients = [], isLoading: isLoadingClients } = useClients();

  // Query para buscar modelos de entrada
  const { data: entryModels = [] } = useEntryModels(fairId);

  // Filtro de clientes no frontend baseado no texto digitado
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) {
      return allClients;
    }
    
    const searchTerm = clientSearch.toLowerCase().trim();
    return allClients.filter((client: any) => 
      client.name.toLowerCase().includes(searchTerm) ||
      client.cnpj?.toLowerCase().includes(searchTerm) ||
      client.email?.toLowerCase().includes(searchTerm)
    );
  }, [allClients, clientSearch]);

  // Mutation para criar cliente usando hook centralizado
  const createClientMutation = useCreateClient();

  // Mutation para criar receita usando hook centralizado
  const createRevenueMutation = useCreateRevenue();

  // Reset form quando drawer fecha
  useEffect(() => {
    if (!isOpen) {
      reset();
      setSelectedClient(null);
      setSelectedStand(null);
      setSelectedEntryModel(null);
      setClientSearch("");
      setShowCreateClient(false);
      setAttachedFile(null);
      resetClient();
    }
  }, [isOpen]);

  // Atualiza o fairId no formulário de cliente quando disponível
  useEffect(() => {
    if (fairId) {
      setValueClient("fairId", fairId);
    }
  }, [fairId]);

  // Pré-seleciona o stand quando prefilledStandNumber está disponível
  useEffect(() => {
    const loadPrefilledStand = async () => {
      if (prefilledStandNumber && isOpen && fairId) {
        setValue("standNumber", prefilledStandNumber);

        // Busca o stand completo para atualizar o selectedStand
        try {
          const availableStands = await standService.getAvailableStands(fairId);
          if (availableStands) {
            const stand = availableStands.find(
              (s: any) => s.standNumber === prefilledStandNumber
            );
            if (stand) {
              setSelectedStand({ standNumber: prefilledStandNumber, stand });
            }
          }
        } catch (error) {
          console.error("Erro ao buscar stand pré-selecionado:", error);
        }
      }
    };

    loadPrefilledStand();
  }, [prefilledStandNumber, isOpen, fairId]);

  // Calcula automaticamente o desconto quando o valor do contrato muda
  useEffect(() => {
    if (selectedEntryModel) {
      const contractValue = parseMaskedCurrency(contractValueCents || "0");
      const baseValue = selectedEntryModel.baseValue;
      const discount = Math.max(0, baseValue - contractValue);

      console.log("Calculando desconto:", {
        contractValueCents,
        contractValue,
        baseValue,
        discount,
      });

      // Converte o desconto para formato mascarado antes de definir
      const discountFormatted = formatCurrency(discount);
      setValue("discountCents", discountFormatted);
    }
  }, [contractValueCents, selectedEntryModel]);

  // Garante que os valores sejam definidos corretamente quando o modelo for selecionado
  useEffect(() => {
    if (selectedEntryModel) {
      console.log("Definindo valores do modelo:", selectedEntryModel);

      // Converte o valor base para formato mascarado
      const baseValueFormatted = formatCurrency(selectedEntryModel.baseValue);
      setValue("baseValueCents", baseValueFormatted);
      setValue("contractValueCents", baseValueFormatted);
      setValue("discountCents", "R$ 0,00");
      setValue("entryModelId", selectedEntryModel.id);

      console.log("Valores definidos:", {
        baseValue: selectedEntryModel.baseValue,
        baseValueFormatted,
        discountCents: "R$ 0,00",
      });
    }
  }, [selectedEntryModel]);

  // Se não há fairId, não renderiza o conteúdo principal
  const hasValidFairId = fairId && fairId.trim() !== "";

  if (!hasValidFairId && isOpen) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full max-w-4xl min-w-[40rem] overflow-y-auto p-6">
          <SheetHeader className="border-b border-gray-200/30 dark:border-gray-700/30 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Erro
              </SheetTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4 text-gray-600 dark:text-white" />
              </Button>
            </div>
          </SheetHeader>
          <div className="p-6 text-center">
            <p className="text-lg text-red-600 dark:text-red-400 mb-4">
              É necessário selecionar uma feira para criar uma receita.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Por favor, selecione uma feira válida no seletor do cabeçalho e
              tente novamente.
            </p>
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Helpers
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  // Converte valor mascarado (ex: "9.000,00") para número em centavos
  const parseMaskedCurrency = (maskedValue: string): number => {
    if (!maskedValue || maskedValue === "0") return 0;

    // Remove todos os caracteres não numéricos exceto vírgula e ponto
    const cleanValue = maskedValue.replace(/[^\d,.-]/g, "");

    // Se não tem vírgula, é um valor inteiro
    if (!cleanValue.includes(",")) {
      return parseInt(cleanValue);
    }

    // Separa parte inteira e decimal
    const parts = cleanValue.split(",");
    const integerPart = parts[0].replace(/\./g, ""); // Remove pontos de milhares
    const decimalPart = parts[1] || "00";

    // Converte para centavos (multiplica por 100 para converter reais para centavos)
    const totalCents =
      parseInt(integerPart) * 100 + parseInt(decimalPart.padEnd(2, "0"));

    console.log("parseMaskedCurrency:", {
      maskedValue,
      cleanValue,
      integerPart,
      decimalPart,
      totalCents,
    });

    return totalCents;
  };

  const calculateContractValue = () => {
    if (!selectedEntryModel) return 0;
    return (
      parseMaskedCurrency(contractValueCents || "0") ||
      selectedEntryModel.baseValue
    );
  };

  // Handlers
  const handleClientSelect = (client: { id: string; name: string }) => {
    setSelectedClient(client);
    setValue("clientId", client.id);
    setClientSearch("");
  };

  const handleStandSelect = (standNumber: number, stand: Stand) => {
    setSelectedStand({ standNumber, stand });
    setValue("standNumber", standNumber);
  };

  const handleEntryModelSelect = (entryModelId: string) => {
    const model = entryModels.find((m: any) => m.id === entryModelId);
    if (model) {
      setSelectedEntryModel({
        id: model.id,
        name: model.name,
        baseValue: model.baseValue,
        type: model.type,
      });

      // Define o entryModelId no formulário
      setValue("entryModelId", entryModelId);

      console.log("Entry model selecionado:", {
        id: model.id,
        name: model.name,
        type: model.type,
        entryModelId: entryModelId,
      });
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

    console.log("Dados do cliente sendo enviados:", data);
    createClientMutation.mutate(data, {
      onSuccess: (newClient) => {
        console.log("Cliente criado com sucesso:", newClient);
        if (newClient) {
          toast.success("Cliente criado com sucesso!");
          setSelectedClient({ id: newClient.id, name: newClient.name });
          setValue("clientId", newClient.id);
          setShowCreateClient(false);
          resetClient();
          // A lista de clientes será recarregada automaticamente pelo React Query
        } else {
          console.error("Resposta do servidor não contém dados do cliente");
          toast.error("Erro: resposta inválida do servidor");
        }
      },
      onError: (error: any) => {
        console.error("Erro completo na criação do cliente:", error);
        toast.error(
          `Erro ao criar cliente: ${error.message || "Erro desconhecido"}`
        );
      },
    });
  };

  const handleConfirmWithoutStand = () => {
    setShowStandConfirmation(false);
    // Executa o submit novamente, agora sem validação de stand
    handleSubmit(onSubmitWithoutStandValidation)();
  };

  const handleCancelWithoutStand = () => {
    setShowStandConfirmation(false);
  };

  const onSubmitWithoutStandValidation = (data: RevenueFormData) => {
    console.log("=== SUBMIT SEM VALIDAÇÃO DE STAND ===");
    console.log("Dados do formulário:", data);
    console.log("Modelo selecionado:", selectedEntryModel);
    console.log("Cliente selecionado:", selectedClient);
    console.log("Stand selecionado:", selectedStand);
    console.log("FairId:", fairId);
    console.log("User ID:", user?.id);

    if (!fairId) {
      toast.error("FairId não encontrado");
      return;
    }

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

    // Validação contextual do valor do contrato em relação ao valor base
    const contractValueForValidation = parseMaskedCurrency(
      data.contractValueCents
    );
    if (contractValueForValidation > selectedEntryModel.baseValue) {
      toast.error("Valor do contrato não pode ser maior que o valor base");
      return;
    }

    // Usar os valores do formulário (já calculados automaticamente)
    const baseValue =
      parseMaskedCurrency(data.baseValueCents) || selectedEntryModel.baseValue;
    const contractValue = parseMaskedCurrency(data.contractValueCents);
    const discountCents = parseMaskedCurrency(data.discountCents);

    // Garantir que os valores são números válidos
    const numericBaseValue = Number(baseValue);
    const numericContractValue = Number(contractValue);
    const numericDiscountCents = Number(discountCents);

    console.log("Valores sendo enviados:", {
      baseValue: numericBaseValue,
      contractValue: numericContractValue,
      discountCents: numericDiscountCents,
      typeof_baseValue: typeof numericBaseValue,
      typeof_contractValue: typeof numericContractValue,
      typeof_discountCents: typeof numericDiscountCents,
    });

    const formData: CreateRevenueForm = {
      fairId: fairId,
      standNumber: 0, // Sem stand (patrocínio)
      type: selectedEntryModel.type as EntryModelType,
      entryModelId: selectedEntryModel.id,
      clientId: selectedClient.id,
      baseValue: numericBaseValue,
      discountCents: numericDiscountCents,
      contractValue: numericContractValue,
      paymentMethod: data.paymentMethod || "PIX",
      numberOfInstallments: parseInt(data.installmentsCount),
      createdBy: user.id.toString(),
      condition: data.installmentsCount === "1" ? "À vista" : "Parcelado",
      notes: data.notes,
    };

    createRevenueMutation.mutate(formData);
  };

  const onSubmit = (data: RevenueFormData) => {
    console.log("=== SUBMIT INICIADO ===");
    console.log("Dados do formulário:", data);
    console.log("Modelo selecionado:", selectedEntryModel);
    console.log("Cliente selecionado:", selectedClient);
    console.log("Stand selecionado:", selectedStand);
    console.log("FairId:", fairId);
    console.log("User ID:", user?.id);

    if (!fairId) {
      toast.error("FairId não encontrado");
      return;
    }

    if (!selectedClient) {
      toast.error("Selecione um cliente");
      return;
    }

    // Se não há stand selecionado, mostra modal de confirmação
    if (!selectedStand) {
      setShowStandConfirmation(true);
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

    // Validação contextual do valor do contrato em relação ao valor base
    const contractValueForValidation = parseMaskedCurrency(
      data.contractValueCents
    );
    if (contractValueForValidation > selectedEntryModel.baseValue) {
      toast.error("Valor do contrato não pode ser maior que o valor base");
      return;
    }

    // Usar os valores do formulário (já calculados automaticamente)
    const baseValue =
      parseMaskedCurrency(data.baseValueCents) || selectedEntryModel.baseValue;
    const contractValue = parseMaskedCurrency(data.contractValueCents);
    const discountCents = parseMaskedCurrency(data.discountCents);

    // Garantir que os valores são números válidos
    const numericBaseValue = Number(baseValue);
    const numericContractValue = Number(contractValue);
    const numericDiscountCents = Number(discountCents);

    console.log("Valores sendo enviados:", {
      baseValue: numericBaseValue,
      contractValue: numericContractValue,
      discountCents: numericDiscountCents,
      typeof_baseValue: typeof numericBaseValue,
      typeof_contractValue: typeof numericContractValue,
      typeof_discountCents: typeof numericDiscountCents,
    });

    const formData: CreateRevenueForm = {
      fairId: fairId,
      standNumber:
        selectedEntryModel?.type === "STAND"
          ? selectedStand?.standNumber || 0
          : 0, // Stand apenas para stands
      type: selectedEntryModel.type as EntryModelType, // Tipo do modelo (STAND ou PATROCINIO)
      entryModelId: selectedEntryModel.id,
      clientId: selectedClient.id,
      baseValue: numericBaseValue,
      discountCents: numericDiscountCents,
      contractValue: numericContractValue,
      paymentMethod: data.paymentMethod || "PIX", // Método de pagamento selecionado
      numberOfInstallments: parseInt(data.installmentsCount), // Número de parcelas
      createdBy: user.id.toString(), // ID do usuário logado como string
      condition: data.installmentsCount === "1" ? "À vista" : "Parcelado", // Condição opcional
      notes: data.notes, // Observações opcionais
    };

    createRevenueMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Receita criada com sucesso!");
        onClose();
        reset();
        setSelectedClient(null);
        setSelectedStand(null);
        setSelectedEntryModel(null);
        setAttachedFile(null);
        // As queries serão invalidadas automaticamente pelo hook centralizado
      },
      onError: (error: any) => {
        console.error("Erro ao criar receita:", error);
        toast.error(
          `Erro ao criar receita: ${error.message || "Erro desconhecido"}`
        );
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full max-w-4xl min-w-[40rem] overflow-y-auto p-6">
        <SheetHeader className="border-b border-gray-200/30 dark:border-gray-700/30 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Nova Receita
            </SheetTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4 text-gray-600 dark:text-white" />
            </Button>
          </div>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit, (errors) => {
            console.log("=== ERROS DE VALIDAÇÃO ===");
            console.log("Erros:", errors);
          })}
          className="space-y-6"
        >
          {/* Cliente */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-base font-medium text-gray-900 dark:text-gray-100">
                Cliente *
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCreateClient(!showCreateClient)}
              >
                <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
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
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
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
                    <Search className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </Button>
                </div>

                {isLoadingClients && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Buscando clientes...
                  </div>
                )}

                {filteredClients.length > 0 && (
                  <div className="max-h-32 overflow-y-auto border rounded p-2 space-y-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    {filteredClients.map((client: any) => (
                      <button
                        key={client.id}
                        type="button"
                        className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-gray-900 dark:text-gray-100 transition-colors"
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
              <span className="text-sm text-red-500 dark:text-red-400">
                {errors.clientId.message}
              </span>
            )}

            {/* Mini form criar cliente */}
            {showCreateClient && (
              <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">
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

          {/* Seletor de Stand */}
          {fairId && (
            <div className="space-y-2">
              <StandSelector
                fairId={fairId}
                value={standNumber || selectedStand?.standNumber}
                onChange={handleStandSelect}
                error={errors.standNumber?.message}
              />
            </div>
          )}

          {/* Modelo */}
          <div className="space-y-2">
            <Label className="text-base font-medium text-gray-900 dark:text-gray-100">
              Tipo / Modelo (Stand/Patrocínio) *
            </Label>
            <Select onValueChange={handleEntryModelSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o stand ou patrocínio" />
              </SelectTrigger>
              <SelectContent>
                {entryModels.map((model: any) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name} — {formatCurrency(model.baseValue)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.entryModelId && (
              <span className="text-sm text-red-500 dark:text-red-400">
                {errors.entryModelId.message}
              </span>
            )}
          </div>

          {/* Grid de valores */}
          {selectedEntryModel && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Valor base */}
              <div className="space-y-2">
                <ControlledInput
                  control={control}
                  name="baseValueCents"
                  label="Valor Base (R$)"
                  placeholder="0,00"
                  mask={maskCurrencyBRL}
                  disabled
                />
              </div>

              {/* Desconto */}
              <div className="space-y-2">
                <ControlledInput
                  control={control}
                  name="discountCents"
                  label="Desconto (R$)"
                  placeholder="0,00"
                  mask={maskCurrencyBRL}
                  disabled
                />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Calculado automaticamente
                </p>
              </div>

              {/* Valor do contrato */}
              <div className="space-y-2">
                <ControlledInput
                  control={control}
                  name="contractValueCents"
                  label="Valor do Contrato (R$)"
                  placeholder="0,00"
                  mask={maskCurrencyBRL}
                />
              </div>
            </div>
          )}

          {/* Método de Pagamento e Parcelas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Método de Pagamento */}
            <div className="space-y-2">
              <ControlledSelect
                control={control}
                name="paymentMethod"
                label="Método de Pagamento *"
                placeholder="Selecione"
                options={[
                  { value: "PIX", label: "PIX" },
                  { value: "BOLETO", label: "Boleto" },
                  { value: "CARTAO", label: "Cartão" },
                  { value: "TED", label: "TED" },
                  { value: "DINHEIRO", label: "Dinheiro" },
                  { value: "TRANSFERENCIA", label: "Transferência" },
                ]}
              />
              {errors.paymentMethod && (
                <span className="text-sm text-red-500 dark:text-red-400">
                  {errors.paymentMethod.message}
                </span>
              )}
            </div>

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
                <span className="text-sm text-red-500 dark:text-red-400">
                  {errors.installmentsCount.message}
                </span>
              )}

              {/* Prévia das parcelas */}
              {parseInt(installmentsCount || "1") > 1 && selectedEntryModel && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Prévia:</strong> {installmentsCount}x de{" "}
                    {formatCurrency(
                      Math.floor(
                        calculateContractValue() /
                          parseInt(installmentsCount || "1")
                      )
                    )}
                    {calculateContractValue() %
                      parseInt(installmentsCount || "1") >
                      0 &&
                      ` (última: ${formatCurrency(
                        Math.floor(
                          calculateContractValue() /
                            parseInt(installmentsCount || "1")
                        ) +
                          (calculateContractValue() %
                            parseInt(installmentsCount || "1"))
                      )})`}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comprovante */}
          <div className="space-y-2">
            <Label className="text-base font-medium text-gray-900 dark:text-gray-100">
              Anexar Comprovante (opcional)
            </Label>
            {!attachedFile ? (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-300" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
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
                  <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </Button>
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label className="text-base font-medium text-gray-900 dark:text-gray-100">
              Observações (opcional)
            </Label>
            <textarea
              {...register("notes")}
              placeholder="Observações sobre a receita..."
              rows={3}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Ações */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200/30 dark:border-gray-700/30">
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
              disabled={!selectedClient || !selectedEntryModel}
            >
              {createRevenueMutation.isPending
                ? "Salvando..."
                : "Salvar Receita"}
            </Button>
          </div>
        </form>

        {/* Modal de confirmação para cadastro sem stand */}
        {showStandConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirmar cadastro sem stand
                </h3>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Você está tentando cadastrar uma receita sem selecionar um
                stand. Isso indica que é um patrocínio ou serviço que não requer
                localização física.
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                <strong>Confirma que é um patrocínio?</strong>
              </p>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleCancelWithoutStand}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmWithoutStand}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Sim, é um patrocínio
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
