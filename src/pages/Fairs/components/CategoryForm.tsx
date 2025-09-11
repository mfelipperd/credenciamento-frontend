import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { FinanceCategory, CreateCategoryDto, UpdateCategoryDto } from "@/interfaces/categories";

const categorySchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  isRequired: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto) => void;
  category?: FinanceCategory;
  fairId: string;
  isLoading?: boolean;
}

export function CategoryForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  category, 
  fairId, 
  isLoading = false 
}: CategoryFormProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nome: "",
      description: "",
      isRequired: false,
    },
  });

  // Atualizar o formulário quando a categoria mudar
  useEffect(() => {
    if (category) {
      form.reset({
        nome: category.nome || "",
        description: category.description || "",
        isRequired: category.isRequired ?? false,
      });
    } else {
      form.reset({
        nome: "",
        description: "",
        isRequired: false,
      });
    }
  }, [category, form]);

  const handleSubmit = (data: CategoryFormData) => {
    const formData = {
      ...data,
      fairId: fairId,
      global: true,
    };
    
    onSubmit(formData);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="min-w-[50vw] max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Nome */}
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Aluguel do Espaço" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o propósito desta categoria..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Obrigatória */}
            <FormField
              control={form.control}
              name="isRequired"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Categoria Obrigatória</FormLabel>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label className="text-sm">
                      {field.value ? "Sim, é obrigatória" : "Não, é opcional"}
                    </Label>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : category ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
