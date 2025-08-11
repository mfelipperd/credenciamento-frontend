import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStandService } from "@/service/stands.service";
import { Settings, Plus, Edit } from "lucide-react";

interface StandConfiguratorProps {
  fairId: string;
  currentStandCount?: number;
  onConfigurationChange: () => void;
}

export const StandConfigurator: React.FC<StandConfiguratorProps> = ({
  fairId,
  currentStandCount = 0,
  onConfigurationChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [standCount, setStandCount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const { configureStands } = useStandService();

  const isEditing = currentStandCount > 0;

  useEffect(() => {
    if (isOpen) {
      setStandCount(currentStandCount > 0 ? currentStandCount.toString() : "");
      setError("");
    }
  }, [isOpen, currentStandCount]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setStandCount("");
    setError("");
  };

  const handleSubmit = async () => {
    const count = parseInt(standCount);

    if (!standCount || isNaN(count) || count < 1) {
      setError("Digite um número válido de stands (mínimo 1)");
      return;
    }

    if (count > 1000) {
      setError("Número máximo de stands é 1000");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Enviando dados para API
      console.log("Enviando dados para API:", {
        fairId: fairId,
        totalStands: count,
        price: 1500,
      });

      await configureStands({
        fairId: fairId,
        totalStands: count,
        price: 1500,
      });
      onConfigurationChange();
      handleClose();
    } catch (error: unknown) {
      console.error("Erro ao configurar stands:", error);

      // Type guard para verificar se é um erro de axios
      const isAxiosError = (
        err: unknown
      ): err is { response?: { data?: { message?: string[] } } } => {
        return typeof err === "object" && err !== null && "response" in err;
      };

      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        if (
          Array.isArray(errorMessage) &&
          errorMessage.some((msg) => msg.includes("fairId must be a number"))
        ) {
          setError(
            "⚠️ Problema no backend: A API está esperando fairId como número, mas deveria aceitar UUID. Entre em contato com o desenvolvedor."
          );
        } else {
          setError("Erro ao configurar stands. Tente novamente.");
        }
      } else {
        setError("Erro ao configurar stands. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permite apenas números
    if (value === "" || /^\d+$/.test(value)) {
      setStandCount(value);
      setError("");
    }
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant={isEditing ? "outline" : "default"}
        size="sm"
        className="flex items-center gap-2"
      >
        {isEditing ? (
          <>
            <Edit className="w-4 h-4" />
            Editar quantidade de stands
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Configurar Stands
          </>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md text-white ">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {isEditing ? "Editar Configuração" : "Configurar Stands"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Altere o número total de stands da feira"
                : "Defina quantos stands esta feira terá"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="standCount">Quantidade de Stands</Label>
              <Input
                id="standCount"
                type="text"
                value={standCount}
                onChange={handleInputChange}
                placeholder="Digite o número de stands"
                disabled={isLoading}
                className={error ? "border-red-500" : ""}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            {isEditing && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Atenção:</strong> Alterar a quantidade pode afetar
                  stands já ocupados.
                </p>
              </div>
            )}

            {/* Aviso sobre problema conhecido */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Existe um problema conhecido no backend
                onde a API espera fairId como número em vez de UUID. Se você
                encontrar erros, entre em contato com o desenvolvedor.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !standCount}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Configurando...
                </div>
              ) : isEditing ? (
                "Atualizar"
              ) : (
                "Configurar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
