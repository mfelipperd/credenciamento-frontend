import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCookie } from "@/hooks/useCookie";
import { useFairs } from "@/hooks/useFairs";
import { FairDashboard } from "./components/FairDashboard";
import { FairList } from "./components/FairList";
import { FairAnalysis } from "./components/FairAnalysis";
import { StandConfigurations } from "./components/StandConfigurations";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Settings, 
  TrendingUp, 
  Calendar,
  MapPin,
  DollarSign,
  Target
} from "lucide-react";

export function FairsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [savedFairId] = useCookie("selectedFairId", "", { days: 30 });
  
  // Usar fairId da URL ou do cookie como fallback
  const fairId = searchParams.get("fairId") || savedFairId || "";
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: fairs, isLoading: isLoadingFairs, error: fairsError } = useFairs();

  if (isLoadingFairs) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 p-4">
        <div className="container mx-auto max-w-7xl">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (fairsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 p-4">
        <div className="container mx-auto max-w-7xl">
          <Card className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <BarChart3 className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Erro ao carregar feiras
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Não foi possível carregar as feiras. Tente novamente.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (!fairs || fairs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 p-4">
        <div className="container mx-auto max-w-7xl">
          <Card className="p-8 text-center">
            <div className="text-blue-500 mb-4">
              <Calendar className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Nenhuma feira encontrada
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Crie sua primeira feira para começar a gerenciar stands e análises.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Se não há feira selecionada, mostrar lista de feiras
  if (!fairId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 p-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Módulo de Feiras
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie suas feiras, configure stands e analise margens de lucro
            </p>
          </div>
          <FairList fairs={fairs} />
        </div>
      </div>
    );
  }

  // Encontrar a feira selecionada
  const selectedFair = fairs.find(fair => fair.id === fairId);

  if (!selectedFair) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 p-4">
        <div className="container mx-auto max-w-7xl">
          <Card className="p-8 text-center">
            <div className="text-orange-500 mb-4">
              <MapPin className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Feira não encontrada
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              A feira selecionada não foi encontrada.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedFair.name}
              </h1>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{selectedFair.location}</span>
                <span className="mx-2">•</span>
                <Calendar className="h-4 w-4 mr-2" />
                <span>{new Date(selectedFair.date).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedFair.isActive 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {selectedFair.isActive ? 'Ativa' : 'Inativa'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Análise</span>
            </TabsTrigger>
            <TabsTrigger value="stands" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Stands</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <FairDashboard fairId={fairId} />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <FairAnalysis fairId={fairId} />
          </TabsContent>

          <TabsContent value="stands" className="space-y-6">
            <StandConfigurations fairId={fairId} />
          </TabsContent>

          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Configurações da Feira
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Configurações gerais da feira serão implementadas aqui.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
