import { useSearchParams } from "react-router-dom";
import { useCookie } from "@/hooks/useCookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MapPin, 
  BarChart3,
  Plus,
  Eye,
  Settings
} from "lucide-react";
import type { Fair } from "@/interfaces/fairs";

interface FairListProps {
  fairs: Fair[];
}

export function FairList({ fairs }: FairListProps) {
  const [, setSearchParams] = useSearchParams();
  const [, setSavedFairId] = useCookie("selectedFairId", "", { days: 30 });

  const handleSelectFair = (fairId: string) => {
    setSearchParams({ fairId });
    setSavedFairId(fairId);
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'R$ 0,00';
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  };

  const getProfitMarginColor = (margin: number) => {
    if (margin >= 60) return 'text-green-600 dark:text-green-400';
    if (margin >= 40) return 'text-yellow-600 dark:text-yellow-400';
    if (margin >= 20) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Suas Feiras
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {fairs.length} feira{fairs.length !== 1 ? 's' : ''} encontrada{fairs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nova Feira
        </Button>
      </div>

      {/* Grid de Feiras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fairs.map((fair) => (
          <Card 
            key={fair.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => handleSelectFair(fair.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {fair.name}
                  </CardTitle>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="truncate">{fair.location}</span>
                  </div>
                </div>
                <Badge className={getStatusColor(fair.isActive)}>
                  {fair.isActive ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Data */}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(fair.date)}</span>
                {fair.endDate && (
                  <>
                    <span className="mx-2">-</span>
                    <span>{formatDate(fair.endDate)}</span>
                  </>
                )}
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {fair.totalStands}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    Total de Stands
                  </div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className={`text-2xl font-bold ${getProfitMarginColor(fair.expectedProfitMargin)}`}>
                    {fair.expectedProfitMargin.toFixed(1)}%
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    Margem Esperada
                  </div>
                </div>
              </div>

              {/* Receita e Lucro */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Receita Esperada:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(fair.expectedRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Lucro Esperado:</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {formatCurrency(fair.expectedProfit)}
                  </span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex space-x-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectFair(fair.id);
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Visualizar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implementar edição
                  }}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {fairs.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <BarChart3 className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma feira encontrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Crie sua primeira feira para começar a gerenciar stands e análises.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeira Feira
          </Button>
        </Card>
      )}
    </div>
  );
}
