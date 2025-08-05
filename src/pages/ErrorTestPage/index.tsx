import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Bug, Zap, Globe } from "lucide-react";
import { toast } from "sonner";

export const ErrorTestPage: React.FC = () => {
  const [count, setCount] = useState(0);

  const throwReactError = () => {
    throw new Error("Erro simulado do React Component");
  };

  const throwJSError = () => {
    // Erro JavaScript que será capturado pelo window.onerror
    setTimeout(() => {
      throw new Error("Erro JavaScript assíncrono simulado");
    }, 100);
  };

  const throwPromiseError = () => {
    // Promise rejeitada que será capturada pelo unhandledrejection
    Promise.reject(new Error("Promise rejeitada simulada"));
  };

  const throwNetworkError = () => {
    // Simula erro de rede
    fetch("https://api-inexistente-12345.com/dados").catch((error) => {
      console.error("Erro de rede:", error);
      toast.error("Erro de conexão com o servidor");
    });
  };

  const ComponenteComErro: React.FC = () => {
    if (count > 3) {
      throw new Error(`Componente com erro! Count: ${count}`);
    }
    return <div>Count atual: {count}</div>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 mb-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Bug className="h-12 w-12 text-yellow-600" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Página de Teste de Erros
            </h1>

            <p className="text-gray-600 mb-6">
              Esta página permite testar diferentes tipos de erros para
              verificar se a página de erro personalizada está funcionando
              corretamente.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800 text-sm">
                  <strong>Atenção:</strong> Os botões abaixo irão causar erros
                  reais na aplicação para testar o sistema de tratamento de
                  erros.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Erro React */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-2 rounded">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="ml-3 font-semibold text-gray-900">Erro React</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Dispara um erro dentro de um componente React que será capturado
                pelo Error Boundary.
              </p>
              <Button
                onClick={throwReactError}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Causar Erro React
              </Button>
            </Card>

            {/* Erro JavaScript */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-orange-100 p-2 rounded">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="ml-3 font-semibold text-gray-900">
                  Erro JavaScript
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Dispara um erro JavaScript assíncrono que será capturado pelo
                handler global de erros.
              </p>
              <Button
                onClick={throwJSError}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Causar Erro JS
              </Button>
            </Card>

            {/* Erro Promise */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-2 rounded">
                  <Bug className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="ml-3 font-semibold text-gray-900">
                  Promise Rejeitada
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Cria uma Promise rejeitada que será capturada pelo handler de
                unhandled promise rejections.
              </p>
              <Button
                onClick={throwPromiseError}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Rejeitar Promise
              </Button>
            </Card>

            {/* Erro Rede */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="ml-3 font-semibold text-gray-900">
                  Erro de Rede
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Simula uma falha de conexão com servidor inexistente para testar
                tratamento de erros de rede.
              </p>
              <Button
                onClick={throwNetworkError}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Erro de Rede
              </Button>
            </Card>
          </div>

          {/* Componente com erro condicional */}
          <Card className="p-6 mt-6">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-4">
                Componente com Erro Condicional
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Este componente irá disparar um erro quando o contador for maior
                que 3.
              </p>

              <ComponenteComErro />

              <div className="mt-4 space-x-2">
                <Button onClick={() => setCount(count + 1)} variant="outline">
                  Incrementar ({count})
                </Button>
                <Button onClick={() => setCount(0)} variant="ghost">
                  Reset
                </Button>
              </div>
            </div>
          </Card>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Esta página é apenas para desenvolvimento e testes. Remova antes
              de fazer deploy em produção.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
