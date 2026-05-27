// Categorias de despesas OVERHEAD — tabela `finance_categories`, campo `nome`
// Endpoint: GET /overhead-expenses/categories  ou  GET /finance/categories
export interface FinanceCategory {
  id: string;
  nome: string;          // ← "nome" (tabela `finance_categories`)
  parentId?: string | null;
  global: boolean;
  fairId?: string | null;
  isRequired: boolean;
  description?: string | null;
  parent?: FinanceCategory;
  children?: FinanceCategory[];
}

/** Alias semântico — destaca que esta categoria é de overhead */
export type OverheadCategory = FinanceCategory;

export interface CreateCategoryDto {
  nome: string;
  parentId?: string;
  global: boolean;
  fairId?: string;
  isRequired: boolean;
  description?: string;
}

export interface UpdateCategoryDto {
  nome?: string;
  parentId?: string;
  global?: boolean;
  fairId?: string;
  isRequired?: boolean;
  description?: string;
}

export interface RequiredCategoriesSummary {
  totalRequired: number;
  categories: {
    id: string;
    nome: string;
    description?: string;
    isGlobal: boolean;
    parentId?: string;
  }[];
}
