import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Plus } from "lucide-react";
import { unmaskCurrencyBRL, formatCurrencyFromCents } from "@/utils/masks";
import type { EntryModel, EntryModelType } from "@/interfaces/finance";
import {
  useEntryModels,
  useCreateEntryModel,
  useUpdateEntryModel,
  useDeleteEntryModel,
} from "@/hooks/useFinance";

// Schema de validação
const entryModelSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["STAND", "PATROCINIO"] as const, {
    required_error: "Tipo é obrigatório",
  }),
  baseValueDisplay: z.string().min(1, "Valor é obrigatório"),
  costCentsDisplay: z.string().optional(),
});

type EntryModelForm = z.infer<typeof entryModelSchema>;

interface EntryModelsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fairId?: string;
}

export function EntryModelsDialog({
  isOpen,
  onClose,
  fairId,
}: EntryModelsDialogProps) {
  const [editingModel, setEditingModel] = useState<EntryModel | null>(null);
  const { data: entryModels = [], isLoading } = useEntryModels(fairId);
  const createMutation = useCreateEntryModel();
  const updateMutation = useUpdateEntryModel();
  const deleteMutation = useDeleteEntryModel();

  const form = useForm<EntryModelForm>({
    resolver: zodResolver(entryModelSchema),
    defaultValues: {
      name: "",
      type: "STAND",
      baseValueDisplay: "",
      costCentsDisplay: "",
    },
  });

  const onSubmit = (data: EntryModelForm) => {
    if (editingModel) {
      // Atualizar modelo existente
      const baseValueCents = unmaskCurrencyBRL(data.baseValueDisplay);
      const costValueCents = data.costCentsDisplay
        ? unmaskCurrencyBRL(data.costCentsDisplay)
        : undefined;

      updateMutation.mutate({
        id: editingModel.id,
        data: {
          name: data.name,
          type: data.type,
          baseValue: baseValueCents,
          costCents: costValueCents,
        },
      });
    } else {
      // Criar novo modelo
      const baseValueCents = unmaskCurrencyBRL(data.baseValueDisplay);
      const costValueCents = data.costCentsDisplay
        ? unmaskCurrencyBRL(data.costCentsDisplay)
        : undefined;

      createMutation.mutate({
        name: data.name,
        type: data.type,
        baseValue: baseValueCents,
        costCents: costValueCents,
        fairId: fairId!,
        active: true,
      });
    }
  };

  const handleEdit = (model: EntryModel) => {
    setEditingModel(model);
    form.reset({
      name: model.name,
      type: model.type,
      baseValueDisplay: formatCurrencyFromCents(model.baseValue).toString(),
      costCentsDisplay: model.costCents
        ? formatCurrencyFromCents(model.costCents).toString()
        : "",
    });
  };

  const handleCancelEdit = () => {
    setEditingModel(null);
    form.reset();
    form.reset();
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este modelo?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const getTypeLabel = (type: EntryModelType) => {
    const labels: Record<EntryModelType, string> = {
      STAND: "Stand",
      PATROCINIO: "Patrocínio",
    };
    return labels[type];
  };

  const getTypeBadgeClass = (type: EntryModelType) => {
    const classes = {
      STAND: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      PATROCINIO:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    };
    return classes[type];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto min-w-fit">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            Gerenciar Stands e Patrocínios
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 w-[30rem]  gap-6">
          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                {editingModel ? "Editar Modelo" : "Novo Modelo"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Ex: Stand Premium 6x3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={form.watch("type")}
                    onValueChange={(value) => form.setValue("type", value as EntryModelType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STAND">Stand</SelectItem>
                      <SelectItem value="PATROCINIO">Patrocínio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baseValueDisplay">Valor Base (R$)</Label>
                  <Input
                    id="baseValueDisplay"
                    {...form.register("baseValueDisplay")}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costCentsDisplay">Custo (R$) - Opcional</Label>
                  <Input
                    id="costCentsDisplay"
                    {...form.register("costCentsDisplay")}
                    placeholder="0,00"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {editingModel ? "Atualizar" : "Criar"}
                  </Button>
                  {editingModel && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Lista de Modelos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Modelos Existentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-gray-500 dark:text-gray-400">
                  Carregando modelos...
                </p>
              ) : entryModels.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhum modelo encontrado
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {entryModels.map((model: EntryModel) => (
                    <div
                      key={model.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {model.name}
                          </h4>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getTypeBadgeClass(
                              model.type
                            )}`}
                          >
                            {getTypeLabel(model.type)}
                          </span>
                          {!model.active && (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              Inativo
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(model.baseValue)}
                        </p>
                        {model.costCents && model.costCents > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Custo: {formatCurrency(model.costCents)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(model)}
                          disabled={editingModel?.id === model.id}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(model.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
