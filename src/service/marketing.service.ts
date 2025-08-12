import { handleRequest } from "@/utils/handleRequest";
import { useAxio } from "@/hooks/useAxio";

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
  status: "PROCESSING_STARTED";
  absentVisitors: {
    name: string;
    email: string;
    company: string;
  }[];
}

export const useMarketingService = () => {
  const api = useAxio();

  const sendMarketingEmailToAbsentVisitors = async (
    data: SendMarketingEmailRequest
  ): Promise<SendMarketingEmailResponse | null> => {
    const response = await handleRequest({
      request: () => api.post("/emails/marketing/absent-visitors", data),
    });
    return response as SendMarketingEmailResponse | null;
  };

  return {
    sendMarketingEmailToAbsentVisitors,
  };
};
