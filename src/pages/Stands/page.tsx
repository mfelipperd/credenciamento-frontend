import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, BarChart3, Map } from "lucide-react";
import { StandMap } from "@/components/StandMap";
import { StandConfigurator } from "@/components/StandConfigurator";
import { useStandService } from "@/service/stands.service";
import type { StandStats } from "@/interfaces/finance";
import { formatCurrencyFromCents } from "@/utils/masks";

interface StandsPageProps {
  fairId: string;
}

export const StandsPage: React.FC<StandsPageProps> = ({ fairId }) => {
  const [stats, setStats] = useState<StandStats | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { getStandStats } = useStandService();

  const loadStats = useCallback(async () => {
    try {
      const result = await getStandStats(fairId);
      if (result) {
        setStats(result);
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  }, [fairId, getStandStats]);

  useEffect(() => {
    loadStats();
  }, [loadStats, refreshKey]);

  const handleConfigSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return "text-red-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciamento de Stands
          </h1>
          <p className="text-gray-600 mt-1">
            Configure e gerencie os stands da feira
          </p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Stands
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.available}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ocupados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.occupied}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Taxa de Ocupação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getOccupancyColor(
                  stats.occupancyRate
                )}`}
              >
                {stats.occupancyRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Receita Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                R$ {formatCurrencyFromCents(stats.totalRevenue * 100)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs principais */}
      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Mapa de Stands
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Layout dos Stands</CardTitle>
              <CardDescription>
                Visualização interativa de todos os stands da feira. Clique em
                um stand para ver detalhes ou gerenciar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StandMap fairId={fairId} key={refreshKey} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span>Receita Total Gerada:</span>
                      <span className="font-bold text-blue-600">
                        R$ {formatCurrencyFromCents(stats.totalRevenue * 100)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Preço Médio por Stand:</span>
                      <span className="font-bold">
                        R$ {formatCurrencyFromCents(stats.averagePrice * 100)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Receita Potencial Total:</span>
                      <span className="font-bold text-green-600">
                        R${" "}
                        {formatCurrencyFromCents(
                          stats.total * stats.averagePrice * 100
                        )}
                      </span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span>Receita Pendente:</span>
                        <span className="font-bold text-orange-600">
                          R${" "}
                          {formatCurrencyFromCents(
                            (stats.total - stats.occupied) *
                              stats.averagePrice *
                              100
                          )}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Carregando estatísticas...
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status dos Stands</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            Disponíveis
                          </Badge>
                          <span>{stats.available} stands</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {((stats.available / stats.total) * 100).toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-800"
                          >
                            Ocupados
                          </Badge>
                          <span>{stats.occupied} stands</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {stats.occupancyRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <strong>Meta recomendada:</strong> 80% de ocupação
                        </p>
                        <p>
                          <strong>Status atual:</strong>{" "}
                          <span
                            className={getOccupancyColor(stats.occupancyRate)}
                          >
                            {stats.occupancyRate >= 80
                              ? "Meta atingida!"
                              : stats.occupancyRate >= 60
                              ? "Próximo da meta"
                              : "Abaixo da meta"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Carregando estatísticas...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <div className="max-w-2xl mx-auto">
            <StandConfigurator
              fairId={fairId}
              onConfigurationChange={handleConfigSuccess}
              currentStandCount={stats?.total || 0}
            />

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Informações Importantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    A configuração criará stands numerados sequencialmente (1,
                    2, 3...).
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    Todos os stands iniciarão como "Disponíveis" e poderão ser
                    vendidos.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    O preço definido será aplicado a todos os stands, mas pode
                    ser alterado individualmente depois.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    <strong>Atenção:</strong> Configurar stands irá substituir
                    qualquer configuração anterior.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
