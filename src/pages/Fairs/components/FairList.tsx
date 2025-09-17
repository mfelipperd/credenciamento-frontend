import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
// Removed unused Table imports
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import type { Fair, FairFilters } from "@/interfaces/fairs";

interface FairListProps {
  fairs: Fair[];
  isLoading: boolean;
  onEdit: (fair: Fair) => void;
  onDelete: (fair: Fair) => void;
  onView: (fair: Fair) => void;
  onToggleActive: (fair: Fair) => void;
  onFiltersChange: (filters: Partial<FairFilters>) => void;
  filters: FairFilters;
}

export const FairList: React.FC<FairListProps> = ({
  fairs,
  isLoading,
  onEdit,
  onDelete,
  onView,
  onToggleActive,
  onFiltersChange,
  filters,
}) => {
  const [selectedFair, setSelectedFair] = useState<Fair | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? "Ativa" : "Inativa";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar feiras..."
                value={filters.search || ""}
                onChange={(e) => onFiltersChange({ search: e.target.value })}
                className="max-w-md"
              />
            </div>
            <select
              value={filters.isActive === undefined ? "all" : filters.isActive.toString()}
              onChange={(e) => {
                const value = e.target.value;
                onFiltersChange({
                  isActive: value === "all" ? undefined : value === "true",
                });
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            >
              <option value="all">Todas</option>
              <option value="true">Ativas</option>
              <option value="false">Inativas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Feiras */}
      {fairs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Nenhuma feira encontrada
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fairs.map((fair) => (
            <Card key={fair.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{fair.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                        {fair.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(fair.isActive)}>
                      {getStatusLabel(fair.isActive)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(fair)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(fair)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleActive(fair)}>
                          {fair.isActive ? (
                            <ToggleLeft className="h-4 w-4 mr-2" />
                          ) : (
                            <ToggleRight className="h-4 w-4 mr-2" />
                          )}
                          {fair.isActive ? "Desativar" : "Ativar"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(fair)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Datas */}
                {fair.startDate && fair.endDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(fair.startDate)} - {formatDate(fair.endDate)}
                    </span>
                  </div>
                )}

                {/* Horários */}
                {fair.startTime && fair.endTime && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {fair.startTime} - {fair.endTime}
                    </span>
                  </div>
                )}

                {/* Informações Financeiras */}
                <div className="space-y-2">
                  {fair.totalStands && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {fair.totalStands} stands
                      </span>
                    </div>
                  )}

                  {fair.expectedRevenue && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Receita: {formatCurrency(fair.expectedRevenue)}
                      </span>
                    </div>
                  )}

                  {fair.expectedProfit && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Lucro: {formatCurrency(fair.expectedProfit)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Localização */}
                {fair.city && fair.state && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {fair.city}, {fair.state}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedFair && (
        <Dialog open={!!selectedFair} onOpenChange={() => setSelectedFair(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedFair.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Localização</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedFair.location}
                  </p>
                  {selectedFair.address && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedFair.address}
                    </p>
                  )}
                  {selectedFair.city && selectedFair.state && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedFair.city}, {selectedFair.state}
                    </p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Status</h4>
                  <Badge className={getStatusColor(selectedFair.isActive)}>
                    {getStatusLabel(selectedFair.isActive)}
                  </Badge>
                </div>
              </div>

              {(selectedFair.startDate || selectedFair.endDate) && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Período</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedFair.startDate && formatDate(selectedFair.startDate)}
                    {selectedFair.startDate && selectedFair.endDate && " - "}
                    {selectedFair.endDate && formatDate(selectedFair.endDate)}
                  </p>
                </div>
              )}

              {(selectedFair.expectedRevenue || selectedFair.expectedProfit) && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Informações Financeiras</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedFair.expectedRevenue && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Receita Esperada:</span>
                        <span className="ml-2 font-medium">
                          {formatCurrency(selectedFair.expectedRevenue)}
                        </span>
                      </div>
                    )}
                    {selectedFair.expectedProfit && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Lucro Esperado:</span>
                        <span className="ml-2 font-medium">
                          {formatCurrency(selectedFair.expectedProfit)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedFair.standConfigurations && selectedFair.standConfigurations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Configurações de Stands</h4>
                  <div className="space-y-2">
                    {selectedFair.standConfigurations.map((config, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{config.name}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {config.width}m x {config.height}m - {config.quantity} unidades
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-medium">
                              {formatCurrency(config.width * config.height * config.quantity * config.pricePerSquareMeter)}
                            </div>
                            <div className="text-gray-500">
                              {formatCurrency(config.pricePerSquareMeter)}/m²
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};