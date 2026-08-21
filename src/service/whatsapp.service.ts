import { handleRequest } from "@/utils/handleRequest";
import { useAxio } from "@/hooks/useAxio";
import { AppEndpoints } from "@/constants/AppEndpoints";

export type WhatsappSendTo = "all" | "absent";
export type WhatsappCampaignStatus = "running" | "paused" | "completed" | "canceled";
export type WhatsappRecipientStatus = "queued" | "sent" | "failed" | "skipped";

export interface WhatsappInstanceStatus {
  connected: boolean;
  value: Record<string, unknown>;
}

export interface WarmupStatus {
  day: number;
  dailyCap: number;
  usedToday: number;
  remainingToday: number;
  startedAt: string;
}

export interface WhatsappRateLimit {
  delayMs: number;
  batchSize: number;
  pauseMs: number;
}

export interface WhatsappCampaignPreview {
  eligibleCount: number;
  willQueueToday: number;
  truncatedByWarmup: boolean;
  warmup: WarmupStatus;
  rateLimit: WhatsappRateLimit;
  estimatedDurationMs: number;
}

export interface SendWhatsappCampaignRequest {
  title: string;
  targetFairId: string;
  sendTo: WhatsappSendTo;
  message: string;
}

export interface WhatsappCampaign {
  id: string;
  title: string;
  targetFairId: string;
  sendTo: WhatsappSendTo;
  messageTemplate: string;
  campaignTag: string;
  status: WhatsappCampaignStatus;
  totalEligible: number;
  totalQueued: number;
  totalSent: number;
  totalFailed: number;
  createdAt: string;
}

export interface WhatsappRecipient {
  id: string;
  visitorRegistrationCode: string;
  phone: string;
  status: WhatsappRecipientStatus;
  zaapId: string | null;
  error: string | null;
  attempts: number;
  sentAt: string | null;
  createdAt: string;
}

export const useWhatsappService = () => {
  const api = useAxio();

  const getInstanceStatus = async (): Promise<WhatsappInstanceStatus | null> => {
    const response = await handleRequest({
      request: () => api.get(AppEndpoints.WHATSAPP.INSTANCE_STATUS),
    });
    return response as WhatsappInstanceStatus | null;
  };

  const getWarmupStatus = async (): Promise<WarmupStatus | null> => {
    const response = await handleRequest({
      request: () => api.get(AppEndpoints.WHATSAPP.WARMUP_STATUS),
    });
    return response as WarmupStatus | null;
  };

  const getCampaignPreview = async (
    targetFairId: string,
    sendTo: WhatsappSendTo
  ): Promise<WhatsappCampaignPreview | null> => {
    const response = await handleRequest({
      request: () =>
        api.get(AppEndpoints.WHATSAPP.CAMPAIGNS_PREVIEW, {
          params: { targetFairId, sendTo },
        }),
    });
    return response as WhatsappCampaignPreview | null;
  };

  const sendCampaign = async (
    data: SendWhatsappCampaignRequest
  ): Promise<WhatsappCampaign | null> => {
    const response = await handleRequest({
      request: () => api.post(AppEndpoints.WHATSAPP.CAMPAIGNS_SEND, data),
    });
    return response as WhatsappCampaign | null;
  };

  const getCampaigns = async (): Promise<WhatsappCampaign[] | null> => {
    const response = await handleRequest({
      request: () => api.get(AppEndpoints.WHATSAPP.CAMPAIGNS),
    });
    return response as WhatsappCampaign[] | null;
  };

  const getCampaignRecipients = async (
    id: string
  ): Promise<WhatsappRecipient[] | null> => {
    const response = await handleRequest({
      request: () => api.get(AppEndpoints.WHATSAPP.CAMPAIGN_RECIPIENTS(id)),
    });
    return response as WhatsappRecipient[] | null;
  };

  const pauseCampaign = async (id: string): Promise<WhatsappCampaign | null> => {
    const response = await handleRequest({
      request: () => api.patch(AppEndpoints.WHATSAPP.CAMPAIGN_PAUSE(id)),
    });
    return response as WhatsappCampaign | null;
  };

  const resumeCampaign = async (id: string): Promise<WhatsappCampaign | null> => {
    const response = await handleRequest({
      request: () => api.patch(AppEndpoints.WHATSAPP.CAMPAIGN_RESUME(id)),
    });
    return response as WhatsappCampaign | null;
  };

  const cancelCampaign = async (id: string): Promise<WhatsappCampaign | null> => {
    const response = await handleRequest({
      request: () => api.patch(AppEndpoints.WHATSAPP.CAMPAIGN_CANCEL(id)),
    });
    return response as WhatsappCampaign | null;
  };

  return {
    getInstanceStatus,
    getWarmupStatus,
    getCampaignPreview,
    sendCampaign,
    getCampaigns,
    getCampaignRecipients,
    pauseCampaign,
    resumeCampaign,
    cancelCampaign,
  };
};
