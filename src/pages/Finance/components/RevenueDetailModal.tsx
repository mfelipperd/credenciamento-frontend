import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFinanceService } from "@/service/finance.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Calendar as CalendarIcon,
  DollarSign,
  User,
  Building,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Loader2,
  Upload,
  Edit,
} from "lucide-react";
import dayjs from "dayjs";
import type { InstallmentStatus } from "@/interfaces/finance";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { CreateRevenueForm, PaymentMethod } from "@/interfaces/finance";

// Schema e tipos para o dialog de confirmação
const confirmPaymentSchema = z.object({
  paidAt: z.date({
    required_error: "Data do pagamento é obrigatória",
  }),
  proofFile: z.instanceof(File).optional(),
});

type ConfirmPaymentForm = z.infer<typeof confirmPaymentSchema>;

// Componente interno para confirmar pagamento
function ConfirmPaymentDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paidAt: string, proofUrl?: string) => void;
  isLoading?: boolean;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<ConfirmPaymentForm>({
    resolver: zodResolver(confirmPaymentSchema),
    defaultValues: {
      paidAt: new Date(),
    },
  });

  const handleSubmit = async (data: ConfirmPaymentForm) => {
    try {
      let proofUrl: string | undefined;

      if (selectedFile) {
        console.log(
          "Upload de arquivo não implementado ainda:",
          selectedFile.name
        );
      }

      const paidAtISO = dayjs(data.paidAt).format("YYYY-MM-DD");
      onConfirm(paidAtISO, proofUrl);
    } catch (error) {
      console.error("Erro ao processar confirmação:", error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md z-[9999]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Confirmar Pagamento
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="paidAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-gray-900 dark:text-white">
                    Data do Pagamento *
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            dayjs(field.value).format("DD/MM/YYYY")
                          ) : (
                            <span>Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-background border shadow-lg z-[9999]"
                      align="start"
                      sideOffset={4}
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className="bg-background"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-white">
                Comprovante (opcional)
              </label>
              <div className="relative">
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Upload className="w-4 h-4" />
                    {selectedFile.name}
                  </div>
                )}
              </div>
            </div>

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
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Pagamento
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface RevenueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  revenueId: string | null;
  fairId?: string; // fairId da feira ativa
}

export function RevenueDetailModal({
  isOpen,
  onClose,
  revenueId,
  fairId,
}: RevenueDetailModalProps) {
  const [selectedInstallmentId, setSelectedInstallmentId] = useState<
    string | null
  >(null);
  const [isConfirmPaymentOpen, setIsConfirmPaymentOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    baseValue: 0,
    discountCents: 0,
    paymentMethod: "",
    notes: "",
  });

  const financeService = useFinanceService();
  const queryClient = useQueryClient();

  // Verificar se fairId e revenueId estão disponíveis
  const hasValidFairId = fairId && fairId.trim() !== "";
  const hasValidRevenueId = revenueId && revenueId.trim() !== "";

  if ((!hasValidFairId || !hasValidRevenueId) && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Erro - Dados Insuficientes
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {!hasValidFairId && "É necessário selecionar uma feira válida."}
              {!hasValidRevenueId && "ID da receita não foi fornecido."}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Por favor, selecione uma feira válida no cabeçalho e tente novamente.
            </p>
            <Button onClick={onClose}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Query para buscar detalhes da receita
  const { data: revenue, isLoading } = useQuery({
    queryKey: ["revenue-detail", revenueId, fairId],
    queryFn: () => financeService.getRevenueDetail(revenueId!, fairId),
    enabled: !!revenueId && !!fairId && isOpen,
  });

  // Dados mockados para teste quando o backend não estiver disponível
  const mockRevenue = revenueId
    ? {
        // Informações principais da receita
        id: revenueId,
        fairId: fairId || "feira-default",
        type: "STAND" as const,
        entryModelId: "model-1",
        clientId: "client-1",

        // Valores monetários (em centavos)
        baseValue: 500000, // R$ 5.000,00
        discountCents: 50000, // R$ 500,00
        contractValue: 450000, // R$ 4.500,00

        // Configurações de pagamento
        paymentMethod: "PIX" as const,
        numberOfInstallments: 2,

        // Status e informações adicionais
        status: "EM_ANDAMENTO" as const,
        condition: "Desconto promocional",
        notes: "Contrato assinado com desconto promocional",
        createdBy: "user-123",

        // Timestamps
        createdAt: "2025-08-08T10:30:00.000Z",
        updatedAt: "2025-08-08T10:30:00.000Z",

        // Relacionamentos
        client: {
          id: "client-1",
          name: "Empresa Teste Ltda",
          email: "contato@empresateste.com",
          cnpj: "12.345.678/0001-90",
        },
        entryModel: {
          id: "model-1",
          name: "Stand Premium 3x3",
          type: "STAND" as const,
        },
        installments: [
          {
            id: "inst-1",
            revenueId: revenueId,
            n: 1,
            valueCents: 225000,
            dueDate: "2025-09-08T00:00:00.000Z",
            paidAt: "2025-08-07T14:30:00.000Z",
            status: "PAGA" as const,
            proofUrl: null,
            createdAt: "2025-08-08T10:30:00.000Z",
            updatedAt: "2025-08-08T10:30:00.000Z",
          },
          {
            id: "inst-2",
            revenueId: revenueId,
            n: 2,
            valueCents: 225000,
            dueDate: "2025-10-08T00:00:00.000Z",
            paidAt: null,
            status: "A_VENCER" as const,
            proofUrl: null,
            createdAt: "2025-08-08T10:30:00.000Z",
            updatedAt: "2025-08-08T10:30:00.000Z",
          },
        ],
        attachments: [
          {
            id: "att-1",
            filename: "contrato_assinado.pdf",
            url: "#",
            mime: "application/pdf",
            sizeBytes: 1024576,
          },
        ],
      }
    : null;

  // Usa dados do backend ou fallback para mock
  const revenueData = revenue || mockRevenue;

  // Mutation para confirmar pagamento de parcela
  const confirmPaymentMutation = useMutation({
    mutationFn: ({
      installmentId,
      paidAt,
      proofUrl,
    }: {
      installmentId: string;
      paidAt: string;
      proofUrl?: string;
    }) =>
      financeService.confirmInstallmentPayment(installmentId, paidAt, proofUrl),
    onSuccess: () => {
      toast.success("Pagamento confirmado com sucesso!");
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "revenue-detail" ||
          query.queryKey[0] === "finance-revenues" ||
          query.queryKey[0] === "finance-kpis",
      });
      setIsConfirmPaymentOpen(false);
      setSelectedInstallmentId(null);
    },
    onError: (error) => {
      console.error("Erro ao confirmar pagamento:", error);
      toast.error("Erro ao confirmar pagamento. Tente novamente.");
    },
  });

  // Mutation para atualizar receita
  const updateRevenueMutation = useMutation({
    mutationFn: (data: Partial<CreateRevenueForm>) =>
      financeService.updateRevenue(revenueId!, data, fairId),
    onSuccess: () => {
      toast.success("Receita atualizada com sucesso!");
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "revenue-detail" ||
          query.queryKey[0] === "finance-revenues" ||
          query.queryKey[0] === "finance-kpis",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Erro ao atualizar receita:", error);
      toast.error("Erro ao atualizar receita. Tente novamente.");
    },
  });

  // Validação: fairId é obrigatório
  if (!fairId) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erro</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-red-600">
              Feira não selecionada. Selecione uma feira para visualizar os
              detalhes da receita.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numValue / 100);
  };

  const getInstallmentStatusIcon = (status: InstallmentStatus) => {
    switch (status) {
      case "PAGA":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "VENCIDA":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "A_VENCER":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "CANCELADA":
        return <X className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getInstallmentStatusBadge = (status: InstallmentStatus) => {
    const statusMap = {
      A_VENCER: { label: "A Vencer", variant: "secondary" as const },
      VENCIDA: { label: "Vencida", variant: "destructive" as const },
      PAGA: { label: "Paga", variant: "success" as const },
      CANCELADA: { label: "Cancelada", variant: "outline" as const },
    };
    const config = statusMap[status] || {
      label: status,
      variant: "secondary" as const,
    };
    return (
      <Badge
        variant={config.variant}
        className="text-xs px-2 py-0 h-5 whitespace-nowrap"
      >
        {config.label}
      </Badge>
    );
  };

  const handleConfirmPayment = (installmentId: string) => {
    setSelectedInstallmentId(installmentId);
    setIsConfirmPaymentOpen(true);
  };

  const handlePaymentConfirm = (paidAt: string, proofUrl?: string) => {
    if (selectedInstallmentId) {
      confirmPaymentMutation.mutate({
        installmentId: selectedInstallmentId,
        paidAt,
        proofUrl,
      });
    }
  };

  // Inicializa os dados do formulário quando entra no modo de edição
  const handleEditClick = () => {
    if (!isEditing && revenueData) {
      setEditFormData({
        baseValue: Number(revenueData.baseValue) / 100,
        discountCents: Number(revenueData.discountCents) / 100,
        paymentMethod: revenueData.paymentMethod || "",
        notes: revenueData.notes || "",
      });
      setIsEditing(true);
    } else if (isEditing) {
      // Salvar alterações
      handleSaveEdit();
    }
  };

  const handleSaveEdit = async () => {
    try {
      if (!revenueData || !fairId) return;

      const updateData: Partial<CreateRevenueForm> = {
        baseValue: Math.round(editFormData.baseValue * 100), // Converte para centavos
        discountCents: Math.round(editFormData.discountCents * 100), // Converte para centavos
        paymentMethod: editFormData.paymentMethod as PaymentMethod,
        notes: editFormData.notes,
      };

      updateRevenueMutation.mutate(updateData);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar alterações");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({
      baseValue: 0,
      discountCents: 0,
      paymentMethod: "",
      notes: "",
    });
  };

  if (!revenueData && !isLoading) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto min-w-fit z-[9998]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Detalhes da Receita
              </DialogTitle>
              {revenueData && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditClick}
                    className="flex items-center gap-2"
                    disabled={updateRevenueMutation.isPending}
                  >
                    <Edit className="w-4 h-4" />
                    {isEditing ? "Salvar" : "Editar"}
                    {isEditing && updateRevenueMutation.isPending && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </Button>
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </Button>
                  )}
                </div>
              )}
            </div>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : revenueData ? (
            <div className="space-y-6">
              {/* Informações Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informações do Cliente */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Cliente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Nome
                      </p>
                      <p className="font-medium">
                        {revenueData?.client?.name || "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Informações do Produto */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Produto/Serviço
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Modelo
                      </p>
                      <p className="font-medium">
                        {revenueData?.entryModel?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tipo
                      </p>
                      <p className="font-medium">
                        {revenueData?.type === "STAND" ? "Stand" : "Patrocínio"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Informações Financeiras */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Resumo Financeiro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Valor Base (R$)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={editFormData.baseValue || 0}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              baseValue: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Desconto (R$)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={editFormData.discountCents || 0}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              discountCents: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Método de Pagamento
                        </label>
                        <select
                          className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={editFormData.paymentMethod}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              paymentMethod: e.target.value,
                            })
                          }
                        >
                          <option value="">Selecione o método</option>
                          <option value="PIX">PIX</option>
                          <option value="BOLETO">Boleto</option>
                          <option value="CARTAO">Cartão</option>
                          <option value="TED">TED</option>
                          <option value="DINHEIRO">Dinheiro</option>
                          <option value="TRANSFERENCIA">Transferência</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Observações
                        </label>
                        <Input
                          placeholder="Observações sobre a receita"
                          value={editFormData.notes || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              notes: e.target.value,
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Valor Base
                        </p>
                        <p className="text-lg font-bold">
                          {formatCurrency(revenueData?.baseValue || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Desconto
                        </p>
                        <p className="text-lg font-bold text-red-600">
                          -{formatCurrency(revenueData?.discountCents || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Valor Final
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(revenueData?.contractValue || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Método de Pagamento
                        </p>
                        <p className="font-medium">
                          {revenueData?.paymentMethod || "N/A"}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Observações */}
              {revenueData?.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Observações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300">
                      {revenueData?.notes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Parcelas */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {/* <Calendar className="w-5 h-5" /> */}
                        Parcelas ({revenueData?.installments?.length || 0})
                      </CardTitle>
                      <CardDescription>
                        Controle de pagamentos das parcelas da receita
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                      className="flex items-center gap-2"
                    >
                      <CalendarIcon className="w-4 h-4" />
                      {isCalendarOpen
                        ? "Ocultar Calendário"
                        : "Mostrar Calendário"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tabela de Parcelas */}
                    <div
                      className={`${
                        isCalendarOpen ? "lg:col-span-2" : "lg:col-span-3"
                      } overflow-x-auto`}
                    >
                      <div className="min-w-[600px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-16 min-w-16">
                                Parcela
                              </TableHead>
                              <TableHead className="w-24 min-w-24">
                                Vencimento
                              </TableHead>
                              <TableHead className="w-24 min-w-24">
                                Valor
                              </TableHead>
                              <TableHead className="w-20 min-w-20">
                                Status
                              </TableHead>
                              <TableHead className="w-24 min-w-24">
                                Pagamento
                              </TableHead>
                              <TableHead className="w-20 min-w-20">
                                Ações
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {revenueData?.installments?.map((installment) => (
                              <TableRow key={installment.id}>
                                <TableCell className="font-medium w-16">
                                  <div className="flex items-center gap-1">
                                    {getInstallmentStatusIcon(
                                      installment.status
                                    )}
                                    <span className="text-xs whitespace-nowrap">
                                      {installment.n}ª
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs w-24 whitespace-nowrap">
                                  {dayjs(installment.dueDate).format(
                                    "DD/MM/YY"
                                  )}
                                </TableCell>
                                <TableCell className="font-medium text-xs w-24 whitespace-nowrap">
                                  {formatCurrency(installment.valueCents)}
                                </TableCell>
                                <TableCell className="w-20">
                                  <div className="max-w-20">
                                    {getInstallmentStatusBadge(
                                      installment.status
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs w-24 whitespace-nowrap">
                                  {installment.paidAt
                                    ? dayjs(installment.paidAt).format(
                                        "DD/MM/YY"
                                      )
                                    : "-"}
                                </TableCell>
                                <TableCell className="w-20">
                                  {installment.status !== "PAGA" &&
                                    installment.status !== "CANCELADA" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleConfirmPayment(installment.id)
                                        }
                                        className="text-xs h-7 px-2 whitespace-nowrap"
                                      >
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Confirmar
                                      </Button>
                                    )}
                                </TableCell>
                              </TableRow>
                            )) || (
                              <TableRow>
                                <TableCell
                                  colSpan={6}
                                  className="text-center text-muted-foreground h-16 text-sm"
                                >
                                  Nenhuma parcela encontrada
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Calendário Lateral */}
                    {isCalendarOpen && (
                      <div className="lg:col-span-1">
                        <div className="backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-lg p-4">
                          <h3 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">
                            Visualização das Datas
                          </h3>
                          <Calendar
                            mode="single"
                            className="w-full border-0 bg-transparent"
                            classNames={{
                              months: "space-y-4",
                              month: "space-y-4",
                              caption:
                                "flex justify-center pt-1 relative items-center",
                              caption_label: "text-sm font-medium",
                              nav: "space-x-1 flex items-center",
                              nav_button:
                                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                              nav_button_previous: "absolute left-1",
                              nav_button_next: "absolute right-1",
                              table: "w-full border-collapse space-y-1",
                              head_row: "flex",
                              head_cell:
                                "text-muted-foreground rounded-md w-8 font-normal text-[0.7rem]",
                              row: "flex w-full mt-2",
                              cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                              day: "h-8 w-8 p-0 font-normal text-xs aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
                              day_selected:
                                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                              day_today: "bg-accent text-accent-foreground",
                              day_outside: "text-muted-foreground opacity-50",
                              day_disabled: "text-muted-foreground opacity-50",
                              day_range_middle:
                                "aria-selected:bg-accent aria-selected:text-accent-foreground",
                              day_hidden: "invisible",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Anexos */}
              {revenueData?.attachments &&
                revenueData.attachments.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Anexos ({revenueData.attachments.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {revenueData.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">
                                {attachment.filename}
                              </p>
                              <p className="text-sm text-gray-600">
                                {(attachment.sizeBytes / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                window.open(attachment.url, "_blank")
                              }
                            >
                              Visualizar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              <Separator />

              {/* Informações de Criação */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Criado em{" "}
                  {dayjs(revenueData.createdAt).format("DD/MM/YYYY HH:mm")}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                Receita não encontrada
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar pagamento */}
      <ConfirmPaymentDialog
        isOpen={isConfirmPaymentOpen}
        onClose={() => {
          setIsConfirmPaymentOpen(false);
          setSelectedInstallmentId(null);
        }}
        onConfirm={handlePaymentConfirm}
        isLoading={confirmPaymentMutation.isPending}
      />
    </>
  );
}
