import { ControlledInput } from "@/components/ControlledInput";
import { PasswordInput } from "@/components/PasswordInput";
import { useLoginController } from "../../login.controller";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn } from "lucide-react";

export const LoginForm = () => {
  const controller = useLoginController();
  return (
    <form
      className="w-full flex flex-col gap-10"
      onSubmit={controller.form.handleSubmit(controller.handleSubmit)}
    >
      <div className="space-y-8">
        <div className="space-y-3">
          <label className="text-white/70 font-black text-[10px] uppercase tracking-[0.2em] ml-1">
            Portal de Acesso
          </label>
          <ControlledInput
            control={controller.form.control}
            name="email"
            placeholder="E-mail Corporativo"
            type="email"
            className="h-16 text-lg bg-white/5 border-white/10 shadow-2xl focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 transition-all rounded-2xl font-bold text-white placeholder:text-white/20"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#ffffff' }}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center ml-1">
            <label className="text-white/70 font-black text-[10px] uppercase tracking-[0.2em]">
              Senha de Segurança
            </label>
            <a href="#" className="text-brand-cyan hover:text-brand-cyan/80 text-[10px] font-black uppercase tracking-widest transition-colors">
              Recuperar
            </a>
          </div>
          <PasswordInput
            control={controller.form.control}
            name="password"
            placeholder="••••••••"
            className="h-16 text-lg bg-white/5 border-white/10 shadow-2xl focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 transition-all rounded-2xl font-bold text-white placeholder:text-white/20"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#ffffff' }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <Button
          type="submit"
          disabled={controller.loading}
          className="bg-brand-pink rounded-2xl w-full py-10 hover:bg-brand-pink/90 text-white text-xl font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(233,30,99,0.3)] transition-all active:scale-[0.98] cursor-pointer group"
          style={{ backgroundColor: '#E91E63', color: '#ffffff' }}
        >
          {controller.loading ? (
            <Loader2 className="animate-spin mr-4 h-8 w-8" />
          ) : (
            <LogIn className="mr-4 h-8 w-8 group-hover:translate-x-2 transition-transform" />
          )}
          {controller.loading ? "Autenticando..." : "Entrar no Painel"}
        </Button>
        
        <div className="flex items-center gap-4 px-2 justify-center">
          <input 
            type="checkbox" 
            id="remember"
            className="w-6 h-6 rounded-lg border-white/10 bg-white/5 text-brand-pink focus:ring-brand-pink transition-all cursor-pointer" 
          />
          <label htmlFor="remember" className="text-white/40 font-bold text-xs cursor-pointer select-none uppercase tracking-widest hover:text-white/60 transition-colors">
            Manter conectado
          </label>
        </div>
      </div>
    </form>
  );
};
