import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
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
import { Switch } from "@/components/ui/switch";
import { EUserRole } from "@/enums/user.enum";
import { useCreateUser, useUpdateUser } from "@/hooks/useUsers";
import { toast } from "sonner";
import { maskCPF, maskPhoneBR } from "@/utils/masks";

const userSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  role: z.nativeEnum(EUserRole, {
    errorMap: () => ({ message: "Selecione uma função válida" })
  }),
  isActive: z.boolean(),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  role: EUserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserFormModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserFormModal({ user, isOpen, onClose }: UserFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!user;

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      cpf: "",
      phone: "",
      role: EUserRole.ADMIN,
      isActive: true,
      password: "",
    },
  });

  // Preencher formulário quando editando
  useEffect(() => {
    if (user && isOpen) {
      form.reset({
        name: user.name,
        email: user.email,
        cpf: user.cpf || "",
        phone: user.phone || "",
        role: user.role,
        isActive: user.isActive,
        password: "", // Sempre vazio para edição
      });
    } else if (!user && isOpen) {
      form.reset({
        name: "",
        email: "",
        cpf: "",
        phone: "",
        role: EUserRole.ADMIN,
        isActive: true,
        password: "",
      });
    }
  }, [user, isOpen, form]);

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);

      if (isEditing && user) {
        // Editar usuário
        const updateData = {
          ...data,
          password: data.password || undefined, // Só incluir senha se preenchida
        };
        
        await updateUserMutation.mutateAsync({
          id: user.id,
          data: updateData,
        });
        
        toast.success("Usuário atualizado com sucesso!");
      } else {
        // Criar usuário
        await createUserMutation.mutateAsync(data);
        toast.success("Usuário criado com sucesso!");
      }

      onClose();
    } catch (error) {
      toast.error("Erro ao salvar usuário");
      console.error("Erro ao salvar usuário:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Digite o email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CPF */}
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="000.000.000-00"
                        {...field}
                        onChange={(e) => {
                          const masked = maskCPF(e.target.value);
                          field.onChange(masked);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Telefone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(00) 00000-0000"
                        {...field}
                        onChange={(e) => {
                          const masked = maskPhoneBR(e.target.value);
                          field.onChange(masked);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Função */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={EUserRole.ADMIN}>Administrador</SelectItem>
                        <SelectItem value={EUserRole.PARTNER}>Sócio</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Usuário Ativo</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Usuário pode fazer login no sistema
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Senha */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Senha {isEditing ? "(deixe em branco para manter a atual)" : "*"}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={isEditing ? "Nova senha (opcional)" : "Digite a senha"}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ações */}
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
