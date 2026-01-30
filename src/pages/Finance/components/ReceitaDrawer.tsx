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
import { ControlledInput } from "@/components/ControlledInput";
import { ControlledSelect } from "@/components/ControlledSelect";
import { StandSelector } from "@/components/StandSelector";
import { X, Search, Plus, AlertTriangle, DollarSign, FileText } from "lucide-react";
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


export function ReceitaDrawer({
  isOpen,
  onClose,
  fairId,
  prefilledStandNumber,
  revenueId,
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

      // Converte o desconto para formato mascarado antes de definir
      const discountFormatted = formatCurrency(discount);
      setValue("discountCents", discountFormatted);
    }
  }, [contractValueCents, selectedEntryModel, setValue]);

  // Garante que os valores sejam definidos corretamente quando o modelo for selecionado
  useEffect(() => {
    if (selectedEntryModel) {
      // Converte o valor base para formato mascarado
      const baseValueFormatted = formatCurrency(selectedEntryModel.baseValue);
      setValue("baseValueCents", baseValueFormatted);
      setValue("contractValueCents", baseValueFormatted);
      setValue("discountCents", "R$ 0,00");
      setValue("entryModelId", selectedEntryModel.id);
    }
  }, [selectedEntryModel, setValue]);

  // Se não há fairId, não renderiza o conteúdo principal
  const hasValidFairId = fairId && fairId.trim() !== "";

  if (!hasValidFairId && isOpen) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full max-w-4xl min-w-160 overflow-y-auto p-6">
          <div className="border-b border-gray-200/30 dark:border-gray-700/30 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Erro
              </SheetTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4 text-gray-600 dark:text-white" />
              </Button>
            </div>
          </div>
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
      <SheetContent className="w-full max-w-4xl min-w-160 overflow-y-auto p-0 border-none bg-white dark:bg-slate-950">
        <div className="relative h-40 w-full flex items-end p-8 bg-linear-to-br from-[#00aacd] to-[#EB2970] overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
          
          <div className="relative z-10 w-full flex items-center justify-between">
            <div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                Gestão Financeira
              </p>
              <SheetTitle className="text-3xl font-black text-white tracking-tighter">
                {revenueId ? "Editar Receita" : "Nova Receita"}
              </SheetTitle>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-white/60 hover:text-white hover:bg-white/10 rounded-full h-12 w-12 transition-all duration-300"
            >
              <X className="w-8 h-8" />
            </Button>
          </div>
        </div>

        <div className="p-8">

        <form
          onSubmit={handleSubmit(onSubmit, (errors) => {
            console.log("=== ERROS DE VALIDAÇÃO ===");
            console.log("Erros:", errors);
          })}
          className="space-y-8"
        >
          {/* Sessão 1: Cliente */}
          <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/10 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-[#00aacd]/10 text-[#00aacd]">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Identificação do Cliente
              </h3>
            </div>
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
              <div className="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm">
                <h4 className="font-bold mb-3 text-slate-900 dark:text-white text-sm">
                  Novo Cadastro
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ControlledInput
                    control={controlClient}
                    name="name"
                    label="Nome *"
                    placeholder="Nome completo ou Razão Social"
                  />
                  <ControlledInput
                    control={controlClient}
                    name="cnpj"
                    label="CNPJ / CPF"
                    placeholder="00.000.000/0000-00"
                  />
                  <ControlledInput
                    control={controlClient}
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="exemplo@empresa.com"
                  />
                  <ControlledInput
                    control={controlClient}
                    name="phone"
                    label="Telefone"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="flex gap-2 mt-4 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateClient(false)}
                    className="text-slate-500"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSubmitClient(handleCreateClient)}
                    disabled={createClientMutation.isPending}
                    className="bg-[#00aacd] hover:bg-[#00aacd]/90 text-white font-bold rounded-lg px-4"
                  >
                    {createClientMutation.isPending
                      ? "Salvando..."
                      : "Confirmar"}
                  </Button>
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Sessão 2: Stand */}
          <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/10 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-[#F39B0C]/10 text-[#F39B0C]">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Configuração do Stand
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-900 dark:text-white">
                  Modelo / Patrocínio *
                </Label>
                <Select onValueChange={handleEntryModelSelect}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-white/10 dark:bg-slate-900">
                    <SelectValue placeholder="Selecione o tipo" />
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
                  <span className="text-xs text-red-500 font-medium">
                    {errors.entryModelId.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sessão 3: Valores */}
          <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/10 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-[#22c55e]/10 text-[#22c55e]">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Valores e Pagamento
              </h3>
            </div>

            {selectedEntryModel && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ControlledInput
                  control={control}
                  name="baseValueCents"
                  label="Valor Base"
                  placeholder="0,00"
                  mask={maskCurrencyBRL}
                  disabled
                />
                <div className="relative">
                  <ControlledInput
                    control={control}
                    name="discountCents"
                    label="Desconto"
                    placeholder="0,00"
                    mask={maskCurrencyBRL}
                    disabled
                  />
                  <p className="text-[10px] text-[#EB2970] font-bold mt-1 uppercase tracking-wider">
                    Automático
                  </p>
                </div>
                <ControlledInput
                  control={control}
                  name="contractValueCents"
                  label="Valor Final *"
                  placeholder="0,00"
                  mask={maskCurrencyBRL}
                />
              </div>
            )}
            {/* Método de Pagamento e Parcelas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
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
                  <span className="text-xs text-red-500 font-medium">
                    {errors.paymentMethod.message}
                  </span>
                )}
              </div>

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
                    { value: "5", label: "5 parcelas" },
                    { value: "6", label: "6 parcelas" },
                    { value: "7", label: "7 parcelas" },
                    { value: "8", label: "8 parcelas" },
                    { value: "9", label: "9 parcelas" },
                    { value: "10", label: "10 parcelas" },
                    { value: "11", label: "11 parcelas" },
                    { value: "12", label: "12 parcelas" },
                  ]}
                />
                {errors.installmentsCount && (
                  <span className="text-xs text-red-500 font-medium">
                    {errors.installmentsCount.message}
                  </span>
                )}
              </div>
            </div>

            {/* Prévia das parcelas */}
            {parseInt(installmentsCount || "1") > 1 && selectedEntryModel && (
              <div className="p-4 bg-[#F39B0C]/5 border border-[#F39B0C]/20 rounded-2xl">
                <div className="flex items-center gap-2 text-[#F39B0C] font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Resumo das Parcelas: {installmentsCount}x de {formatCurrency(Math.floor(calculateContractValue() / parseInt(installmentsCount || "1")))}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sessão 4: Informações Adicionais */}
          <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/10 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-slate-400/10 text-slate-400">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Informações Adicionais
              </h3>
            </div>


            {/* Observações */}
            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Observações
              </Label>
              <textarea
                {...register("notes")}
                placeholder="Detalhes adicionais..."
                rows={4}
                className="w-full p-4 border border-slate-200 dark:border-white/10 rounded-2xl resize-none bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#00aacd]/20 transition-all outline-none"
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 justify-end pt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createRevenueMutation.isPending}
              className="rounded-xl font-bold h-12 px-8 border-slate-200 dark:border-white/10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!selectedClient || !selectedEntryModel || createRevenueMutation.isPending}
              className="bg-linear-to-br from-[#00aacd] to-[#EB2970] text-white rounded-xl h-12 px-10 font-black uppercase tracking-widest shadow-xl shadow-pink-500/20 hover:scale-[1.02] transform transition-all active:scale-95 disabled:opacity-50"
            >
              {createRevenueMutation.isPending
                ? "Processando..."
                : "Confirmar Cadastro"}
            </Button>
          </div>
        </form>

        {/* Modal de confirmação para cadastro sem stand */}
        {showStandConfirmation && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 max-w-md mx-4 border border-slate-200 dark:border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-yellow-500/10 rounded-2xl">
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                  Confirmar Patrocínio
                </h3>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Você está cadastrando uma receita sem stand físico. Isso será tratado como um <strong>serviço ou patrocínio</strong>. Confirmar?
              </p>

              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={handleCancelWithoutStand}
                  className="rounded-xl font-bold h-12 px-6 border-slate-200 dark:border-white/10"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleConfirmWithoutStand}
                  className="bg-[#00aacd] hover:bg-[#00aacd]/90 text-white rounded-xl h-12 px-6 font-bold transition-all"
                >
                  Sim, Confirmar
                </Button>
              </div>
            </div>
          </div>
        )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
