import React, { useState, useCallback } from "react";
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
} from "lucide-react";
import { LogoLoading } from "@/components/LogoLoading";
import type { Fair } from "@/interfaces/fairs";

// ─── Date helpers ──────────────────────────────────────────────────────────────

const fmt = (d?: string): string => {
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

const tplSaudade = (fair?: Fair): string => {
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
        <h2 style="margin:0 0 12px;color:#1E3A8A;font-size:22px;font-weight:800;">Sentimos sua falta! 💙</h2>
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

const tplUrgencia = (fair?: Fair): string => {
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
          Não perca essa oportunidade!
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

const tplPalestras = (fair?: Fair): string => {
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
          Você se inscreveu na <strong>${name}</strong> e não pode perder a programação de
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

const tplVip = (fair?: Fair): string => {
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
          Você foi <strong style="color:#FCD34D;">selecionado especialmente</strong> para ter acesso
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

const tplNetworking = (fair?: Fair): string => {
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
          A <strong>${name}</strong> é o maior evento de negócios da região. Você já se inscreveu
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
  generate: (fair?: Fair) => string;
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

const generateAIPrompt = (fair: Fair, userDescription: string): string => {
  const { name, fullLocation, dateRange, time, mapsUrl } = fairInfo(fair);
  return `Você é um especialista em email marketing B2B. Crie um email HTML profissional e persuasivo para a ExpoMultiMix.

## Identidade Visual da ExpoMultiMix
- Cor primária: #1E3A8A (azul escuro institucional)
- Cor secundária: #2563EB (azul vibrante)
- Cor de destaque: #F97316 (laranja — use para botões CTA e destaques)
- Cor de sucesso: #10B981 (verde — use com moderação)
- Fundo externo: #f4f4f4, fundo do card: #ffffff
- Logo URL: https://static.wixstatic.com/media/88e022_551e4ef3cf61439fad4f84eca702a829~mv2.png/v1/crop/x_0,y_190,w_2084,h_1301/fill/w_536,h_340,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/EMM2024%20logo%20br_Prancheta%201.png
- Tom de voz: Profissional, empolgante, focado em negócios, acolhedor

## Dados da Feira (USE EXATAMENTE — não invente)
- Nome: ${name}
- Local completo: ${fullLocation}
- Data: ${dateRange || "a confirmar"}
- Horário: ${time || "a confirmar"}
${mapsUrl !== "#" ? `- Google Maps: ${mapsUrl}` : ""}

## Conteúdo solicitado
${userDescription}

## Requisitos Técnicos OBRIGATÓRIOS
1. HTML completo com <!DOCTYPE html>, <head> com charset UTF-8 e viewport meta, e <body>
2. TODOS os estilos inline — NENHUM bloco <style> ou CSS externo
3. Estrutura de tabelas HTML (table, tr, td) para compatibilidade máxima
4. Max-width 600px centralizado
5. Compatível com Gmail, Outlook 2016+, Apple Mail
6. Responsivo para mobile
7. Logo da ExpoMultiMix no cabeçalho com a URL acima
8. Nome, data e local da feira SEMPRE visíveis no cabeçalho do email

## FORMATO DE RETORNO (CRÍTICO)
Retorne SOMENTE o HTML completo. Comece com <!DOCTYPE html> e termine com </html>.
Nenhum texto, markdown, backtick ou explicação fora do HTML.`;
};

// ─── Component ─────────────────────────────────────────────────────────────────

export const MarketingPage: React.FC = () => {
  const { sendMarketing } = useMarketingService();
  // Marketing usa TODAS as feiras (inclusive encerradas) para remarketing
  const { data: fairs, isLoading: loadingFairs } = useFairs();

  const [selectedFairId, setSelectedFairId] = useState<string>("");
  const [targetFairId, setTargetFairId] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [subject, setSubject] = useState("Você está convidado — ExpoMultiMix te espera!");
  const [htmlContent, setHtmlContent] = useState("");
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAudience, setPendingAudience] = useState<"all" | "absent">("absent");

  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [promptCopied, setPromptCopied] = useState(false);

  const selectedFair = fairs?.find((f) => f.id === selectedFairId);

  const locationParts = selectedFair
    ? [selectedFair.city, selectedFair.state].filter(Boolean).join(" / ")
    : null;

  const handleFairChange = (fairId: string) => {
    setSelectedFairId(fairId);
    // Keep target fair in sync unless user has explicitly changed it
    if (!targetFairId || targetFairId === selectedFairId) setTargetFairId(fairId);
    // Re-apply current template with new fair data if one is selected
    if (selectedTemplateId) {
      const tpl = EMAIL_TEMPLATES.find((t) => t.id === selectedTemplateId);
      const newFair = fairs?.find((f) => f.id === fairId);
      if (tpl) setHtmlContent(tpl.generate(newFair));
    }
  };

  const handleSelectTemplate = (tpl: EmailTemplate) => {
    if (!selectedFairId) {
      toast.error("Selecione uma feira antes de aplicar o template");
      return;
    }
    setSelectedTemplateId(tpl.id);
    setHtmlContent(tpl.generate(selectedFair));
    setActiveTab("editor");
    toast.success(`Template "${tpl.name}" aplicado com dados da feira`);
  };

  const handleGeneratePrompt = () => {
    if (!selectedFair) { toast.error("Selecione uma feira primeiro"); return; }
    if (!aiDescription.trim()) { toast.error("Descreva o que você quer no email"); return; }
    setGeneratedPrompt(generateAIPrompt(selectedFair, aiDescription));
  };

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setPromptCopied(true);
    toast.success("Prompt copiado! Cole no Claude.ai ou ChatGPT.");
    setTimeout(() => setPromptCopied(false), 2500);
  };

  const openConfirmDialog = (audience: "all" | "absent") => {
    if (!selectedFair) { toast.error("Selecione a feira do template primeiro"); return; }
    if (!targetFairId) { toast.error("Selecione a feira do público-alvo"); return; }
    if (!subject.trim() || !htmlContent.trim()) { toast.error("Preencha o assunto e o conteúdo HTML"); return; }
    setPendingAudience(audience);
    setShowConfirmDialog(true);
  };

  const handleSend = useCallback(async () => {
    if (!selectedFair || !targetFairId) return;
    setShowConfirmDialog(false);
    setLoading(true);
    try {
      const res = await sendMarketing({
        targetFairId,
        templateFairId: selectedFair.id,
        sendTo: pendingAudience,
        subject,
        htmlContent,
      });
      if (res?.success) {
        const targetFairName = fairs?.find((f) => f.id === targetFairId)?.name ?? targetFairId;
        toast.success(
          `${res.totalQueued} email(s) enfileirados — ${pendingAudience === "all" ? "todos os inscritos" : "ausentes"} de "${targetFairName}"`,
          { duration: 6000, description: `Status: ${res.status}` }
        );
      } else {
        toast.error("Erro ao iniciar envio");
      }
    } catch (err) {
      toast.error("Erro ao processar envio");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedFair, targetFairId, pendingAudience, subject, htmlContent, sendMarketing, fairs]);

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

      {/* ── Step 1: Fair selector ── */}
      <div className="glass-card border-white/5 shadow-2xl rounded-[32px] p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-5">
          <span className="bg-brand-pink text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shrink-0">1</span>
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Selecionar Feira</h2>
          <span className="text-white/30 text-xs font-medium">— todas as feiras disponíveis para remarketing</span>
        </div>

        {/* Select — linha própria para evitar sobreposição com o card de detalhes */}
        <div className="mb-4">
          <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-2">Feira</p>
          <Select value={selectedFairId} onValueChange={handleFairChange} disabled={loadingFairs}>
            <SelectTrigger className="h-12 w-full max-w-sm bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all rounded-2xl cursor-pointer">
              <SelectValue placeholder={loadingFairs ? "Carregando..." : "Escolha uma feira..."} />
            </SelectTrigger>
            <SelectContent className="bg-brand-blue border-white/10 text-white rounded-2xl">
              {(fairs ?? []).map((fair) => (
                <SelectItem key={fair.id} value={fair.id} className="focus:bg-white/10 focus:text-white rounded-xl cursor-pointer">
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
        </div>

        {/* Info card — sempre abaixo do select */}
        {selectedFair ? (
          <div className="glass border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-brand-pink/20 text-brand-pink rounded-xl p-2 shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-white text-sm truncate">{selectedFair.name}</p>
                {(locationParts || selectedFair.location) && (
                  <p className="text-white/50 text-xs flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {locationParts ? `${locationParts} — ` : ""}{selectedFair.location}
                  </p>
                )}
                {(selectedFair.startDate || selectedFair.endDate) && (
                  <p className="text-white/50 text-xs flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3" />
                    {fmt(selectedFair.startDate)}
                    {selectedFair.endDate && selectedFair.endDate !== selectedFair.startDate && ` a ${fmt(selectedFair.endDate)}`}
                    {selectedFair.startTime && ` · ${selectedFair.startTime}`}
                    {selectedFair.endTime && ` às ${selectedFair.endTime}`}
                  </p>
                )}
              </div>
              <Badge className={
                selectedFair.isActive
                  ? "bg-brand-cyan/20 text-brand-cyan border-brand-cyan/20 text-xs font-black shrink-0"
                  : "bg-white/5 text-white/30 border-white/10 text-xs shrink-0"
              }>
                {selectedFair.isActive ? "Ativa" : "Encerrada"}
              </Badge>
            </div>
            <div className="flex items-start gap-2 pt-2 border-t border-white/5">
              <AlertTriangle className="h-3.5 w-3.5 text-brand-orange mt-0.5 shrink-0" />
              <p className="text-white/40 text-xs">
                Emails enviados <strong className="text-white/60">exclusivamente</strong> para visitantes
                desta feira{locationParts ? ` (${locationParts})` : ""}.
              </p>
            </div>
          </div>
        ) : (
          <div className="glass border-white/5 rounded-2xl p-4 flex items-center gap-3">
            <ChevronRight className="h-4 w-4 text-white/20" />
            <p className="text-white/30 text-sm">Selecione uma feira para habilitar os templates e o envio.</p>
          </div>
        )}
      </div>

      {/* ── Step 2: Template selector ── */}
      <div className="glass-card border-white/5 shadow-2xl rounded-[32px] p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-5">
          <span className="bg-brand-pink text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shrink-0">2</span>
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Escolher Template</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {EMAIL_TEMPLATES.map((tpl) => {
            const isSelected = selectedTemplateId === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                disabled={!selectedFairId}
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

        {!selectedFairId && (
          <p className="mt-3 text-white/25 text-xs text-center">Selecione uma feira no passo 1 para habilitar os templates</p>
        )}
      </div>

      {/* ── Step 3: Editor + preview ── */}
      <div className="glass-card border-white/5 shadow-2xl rounded-[32px] p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-5">
          <span className="bg-brand-pink text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shrink-0">3</span>
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Editar & Enviar</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
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
        </div>

        {activeTab === "editor" && (
          <div className="space-y-5">
            <div>
              <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-2">Assunto do Email</p>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex: ExpoMultiMix te espera — venha hoje!" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/40 text-xs font-black uppercase tracking-widest">Conteúdo HTML</p>
                <button
                  onClick={() => setShowAIDialog(true)}
                  className="flex items-center gap-1 text-xs text-brand-cyan hover:text-white font-black uppercase tracking-widest transition-colors"
                >
                  <Sparkles className="h-3 w-3" />
                  Gerar com IA
                </button>
              </div>
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                rows={18}
                placeholder={selectedTemplateId ? "" : "Escolha um template acima ou cole seu HTML aqui..."}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white/80 text-xs font-mono leading-relaxed placeholder:text-white/20 focus:outline-none focus:border-brand-pink/50 focus:ring-4 focus:ring-brand-pink/10 transition-all resize-none"
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
              </>
            ) : (
              <div className="h-64 flex items-center justify-center border border-white/5 rounded-2xl">
                <p className="text-white/25 text-sm">Selecione um template para visualizar</p>
              </div>
            )}
          </div>
        )}

        {/* ── Target audience ── */}
        <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-cyan/60" />
            <span className="text-white/40 font-black text-[10px] uppercase tracking-widest">Público-alvo</span>
            <span className="text-white/20 text-[9px] ml-1">— inscritos de qual feira receberão este email?</span>
          </div>
          <Select
            value={targetFairId}
            onValueChange={setTargetFairId}
            disabled={loadingFairs}
          >
            <SelectTrigger className="h-10 bg-white/5 border-white/10 text-white text-xs font-bold rounded-xl focus:ring-brand-cyan/20 max-w-sm">
              <SelectValue placeholder="Selecione a feira do público-alvo" />
            </SelectTrigger>
            <SelectContent className="bg-brand-blue border-white/10 text-white">
              {(fairs || []).map((fair) => (
                <SelectItem key={fair.id} value={fair.id} className="text-xs font-bold focus:bg-white/10 focus:text-white">
                  {fair.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedFairId && targetFairId && selectedFairId !== targetFairId && (
            <p className="text-brand-orange/70 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" />
              Modo remarketing — template da feira do cabeçalho, envio para inscritos de outra feira
            </p>
          )}
        </div>

        {/* ── Send buttons — always visible ── */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button
            type="button"
            disabled={loading || !selectedFairId || !targetFairId}
            onClick={() => openConfirmDialog("absent")}
            className="flex-1 h-12 bg-white/10 border border-white/20 rounded-2xl text-white font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-40"
          >
            <Users className="h-4 w-4 mr-2" />
            Enviar para Ausentes
          </Button>
          <Button
            type="button"
            disabled={loading || !selectedFairId || !targetFairId}
            onClick={() => openConfirmDialog("all")}
            className="flex-1 h-12 bg-brand-pink rounded-2xl text-white font-black uppercase tracking-widest hover:bg-brand-pink/90 transition-all shadow-xl shadow-brand-pink/20 active:scale-[0.98] cursor-pointer disabled:opacity-40"
          >
            {loading ? <LogoLoading size={16} minimal className="mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            {loading ? "Enviando..." : "Enviar para Todos os Inscritos"}
          </Button>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="glass border-brand-orange/20 rounded-2xl p-4 flex gap-3">
        <AlertTriangle className="h-4 w-4 text-brand-orange mt-0.5 shrink-0" />
        <div className="text-sm text-white/50 space-y-1">
          <p className="font-black text-white/70 uppercase tracking-widest text-xs mb-1">Sobre os envios</p>
          <p>O backend busca os destinatários e enfileira os envios via <span className="text-white/70 font-bold">BullMQ</span> — nenhuma lista de emails é processada no navegador.</p>
          <p><span className="text-white/70 font-bold">Remarketing</span> — selecione feiras diferentes para o template e para o público-alvo. O email usará os dados da feira selecionada no cabeçalho (nome, local, data, horário).</p>
        </div>
      </div>

      {/* ── AI Prompt Dialog ── */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-brand-blue/95 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-base">
              <Sparkles className="h-5 w-5 text-brand-cyan" />
              Gerar Email com IA
            </DialogTitle>
            <DialogDescription className="text-white/40">
              Descreva o email desejado. Um prompt será gerado para colar no Claude.ai ou ChatGPT — a IA retornará o HTML pronto.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {!selectedFair && (
              <div className="flex items-center gap-2 p-3 bg-brand-orange/10 border border-brand-orange/20 rounded-xl text-sm text-brand-orange">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Selecione uma feira primeiro — os dados da feira são incluídos automaticamente no prompt.
              </div>
            )}
            {selectedFair && (
              <div className="flex items-center gap-2 p-3 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl text-sm text-brand-cyan">
                <ChevronRight className="h-4 w-4 shrink-0" />
                Dados de <strong className="text-white">{selectedFair.name}</strong>
                {locationParts ? ` (${locationParts})` : ""} incluídos no prompt.
              </div>
            )}

            <div>
              <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-2">O que você quer no email?</p>
              <textarea
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                placeholder={`Ex: "Lembrete que a feira começa amanhã, tom urgente e empolgante, com CTA para confirmar presença."`}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-cyan/50 focus:ring-4 focus:ring-brand-cyan/10 transition-all resize-none"
              />
            </div>

            <Button
              onClick={handleGeneratePrompt}
              disabled={!selectedFair || !aiDescription.trim()}
              className="w-full h-12 bg-brand-cyan text-brand-blue font-black uppercase tracking-widest rounded-2xl hover:bg-brand-cyan/90 transition-all disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar Prompt
            </Button>

            {generatedPrompt && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-white/40 text-xs font-black uppercase tracking-widest">Prompt gerado:</p>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                  >
                    {promptCopied
                      ? <><Check className="h-3.5 w-3.5 text-brand-cyan" /><span className="text-brand-cyan">Copiado!</span></>
                      : <><Copy className="h-3.5 w-3.5" />Copiar</>
                    }
                  </button>
                </div>
                <textarea
                  value={generatedPrompt}
                  readOnly
                  rows={14}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white/60 text-xs font-mono leading-relaxed focus:outline-none resize-none"
                />
                <div className="p-3 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl text-xs text-brand-cyan">
                  <strong>Próximo passo:</strong> Copie o prompt, cole no{" "}
                  <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="underline font-black text-white">
                    Claude.ai
                  </a>{" "}
                  ou ChatGPT. Cole o HTML retornado no editor e vá em <strong className="text-white">Pré-visualização</strong>.
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
                    <span className="text-white font-bold">{selectedFair?.name ?? "—"}</span>
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
