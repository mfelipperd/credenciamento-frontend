import { handleRequest } from "@/utils/handleRequest";
import { useAxio } from "@/hooks/useAxio";
import { AppEndpoints } from "@/constants/AppEndpoints";

export interface SendPushRequest {
  title: string;
  body: string;
  url?: string;
}

export interface SendPushResponse {
  sent: number;
  failed: number;
}

export const usePushService = () => {
  const api = useAxio();

  const sendPush = async (
    data: SendPushRequest
  ): Promise<SendPushResponse | null> => {
    const response = await handleRequest({
      request: () => api.post(AppEndpoints.PUSH.SEND, data),
    });
    return response as SendPushResponse | null;
  };

  return { sendPush };
};
