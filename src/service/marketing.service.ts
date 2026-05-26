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
  targetFairId: string;
  templateFairId: string;
  sendTo: "all" | "absent";
  subject: string;
  htmlContent: string;
}

export interface SendMarketingResponse {
  success: boolean;
  message: string;
  targetFairId: string;
  templateFairId: string;
  sendTo: "all" | "absent";
  totalQueued: number;
  status: "QUEUED";
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

  return {
    sendMarketingEmailToAbsentVisitors,
    sendCampaign,
    sendMarketing,
  };
};
