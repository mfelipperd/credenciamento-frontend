import { useState, useEffect, Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy loading para melhorar performance
const FinancePage = lazy(() => import("../Finance/page").then(module => ({ default: module.FinancePage })));
const ExpensesPage = lazy(() => import("../Expenses/page"));
const CashFlow = lazy(() => import("./components/CashFlow").then(module => ({ default: module.CashFlow })));

// Componente de loading skeleton para as tabs
const TabLoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-6 border rounded-lg">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="p-6 border rounded-lg">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export function FinanceiroPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("cashflow");

  // Ler tab da URL ou usar padrão
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && ["cashflow", "receitas", "despesas"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Atualizar URL quando tab muda
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("tab", value);
    setSearchParams(newSearchParams, { replace: true });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financeiro</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gestão completa do fluxo financeiro da feira
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <TabsTrigger 
            value="cashflow" 
            className="flex items-center gap-2 cursor-pointer data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400 transition-all duration-200"
          >
            <TrendingUp className="h-4 w-4" />
            Fluxo de Caixa
          </TabsTrigger>
          <TabsTrigger 
            value="receitas" 
            className="flex items-center gap-2 cursor-pointer data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-600 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-green-400 transition-all duration-200"
          >
            <DollarSign className="h-4 w-4" />
            Receitas
          </TabsTrigger>
          <TabsTrigger 
            value="despesas" 
            className="flex items-center gap-2 cursor-pointer data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-red-600 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-red-400 transition-all duration-200"
          >
            <CreditCard className="h-4 w-4" />
            Despesas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cashflow" className="space-y-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <CashFlow />
          </Suspense>
        </TabsContent>

        <TabsContent value="receitas" className="space-y-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <FinancePage />
          </Suspense>
        </TabsContent>

        <TabsContent value="despesas" className="space-y-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <ExpensesPage />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
