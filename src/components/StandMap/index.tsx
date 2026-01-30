import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStandService } from "@/service/stands.service";
import type { Stand } from "@/interfaces/finance";

interface StandMapProps {
  fairId: string;
  onStandSelect?: (stand: Stand) => void;
  onCreateRevenue?: (standNumber: number) => void; // Nova prop para abrir sheet
  selectable?: boolean;
  showOnlyAvailable?: boolean;
}

export const StandMap: React.FC<StandMapProps> = ({
  fairId,
  onStandSelect,
  onCreateRevenue,
  selectable = false,
  showOnlyAvailable = false,
}) => {
  const [stands, setStands] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { getStands, getAvailableStands, unlinkStandFromRevenue } =
    useStandService();

  const loadStands = async () => {
    setLoading(true);
    try {
      const result = showOnlyAvailable
        ? await getAvailableStands(fairId)
        : await getStands(fairId);
      if (result) {
        setStands(result);
      }
    } catch (error) {
      console.error("Erro ao carregar stands:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fairId, showOnlyAvailable]);

  useEffect(() => {
    loadStands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStandClick = (stand: Stand) => {
    if (selectable && stand.isAvailable && onStandSelect) {
      onStandSelect(stand);
      return;
    }

    // Se o stand está disponível e temos função para criar receita, abre o sheet
    if (stand.isAvailable && onCreateRevenue) {
      onCreateRevenue(stand.standNumber);
      return;
    }

    // Caso contrário, abre o modal de detalhes
    setSelectedStand(stand);
    setDialogOpen(true);
  };

  const handleUnlinkStand = async (standId: string) => {
    try {
      await unlinkStandFromRevenue(standId);
      await loadStands();
      setDialogOpen(false);
    } catch (error) {
      console.error("Erro ao desvincular stand:", error);
    }
  };

  const getStandColor = (stand: Stand) => {
    if (stand.isAvailable) {
      // Available stands - vibrant logo-consistent green
      return "bg-emerald-500/20 border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 font-bold";
    } else if (stand.revenueStatus) {
      // Stand vendido com receita - usar cores baseadas no status (darker palette)
      switch (stand.revenueStatus) {
        case "PAGO":
          // Paid - vibrant green (logo theme)
          return "bg-green-600/30 border-green-500/50 hover:bg-green-600/40 text-green-200 font-bold";
        case "EM_ANDAMENTO":
          // In progress - darker yellow/amber
          return "bg-amber-600/30 border-amber-500/50 hover:bg-amber-600/40 text-amber-200 font-bold";
        case "EM_ATRASO":
          // Overdue - darker red
          return "bg-red-700/30 border-red-600/50 hover:bg-red-700/40 text-red-200 font-bold";
        case "PENDENTE":
          // Pending - darker orange
          return "bg-orange-600/30 border-orange-500/50 hover:bg-orange-600/40 text-orange-200 font-bold";
        case "CANCELADO":
          // Canceled - darker gray
          return "bg-slate-600/30 border-slate-500/50 hover:bg-slate-600/40 text-slate-300 font-bold";
        default:
          return "bg-green-600/30 border-green-500/50 hover:bg-green-600/40 text-green-200 font-bold";
      }
    } else {
      // Stand ocupado/reservado (sem receita) - darker red
      return "bg-red-800/30 border-red-700/50 hover:bg-red-800/40 text-red-300 font-bold";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "PAGO":
        return "text-blue-600 dark:text-blue-400";
      case "EM_ANDAMENTO":
        return "text-yellow-600 dark:text-yellow-400";
      case "EM_ATRASO":
        return "text-red-600 dark:text-red-400";
      case "PENDENTE":
        return "text-orange-600 dark:text-orange-400";
      case "CANCELADO":
        return "text-gray-600 dark:text-gray-400";
      default:
        return "text-red-600 dark:text-red-400";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "PAGO":
        return "Pago";
      case "EM_ANDAMENTO":
        return "Em Andamento";
      case "EM_ATRASO":
        return "Em Atraso";
      case "PENDENTE":
        return "Pendente";
      case "CANCELADO":
        return "Cancelado";
      default:
        return "Ocupado";
    }
  };

  const getHoverInfo = (stand: Stand) => {
    if (stand.isAvailable) {
      return `Stand ${stand.standNumber} - Disponível\nClique para criar receita`;
    } else if (stand.clientName) {
      // Stand vendido com dados do cliente
      let info = `Stand ${stand.standNumber} - ${stand.clientName}`;

      if (stand.revenueStatus) {
        const statusMap = {
          PAGO: "Pago",
          EM_ANDAMENTO: "Em Andamento",
          EM_ATRASO: "Em Atraso",
          PENDENTE: "Pendente",
          CANCELADO: "Cancelado",
        };
        info += `\nStatus: ${
          statusMap[stand.revenueStatus] || stand.revenueStatus
        }`;
      }

      if (stand.contractValue) {
        info += `\nValor: R$ ${(stand.contractValue / 100).toFixed(2)}`;
      }

      if (stand.numberOfInstallments) {
        info += `\nParcelas: ${stand.numberOfInstallments}x`;
      }

      if (stand.paymentMethod) {
        info += `\nPagamento: ${stand.paymentMethod}`;
      }

      if (stand.clientPhone) {
        info += `\nTelefone: ${stand.clientPhone}`;
      }

      if (stand.clientEmail) {
        info += `\nEmail: ${stand.clientEmail}`;
      }

      if (stand.clientCnpj) {
        info += `\nCNPJ: ${stand.clientCnpj}`;
      }

      return info;
    } else {
      // Stand ocupado sem dados do cliente
      return `Stand ${stand.standNumber} - Ocupado\nRevenueId: ${
        stand.revenueId || "N/A"
      }\nClique para ver detalhes`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Organizar stands em grid (matriz)
  const standsPerRow = 12;

  return (
    <div className="space-y-4">
      {/* Legenda expandida */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
          <span>Pago</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
          <span>Em Andamento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
          <span>Pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
          <span>Em Atraso</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
          <span>Cancelado</span>
        </div>
        <span className="ml-4">Total: {stands.length} stands</span>
      </div>

      {/* Matriz de Stands */}
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${standsPerRow}, 1fr)` }}
      >
        {stands.map((stand) => (
          <div
            key={stand.id}
            className={`
              w-10 h-10 flex items-center justify-center cursor-pointer transition-all duration-200
              border-2 rounded text-xs font-bold relative group
              ${getStandColor(stand)}
              ${
                selectable && !stand.isAvailable
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }
            `}
            onClick={() => handleStandClick(stand)}
            title={getHoverInfo(stand)}
          >
            {stand.standNumber}

            {/* Tooltip hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              {getHoverInfo(stand)}
            </div>
          </div>
        ))}
      </div>

      {/* Modal simples para detalhes */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border dark:border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              Stand #{selectedStand?.standNumber}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              {selectedStand?.isAvailable
                ? "Stand disponível"
                : "Stand ocupado"}
            </DialogDescription>
          </DialogHeader>

          {selectedStand && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 dark:text-white">Status:</span>
                <span
                  className={
                    selectedStand.isAvailable
                      ? "text-green-600 dark:text-green-400"
                      : getStatusColor(selectedStand.revenueStatus)
                  }
                >
                  {selectedStand.isAvailable
                    ? "Disponível"
                    : getStatusLabel(selectedStand.revenueStatus)}
                </span>
              </div>

              {!selectedStand.isAvailable && selectedStand.clientName && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">
                    Informações do Cliente:
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span className="font-medium">Nome:</span>
                      <span>{selectedStand.clientName}</span>
                    </div>

                    {selectedStand.clientCnpj && (
                      <div className="flex justify-between">
                        <span className="font-medium">CNPJ:</span>
                        <span>{selectedStand.clientCnpj}</span>
                      </div>
                    )}

                    {selectedStand.clientEmail && (
                      <div className="flex justify-between">
                        <span className="font-medium">Email:</span>
                        <span className="break-all">
                          {selectedStand.clientEmail}
                        </span>
                      </div>
                    )}

                    {selectedStand.clientPhone && (
                      <div className="flex justify-between">
                        <span className="font-medium">Telefone:</span>
                        <span>{selectedStand.clientPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!selectedStand.isAvailable && selectedStand.contractValue && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">
                    Informações Financeiras:
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span className="font-medium">Valor do Contrato:</span>
                      <span>
                        R$ {(selectedStand.contractValue / 100).toFixed(2)}
                      </span>
                    </div>

                    {selectedStand.numberOfInstallments && (
                      <div className="flex justify-between">
                        <span className="font-medium">Parcelas:</span>
                        <span>{selectedStand.numberOfInstallments}x</span>
                      </div>
                    )}

                    {selectedStand.paymentMethod && (
                      <div className="flex justify-between">
                        <span className="font-medium">Forma de Pagamento:</span>
                        <span>{selectedStand.paymentMethod}</span>
                      </div>
                    )}

                    {selectedStand.entryModelName && (
                      <div className="flex justify-between">
                        <span className="font-medium">Tipo de Stand:</span>
                        <span>{selectedStand.entryModelName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!selectedStand.isAvailable &&
                (selectedStand.condition || selectedStand.notes) && (
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">
                      Observações:
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      {selectedStand.condition && (
                        <div>
                          <span className="font-medium">Condições:</span>
                          <p className="mt-1">{selectedStand.condition}</p>
                        </div>
                      )}

                      {selectedStand.notes && (
                        <div>
                          <span className="font-medium">Notas:</span>
                          <p className="mt-1">{selectedStand.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {selectedStand.revenueId && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Revenue ID: {selectedStand.revenueId}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedStand && !selectedStand.isAvailable && (
              <Button
                variant="destructive"
                onClick={() => handleUnlinkStand(selectedStand.id)}
                size="sm"
              >
                Liberar Stand
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => setDialogOpen(false)}
              size="sm"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
