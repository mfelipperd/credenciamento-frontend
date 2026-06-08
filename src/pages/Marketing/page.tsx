import React, { useState, useCallback, useEffect, useRef } from "react";
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
import { useFairImages, useUploadFairImages, useDeleteFairImage } from "@/hooks/useFinance";
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
  Code,
  Clock,
  Star,
  Handshake,
  Heart,
  BarChart3,
  RefreshCcw,
  TrendingUp,
  MousePointerClick,
  Inbox,
  ExternalLink,
  Clipboard,
  Info,
  X,
  Edit,
  Upload,
  ImageIcon,
  Trash2,
} from "lucide-react";
import { LogoLoading } from "@/components/LogoLoading";
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
  const dateRange =
    !startDate ? "" : startDate === endDate || !endDate
      ? startDate
      : `${startDate} a ${endDate}`;
  const time =
    fair?.startTime && fair?.endTime
      ? `${fair.startTime} às ${fair.endTime}`
      : fair?.startTime ?? "";
  const mapsUrl = fair?.googleMapsUrl ?? "#";
  return { name, cityState, location, fullLocation, dateRange, time, mapsUrl };
};

// ─── Email templates ───────────────────────────────────────────────────────────

const LOGO =
  "https://static.wixstatic.com/media/88e022_551e4ef3cf61439fad4f84eca702a829~mv2.png/v1/crop/x_0,y_190,w_2084,h_1301/fill/w_536,h_340,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/EMM2024%20logo%20br_Prancheta%201.png";

const logoGridHtml = (logoUrls: string[], labelColor = "#9CA3AF"): string => {
  if (!logoUrls || logoUrls.length === 0) return "";
  const perRow = 5;
  const rows: string[][] = [];
  for (let i = 0; i < logoUrls.length; i += perRow) {
    rows.push(logoUrls.slice(i, i + perRow));
  }
  const rowsHtml = rows
    .map((row) => {
      const w = Math.floor(100 / row.length);
      const cells = row
        .map(
          (url) =>
            `<td width="${w}%" style="text-align:center;padding:6px 8px;vertical-align:middle;">` +
            `<img src="${url}" alt="Expositor" style="max-width:90px;max-height:60px;height:auto;display:block;margin:0 auto;"></td>`
        )
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return (
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">` +
    `<tr><td>` +
    `<p style="margin:0 0 12px;color:${labelColor};font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-align:center;">Expositores Participantes</p>` +
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rowsHtml}</table>` +
    `</td></tr></table>`
  );
};

const tplSaudade = (fair?: Fair, logoUrls: string[] = []): string => {
  const { name, fullLocation, dateRange, time } = fairInfo(fair);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${name}</title></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f2f5;">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#1E3A8A 0%,#2563EB 100%);padding:36px 40px;text-align:center;">
        <img src="${LOGO}" alt="${name}" style="max-width:160px;height:auto;display:block;margin:0 auto 18px;">
        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.3px;">${name}</h1>
        ${dateRange ? `<p style="margin:6px 0 0;color:#93C5FD;font-size:13px;font-weight:600;">📅 ${dateRange}${time ? ` · ${time}` : ""}</p>` : ""}
        ${fullLocation ? `<p style="margin:4px 0 0;color:#BFDBFE;font-size:12px;">📍 ${fullLocation}</p>` : ""}
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:40px 40px 32px;">
        <h2 style="margin:0 0 12px;color:#1E3A8A;font-size:22px;font-weight:800;">Olá, {{VISITOR_NAME}}! 💙</h2>
        <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.7;">
          Você se inscreveu na <strong>${name}</strong> mas ainda não nos visitou. O evento ainda está acontecendo e
          separamos experiências incríveis para você.
        </p>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
          <tr><td style="background:#EFF6FF;border-left:4px solid #2563EB;padding:18px 20px;border-radius:0 8px 8px 0;">
            <p style="margin:0 0 10px;color:#1E3A8A;font-size:14px;font-weight:700;">O que espera por você:</p>
            <p style="margin:0 0 5px;color:#374151;font-size:14px;">🤝 Networking com centenas de empresários</p>
            <p style="margin:0 0 5px;color:#374151;font-size:14px;">💼 Oportunidades únicas de negócios</p>
            <p style="margin:0 0 5px;color:#374151;font-size:14px;">🎤 Palestras e conteúdo exclusivo</p>
            <p style="margin:0;color:#374151;font-size:14px;">🎁 Brindes e sorteios especiais</p>
          </td></tr>
        </table>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:32px;">
          <tr><td align="center">
            <a href="#" style="display:inline-block;background:#2563EB;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px;">
              Quero visitar agora →
            </a>
          </td></tr>
        </table>

        ${logoGridHtml(logoUrls)}
        <p style="margin:0;color:#9CA3AF;font-size:12px;text-align:center;border-top:1px solid #F3F4F6;padding-top:20px;">
          Equipe ${name} · gerencia@expomultimix.com.br
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
};

const tplUrgencia = (fair?: Fair, logoUrls: string[] = []): string => {
  const { name, fullLocation, dateRange, time } = fairInfo(fair);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${name} — Últimas Horas!</title></head>
<body style="margin:0;padding:0;background:#1a0a00;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#1a0a00;">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(249,115,22,0.3);">

      <!-- Urgency Banner -->
      <tr><td style="background:#DC2626;padding:10px 20px;text-align:center;">
        <p style="margin:0;color:#ffffff;font-size:13px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">⚠️ Atenção — Tempo Limitado</p>
      </td></tr>

      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#EA580C 0%,#F97316 60%,#FBBF24 100%);padding:36px 40px;text-align:center;">
        <img src="${LOGO}" alt="${name}" style="max-width:150px;height:auto;display:block;margin:0 auto 16px;filter:brightness(0) invert(1);">
        <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:900;text-transform:uppercase;letter-spacing:-0.5px;">⏰ Últimas Horas!</h1>
        <p style="margin:8px 0 0;color:#FEF3C7;font-size:18px;font-weight:700;">${name}</p>
        ${dateRange ? `<p style="margin:6px 0 0;color:#FDE68A;font-size:13px;">📅 ${dateRange}${time ? ` · ${time}` : ""}</p>` : ""}
        ${fullLocation ? `<p style="margin:4px 0 0;color:#FDE68A;font-size:12px;">📍 ${fullLocation}</p>` : ""}
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:40px 40px 32px;">
        <h2 style="margin:0 0 16px;color:#DC2626;font-size:20px;font-weight:800;text-align:center;">
          {{VISITOR_NAME}}, não perca essa oportunidade!
        </h2>
        <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;text-align:center;">
          O evento está <strong>quase no fim</strong> e você ainda não apareceu!
          Centenas de empresários e oportunidades de negócio estão te esperando agora.
        </p>

        <!-- Stats -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
          <tr>
            <td width="33%" style="text-align:center;padding:16px 8px;background:#FEF3C7;border-radius:8px;margin:4px;">
              <p style="margin:0;color:#D97706;font-size:24px;font-weight:900;">500+</p>
              <p style="margin:4px 0 0;color:#92400E;font-size:11px;font-weight:700;text-transform:uppercase;">Empresários</p>
            </td>
            <td width="4%"></td>
            <td width="33%" style="text-align:center;padding:16px 8px;background:#FEE2E2;border-radius:8px;">
              <p style="margin:0;color:#DC2626;font-size:24px;font-weight:900;">200+</p>
              <p style="margin:4px 0 0;color:#991B1B;font-size:11px;font-weight:700;text-transform:uppercase;">Empresas</p>
            </td>
            <td width="4%"></td>
            <td width="33%" style="text-align:center;padding:16px 8px;background:#D1FAE5;border-radius:8px;">
              <p style="margin:0;color:#059669;font-size:24px;font-weight:900;">R$ M</p>
              <p style="margin:4px 0 0;color:#065F46;font-size:11px;font-weight:700;text-transform:uppercase;">Em negócios</p>
            </td>
          </tr>
        </table>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:32px;">
          <tr><td align="center">
            <a href="#" style="display:inline-block;background:#DC2626;color:#ffffff;font-size:17px;font-weight:900;text-decoration:none;padding:16px 48px;border-radius:8px;text-transform:uppercase;letter-spacing:1px;">
              🔥 Ir Agora!
            </a>
          </td></tr>
        </table>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
          <tr><td style="background:#FFF7ED;border-left:4px solid #F97316;padding:14px 18px;border-radius:0 8px 8px 0;">
            <p style="margin:0;color:#C2410C;font-size:13px;font-weight:700;">
              ⏰ Lembre-se: após o evento encerrar, você não terá mais acesso a essas oportunidades.
            </p>
          </td></tr>
        </table>

        ${logoGridHtml(logoUrls)}
        <p style="margin:0;color:#9CA3AF;font-size:12px;text-align:center;border-top:1px solid #F3F4F6;padding-top:20px;">
          Equipe ${name} · gerencia@expomultimix.com.br
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
};

const tplPalestras = (fair?: Fair, logoUrls: string[] = []): string => {
  const { name, fullLocation, dateRange, time } = fairInfo(fair);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${name} — Palestras & Conteúdo</title></head>
<body style="margin:0;padding:0;background:#0F172A;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0F172A;">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(99,102,241,0.25);">

      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#4338CA 100%);padding:36px 40px;text-align:center;">
        <img src="${LOGO}" alt="${name}" style="max-width:150px;height:auto;display:block;margin:0 auto 16px;filter:brightness(0) invert(1);">
        <p style="margin:0 0 8px;color:#A5B4FC;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Programação Exclusiva</p>
        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">🎤 Palestras & Conteúdo</h1>
        <p style="margin:8px 0 0;color:#C7D2FE;font-size:14px;font-weight:600;">${name}</p>
        ${dateRange ? `<p style="margin:6px 0 0;color:#A5B4FC;font-size:13px;">📅 ${dateRange}${time ? ` · ${time}` : ""}</p>` : ""}
        ${fullLocation ? `<p style="margin:4px 0 0;color:#818CF8;font-size:12px;">📍 ${fullLocation}</p>` : ""}
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:40px 40px 32px;">
        <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
          <strong>{{VISITOR_NAME}}</strong>, você se inscreveu na <strong>${name}</strong> e não pode perder a programação de
          <strong>palestras e workshops</strong> que preparamos com os melhores especialistas do setor.
        </p>

        <!-- Talk items -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:8px;">
          <tr><td style="border-bottom:1px solid #F3F4F6;padding:14px 0;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td width="48" style="vertical-align:top;">
                  <div style="background:#EEF2FF;border-radius:8px;width:40px;height:40px;text-align:center;line-height:40px;font-size:18px;">🎯</div>
                </td>
                <td style="padding-left:12px;vertical-align:top;">
                  <p style="margin:0;color:#1E1B4B;font-size:14px;font-weight:700;">Tendências do Mercado 2025</p>
                  <p style="margin:3px 0 0;color:#6B7280;font-size:12px;">Estratégias para escalar seu negócio no novo cenário econômico</p>
                </td>
              </tr>
            </table>
          </td></tr>
          <tr><td style="border-bottom:1px solid #F3F4F6;padding:14px 0;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td width="48" style="vertical-align:top;">
                  <div style="background:#EEF2FF;border-radius:8px;width:40px;height:40px;text-align:center;line-height:40px;font-size:18px;">📊</div>
                </td>
                <td style="padding-left:12px;vertical-align:top;">
                  <p style="margin:0;color:#1E1B4B;font-size:14px;font-weight:700;">Marketing Digital para PMEs</p>
                  <p style="margin:3px 0 0;color:#6B7280;font-size:12px;">Como usar redes sociais e anúncios para aumentar vendas</p>
                </td>
              </tr>
            </table>
          </td></tr>
          <tr><td style="padding:14px 0;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td width="48" style="vertical-align:top;">
                  <div style="background:#EEF2FF;border-radius:8px;width:40px;height:40px;text-align:center;line-height:40px;font-size:18px;">🤖</div>
                </td>
                <td style="padding-left:12px;vertical-align:top;">
                  <p style="margin:0;color:#1E1B4B;font-size:14px;font-weight:700;">IA nos Negócios</p>
                  <p style="margin:3px 0 0;color:#6B7280;font-size:12px;">Ferramentas de inteligência artificial que já estão transformando empresas</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:28px 0;">
          <tr><td style="background:#EEF2FF;border-left:4px solid #4338CA;padding:16px 20px;border-radius:0 8px 8px 0;">
            <p style="margin:0;color:#3730A3;font-size:14px;font-weight:700;">
              📅 Programação completa disponível no evento — não pague cursos caros, venha aprender com especialistas!
            </p>
          </td></tr>
        </table>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:32px;">
          <tr><td align="center">
            <a href="#" style="display:inline-block;background:#4338CA;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px;">
              🎤 Quero assistir às palestras →
            </a>
          </td></tr>
        </table>

        ${logoGridHtml(logoUrls)}
        <p style="margin:0;color:#9CA3AF;font-size:12px;text-align:center;border-top:1px solid #F3F4F6;padding-top:20px;">
          Equipe ${name} · gerencia@expomultimix.com.br
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
};

const tplVip = (fair?: Fair, logoUrls: string[] = []): string => {
  const { name, fullLocation, dateRange, time, mapsUrl } = fairInfo(fair);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${name} — Convite VIP</title></head>
<body style="margin:0;padding:0;background:#1C1008;font-family:Georgia,serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#1C1008;">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#1C1008;border-radius:12px;overflow:hidden;border:1px solid #B45309;box-shadow:0 8px 40px rgba(180,83,9,0.4);">

      <!-- Gold top border -->
      <tr><td style="background:linear-gradient(90deg,#92400E,#D97706,#FCD34D,#D97706,#92400E);height:4px;"></td></tr>

      <!-- Header -->
      <tr><td style="padding:40px 40px 28px;text-align:center;">
        <p style="margin:0 0 20px;color:#D97706;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;">— Convite Exclusivo —</p>
        <img src="${LOGO}" alt="${name}" style="max-width:150px;height:auto;display:block;margin:0 auto 20px;filter:brightness(0) saturate(100%) invert(65%) sepia(100%) saturate(400%) hue-rotate(5deg);">
        <h1 style="margin:0;color:#FCD34D;font-size:26px;font-weight:700;letter-spacing:1px;">Acesso VIP</h1>
        <p style="margin:10px 0 0;color:#D4B483;font-size:15px;">${name}</p>
        ${dateRange ? `<p style="margin:8px 0 0;color:#B45309;font-size:13px;">📅 ${dateRange}${time ? ` · ${time}` : ""}</p>` : ""}
        ${fullLocation ? `<p style="margin:4px 0 0;color:#92400E;font-size:12px;">📍 ${fullLocation}</p>` : ""}
      </td></tr>

      <!-- Divider -->
      <tr><td style="padding:0 40px;">
        <div style="height:1px;background:linear-gradient(90deg,transparent,#B45309,transparent);"></div>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:32px 40px 28px;">
        <p style="margin:0 0 20px;color:#E7D5B3;font-size:15px;line-height:1.8;text-align:center;">
          <strong style="color:#FCD34D;">{{VISITOR_NAME}}</strong>, você foi <strong style="color:#FCD34D;">selecionado especialmente</strong> para ter acesso
          privilegiado ao melhor que a <strong style="color:#FCD34D;">${name}</strong> tem a oferecer.
        </p>

        <!-- VIP benefits -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
          <tr><td style="background:rgba(180,83,9,0.15);border:1px solid #B45309;border-radius:8px;padding:20px;">
            <p style="margin:0 0 12px;color:#FCD34D;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Seus privilégios VIP:</p>
            <p style="margin:0 0 8px;color:#D4B483;font-size:14px;">✦ Acesso antecipado ao espaço de networking</p>
            <p style="margin:0 0 8px;color:#D4B483;font-size:14px;">✦ Encontro exclusivo com palestrantes</p>
            <p style="margin:0 0 8px;color:#D4B483;font-size:14px;">✦ Área VIP com coffee premium</p>
            <p style="margin:0;color:#D4B483;font-size:14px;">✦ Agenda de reuniões prioritária</p>
          </td></tr>
        </table>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
          <tr><td align="center">
            <a href="${mapsUrl !== "#" ? mapsUrl : "#"}" style="display:inline-block;background:linear-gradient(135deg,#D97706,#FCD34D);color:#1C1008;font-size:16px;font-weight:900;text-decoration:none;padding:15px 44px;border-radius:8px;letter-spacing:0.5px;font-family:Arial,sans-serif;">
              ✦ Confirmar Presença VIP ✦
            </a>
          </td></tr>
        </table>

        ${logoGridHtml(logoUrls, "#B45309")}
        <p style="margin:0;color:#92400E;font-size:11px;text-align:center;letter-spacing:1px;">
          CONVITE INTRANSFERÍVEL · ${name.toUpperCase()}
        </p>
      </td></tr>

      <!-- Gold bottom border -->
      <tr><td style="background:linear-gradient(90deg,#92400E,#D97706,#FCD34D,#D97706,#92400E);height:4px;"></td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
};

const tplNetworking = (fair?: Fair, logoUrls: string[] = []): string => {
  const { name, fullLocation, dateRange, time } = fairInfo(fair);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${name} — Networking</title></head>
<body style="margin:0;padding:0;background:#F0FDF4;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F0FDF4;">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(16,185,129,0.15);">

      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#065F46 0%,#059669 60%,#10B981 100%);padding:36px 40px;text-align:center;">
        <img src="${LOGO}" alt="${name}" style="max-width:150px;height:auto;display:block;margin:0 auto 16px;filter:brightness(0) invert(1);">
        <p style="margin:0 0 8px;color:#6EE7B7;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Oportunidade de Negócios</p>
        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">🤝 Faça Negócios em ${fairInfo(fair).cityState || "Grande Escala"}</h1>
        <p style="margin:8px 0 0;color:#A7F3D0;font-size:14px;font-weight:600;">${name}</p>
        ${dateRange ? `<p style="margin:6px 0 0;color:#6EE7B7;font-size:13px;">📅 ${dateRange}${time ? ` · ${time}` : ""}</p>` : ""}
        ${fullLocation ? `<p style="margin:4px 0 0;color:#34D399;font-size:12px;">📍 ${fullLocation}</p>` : ""}
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:40px 40px 32px;">
        <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
          <strong>{{VISITOR_NAME}}</strong>, a <strong>${name}</strong> é o maior evento de negócios da região. Você já se inscreveu
          — agora é a hora de aparecer e <strong>transformar contatos em contratos</strong>.
        </p>

        <!-- Impact numbers -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:28px;background:#F0FDF4;border-radius:10px;padding:20px;">
          <tr>
            <td style="text-align:center;padding:12px 8px;">
              <p style="margin:0;color:#059669;font-size:28px;font-weight:900;line-height:1;">500+</p>
              <p style="margin:5px 0 0;color:#6B7280;font-size:12px;font-weight:600;text-transform:uppercase;">Participantes</p>
            </td>
            <td style="text-align:center;padding:12px 8px;border-left:1px solid #D1FAE5;border-right:1px solid #D1FAE5;">
              <p style="margin:0;color:#059669;font-size:28px;font-weight:900;line-height:1;">200+</p>
              <p style="margin:5px 0 0;color:#6B7280;font-size:12px;font-weight:600;text-transform:uppercase;">Empresas</p>
            </td>
            <td style="text-align:center;padding:12px 8px;">
              <p style="margin:0;color:#059669;font-size:28px;font-weight:900;line-height:1;">3 dias</p>
              <p style="margin:5px 0 0;color:#6B7280;font-size:12px;font-weight:600;text-transform:uppercase;">De conteúdo</p>
            </td>
          </tr>
        </table>

        <!-- Tips for networking -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
          <tr><td style="background:#ECFDF5;border-left:4px solid #10B981;padding:18px 20px;border-radius:0 8px 8px 0;">
            <p style="margin:0 0 10px;color:#065F46;font-size:14px;font-weight:700;">Como aproveitar ao máximo:</p>
            <p style="margin:0 0 6px;color:#374151;font-size:14px;">💡 Leve cartões de visita — muitos deles</p>
            <p style="margin:0 0 6px;color:#374151;font-size:14px;">📱 Adicione no LinkedIn durante o evento</p>
            <p style="margin:0 0 6px;color:#374151;font-size:14px;">🎯 Defina 3 metas de negócios antes de entrar</p>
            <p style="margin:0;color:#374151;font-size:14px;">☕ Use os intervalos para conexões informais</p>
          </td></tr>
        </table>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:32px;">
          <tr><td align="center">
            <a href="#" style="display:inline-block;background:#059669;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px;">
              🤝 Quero fazer networking →
            </a>
          </td></tr>
        </table>

        ${logoGridHtml(logoUrls)}
        <p style="margin:0;color:#9CA3AF;font-size:12px;text-align:center;border-top:1px solid #F3F4F6;padding-top:20px;">
          Equipe ${name} · gerencia@expomultimix.com.br
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
};

// ─── Template metadata ─────────────────────────────────────────────────────────

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  strategy: string;
  icon: React.ReactNode;
  generate: (fair?: Fair, logoUrls?: string[]) => string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "saudade",
    name: "Sentimos sua falta",
    description: "Remarketing suave para ausentes",
    strategy: "Engajamento",
    icon: <Heart className="h-5 w-5" />,
    generate: tplSaudade,
  },
  {
    id: "urgencia",
    name: "Últimas Horas!",
    description: "FOMO e urgência para converter agora",
    strategy: "Urgência",
    icon: <Clock className="h-5 w-5" />,
    generate: tplUrgencia,
  },
  {
    id: "palestras",
    name: "Palestras & Conteúdo",
    description: "Foco no valor educacional do evento",
    strategy: "Conteúdo",
    icon: <Star className="h-5 w-5" />,
    generate: tplPalestras,
  },
  {
    id: "vip",
    name: "Convite VIP",
    description: "Experiência premium e exclusiva",
    strategy: "Premium",
    icon: <Sparkles className="h-5 w-5" />,
    generate: tplVip,
  },
  {
    id: "networking",
    name: "Networking & Negócios",
    description: "ROI e conexões profissionais",
    strategy: "Negócios",
    icon: <Handshake className="h-5 w-5" />,
    generate: tplNetworking,
  },
];

// ─── AI prompt generator ───────────────────────────────────────────────────────

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
// The AI is told to insert these exactly as-is, preventing it from reimplementing
// critical sections (logos, fair details, footer) in unpredictable ways.

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
  for (let i = 0; i < logoUrls.length; i += perRow) rows.push(logoUrls.slice(i, i + perRow));
  const rowsHtml = rows
    .map((row) => {
      const w = Math.floor(100 / row.length);
      const cells = row
        .map(
          (url) =>
            `<td width="${w}%" style="text-align:center;padding:8px;vertical-align:middle;">` +
            `<img src="${url}" alt="Expositor" style="max-width:90px;max-height:60px;height:auto;display:block;margin:0 auto;"></td>`
        )
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;"><tr><td><p style="margin:0 0 12px;color:rgba(255,255,255,0.45);font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-align:center;">Marcas Participantes</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rowsHtml}</table></td></tr></table>`;
};

const aiBlockFooter = (fairName: string): string =>
  `<tr><td style="padding:20px 40px 28px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);"><p style="margin:0 0 4px;color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;">${fairName}</p><p style="margin:0 0 8px;color:rgba(255,255,255,0.25);font-size:11px;">gerencia@expomultimix.com.br</p><p style="margin:0;font-size:10px;"><a href="#descadastro" style="color:rgba(255,255,255,0.25);text-decoration:underline;">Cancelar inscri&#231;&#227;o</a></p></td></tr>`;

const generateAIPrompt = (fair: Fair, userDescription: string, logoUrls: string[] = []): string => {
  const { name } = fairInfo(fair);
  const monthYear = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

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

${hasLogos ? `### BLOCO B — Marcas Participantes (logos dos expositores)
Posição obrigatória: imediatamente antes do rodapé.
\`\`\`html
${blockLogos}
\`\`\`` : ""}

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

const generateRevisionPrompt = (originalPrompt: string, currentHtml: string, comment: string): string => {
  const hasHtml = currentHtml.trim().length > 0;
  return `Você é uma especialista sênior em email marketing B2B. Preciso que revise o email abaixo incorporando as alterações solicitadas.

## Contexto original (identidade visual, paleta e dados da feira — mantenha tudo isso)
${originalPrompt}

---
${hasHtml ? `## HTML atual
\`\`\`html
${currentHtml}
\`\`\`

` : ""}## Alterações solicitadas
${comment}

## Regras de revisão
- Incorpore SOMENTE as alterações pedidas acima — não mude o que não foi solicitado
- Mantenha a paleta dark glassmorphism, os dados da feira e a estrutura geral
- Se o TITULO e o ASSUNTO não foram pedidos para mudar, retorne os mesmos

## FORMATO DE RETORNO — SIGA EXATAMENTE

TITULO: [mesmo título ou novo se solicitado]
ASSUNTO: [mesmo subject ou novo se solicitado]

\`\`\`html
<!DOCTYPE html>
<html lang="pt-BR">
...
</html>
\`\`\`

Não adicione texto fora desta estrutura.`;
};

// Limites reais por plano Brevo (a API retorna o restante como "total", ignoramos)
const BREVO_PLAN_LIMITS: Record<string, number> = {
  Starter: 10_000,
  Business: 100_000,
  Enterprise: 500_000,
};

const parseAIResponse = (text: string): { title?: string; subject?: string; html?: string } => {
  const titleMatch = text.match(/^TITULO:\s*(.+)$/m);
  const subjectMatch = text.match(/^ASSUNTO:\s*(.+)$/m);
  const htmlMatch = text.match(/```html\s*([\s\S]*?)```/);
  const strip = (s?: string) => s?.trim().replace(/^["'\[]|["'\]]$/g, "").trim();
  return {
    title: strip(titleMatch?.[1]),
    subject: strip(subjectMatch?.[1]),
    html: htmlMatch?.[1]?.trim(),
  };
};

// ─── Component ─────────────────────────────────────────────────────────────────

export const MarketingPage: React.FC = () => {
  const { sendMarketing, getCampaigns, getCampaignStats, getAccountStats } = useMarketingService();
  // Marketing usa TODAS as feiras (inclusive encerradas) para remarketing
  const { data: fairs, isLoading: loadingFairs } = useFairs();
  const [, , headerFairId] = useSearchParams();
  // headerFair = feira do cabeçalho = base para template e IA; selectedFairId = alvo de remarketing (opcional)
  const headerFair = fairs?.find((f) => f.id === headerFairId);
  const { data: fairImages = [] } = useFairImages(headerFairId);
  const logoUrls = fairImages.map((img) => img.url);
  const uploadLogosMutation = useUploadFairImages();
  const deleteLogoMutation = useDeleteFairImage();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogos, setUploadingLogos] = useState(false);

  const [selectedFairId, setSelectedFairId] = useState<string>(""); // remarketing target (optional)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Você está convidado — ExpoMultiMix te espera!");
  const [htmlContent, setHtmlContent] = useState("");
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAudience, setPendingAudience] = useState<"all" | "absent">("absent");

  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiStep, setAiStep] = useState<1 | 2>(1);
  const [aiDescription, setAiDescription] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [promptCopied, setPromptCopied] = useState(false);
  const [revisionComment, setRevisionComment] = useState("");
  const [revisionPrompt, setRevisionPrompt] = useState("");
  const [aiResponseInput, setAiResponseInput] = useState("");
  const [showPasteArea, setShowPasteArea] = useState(false);

  const [card1Collapsed, setCard1Collapsed] = useState(true);
  const [card2Collapsed, setCard2Collapsed] = useState(false);
  const [mainTab, setMainTab] = useState<"create" | "history">("create");

  useEffect(() => {
    if (headerFair) {
      setCard1Collapsed(true);
    }
  }, [headerFair]);

  // Campaign history + account stats
  const [campaigns, setCampaigns] = useState<import("@/service/marketing.service").Campaign[]>([]);
  const [accountStats, setAccountStats] = useState<import("@/service/marketing.service").AccountStats | null>(null);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaignStats, setCampaignStats] = useState<import("@/service/marketing.service").CampaignStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [campaignData, statsData] = await Promise.all([getCampaigns(), getAccountStats()]);
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

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !headerFairId) return;
    setUploadingLogos(true);
    try {
      await uploadLogosMutation.mutateAsync({ fairId: headerFairId, files });
    } finally {
      setUploadingLogos(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }, [headerFairId, uploadLogosMutation]);

  const handleLogoDelete = useCallback(async (imageId: string) => {
    if (!headerFairId) return;
    await deleteLogoMutation.mutateAsync({ imageId, fairId: headerFairId });
  }, [headerFairId, deleteLogoMutation]);

  const handleLogoDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!headerFairId) return;
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    const fakeEvent = { target: { files: files as unknown as FileList } } as React.ChangeEvent<HTMLInputElement>;
    handleLogoUpload(fakeEvent);
  }, [headerFairId, handleLogoUpload]);

  const handleSelectTemplate = (tpl: EmailTemplate) => {
    setSelectedTemplateId(tpl.id);
    setHtmlContent(tpl.generate(headerFair, logoUrls));
    setActiveTab("editor");
    setCard2Collapsed(true);
    toast.success(`Template "${tpl.name}" aplicado com dados de "${headerFair?.name ?? "feira do cabeçalho"}"`);
  };

  const handleGeneratePrompt = () => {
    if (!headerFair) { toast.error("Selecione uma feira no cabeçalho da página"); return; }
    if (!aiDescription.trim()) { toast.error("Descreva o que você quer no email"); return; }
    setGeneratedPrompt(generateAIPrompt(headerFair, aiDescription, logoUrls));
    setAiStep(2);
  };

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setPromptCopied(true);
    toast.success("Prompt copiado!");
    setTimeout(() => setPromptCopied(false), 2500);
  };

  const handleOpenAI = useCallback(async (url: string, name: string) => {
    await navigator.clipboard.writeText(generatedPrompt);
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success(`Prompt copiado — cole no ${name}`, { description: "Use Ctrl+V (ou Cmd+V) para colar." });
  }, [generatedPrompt]);

  const handleGenerateRevision = useCallback(() => {
    if (!revisionComment.trim()) { toast.error("Descreva as alterações que você quer"); return; }
    const originalContext = generatedPrompt || (headerFair ? generateAIPrompt(headerFair, "Usar como referência de contexto e identidade visual") : "");
    setRevisionPrompt(generateRevisionPrompt(originalContext, htmlContent, revisionComment));
    setRevisionComment("");
    toast.success("Prompt de revisão gerado — clique em uma IA para copiar e abrir");
  }, [revisionComment, generatedPrompt, htmlContent, headerFair]);

  const handleOpenRevisionAI = useCallback(async (url: string, name: string) => {
    await navigator.clipboard.writeText(revisionPrompt);
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success(`Prompt copiado — cole no ${name}`, { description: "Use Ctrl+V (ou Cmd+V) para colar." });
  }, [revisionPrompt]);

  const handleApplyAIResponse = useCallback(() => {
    if (!aiResponseInput.trim()) { toast.error("Cole a resposta da IA antes de aplicar"); return; }
    const parsed = parseAIResponse(aiResponseInput);
    if (!parsed.html && !parsed.title && !parsed.subject) {
      toast.error("Não foi possível extrair os dados — verifique se a IA retornou no formato TITULO / ASSUNTO / ```html```");
      return;
    }
    if (parsed.title) setTitle(parsed.title);
    if (parsed.subject) setSubject(parsed.subject);
    if (parsed.html) setHtmlContent(parsed.html);
    setAiResponseInput("");
    setShowPasteArea(false);
    setActiveTab("preview");
    setCard2Collapsed(true);
    toast.success("Resposta aplicada!", {
      description: [parsed.title && "título", parsed.subject && "assunto", parsed.html && "HTML"].filter(Boolean).join(", ") + " preenchidos automaticamente.",
    });
  }, [aiResponseInput]);

  const openConfirmDialog = (audience: "all" | "absent") => {
    if (!headerFair) { toast.error("Selecione uma feira no cabeçalho da página"); return; }
    if (!subject.trim() || !htmlContent.trim()) { toast.error("Preencha o assunto e o conteúdo HTML"); return; }
    setPendingAudience(audience);
    setShowConfirmDialog(true);
  };

  const refreshCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
      const [campaignData, statsData] = await Promise.all([getCampaigns(), getAccountStats()]);
      if (campaignData) setCampaigns(campaignData);
      if (statsData) setAccountStats(statsData);
    } finally {
      setLoadingCampaigns(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCampaignStats = useCallback(async (campaignId: string) => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaignId]);

  const handleSend = useCallback(async () => {
    if (!headerFair) return;
    setShowConfirmDialog(false);
    setLoading(true);
    try {
      const campaignTitle = title.trim() || `Campanha ${headerFair.name} — ${new Date().toLocaleDateString("pt-BR")}`;
      const res = await sendMarketing({
        title: campaignTitle,
        targetFairId: effectiveTargetId,
        templateFairId: headerFair.id,
        sendTo: pendingAudience,
        subject,
        htmlContent,
      });
      if (res?.success) {
        const targetFairName = fairs?.find((f) => f.id === effectiveTargetId)?.name ?? effectiveTargetId;
        toast.success(
          `${res.totalQueued} email(s) enfileirados — ${pendingAudience === "all" ? "todos os inscritos" : "ausentes"} de "${targetFairName}"`,
          { duration: 6000, description: res.campaignId ? `ID: ${res.campaignId.slice(0, 8)}…` : `Status: ${res.status}` }
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
  }, [headerFair, effectiveTargetId, pendingAudience, title, subject, htmlContent, sendMarketing, fairs]);

  const confirmSend = () => handleSend();

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
          <Mail className="h-8 w-8 text-brand-pink" />
          Marketing por <span className="text-brand-cyan">Email</span>
        </h1>
        <div className="h-1.5 w-24 bg-linear-to-r from-brand-pink to-brand-cyan rounded-full" />
        <p className="text-white/40 text-sm font-medium">
          Selecione a feira, escolha um template e dispare para os visitantes certos.
        </p>
      </div>

      {/* ── Main Navigation Tabs ── */}
      <div className="flex gap-4 border-b border-white/5 pb-1">
        <button
          onClick={() => setMainTab("create")}
          className={`flex items-center gap-2 pb-3.5 px-1 text-sm font-black uppercase tracking-widest transition-all border-b-2 -mb-px cursor-pointer ${
            mainTab === "create"
              ? "text-brand-pink border-brand-pink font-black"
              : "text-white/40 border-transparent hover:text-white/70"
          }`}
        >
          <Send className="h-4 w-4" />
          Enviar Campanha
        </button>
        <button
          onClick={() => setMainTab("history")}
          className={`flex items-center gap-2 pb-3.5 px-1 text-sm font-black uppercase tracking-widest transition-all border-b-2 -mb-px cursor-pointer ${
            mainTab === "history"
              ? "text-brand-cyan border-brand-cyan font-black"
              : "text-white/40 border-transparent hover:text-white/70"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Análise de Resultados
        </button>
      </div>

      {mainTab === "create" ? (
        <>
      {/* ── Cards 1 & 2 container ── */}
      {card1Collapsed && card2Collapsed ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1 Minimized */}
          <div className="glass-card border-white/5 shadow-2xl rounded-3xl p-5 flex items-center justify-between transition-all">
            <div className="flex items-center gap-3">
              <span className="bg-brand-pink text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shrink-0">1</span>
              <div>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Público-alvo</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="font-bold text-white text-sm truncate max-w-[150px] sm:max-w-[220px]">
                    {selectedFair?.name || headerFair?.name || "Nenhuma feira"}
                  </p>
                  {selectedFairId && (
                    <span className="text-[9px] font-black text-brand-orange uppercase tracking-widest bg-brand-orange/10 px-2 py-0.5 rounded-full shrink-0">
                      Remarketing
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setCard1Collapsed(false)}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Edit className="h-3.5 w-3.5" />
              Alterar
            </button>
          </div>

          {/* Card 2 Minimized */}
          <div className="glass-card border-white/5 shadow-2xl rounded-3xl p-5 flex items-center justify-between transition-all">
            <div className="flex items-center gap-3">
              <span className="bg-brand-pink text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shrink-0">2</span>
              <div>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Conteúdo do Email</p>
                <p className="font-bold text-white text-sm mt-0.5">
                  {selectedTemplateId
                    ? `Template: ${EMAIL_TEMPLATES.find((t) => t.id === selectedTemplateId)?.name}`
                    : htmlContent
                    ? "Personalizado / IA"
                    : "Nenhum selecionado"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCard2Collapsed(false)}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Edit className="h-3.5 w-3.5" />
              Alterar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Card 1 (either minimized or expanded, full width) */}
          {card1Collapsed ? (
            <div className="glass-card border-white/5 shadow-2xl rounded-3xl p-5 flex items-center justify-between transition-all">
              <div className="flex items-center gap-3">
                <span className="bg-brand-pink text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shrink-0">1</span>
                <div>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Público-alvo</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="font-bold text-white text-sm truncate">
                      {selectedFair?.name || headerFair?.name || "Nenhuma feira"}
                    </p>
                    {selectedFairId && (
                      <span className="text-[9px] font-black text-brand-orange uppercase tracking-widest bg-brand-orange/10 px-2 py-0.5 rounded-full shrink-0">
                        Remarketing
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCard1Collapsed(false)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Edit className="h-3.5 w-3.5" />
                Alterar
              </button>
            </div>
          ) : (
            <div className="glass-card border-white/5 shadow-2xl rounded-[32px] p-6 lg:p-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="bg-brand-pink text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shrink-0">1</span>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">Público-alvo</h2>
                  <span className="text-white/30 text-xs font-medium hidden sm:inline">— usa a feira do cabeçalho por padrão</span>
                </div>
                {(headerFair || selectedFairId) && (
                  <button
                    onClick={() => setCard1Collapsed(true)}
                    className="text-xs text-brand-cyan hover:text-brand-cyan/80 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Minimizar
                  </button>
                )}
              </div>

              {/* Header fair — template base, read-only */}
              {headerFair ? (
                <div className="glass border-brand-cyan/20 rounded-2xl p-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand-cyan/20 text-brand-cyan rounded-xl p-2 shrink-0">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-white text-sm truncate">{headerFair.name}</p>
                        <span className="text-[9px] font-black text-brand-cyan uppercase tracking-widest bg-brand-cyan/10 px-2 py-0.5 rounded-full shrink-0">
                          Cabeçalho
                        </span>
                      </div>
                      {(locationParts || headerFair.location) && (
                        <p className="text-white/50 text-xs flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {locationParts ? `${locationParts} — ` : ""}{headerFair.location}
                        </p>
                      )}
                      {(headerFair.startDate || headerFair.endDate) && (
                        <p className="text-white/50 text-xs flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          {fmt(headerFair.startDate)}
                          {headerFair.endDate && headerFair.endDate !== headerFair.startDate && ` a ${fmt(headerFair.endDate)}`}
                          {headerFair.startTime && ` · ${headerFair.startTime}`}
                          {headerFair.endTime && ` às ${headerFair.endTime}`}
                        </p>
                      )}
                    </div>
                    <Badge className={headerFair.isActive
                      ? "bg-brand-cyan/20 text-brand-cyan border-brand-cyan/20 text-xs font-black shrink-0"
                      : "bg-white/5 text-white/30 border-white/10 text-xs shrink-0"
                    }>
                      {headerFair.isActive ? "Ativa" : "Encerrada"}
                    </Badge>
                  </div>
                  <p className="text-white/30 text-[10px] mt-3 pt-2 border-t border-white/5">
                    Dados desta feira são injetados nos templates e no prompt de IA. Por padrão, os emails são enviados para os visitantes desta feira.
                  </p>
                </div>
              ) : (
                <div className="glass border-white/5 rounded-2xl p-4 mb-5 flex items-center gap-3">
                  <ChevronRight className="h-4 w-4 text-white/20" />
                  <p className="text-white/30 text-sm">Selecione uma feira no cabeçalho da página para habilitar templates e envio.</p>
                </div>
              )}

              {/* Remarketing override — optional */}
              <div className="space-y-3">
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">
                  Remarketing — enviar para visitantes de outra feira <span className="text-white/20 normal-case font-medium">(opcional)</span>
                </p>
                <Select value={selectedFairId} onValueChange={handleFairChange} disabled={loadingFairs}>
                  <SelectTrigger className="h-10 w-full max-w-sm bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all rounded-xl cursor-pointer text-xs">
                    <SelectValue placeholder={loadingFairs ? "Carregando..." : "Enviar para visitantes de outra feira..."} />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-blue border-white/10 text-white rounded-2xl">
                    {(fairs ?? []).map((fair) => (
                      <SelectItem key={fair.id} value={fair.id} className="focus:bg-white/10 focus:text-white rounded-xl cursor-pointer text-xs">
                        <span className="flex items-center gap-2">
                          {fair.name}
                          {fair.isActive
                            ? <span className="text-[10px] font-black text-brand-cyan uppercase tracking-widest">● Ativa</span>
                            : <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">○ Encerrada</span>
                          }
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedFairId && (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-3 bg-brand-orange/10 border border-brand-orange/20 rounded-xl">
                      <AlertTriangle className="h-3.5 w-3.5 text-brand-orange shrink-0 mt-0.5" />
                      <p className="text-brand-orange text-xs">
                        <strong>Remarketing:</strong> template usa dados de <strong>{headerFair?.name ?? "feira do cabeçalho"}</strong>, mas o envio vai para visitantes de <strong>{selectedFair?.name}</strong>.
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFairId("")}
                      className="text-xs text-white/30 hover:text-white/60 transition-colors underline"
                    >
                      Limpar — usar a feira do cabeçalho
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card 2 (either minimized or expanded, full width) */}
          {card2Collapsed ? (
            <div className="glass-card border-white/5 shadow-2xl rounded-3xl p-5 flex items-center justify-between transition-all">
              <div className="flex items-center gap-3">
                <span className="bg-brand-pink text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shrink-0">2</span>
                <div>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Conteúdo do Email</p>
                  <p className="font-bold text-white text-sm mt-0.5">
                    {selectedTemplateId
                      ? `Template: ${EMAIL_TEMPLATES.find((t) => t.id === selectedTemplateId)?.name}`
                      : htmlContent
                      ? "Personalizado / IA"
                      : "Nenhum selecionado"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCard2Collapsed(false)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Edit className="h-3.5 w-3.5" />
                Alterar
              </button>
            </div>
          ) : (
            <div className="glass-card border-white/5 shadow-2xl rounded-[32px] p-6 lg:p-8">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <span className="bg-brand-pink text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shrink-0">2</span>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">Conteúdo do Email</h2>
                </div>
                {(selectedTemplateId || htmlContent) && (
                  <button
                    onClick={() => setCard2Collapsed(true)}
                    className="text-xs text-brand-cyan hover:text-brand-cyan/80 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Minimizar
                  </button>
                )}
              </div>
              <p className="text-white/30 text-xs mb-5 ml-9">Gere com IA ou escolha um template como ponto de partida <span className="text-white/20">(opcional)</span></p>

              {/* ── Gerar com IA — destaque principal ── */}
              <button
                onClick={() => setShowAIDialog(true)}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border border-brand-cyan/30 bg-brand-cyan/8 hover:bg-brand-cyan/15 hover:border-brand-cyan/50 transition-all group mb-5 text-left"
              >
                <div className="bg-brand-cyan/20 rounded-2xl p-3 shrink-0 group-hover:bg-brand-cyan/30 transition-colors">
                  <Sparkles className="h-6 w-6 text-brand-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-brand-cyan font-black uppercase tracking-widest text-sm">Gerar com IA</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    Descreva o email em português — a IA gera título, assunto e HTML completo com design dark glassmorphism
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-brand-cyan/40 group-hover:text-brand-cyan/70 shrink-0 transition-colors" />
              </button>

              {/* ── Divider ── */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">ou use um template</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {EMAIL_TEMPLATES.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl)}
                      disabled={!headerFair}
                      className={`group relative flex flex-col items-start gap-2 p-4 rounded-2xl border text-left transition-all active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed ${
                        isSelected
                          ? "bg-brand-pink/15 border-brand-pink/40 shadow-lg shadow-brand-pink/10"
                          : "bg-white/3 border-white/8 hover:bg-white/8 hover:border-white/15"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-2 right-2 bg-brand-pink text-white rounded-full w-4 h-4 flex items-center justify-center">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                      )}
                      <span className={`p-2 rounded-xl transition-colors ${
                        isSelected ? "bg-brand-pink/20 text-brand-pink" : "bg-white/8 text-white/50 group-hover:text-white/80"
                      }`}>
                        {tpl.icon}
                      </span>
                      <div>
                        <p className={`text-xs font-black uppercase tracking-widest leading-tight ${isSelected ? "text-white" : "text-white/70"}`}>
                          {tpl.name}
                        </p>
                        <p className="text-white/30 text-[11px] mt-1 leading-snug">{tpl.description}</p>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        isSelected ? "bg-brand-pink/20 text-brand-pink" : "bg-white/5 text-white/25"
                      }`}>
                        {tpl.strategy}
                      </span>
                    </button>
                  );
                })}
              </div>

              {!headerFair && (
                <p className="mt-3 text-white/20 text-xs text-center">Selecione uma feira no cabeçalho para habilitar os templates</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Logos dos Expositores ── */}
      {headerFairId && (
        <div className="glass-card border-white/5 shadow-2xl rounded-[32px] p-6 lg:p-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="bg-brand-pink text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shrink-0">
                <ImageIcon className="h-3 w-3" />
              </span>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Logos dos Expositores</h2>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                fairImages.length > 0
                  ? "bg-green-500/20 text-green-400"
                  : "bg-white/8 text-white/30"
              }`}>
                {fairImages.length} logo{fairImages.length !== 1 ? "s" : ""}
              </span>
            </div>
            <button
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogos || !headerFairId}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/20 hover:border-brand-cyan/40 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-cyan transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              {uploadingLogos
                ? <><LogoLoading size={12} minimal className="mr-1" />Enviando...</>
                : <><Upload className="h-3 w-3" />Adicionar logos</>
              }
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>

          {fairImages.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {fairImages.map((img) => (
                <div key={img.id} className="relative group">
                  <div className="w-24 h-16 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center p-1.5">
                    <img
                      src={img.url}
                      alt={img.caption || "Logo expositor"}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <button
                    onClick={() => handleLogoDelete(img.id)}
                    disabled={deleteLogoMutation.isPending}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 cursor-pointer"
                    title="Remover logo"
                  >
                    <Trash2 className="h-2.5 w-2.5 text-white" />
                  </button>
                  {img.caption && (
                    <p className="text-white/30 text-[9px] text-center mt-1 truncate max-w-[96px]">{img.caption}</p>
                  )}
                </div>
              ))}

              {/* Add more button as last item */}
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogos}
                className="w-24 h-16 bg-white/3 border border-dashed border-white/15 hover:border-brand-cyan/30 hover:bg-brand-cyan/5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-40"
              >
                <Upload className="h-4 w-4 text-white/25" />
                <span className="text-white/25 text-[9px]">Adicionar</span>
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleLogoDrop}
              onClick={() => logoInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 hover:border-brand-cyan/30 hover:bg-brand-cyan/5 rounded-2xl p-8 text-center cursor-pointer transition-all"
            >
              <Upload className="h-8 w-8 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm font-bold">Arraste logos ou clique para selecionar</p>
              <p className="text-white/20 text-xs mt-1">PNG, JPG, SVG, WebP · Múltiplos arquivos</p>
              <p className="text-white/15 text-[10px] mt-3">
                Logos aparecem automaticamente nos templates e no prompt de IA
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Editor + preview ── */}
      <div className="glass-card border-white/5 shadow-2xl rounded-[32px] p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-5">
          <span className="bg-brand-pink text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shrink-0">3</span>
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Editar & Enviar</h2>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab("editor")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === "editor"
                ? "bg-brand-pink text-white shadow-lg shadow-brand-pink/20"
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            Editor HTML
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === "preview"
                ? "bg-brand-cyan text-brand-blue shadow-lg shadow-brand-cyan/20"
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Pré-visualização
          </button>

          <button
            onClick={() => {
              setActiveTab("editor");
              setShowPasteArea(!showPasteArea);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              showPasteArea && activeTab === "editor"
                ? "bg-brand-cyan/25 text-brand-cyan border border-brand-cyan/35 shadow-lg shadow-brand-cyan/10"
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Clipboard className="h-3.5 w-3.5" />
            Colar resposta da IA
          </button>
        </div>

        {activeTab === "editor" && (
          <div className="space-y-5">

            {/* ── Paste AI response ── */}
            {showPasteArea && (
              <div className="rounded-2xl border border-brand-cyan/20 overflow-hidden bg-brand-cyan/5 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-brand-cyan/10 pb-2">
                  <span className="flex items-center gap-2 text-brand-cyan text-xs font-black uppercase tracking-widest">
                    <Clipboard className="h-3.5 w-3.5" />
                    Colar resposta da IA
                  </span>
                  <button
                    onClick={() => { setShowPasteArea(false); setAiResponseInput(""); }}
                    className="text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-white/35 text-[10px] leading-relaxed">
                  Cole aqui a resposta completa da IA — o sistema extrai automaticamente o <span className="text-white/60">título</span>, o <span className="text-white/60">assunto</span> e o <span className="text-white/60">HTML</span>.
                </p>
                <textarea
                  value={aiResponseInput}
                  onChange={(e) => setAiResponseInput(e.target.value)}
                  rows={7}
                  placeholder={"TITULO: Remarketing Feira — Maio 2026\nASSUNTO: Você perdeu a maior feira do Norte\n\n```html\n<!DOCTYPE html>...\n```"}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white/80 text-xs font-mono leading-relaxed placeholder:text-white/15 focus:outline-none focus:border-brand-cyan/40 focus:ring-2 focus:ring-brand-cyan/10 transition-all resize-none overflow-x-auto"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleApplyAIResponse}
                    disabled={!aiResponseInput.trim()}
                    className="flex-1 h-9 bg-brand-cyan text-brand-blue text-xs font-black uppercase tracking-widest rounded-xl hover:bg-brand-cyan/90 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    Aplicar
                  </Button>
                  <button
                    onClick={() => { setShowPasteArea(false); setAiResponseInput(""); }}
                    className="px-4 text-xs text-white/30 hover:text-white/60 font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-2">Nome Interno da Campanha</p>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`Ex: Remarketing ${headerFair?.name ?? "Feira"} — ${new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-brand-cyan/30"
                />
                <p className="text-white/20 text-[10px] mt-1.5 font-medium">Aparece no histórico — não é enviado ao visitante.</p>
              </div>

              <div>
                <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-2">Assunto do Email</p>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: ExpoMultiMix te espera — venha hoje!"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-brand-pink/30"
                />
              </div>
            </div>

            <div>
              <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-2">Conteúdo HTML</p>
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                rows={18}
                placeholder={selectedTemplateId ? "" : "Escolha um template acima ou cole seu HTML aqui..."}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white/80 text-xs font-mono leading-relaxed placeholder:text-white/20 focus:outline-none focus:border-brand-pink/50 focus:ring-4 focus:ring-brand-pink/10 transition-all resize-none overflow-x-auto"
              />
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <div className="space-y-3">
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/60">
              <span className="text-white/30 font-black uppercase tracking-widest text-xs mr-2">Assunto:</span>
              {subject || <span className="italic text-white/20">sem assunto</span>}
            </div>
            {htmlContent ? (
              <>
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
                <p className="text-white/25 text-xs text-center">
                  Visualização isolada — representa fielmente como o email aparecerá nos clientes de email.
                </p>

                {/* ── Revision request ── */}
                <div className="mt-2 pt-5 border-t border-white/5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand-cyan/60" />
                    <span className="text-white/50 font-black text-[10px] uppercase tracking-widest">Solicitar alterações com IA</span>
                  </div>
                  <textarea
                    value={revisionComment}
                    onChange={(e) => setRevisionComment(e.target.value)}
                    placeholder='Ex: "Mude o botão CTA para laranja, aumente o título, remova a seção de depoimentos..."'
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-cyan/50 focus:ring-4 focus:ring-brand-cyan/10 transition-all resize-none"
                  />
                  <Button
                    onClick={handleGenerateRevision}
                    disabled={!revisionComment.trim()}
                    className="w-full h-10 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan font-black uppercase tracking-widest rounded-2xl hover:bg-brand-cyan/20 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Prompt de Revisão
                  </Button>

                  {revisionPrompt && (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Abrir no assistente de IA:</p>
                        <button
                          onClick={async () => {
                            await navigator.clipboard.writeText(revisionPrompt);
                            toast.success("Prompt de revisão copiado!");
                          }}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
                        >
                          <Copy className="h-3 w-3" />
                          Copiar prompt
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {AI_SERVICES.map((ai) => (
                          <button
                            key={ai.name}
                            onClick={() => handleOpenRevisionAI(ai.url, ai.name)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-black transition-all hover:scale-[1.03] active:scale-[0.97]"
                            style={{ color: ai.color, borderColor: `${ai.color}40`, backgroundColor: `${ai.color}12` }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${ai.color}22`; (e.currentTarget as HTMLButtonElement).style.borderColor = `${ai.color}80`; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${ai.color}12`; (e.currentTarget as HTMLButtonElement).style.borderColor = `${ai.color}40`; }}
                          >
                            {ai.icon}
                            {ai.name}
                            <ExternalLink className="h-3 w-3 opacity-50" />
                          </button>
                        ))}
                      </div>
                      <p className="text-white/20 text-[10px]">
                        Clicar copia o prompt de revisão — cole com{" "}
                        <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white/40 font-mono">Ctrl+V</kbd>{" "}
                        na IA. Depois cole o HTML revisado no editor.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center border border-white/5 rounded-2xl">
                <p className="text-white/25 text-sm">Selecione um template para visualizar</p>
              </div>
            )}
          </div>
        )}

        {/* ── Send buttons — always visible ── */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-white/5">
          <Button
            type="button"
            disabled={loading || !headerFair}
            onClick={() => openConfirmDialog("absent")}
            className="flex-1 h-12 bg-white/10 border border-white/20 rounded-2xl text-white font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-40"
          >
            <Users className="h-4 w-4 mr-2" />
            Enviar para Ausentes
          </Button>
          <Button
            type="button"
            disabled={loading || !headerFair}
            onClick={() => openConfirmDialog("all")}
            className="flex-1 h-12 bg-brand-pink rounded-2xl text-white font-black uppercase tracking-widest hover:bg-brand-pink/90 transition-all shadow-xl shadow-brand-pink/20 active:scale-[0.98] cursor-pointer disabled:opacity-40"
          >
            {loading ? <LogoLoading size={16} minimal className="mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            {loading ? "Enviando..." : "Enviar para Todos os Inscritos"}
          </Button>
        </div>
      </div>

    </>
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
            <RefreshCcw className={`h-3.5 w-3.5 ${loadingCampaigns ? "animate-spin" : ""}`} />
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
                <span className="text-white/40 text-xs font-black uppercase tracking-widest">Brevo {accountStats.plan.name}</span>
                <span className="text-white/20 text-[9px]">· ciclo até {new Date(accountStats.plan.periodEnd).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className={`text-base font-black leading-none ${accountStats.last30Days.deliveryRate >= 95 ? "text-green-400" : accountStats.last30Days.deliveryRate >= 85 ? "text-yellow-400" : "text-red-400"}`}>
                    {accountStats.last30Days.deliveryRate.toFixed(1)}%
                  </p>
                  <p className="text-white/30 text-[8px] uppercase tracking-widest mt-0.5">Entrega/30d</p>
                </div>
                <div className="text-center">
                  <p className={`text-base font-black leading-none ${accountStats.last30Days.openRate >= 30 ? "text-green-400" : accountStats.last30Days.openRate >= 15 ? "text-yellow-400" : "text-red-400"}`}>
                    {accountStats.last30Days.openRate.toFixed(1)}%
                  </p>
                  <p className="text-white/30 text-[8px] uppercase tracking-widest mt-0.5">Abertura/30d</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-black leading-none text-white/60">{accountStats.last30Days.sent.toLocaleString("pt-BR")}</p>
                  <p className="text-white/30 text-[8px] uppercase tracking-widest mt-0.5">Enviados/30d</p>
                </div>
              </div>
            </div>

            {/* Credits bar */}
            {(() => {
              const planTotal = BREVO_PLAN_LIMITS[accountStats.plan.name] ?? accountStats.credits.total;
              const used = planTotal - accountStats.credits.remaining;
              const usedPct = planTotal > 0 ? Math.round((used / planTotal) * 100) : 0;
              const remainPct = 100 - usedPct;
              return (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white/30 text-[9px] font-black uppercase tracking-widest">Créditos de email</span>
                    <span className="text-white/50 text-[10px] font-bold">
                      <span className="text-brand-cyan">{accountStats.credits.remaining.toLocaleString("pt-BR")}</span>
                      <span className="text-white/30"> disponíveis de </span>
                      <span className="text-white/60">{planTotal.toLocaleString("pt-BR")}</span>
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
            {(accountStats.suppressedContacts || accountStats.sendingInsights) && (
              <div className="flex flex-wrap gap-3 pt-1 border-t border-white/5">
                {accountStats.suppressedContacts && (
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Bloqueados</span>
                    <span className="text-xs font-black text-brand-orange">{accountStats.suppressedContacts.total.toLocaleString("pt-BR")}</span>
                    <span className="text-[9px] text-white/20">(bounce, spam, descad.)</span>
                  </div>
                )}
                {accountStats.sendingInsights && accountStats.sendingInsights.bestDaysToSend.length > 0 && (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Melhores dias</span>
                    <div className="flex items-center gap-1">
                      {accountStats.sendingInsights.bestDaysToSend.slice(0, 3).map((day, i) => (
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
            <p className="text-white/25 text-sm">Nenhuma campanha enviada ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {campaigns.map((campaign) => {
              const isSelected = selectedCampaignId === campaign.id;
              const targetFair = fairs?.find((f) => f.id === campaign.targetFairId);
              const sentDate = new Date(campaign.sentAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

              return (
                <div key={campaign.id} className={`glass-card rounded-2xl overflow-hidden border transition-all ${isSelected ? "border-brand-cyan/30" : "border-white/5"}`}>
                  <button
                    onClick={() => loadCampaignStats(campaign.id)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/5 transition-all group"
                  >
                    <div className={`w-1 self-stretch rounded-full shrink-0 transition-colors ${isSelected ? "bg-brand-cyan" : "bg-white/10 group-hover:bg-white/20"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate">{campaign.title}</p>
                      <p className="text-xs text-white/40 truncate mt-0.5">{campaign.subject}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className={`text-[9px] font-black uppercase tracking-widest border-0 ${campaign.sendTo === "all" ? "bg-brand-cyan/10 text-brand-cyan" : "bg-brand-pink/10 text-brand-pink"}`}>
                        {campaign.sendTo === "all" ? "Todos" : "Ausentes"}
                      </Badge>
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-white/60 font-bold">
                          {(campaign.totalRecipients ?? campaign.totalQueued).toLocaleString("pt-BR")} emails
                        </p>
                        <p className="text-[9px] text-white/30">
                          {campaign.suppressedByBrevo != null && campaign.suppressedByBrevo > 0
                            ? `${campaign.suppressedByBrevo} bloqueados · ${targetFair?.name ?? sentDate}`
                            : targetFair?.name ?? sentDate}
                        </p>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-white/30 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                    </div>
                  </button>

                  {isSelected && (
                    <div className="border-t border-white/5 p-4">
                      {loadingStats ? (
                        <div className="flex items-center justify-center py-6 gap-2">
                          <LogoLoading size={18} minimal className="animate-pulse" />
                          <span className="text-white/40 text-xs">Carregando estatísticas...</span>
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
                                  <p className="font-black text-white/80 mb-1">Taxa de Entrega</p>
                                  <p>% dos emails que chegaram na caixa de entrada. <span className="text-brand-cyan">Ex: 96% = 960 de 1.000 entregues.</span></p>
                                  <p className="mt-1 text-white/40">≥95% ótimo · 85–95% ok · &lt;85% investigar lista</p>
                                </div>
                              </div>
                            </div>
                            <p className={`text-xl font-black ${campaignStats.delivery.deliveryRate >= 95 ? "text-green-400" : campaignStats.delivery.deliveryRate >= 85 ? "text-yellow-400" : "text-red-400"}`}>
                              {campaignStats.delivery.deliveryRate.toFixed(1)}%
                            </p>
                            <p className="text-white/30 text-[9px] uppercase tracking-widest mt-0.5">Taxa de Entrega</p>
                            <p className="text-white/40 text-xs mt-1">{campaignStats.delivery.delivered}/{campaignStats.delivery.queued}</p>
                          </div>

                          {/* Abertura */}
                          <div className="bg-white/5 rounded-xl p-3 text-center relative group/card">
                            <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                              <div className="relative group/tip">
                                <Info className="h-3 w-3 text-white/30 hover:text-white/60 cursor-help transition-colors" />
                                <div className="absolute bottom-full right-0 mb-2 w-56 p-3 bg-[#0A1628] border border-white/15 rounded-xl text-left text-[10px] text-white/60 leading-relaxed opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                                  <p className="font-black text-white/80 mb-1">Open Rate</p>
                                  <p>% de destinatários únicos que abriram o email. <span className="text-brand-cyan">Ex: 30% = 300 pessoas de 1.000 entregues abriram.</span></p>
                                  <p className="mt-1 text-white/40">≥30% excelente · 15–30% bom · &lt;15% revisar subject</p>
                                </div>
                              </div>
                            </div>
                            <TrendingUp className={`h-4 w-4 mx-auto mb-1 ${campaignStats.engagement.openRate >= 30 ? "text-green-400" : campaignStats.engagement.openRate >= 15 ? "text-yellow-400" : "text-red-400"}`} />
                            <p className={`text-xl font-black ${campaignStats.engagement.openRate >= 30 ? "text-green-400" : campaignStats.engagement.openRate >= 15 ? "text-yellow-400" : "text-red-400"}`}>
                              {campaignStats.engagement.openRate.toFixed(1)}%
                            </p>
                            <p className="text-white/30 text-[9px] uppercase tracking-widest mt-0.5">Abertura</p>
                            <p className="text-white/40 text-xs mt-1">{campaignStats.engagement.uniqueOpens} únicos</p>
                          </div>

                          {/* Cliques */}
                          <div className="bg-white/5 rounded-xl p-3 text-center relative group/card">
                            <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                              <div className="relative group/tip">
                                <Info className="h-3 w-3 text-white/30 hover:text-white/60 cursor-help transition-colors" />
                                <div className="absolute bottom-full right-0 mb-2 w-56 p-3 bg-[#0A1628] border border-white/15 rounded-xl text-left text-[10px] text-white/60 leading-relaxed opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                                  <p className="font-black text-white/80 mb-1">Click Rate</p>
                                  <p>% de destinatários que clicaram em algum link. <span className="text-brand-cyan">Ex: 5% = 50 pessoas de 1.000 entregues clicaram no CTA.</span></p>
                                  <p className="mt-1 text-white/40">≥5% excelente · 2–5% bom · &lt;2% revisar CTA</p>
                                </div>
                              </div>
                            </div>
                            <MousePointerClick className={`h-4 w-4 mx-auto mb-1 ${campaignStats.engagement.clickRate >= 5 ? "text-green-400" : campaignStats.engagement.clickRate >= 2 ? "text-yellow-400" : "text-red-400"}`} />
                            <p className={`text-xl font-black ${campaignStats.engagement.clickRate >= 5 ? "text-green-400" : campaignStats.engagement.clickRate >= 2 ? "text-yellow-400" : "text-red-400"}`}>
                              {campaignStats.engagement.clickRate.toFixed(1)}%
                            </p>
                            <p className="text-white/30 text-[9px] uppercase tracking-widest mt-0.5">Cliques</p>
                            <p className="text-white/40 text-xs mt-1">{campaignStats.engagement.uniqueClicks} únicos</p>
                          </div>

                          {/* Bounces + Spam */}
                          <div className="bg-white/5 rounded-xl p-3 text-center relative group/card">
                            <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                              <div className="relative group/tip">
                                <Info className="h-3 w-3 text-white/30 hover:text-white/60 cursor-help transition-colors" />
                                <div className="absolute bottom-full right-0 mb-2 w-60 p-3 bg-[#0A1628] border border-white/15 rounded-xl text-left text-[10px] text-white/60 leading-relaxed opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                                  <p className="font-black text-white/80 mb-1">Bounces + Spam</p>
                                  <p><span className="text-brand-orange">Hard bounce:</span> endereço inválido permanentemente (ex: email digitado errado).</p>
                                  <p className="mt-1"><span className="text-brand-orange">Spam:</span> destinatário marcou como indesejado — prejudica a reputação do remetente.</p>
                                  <p className="mt-1 text-white/40">Ideal: zero. Acima de 2% pode bloquear envios futuros.</p>
                                  <p className="mt-1 text-white/30">Descadastr.: {campaignStats.engagement.unsubscribed} pessoa(s) cancelaram</p>
                                </div>
                              </div>
                            </div>
                            <p className={`text-xl font-black ${(campaignStats.delivery.hardBounces + campaignStats.delivery.spam) === 0 ? "text-green-400" : "text-red-400"}`}>
                              {campaignStats.delivery.hardBounces + campaignStats.delivery.spam}
                            </p>
                            <p className="text-white/30 text-[9px] uppercase tracking-widest mt-0.5">Bounces + Spam</p>
                            <p className="text-white/40 text-xs mt-1">{campaignStats.engagement.unsubscribed} descad.</p>
                          </div>

                        </div>

                        {/* Suppressed breakdown */}
                        {campaignStats.campaign.suppressedByBrevo != null && campaignStats.campaign.suppressedByBrevo > 0 && (
                          <div className="mt-3 flex items-center gap-2 px-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/25">Total da lista</span>
                            <span className="text-xs font-black text-white/50">{(campaignStats.campaign.totalRecipients ?? campaignStats.campaign.totalQueued).toLocaleString("pt-BR")}</span>
                            <span className="text-white/20 text-[9px]">·</span>
                            <span className="text-[9px] text-white/25">{campaignStats.campaign.totalQueued.toLocaleString("pt-BR")} enfileirados</span>
                            <span className="text-white/20 text-[9px]">·</span>
                            <span className="text-[9px] text-brand-orange/70">{campaignStats.campaign.suppressedByBrevo} bloqueados pela Brevo</span>
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
          if (!open) { setAiStep(1); setAiDescription(""); setGeneratedPrompt(""); setPromptCopied(false); }
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
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                  aiStep > s ? "bg-brand-cyan/20 text-brand-cyan" : aiStep === s ? "bg-brand-cyan text-brand-blue" : "bg-white/10 text-white/30"
                }`}>
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
                    Diga o que você quer — a IA gera título, assunto e HTML completo com identidade visual da ExpoMultiMix.
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
                        <p className="text-white font-black text-xs truncate">{headerFair.name}</p>
                        {locationParts && <p className="text-white/40 text-[10px] truncate">{locationParts}</p>}
                      </div>
                      <span className="text-[9px] font-black text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded-full shrink-0">base do email</span>
                    </div>

                    {/* Logos status */}
                    {logoUrls.length > 0 ? (
                      <div className="flex items-center gap-2 p-2.5 bg-green-500/8 border border-green-500/20 rounded-xl">
                        <Check className="h-3.5 w-3.5 text-green-400 shrink-0" />
                        <p className="text-green-400 text-[10px] font-black uppercase tracking-widest">
                          {logoUrls.length} logo{logoUrls.length !== 1 ? "s" : ""} de expositores incluídas no prompt
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 p-2.5 bg-brand-orange/8 border border-brand-orange/20 rounded-xl">
                        <AlertTriangle className="h-3.5 w-3.5 text-brand-orange shrink-0 mt-0.5" />
                        <p className="text-brand-orange text-[10px] leading-relaxed">
                          <strong>Nenhuma logo encontrada para esta feira.</strong> Cadastre as logos dos expositores em <strong>Clientes → Galeria</strong> antes de gerar o email para que elas apareçam automaticamente.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">O que você quer no email?</p>
                  <textarea
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleGeneratePrompt(); }}
                    placeholder="Ex: Lembrete de que a feira começa amanhã, tom urgente e empolgante, CTA para confirmar presença..."
                    rows={5}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/10 focus:outline-none focus:border-brand-cyan/50 focus:ring-4 focus:ring-brand-cyan/10 transition-all resize-none"
                  />
                  <p className="text-white/20 text-[10px] mt-1.5">Dica: <kbd className="bg-white/8 px-1 rounded font-mono">Ctrl+Enter</kbd> para gerar</p>
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
                    Clique em qualquer assistente abaixo. O prompt é copiado automaticamente — cole com <kbd className="bg-white/10 px-1 rounded font-mono text-white/50">Ctrl+V</kbd>.
                  </DialogDescription>
                </DialogHeader>

                {/* Copy bar */}
                <div className="flex items-center gap-3 p-3 bg-brand-cyan/8 border border-brand-cyan/20 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-[10px] font-mono truncate">{generatedPrompt.slice(0, 80)}…</p>
                  </div>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-cyan/15 hover:bg-brand-cyan/25 border border-brand-cyan/30 rounded-lg text-[10px] font-black uppercase tracking-widest text-brand-cyan transition-all shrink-0"
                  >
                    {promptCopied ? <><Check className="h-3 w-3" />Copiado!</> : <><Copy className="h-3 w-3" />Copiar</>}
                  </button>
                </div>

                {/* AI grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AI_SERVICES.map((ai) => (
                    <button
                      key={ai.name}
                      onClick={() => handleOpenAI(ai.url, ai.name)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.97]"
                      style={{ color: ai.color, borderColor: `${ai.color}35`, backgroundColor: `${ai.color}10` }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${ai.color}20`; (e.currentTarget as HTMLButtonElement).style.borderColor = `${ai.color}60`; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${ai.color}10`; (e.currentTarget as HTMLButtonElement).style.borderColor = `${ai.color}35`; }}
                    >
                      <span className="shrink-0">{ai.icon}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-black text-xs">{ai.name}</span>
                        <span className="block text-[9px] opacity-40 truncate">{ai.shortUrl}</span>
                      </span>
                      <ExternalLink className="h-3 w-3 opacity-30 shrink-0" />
                    </button>
                  ))}
                </div>

                {/* Footer actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => { setAiStep(1); setGeneratedPrompt(""); }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
                  >
                    <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                    Refazer
                  </button>
                  <button
                    onClick={() => {
                      setShowAIDialog(false);
                      setAiStep(1);
                      setShowPasteArea(true);
                      setActiveTab("editor");
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-pink/10 hover:bg-brand-pink/20 border border-brand-pink/30 rounded-xl text-xs font-black uppercase tracking-widest text-brand-pink transition-all"
                  >
                    Fechar — colar resposta no editor
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
                    <span className="text-white/30 font-black uppercase tracking-widest text-xs">Feira: </span>
                    <span className="text-white font-bold">{headerFair?.name ?? "—"}</span>
                  </p>
                  {locationParts && (
                    <p>
                      <span className="text-white/30 font-black uppercase tracking-widest text-xs">Local: </span>
                      <span className="text-white/70">{locationParts}</span>
                    </p>
                  )}
                  <p>
                    <span className="text-white/30 font-black uppercase tracking-widest text-xs">Assunto: </span>
                    <span className="text-white/70">{subject || "—"}</span>
                  </p>
                  <p>
                    <span className="text-white/30 font-black uppercase tracking-widest text-xs">Destinatários: </span>
                    <span className="text-brand-cyan font-bold">
                      {pendingAudience === "all" ? "Todos os visitantes inscritos" : "Visitantes que não fizeram check-in"}
                    </span>
                  </p>
                  {selectedTemplateId && (
                    <p>
                      <span className="text-white/30 font-black uppercase tracking-widest text-xs">Template: </span>
                      <span className="text-white/70">
                        {EMAIL_TEMPLATES.find((t) => t.id === selectedTemplateId)?.name}
                      </span>
                    </p>
                  )}
                </div>
                <div className="flex items-start gap-2 p-3 bg-brand-orange/10 border border-brand-orange/20 rounded-xl">
                  <AlertTriangle className="h-4 w-4 text-brand-orange shrink-0 mt-0.5" />
                  <p className="text-brand-orange text-xs">
                    Esta ação envia emails reais. Confirme que o conteúdo e a feira estão corretos.
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
