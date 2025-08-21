import axios from "axios";
import { toast } from "sonner";

export const handleAxiosError = (error: unknown): void => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    
    // Não exibe toast para erros relacionados ao fairId quando não há um fairId válido
    if (errorMessage && (
      errorMessage.includes("fairId é obrigatório") ||
      errorMessage.includes("fairId is required") ||
      errorMessage.includes("fairId must be")
    )) {
      // Apenas loga o erro sem exibir toast para o usuário
      console.warn("Erro de fairId ignorado:", errorMessage);
      return;
    }
    
    toast.error(`Erro ao processar a requisição: ${errorMessage}`);
  } else {
    toast.error("Erro desconhecido ao processar a requisição.");
  }
};
