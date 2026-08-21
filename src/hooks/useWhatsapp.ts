import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWhatsappService } from "@/service/whatsapp.service";
import { toast } from "sonner";
import { getAxiosErrorMessage } from "@/utils/handleAxiosError";
import type { SendWhatsappCampaignRequest, WhatsappSendTo } from "@/service/whatsapp.service";

export const useWhatsappInstanceStatus = () => {
  const service = useWhatsappService();

  return useQuery({
    queryKey: ["whatsapp", "instance-status"],
    queryFn: async () => {
      const result = await service.getInstanceStatus();
      return result ?? null;
    },
    refetchInterval: 30_000,
  });
};

export const useWhatsappWarmupStatus = () => {
  const service = useWhatsappService();

  return useQuery({
    queryKey: ["whatsapp", "warmup-status"],
    queryFn: async () => {
      const result = await service.getWarmupStatus();
      return result ?? null;
    },
    refetchInterval: 30_000,
  });
};

export const useWhatsappCampaignPreview = (
  targetFairId: string,
  sendTo: WhatsappSendTo
) => {
  const service = useWhatsappService();

  return useQuery({
    queryKey: ["whatsapp", "campaigns", "preview", targetFairId, sendTo],
    queryFn: async () => {
      const result = await service.getCampaignPreview(targetFairId, sendTo);
      return result ?? null;
    },
    enabled: !!targetFairId,
  });
};

export const useWhatsappCampaigns = () => {
  const service = useWhatsappService();

  return useQuery({
    queryKey: ["whatsapp", "campaigns"],
    queryFn: async () => {
      const result = await service.getCampaigns();
      return result ?? [];
    },
    refetchInterval: 15_000,
  });
};

export const useWhatsappCampaignRecipients = (id: string | null) => {
  const service = useWhatsappService();

  return useQuery({
    queryKey: ["whatsapp", "campaigns", id, "recipients"],
    queryFn: async () => {
      const result = await service.getCampaignRecipients(id as string);
      return result ?? [];
    },
    enabled: !!id,
    refetchInterval: 15_000,
  });
};

export const useSendWhatsappCampaign = () => {
  const service = useWhatsappService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendWhatsappCampaignRequest) => service.sendCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "warmup-status"] });
    },
    onError: (error: unknown) => {
      toast.error(getAxiosErrorMessage(error, "Erro ao disparar campanha"));
    },
  });
};

export const usePauseWhatsappCampaign = () => {
  const service = useWhatsappService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => service.pauseCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "campaigns"] });
      toast.success("Campanha pausada");
    },
    onError: (error: unknown) => {
      toast.error(getAxiosErrorMessage(error, "Erro ao pausar campanha"));
    },
  });
};

export const useResumeWhatsappCampaign = () => {
  const service = useWhatsappService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => service.resumeCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "campaigns"] });
      toast.success("Campanha retomada");
    },
    onError: (error: unknown) => {
      toast.error(getAxiosErrorMessage(error, "Erro ao retomar campanha"));
    },
  });
};

export const useCancelWhatsappCampaign = () => {
  const service = useWhatsappService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => service.cancelCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "campaigns"] });
      toast.success("Campanha cancelada");
    },
    onError: (error: unknown) => {
      toast.error(getAxiosErrorMessage(error, "Erro ao cancelar campanha"));
    },
  });
};
