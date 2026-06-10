import React, { useState, useCallback, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useMarketingService } from "@/service/marketing.service";
import { useFairs } from "@/hooks/useFairs";
import { useFairImages } from "@/hooks/useFinance";
import { useSearchParams } from "@/hooks/useSearchParams";
import { toast } from "sonner";
import {
  Mail,
  Send,
  Eye,
  Users,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  MapPin,
  Calendar,
  ChevronRight,
  BarChart3,
  RefreshCcw,
  TrendingUp,
  MousePointerClick,
  Inbox,
  ExternalLink,
  Info,
} from "lucide-react";
import { LogoLoading } from "@/components/LogoLoading";
import { Tabs } from "@/components/ui/tabs";
import { PageTabsList, PageTabsTrigger } from "@/components/ui/page-tabs";
import type { Fair } from "@/interfaces/fairs";

// ─── Date helpers ──────────────────────────────────────────────────────────────

const fmt = (d?: string | null): string => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

const fairInfo = (fair?: Fair) => {
  const name = fair?.name ?? "ExpoMultiMix";
  const city = fair?.city ?? "";
  const state = fair?.state ?? "";
  const cityState = [city, state].filter(Boolean).join(" — ");
  const location = fair?.location ?? "";
  const fullLocation = [cityState, location].filter(Boolean).join(" · ");
  const startDate = fmt(fair?.startDate);
  const endDate = fmt(fair?.endDate);
  const dateRange = !startDate
    ? ""
    : startDate === endDate || !endDate
      ? startDate
      : `${startDate} a ${endDate}`;
  const time =
    fair?.startTime && fair?.endTime
      ? `${fair.startTime} às ${fair.endTime}`
      : (fair?.startTime ?? "");
  const mapsUrl = fair?.googleMapsUrl ?? "#";
  return { name, cityState, location, fullLocation, dateRange, time, mapsUrl };
};

// ─── AI Services ───────────────────────────────────────────────────────────────

const AI_SERVICES = [
  {
    name: "Claude",
    shortUrl: "claude.ai",
    url: "https://claude.ai/new",
    color: "#D97757",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M12 3L3 20h4.5L12 10l4.5 10H21L12 3zm0 9.5-1.5 4h3l-1.5-4z" />
      </svg>
    ),
  },
  {
    name: "ChatGPT",
    shortUrl: "chat.openai.com",
    url: "https://chat.openai.com/",
    color: "#10A37F",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M12 2a10 10 0 0 1 7.1 17.1L17 22l-1.5-3.5A10 10 0 1 1 12 2zm0 2a8 8 0 1 0 0 16A8 8 0 0 0 12 4zm0 3a5 5 0 1 1 0 10A5 5 0 0 1 12 7zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
      </svg>
    ),
  },
  {
    name: "Gemini",
    shortUrl: "gemini.google.com",
    url: "https://gemini.google.com/",
    color: "#4285F4",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M12 2c-1 5-5 9-10 10 5 1 9 5 10 10 1-5 5-9 10-10-5-1-9-5-10-10z" />
      </svg>
    ),
  },
  {
    name: "DeepSeek",
    shortUrl: "chat.deepseek.com",
    url: "https://chat.deepseek.com/",
    color: "#4D6BFD",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M12 5C7 5 3 8.6 3 12s4 7 9 7 9-3.6 9-7-4-7-9-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
      </svg>
    ),
  },
  {
    name: "Copilot",
    shortUrl: "copilot.microsoft.com",
    url: "https://copilot.microsoft.com/",
    color: "#9C6ADE",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M12 2C8.7 2 6 4.7 6 8c0 5.2 6 14 6 14s6-8.8 6-14c0-3.3-2.7-6-6-6zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
      </svg>
    ),
  },
];

// ─── Fixed HTML blocks injected verbatim into the AI prompt ───────────────────

const aiBlockFairDetails = (fair: Fair): string => {
  const { name, fullLocation, dateRange, time, mapsUrl } = fairInfo(fair);
  const rows = [
    dateRange
      ? `<p style="margin:0 0 6px;color:#ffffff;font-size:15px;font-weight:700;">&#128197; ${dateRange}${time ? ` &middot; ${time}` : ""}</p>`
      : "",
    fullLocation
      ? `<p style="margin:0 0 6px;color:rgba(255,255,255,0.75);font-size:13px;">&#128205; ${fullLocation}</p>`
      : "",
    mapsUrl !== "#"
      ? `<p style="margin:0;font-size:12px;"><a href="${mapsUrl}" style="color:#00BCD4;text-decoration:none;">Ver no Google Maps &#8250;</a></p>`
      : "",
  ]
    .filter(Boolean)
    .join("\n    ");
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;"><tr><td style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-left:3px solid #00BCD4;border-radius:0 8px 8px 0;padding:18px 20px;"><p style="margin:0 0 10px;color:#00BCD4;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">${name}</p>
    ${rows}</td></tr></table>`;
};

const aiBlockLogos = (logoUrls: string[]): string => {
  if (!logoUrls || logoUrls.length === 0) return "";
  const perRow = 5;
  const rows: string[][] = [];
  for (let i = 0; i < logoUrls.length; i += perRow)
    rows.push(logoUrls.slice(i, i + perRow));
  const rowsHtml = rows
    .map((row) => {
      const w = Math.floor(100 / row.length);
      const cells = row
        .map(
          (url) =>
            `<td width="${w}%" style="text-align:center;padding:8px;vertical-align:middle;">` +
            `<img src="${url}" alt="Expositor" style="max-width:90px;max-height:60px;height:auto;display:block;margin:0 auto;"></td>`,
        )
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;"><tr><td><p style="margin:0 0 12px;color:rgba(255,255,255,0.45);font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-align:center;">Marcas Participantes</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rowsHtml}</table></td></tr></table>`;
};

const aiBlockFooter = (fairName: string): string =>
  `<tr><td style="padding:20px 40px 28px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);"><p style="margin:0 0 4px;color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;">${fairName}</p><p style="margin:0 0 8px;color:rgba(255,255,255,0.25);font-size:11px;">gerencia@expomultimix.com.br</p><p style="margin:0;font-size:10px;"><a href="#descadastro" style="color:rgba(255,255,255,0.25);text-decoration:underline;">Cancelar inscri&#231;&#227;o</a></p></td></tr>`;

const generateAIPrompt = (
  fair: Fair,
  userDescription: string,
  logoUrls: string[] = [],
): string => {
  const { name } = fairInfo(fair);
  const monthYear = new Date().toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const blockFairDetails = aiBlockFairDetails(fair);
  const blockLogos = aiBlockLogos(logoUrls);
  const blockFooter = aiBlockFooter(name);
  const hasLogos = logoUrls.length > 0;

  return `Você é especialista sênior em email marketing B2B com foco em feiras comerciais atacadistas. Domina design de email responsivo, copywriting para lojistas e entregabilidade.

## Missão
Crie um email de marketing completo para a ${name}. Gere o TÍTULO INTERNO da campanha, o SUBJECT LINE e o HTML completo do email.

## Sobre a ExpoMultiMix (USE NO COPYWRITING — não invente informações)
A ExpoMultiMix é a maior feira multissetorial atacadista do Norte do Brasil, focada em negócios B2B.

**Segmentos:** utilidades domésticas, brinquedos, puericultura, artigos para festas, descartáveis, variedades e decoração.

**Público exclusivo:** lojistas e empreendedores com CNPJ. Acesso proibido ao consumidor final.

**Proposta de valor real (use no copywriting — nunca invente outras):**
- Negociar diretamente com gerentes e diretores de fábricas e importadoras
- Testar lançamentos antes de chegarem ao mercado
- Condições de pagamento e descontos exclusivos para compradores
- Networking com lojistas de toda a região
- Entrada gratuita com credenciamento online

**Tom:** falar com o LOJISTA — foco em compra, reposição de estoque, novidades do setor. Nunca mencionar consumidor final.

## Personalização
Use {{VISITOR_NAME}} para o nome do destinatário — o sistema substitui antes do envio.

## O que criar
${userDescription}

## ═══════════════════════════════════════════════════
## BLOCOS FIXOS — COPIE LITERALMENTE, SEM ALTERAR NADA
## ═══════════════════════════════════════════════════
Os blocos abaixo foram gerados pelo sistema com dados reais da feira e logos das empresas expositoras.
Você DEVE inseri-los no email exatamente como estão — não reescreva, não reformate, não corrija espaçamento.
Alterar qualquer caractere desses blocos é um erro crítico.

### BLOCO A — Detalhes da Feira
Posição obrigatória: após a proposta de valor, antes do CTA principal.
\`\`\`html
${blockFairDetails}
\`\`\`

${
  hasLogos
    ? `### BLOCO B — Marcas Participantes (logos dos expositores)
Posição obrigatória: imediatamente antes do rodapé.
\`\`\`html
${blockLogos}
\`\`\``
    : ""
}

### BLOCO ${hasLogos ? "C" : "B"} — Rodapé
Posição obrigatória: último elemento dentro da tabela interna (600px). Inserir como <tr> direto dentro da tabela de conteúdo.
\`\`\`html
${blockFooter}
\`\`\`

## ═══════════════════════════════════
## O QUE VOCÊ DEVE GERAR (restante)
## ═══════════════════════════════════

## Identidade Visual (SIGA RIGOROSAMENTE)

### Paleta de Cores
- Fundo externo e body: #0A1628 (navy escuro)
- Cards internos: background rgba(255,255,255,0.05), border 1px solid rgba(255,255,255,0.1)
- CTA principal: #E91E63 (rosa), texto #FFFFFF, font-weight 900
- CTA secundário: border 2px solid rgba(255,255,255,0.3), texto #FFFFFF
- Destaques (datas, locais): #00BCD4 (ciano)
- Urgência/badges: #FF7043 (laranja)
- Texto principal: #FFFFFF | Secundário: rgba(255,255,255,0.75) | Apoio: rgba(255,255,255,0.45)

### Logo da ExpoMultiMix (use exatamente no src do img)
https://static.wixstatic.com/media/88e022_551e4ef3cf61439fad4f84eca702a829~mv2.png/v1/crop/x_0,y_190,w_2084,h_1301/fill/w_536,h_340,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/EMM2024%20logo%20br_Prancheta%201.png

### Estrutura de tabelas OBRIGATÓRIA
\`\`\`
<body style="margin:0;padding:0;background-color:#0A1628;width:100%;">
  <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="background-color:#0A1628;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="600" style="max-width:600px;width:100%;">
        <!-- Header, conteúdo, BLOCO A, CTA, BLOCO B (se houver), BLOCO C -->
      </table>
    </td></tr>
  </table>
</body>
\`\`\`

### Responsividade
- Imagens: max-width:100%; height:auto; display:block
- Logo: max-width:180px
- CTAs: padding mínimo 14px 32px, font-size mínimo 15px
- Texto: font-size mínimo 14px, line-height 1.6
- Legível em 320px (iPhone SE) até 600px

## Estrutura do email (ordem exata)
1. Header: logo ExpoMultiMix + gradiente navy/ciano
2. Headline impactante (máx 10 palavras)
3. Saudação com {{VISITOR_NAME}}
4. Proposta de valor focada em LOJISTA
5. **BLOCO A** — detalhes da feira (copiar literalmente)
6. CTA principal em rosa (#E91E63)
7. Conteúdo adicional conforme o pedido (opcional)
${hasLogos ? "8. **BLOCO B** — logos dos expositores (copiar literalmente)\n9. **BLOCO C** — rodapé (copiar literalmente)" : "8. **BLOCO B** — rodapé (copiar literalmente)"}

## Requisitos Técnicos OBRIGATÓRIOS
1. HTML completo: <!DOCTYPE html>, <head> com charset UTF-8 e viewport meta, <body>
2. Todos os estilos inline — zero <style> ou CSS externo
3. Tabela externa width="100%" + tabela interna width="600" max-width:600px
4. background-color:#0A1628 no <body> e na tabela externa — nunca na interna
5. Logo da ExpoMultiMix no cabeçalho (URL exata acima), alt="ExpoMultiMix"
6. Blocos fixos inseridos literalmente nas posições corretas
7. Compatível com Gmail, Outlook 2016+, Apple Mail, mobile
8. Zero JavaScript, zero CSS externo, zero Google Fonts

## FORMATO DE RETORNO — SIGA EXATAMENTE

TITULO: [nome interno, ex: "Remarketing ${name} — ${monthYear}"]
ASSUNTO: [subject line — máx 60 caracteres, sem spam words]

\`\`\`html
<!DOCTYPE html>
<html lang="pt-BR">
...
</html>
\`\`\``;
};

// Limites reais por plano Brevo (a API retorna o restante como "total", ignoramos)
const BREVO_PLAN_LIMITS: Record<string, number> = {
  Starter: 10_000,
  Business: 100_000,
  Enterprise: 500_000,
};

// ─── Component ─────────────────────────────────────────────────────────────────

export const MarketingPage: React.FC = () => {
  const { sendMarketing, getCampaigns, getCampaignStats, getAccountStats } =
    useMarketingService();
  // Marketing usa TODAS as feiras (inclusive encerradas) para remarketing
  const { data: fairs, isLoading: loadingFairs } = useFairs();
  const [, , headerFairId] = useSearchParams();
  // headerFair = feira do cabeçalho = base para template e IA; selectedFairId = alvo de remarketing (opcional)
  const headerFair = fairs?.find((f) => f.id === headerFairId);
  const { data: fairImages = [] } = useFairImages(headerFairId);
  const logoUrls = fairImages.map((img) => img.url);

  const [selectedFairId, setSelectedFairId] = useState<string>(""); // remarketing target (optional)
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(
    "Você está convidado — ExpoMultiMix te espera!",
  );
  const [htmlContent, setHtmlContent] = useState("");

  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAudience, setPendingAudience] = useState<"all" | "absent">(
    "absent",
  );

  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiStep, setAiStep] = useState<1 | 2>(1);
  const [aiDescription, setAiDescription] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [promptCopied, setPromptCopied] = useState(false);

  const [mainTab, setMainTab] = useState<"create" | "history">("create");

  // Campaign history + account stats
  const [campaigns, setCampaigns] = useState<
    import("@/service/marketing.service").Campaign[]
  >([]);
  const [accountStats, setAccountStats] = useState<
    import("@/service/marketing.service").AccountStats | null
  >(null);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    null,
  );
  const [campaignStats, setCampaignStats] = useState<
    import("@/service/marketing.service").CampaignStats | null
  >(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [campaignData, statsData] = await Promise.all([
        getCampaigns(),
        getAccountStats(),
      ]);
      if (campaignData) setCampaigns(campaignData);
      if (statsData) setAccountStats(statsData);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // selectedFair = remarketing target (optional); headerFair = template base (always from URL)
  const selectedFair = fairs?.find((f) => f.id === selectedFairId);
  const effectiveTargetId = selectedFairId || headerFairId || "";

  const locationParts = headerFair
    ? [headerFair.city, headerFair.state].filter(Boolean).join(" / ")
    : null;

  const handleFairChange = (fairId: string) => {
    setSelectedFairId(fairId);
  };

  const handleGeneratePrompt = () => {
    if (!headerFair) {
      toast.error("Selecione uma feira no cabeçalho da página");
      return;
    }
    if (!aiDescription.trim()) {
      toast.error("Descreva o que você quer no email");
      return;
    }
    setGeneratedPrompt(generateAIPrompt(headerFair, aiDescription, logoUrls));
    setAiStep(2);
  };

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setPromptCopied(true);
    toast.success("Prompt copiado!");
    setTimeout(() => setPromptCopied(false), 2500);
  };

  const handleOpenAI = useCallback(
    async (url: string, name: string) => {
      await navigator.clipboard.writeText(generatedPrompt);
      window.open(url, "_blank", "noopener,noreferrer");
      toast.success(`Prompt copiado — cole no ${name}`, {
        description: "Use Ctrl+V (ou Cmd+V) para colar.",
      });
    },
    [generatedPrompt],
  );

  const openConfirmDialog = (audience: "all" | "absent") => {
    if (!headerFair) {
      toast.error("Selecione uma feira no cabeçalho da página");
      return;
    }
    if (!subject.trim() || !htmlContent.trim()) {
      toast.error("Preencha o assunto e o conteúdo HTML");
      return;
    }
    setPendingAudience(audience);
    setShowConfirmDialog(true);
  };

  const refreshCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
      const [campaignData, statsData] = await Promise.all([
        getCampaigns(),
        getAccountStats(),
      ]);
      if (campaignData) setCampaigns(campaignData);
      if (statsData) setAccountStats(statsData);
    } finally {
      setLoadingCampaigns(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCampaignStats = useCallback(
    async (campaignId: string) => {
      if (selectedCampaignId === campaignId) {
        setSelectedCampaignId(null);
        setCampaignStats(null);
        return;
      }
      setSelectedCampaignId(campaignId);
      setCampaignStats(null);
      setLoadingStats(true);
      try {
        const stats = await getCampaignStats(campaignId);
        if (stats) setCampaignStats(stats);
      } finally {
        setLoadingStats(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCampaignId],
  );

  const handleSend = useCallback(async () => {
    if (!headerFair) return;
    setShowConfirmDialog(false);
    setLoading(true);
    try {
      const campaignTitle =
        title.trim() ||
        `Campanha ${headerFair.name} — ${new Date().toLocaleDateString("pt-BR")}`;
      const res = await sendMarketing({
        title: campaignTitle,
        targetFairId: effectiveTargetId,
        templateFairId: headerFair.id,
        sendTo: pendingAudience,
        subject,
        htmlContent,
      });
      if (res?.success) {
        const targetFairName =
          fairs?.find((f) => f.id === effectiveTargetId)?.name ??
          effectiveTargetId;
        toast.success(
          `${res.totalQueued} email(s) enfileirados — ${pendingAudience === "all" ? "todos os inscritos" : "ausentes"} de "${targetFairName}"`,
          {
            duration: 6000,
            description: res.campaignId
              ? `ID: ${res.campaignId.slice(0, 8)}…`
              : `Status: ${res.status}`,
          },
        );
        const updated = await getCampaigns();
        if (updated) setCampaigns(updated);
        if (res.campaignId) setSelectedCampaignId(res.campaignId);
        setMainTab("history");
      } else {
        toast.error("Erro ao iniciar envio");
      }
    } catch (err) {
      toast.error("Erro ao processar envio");
      console.error(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    headerFair,
    effectiveTargetId,
    pendingAudience,
    title,
    subject,
    htmlContent,
    sendMarketing,
    fairs,
  ]);

  const confirmSend = () => handleSend();

  return (
    <div className="space-y-6 ">
      {/* ── Header + Tabs ── */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as "create" | "history")}>
        <div className="flex flex-col gap-4 mb-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-end md:shrink-0">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <Mail className="h-8 w-8 text-brand-pink" />
              EMAIL <span className="text-brand-cyan">MARKETING</span>
            </h1>
            <div className="h-1.5 w-24 bg-linear-to-r from-brand-pink to-brand-cyan rounded-full" />
          </div>
          <PageTabsList className="self-start md:self-auto">
            <PageTabsTrigger value="create">
              <Send className="h-4 w-4" />
              Enviar Campanha
            </PageTabsTrigger>
            <PageTabsTrigger value="history">
              <BarChart3 className="h-4 w-4" />
              Análise de Resultados
            </PageTabsTrigger>
          </PageTabsList>
          <div className="hidden md:block" />
        </div>
      </Tabs>

      {mainTab === "create" ? (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ── Right: Visualizador (70%) ── */}
          <div className="order-2 lg:order-2 flex-1 min-w-0 glass-card border-white/5 shadow-2xl rounded-[32px] p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-5">
              <Eye className="h-5 w-5 text-brand-cyan" />
              <h2 className="text-sm font-black text-white uppercase tracking-widest">
                Pré-visualização
              </h2>
            </div>

            {htmlContent ? (
              <>
                {subject && (
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/60 mb-3">
                    <span className="text-white/30 font-black uppercase tracking-widest text-xs mr-2">
                      Assunto:
                    </span>
                    {subject}
                  </div>
                )}
                <div className="border border-white/10 rounded-2xl overflow-hidden">
                  <iframe
                    key={htmlContent.slice(0, 40)}
                    srcDoc={htmlContent}
                    title="Pré-visualização do Email"
                    className="w-full"
                    style={{ height: "640px", border: "none" }}
                    sandbox="allow-same-origin"
                  />
                </div>
                <p className="text-white/25 text-xs text-center mt-3">
                  Visualização isolada — representa fielmente como o email
                  aparecerá nos clientes de email.
                </p>
              </>
            ) : (
              <div className="flex h-[500px] items-center justify-center border border-white/5 rounded-2xl">
                <div className="text-center">
                  <Eye className="h-10 w-10 text-white/10 mx-auto mb-3" />
                  <p className="text-white/25 text-sm">
                    Cole o HTML no painel ao lado para visualizar
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Left: Config (30%) ── */}
          <div className="order-1 lg:order-1 w-full lg:w-[30%] lg:min-w-[280px] space-y-4">
            {/* ── Card 1: Público-alvo ── */}
            <div className="glass-card border-white/5 shadow-2xl rounded-[32px] p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-brand-pink text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shrink-0">
                  1
                </span>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">
                  Público-alvo
                </h2>
              </div>

              {/* Header fair */}
              {headerFair ? (
                <div className="glass border-brand-cyan/20 rounded-2xl p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-brand-cyan/20 text-brand-cyan rounded-xl p-1.5 shrink-0">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-white text-xs truncate">
                          {headerFair.name}
                        </p>
                        <span className="text-[9px] font-black text-brand-cyan uppercase tracking-widest bg-brand-cyan/10 px-2 py-0.5 rounded-full shrink-0">
                          Cabeçalho
                        </span>
                      </div>
                      {(locationParts || headerFair.location) && (
                        <p className="text-white/50 text-[10px] flex items-center gap-1 mt-0.5">
                          <MapPin className="h-2.5 w-2.5" />
                          {locationParts ? `${locationParts} — ` : ""}
                          {headerFair.location}
                        </p>
                      )}
                      {(headerFair.startDate || headerFair.endDate) && (
                        <p className="text-white/50 text-[10px] flex items-center gap-1 mt-0.5">
                          <Calendar className="h-2.5 w-2.5" />
                          {fmt(headerFair.startDate)}
                          {headerFair.endDate &&
                            headerFair.endDate !== headerFair.startDate &&
                            ` a ${fmt(headerFair.endDate)}`}
                          {headerFair.startTime && ` · ${headerFair.startTime}`}
                          {headerFair.endTime && ` às ${headerFair.endTime}`}
                        </p>
                      )}
                    </div>
                    <Badge
                      className={
                        headerFair.isActive
                          ? "bg-brand-cyan/20 text-brand-cyan border-brand-cyan/20 text-[9px] font-black shrink-0"
                          : "bg-white/5 text-white/30 border-white/10 text-[9px] shrink-0"
                      }
                    >
                      {headerFair.isActive ? "Ativa" : "Encerrada"}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="glass border-white/5 rounded-2xl p-3 mb-4 flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-white/20" />
                  <p className="text-white/30 text-xs">
                    Selecione uma feira no cabeçalho para habilitar o envio.
                  </p>
                </div>
              )}

              {/* Remarketing */}
              <div className="space-y-2">
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">
                  Remarketing{" "}
                  <span className="text-white/20 normal-case font-medium">
                    (opcional)
                  </span>
                </p>
                <Select
                  value={selectedFairId}
                  onValueChange={handleFairChange}
                  disabled={loadingFairs}
                >
                  <SelectTrigger className="h-9 w-full bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all rounded-xl cursor-pointer text-xs">
                    <SelectValue
                      placeholder={
                        loadingFairs
                          ? "Carregando..."
                          : "Visitantes de outra feira..."
                      }
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
                {selectedFairId && (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-2.5 bg-brand-orange/10 border border-brand-orange/20 rounded-xl">
                      <AlertTriangle className="h-3 w-3 text-brand-orange shrink-0 mt-0.5" />
                      <p className="text-brand-orange text-[10px]">
                        <strong>Remarketing:</strong> template usa dados de{" "}
                        <strong>
                          {headerFair?.name ?? "feira do cabeçalho"}
                        </strong>
                        , mas o envio vai para visitantes de{" "}
                        <strong>{selectedFair?.name}</strong>.
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFairId("")}
                      className="text-xs text-white/30 hover:text-white/60 transition-colors underline cursor-pointer"
                    >
                      Limpar — usar a feira do cabeçalho
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Card 2: Conteúdo ── */}
            <div className="glass-card border-white/5 shadow-2xl rounded-[32px] p-5 space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-brand-pink text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shrink-0">
                  2
                </span>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">
                  Conteúdo
                </h2>
              </div>

              {/* Gerar com IA */}
              <button
                onClick={() => setShowAIDialog(true)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border border-brand-cyan/30 bg-brand-cyan/8 hover:bg-brand-cyan/15 hover:border-brand-cyan/50 transition-all group text-left"
              >
                <div className="bg-brand-cyan/20 rounded-xl p-2 shrink-0 group-hover:bg-brand-cyan/30 transition-colors">
                  <Sparkles className="h-5 w-5 text-brand-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-brand-cyan font-black uppercase tracking-widest text-xs">
                    Gerar com IA
                  </p>
                  <p className="text-white/40 text-[10px] mt-0.5 leading-snug">
                    Gera título, assunto e HTML com identidade ExpoMultiMix
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-brand-cyan/40 group-hover:text-brand-cyan/70 shrink-0 transition-colors" />
              </button>

              {/* Nome da campanha */}
              <div>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1.5">
                  Nome Interno da Campanha
                </p>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`Ex: Remarketing ${headerFair?.name ?? "Feira"} — ${new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-brand-cyan/30 text-xs"
                />
                <p className="text-white/20 text-[10px] mt-1">
                  Aparece no histórico — não enviado ao visitante.
                </p>
              </div>

              {/* Assunto */}
              <div>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1.5">
                  Assunto do Email
                </p>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: ExpoMultiMix te espera — venha hoje!"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-brand-pink/30 text-xs"
                />
              </div>

              {/* HTML */}
              <div>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1.5">
                  Conteúdo HTML
                </p>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  rows={12}
                  placeholder="Cole o HTML gerado pela IA aqui..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-3 text-white/80 text-xs font-mono leading-relaxed placeholder:text-white/20 focus:outline-none focus:border-brand-pink/50 focus:ring-4 focus:ring-brand-pink/10 transition-all resize-none overflow-x-auto"
                />
              </div>

              {/* Send buttons */}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                <Button
                  type="button"
                  disabled={loading || !headerFair}
                  onClick={() => openConfirmDialog("absent")}
                  className="w-full h-10 bg-white/10 border border-white/20 rounded-2xl text-white font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-40"
                >
                  <Users className="h-3.5 w-3.5 mr-2" />
                  Enviar para Ausentes
                </Button>
                <Button
                  type="button"
                  disabled={loading || !headerFair}
                  onClick={() => openConfirmDialog("all")}
                  className="w-full h-10 bg-brand-pink rounded-2xl text-white font-black uppercase tracking-widest text-xs hover:bg-brand-pink/90 transition-all shadow-xl shadow-brand-pink/20 active:scale-[0.98] cursor-pointer disabled:opacity-40"
                >
                  {loading ? (
                    <LogoLoading size={14} minimal className="mr-2" />
                  ) : (
                    <Send className="h-3.5 w-3.5 mr-2" />
                  )}
                  {loading ? "Enviando..." : "Enviar para Todos"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Campaign History ── */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-brand-cyan" />
              Histórico de Campanhas
            </h2>
            <button
              onClick={refreshCampaigns}
              disabled={loadingCampaigns}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white/50 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCcw
                className={`h-3.5 w-3.5 ${loadingCampaigns ? "animate-spin" : ""}`}
              />
              Atualizar
            </button>
          </div>

          {/* Account stats bar */}
          {accountStats && (
            <div className="glass-card rounded-2xl p-4 space-y-3">
              {/* Plan + quick metrics row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white/40 text-xs font-black uppercase tracking-widest">
                    Brevo {accountStats.plan.name}
                  </span>
                  <span className="text-white/20 text-[9px]">
                    · ciclo até{" "}
                    {new Date(accountStats.plan.periodEnd).toLocaleDateString(
                      "pt-BR",
                      { day: "2-digit", month: "short" },
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p
                      className={`text-base font-black leading-none ${accountStats.last30Days.deliveryRate >= 95 ? "text-green-400" : accountStats.last30Days.deliveryRate >= 85 ? "text-yellow-400" : "text-red-400"}`}
                    >
                      {accountStats.last30Days.deliveryRate.toFixed(1)}%
                    </p>
                    <p className="text-white/30 text-[8px] uppercase tracking-widest mt-0.5">
                      Entrega/30d
                    </p>
                  </div>
                  <div className="text-center">
                    <p
                      className={`text-base font-black leading-none ${accountStats.last30Days.openRate >= 30 ? "text-green-400" : accountStats.last30Days.openRate >= 15 ? "text-yellow-400" : "text-red-400"}`}
                    >
                      {accountStats.last30Days.openRate.toFixed(1)}%
                    </p>
                    <p className="text-white/30 text-[8px] uppercase tracking-widest mt-0.5">
                      Abertura/30d
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-black leading-none text-white/60">
                      {accountStats.last30Days.sent.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-white/30 text-[8px] uppercase tracking-widest mt-0.5">
                      Enviados/30d
                    </p>
                  </div>
                </div>
              </div>

              {/* Credits bar */}
              {(() => {
                const planTotal =
                  BREVO_PLAN_LIMITS[accountStats.plan.name] ??
                  accountStats.credits.total;
                const used = planTotal - accountStats.credits.remaining;
                const usedPct =
                  planTotal > 0 ? Math.round((used / planTotal) * 100) : 0;
                const remainPct = 100 - usedPct;
                return (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white/30 text-[9px] font-black uppercase tracking-widest">
                        Créditos de email
                      </span>
                      <span className="text-white/50 text-[10px] font-bold">
                        <span className="text-brand-cyan">
                          {accountStats.credits.remaining.toLocaleString(
                            "pt-BR",
                          )}
                        </span>
                        <span className="text-white/30"> disponíveis de </span>
                        <span className="text-white/60">
                          {planTotal.toLocaleString("pt-BR")}
                        </span>
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
                      {used > 0 && (
                        <div
                          className="h-full bg-brand-pink/50 transition-all duration-1000"
                          style={{ width: `${usedPct}%` }}
                        />
                      )}
                      <div
                        className="h-full bg-brand-cyan/70 transition-all duration-1000 rounded-r-full"
                        style={{ width: `${remainPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-white/20 text-[8px]">
                        {used.toLocaleString("pt-BR")} utilizados ({usedPct}%)
                      </span>
                      <span className="text-brand-cyan/50 text-[8px] font-bold">
                        {remainPct}% disponível
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Suppressed contacts + sending insights */}
              {(accountStats.suppressedContacts ||
                accountStats.sendingInsights) && (
                <div className="flex flex-wrap gap-3 pt-1 border-t border-white/5">
                  {accountStats.suppressedContacts && (
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                        Bloqueados
                      </span>
                      <span className="text-xs font-black text-brand-orange">
                        {accountStats.suppressedContacts.total.toLocaleString(
                          "pt-BR",
                        )}
                      </span>
                      <span className="text-[9px] text-white/20">
                        (bounce, spam, descad.)
                      </span>
                    </div>
                  )}
                  {accountStats.sendingInsights &&
                    accountStats.sendingInsights.bestDaysToSend.length > 0 && (
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                          Melhores dias
                        </span>
                        <div className="flex items-center gap-1">
                          {accountStats.sendingInsights.bestDaysToSend
                            .slice(0, 3)
                            .map((day, i) => (
                              <span
                                key={day}
                                className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${i === 0 ? "bg-brand-cyan/20 text-brand-cyan" : "bg-white/5 text-white/40"}`}
                              >
                                {day}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

          {/* Campaign list */}
          {campaigns.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center">
              <Inbox className="h-8 w-8 text-white/10 mx-auto mb-3" />
              <p className="text-white/25 text-sm">
                Nenhuma campanha enviada ainda
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {campaigns.map((campaign) => {
                const isSelected = selectedCampaignId === campaign.id;
                const targetFair = fairs?.find(
                  (f) => f.id === campaign.targetFairId,
                );
                const sentDate = new Date(campaign.sentAt).toLocaleDateString(
                  "pt-BR",
                  { day: "2-digit", month: "2-digit", year: "numeric" },
                );

                return (
                  <div
                    key={campaign.id}
                    className={`glass-card rounded-2xl overflow-hidden border transition-all ${isSelected ? "border-brand-cyan/30" : "border-white/5"}`}
                  >
                    <button
                      onClick={() => loadCampaignStats(campaign.id)}
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
                          {campaign.subject}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge
                          className={`text-[9px] font-black uppercase tracking-widest border-0 ${campaign.sendTo === "all" ? "bg-brand-cyan/10 text-brand-cyan" : "bg-brand-pink/10 text-brand-pink"}`}
                        >
                          {campaign.sendTo === "all" ? "Todos" : "Ausentes"}
                        </Badge>
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-white/60 font-bold">
                            {(
                              campaign.totalRecipients ?? campaign.totalQueued
                            ).toLocaleString("pt-BR")}{" "}
                            emails
                          </p>
                          <p className="text-[9px] text-white/30">
                            {campaign.suppressedByBrevo != null &&
                            campaign.suppressedByBrevo > 0
                              ? `${campaign.suppressedByBrevo} bloqueados · ${targetFair?.name ?? sentDate}`
                              : (targetFair?.name ?? sentDate)}
                          </p>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 text-white/30 transition-transform ${isSelected ? "rotate-90" : ""}`}
                        />
                      </div>
                    </button>

                    {isSelected && (
                      <div className="border-t border-white/5 p-4">
                        {loadingStats ? (
                          <div className="flex items-center justify-center py-6 gap-2">
                            <LogoLoading
                              size={18}
                              minimal
                              className="animate-pulse"
                            />
                            <span className="text-white/40 text-xs">
                              Carregando estatísticas...
                            </span>
                          </div>
                        ) : campaignStats ? (
                          <>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {/* Entrega */}
                              <div className="bg-white/5 rounded-xl p-3 text-center relative group/card">
                                <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                  <div className="relative group/tip">
                                    <Info className="h-3 w-3 text-white/30 hover:text-white/60 cursor-help transition-colors" />
                                    <div className="absolute bottom-full right-0 mb-2 w-56 p-3 bg-[#0A1628] border border-white/15 rounded-xl text-left text-[10px] text-white/60 leading-relaxed opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                                      <p className="font-black text-white/80 mb-1">
                                        Taxa de Entrega
                                      </p>
                                      <p>
                                        % dos emails que chegaram na caixa de
                                        entrada.{" "}
                                        <span className="text-brand-cyan">
                                          Ex: 96% = 960 de 1.000 entregues.
                                        </span>
                                      </p>
                                      <p className="mt-1 text-white/40">
                                        ≥95% ótimo · 85–95% ok · &lt;85%
                                        investigar lista
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <p
                                  className={`text-xl font-black ${campaignStats.delivery.deliveryRate >= 95 ? "text-green-400" : campaignStats.delivery.deliveryRate >= 85 ? "text-yellow-400" : "text-red-400"}`}
                                >
                                  {campaignStats.delivery.deliveryRate.toFixed(
                                    1,
                                  )}
                                  %
                                </p>
                                <p className="text-white/30 text-[9px] uppercase tracking-widest mt-0.5">
                                  Taxa de Entrega
                                </p>
                                <p className="text-white/40 text-xs mt-1">
                                  {campaignStats.delivery.delivered}/
                                  {campaignStats.delivery.queued}
                                </p>
                              </div>

                              {/* Abertura */}
                              <div className="bg-white/5 rounded-xl p-3 text-center relative group/card">
                                <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                  <div className="relative group/tip">
                                    <Info className="h-3 w-3 text-white/30 hover:text-white/60 cursor-help transition-colors" />
                                    <div className="absolute bottom-full right-0 mb-2 w-56 p-3 bg-[#0A1628] border border-white/15 rounded-xl text-left text-[10px] text-white/60 leading-relaxed opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                                      <p className="font-black text-white/80 mb-1">
                                        Open Rate
                                      </p>
                                      <p>
                                        % de destinatários únicos que abriram o
                                        email.{" "}
                                        <span className="text-brand-cyan">
                                          Ex: 30% = 300 pessoas de 1.000
                                          entregues abriram.
                                        </span>
                                      </p>
                                      <p className="mt-1 text-white/40">
                                        ≥30% excelente · 15–30% bom · &lt;15%
                                        revisar subject
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <TrendingUp
                                  className={`h-4 w-4 mx-auto mb-1 ${campaignStats.engagement.openRate >= 30 ? "text-green-400" : campaignStats.engagement.openRate >= 15 ? "text-yellow-400" : "text-red-400"}`}
                                />
                                <p
                                  className={`text-xl font-black ${campaignStats.engagement.openRate >= 30 ? "text-green-400" : campaignStats.engagement.openRate >= 15 ? "text-yellow-400" : "text-red-400"}`}
                                >
                                  {campaignStats.engagement.openRate.toFixed(1)}
                                  %
                                </p>
                                <p className="text-white/30 text-[9px] uppercase tracking-widest mt-0.5">
                                  Abertura
                                </p>
                                <p className="text-white/40 text-xs mt-1">
                                  {campaignStats.engagement.uniqueOpens} únicos
                                </p>
                              </div>

                              {/* Cliques */}
                              <div className="bg-white/5 rounded-xl p-3 text-center relative group/card">
                                <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                  <div className="relative group/tip">
                                    <Info className="h-3 w-3 text-white/30 hover:text-white/60 cursor-help transition-colors" />
                                    <div className="absolute bottom-full right-0 mb-2 w-56 p-3 bg-[#0A1628] border border-white/15 rounded-xl text-left text-[10px] text-white/60 leading-relaxed opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                                      <p className="font-black text-white/80 mb-1">
                                        Click Rate
                                      </p>
                                      <p>
                                        % de destinatários que clicaram em algum
                                        link.{" "}
                                        <span className="text-brand-cyan">
                                          Ex: 5% = 50 pessoas de 1.000 entregues
                                          clicaram no CTA.
                                        </span>
                                      </p>
                                      <p className="mt-1 text-white/40">
                                        ≥5% excelente · 2–5% bom · &lt;2%
                                        revisar CTA
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <MousePointerClick
                                  className={`h-4 w-4 mx-auto mb-1 ${campaignStats.engagement.clickRate >= 5 ? "text-green-400" : campaignStats.engagement.clickRate >= 2 ? "text-yellow-400" : "text-red-400"}`}
                                />
                                <p
                                  className={`text-xl font-black ${campaignStats.engagement.clickRate >= 5 ? "text-green-400" : campaignStats.engagement.clickRate >= 2 ? "text-yellow-400" : "text-red-400"}`}
                                >
                                  {campaignStats.engagement.clickRate.toFixed(
                                    1,
                                  )}
                                  %
                                </p>
                                <p className="text-white/30 text-[9px] uppercase tracking-widest mt-0.5">
                                  Cliques
                                </p>
                                <p className="text-white/40 text-xs mt-1">
                                  {campaignStats.engagement.uniqueClicks} únicos
                                </p>
                              </div>

                              {/* Bounces + Spam */}
                              <div className="bg-white/5 rounded-xl p-3 text-center relative group/card">
                                <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                  <div className="relative group/tip">
                                    <Info className="h-3 w-3 text-white/30 hover:text-white/60 cursor-help transition-colors" />
                                    <div className="absolute bottom-full right-0 mb-2 w-60 p-3 bg-[#0A1628] border border-white/15 rounded-xl text-left text-[10px] text-white/60 leading-relaxed opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                                      <p className="font-black text-white/80 mb-1">
                                        Bounces + Spam
                                      </p>
                                      <p>
                                        <span className="text-brand-orange">
                                          Hard bounce:
                                        </span>{" "}
                                        endereço inválido permanentemente (ex:
                                        email digitado errado).
                                      </p>
                                      <p className="mt-1">
                                        <span className="text-brand-orange">
                                          Spam:
                                        </span>{" "}
                                        destinatário marcou como indesejado —
                                        prejudica a reputação do remetente.
                                      </p>
                                      <p className="mt-1 text-white/40">
                                        Ideal: zero. Acima de 2% pode bloquear
                                        envios futuros.
                                      </p>
                                      <p className="mt-1 text-white/30">
                                        Descadastr.:{" "}
                                        {campaignStats.engagement.unsubscribed}{" "}
                                        pessoa(s) cancelaram
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <p
                                  className={`text-xl font-black ${campaignStats.delivery.hardBounces + campaignStats.delivery.spam === 0 ? "text-green-400" : "text-red-400"}`}
                                >
                                  {campaignStats.delivery.hardBounces +
                                    campaignStats.delivery.spam}
                                </p>
                                <p className="text-white/30 text-[9px] uppercase tracking-widest mt-0.5">
                                  Bounces + Spam
                                </p>
                                <p className="text-white/40 text-xs mt-1">
                                  {campaignStats.engagement.unsubscribed}{" "}
                                  descad.
                                </p>
                              </div>
                            </div>

                            {/* Suppressed breakdown */}
                            {campaignStats.campaign.suppressedByBrevo != null &&
                              campaignStats.campaign.suppressedByBrevo > 0 && (
                                <div className="mt-3 flex items-center gap-2 px-1">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-white/25">
                                    Total da lista
                                  </span>
                                  <span className="text-xs font-black text-white/50">
                                    {(
                                      campaignStats.campaign.totalRecipients ??
                                      campaignStats.campaign.totalQueued
                                    ).toLocaleString("pt-BR")}
                                  </span>
                                  <span className="text-white/20 text-[9px]">
                                    ·
                                  </span>
                                  <span className="text-[9px] text-white/25">
                                    {campaignStats.campaign.totalQueued.toLocaleString(
                                      "pt-BR",
                                    )}{" "}
                                    enfileirados
                                  </span>
                                  <span className="text-white/20 text-[9px]">
                                    ·
                                  </span>
                                  <span className="text-[9px] text-brand-orange/70">
                                    {campaignStats.campaign.suppressedByBrevo}{" "}
                                    bloqueados pela Brevo
                                  </span>
                                </div>
                              )}
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      <Dialog
        open={showAIDialog}
        onOpenChange={(open) => {
          setShowAIDialog(open);
          if (!open) {
            setAiStep(1);
            setAiDescription("");
            setGeneratedPrompt("");
            setPromptCopied(false);
          }
        }}
      >
        <DialogContent className="max-w-3xl bg-brand-blue/97 border-white/10 text-white p-0 overflow-hidden">
          {/* ── Step indicator ── */}
          <div className="flex items-center gap-0 border-b border-white/5">
            {([1, 2] as const).map((s) => (
              <div
                key={s}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                  aiStep === s
                    ? "text-brand-cyan border-b-2 border-brand-cyan -mb-px"
                    : aiStep > s
                      ? "text-white/30"
                      : "text-white/20"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                    aiStep > s
                      ? "bg-brand-cyan/20 text-brand-cyan"
                      : aiStep === s
                        ? "bg-brand-cyan text-brand-blue"
                        : "bg-white/10 text-white/30"
                  }`}
                >
                  {aiStep > s ? <Check className="h-2.5 w-2.5" /> : s}
                </span>
                {s === 1 ? "Descrever" : "Abrir na IA"}
              </div>
            ))}
          </div>

          <div className="p-6">
            {/* ════ STEP 1 ════ */}
            {aiStep === 1 && (
              <div className="space-y-5">
                <DialogHeader className="space-y-1 p-0">
                  <DialogTitle className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-base">
                    <Sparkles className="h-5 w-5 text-brand-cyan" />
                    Descreva o email
                  </DialogTitle>
                  <DialogDescription className="text-white/35 text-sm">
                    Diga o que você quer — a IA gera título, assunto e HTML
                    completo com identidade visual da ExpoMultiMix.
                  </DialogDescription>
                </DialogHeader>

                {/* Fair info */}
                {!headerFair ? (
                  <div className="flex items-center gap-2 p-3 bg-brand-orange/10 border border-brand-orange/20 rounded-xl text-sm text-brand-orange">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Selecione uma feira no cabeçalho para continuar.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/8 rounded-xl">
                      <div className="bg-brand-cyan/15 rounded-lg p-1.5 shrink-0">
                        <Mail className="h-3.5 w-3.5 text-brand-cyan" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-black text-xs truncate">
                          {headerFair.name}
                        </p>
                        {locationParts && (
                          <p className="text-white/40 text-[10px] truncate">
                            {locationParts}
                          </p>
                        )}
                      </div>
                      <span className="text-[9px] font-black text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded-full shrink-0">
                        base do email
                      </span>
                    </div>

                    {/* Logos status */}
                    {logoUrls.length > 0 ? (
                      <div className="flex items-center gap-2 p-2.5 bg-green-500/8 border border-green-500/20 rounded-xl">
                        <Check className="h-3.5 w-3.5 text-green-400 shrink-0" />
                        <p className="text-green-400 text-[10px] font-black uppercase tracking-widest">
                          {logoUrls.length} logo
                          {logoUrls.length !== 1 ? "s" : ""} de expositores
                          incluídas no prompt
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 p-2.5 bg-brand-orange/8 border border-brand-orange/20 rounded-xl">
                        <AlertTriangle className="h-3.5 w-3.5 text-brand-orange shrink-0 mt-0.5" />
                        <p className="text-brand-orange text-[10px] leading-relaxed">
                          <strong>
                            Nenhuma logo encontrada para esta feira.
                          </strong>{" "}
                          Cadastre as logos dos expositores em{" "}
                          <strong>Clientes → Galeria</strong> antes de gerar o
                          email para que elas apareçam automaticamente.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">
                    O que você quer no email?
                  </p>
                  <textarea
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                        handleGeneratePrompt();
                    }}
                    placeholder="Ex: Lembrete de que a feira começa amanhã, tom urgente e empolgante, CTA para confirmar presença..."
                    rows={5}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/10 focus:outline-none focus:border-brand-cyan/50 focus:ring-4 focus:ring-brand-cyan/10 transition-all resize-none"
                  />
                  <p className="text-white/20 text-[10px] mt-1.5">
                    Dica:{" "}
                    <kbd className="bg-white/8 px-1 rounded font-mono">
                      Ctrl+Enter
                    </kbd>{" "}
                    para gerar
                  </p>
                </div>

                <Button
                  onClick={handleGeneratePrompt}
                  disabled={!headerFair || !aiDescription.trim()}
                  className="w-full h-12 bg-brand-cyan text-brand-blue font-black uppercase tracking-widest rounded-2xl hover:bg-brand-cyan/90 transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Prompt
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* ════ STEP 2 ════ */}
            {aiStep === 2 && (
              <div className="space-y-5">
                <DialogHeader className="space-y-1 p-0">
                  <DialogTitle className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-base">
                    <Check className="h-5 w-5 text-brand-cyan" />
                    Prompt pronto — abra uma IA
                  </DialogTitle>
                  <DialogDescription className="text-white/35 text-sm">
                    Clique em qualquer assistente abaixo. O prompt é copiado
                    automaticamente — cole com{" "}
                    <kbd className="bg-white/10 px-1 rounded font-mono text-white/50">
                      Ctrl+V
                    </kbd>
                    .
                  </DialogDescription>
                </DialogHeader>

                {/* Copy bar */}
                <div className="flex items-center gap-3 p-3 bg-brand-cyan/8 border border-brand-cyan/20 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-[10px] font-mono truncate">
                      {generatedPrompt.slice(0, 80)}…
                    </p>
                  </div>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-cyan/15 hover:bg-brand-cyan/25 border border-brand-cyan/30 rounded-lg text-[10px] font-black uppercase tracking-widest text-brand-cyan transition-all shrink-0"
                  >
                    {promptCopied ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>

                {/* AI grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AI_SERVICES.map((ai) => (
                    <button
                      key={ai.name}
                      onClick={() => handleOpenAI(ai.url, ai.name)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.97]"
                      style={{
                        color: ai.color,
                        borderColor: `${ai.color}35`,
                        backgroundColor: `${ai.color}10`,
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.backgroundColor = `${ai.color}20`;
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.borderColor = `${ai.color}60`;
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.backgroundColor = `${ai.color}10`;
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.borderColor = `${ai.color}35`;
                      }}
                    >
                      <span className="shrink-0">{ai.icon}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-black text-xs">
                          {ai.name}
                        </span>
                        <span className="block text-[9px] opacity-40 truncate">
                          {ai.shortUrl}
                        </span>
                      </span>
                      <ExternalLink className="h-3 w-3 opacity-30 shrink-0" />
                    </button>
                  ))}
                </div>

                {/* Footer actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setAiStep(1);
                      setGeneratedPrompt("");
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
                  >
                    <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                    Refazer
                  </button>
                  <button
                    onClick={() => {
                      setShowAIDialog(false);
                      setAiStep(1);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-pink/10 hover:bg-brand-pink/20 border border-brand-pink/30 rounded-xl text-xs font-black uppercase tracking-widest text-brand-pink transition-all"
                  >
                    Fechar — cole o HTML no campo de texto
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
                    <span className="text-white font-bold">
                      {headerFair?.name ?? "—"}
                    </span>
                  </p>
                  {locationParts && (
                    <p>
                      <span className="text-white/30 font-black uppercase tracking-widest text-xs">
                        Local:{" "}
                      </span>
                      <span className="text-white/70">{locationParts}</span>
                    </p>
                  )}
                  <p>
                    <span className="text-white/30 font-black uppercase tracking-widest text-xs">
                      Assunto:{" "}
                    </span>
                    <span className="text-white/70">{subject || "—"}</span>
                  </p>
                  <p>
                    <span className="text-white/30 font-black uppercase tracking-widest text-xs">
                      Destinatários:{" "}
                    </span>
                    <span className="text-brand-cyan font-bold">
                      {pendingAudience === "all"
                        ? "Todos os visitantes inscritos"
                        : "Visitantes que não fizeram check-in"}
                    </span>
                  </p>
                </div>
                <div className="flex items-start gap-2 p-3 bg-brand-orange/10 border border-brand-orange/20 rounded-xl">
                  <AlertTriangle className="h-4 w-4 text-brand-orange shrink-0 mt-0.5" />
                  <p className="text-brand-orange text-xs">
                    Esta ação envia emails reais. Confirme que o conteúdo e a
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
              onClick={confirmSend}
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
