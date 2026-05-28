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
    totalRecebido: number;
    totalAReceber: number;
    totalVencido: number;
    inadimplencia: number;
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
    isProfitable: boolean;
  };
  visitantes: {
    total: number;
    checkins: number;
    taxaComparecimento: number;
    custoPorVisitante: number;
    custoPorStand: number;
  };
}
