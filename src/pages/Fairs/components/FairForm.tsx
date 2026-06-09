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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Info,
  Users,
  Navigation,
  Image,
} from "lucide-react";
import type {
  Fair,
  CreateFairForm,
  UpdateFairForm,
  StandConfiguration,
  DaySchedule,
  FairStatus,
} from "@/interfaces/fairs";

// ─── Constantes ───────────────────────────────────────────────────────────────

const FAIR_STATUS_OPTIONS: { value: FairStatus; label: string; color: string }[] = [
  { value: "upcoming", label: "Em breve", color: "bg-blue-100 text-blue-800" },
  { value: "ongoing", label: "Em andamento", color: "bg-green-100 text-green-800" },
  { value: "ended", label: "Encerrada", color: "bg-gray-100 text-gray-800" },
  { value: "cancelled", label: "Cancelada", color: "bg-red-100 text-red-800" },
];

const BR_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO",
];

// ─── Schema de validação ──────────────────────────────────────────────────────

const standConfigurationSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  width: z.number().min(0.1, "Largura deve ser maior que 0"),
  height: z.number().min(0.1, "Altura deve ser maior que 0"),
  quantity: z.number().min(1, "Quantidade deve ser pelo menos 1"),
  pricePerSquareMeter: z.number().min(0),
  setupCostPerSquareMeter: z.number().min(0),
  description: z.string().optional(),
});

const fairFormSchema = z.object({
  // Identidade
  name: z.string().min(1, "Nome é obrigatório"),
  edition: z.string().optional(),
  description: z.string().optional(),
  bannerUrl: z.string().optional(),
  status: z.enum(["upcoming", "ongoing", "ended", "cancelled"]).optional(),

  // Local
  location: z.string().optional(),
  venueName: z.string().optional(),
  address: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  googleMapsUrl: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),

  // Datas e horários
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),

  // Planejamento
  expectedVisitors: z.number().optional(),
  expectedExhibitors: z.number().optional(),

  // Financeiro
  totalStands: z.number().optional(),
  costPerSquareMeter: z.number().optional(),
  setupCostPerSquareMeter: z.number().optional(),
  expectedRevenue: z.number().optional(),
  expectedProfit: z.number().optional(),
  expectedProfitMargin: z.number().optional(),

  standConfigurations: z.array(standConfigurationSchema).optional(),
});

type FairFormData = z.infer<typeof fairFormSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface FairFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFairForm | UpdateFairForm) => void;
  fair?: Fair | null;
  isLoading?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const numOr = (v: number | null | undefined) =>
  v !== undefined && v !== null && v !== 0 ? v : undefined;

const strOr = (v: string | null | undefined) =>
  v && v.trim() !== "" ? v.trim() : undefined;

// ─── Componente ───────────────────────────────────────────────────────────────

export const FairForm: React.FC<FairFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  fair,
  isLoading = false,
}) => {
  const [standConfigurations, setStandConfigurations] = useState<StandConfiguration[]>([]);
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([]);

  const form = useForm<FairFormData>({
    resolver: zodResolver(fairFormSchema),
    defaultValues: {
      name: "",
      edition: "",
      description: "",
      bannerUrl: "",
      status: "upcoming",
      location: "",
      venueName: "",
      address: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Brasil",
      googleMapsUrl: "",
      latitude: undefined,
      longitude: undefined,
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      expectedVisitors: undefined,
      expectedExhibitors: undefined,
      totalStands: undefined,
      costPerSquareMeter: undefined,
      setupCostPerSquareMeter: undefined,
      expectedRevenue: undefined,
      expectedProfit: undefined,
      expectedProfitMargin: undefined,
    },
  });

  // Sincroniza formulário quando a feira mudar
  useEffect(() => {
    if (fair) {
      form.reset({
        name: fair.name ?? "",
        edition: fair.edition ?? "",
        description: fair.description ?? "",
        bannerUrl: fair.bannerUrl ?? "",
        status: fair.status ?? "upcoming",
        location: fair.location ?? "",
        venueName: fair.venueName ?? "",
        address: fair.address ?? "",
        number: fair.number ?? "",
        complement: fair.complement ?? "",
        neighborhood: fair.neighborhood ?? "",
        city: fair.city ?? "",
        state: fair.state ?? "",
        zipCode: fair.zipCode ?? "",
        country: fair.country ?? "Brasil",
        googleMapsUrl: fair.googleMapsUrl ?? "",
        latitude: fair.latitude ?? undefined,
        longitude: fair.longitude ?? undefined,
        startDate: fair.startDate ?? "",
        endDate: fair.endDate ?? "",
        startTime: fair.startTime ?? "",
        endTime: fair.endTime ?? "",
        expectedVisitors: fair.expectedVisitors ?? undefined,
        expectedExhibitors: fair.expectedExhibitors ?? undefined,
        totalStands: fair.totalStands ?? undefined,
        costPerSquareMeter: fair.costPerSquareMeter ?? undefined,
        setupCostPerSquareMeter: fair.setupCostPerSquareMeter ?? undefined,
        expectedRevenue: fair.expectedRevenue ?? undefined,
        expectedProfit: fair.expectedProfit ?? undefined,
        expectedProfitMargin: fair.expectedProfitMargin ?? undefined,
      });
      setStandConfigurations(fair.standConfigurations ?? []);
      setDaySchedules(fair.daySchedules ?? []);
    } else {
      form.reset({
        name: "",
        edition: "",
        description: "",
        bannerUrl: "",
        status: "upcoming",
        location: "",
        venueName: "",
        address: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Brasil",
        googleMapsUrl: "",
        latitude: undefined,
        longitude: undefined,
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        expectedVisitors: undefined,
        expectedExhibitors: undefined,
        totalStands: undefined,
        costPerSquareMeter: undefined,
        setupCostPerSquareMeter: undefined,
        expectedRevenue: undefined,
        expectedProfit: undefined,
        expectedProfitMargin: undefined,
      });
      setStandConfigurations([]);
      setDaySchedules([]);
    }
  }, [fair, form]);

  // ── Stand configurations ──────────────────────────────────────────────────

  const addStandConfiguration = () => {
    setStandConfigurations((prev) => [
      ...prev,
      { name: "", width: 0, height: 0, quantity: 0, pricePerSquareMeter: 0, setupCostPerSquareMeter: 0 },
    ]);
  };

  const removeStandConfiguration = (index: number) => {
    setStandConfigurations((prev) => prev.filter((_, i) => i !== index));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateStandConfiguration = (index: number, field: keyof StandConfiguration, value: any) => {
    setStandConfigurations((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // ── Day schedules ─────────────────────────────────────────────────────────

  const addDaySchedule = () => {
    setDaySchedules((prev) => [
      ...prev,
      { date: "", startTime: "", endTime: "", note: "" },
    ]);
  };

  const removeDaySchedule = (index: number) => {
    setDaySchedules((prev) => prev.filter((_, i) => i !== index));
  };

  const updateDaySchedule = (index: number, field: keyof DaySchedule, value: string) => {
    setDaySchedules((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = (data: FairFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formData: Record<string, any> = {
      name: data.name,
    };

    // Identidade
    if (strOr(data.edition)) formData.edition = strOr(data.edition);
    if (strOr(data.description)) formData.description = strOr(data.description);
    if (strOr(data.bannerUrl)) formData.bannerUrl = strOr(data.bannerUrl);
    if (data.status) formData.status = data.status;

    // Local
    if (strOr(data.location)) formData.location = strOr(data.location);
    if (strOr(data.venueName)) formData.venueName = strOr(data.venueName);
    if (strOr(data.address)) formData.address = strOr(data.address);
    if (strOr(data.number)) formData.number = strOr(data.number);
    if (strOr(data.complement)) formData.complement = strOr(data.complement);
    if (strOr(data.neighborhood)) formData.neighborhood = strOr(data.neighborhood);
    if (strOr(data.city)) formData.city = strOr(data.city);
    if (strOr(data.state)) formData.state = data.state?.toUpperCase();
    if (strOr(data.zipCode)) formData.zipCode = strOr(data.zipCode);
    if (strOr(data.country)) formData.country = strOr(data.country);
    if (strOr(data.googleMapsUrl)) formData.googleMapsUrl = strOr(data.googleMapsUrl);
    if (data.latitude !== undefined) formData.latitude = data.latitude;
    if (data.longitude !== undefined) formData.longitude = data.longitude;

    // Datas e horários
    const toHHmm = (t: string | undefined) => t?.trim().slice(0, 5) || undefined;
    if (strOr(data.startDate)) formData.startDate = strOr(data.startDate);
    if (strOr(data.endDate)) formData.endDate = strOr(data.endDate);
    if (strOr(data.startTime)) formData.startTime = toHHmm(data.startTime);
    if (strOr(data.endTime)) formData.endTime = toHHmm(data.endTime);

    // Day schedules (só envia se tiver entradas preenchidas)
    const validSchedules = daySchedules.filter((s) => s.date && s.startTime && s.endTime);
    if (validSchedules.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      formData.daySchedules = validSchedules.map(({ id: _id, ...rest }) => ({
        ...rest,
        startTime: rest.startTime.slice(0, 5),
        endTime: rest.endTime.slice(0, 5),
      }));
    }

    // Planejamento
    if (numOr(data.expectedVisitors)) formData.expectedVisitors = data.expectedVisitors;
    if (numOr(data.expectedExhibitors)) formData.expectedExhibitors = data.expectedExhibitors;

    // Financeiro
    if (numOr(data.totalStands)) formData.totalStands = data.totalStands;
    if (numOr(data.costPerSquareMeter)) formData.costPerSquareMeter = data.costPerSquareMeter;
    if (numOr(data.setupCostPerSquareMeter)) formData.setupCostPerSquareMeter = data.setupCostPerSquareMeter;
    if (numOr(data.expectedRevenue)) formData.expectedRevenue = data.expectedRevenue;
    if (numOr(data.expectedProfit)) formData.expectedProfit = data.expectedProfit;
    if (numOr(data.expectedProfitMargin)) formData.expectedProfitMargin = data.expectedProfitMargin;

    // Stands
    if (standConfigurations.length > 0) {
      formData.standConfigurations = standConfigurations;
    }

    onSubmit(formData as CreateFairForm | UpdateFairForm);
  };

  const fmtCurrency = (value: number | string | null | undefined) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value ?? 0));

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl min-w-[50vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{fair ? "Editar Feira" : "Nova Feira"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

            {/* ── 1. Identidade ──────────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="h-4 w-4" />
                  Identidade da Feira
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: ExpoMultimix Manaus 2026" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="edition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Edição</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: 5ª Edição" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} placeholder="Descrição curta da feira para exibição no site/app" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FAIR_STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <span className="flex items-center gap-2">
                                  {opt.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bannerUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Image className="h-3.5 w-3.5" /> Banner (URL)
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* ── 2. Local ───────────────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" />
                  Local
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="venueName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Local</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Centro de Convenções Vasco Vasques" />
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
                        <FormLabel>Localização (texto livre)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Manaus, AM — Centro de Convenções" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logradouro</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Av. Djalma Batista" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: 1350" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="complement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Bloco A" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Chapada" />
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
                          <Input {...field} placeholder="00000-000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                        <FormLabel>UF</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="UF" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BR_STATES.map((uf) => (
                              <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>País</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Brasil" />
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
                      <FormLabel>URL Google Maps</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://maps.app.goo.gl/..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Navigation className="h-3.5 w-3.5" /> Latitude
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="-3.1190275"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Navigation className="h-3.5 w-3.5" /> Longitude
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="-60.0217314"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* ── 3. Datas, Horários e Programação ──────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
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
                        <FormLabel>Abertura (padrão)</FormLabel>
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
                        <FormLabel>Encerramento (padrão)</FormLabel>
                        <FormControl>
                          <Input {...field} type="time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Programação por dia */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Programação por dia</p>
                      <p className="text-xs text-muted-foreground">
                        Defina horários específicos que substituem o padrão acima
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addDaySchedule}>
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Adicionar dia
                    </Button>
                  </div>

                  {daySchedules.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-2">
                      Nenhum dia específico — todos os dias usam o horário padrão
                    </p>
                  )}

                  {daySchedules.map((schedule, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start border rounded-lg p-3">
                      <div className="col-span-4">
                        <Label className="text-xs">Data</Label>
                        <Input
                          type="date"
                          value={schedule.date}
                          onChange={(e) => updateDaySchedule(index, "date", e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Abertura</Label>
                        <Input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) => updateDaySchedule(index, "startTime", e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Fechamento</Label>
                        <Input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) => updateDaySchedule(index, "endTime", e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs">Obs</Label>
                        <Input
                          value={schedule.note ?? ""}
                          onChange={(e) => updateDaySchedule(index, "note", e.target.value)}
                          placeholder="Ex: Abertura oficial"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="col-span-1 flex items-end pb-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeDaySchedule(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ── 4. Planejamento ────────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" />
                  Planejamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expectedVisitors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta de Visitantes</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 5000"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expectedExhibitors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nº de Expositores / Marcas</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 120"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* ── 5. Financeiro ──────────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-4 w-4" />
                  Financeiro
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
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
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
                            type="number"
                            step="0.01"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
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
                            type="number"
                            step="0.01"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
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
                            type="number"
                            step="0.01"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
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
                            type="number"
                            step="0.01"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
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
                            type="number"
                            step="0.1"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* ── 6. Configurações de Stands ─────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Configurações de Stands
                  </span>
                  <Button type="button" variant="outline" size="sm" onClick={addStandConfiguration}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Adicionar Stand
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {standConfigurations.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma configuração de stand adicionada
                  </p>
                )}

                {standConfigurations.map((config, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Stand {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStandConfiguration(index)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Nome do Stand</Label>
                        <Input
                          value={config.name}
                          onChange={(e) => updateStandConfiguration(index, "name", e.target.value)}
                          placeholder="Ex: Stand 2x3"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Descrição</Label>
                        <Input
                          value={config.description ?? ""}
                          onChange={(e) => updateStandConfiguration(index, "description", e.target.value)}
                          placeholder="Descrição"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs">Largura (m)</Label>
                        <Input type="number" step="0.1" value={config.width}
                          onChange={(e) => updateStandConfiguration(index, "width", Number(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-xs">Altura (m)</Label>
                        <Input type="number" step="0.1" value={config.height}
                          onChange={(e) => updateStandConfiguration(index, "height", Number(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-xs">Quantidade</Label>
                        <Input type="number" value={config.quantity}
                          onChange={(e) => updateStandConfiguration(index, "quantity", Number(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-xs">Área total (m²)</Label>
                        <Input value={(config.width * config.height * config.quantity).toFixed(2)} disabled />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Preço por m²</Label>
                        <Input type="number" step="0.01" value={config.pricePerSquareMeter}
                          onChange={(e) => updateStandConfiguration(index, "pricePerSquareMeter", Number(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-xs">Custo de montagem por m²</Label>
                        <Input type="number" step="0.01" value={config.setupCostPerSquareMeter}
                          onChange={(e) => updateStandConfiguration(index, "setupCostPerSquareMeter", Number(e.target.value))} />
                      </div>
                    </div>

                    <div className="bg-muted/40 rounded-lg p-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Valor total:</span>
                        <span className="ml-2 font-semibold">
                          {fmtCurrency(config.width * config.height * config.quantity * config.pricePerSquareMeter)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Custo montagem:</span>
                        <span className="ml-2 font-semibold">
                          {fmtCurrency(config.width * config.height * config.quantity * config.setupCostPerSquareMeter)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* ── Ações ──────────────────────────────────────────────────── */}
            <div className="flex justify-end gap-3 pb-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : fair ? "Salvar Alterações" : "Criar Feira"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
