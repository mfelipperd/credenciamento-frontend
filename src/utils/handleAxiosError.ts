import axios from "axios";
import { toast } from "sonner";

export const handleAxiosError = (error: unknown): void => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    toast.error(`Erro ao processar a requisição: ${errorMessage}`);
  } else {
    toast.error("Erro desconhecido ao processar a requisição.");
  }
};
