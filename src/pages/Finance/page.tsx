import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { PageTabsList, PageTabsTrigger } from "@/components/ui/page-tabs";
import { DollarSign, TrendingUp, Wallet } from "lucide-react";
import { ReceitasTabContent } from "./ReceitasTabContent";
import { DespesasTabContent } from "../Expenses/DespesasTabContent";

export function FinancePage() {
  const [mainTab, setMainTab] = useState<"receitas" | "despesas">("receitas");

  return (
    <div className="space-y-6">
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as "receitas" | "despesas")}>
        <div className="flex flex-col gap-4 mb-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-end md:shrink-0">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-brand-pink" />
              GESTÃO <span className="text-brand-cyan">FINANCEIRA</span>
            </h1>
            <div className="h-1.5 w-24 bg-linear-to-r from-brand-pink to-brand-cyan rounded-full" />
          </div>
          <PageTabsList className="self-start md:self-auto">
            <PageTabsTrigger value="receitas">
              <TrendingUp className="h-4 w-4" />
              Receitas
            </PageTabsTrigger>
            <PageTabsTrigger value="despesas">
              <Wallet className="h-4 w-4" />
              Despesas
            </PageTabsTrigger>
          </PageTabsList>
          <div className="hidden md:block" />
        </div>
      </Tabs>

      {mainTab === "receitas" ? <ReceitasTabContent /> : <DespesasTabContent />}
    </div>
  );
}
