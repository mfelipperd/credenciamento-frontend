import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CalendarDays, MapPin, Plus } from "lucide-react";
import { useFairService } from "@/service/fair.service";
import { toast } from "sonner";
import type { ICreateFair } from "@/interfaces/fairs";

// Schema de validação
const createFairSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  location: z
    .string()
    .min(1, "Localização é obrigatória")
    .max(255, "Localização muito longa"),
  date: z.string().min(1, "Data é obrigatória"),

  // Campos opcionais de endereço
  address: z.string().max(255, "Endereço muito longo").optional(),
  city: z.string().max(100, "Cidade muito longa").optional(),
  state: z.string().max(50, "Estado muito longo").optional(),
  zipCode: z.string().max(20, "CEP muito longo").optional(),
  country: z.string().max(100, "País muito longo").optional(),

  // Campos opcionais de horário
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato deve ser HH:mm")
    .optional()
    .or(z.literal("")),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato deve ser HH:mm")
    .optional()
    .or(z.literal("")),
});

type CreateFairFormData = z.infer<typeof createFairSchema>;

export function ModalCreateFair() {
  const [open, setOpen] = useState(false);
  const { createFair, loading } = useFairService();

  const form = useForm<CreateFairFormData>({
    resolver: zodResolver(createFairSchema),
    defaultValues: {
      name: "",
      location: "",
      date: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      startTime: "",
      endTime: "",
    },
  });

  const onSubmit = async (data: CreateFairFormData) => {
    try {
      // Converter dados para o formato da API
      const fairData: ICreateFair = {
        name: data.name,
        location: data.location,
        date: data.date,
      };

      // Adicionar campos opcionais apenas se preenchidos
      if (data.address) fairData.address = data.address;
      if (data.city) fairData.city = data.city;
      if (data.state) fairData.state = data.state;
      if (data.zipCode) fairData.zipCode = data.zipCode;
      if (data.country) fairData.country = data.country;
      if (data.startTime) fairData.startTime = data.startTime;
      if (data.endTime) fairData.endTime = data.endTime;

      // Criar startDateTime e endDateTime se tiver data e horários
      if (data.date && data.startTime) {
        fairData.startDateTime = `${data.date}T${data.startTime}:00.000Z`;
      }
      if (data.date && data.endTime) {
        fairData.endDateTime = `${data.date}T${data.endTime}:00.000Z`;
      }

      const result = await createFair(fairData);

      if (result) {
        toast.success("Feira criada com sucesso!");
        form.reset();
        setOpen(false);
      } else {
        toast.error("Erro ao criar feira");
      }
    } catch (error) {
      console.error("Erro ao criar feira:", error);
      toast.error("Erro ao criar feira");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 text-foreground hover:text-blue-600 cursor-pointer transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950">
          <Plus size={14} />
          <span className="text-sm font-medium">Nova Feira</span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/20 dark:border-gray-700/30 text-gray-900 dark:text-gray-100 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Criar Nova Feira
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Preencha as informações para criar uma nova feira. Campos opcionais
            podem ser preenchidos para maior detalhamento.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Seção Básica */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Informações Básicas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Feira *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Feira de Tecnologia 2025"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Início</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
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
                        <FormLabel>Término</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização Geral *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Centro de Convenções São Paulo"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Seção Endereço */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Endereço Detalhado (Opcional)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço Completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Rua das Flores, 123"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-2">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="São Paulo" {...field} />
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
                          <Input placeholder="SP" {...field} />
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
                          <Input placeholder="01234-567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Brasil" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Criando..." : "Criar Feira"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
