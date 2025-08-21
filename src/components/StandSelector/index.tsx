import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StandMap } from "@/components/StandMap";
import { useStandService } from "@/service/stands.service";
import type { Stand } from "@/interfaces/finance";
import { formatCurrencyFromCents } from "@/utils/masks";

interface StandSelectorProps {
  fairId: string;
  value?: number;
  onChange: (standNumber: number, stand: Stand) => void;
  error?: string;
}

export const StandSelector: React.FC<StandSelectorProps> = ({
  fairId,
  value,
  onChange,
  error,
}) => {
  const [availableStands, setAvailableStands] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"dropdown" | "map">("dropdown");
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null);

  const { getAvailableStands } = useStandService();

  const loadAvailableStands = async () => {
    setLoading(true);
    try {
      const result = await getAvailableStands(fairId);
      if (result) {
        setAvailableStands(result);
      }
    } catch (error) {
      console.error("Erro ao carregar stands disponíveis:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableStands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fairId]);

  // Efeito separado para reagir às mudanças do valor
  useEffect(() => {
    if (value && availableStands.length > 0) {
      const stand = availableStands.find((s) => s.standNumber === value);
      if (stand) {
        setSelectedStand(stand);
      }
    } else if (!value) {
      setSelectedStand(null);
    }
  }, [value, availableStands]);

  const handleStandSelect = (stand: Stand) => {
    setSelectedStand(stand);
    onChange(stand.standNumber, stand);
  };

  const handleDropdownChange = (standNumberStr: string) => {
    const standNumber = parseInt(standNumberStr);
    const stand = availableStands.find((s) => s.standNumber === standNumber);
    if (stand) {
      handleStandSelect(stand);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Label className="text-gray-900 dark:text-gray-100">Stand</Label>
        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse"></div>
      </div>
    );
  }

  if (availableStands.length === 0) {
    return (
      <div className="space-y-2">
        <Label className="text-gray-900 dark:text-gray-100">Stand</Label>
        <Card className="p-4 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <p>Nenhum stand disponível nesta feira.</p>
          <p className="text-sm mt-1">
            Configure stands primeiro ou verifique se todos não estão ocupados.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="stand" className="text-gray-900 dark:text-gray-100">
          Stand *
        </Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={viewMode === "dropdown" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("dropdown")}
          >
            Lista
          </Button>
          <Button
            type="button"
            variant={viewMode === "map" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("map")}
          >
            Mapa
          </Button>
        </div>
      </div>

      {viewMode === "dropdown" ? (
        <div className="space-y-2">
          <Select
            value={value?.toString() || ""}
            onValueChange={handleDropdownChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um stand disponível" />
            </SelectTrigger>
            <SelectContent>
              {availableStands.map((stand) => (
                <SelectItem key={stand.id} value={stand.standNumber.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-gray-900 dark:text-gray-100">
                      Stand {stand.standNumber}
                    </span>
                    {stand.price && (
                      <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                        R$ {formatCurrencyFromCents(stand.price * 100)}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedStand && (
            <Card className="p-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Stand {selectedStand.standNumber}
                  </div>
                  {selectedStand.price && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Preço: R${" "}
                      {formatCurrencyFromCents(selectedStand.price * 100)}
                    </div>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200"
                >
                  Selecionado
                </Badge>
              </div>
            </Card>
          )}
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <StandMap
            fairId={fairId}
            selectable={true}
            showOnlyAvailable={true}
            onStandSelect={handleStandSelect}
          />
          {selectedStand && (
            <Card className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Stand {selectedStand.standNumber} Selecionado
                  </div>
                  {selectedStand.price && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Preço: R${" "}
                      {formatCurrencyFromCents(selectedStand.price * 100)}
                    </div>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200"
                >
                  Selecionado
                </Badge>
              </div>
            </Card>
          )}
        </div>
      )}

      {error && <div className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</div>}

      <div className="text-sm text-gray-500 dark:text-gray-400">
        {availableStands.length} stand(s) disponível(is) nesta feira
      </div>
    </div>
  );
};
