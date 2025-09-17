import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// Removed unused Select imports
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Removed unused Badge import
import { Plus, Trash2, MapPin, Calendar, Clock, DollarSign } from "lucide-react";
import type { Fair, CreateFairForm, UpdateFairForm, StandConfiguration } from "@/interfaces/fairs";

// Schema de validação
const standConfigurationSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  width: z.number().min(0.1, "Largura deve ser maior que 0"),
  height: z.number().min(0.1, "Altura deve ser maior que 0"),
  quantity: z.number().min(1, "Quantidade deve ser pelo menos 1"),
  pricePerSquareMeter: z.number().min(0, "Preço deve ser maior ou igual a 0"),
  setupCostPerSquareMeter: z.number().min(0, "Custo de montagem deve ser maior ou igual a 0"),
  description: z.string().optional(),
});

const fairFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  location: z.string().min(1, "Localização é obrigatória"),
  googleMapsUrl: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  totalStands: z.number().optional(),
  costPerSquareMeter: z.number().optional(),
  setupCostPerSquareMeter: z.number().optional(),
  expectedRevenue: z.number().optional(),
  expectedProfit: z.number().optional(),
  expectedProfitMargin: z.number().optional(),
  standConfigurations: z.array(standConfigurationSchema).optional(),
});

type FairFormData = z.infer<typeof fairFormSchema>;

interface FairFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFairForm | UpdateFairForm) => void;
  fair?: Fair | null;
  isLoading?: boolean;
}

export const FairForm: React.FC<FairFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  fair,
  isLoading = false,
}) => {
  const [standConfigurations, setStandConfigurations] = useState<StandConfiguration[]>([]);

  const form = useForm<FairFormData>({
    resolver: zodResolver(fairFormSchema),
    defaultValues: {
      name: "",
      location: "",
      googleMapsUrl: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Brasil",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      totalStands: undefined,
      costPerSquareMeter: undefined,
      setupCostPerSquareMeter: undefined,
      expectedRevenue: undefined,
      expectedProfit: undefined,
      expectedProfitMargin: undefined,
    },
  });

  // Resetar formulário quando a feira mudar
  useEffect(() => {
    if (fair) {
      form.reset({
        name: fair.name || "",
        location: fair.location || "",
        googleMapsUrl: fair.googleMapsUrl || "",
        address: fair.address || "",
        city: fair.city || "",
        state: fair.state || "",
        zipCode: fair.zipCode || "",
        country: fair.country || "Brasil",
        startDate: fair.startDate || "",
        endDate: fair.endDate || "",
        startTime: fair.startTime || "",
        endTime: fair.endTime || "",
        totalStands: fair.totalStands || undefined,
        costPerSquareMeter: fair.costPerSquareMeter || undefined,
        setupCostPerSquareMeter: fair.setupCostPerSquareMeter || undefined,
        expectedRevenue: fair.expectedRevenue || undefined,
        expectedProfit: fair.expectedProfit || undefined,
        expectedProfitMargin: fair.expectedProfitMargin || undefined,
      });
      setStandConfigurations(fair.standConfigurations || []);
    } else {
      // Limpar formulário quando não há feira (modo criação)
      form.reset({
        name: "",
        location: "",
        googleMapsUrl: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Brasil",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        totalStands: undefined,
        costPerSquareMeter: undefined,
        setupCostPerSquareMeter: undefined,
        expectedRevenue: undefined,
        expectedProfit: undefined,
        expectedProfitMargin: undefined,
      });
      setStandConfigurations([]);
    }
  }, [fair, form]);

  const addStandConfiguration = () => {
    setStandConfigurations([
      ...standConfigurations,
      {
        name: "",
        width: 0,
        height: 0,
        quantity: 0,
        pricePerSquareMeter: 0,
        setupCostPerSquareMeter: 0,
        description: "",
      },
    ]);
  };

  const removeStandConfiguration = (index: number) => {
    setStandConfigurations(standConfigurations.filter((_, i) => i !== index));
  };

  const updateStandConfiguration = (index: number, field: keyof StandConfiguration, value: any) => {
    const updated = [...standConfigurations];
    updated[index] = { ...updated[index], [field]: value };
    setStandConfigurations(updated);
  };

  const handleSubmit = (data: FairFormData) => {
    console.log('Dados do formulário:', data);
    
    // Filtrar campos vazios ou com valor 0 para campos opcionais
    const formData: any = {
      name: data.name,
      location: data.location,
    };

    // Adicionar apenas campos que foram preenchidos
    if (data.googleMapsUrl && data.googleMapsUrl.trim() !== '') {
      formData.googleMapsUrl = data.googleMapsUrl;
    }
    if (data.address && data.address.trim() !== '') {
      formData.address = data.address;
    }
    if (data.city && data.city.trim() !== '') {
      formData.city = data.city;
    }
    if (data.state && data.state.trim() !== '') {
      formData.state = data.state;
    }
    if (data.zipCode && data.zipCode.trim() !== '') {
      formData.zipCode = data.zipCode;
    }
    if (data.country && data.country.trim() !== '') {
      formData.country = data.country;
    }
    if (data.startDate && data.startDate.trim() !== '') {
      formData.startDate = data.startDate;
    }
    if (data.endDate && data.endDate.trim() !== '') {
      formData.endDate = data.endDate;
    }
    if (data.startTime && data.startTime.trim() !== '') {
      formData.startTime = data.startTime;
    }
    if (data.endTime && data.endTime.trim() !== '') {
      formData.endTime = data.endTime;
    }
    if (data.totalStands !== undefined && data.totalStands !== null && data.totalStands > 0) {
      formData.totalStands = data.totalStands;
    }
    if (data.costPerSquareMeter !== undefined && data.costPerSquareMeter !== null && data.costPerSquareMeter > 0) {
      formData.costPerSquareMeter = data.costPerSquareMeter;
    }
    if (data.setupCostPerSquareMeter !== undefined && data.setupCostPerSquareMeter !== null && data.setupCostPerSquareMeter > 0) {
      formData.setupCostPerSquareMeter = data.setupCostPerSquareMeter;
    }
    if (data.expectedRevenue !== undefined && data.expectedRevenue !== null && data.expectedRevenue > 0) {
      formData.expectedRevenue = data.expectedRevenue;
    }
    if (data.expectedProfit !== undefined && data.expectedProfit !== null && data.expectedProfit > 0) {
      formData.expectedProfit = data.expectedProfit;
    }
    if (data.expectedProfitMargin !== undefined && data.expectedProfitMargin !== null && data.expectedProfitMargin > 0) {
      formData.expectedProfitMargin = data.expectedProfitMargin;
    }
    if (standConfigurations.length > 0) {
      formData.standConfigurations = standConfigurations;
    }

    console.log('Dados que serão enviados:', formData);
    onSubmit(formData);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl min-w-[50vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {fair ? "Editar Feira" : "Nova Feira"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Feira *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Feira de Tecnologia 2024" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localização *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Centro de Convenções" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="googleMapsUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Google Maps</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://maps.google.com/..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Manaus" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: AM" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: 69000-000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço Completo</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Rua, número, bairro..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Datas e Horários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Datas e Horários
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Início</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Fim</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário de Início</FormLabel>
                        <FormControl>
                          <Input {...field} type="time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário de Fim</FormLabel>
                        <FormControl>
                          <Input {...field} type="time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Informações Financeiras */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Informações Financeiras
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="totalStands"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total de Stands</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="costPerSquareMeter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custo por m²</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="setupCostPerSquareMeter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custo de Montagem por m²</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="expectedRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Receita Esperada</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expectedProfit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lucro Esperado</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expectedProfitMargin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Margem de Lucro (%)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.1"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Configurações de Stands */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Configurações de Stands
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addStandConfiguration}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Stand
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {standConfigurations.map((config, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Stand {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeStandConfiguration(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome do Stand</Label>
                        <Input
                          value={config.name}
                          onChange={(e) => updateStandConfiguration(index, "name", e.target.value)}
                          placeholder="Ex: Stand 2x3"
                        />
                      </div>
                      <div>
                        <Label>Descrição</Label>
                        <Input
                          value={config.description || ""}
                          onChange={(e) => updateStandConfiguration(index, "description", e.target.value)}
                          placeholder="Descrição do stand"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Largura (m)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={config.width}
                          onChange={(e) => updateStandConfiguration(index, "width", Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Altura (m)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={config.height}
                          onChange={(e) => updateStandConfiguration(index, "height", Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Quantidade</Label>
                        <Input
                          type="number"
                          value={config.quantity}
                          onChange={(e) => updateStandConfiguration(index, "quantity", Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Área Total (m²)</Label>
                        <Input
                          value={(config.width * config.height * config.quantity).toFixed(2)}
                          disabled
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Preço por m²</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={config.pricePerSquareMeter}
                          onChange={(e) => updateStandConfiguration(index, "pricePerSquareMeter", Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Custo de Montagem por m²</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={config.setupCostPerSquareMeter}
                          onChange={(e) => updateStandConfiguration(index, "setupCostPerSquareMeter", Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Valor Total:</span>
                          <span className="ml-2 font-medium">
                            {formatCurrency((config.width * config.height * config.quantity * config.pricePerSquareMeter))}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Custo de Montagem:</span>
                          <span className="ml-2 font-medium">
                            {formatCurrency((config.width * config.height * config.quantity * config.setupCostPerSquareMeter))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {standConfigurations.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Nenhuma configuração de stand adicionada
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : fair ? "Atualizar" : "Criar"} Feira
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
