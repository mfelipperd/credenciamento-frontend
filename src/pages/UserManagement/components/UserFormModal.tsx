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
import { useFairService } from "@/service/fair.service";
import { toast } from "sonner";
import { maskCPF, maskPhoneBR } from "@/utils/masks";
import { Checkbox } from "@/components/ui/checkbox";

const userSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  role: z.nativeEnum(EUserRole, {
    errorMap: () => ({ message: "Selecione uma função válida" })
  }),
  isActive: z.boolean(),
  password: z.string().optional().refine((val) => !val || val.length >= 6, {
    message: "Senha deve ter pelo menos 6 caracteres"
  }),
  fairIds: z.array(z.string()).optional(),
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
  fairIds?: string[];
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
  const [selectedFairIds, setSelectedFairIds] = useState<string[]>([]);
  const isEditing = !!user;

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const { fairs, getFairs } = useFairService();

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

  // Buscar feiras ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      getFairs();
    }
  }, [isOpen, getFairs]);

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
        fairIds: user.fairIds || [],
      });
      setSelectedFairIds(user.fairIds || []);
    } else if (!user && isOpen) {
      form.reset({
        name: "",
        email: "",
        cpf: "",
        phone: "",
        role: EUserRole.ADMIN,
        isActive: true,
        password: "",
        fairIds: [],
      });
      setSelectedFairIds([]);
    }
  }, [user, isOpen, form]);

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);

      const submitData = {
        ...data,
        fairIds: selectedFairIds,
        password: data.password || undefined, // Só incluir senha se preenchida
      };

      if (isEditing && user) {
        // Editar usuário
        await updateUserMutation.mutateAsync({
          id: user.id,
          data: submitData,
        });
        
        toast.success("Usuário atualizado com sucesso!");
      } else {
        // Criar usuário
        await createUserMutation.mutateAsync(submitData);
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
    setSelectedFairIds([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">
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
                    <FormLabel className="text-gray-300">Nome Completo *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Digite o nome completo" 
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        {...field} 
                      />
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
                    <FormLabel className="text-gray-300">Email *</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Digite o email" 
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
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
                    <FormLabel className="text-gray-300">CPF</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="000.000.000-00"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
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
                    <FormLabel className="text-gray-300">Telefone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(00) 00000-0000"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
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
                    <FormLabel className="text-gray-300">Função *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value={EUserRole.ADMIN} className="text-white hover:bg-gray-700">Administrador</SelectItem>
                        <SelectItem value={EUserRole.PARTNER} className="text-white hover:bg-gray-700">Sócio</SelectItem>
                        <SelectItem value={EUserRole.CONSULTANT} className="text-white hover:bg-gray-700">Consultor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Feiras (apenas para consultores) */}
              {form.watch("role") === EUserRole.CONSULTANT && (
                <div className="space-y-2">
                  <FormLabel className="text-gray-300">Feiras Associadas *</FormLabel>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-600 rounded-md p-3 bg-gray-700">
                    {fairs.map((fair) => (
                      <div key={fair.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`fair-${fair.id}`}
                          checked={selectedFairIds.includes(fair.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedFairIds(prev => [...prev, fair.id]);
                            } else {
                              setSelectedFairIds(prev => prev.filter(id => id !== fair.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={`fair-${fair.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                        >
                          {fair.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedFairIds.length === 0 && (
                    <p className="text-sm text-red-400">
                      Selecione pelo menos uma feira para o consultor
                    </p>
                  )}
                </div>
              )}

              {/* Status */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-600 p-4 bg-gray-700">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base text-gray-300">Usuário Ativo</FormLabel>
                      <div className="text-sm text-gray-400">
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
                  <FormLabel className="text-gray-300">
                    Senha {isEditing ? "(deixe em branco para manter a atual)" : "*"}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={isEditing ? "Nova senha (opcional)" : "Digite a senha"}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
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
