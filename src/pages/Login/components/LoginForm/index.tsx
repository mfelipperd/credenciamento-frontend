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
      <div className="space-y-7">
        <div className="flex flex-col gap-2">
          <label className="text-slate-400 font-black text-[9px] uppercase tracking-[0.3em] ml-1">
            Portal de Acesso
          </label>
          <ControlledInput
            control={controller.form.control}
            name="email"
            placeholder="E-mail Corporativo"
            type="email"
            className="h-14 text-base bg-slate-100/50 border-slate-200 shadow-inner focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 transition-all rounded-xl font-bold text-slate-900 placeholder:text-slate-300"
          />
        </div>

        <div className="flex flex-col gap-2 relative">
          <div className="flex justify-between items-center ml-1">
            <label className="text-slate-400 font-black text-[9px] uppercase tracking-[0.3em]">
              Senha de Segurança
            </label>
            <a href="#" className="text-brand-cyan hover:text-brand-cyan/80 text-[10px] font-black uppercase tracking-widest transition-colors mb-0.5 mr-1">
              Recuperar
            </a>
          </div>
          <PasswordInput
            control={controller.form.control}
            name="password"
            placeholder="••••••••"
            className="h-14 text-base bg-slate-100/50 border-slate-200 shadow-inner focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 transition-all rounded-xl font-bold text-slate-900 placeholder:text-slate-300"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Button
          type="submit"
          disabled={controller.loading}
          className="bg-brand-pink rounded-2xl w-full h-16 hover:bg-brand-pink/90 text-white text-lg font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-pink/20 transition-all active:scale-[0.98] cursor-pointer group"
          style={{ backgroundColor: '#E91E63', color: '#ffffff' }}
        >
          {controller.loading ? (
            <Loader2 className="animate-spin mr-3 h-6 w-6" />
          ) : (
            <LogIn className="mr-3 h-6 w-6 group-hover:translate-x-1.5 transition-transform" />
          )}
          {controller.loading ? "Autenticando..." : "Entrar no Painel"}
        </Button>
        
        <div className="flex items-center gap-4 px-2 justify-center">
          <input 
            type="checkbox" 
            id="remember"
            className="w-6 h-6 rounded-lg border-white/10 bg-white/5 text-brand-pink focus:ring-brand-pink transition-all cursor-pointer" 
          />
          <label htmlFor="remember" className="text-slate-400 font-bold text-[10px] cursor-pointer select-none uppercase tracking-[0.15em] hover:text-slate-600 transition-colors">
            Manter conectado
          </label>
        </div>
      </div>
    </form>
  );
};
