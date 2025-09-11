import axios from "axios";
import { toast } from "sonner";

export const handleAxiosError = (error: unknown): void => {
  console.log("🔍 handleAxiosError chamado com:", error);
  
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    console.log("📊 handleAxiosError - mensagem de erro:", errorMessage);
    console.log("📊 handleAxiosError - response status:", error.response?.status);
    console.log("📊 handleAxiosError - response data:", error.response?.data);
    
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
    
    console.log("❌ handleAxiosError - exibindo toast de erro");
    toast.error(`Erro ao processar a requisição: ${errorMessage}`);
  } else {
    console.log("❌ handleAxiosError - erro desconhecido");
    toast.error("Erro desconhecido ao processar a requisição.");
  }
};
