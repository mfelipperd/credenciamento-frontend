import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WithdrawalsManagement } from "./components/WithdrawalsManagement";
import { ProfitDistribution } from "./components/ProfitDistribution";
import { DollarSign, TrendingUp } from "lucide-react";

export const WithdrawalsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Sistema de Saques
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gerencie distribuição de lucros e solicitações de saques dos sócios
        </p>
      </div>

      <Tabs defaultValue="distribution" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="distribution" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Distribuir Lucros
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Gerenciar Saques
          </TabsTrigger>
        </TabsList>

        <TabsContent value="distribution">
          <ProfitDistribution />
        </TabsContent>

        <TabsContent value="management">
          <WithdrawalsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

