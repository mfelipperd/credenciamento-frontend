import { useState } from "react";
import { useStandConfigurations, useCreateStandConfiguration, useUpdateStandConfiguration, useDeleteStandConfiguration, useToggleStandConfiguration } from "@/hooks/useFairs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  BarChart3,
  AlertCircle
} from "lucide-react";

import type { StandConfiguration, CreateStandConfigurationDto, UpdateStandConfigurationDto } from "@/interfaces/fairs";
import { StandConfigurationForm } from "./StandConfigurationForm";
import { StandConfigurationModal } from "./StandConfigurationModal";

interface StandConfigurationsProps {
  fairId: string;
}

export function StandConfigurations({ fairId }: StandConfigurationsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<StandConfiguration | null>(null);

  const { 
    data: configurations, 
    isLoading, 
    error 
  } = useStandConfigurations(fairId);

  const createMutation = useCreateStandConfiguration();
  const updateMutation = useUpdateStandConfiguration();
  const deleteMutation = useDeleteStandConfiguration();
  const toggleMutation = useToggleStandConfiguration();

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'R$ 0,00';
    }
    // Os valores dos stands já vêm em reais do backend
    const valueInReais = Number(value);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valueInReais);
  };

  const formatPercentage = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.0%';
    }
    return `${Number(value).toFixed(1)}%`;
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'highly_recommended':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-700';
      case 'recommended':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-700';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700';
      case 'not_recommended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'highly_recommended':
        return 'Altamente Recomendado';
      case 'recommended':
        return 'Recomendado';
      case 'moderate':
        return 'Moderado';
      case 'not_recommended':
        return 'Não Recomendado';
      default:
        return 'Indefinido';
    }
  };

  const handleCreate = async (data: CreateStandConfigurationDto) => {
    try {
      await createMutation.mutateAsync({ fairId, data });
      setIsFormOpen(false);
    } catch (error) {
      console.error('Erro ao criar configuração:', error);
    }
  };

  const handleUpdate = async (data: UpdateStandConfigurationDto) => {
    if (!editingConfig) return;
    
    try {
      await updateMutation.mutateAsync({ id: editingConfig.id, data });
      setEditingConfig(null);
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta configuração?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Erro ao remover configuração:', error);
      }
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleMutation.mutateAsync(id);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-500 mb-4">
          <AlertCircle className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Erro ao carregar configurações
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Não foi possível carregar as configurações de stands.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configurações de Stands
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie os tipos de stands disponíveis para esta feira
          </p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Configuração
        </Button>
      </div>

      {/* Grid de Configurações */}
      {configurations && configurations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {configurations.map((config) => (
            <Card 
              key={config.id} 
              className={`transition-all hover:shadow-lg ${
                !config.isActive ? 'opacity-60' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-gray-900 dark:text-white">
                      {config.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {config.width}m × {config.height}m • {config.quantity} unidades
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getRecommendationColor('recommended')}>
                      {getRecommendationText('recommended')}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggle(config.id)}
                      className="p-1"
                    >
                      {config.isActive ? (
                        <ToggleRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Métricas Calculadas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(config.totalPrice)}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      Preço Total
                    </div>
                  </div>
                  <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(config.profitPerStand)}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      Lucro/Stand
                    </div>
                  </div>
                </div>

                {/* Detalhes de Preço */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Preço/m²:</span>
                    <span className="font-medium">{formatCurrency(config.pricePerSquareMeter)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Custo/m²:</span>
                    <span className="font-medium">{formatCurrency(config.setupCostPerSquareMeter)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Margem:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {formatPercentage(config.profitMargin)}
                    </span>
                  </div>
                </div>

                {/* Área e Quantidade */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Área total:</span>
                    <span className="font-medium">
                      {((config.width || 0) * (config.height || 0) * (config.quantity || 0)).toFixed(1)}m²
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditingConfig(config)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(config.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <BarChart3 className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma configuração encontrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Crie sua primeira configuração de stand para começar.
          </p>
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeira Configuração
          </Button>
        </Card>
      )}

      {/* Formulário de Criação */}
      <StandConfigurationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreate}
        title="Nova Configuração de Stand"
        fairId={fairId}
      />

      {/* Modal de Edição */}
      {editingConfig && (
        <StandConfigurationModal
          config={editingConfig}
          onClose={() => setEditingConfig(null)}
          onUpdate={handleUpdate}
          fairId={fairId}
        />
      )}
    </div>
  );
}
