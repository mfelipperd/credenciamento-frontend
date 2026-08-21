export interface ApexDonutData {
  series: number[];
  labels: string[];
  colors: string[];
  total: number;
}

export interface ApexBarData {
  series: { name: string; data: number[] }[];
  categories: string[];
}

export interface FairKpi {
  receita: {
    totalContrato: number;
    contratosValidos: number;
    ticketMedio: number;
    totalRecebido: number;
    totalAReceber: number;
    totalVencido: number;
    inadimplencia: number;
    taxaRecebimento: number;
  };
  despesas: {
    total: number;
    diretas: number;
    rateadas: number;
  };
  resultado: {
    lucroProjetado: number;
    lucroRealizado: number;
    margemProjetada: number;
    margemRealizada: number;
    despesasSobreReceita: number;
    isProfitable: boolean;
  };
  visitantes: {
    total: number;
    checkins: number;
    taxaComparecimento: number;
    custoPorVisitante: number;
    custoPorStand: number;
  };
  impostos: {
    cnae: "8230-0/01";
    annex: "III" | "V";
    annualRevenue: number | null;
    annualAmount: number | null;
    amount: number | null;
    rbt12: number | null;
    rbt12Complete: boolean;
    bracket: number | null;
    nominalRate: number | null;
    deduction: number | null;
    effectiveRate: number | null;
    message: string;
  };
}
