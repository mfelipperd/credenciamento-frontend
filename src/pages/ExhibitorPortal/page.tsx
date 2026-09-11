import { PublicLayout } from "@/components/Layout/PublicLayout";
import { ControlledInput } from "@/components/ControlledInput";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { LogoLoading } from "@/components/LogoLoading";
import { useExhibitorAuth } from "@/hooks/useExhibitorAuth";
import { useExhibitorPortalController } from "./exhibitorPortal.controller";

export const ExhibitorPortalPage = () => {
  const { isAuthenticated, exhibitorAccount, signOut } = useExhibitorAuth();
  const {
    mode,
    setMode,
    loading,
    loginForm,
    firstAccessForm,
    handleLogin,
    handleFirstAccess,
  } = useExhibitorPortalController();

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto px-4 py-14 space-y-8">
        <div className="text-center space-y-1">
          <p className="text-xs font-black uppercase tracking-widest text-brand-orange">
            Portal do expositor
          </p>
          <h1 className="text-2xl font-black text-slate-900">Minha conta</h1>
        </div>

        {isAuthenticated ? (
          <div className="text-center space-y-4">
            <p className="text-slate-600">
              Logado como <strong>{exhibitorAccount?.exhibitorName}</strong>
            </p>
            <Button variant="secondary" onClick={signOut}>
              Sair
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setMode("first-access")}
                className={`flex-1 rounded-lg py-2 text-sm font-black uppercase tracking-wide transition-all ${
                  mode === "first-access" ? "bg-white shadow text-slate-900" : "text-slate-500"
                }`}
              >
                Primeiro acesso
              </button>
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 rounded-lg py-2 text-sm font-black uppercase tracking-wide transition-all ${
                  mode === "login" ? "bg-white shadow text-slate-900" : "text-slate-500"
                }`}
              >
                Entrar
              </button>
            </div>

            {mode === "first-access" ? (
              <form
                className="space-y-4"
                onSubmit={firstAccessForm.handleSubmit(handleFirstAccess)}
              >
                <p className="text-xs text-slate-500 text-center">
                  Use o código de 6 dígitos que enviamos por email após a confirmação do pagamento do seu stand.
                </p>
                <ControlledInput
                  control={firstAccessForm.control}
                  name="email"
                  type="email"
                  placeholder="E-mail usado na compra"
                  autoComplete="email"
                />
                <ControlledInput
                  control={firstAccessForm.control}
                  name="code"
                  placeholder="Código de 6 dígitos"
                  inputMode="numeric"
                />
                <PasswordInput
                  control={firstAccessForm.control}
                  name="password"
                  placeholder="Crie sua senha"
                  autoComplete="new-password"
                />
                <Button type="submit" disabled={loading} className="w-full h-14 text-base font-black uppercase">
                  {loading ? <LogoLoading size={24} minimal /> : "Ativar conta"}
                </Button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={loginForm.handleSubmit(handleLogin)}>
                <ControlledInput
                  control={loginForm.control}
                  name="email"
                  type="email"
                  placeholder="E-mail"
                  autoComplete="email"
                />
                <PasswordInput
                  control={loginForm.control}
                  name="password"
                  placeholder="Senha"
                  autoComplete="current-password"
                />
                <Button type="submit" disabled={loading} className="w-full h-14 text-base font-black uppercase">
                  {loading ? <LogoLoading size={24} minimal /> : "Entrar"}
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};
