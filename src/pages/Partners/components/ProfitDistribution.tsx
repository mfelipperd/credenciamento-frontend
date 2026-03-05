import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDistributeProfit } from "@/hooks/useFairPartners";
import { useFairs } from "@/hooks/useFairs";
import { AlertCircle, DollarSign, TrendingUp, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ProfitDistribution: React.FC = () => {
  const [selectedFairId, setSelectedFairId] = useState<string>("");
  const [distributionResult, setDistributionResult] = useState<any>(null);

  const { data: fairs } = useFairs();
  const distributeProfitMutation = useDistributeProfit();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleDistributeProfit = async () => {
    if (!selectedFairId) return;

    try {
      const result = await distributeProfitMutation.mutateAsync(selectedFairId);
      setDistributionResult(result);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const selectedFair = fairs?.find(fair => fair.id === selectedFairId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Distribuição de Lucros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Selecionar Feira
              </label>
              <Select value={selectedFairId} onValueChange={setSelectedFairId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma feira para distribuir lucros" />
                </SelectTrigger>
                <SelectContent>
                  {fairs?.map((fair) => (
                    <SelectItem key={fair.id} value={fair.id}>
                      {fair.name} - {fair.startDate ? new Date(fair.startDate).getFullYear() : 'N/A'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleDistributeProfit}
                disabled={!selectedFairId || distributeProfitMutation.isPending}
                className="w-full"
              >
                {distributeProfitMutation.isPending ? "Distribuindo..." : "Distribuir Lucros"}
              </Button>
            </div>
          </div>

          {selectedFair && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Feira selecionada:</strong> {selectedFair.name} - {selectedFair.startDate ? new Date(selectedFair.startDate).getFullYear() : 'N/A'}
                <br />
                <strong>Atenção:</strong> Esta ação irá distribuir o lucro da feira entre todos os sócios ativos 
                baseado em suas porcentagens de participação. Esta ação não pode ser desfeita.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Resultado da Distribuição */}
      {distributionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Resultado da Distribuição
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Lucro Total
                      </p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {formatCurrency(distributionResult.totalProfit)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Sócios Participantes
                      </p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {distributionResult.distribution.length}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                        Feira
                      </p>
                      <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                        {selectedFair?.name}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Tabela de Distribuição */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Detalhamento da Distribuição</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sócio</TableHead>
                        <TableHead>Porcentagem</TableHead>
                        <TableHead>Valor Recebido</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {distributionResult.distribution.map((partner: any) => (
                        <TableRow key={partner.partnerId}>
                          <TableCell className="font-medium">
                            {partner.partnerName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {formatPercentage(partner.percentage)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-green-600">
                            {formatCurrency(partner.share)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">
                              Distribuído
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Validação */}
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">Validação da Distribuição</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total Distribuído:</span>
                    <span className="ml-2 font-semibold">
                      {formatCurrency(
                        distributionResult.distribution.reduce((sum: number, p: any) => sum + p.share, 0)
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total de Porcentagens:</span>
                    <span className="ml-2 font-semibold">
                      {formatPercentage(
                        distributionResult.distribution.reduce((sum: number, p: any) => sum + p.percentage, 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
