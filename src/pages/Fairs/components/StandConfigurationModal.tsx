import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRequiredExpenses } from "@/hooks/useRequiredExpenses";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calculator, 
  BarChart3, 
  DollarSign, 
  Target,
  AlertCircle,
  Edit
} from "lucide-react";
import type { StandConfiguration, UpdateStandConfigurationDto } from "@/interfaces/fairs";

const updateStandConfigurationSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo").optional(),
  width: z.number().min(0.1, "Largura deve ser maior que 0").max(20, "Largura máxima é 20m").optional(),
  height: z.number().min(0.1, "Altura deve ser maior que 0").max(20, "Altura máxima é 20m").optional(),
  quantity: z.number().min(1, "Quantidade deve ser pelo menos 1").max(1000, "Quantidade máxima é 1000").optional(),
  pricePerSquareMeter: z.number().min(0, "Preço não pode ser negativo").optional(),
  setupCostPerSquareMeter: z.number().min(0, "Custo não pode ser negativo").optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
}).refine((data) => {
  if (data.pricePerSquareMeter && data.setupCostPerSquareMeter) {
    return data.pricePerSquareMeter > data.setupCostPerSquareMeter;
  }
  return true;
}, {
  message: "Preço por m² deve ser maior que custo de montagem por m²",
  path: ["pricePerSquareMeter"],
});

interface StandConfigurationModalProps {
  config: StandConfiguration;
  onClose: () => void;
  onUpdate: (data: UpdateStandConfigurationDto) => void;
  fairId: string;
}

export function StandConfigurationModal({ config, onClose, onUpdate, fairId }: StandConfigurationModalProps) {
  const [calculatedMetrics, setCalculatedMetrics] = useState({
    area: 0,
    totalPrice: 0,
    totalSetupCost: 0,
    profitPerStand: 0,
    profitMargin: 0,
    efficiency: 0,
    requiredExpensesPerSquareMeter: 0,
    totalRequiredExpenses: 0,
  });

  // Buscar despesas das categorias obrigatórias
  const { data: requiredExpenses, isLoading: isLoadingRequiredExpenses, error: requiredExpensesError } = useRequiredExpenses(fairId);
  
  // Debug: verificar os dados das despesas obrigatórias
  console.log('StandConfigurationModal - requiredExpenses:', requiredExpenses);
  console.log('StandConfigurationModal - isLoadingRequiredExpenses:', isLoadingRequiredExpenses);
  console.log('StandConfigurationModal - requiredExpensesError:', requiredExpensesError);

  const form = useForm<UpdateStandConfigurationDto>({
    resolver: zodResolver(updateStandConfigurationSchema),
    defaultValues: {
      name: config.name,
      width: config.width,
      height: config.height,
      quantity: config.quantity,
      pricePerSquareMeter: config.pricePerSquareMeter,
      setupCostPerSquareMeter: config.setupCostPerSquareMeter,
      description: config.description || "",
      isActive: config.isActive,
    },
  });

  // Calcular métricas automaticamente
  useEffect(() => {
    const subscription = form.watch((value) => {
      const { width, height, quantity, pricePerSquareMeter, setupCostPerSquareMeter } = value;
      
      if (width && height && quantity && pricePerSquareMeter !== undefined && setupCostPerSquareMeter !== undefined) {
        const area = width * height;
        const totalPrice = area * pricePerSquareMeter;
        
        // Calcular despesas obrigatórias
        const totalRequiredExpenses = requiredExpenses?.totalValue || 0;
        const totalArea = requiredExpenses?.totalArea || 1; // Evitar divisão por zero
        
        // Dividir o total das despesas obrigatórias pela quantidade de stands e depois pelo m²
        const requiredExpensesPerSquareMeter = totalRequiredExpenses / totalArea;
        
        // Calcular custo total (custo de montagem + despesas obrigatórias por m²)
        const totalSetupCost = area * setupCostPerSquareMeter;
        const totalRequiredExpensesForStand = area * (requiredExpensesPerSquareMeter / 100); // Converter de centavos para reais
        const totalCostWithRequired = totalSetupCost + totalRequiredExpensesForStand;
        
        const profitPerStand = totalPrice - totalCostWithRequired;
        const profitMargin = totalPrice > 0 ? (profitPerStand / totalPrice) * 100 : 0;
        const efficiency = area > 0 ? profitPerStand / area : 0;

        const metrics = {
          area,
          totalPrice,
          totalSetupCost: totalCostWithRequired,
          profitPerStand,
          profitMargin,
          efficiency,
          requiredExpensesPerSquareMeter,
          totalRequiredExpenses: totalRequiredExpensesForStand,
        };

        console.log('StandConfigurationModal - Calculated metrics:', metrics);
        console.log('StandConfigurationModal - Required expenses data:', {
          totalRequiredExpenses,
          totalArea,
          requiredExpensesPerSquareMeter,
          totalRequiredExpensesForStand
        });

        setCalculatedMetrics(metrics);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, requiredExpenses]);

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'R$ 0,00';
    }
    // Para despesas obrigatórias, os valores já vêm em centavos do backend
    // Para valores calculados no frontend (como preços), já estão em reais
    const valueInReais = Number(value);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valueInReais);
  };

  const formatCurrencyFromCents = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'R$ 0,00';
    }
    // Converter de centavos para reais
    const valueInReais = Number(value) / 100;
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

  const handleSubmit = (data: UpdateStandConfigurationDto) => {
    onUpdate(data);
  };

  const getProfitMarginColor = (margin: number) => {
    if (margin >= 60) return 'text-green-600 dark:text-green-400';
    if (margin >= 40) return 'text-yellow-600 dark:text-yellow-400';
    if (margin >= 20) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="min-w-[50vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Edit className="h-5 w-5 mr-2" />
            Editar Configuração: {config.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {/* Nome */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Configuração</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Stand 2x3 Premium"
                          {...field}
                          className="bg-gray-50 dark:bg-gray-800"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dimensões */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Largura (metros)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="20"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="bg-gray-50 dark:bg-gray-800"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Altura (metros)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="20"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="bg-gray-50 dark:bg-gray-800"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Quantidade */}
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade Disponível</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="1000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="bg-gray-50 dark:bg-gray-800"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preços */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pricePerSquareMeter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço por m² (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="bg-gray-50 dark:bg-gray-800"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="setupCostPerSquareMeter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custo de Montagem por m² (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="bg-gray-50 dark:bg-gray-800"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Descrição */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva as características do stand..."
                          {...field}
                          className="bg-gray-50 dark:bg-gray-800"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status Ativo */}
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Configuração Ativa</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Botões */}
                <div className="flex space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Métricas Calculadas */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Calculator className="h-5 w-5 mr-2" />
                  Métricas Calculadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Área */}
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Área por Stand
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-800 dark:text-blue-200">
                    {(calculatedMetrics.area || 0).toFixed(1)}m²
                  </span>
                </div>

                {/* Preço Total */}
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Preço Total
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-800 dark:text-green-200">
                    {formatCurrency(calculatedMetrics.totalPrice)}
                  </span>
                </div>

                {/* Despesas Obrigatórias por m² */}
                <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mr-2" />
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                      Despesas Obrigatórias/m²
                    </span>
                  </div>
                  <span className="text-lg font-bold text-orange-800 dark:text-orange-200">
                    {formatCurrencyFromCents(calculatedMetrics.requiredExpensesPerSquareMeter)}
                  </span>
                </div>

                {/* Despesas Obrigatórias Total para o Stand */}
                <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                    <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                      Despesas Obrigatórias Total
                    </span>
                  </div>
                  <span className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                    {formatCurrency(calculatedMetrics.totalRequiredExpenses)}
                  </span>
                </div>

                {/* Custo Total */}
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">
                      Custo Total (incl. obrigatórias)
                    </span>
                  </div>
                  <span className="text-lg font-bold text-red-800 dark:text-red-200">
                    {formatCurrency(calculatedMetrics.totalSetupCost)}
                  </span>
                </div>

                {/* Lucro por Stand */}
                <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-2" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      Lucro por Stand
                    </span>
                  </div>
                  <span className="text-lg font-bold text-purple-800 dark:text-purple-200">
                    {formatCurrency(calculatedMetrics.profitPerStand)}
                  </span>
                </div>

                {/* Margem de Lucro */}
                <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 text-orange-600 dark:text-orange-400 mr-2" />
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                      Margem de Lucro
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${getProfitMarginColor(calculatedMetrics.profitMargin)}`}>
                    {formatPercentage(calculatedMetrics.profitMargin)}
                  </span>
                </div>

                {/* Eficiência */}
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Eficiência
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {formatCurrency(calculatedMetrics.efficiency)}/m²
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Validações */}
            {calculatedMetrics.profitMargin < 20 && (
              <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center text-yellow-800 dark:text-yellow-200">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">
                      Margem de lucro baixa. Considere ajustar os preços.
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {calculatedMetrics.totalPrice <= calculatedMetrics.totalSetupCost && (
              <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center text-red-800 dark:text-red-200">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">
                      Preço por m² deve ser maior que custo de montagem.
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
