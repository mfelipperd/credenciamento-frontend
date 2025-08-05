import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, ChevronDown, ChevronUp, RefreshCw, Home } from "lucide-react";

interface ErrorPageProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  resetError?: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ 
  error, 
  errorInfo, 
  resetError 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const errorCode = error?.name || "UnknownError";
  const errorMessage = error?.message || "Ocorreu um erro inesperado";
  const errorStack = error?.stack || "Stack trace não disponível";

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 shadow-lg">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Oops! Algo deu errado
          </h1>
          
          <p className="text-gray-600 mb-4">
            Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-red-800">
                Código do Erro: {errorCode}
              </h3>
            </div>
            <p className="text-red-700 text-sm">
              {errorMessage}
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <Button 
              onClick={handleReload}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar Página
            </Button>
            
            <Button 
              onClick={handleGoHome}
              variant="outline"
              className="px-6 py-2"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir para Início
            </Button>

            {resetError && (
              <Button 
                onClick={resetError}
                variant="outline"
                className="px-6 py-2"
              >
                Tentar Novamente
              </Button>
            )}
          </div>

          <div className="border-t pt-4">
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="ghost"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Ocultar Detalhes Técnicos
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Mostrar Detalhes Técnicos
                </>
              )}
            </Button>

            {showDetails && (
              <div className="mt-4 text-left">
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Stack Trace:</h4>
                  <pre className="text-xs text-gray-600 overflow-auto max-h-40 whitespace-pre-wrap">
                    {errorStack}
                  </pre>
                </div>

                {errorInfo && (
                  <div className="bg-gray-100 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Component Stack:</h4>
                    <pre className="text-xs text-gray-600 overflow-auto max-h-40 whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 text-xs text-gray-400">
            <p>Se o problema persistir, entre em contato conosco:</p>
            <p>suporte@expomultimix.com</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
