import { handleRequest } from "@/utils/handleRequest";
import { useAxio } from "@/hooks/useAxio";
import { AppEndpoints } from "@/constants/AppEndpoints";

export interface SendMarketingEmailRequest {
  subject: string;
  htmlContent: string;
  fairId: string;
}

export interface SendMarketingEmailResponse {
  success: boolean;
  message: string;
  fairId: string;
  totalAbsent: number;
  status: "PROCESSING_STARTED" | "QUEUED";
  absentVisitors: {
    name: string;
    email: string;
    company: string;
  }[];
}

export interface SendCampaignRequest {
  subject: string;
  htmlTemplate: string;
  recipients: {
    email: string;
    name?: string;
  }[];
}

export interface SendCampaignResponse {
  success: boolean;
  sent: number;
}

export interface SendMarketingRequest {
  title: string;
  targetFairId: string;
  templateFairId: string;
  sendTo: "all" | "absent";
  subject: string;
  htmlContent: string;
}

export interface SendMarketingResponse {
  success: boolean;
  message: string;
  campaignId?: string;
  brevoTag?: string;
  targetFairId: string;
  templateFairId: string;
  sendTo: "all" | "absent";
  totalQueued: number;
  status: "QUEUED";
}

export interface Campaign {
  id: string;
  title: string;
  subject: string;
  targetFairId: string;
  templateFairId: string;
  sendTo: "all" | "absent";
  totalQueued: number;
  brevoTag: string;
  sentAt: string;
}

export interface AccountStats {
  plan: {
    name: string;
    status: string;
    periodStart: string;
    periodEnd: string;
  };
  credits: {
    total: number;
    remaining: number;
    used: number;
  };
  last30Days: {
    sent: number;
    delivered: number;
    deliveryRate: number;
    opens: number;
    uniqueOpens: number;
    openRate: number;
    clicks: number;
    uniqueClicks: number;
    bounced: number;
    spam: number;
    unsubscribed: number;
  };
}

export interface CampaignStats {
  campaign: Campaign;
  delivery: {
    queued: number;
    delivered: number;
    deliveryRate: number;
    hardBounces: number;
    softBounces: number;
    blocked: number;
    spam: number;
    invalid: number;
  };
  engagement: {
    opens: number;
    uniqueOpens: number;
    openRate: number;
    clicks: number;
    uniqueClicks: number;
    clickRate: number;
    unsubscribed: number;
  };
}

export const useMarketingService = () => {
  const api = useAxio();

  const sendMarketingEmailToAbsentVisitors = async (
    data: SendMarketingEmailRequest
  ): Promise<SendMarketingEmailResponse | null> => {
    const response = await handleRequest({
      request: () => api.post(AppEndpoints.MARKETING.EMAILS_ABSENT, data),
    });
    return response as SendMarketingEmailResponse | null;
  };

  const sendCampaign = async (
    data: SendCampaignRequest
  ): Promise<SendCampaignResponse | null> => {
    const response = await handleRequest({
      request: () => api.post(AppEndpoints.MARKETING.EMAILS_CAMPAIGN, data),
    });
    return response as SendCampaignResponse | null;
  };

  const sendMarketing = async (
    data: SendMarketingRequest
  ): Promise<SendMarketingResponse | null> => {
    const response = await handleRequest({
      request: () => api.post(AppEndpoints.MARKETING.EMAILS_SEND, data),
    });
    return response as SendMarketingResponse | null;
  };

  const getCampaigns = async (): Promise<Campaign[] | null> => {
    const response = await handleRequest({
      request: () => api.get(AppEndpoints.MARKETING.CAMPAIGNS),
    });
    return response as Campaign[] | null;
  };

  const getCampaignStats = async (id: string): Promise<CampaignStats | null> => {
    const response = await handleRequest({
      request: () => api.get(AppEndpoints.MARKETING.CAMPAIGN_STATS(id)),
    });
    return response as CampaignStats | null;
  };

  const getAccountStats = async (): Promise<AccountStats | null> => {
    const response = await handleRequest({
      request: () => api.get(AppEndpoints.MARKETING.ACCOUNT_STATS),
    });
    return response as AccountStats | null;
  };

  return {
    sendMarketingEmailToAbsentVisitors,
    sendCampaign,
    sendMarketing,
    getCampaigns,
    getCampaignStats,
    getAccountStats,
  };
};
