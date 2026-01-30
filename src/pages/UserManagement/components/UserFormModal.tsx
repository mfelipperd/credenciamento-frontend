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
import { useFairs } from "@/hooks/useFairs";
import { toast } from "sonner";
import { maskCPF, maskPhoneBR } from "@/utils/masks";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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
  confirmPassword: z.string().optional(),
  fairIds: z.array(z.string()).optional(),
}).refine((data) => {
  // Se há senha, deve ter confirmação
  if (data.password && !data.confirmPassword) {
    return false;
  }
  // Se há confirmação, deve ter senha
  if (data.confirmPassword && !data.password) {
    return false;
  }
  // Se ambos existem, devem ser iguais
  if (data.password && data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isEditing = !!user;

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const { data: fairs } = useFairs();

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
      // Removido - o hook useFairs já faz o fetch automaticamente
    }
  }, [isOpen]);

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

  // Função para remover máscaras dos dados
  const removeMasks = (data: UserFormData) => {
    return {
      ...data,
      cpf: data.cpf ? data.cpf.replace(/\D/g, '') : undefined, // Remove tudo que não é dígito
      phone: data.phone ? data.phone.replace(/\D/g, '') : undefined, // Remove tudo que não é dígito
    };
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);

      const { confirmPassword, ...dataWithoutConfirm } = data;
      const cleanedData = removeMasks(dataWithoutConfirm);
      
      console.log("🔍 Dados originais:", dataWithoutConfirm);
      console.log("🧹 Dados limpos (sem máscaras):", cleanedData);
      
      const submitData = {
        ...cleanedData,
        fairIds: selectedFairIds,
        password: data.password || undefined, // Só incluir senha se preenchida
      };
      
      console.log("📤 Payload final enviado:", submitData);

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
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[98vw] sm:min-w-[80vw] sm:max-w-5xl bg-brand-blue mx-auto rounded-[40px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] p-0 ring-1 ring-white/5">
        <DialogHeader className="p-10 border-b border-white/5 bg-white/2">
          <div className="flex flex-col gap-1">
             <span className="text-brand-pink font-black text-[10px] uppercase tracking-[0.4em]">Gestão de Acessos</span>
             <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter">
               {isEditing ? `Editar: ${user?.name}` : "Novo Operador de Sistema"}
             </DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Nome */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-white/30 font-black text-[9px] uppercase tracking-widest ml-1">Nome Completo</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Digite o nome completo" 
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
                  <FormItem className="space-y-2">
                    <FormLabel className="text-white/30 font-black text-[9px] uppercase tracking-widest ml-1">Email Corporativo</FormLabel>
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
                  <FormItem className="space-y-2">
                    <FormLabel className="text-white/30 font-black text-[9px] uppercase tracking-widest ml-1">Documento CPF</FormLabel>
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
                  <FormItem className="space-y-2">
                    <FormLabel className="text-white/30 font-black text-[9px] uppercase tracking-widest ml-1">WhatsApp</FormLabel>
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
                  <FormItem className="space-y-2">
                    <FormLabel className="text-white/30 font-black text-[9px] uppercase tracking-widest ml-1">Função Hierárquica</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl text-white">
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-brand-blue border-white/10 text-white">
                        <SelectItem value={EUserRole.ADMIN} className="hover:bg-white/5">Administrador</SelectItem>
                        <SelectItem value={EUserRole.PARTNER} className="hover:bg-white/5">Sócio</SelectItem>
                        <SelectItem value={EUserRole.CONSULTANT} className="hover:bg-white/5">Consultor</SelectItem>
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
                  <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-white/5 p-5 bg-white/2">
                    <div className="space-y-0.5">
                      <FormLabel className="text-xs font-black text-white uppercase tracking-widest">Status da Conta</FormLabel>
                      <div className="text-[10px] text-white/30 uppercase tracking-tight font-bold">
                        Acesso {field.value ? "Liberado" : "Bloqueado"}
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-brand-cyan"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Feiras (apenas para consultores) */}
            {form.watch("role") === EUserRole.CONSULTANT && (
              <div className="bg-black/20 p-8 rounded-3xl border border-white/5 space-y-6">
                <div className="flex flex-col gap-1">
                   <FormLabel className="text-white/40 font-black text-[10px] uppercase tracking-[0.3em]">Gestão de Permissões</FormLabel>
                   <span className="text-[9px] text-white/20 uppercase tracking-widest font-bold">Vincule as feiras que este consultor poderá visualizar</span>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-h-48 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10">
                  {(fairs || []).map((fair: any) => (
                    <div key={fair.id} className="flex items-center space-x-3 p-4 bg-white/2 border border-white/5 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
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
                        className="border-white/20 data-[state=checked]:bg-brand-cyan data-[state=checked]:border-brand-cyan"
                      />
                      <label
                        htmlFor={`fair-${fair.id}`}
                        className="text-[10px] font-bold text-white/50 group-hover:text-white uppercase tracking-wide cursor-pointer flex-1"
                      >
                        {fair.name}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedFairIds.length === 0 && (
                  <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest text-center animate-pulse">
                     Atenção: Selecione pelo menos uma feira para o consultor
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
              {/* Senha */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                       <FormLabel className="text-white/30 font-black text-[9px] uppercase tracking-widest">
                         Chave de Acesso {isEditing && "(Opcional)"}
                       </FormLabel>
                       <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[9px] text-brand-cyan font-black uppercase tracking-widest hover:text-white transition-colors"
                        >
                          {showPassword ? "Ocultar" : "Mostrar"}
                        </button>
                    </div>
                    <FormControl>
                      <div className="relative group">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder={isEditing ? "Manter atual (vazio)" : "Defina uma senha segura"}
                          {...field} 
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-focus-within:opacity-100 transition-opacity">
                           {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirmação de Senha */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                       <FormLabel className="text-white/30 font-black text-[9px] uppercase tracking-widest">
                         Confirmar Chave
                       </FormLabel>
                       <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-[9px] text-brand-cyan font-black uppercase tracking-widest hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? "Ocultar" : "Mostrar"}
                        </button>
                    </div>
                    <FormControl>
                      <div className="relative group">
                        <Input 
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Repita a chave de acesso"
                          {...field} 
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-focus-within:opacity-100 transition-opacity">
                           {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-10">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting}
                className="h-14 px-10 rounded-2xl border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white font-black uppercase tracking-[0.2em] transition-all"
              >
                Descartar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="h-14 px-14 rounded-2xl bg-linear-to-r from-brand-pink to-brand-pink/80 hover:from-brand-pink hover:to-brand-pink text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-pink/20 transition-all active:scale-95"
              >
                {isSubmitting ? (
                   <span className="flex items-center gap-3">
                     <Loader2 className="animate-spin" size={20} />
                     Processando...
                   </span>
                ) : (
                  isEditing ? "Salvar Alterações" : "Efetivar Cadastro"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
