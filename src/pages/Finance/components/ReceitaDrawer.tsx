import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useAvailableStands } from "@/hooks/useAvailableStands";
import {
  useClients,
  useEntryModels,
  useCreateRevenue,
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
import {
  X,
  Search,
  AlertTriangle,
  DollarSign,
  FileText,
  User,
  Building2,
  Check,
  CreditCard,
  ChevronRight,
  Star,
  MapPin,
} from "lucide-react";
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

const revenueSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
  standNumber: z.number().optional(),
  entryModelId: z.string().min(1, "Selecione um stand/patrocínio"),
  baseValueCents: z.string().min(1, "Valor base é obrigatório"),
  contractValueCents: z.string().min(1, "Valor do contrato é obrigatório"),
  discountCents: z.string().min(1, "Desconto é obrigatório"),
  paymentMethod: z.enum(
    ["PIX", "BOLETO", "CARTAO", "TED", "DINHEIRO", "TRANSFERENCIA"],
    { required_error: "Selecione um método de pagamento" }
  ),
  installmentsCount: z.string().min(1, "Quantidade de parcelas inválida"),
  notes: z.string().optional(),
});

type RevenueFormData = z.infer<typeof revenueSchema>;

const STEPS = [
  { id: 1, label: "Cliente", icon: User },
  { id: 2, label: "Stand", icon: Building2 },
  { id: 3, label: "Valores", icon: DollarSign },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: "PIX",
  BOLETO: "Boleto",
  CARTAO: "Cartão",
  TED: "TED",
  DINHEIRO: "Dinheiro",
  TRANSFERENCIA: "Transferência",
};

interface SummaryRowProps {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  highlight?: boolean;
  color?: string;
}

function SummaryRow({ icon: Icon, label, value, highlight, color }: SummaryRowProps) {
  const filled = !!value;
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <Icon
          size={13}
          className={filled ? (color || "text-slate-300") : "text-slate-600"}
        />
        <span
          className={`text-xs font-medium truncate ${
            filled ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {label}
        </span>
      </div>
      <span
        className={`text-xs font-black tracking-tight text-right truncate max-w-[55%] ${
          highlight
            ? "text-[#00aacd] text-sm"
            : filled
            ? "text-white"
            : "text-slate-600"
        }`}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

export function ReceitaDrawer({
  isOpen,
  onClose,
  fairId,
  prefilledStandNumber,
  revenueId,
}: ReceitaDrawerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [revenueType, setRevenueType] = useState<"STAND" | "PATROCINIO">("STAND");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<{
    id: string;
    name: string;
    cnpj?: string;
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
  const [showStandConfirmation, setShowStandConfirmation] = useState(false);

  const { user } = useAuth();
  const { data: availableStands } = useAvailableStands(fairId, isOpen && !!prefilledStandNumber);

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
      paymentMethod: "PIX",
      notes: "",
    },
  });

  const contractValueCents = watch("contractValueCents");
  const installmentsCount = watch("installmentsCount");
  const paymentMethod = watch("paymentMethod");
  const standNumber = watch("standNumber");

  const { data: allClients = [], isLoading: isLoadingClients } = useClients(fairId, undefined, isOpen && !!fairId);
  const { data: entryModels = [] } = useEntryModels(fairId, undefined, isOpen && !!fairId);

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return allClients;
    const searchTerm = clientSearch.toLowerCase().trim();
    return allClients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm) ||
        client.cnpj?.toLowerCase().includes(searchTerm) ||
        client.email?.toLowerCase().includes(searchTerm)
    );
  }, [allClients, clientSearch]);

  const createRevenueMutation = useCreateRevenue();

  const filteredEntryModels = useMemo(
    () => entryModels.filter((m) => m.type === revenueType),
    [entryModels, revenueType]
  );

  useEffect(() => {
    if (!isOpen) {
      reset();
      setCurrentStep(1);
      setRevenueType("STAND");
      setSelectedClient(null);
      setSelectedStand(null);
      setSelectedEntryModel(null);
      setClientSearch("");
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (isOpen && fairId && prefilledStandNumber) {
      setValue("standNumber", prefilledStandNumber);
      setSelectedStand(null);
    }
  }, [prefilledStandNumber, isOpen, fairId, setValue]);

  useEffect(() => {
    if (!isOpen || !prefilledStandNumber || standNumber !== prefilledStandNumber) return;
    const stand = availableStands?.find((s) => s.standNumber === prefilledStandNumber);
    setSelectedStand(stand ? { standNumber: prefilledStandNumber, stand } : null);
  }, [availableStands, prefilledStandNumber, isOpen, standNumber]);

  useEffect(() => {
    if (selectedEntryModel) {
      const contractValue = parseMaskedCurrency(contractValueCents || "0");
      const baseValue = selectedEntryModel.baseValue;
      const discount = Math.max(0, baseValue - contractValue);
      setValue("discountCents", formatCurrency(discount));
    }
  }, [contractValueCents, selectedEntryModel, setValue]);

  useEffect(() => {
    if (selectedEntryModel) {
      const baseValueFormatted = formatCurrency(selectedEntryModel.baseValue);
      setValue("baseValueCents", baseValueFormatted);
      setValue("contractValueCents", baseValueFormatted);
      setValue("discountCents", "R$ 0,00");
      setValue("entryModelId", selectedEntryModel.id);
    }
  }, [selectedEntryModel, setValue]);

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
              Por favor, selecione uma feira válida no seletor do cabeçalho e tente novamente.
            </p>
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      cents / 100
    );

  const parseMaskedCurrency = (maskedValue: string): number => {
    if (!maskedValue || maskedValue === "0") return 0;
    const cleanValue = maskedValue.replace(/[^\d,.-]/g, "");
    if (!cleanValue.includes(",")) return parseInt(cleanValue);
    const parts = cleanValue.split(",");
    const integerPart = parts[0].replace(/\./g, "");
    const decimalPart = parts[1] || "00";
    return parseInt(integerPart) * 100 + parseInt(decimalPart.padEnd(2, "0"));
  };

  const calculateContractValue = () =>
    parseMaskedCurrency(contractValueCents || "0") ||
    (selectedEntryModel?.baseValue ?? 0);

  // ── Step navigation ───────────────────────────────────────────────────────
  const handleNextStep = () => {
    if (currentStep === 1 && !selectedClient) {
      toast.error("Selecione um cliente para continuar");
      return;
    }
    if (currentStep === 2 && !selectedEntryModel) {
      toast.error("Selecione um modelo de entrada para continuar");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // ── Handlers ──────────────────────────────────────────────────────────────
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
    const model = entryModels.find((m) => m.id === entryModelId);
    if (model) {
      setSelectedEntryModel({
        id: model.id,
        name: model.name,
        baseValue: model.baseValue,
        type: model.type,
      });
      setValue("entryModelId", entryModelId);
    }
  };

  const handleConfirmWithoutStand = () => {
    setShowStandConfirmation(false);
    handleSubmit(onSubmitWithoutStandValidation)();
  };

  const handleCancelWithoutStand = () => setShowStandConfirmation(false);

  const buildFormData = (data: RevenueFormData, withStand: boolean): CreateRevenueForm => {
    const baseValue =
      parseMaskedCurrency(data.baseValueCents) || selectedEntryModel!.baseValue;
    const contractValue = parseMaskedCurrency(data.contractValueCents);
    const discountCents = parseMaskedCurrency(data.discountCents);

    return {
      fairId: fairId!,
      standNumber: withStand && selectedEntryModel?.type === "STAND"
        ? selectedStand?.standNumber || 0
        : 0,
      type: selectedEntryModel!.type as EntryModelType,
      entryModelId: selectedEntryModel!.id,
      clientId: selectedClient!.id,
      baseValue: Number(baseValue),
      discountCents: Number(discountCents),
      contractValue: Number(contractValue),
      paymentMethod: data.paymentMethod || "PIX",
      numberOfInstallments: parseInt(data.installmentsCount),
      createdBy: user!.id.toString(),
      condition: data.installmentsCount === "1" ? "À vista" : "Parcelado",
      notes: data.notes,
    };
  };

  const onSubmitWithoutStandValidation = (data: RevenueFormData) => {
    if (!fairId || !selectedClient || !selectedEntryModel || !user?.id) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    const contractValueForValidation = parseMaskedCurrency(data.contractValueCents);
    if (contractValueForValidation > selectedEntryModel.baseValue) {
      toast.error("Valor do contrato não pode ser maior que o valor base");
      return;
    }
    createRevenueMutation.mutate(buildFormData(data, false));
  };

  const onSubmit = (data: RevenueFormData) => {
    if (!fairId || !selectedClient || !user?.id) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (revenueType === "STAND" && !selectedStand) {
      setShowStandConfirmation(true);
      return;
    }
    if (!selectedEntryModel) {
      toast.error("Selecione um stand/patrocínio");
      return;
    }
    const contractValueForValidation = parseMaskedCurrency(data.contractValueCents);
    if (contractValueForValidation > selectedEntryModel.baseValue) {
      toast.error("Valor do contrato não pode ser maior que o valor base");
      return;
    }
    createRevenueMutation.mutate(buildFormData(data, true), {
      onSuccess: () => {
        onClose();
        reset();
        setSelectedClient(null);
        setSelectedStand(null);
        setSelectedEntryModel(null);
      },
    });
  };

  // ── Summary values ────────────────────────────────────────────────────────
  const summaryContractValue =
    contractValueCents && contractValueCents !== "R$ 0,00"
      ? contractValueCents
      : null;
  const summaryInstallments =
    parseInt(installmentsCount || "1") > 1 && calculateContractValue() > 0
      ? `${installmentsCount}x de ${formatCurrency(
          Math.floor(calculateContractValue() / parseInt(installmentsCount || "1"))
        )}`
      : "À vista";
  const summaryStand = selectedStand
    ? `Stand Nº ${selectedStand.standNumber}`
    : revenueType === "PATROCINIO"
    ? "Patrocínio (sem stand)"
    : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full max-w-3xl min-w-[760px] overflow-y-auto p-0 border-none bg-white dark:bg-slate-950 flex flex-col">

        {/* Header */}
        <div className="relative h-36 w-full flex items-end p-8 bg-linear-to-br from-[#00aacd] to-[#EB2970] overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
          <div className="relative z-10 w-full flex items-center justify-between">
            <div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                Gestão Financeira
              </p>
              <SheetTitle className="text-2xl font-black text-white tracking-tighter">
                {revenueId ? "Editar Receita" : "Nova Receita"}
              </SheetTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/60 hover:text-white hover:bg-white/10 rounded-full h-10 w-10 transition-all"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0 px-8 py-5 border-b border-slate-800 shrink-0">
          {STEPS.map((step, idx) => {
            const done = currentStep > step.id;
            const active = currentStep === step.id;
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-300 ${
                      done
                        ? "bg-[#00aacd] border-[#00aacd] text-white"
                        : active
                        ? "border-[#00aacd] text-[#00aacd] bg-[#00aacd]/10"
                        : "border-slate-700 text-slate-500"
                    }`}
                  >
                    {done ? <Check size={12} /> : <Icon size={13} />}
                  </div>
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider transition-colors ${
                      active ? "text-white" : done ? "text-[#00aacd]" : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`h-px w-10 mx-3 transition-colors duration-300 ${
                      done ? "bg-[#00aacd]" : "bg-slate-700"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5 h-full"
          >
            {/* ── Step 1: Cliente ── */}
            {currentStep === 1 && (
              <div className="space-y-5 flex-1">
                <div className="bg-slate-900 rounded-3xl p-5 border border-slate-700/60 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#00aacd]/15 text-[#00aacd]">
                      <User className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-black text-white tracking-tight">
                      Identificação do Cliente
                    </h3>
                  </div>

                  {selectedClient ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-3 bg-[#00aacd]/10 border border-[#00aacd]/25 rounded-xl">
                        <p className="text-sm font-bold text-[#00aacd]">{selectedClient.name}</p>
                        {selectedClient.cnpj && (
                          <p className="text-xs text-slate-400 mt-0.5">{selectedClient.cnpj}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedClient(null)}
                        className="text-slate-400 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder="Buscar cliente por nome ou CNPJ..."
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          className="pl-9 bg-slate-800/70 border-slate-600/60 text-white placeholder:text-slate-400 rounded-xl h-10"
                        />
                      </div>

                      {isLoadingClients && (
                        <p className="text-xs text-slate-400 px-1">Buscando clientes...</p>
                      )}

                      {filteredClients.length > 0 && (
                        <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-700/60 divide-y divide-slate-700/60 bg-slate-800/60">
                          {filteredClients.map((client) => (
                            <button
                              key={client.id}
                              type="button"
                              className="w-full text-left px-3 py-2.5 hover:bg-white/10 transition-colors"
                              onClick={() => handleClientSelect(client)}
                            >
                              <p className="text-sm font-semibold text-white">{client.name}</p>
                              <div className="flex gap-3 mt-0.5">
                                {client.cnpj && (
                                  <span className="text-xs text-slate-400">{client.cnpj}</span>
                                )}
                                {client.email && (
                                  <span className="text-xs text-slate-400">{client.email}</span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {errors.clientId && (
                    <span className="text-xs text-red-400">{errors.clientId.message}</span>
                  )}
                </div>

              </div>
            )}

            {/* ── Step 2: Tipo + Stand/Patrocínio ── */}
            {currentStep === 2 && (
              <div className="space-y-4 flex-1">
                {/* Seletor de tipo */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRevenueType("STAND");
                      setSelectedEntryModel(null);
                      setValue("entryModelId", "");
                    }}
                    className={`p-5 rounded-3xl border-2 text-left transition-all duration-200 space-y-2 ${
                      revenueType === "STAND"
                        ? "border-[#F39B0C] bg-[#F39B0C]/10"
                        : "border-slate-700/60 bg-slate-900 hover:bg-slate-800/80 hover:border-slate-600"
                    }`}
                  >
                    <div className={`p-2 rounded-xl w-fit ${revenueType === "STAND" ? "bg-[#F39B0C]/20 text-[#F39B0C]" : "bg-slate-800 text-slate-400"}`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <p className={`font-black text-sm ${revenueType === "STAND" ? "text-white" : "text-slate-300"}`}>
                      Stand / Balcão
                    </p>
                    <p className="text-xs text-slate-400 leading-snug">
                      Venda de espaço físico na feira
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRevenueType("PATROCINIO");
                      setSelectedEntryModel(null);
                      setSelectedStand(null);
                      setValue("entryModelId", "");
                      setValue("standNumber", 0);
                    }}
                    className={`p-5 rounded-3xl border-2 text-left transition-all duration-200 space-y-2 ${
                      revenueType === "PATROCINIO"
                        ? "border-[#a855f7] bg-[#a855f7]/10"
                        : "border-slate-700/60 bg-slate-900 hover:bg-slate-800/80 hover:border-slate-600"
                    }`}
                  >
                    <div className={`p-2 rounded-xl w-fit ${revenueType === "PATROCINIO" ? "bg-[#a855f7]/20 text-[#a855f7]" : "bg-slate-800 text-slate-400"}`}>
                      <Star className="w-4 h-4" />
                    </div>
                    <p className={`font-black text-sm ${revenueType === "PATROCINIO" ? "text-white" : "text-slate-300"}`}>
                      Patrocínio
                    </p>
                    <p className="text-xs text-slate-400 leading-snug">
                      Cota de patrocínio sem stand físico
                    </p>
                  </button>
                </div>

                {/* Stand selector — somente para STAND */}
                {revenueType === "STAND" && fairId && (
                  <div className="bg-slate-900 rounded-3xl p-5 border border-slate-700/60">
                    <StandSelector
                      fairId={fairId}
                      value={standNumber || selectedStand?.standNumber}
                      onChange={handleStandSelect}
                      error={errors.standNumber?.message}
                    />
                  </div>
                )}

                {/* Modelo de entrada — filtrado por tipo */}
                <div className="bg-slate-900 rounded-3xl p-5 border border-slate-700/60 space-y-3">
                  <Label className="text-xs font-black text-slate-300 uppercase tracking-widest">
                    {revenueType === "STAND" ? "Modelo de Stand *" : "Cota de Patrocínio *"}
                  </Label>
                  <Select onValueChange={handleEntryModelSelect}>
                    <SelectTrigger className="h-10 rounded-xl border-slate-600/60 bg-slate-800/70 text-white">
                      <SelectValue placeholder={
                        filteredEntryModels.length === 0
                          ? "Nenhum modelo cadastrado para este tipo"
                          : "Selecione o modelo"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredEntryModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} — {formatCurrency(model.baseValue)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.entryModelId && (
                    <span className="text-xs text-red-400">{errors.entryModelId.message}</span>
                  )}
                  {filteredEntryModels.length === 0 && (
                    <p className="text-xs text-slate-400">
                      Configure os modelos em Feiras → Configurar Entrada.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 3: Valores & Pagamento ── */}
            {currentStep === 3 && (
              <div className="space-y-4 flex-1">
                {/* Valores */}
                <div className="bg-slate-900 rounded-3xl p-5 border border-slate-700/60 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#22c55e]/15 text-[#22c55e]">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-black text-white tracking-tight">
                      Valores
                    </h3>
                  </div>

                  {selectedEntryModel ? (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                          Valor Base
                        </Label>
                        <ControlledInput
                          control={control}
                          name="baseValueCents"
                          placeholder="0,00"
                          mask={maskCurrencyBRL}
                          disabled
                          className="bg-slate-800/70 border-slate-600/60 text-white disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                          Desconto
                        </Label>
                        <ControlledInput
                          control={control}
                          name="discountCents"
                          placeholder="0,00"
                          mask={maskCurrencyBRL}
                          disabled
                          className="bg-slate-800/70 border-slate-600/60 text-white disabled:opacity-60"
                        />
                        <p className="text-[9px] text-[#EB2970] font-black mt-1 uppercase tracking-wider">
                          Automático
                        </p>
                      </div>
                      <div>
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                          Valor Final *
                        </Label>
                        <ControlledInput
                          control={control}
                          name="contractValueCents"
                          placeholder="0,00"
                          mask={maskCurrencyBRL}
                          className="bg-slate-800/70 border-slate-600/60 text-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Selecione um modelo no passo anterior para ver os valores.
                    </p>
                  )}
                </div>

                {/* Pagamento */}
                <div className="bg-slate-900 rounded-3xl p-5 border border-slate-700/60 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#a855f7]/15 text-[#a855f7]">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-black text-white tracking-tight">
                      Pagamento
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <ControlledSelect
                      control={control}
                      name="paymentMethod"
                      label="Método *"
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
                    <ControlledSelect
                      control={control}
                      name="installmentsCount"
                      label="Parcelas"
                      placeholder="Selecione"
                      options={Array.from({ length: 12 }, (_, i) => ({
                        value: String(i + 1),
                        label: i === 0 ? "1 (à vista)" : `${i + 1} parcelas`,
                      }))}
                    />
                  </div>

                  {parseInt(installmentsCount || "1") > 1 && selectedEntryModel && (
                    <div className="flex items-center gap-2 p-3 bg-[#F39B0C]/5 border border-[#F39B0C]/20 rounded-xl">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#F39B0C] shrink-0" />
                      <span className="text-xs font-bold text-[#F39B0C]">
                        {installmentsCount}x de{" "}
                        {formatCurrency(
                          Math.floor(
                            calculateContractValue() /
                              parseInt(installmentsCount || "1")
                          )
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Notas */}
                <div className="bg-slate-900 rounded-3xl p-5 border border-slate-700/60 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-black text-slate-200 tracking-tight">
                      Observações
                    </h3>
                  </div>
                  <textarea
                    {...register("notes")}
                    placeholder="Detalhes adicionais sobre esta receita..."
                    rows={3}
                    className="w-full p-3 border border-slate-600/60 rounded-2xl resize-none bg-slate-800/70 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[#00aacd]/20 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* ── Resumo da Receita ── */}
            {currentStep === 3 && <div className="bg-slate-900/80 rounded-3xl p-5 border border-slate-700/60 space-y-3 shrink-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Resumo da Receita
              </p>
              <div className="space-y-2.5">
                <SummaryRow
                  icon={User}
                  label="Cliente"
                  value={selectedClient?.name}
                  color="text-[#00aacd]"
                />
                <SummaryRow
                  icon={Building2}
                  label="Stand / Modelo"
                  value={
                    selectedEntryModel
                      ? summaryStand
                        ? `${summaryStand} — ${selectedEntryModel.name}`
                        : selectedEntryModel.name
                      : null
                  }
                  color="text-[#F39B0C]"
                />
                <div className="border-t border-slate-700/60 pt-2.5 space-y-2">
                  <SummaryRow
                    icon={DollarSign}
                    label="Valor Final"
                    value={summaryContractValue}
                    highlight
                  />
                  <SummaryRow
                    icon={CreditCard}
                    label={PAYMENT_METHOD_LABELS[paymentMethod] ?? "Pagamento"}
                    value={selectedEntryModel ? summaryInstallments : null}
                    color="text-[#a855f7]"
                  />
                </div>
              </div>
            </div>}

            {/* ── Navigation ── */}
            <div className="flex items-center gap-2 pt-2 shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={createRevenueMutation.isPending}
                className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl font-bold h-11 px-5 text-sm"
              >
                Cancelar
              </Button>

              <div className="flex-1" />

              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handlePrevStep}
                  className="text-slate-300 hover:text-white hover:bg-white/10 rounded-xl font-bold h-11 px-5 text-sm border border-slate-700/60"
                >
                  Anterior
                </Button>
              )}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black h-11 px-6 text-sm border border-slate-600/60 flex items-center gap-2 transition-all"
                >
                  Próximo <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={
                    !selectedClient ||
                    !selectedEntryModel ||
                    createRevenueMutation.isPending
                  }
                  className="bg-linear-to-br from-[#00aacd] to-[#EB2970] text-white rounded-xl h-11 px-8 font-black uppercase tracking-widest shadow-xl shadow-pink-500/20 hover:scale-[1.02] transform transition-all active:scale-95 disabled:opacity-50 text-sm"
                >
                  {createRevenueMutation.isPending ? "Processando..." : "Confirmar"}
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Modal: sem stand */}
        {showStandConfirmation && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-[32px] p-8 max-w-md mx-4 border border-slate-700/60 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-yellow-500/15 rounded-2xl">
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-xl font-black text-white tracking-tighter">
                  Confirmar Patrocínio
                </h3>
              </div>
              <p className="text-slate-300 mb-8 leading-relaxed text-sm">
                Você está cadastrando uma receita sem stand físico. Isso será tratado como um{" "}
                <strong className="text-white">serviço ou patrocínio</strong>. Confirmar?
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="ghost"
                  onClick={handleCancelWithoutStand}
                  className="rounded-xl font-bold h-11 px-6 border border-slate-700/60 text-slate-300 hover:text-white"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleConfirmWithoutStand}
                  className="bg-[#00aacd] hover:bg-[#00aacd]/90 text-white rounded-xl h-11 px-6 font-bold"
                >
                  Sim, Confirmar
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
