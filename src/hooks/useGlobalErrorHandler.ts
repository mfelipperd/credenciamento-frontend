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

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Promise rejeitada não tratada:", event.reason);

      toast.error("Erro de conexão ou processamento. Tente novamente.");

      // Previne o erro padrão do console
      event.preventDefault();

      // Em produção, você pode enviar para um serviço de monitoramento
      if (process.env.NODE_ENV === "production") {
        // Exemplo: sendErrorToService({ message: event.reason });
      }
    };

    // Adiciona os listeners de erro
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);
};
