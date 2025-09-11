import { useEffect } from "react";
import { toast } from "sonner";

interface ErrorDetails {
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
}

export const useGlobalErrorHandler = () => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const errorDetails: ErrorDetails = {
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      };

      console.error("Erro JavaScript capturado:", errorDetails);

      // Mostra um toast de erro para o usuário
      toast.error(
        "Ocorreu um erro inesperado. Recarregue a página se necessário."
      );

      // Em produção, você pode enviar para um serviço de monitoramento
      if (process.env.NODE_ENV === "production") {
        // Exemplo: sendErrorToService(errorDetails);
      }
    };

    // Removido handleUnhandledRejection - React Query já trata erros adequadamente
    // const handleUnhandledRejection = (event: PromiseRejectionEvent) => { ... };

    // Adiciona os listeners de erro
    window.addEventListener("error", handleError);
    // Removido listener de unhandledrejection - React Query já trata erros

    // Cleanup
    return () => {
      window.removeEventListener("error", handleError);
      // Removido cleanup de unhandledrejection
    };
  }, []);
};
