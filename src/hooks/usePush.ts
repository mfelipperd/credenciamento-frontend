import { useMutation } from "@tanstack/react-query";
import { usePushService } from "@/service/push.service";
import { getAxiosErrorMessage } from "@/utils/handleAxiosError";
import { toast } from "sonner";
import type { SendPushRequest } from "@/service/push.service";

export const useSendPush = () => {
  const service = usePushService();

  return useMutation({
    mutationFn: (data: SendPushRequest) => service.sendPush(data),
    onError: (error: unknown) => {
      toast.error(getAxiosErrorMessage(error, "Erro ao disparar notificação"));
    },
  });
};
