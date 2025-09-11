export interface FinanceCategory {
  id: string;
  nome: string;
  parentId?: string;
  global: boolean;
  fairId?: string;
  isRequired: boolean;
  description?: string;
  parent?: FinanceCategory;
  children?: FinanceCategory[];
}

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
