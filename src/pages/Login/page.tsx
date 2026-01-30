import { LoginForm } from "./components/LoginForm";
import { useLocation } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Login = () => {
  const location = useLocation();
  const errorMessage = location.state?.message;

  return (
    <section className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
      {/* Lado Esquerdo - Branding (Escondido em mobile ou no topo) */}
      <div 
        className="w-full lg:w-1/2 flex flex-col items-center justify-center p-12 lg:p-24 bg-brand-blue relative"
        style={{ backgroundColor: '#0d1b3e' }}
      >
        <div className="flex flex-col items-center gap-10 max-w-lg z-10">
          <img 
            src="/logo2.png" 
            className="w-64 lg:w-[450px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 duration-500" 
            alt="Expo Multi Mix Logo" 
          />
          <div className="hidden lg:block text-center space-y-4">
            <h2 className="text-white text-4xl font-black tracking-tight uppercase">
              Bem-vindo ao Sistema
            </h2>
            <p className="text-blue-100/90 text-xl font-medium leading-relaxed max-w-md mx-auto">
              Gerencie seus credenciamentos de forma rápida e segura.
            </p>
          </div>
        </div>
        {/* Subtle background decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-pink rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-cyan rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Lado Direito - Formulário de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-20 bg-neutral-50 shadow-[inset_10px_0_30px_rgba(0,0,0,0.02)]">
        <div className="w-full max-w-md flex flex-col gap-10">
          <div className="lg:hidden flex justify-center">
             <img src="/logo2.png" className="w-40 invert brightness-0 grayscale opacity-80" alt="Logo" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-slate-900 text-5xl font-black tracking-tighter">
              Acessar
            </h1>
            <p className="text-slate-500 text-lg font-medium">
              Entre com suas credenciais de administrador
            </p>
          </div>

          {errorMessage && (
            <Alert className="border-red-200 bg-red-50 ring-1 ring-red-200/50">
              <AlertDescription className="text-red-700 font-bold text-center py-1">
                ⚠️ {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <div className="w-full">
            <LoginForm />
          </div>
          
          <div className="text-center text-sm text-slate-400 font-medium pt-8 border-t border-slate-200">
            &copy; {new Date().getFullYear()} Expo Multi Mix. <br className="sm:hidden" /> Todos os direitos reservados.
          </div>
        </div>
      </div>
    </section>
  );
};
