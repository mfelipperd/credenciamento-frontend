import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Calendar, 
  Shield,
  CheckCircle,
  XCircle
} from "lucide-react";
import { EUserRole } from "@/enums/user.enum";
import { cn } from "@/lib/utils";

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

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailModal({ user, isOpen, onClose }: UserDetailModalProps) {
  if (!user) return null;

  const getRoleLabel = (role: EUserRole) => {
    switch (role) {
      case EUserRole.ADMIN:
        return "Administrador";
      case EUserRole.PARTNER:
        return "Sócio";
      default:
        return "Usuário";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] sm:min-w-[700px] sm:max-w-3xl bg-brand-blue mx-auto rounded-[32px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] p-0 ring-1 ring-white/5">
        <DialogHeader className="p-8 border-b border-white/5 bg-white/2">
          <div className="flex flex-col gap-1">
             <span className="text-brand-cyan font-black text-[10px] uppercase tracking-[0.4em]">Ficha Cadastral</span>
             <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
               <User className="h-6 w-6 text-brand-pink" />
               Detalhes do Operador
             </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
               <div className="w-2 h-2 bg-brand-pink rounded-full" />
               <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Informações de Contato</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Nome Completo</label>
                <p className="text-sm font-bold text-white bg-white/5 p-4 rounded-xl border border-white/5">
                  {user.name}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Email Vinculado</label>
                <p className="text-sm font-bold text-brand-cyan bg-brand-cyan/5 p-4 rounded-xl border border-brand-cyan/10 flex items-center gap-3">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
              </div>

              {user.cpf && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Documento CPF</label>
                  <p className="text-sm font-bold text-white/70 bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-3">
                    <CreditCard className="h-4 w-4" />
                    {user.cpf}
                  </p>
                </div>
              )}

              {user.phone && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">WhatsApp</label>
                  <p className="text-sm font-bold text-white/70 bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-3">
                    <Phone className="h-4 w-4" />
                    {user.phone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Permissões & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
               <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Nível de Acesso</label>
               <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl">
                 <Shield className="h-5 w-5 text-brand-pink" />
                 <Badge className="bg-brand-pink text-white border-none px-4 py-1 rounded-full font-black text-[10px] uppercase">
                   {getRoleLabel(user.role)}
                 </Badge>
               </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
               <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Integridade da Conta</label>
               <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl">
                 {user.isActive ? (
                   <CheckCircle className="h-5 w-5 text-green-500" />
                 ) : (
                   <XCircle className="h-5 w-5 text-red-500" />
                 )}
                 <Badge className={cn(
                   "px-4 py-1 rounded-full font-black text-[10px] uppercase",
                   user.isActive ? "bg-green-500/20 text-green-500 border-green-500/30" : "bg-red-500/20 text-red-500 border-red-500/30"
                 )}>
                   {user.isActive ? "Operacional" : "Suspenso"}
                 </Badge>
               </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="glass-card p-6 rounded-2xl border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Data de Ingresso</label>
                <div className="text-xs font-bold text-white/60 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-brand-cyan" />
                  {formatDate(user.createdAt)}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Última Modificação</label>
                <div className="text-xs font-bold text-white/60 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-brand-cyan" />
                  {formatDate(user.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-white/5 flex justify-end">
          <Button 
            onClick={onClose}
            className="h-12 px-10 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white font-black uppercase tracking-widest border border-white/10 transition-all"
          >
            Fechar Visualização
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
