import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LogoLoading } from "@/components/LogoLoading";
import { useSendPush } from "@/hooks/usePush";
import { toast } from "sonner";
import { Bell, Send, Eye, AlertTriangle, Globe } from "lucide-react";

const DEFAULT_URL = "https://www.expomultimix.com.br";

export const PushMarketingPage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const sendMutation = useSendPush();

  const canSend = title.trim().length > 0 && body.trim().length > 0;

  const openConfirmDialog = () => {
    if (!title.trim()) {
      toast.error("Escreva o título da notificação");
      return;
    }
    if (!body.trim()) {
      toast.error("Escreva o texto da notificação");
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleSend = async () => {
    setShowConfirmDialog(false);
    const res = await sendMutation.mutateAsync({
      title: title.trim(),
      body: body.trim(),
      url: url.trim() || undefined,
    });
    if (res) {
      toast.success(
        `${res.sent} navegador(es) notificados${res.failed > 0 ? ` — ${res.failed} falharam` : ""}`,
        { duration: 6000 }
      );
      setTitle("");
      setBody("");
      setUrl("");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
          <Bell className="h-8 w-8 text-brand-pink" />
          NOTIFICAÇÕES <span className="text-brand-cyan">PUSH</span>
        </h1>
        <div className="h-1.5 w-24 bg-linear-to-r from-brand-pink to-brand-cyan rounded-full" />
        <p className="text-white/40 text-sm">
          Envia uma notificação no navegador de todos os visitantes do site público que já
          permitiram receber notificações — sem precisar de email ou telefone.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ── Right: Preview (70%) ── */}
        <div className="order-2 lg:order-2 flex-1 min-w-0 glass-card border-white/5 shadow-2xl rounded-[32px] p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-5">
            <Eye className="h-5 w-5 text-brand-cyan" />
            <h2 className="text-sm font-black text-white uppercase tracking-widest">
              Pré-visualização
            </h2>
          </div>

          {title.trim() || body.trim() ? (
            <div className="max-w-sm mx-auto bg-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden border border-white/10">
              <div className="flex items-start gap-3 p-4">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Globe className="h-5 w-5 text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white/50 text-[11px] truncate">expomultimix.com.br</p>
                    <span className="text-white/30 text-[10px] shrink-0">agora</span>
                  </div>
                  <p className="text-white font-bold text-sm mt-0.5 truncate">
                    {title.trim() || "Título da notificação"}
                  </p>
                  <p className="text-white/70 text-xs mt-0.5 line-clamp-2">
                    {body.trim() || "Texto da notificação"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center border border-white/5 rounded-2xl">
              <div className="text-center">
                <Eye className="h-10 w-10 text-white/10 mx-auto mb-3" />
                <p className="text-white/25 text-sm">
                  Preencha o título e o texto para visualizar
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Left: Config (30%) ── */}
        <div className="order-1 lg:order-1 w-full lg:w-[30%] lg:min-w-[280px] space-y-4">
          <div className="glass-card border-white/5 shadow-2xl rounded-[32px] p-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="bg-brand-pink text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shrink-0">
                1
              </span>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">
                Conteúdo
              </h2>
            </div>

            <div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1.5">
                Título
              </p>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Últimos dias para o seu stand!"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-brand-pink/30 text-xs"
              />
            </div>

            <div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1.5">
                Texto
              </p>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder="A Expo MultiMix 2026 está chegando. Fale com a gente e garanta sua vaga."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-3 text-white/80 text-xs leading-relaxed placeholder:text-white/20 focus:outline-none focus:border-brand-pink/50 focus:ring-4 focus:ring-brand-pink/10 transition-all resize-none"
              />
            </div>

            <div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1.5">
                Link ao clicar{" "}
                <span className="text-white/20 normal-case font-medium">(opcional)</span>
              </p>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={DEFAULT_URL}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-brand-cyan/30 text-xs"
              />
            </div>

            <div className="pt-2 border-t border-white/5">
              <Button
                type="button"
                disabled={!canSend || sendMutation.isPending}
                onClick={openConfirmDialog}
                className="w-full h-10 bg-brand-pink rounded-2xl text-white font-black uppercase tracking-widest text-xs hover:bg-brand-pink/90 transition-all shadow-xl shadow-brand-pink/20 active:scale-[0.98] cursor-pointer disabled:opacity-40"
              >
                {sendMutation.isPending ? (
                  <LogoLoading size={14} minimal className="mr-2" />
                ) : (
                  <Send className="h-3.5 w-3.5 mr-2" />
                )}
                {sendMutation.isPending ? "Enviando..." : "Disparar Notificação"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Confirm send dialog ── */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-brand-blue/95 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-white font-black uppercase tracking-widest">
              <Send className="h-5 w-5 text-brand-pink" />
              Confirmar Envio
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-white/50 mt-2">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1.5 text-left">
                  <p>
                    <span className="text-white/30 font-black uppercase tracking-widest text-xs">
                      Título:{" "}
                    </span>
                    <span className="text-white font-bold">{title}</span>
                  </p>
                  <p>
                    <span className="text-white/30 font-black uppercase tracking-widest text-xs">
                      Destinatários:{" "}
                    </span>
                    <span className="text-brand-cyan font-bold">
                      Todos os navegadores inscritos no site público
                    </span>
                  </p>
                </div>
                <div className="flex items-start gap-2 p-3 bg-brand-orange/10 border border-brand-orange/20 rounded-xl">
                  <AlertTriangle className="h-4 w-4 text-brand-orange shrink-0 mt-0.5" />
                  <p className="text-brand-orange text-xs">
                    Esta ação envia uma notificação real para todo mundo que já permitiu
                    notificações no site. Não é possível segmentar por feira ou cidade ainda,
                    nem desfazer depois de enviada.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-black uppercase tracking-widest rounded-2xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSend}
              className="bg-brand-pink hover:bg-brand-pink/90 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-brand-pink/20"
            >
              Confirmar e Enviar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
