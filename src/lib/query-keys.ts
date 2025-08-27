// Query Keys centralizadas para toda a aplicação
// Organizadas por módulo para facilitar manutenção e evitar conflitos

export const queryKeys = {
  // Módulo de Despesas
  expenses: {
    all: ["expenses"] as const,
    lists: () => [...queryKeys.expenses.all, "list"] as const,
    list: (filters: any) => [...queryKeys.expenses.lists(), filters] as const,
    details: () => [...queryKeys.expenses.all, "detail"] as const,
    detail: (id: string, fairId: string) => [...queryKeys.expenses.details(), id, fairId] as const,
    totals: () => [...queryKeys.expenses.all, "totals"] as const,
    total: (fairId: string) => [...queryKeys.expenses.totals(), fairId] as const,
    totalByCategory: (fairId: string) => [...queryKeys.expenses.totals(), "by-category", fairId] as const,
    totalByAccount: (fairId: string) => [...queryKeys.expenses.totals(), "by-account", fairId] as const,
    categories: () => [...queryKeys.expenses.all, "categories"] as const,
    categoriesByFair: (fairId: string) => [...queryKeys.expenses.categories(), "by-fair", fairId] as const,
    accounts: () => [...queryKeys.expenses.all, "accounts"] as const,
  },

  // Módulo de Finanças
  finance: {
    all: ["finance"] as const,
    revenues: () => [...queryKeys.finance.all, "revenues"] as const,
    revenuesList: (filters: any) => [...queryKeys.finance.revenues(), "list", filters] as const,
    revenueDetail: (id: string) => [...queryKeys.finance.revenues(), "detail", id] as const,
    kpis: () => [...queryKeys.finance.all, "kpis"] as const,
    kpisByFair: (fairId: string, from?: string, to?: string) => 
      [...queryKeys.finance.kpis(), fairId, from, to] as const,
  },

  // Módulo de Feiras
  fairs: {
    all: ["fairs"] as const,
    list: () => [...queryKeys.fairs.all, "list"] as const,
    detail: (id: string) => [...queryKeys.fairs.all, "detail", id] as const,
    stands: () => [...queryKeys.fairs.all, "stands"] as const,
    standsByFair: (fairId: string) => [...queryKeys.fairs.stands(), "by-fair", fairId] as const,
    standStats: (fairId: string) => [...queryKeys.fairs.stands(), "stats", fairId] as const,
  },

  // Módulo de Usuários
  users: {
    all: ["users"] as const,
    list: () => [...queryKeys.users.all, "list"] as const,
    detail: (id: string) => [...queryKeys.users.all, "detail", id] as const,
    profile: () => [...queryKeys.users.all, "profile"] as const,
  },

  // Módulo de Visitantes
  visitors: {
    all: ["visitors"] as const,
    lists: () => [...queryKeys.visitors.all, "list"] as const,
    list: (filters: any) => [...queryKeys.visitors.lists(), filters] as const,
    details: () => [...queryKeys.visitors.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.visitors.details(), id] as const,
    checkins: () => [...queryKeys.visitors.all, "checkins"] as const,
    checkinsByFair: (fairId: string) => [...queryKeys.visitors.checkins(), "by-fair", fairId] as const,
  },

  // Módulo de Dashboard
  dashboard: {
    all: ["dashboard"] as const,
    overview: (fairId: string) => [...queryKeys.dashboard.all, "overview", fairId] as const,
    conversions: () => [...queryKeys.dashboard.all, "conversions"] as const,
    conversionsByHowDidYouKnow: (fairId: string) => 
      [...queryKeys.dashboard.conversions(), "how-did-you-know", fairId] as const,
    checkinsPerHour: (fairId: string) => [...queryKeys.dashboard.all, "checkins-per-hour", fairId] as const,
    categories: (fairId: string) => [...queryKeys.dashboard.all, "categories", fairId] as const,
    origins: (fairId: string) => [...queryKeys.dashboard.all, "origins", fairId] as const,
    sectors: (fairId: string) => [...queryKeys.dashboard.all, "sectors", fairId] as const,
  },

  // Módulo de Marketing
  marketing: {
    all: ["marketing"] as const,
    campaigns: () => [...queryKeys.marketing.all, "campaigns"] as const,
    analytics: () => [...queryKeys.marketing.all, "analytics"] as const,
  },

  // Módulo de Stands
  stands: {
    all: ["stands"] as const,
    list: () => [...queryKeys.stands.all, "list"] as const,
    listByFair: (fairId: string) => [...queryKeys.stands.list(), "by-fair", fairId] as const,
    detail: (id: string) => [...queryKeys.stands.all, "detail", id] as const,
    config: () => [...queryKeys.stands.all, "config"] as const,
    configByFair: (fairId: string) => [...queryKeys.stands.config(), "by-fair", fairId] as const,
  },

  // Módulo de Autenticação
  auth: {
    all: ["auth"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
    permissions: () => [...queryKeys.auth.all, "permissions"] as const,
    roles: () => [...queryKeys.auth.all, "roles"] as const,
  },
};

// Função helper para criar query keys dinâmicas
export const createQueryKey = <T extends readonly unknown[]>(baseKey: readonly [...unknown[]], ...params: T) => {
  return [...baseKey, ...params] as const;
};

// Função helper para invalidar queries relacionadas
export const invalidateModuleQueries = (moduleKey: readonly unknown[]) => {
  return {
    queryKey: moduleKey,
    refetchType: 'active' as const,
  };
};
