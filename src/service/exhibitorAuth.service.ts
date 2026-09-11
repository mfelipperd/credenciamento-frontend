import { handleRequest } from "@/utils/handleRequest";
import { useAxiosPublic } from "@/hooks/useAxiosPublic";
import type {
  ExhibitorAuthResponse,
  ExhibitorFirstAccessForm,
  ExhibitorLoginForm,
} from "@/interfaces/exhibitorAuth";
import { AppEndpoints } from "@/constants/AppEndpoints";

export const useExhibitorAuthService = () => {
  const api = useAxiosPublic();

  const firstAccess = async (
    data: ExhibitorFirstAccessForm
  ): Promise<ExhibitorAuthResponse | undefined> => {
    return handleRequest<ExhibitorAuthResponse>({
      request: () => api.post(AppEndpoints.EXHIBITOR_AUTH.FIRST_ACCESS, data),
    });
  };

  const login = async (
    data: ExhibitorLoginForm
  ): Promise<ExhibitorAuthResponse | undefined> => {
    return handleRequest<ExhibitorAuthResponse>({
      request: () => api.post(AppEndpoints.EXHIBITOR_AUTH.LOGIN, data),
    });
  };

  return { firstAccess, login };
};
