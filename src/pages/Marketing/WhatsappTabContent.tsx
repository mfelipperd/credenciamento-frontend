import React, { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useFairs } from "@/hooks/useFairs";
import { useSearchParams } from "@/hooks/useSearchParams";
import {
  useWhatsappInstanceStatus,
  useWhatsappWarmupStatus,
  useWhatsappCampaignPreview,
  useWhatsappCampaigns,
  useWhatsappCampaignRecipients,
  useSendWhatsappCampaign,
  usePauseWhatsappCampaign,
  useResumeWhatsappCampaign,
  useCancelWhatsappCampaign,
} from "@/hooks/useWhatsapp";
import type {
  WhatsappSendTo,
  WhatsappRecipientStatus,
} from "@/service/whatsapp.service";
import { toast } from "sonner";
import {
  Send,
  Eye,
  Users,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  RefreshCcw,
  Zap,
  Inbox,
  Pause,
  Play,
  XCircle,
  WifiOff,
  Clock,
  Plus,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatMs = (ms: number): string => {
  const totalMinutes = Math.round(ms / 60000);
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h${minutes}min` : `${hours}h`;
};

const previewMessage = (template: string): string =>
  template.replace(/{{\s*nome\s*}}/gi, "João Silva").replace(/{{\s*empresa\s*}}/gi, "Empresa Exemplo");

const STATUS_LABEL: Record<string, string> = {
  running: "Em andamento",
  paused: "Pausada",
  completed: "Concluída",
  canceled: "Cancelada",
};

const STATUS_CLASS: Record<string, string> = {
  running: "bg-brand-cyan/10 text-brand-cyan",
  paused: "bg-brand-orange/10 text-brand-orange",
  completed: "bg-green-400/10 text-green-400",
  canceled: "bg-white/10 text-white/40",
};

const RECIPIENT_STATUS_LABEL: Record<WhatsappRecipientStatus, string> = {
  queued: "Na fila",
  sent: "Enviado",
  failed: "Falhou",
  skipped: "Pulado",
};

const RECIPIENT_STATUS_CLASS: Record<WhatsappRecipientStatus, string> = {
  queued: "bg-white/10 text-white/50",
  sent: "bg-green-400/10 text-green-400",
  failed: "bg-red-400/10 text-red-400",
  skipped: "bg-brand-orange/10 text-brand-orange",
};

// ─── Component ────────────────────────────────────────────────────────────────

export const WhatsappTabContent: React.FC = () => {
  const { data: fairs, isLoading: loadingFairs } = useFairs();
  const [, , headerFairId] = useSearchParams();

  const { data: instanceStatus, isLoading: loadingInstance } = useWhatsappInstanceStatus();
  const { data: warmup } = useWhatsappWarmupStatus();

  const [view, setView] = useState<"send" | "history">("send");

  const [targetFairId, setTargetFairId] = useState<string>(headerFairId ?? "");
  const [sendTo, setSendTo] = useState<WhatsappSendTo>("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const targetFair = fairs?.find((f) => f.id === targetFairId);

  const { data: preview, isFetching: loadingPreview } = useWhatsappCampaignPreview(
    targetFairId,
    sendTo
  );

  const sendMutation = useSendWhatsappCampaign();

  const { data: campaigns, isFetching: loadingCampaigns, refetch: refetchCampaigns } =
    useWhatsappCampaigns();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [recipientFilter, setRecipientFilter] = useState<WhatsappRecipientStatus | "all">(
    "all"
  );
  const { data: recipients, isFetching: loadingRecipients } =
    useWhatsappCampaignRecipients(selectedCampaignId);

  const pauseMutation = usePauseWhatsappCampaign();
  const resumeMutation = useResumeWhatsappCampaign();
  const cancelMutation = useCancelWhatsappCampaign();

  const filteredRecipients = useMemo(() => {
    if (!recipients) return [];
    if (recipientFilter === "all") return recipients;
    return recipients.filter((r) => r.status === recipientFilter);
  }, [recipients, recipientFilter]);

  const insertVariable = (variable: "{{nome}}" | "{{empresa}}") => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setMessage((prev) => prev + variable);
      return;
    }
    const start = textarea.selectionStart ?? message.length;
    const end = textarea.selectionEnd ?? message.length;
    const next = message.slice(0, start) + variable + message.slice(end);
    setMessage(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + variable.length;
    });
  };

  const isConnected = instanceStatus?.connected === true;
  const canOpenConfirm =
    isConnected && !!targetFairId && !!message.trim() && (preview?.willQueueToday ?? 0) > 0;

  const openConfirmDialog = () => {
    if (!targetFairId) {
      toast.error("Selecione a feira de origem dos visitantes");
      return;
    }
    if (!message.trim()) {
      toast.error("Escreva a mensagem a ser enviada");
      return;
    }
    if (!isConnected) {
      toast.error("Instância do WhatsApp desconectada");
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleSend = async () => {
    if (!targetFair) return;
    setShowConfirmDialog(false);
    const campaignTitle =
      title.trim() || `Campanha ${targetFair.name} — ${new Date().toLocaleDateString("pt-BR")}`;
    const res = await sendMutation.mutateAsync({
      title: campaignTitle,
      targetFairId,
      sendTo,
      message,
    });
    if (res) {
      toast.success(
        `${res.totalQueued} de ${res.totalEligible} enfileirados hoje`,
        {
          duration: 6000,
          description:
            res.totalQueued < res.totalEligible
              ? "Campanha truncada pelo limite de aquecimento — o restante fica para os próximos dias."
              : undefined,
        }
      );
      setSelectedCampaignId(res.id);
      setView("history");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Enviar / Histórico switch ── */}
      <div className="flex items-center justify-end">
        <div className="grid grid-cols-2 gap-1 bg-white/5 border border-white/10 rounded-2xl p-1">
          <button
            onClick={() => setView("send")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              view === "send"
                ? "bg-brand-pink text-white shadow-lg shadow-brand-pink/30"
                : "text-white/50 hover:text-white"
            }`}
          >
            <Send className="h-4 w-4" />
            Enviar Campanha
          </button>
          <button
            onClick={() => setView("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              view === "history"
                ? "bg-brand-pink text-white shadow-lg shadow-brand-pink/30"
                : "text-white/50 hover:text-white"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Histórico
          </button>
        </div>
      </div>

      {/* ── Instance disconnected banner ── */}
      {!loadingInstance && !isConnected && (
        <div className="glass-card border-red-400/20 rounded-2xl p-4 flex items-center gap-3">
          <WifiOff className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">
            Instância do WhatsApp desconectada. Escaneie o QR Code no painel Z-API para
            habilitar o disparo.
          </p>
        </div>
      )}

      {/* ── Warmup bar (always visible) ── */}
      {warmup && (
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-2 text-white/40 text-xs font-black uppercase tracking-widest">
              <Zap className="h-3.5 w-3.5 text-brand-orange" />
              Aquecimento — dia {warmup.day}
            </span>
            <span className="text-white/50 text-[10px] font-bold">
              <span className="text-brand-cyan">{warmup.usedToday}</span>
              <span className="text-white/30"> usados de </span>
              <span className="text-white/60">{warmup.dailyCap}</span>
              <span className="text-white/30"> hoje</span>
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-orange/70 transition-all duration-1000 rounded-full"
              style={{
                width: `${warmup.dailyCap > 0 ? Math.min(100, Math.round((warmup.usedToday / warmup.dailyCap) * 100)) : 0}%`,
              }}
            />
          </div>
          <p className="text-white/20 text-[10px] mt-1.5">
            {warmup.remainingToday} mensagens restantes na cota de hoje.
          </p>
        </div>
      )}

      {view === "send" ? (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ── Right: Preview (70%) ── */}
          <div className="order-2 lg:order-2 flex-1 min-w-0 glass-card border-white/5 shadow-2xl rounded-[32px] p-6 lg:p-8 space-y-5">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-brand-cyan" />
              <h2 className="text-sm font-black text-white uppercase tracking-widest">
                Pré-visualização
              </h2>
            </div>

            {targetFairId ? (
              loadingPreview ? (
                <div className="flex items-center justify-center py-16 gap-2">
                  <LogoLoading size={18} minimal className="animate-pulse" />
                  <span className="text-white/40 text-xs">Calculando elegíveis...</span>
                </div>
              ) : preview ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-xl font-black text-white/70">
                        {preview.eligibleCount.toLocaleString("pt-BR")}
                      </p>
                      <p className="text-white/30 text-[9px] uppercase tracking-widest mt-0.5">
                        Elegíveis
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <p
                        className={`text-xl font-black ${preview.truncatedByWarmup ? "text-brand-orange" : "text-brand-cyan"}`}
                      >
                        {preview.willQueueToday.toLocaleString("pt-BR")}
                      </p>
                      <p className="text-white/30 text-[9px] uppercase tracking-widest mt-0.5">
                        Entram hoje
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-xl font-black text-white/70 flex items-center justify-center gap-1">
                        <Clock className="h-4 w-4 text-white/30" />
                        {formatMs(preview.estimatedDurationMs)}
                      </p>
                      <p className="text-white/30 text-[9px] uppercase tracking-widest mt-0.5">
                        Duração estimada
                      </p>
                    </div>
                  </div>

                  {preview.truncatedByWarmup && (
                    <div className="flex items-start gap-2 p-3 bg-brand-orange/10 border border-brand-orange/20 rounded-xl">
                      <AlertTriangle className="h-4 w-4 text-brand-orange shrink-0 mt-0.5" />
                      <p className="text-brand-orange text-xs">
                        Só {preview.willQueueToday} de {preview.eligibleCount} elegíveis
                        serão enviados hoje por causa do limite de aquecimento (dia{" "}
                        {preview.warmup.day}). O restante precisa de uma nova campanha
                        amanhã.
                      </p>
                    </div>
                  )}

                  <div className="border-t border-white/5 pt-4">
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">
                      Mensagem
                    </p>
                    {message.trim() ? (
                      <div className="bg-[#005C4B]/20 border border-[#00BCD4]/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-md ml-auto">
                        <p className="text-white/90 text-sm whitespace-pre-wrap leading-relaxed">
                          {previewMessage(message)}
                        </p>
                      </div>
                    ) : (
                      <div className="flex h-32 items-center justify-center border border-white/5 rounded-2xl">
                        <p className="text-white/25 text-sm">
                          Escreva a mensagem para visualizar
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : null
            ) : (
              <div className="flex h-[300px] items-center justify-center border border-white/5 rounded-2xl">
                <div className="text-center">
                  <Eye className="h-10 w-10 text-white/10 mx-auto mb-3" />
                  <p className="text-white/25 text-sm">
                    Selecione a feira de origem para ver o preview
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Left: Config (30%) ── */}
          <div className="order-1 lg:order-1 w-full lg:w-[30%] lg:min-w-[280px] space-y-4">
            {/* ── Card 1: Base ── */}
            <div className="glass-card border-white/5 shadow-2xl rounded-[32px] p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-brand-pink text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shrink-0">
                  1
                </span>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">
                  Base de Visitantes
                </h2>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">
                  Feira{" "}
                  <span className="text-white/20 normal-case font-medium">
                    (inclui feiras encerradas)
                  </span>
                </p>
                <Select
                  value={targetFairId}
                  onValueChange={setTargetFairId}
                  disabled={loadingFairs}
                >
                  <SelectTrigger className="h-9 w-full bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all rounded-xl cursor-pointer text-xs">
                    <SelectValue
                      placeholder={loadingFairs ? "Carregando..." : "Selecione a feira..."}
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-blue border-white/10 text-white rounded-2xl">
                    {(fairs ?? []).map((fair) => (
                      <SelectItem
                        key={fair.id}
                        value={fair.id}
                        className="focus:bg-white/10 focus:text-white rounded-xl cursor-pointer text-xs"
                      >
                        <span className="flex items-center gap-2">
                          {fair.name}
                          {fair.isActive ? (
                            <span className="text-[10px] font-black text-brand-cyan uppercase tracking-widest">
                              ● Ativa
                            </span>
                          ) : (
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                              ○ Encerrada
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">
                  Destinatários
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSendTo("all")}
                    className={`h-9 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                      sendTo === "all"
                        ? "bg-brand-pink text-white shadow-lg shadow-brand-pink/20"
                        : "bg-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setSendTo("absent")}
                    className={`h-9 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                      sendTo === "absent"
                        ? "bg-brand-pink text-white shadow-lg shadow-brand-pink/20"
                        : "bg-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    Ausentes
                  </button>
                </div>
              </div>
            </div>

            {/* ── Card 2: Mensagem ── */}
            <div className="glass-card border-white/5 shadow-2xl rounded-[32px] p-5 space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-brand-pink text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shrink-0">
                  2
                </span>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">
                  Mensagem
                </h2>
              </div>

              <div>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1.5">
                  Nome Interno da Campanha
                </p>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`Ex: Lembrete ${targetFair?.name ?? "Feira"}`}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-brand-cyan/30 text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
                    Texto
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => insertVariable("{{nome}}")}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      nome
                    </button>
                    <button
                      type="button"
                      onClick={() => insertVariable("{{empresa}}")}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      empresa
                    </button>
                  </div>
                </div>
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  placeholder={
                    "Olá, {{nome}}! A {{empresa}} está te esperando na feira...\n\nPara não receber mais mensagens, responda SAIR."
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-3 text-white/80 text-xs leading-relaxed placeholder:text-white/20 focus:outline-none focus:border-brand-pink/50 focus:ring-4 focus:ring-brand-pink/10 transition-all resize-none"
                />
                {!/sair/i.test(message) && message.trim() && (
                  <p className="text-brand-orange/70 text-[10px] mt-1.5">
                    Lembrete: inclua uma forma de opt-out (ex: "responda SAIR").
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-white/5">
                <Button
                  type="button"
                  disabled={!canOpenConfirm || sendMutation.isPending}
                  onClick={openConfirmDialog}
                  className="w-full h-10 bg-brand-pink rounded-2xl text-white font-black uppercase tracking-widest text-xs hover:bg-brand-pink/90 transition-all shadow-xl shadow-brand-pink/20 active:scale-[0.98] cursor-pointer disabled:opacity-40"
                >
                  {sendMutation.isPending ? (
                    <LogoLoading size={14} minimal className="mr-2" />
                  ) : (
                    <Send className="h-3.5 w-3.5 mr-2" />
                  )}
                  {sendMutation.isPending ? "Enviando..." : "Disparar Campanha"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── History ── */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-brand-cyan" />
              Histórico de Campanhas
            </h2>
            <button
              onClick={() => refetchCampaigns()}
              disabled={loadingCampaigns}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white/50 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCcw className={`h-3.5 w-3.5 ${loadingCampaigns ? "animate-spin" : ""}`} />
              Atualizar
            </button>
          </div>

          {!campaigns || campaigns.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center">
              <Inbox className="h-8 w-8 text-white/10 mx-auto mb-3" />
              <p className="text-white/25 text-sm">Nenhuma campanha enviada ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {campaigns.map((campaign) => {
                const isSelected = selectedCampaignId === campaign.id;
                const fair = fairs?.find((f) => f.id === campaign.targetFairId);
                const progress = campaign.totalQueued > 0
                  ? Math.round(((campaign.totalSent + campaign.totalFailed) / campaign.totalQueued) * 100)
                  : 0;
                const createdDate = new Date(campaign.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });

                return (
                  <div
                    key={campaign.id}
                    className={`glass-card rounded-2xl overflow-hidden border transition-all ${isSelected ? "border-brand-cyan/30" : "border-white/5"}`}
                  >
                    <button
                      onClick={() =>
                        setSelectedCampaignId(isSelected ? null : campaign.id)
                      }
                      className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/5 transition-all group"
                    >
                      <div
                        className={`w-1 self-stretch rounded-full shrink-0 transition-colors ${isSelected ? "bg-brand-cyan" : "bg-white/10 group-hover:bg-white/20"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white truncate">
                          {campaign.title}
                        </p>
                        <p className="text-xs text-white/40 truncate mt-0.5">
                          {fair?.name ?? campaign.targetFairId} · {createdDate}
                        </p>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-2 max-w-xs">
                          <div
                            className="h-full bg-brand-cyan/70 transition-all duration-1000 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge
                          className={`text-[9px] font-black uppercase tracking-widest border-0 ${STATUS_CLASS[campaign.status]}`}
                        >
                          {STATUS_LABEL[campaign.status]}
                        </Badge>
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-white/60 font-bold">
                            {campaign.totalSent}/{campaign.totalQueued} enviados
                          </p>
                          {campaign.totalFailed > 0 && (
                            <p className="text-[9px] text-red-400">
                              {campaign.totalFailed} falharam
                            </p>
                          )}
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 text-white/30 transition-transform ${isSelected ? "rotate-90" : ""}`}
                        />
                      </div>
                    </button>

                    {isSelected && (
                      <div className="border-t border-white/5 p-4 space-y-4">
                        {campaign.status === "paused" && (
                          <div className="flex items-start gap-2 p-3 bg-brand-orange/10 border border-brand-orange/20 rounded-xl">
                            <AlertTriangle className="h-4 w-4 text-brand-orange shrink-0 mt-0.5" />
                            <p className="text-brand-orange text-xs">
                              Campanha pausada — se você não pausou manualmente, o
                              circuit breaker deteve o envio por taxa de falha alta.
                              Revise os destinatários com falha abaixo antes de
                              retomar.
                            </p>
                          </div>
                        )}

                        {/* Lifecycle actions */}
                        <div className="flex flex-wrap gap-2">
                          {campaign.status === "running" && (
                            <Button
                              size="sm"
                              disabled={pauseMutation.isPending}
                              onClick={() => pauseMutation.mutate(campaign.id)}
                              className="h-8 bg-white/10 border border-white/20 rounded-xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 cursor-pointer"
                            >
                              <Pause className="h-3 w-3 mr-1.5" />
                              Pausar
                            </Button>
                          )}
                          {campaign.status === "paused" && (
                            <Button
                              size="sm"
                              disabled={resumeMutation.isPending}
                              onClick={() => resumeMutation.mutate(campaign.id)}
                              className="h-8 bg-brand-cyan/20 border border-brand-cyan/30 rounded-xl text-brand-cyan text-[10px] font-black uppercase tracking-widest hover:bg-brand-cyan/30 cursor-pointer"
                            >
                              <Play className="h-3 w-3 mr-1.5" />
                              Retomar
                            </Button>
                          )}
                          {campaign.status !== "completed" && campaign.status !== "canceled" && (
                            <Button
                              size="sm"
                              disabled={cancelMutation.isPending}
                              onClick={() => cancelMutation.mutate(campaign.id)}
                              className="h-8 bg-red-400/10 border border-red-400/20 rounded-xl text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-400/20 cursor-pointer"
                            >
                              <XCircle className="h-3 w-3 mr-1.5" />
                              Cancelar
                            </Button>
                          )}
                        </div>

                        {/* Recipients */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                              <Users className="h-3 w-3" />
                              Destinatários
                            </p>
                            <div className="flex gap-1">
                              {(["all", "failed", "sent", "queued", "skipped"] as const).map(
                                (status) => (
                                  <button
                                    key={status}
                                    onClick={() => setRecipientFilter(status)}
                                    className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer ${
                                      recipientFilter === status
                                        ? "bg-brand-pink text-white"
                                        : "bg-white/5 text-white/40 hover:bg-white/10"
                                    }`}
                                  >
                                    {status === "all" ? "Todos" : RECIPIENT_STATUS_LABEL[status]}
                                  </button>
                                )
                              )}
                            </div>
                          </div>

                          {loadingRecipients ? (
                            <div className="flex items-center justify-center py-6 gap-2">
                              <LogoLoading size={18} minimal className="animate-pulse" />
                              <span className="text-white/40 text-xs">
                                Carregando destinatários...
                              </span>
                            </div>
                          ) : filteredRecipients.length === 0 ? (
                            <p className="text-white/25 text-xs text-center py-6">
                              Nenhum destinatário nesse filtro
                            </p>
                          ) : (
                            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                              {filteredRecipients.map((r) => (
                                <div
                                  key={r.id}
                                  className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2"
                                >
                                  <Badge
                                    className={`text-[9px] font-black uppercase tracking-widest border-0 shrink-0 ${RECIPIENT_STATUS_CLASS[r.status]}`}
                                  >
                                    {RECIPIENT_STATUS_LABEL[r.status]}
                                  </Badge>
                                  <span className="text-white/60 text-xs font-mono truncate">
                                    {r.phone}
                                  </span>
                                  {r.error && (
                                    <span className="text-red-400 text-[10px] truncate flex-1 text-right">
                                      {r.error}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
                      Feira:{" "}
                    </span>
                    <span className="text-white font-bold">{targetFair?.name ?? "—"}</span>
                  </p>
                  <p>
                    <span className="text-white/30 font-black uppercase tracking-widest text-xs">
                      Destinatários:{" "}
                    </span>
                    <span className="text-brand-cyan font-bold">
                      {sendTo === "all"
                        ? "Todos os visitantes inscritos"
                        : "Visitantes que não fizeram check-in"}
                    </span>
                  </p>
                  {preview && (
                    <p>
                      <span className="text-white/30 font-black uppercase tracking-widest text-xs">
                        Hoje:{" "}
                      </span>
                      <span className="text-white/70">
                        {preview.willQueueToday} de {preview.eligibleCount} elegíveis
                        {" "}(~{formatMs(preview.estimatedDurationMs)})
                      </span>
                    </p>
                  )}
                </div>
                {preview?.truncatedByWarmup && (
                  <div className="flex items-start gap-2 p-3 bg-brand-orange/10 border border-brand-orange/20 rounded-xl">
                    <AlertTriangle className="h-4 w-4 text-brand-orange shrink-0 mt-0.5" />
                    <p className="text-brand-orange text-xs">
                      {preview.eligibleCount - preview.willQueueToday} visitantes ficarão
                      de fora hoje pelo limite de aquecimento.
                    </p>
                  </div>
                )}
                <div className="flex items-start gap-2 p-3 bg-brand-orange/10 border border-brand-orange/20 rounded-xl">
                  <AlertTriangle className="h-4 w-4 text-brand-orange shrink-0 mt-0.5" />
                  <p className="text-brand-orange text-xs">
                    Esta ação envia mensagens reais de WhatsApp. Confirme que o texto e a
                    feira estão corretos.
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
