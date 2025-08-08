import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFinanceService } from "@/service/finance.service";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface FinanceChartsProps {
  fairId: string;
  dateFrom?: string;
  dateTo?: string;
}

export function FinanceCharts({
  fairId,
  dateFrom,
  dateTo,
}: FinanceChartsProps) {
  const [granularity, setGranularity] = useState<"month" | "day" | "week">(
    "month"
  );
  const financeService = useFinanceService();

  // Query para contratos por período
  const { data: contractsData, isLoading: isLoadingContracts } = useQuery({
    queryKey: ["contracts-by-period", fairId, granularity, dateFrom, dateTo],
    queryFn: () =>
      financeService.getContractsByPeriod(
        fairId,
        granularity,
        dateFrom,
        dateTo
      ),
    enabled: !!fairId,
  });

  // Query para recebido por período
  const { data: receivedData, isLoading: isLoadingReceived } = useQuery({
    queryKey: ["received-by-period", fairId, granularity, dateFrom, dateTo],
    queryFn: () =>
      financeService.getReceivedByPeriod(fairId, granularity, dateFrom, dateTo),
    enabled: !!fairId,
  });

  // Query para receitas por tipo
  const { data: revenuesByType, isLoading: isLoadingTypes } = useQuery({
    queryKey: ["revenues-by-type", fairId, dateFrom, dateTo],
    queryFn: () => financeService.getRevenuesByType(fairId, dateFrom, dateTo),
    enabled: !!fairId,
  });

  // Configuração do gráfico de linha (contratos e recebido por período)
  const lineChartOptions: ApexOptions = {
    chart: {
      height: 350,
      type: "line",
      background: "transparent",
      toolbar: {
        show: false,
      },
    },
    theme: {
      mode: "dark",
    },
    stroke: {
      width: 3,
      curve: "smooth",
    },
    colors: ["#3b82f6", "#10b981"],
    xaxis: {
      categories: contractsData?.map((item) => item.period) || [],
      labels: {
        style: {
          colors: "#9ca3af",
        },
      },
    },
    yaxis: [
      {
        title: {
          text: "Valor Contratado",
          style: {
            color: "#9ca3af",
          },
        },
        labels: {
          style: {
            colors: "#9ca3af",
          },
          formatter: (value) => {
            return new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
              minimumFractionDigits: 0,
            }).format(value / 100);
          },
        },
      },
      {
        opposite: true,
        title: {
          text: "Valor Recebido",
          style: {
            color: "#9ca3af",
          },
        },
        labels: {
          style: {
            colors: "#9ca3af",
          },
          formatter: (value) => {
            return new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
              minimumFractionDigits: 0,
            }).format(value / 100);
          },
        },
      },
    ],
    grid: {
      borderColor: "#374151",
    },
    legend: {
      labels: {
        colors: "#9ca3af",
      },
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (value) => {
          return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(value / 100);
        },
      },
    },
  };

  const lineChartSeries = [
    {
      name: "Contratado",
      data: contractsData?.map((item) => item.totalContrato || 0) || [],
      yAxisIndex: 0,
    },
    {
      name: "Recebido",
      data: receivedData?.map((item) => item.totalRecebido || 0) || [],
      yAxisIndex: 1,
    },
  ];

  // Configuração do gráfico de pizza (receitas por tipo)
  const pieChartOptions: ApexOptions = {
    chart: {
      height: 350,
      type: "donut",
      background: "transparent",
    },
    theme: {
      mode: "dark",
    },
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
    labels: revenuesByType?.map((item) => item.tipo) || [],
    legend: {
      labels: {
        colors: "#9ca3af",
      },
      position: "bottom",
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (value) => {
          return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(value / 100);
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "60%",
        },
      },
    },
  };

  const pieChartSeries =
    revenuesByType?.map((item) => item.totalContrato / 100) || [];

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Análise Temporal
        </h3>
        <Select
          value={granularity}
          onValueChange={(value: "month" | "day" | "week") =>
            setGranularity(value)
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Diário</SelectItem>
            <SelectItem value="week">Semanal</SelectItem>
            <SelectItem value="month">Mensal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de linha - Contratos vs Recebido */}
        <Card className="glass-card p-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Contratos vs Recebimentos
          </h4>
          {isLoadingContracts || isLoadingReceived ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <ReactApexChart
              options={lineChartOptions}
              series={lineChartSeries}
              type="line"
              height={350}
            />
          )}
        </Card>

        {/* Gráfico de pizza - Receitas por tipo */}
        <Card className="glass-card p-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Receitas por Tipo
          </h4>
          {isLoadingTypes ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <ReactApexChart
              options={pieChartOptions}
              series={pieChartSeries}
              type="donut"
              height={350}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
