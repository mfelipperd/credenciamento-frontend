import { useAxio } from "@/hooks/useAxio";
import type { FinanceCategory, CreateCategoryDto, UpdateCategoryDto, RequiredCategoriesSummary } from "@/interfaces/categories";

export const useCategoriesService = () => {
  const api = useAxio();

  const getAllCategories = async (fairId: string): Promise<FinanceCategory[]> => {
    const response = await api.get(`/finance/categories/fair/${fairId}`);
    return response.data;
  };

  const getRequiredCategories = async (fairId: string): Promise<FinanceCategory[]> => {
    const response = await api.get(`/finance/categories/fair/${fairId}/required`);
    return response.data;
  };

  const getOptionalCategories = async (fairId: string): Promise<FinanceCategory[]> => {
    const response = await api.get(`/finance/categories/fair/${fairId}/optional`);
    return response.data;
  };

  const getRequiredSummary = async (fairId: string): Promise<RequiredCategoriesSummary> => {
    const response = await api.get(`/finance/categories/fair/${fairId}/required/summary`);
    return response.data;
  };

  const toggleRequired = async (categoryId: string): Promise<FinanceCategory> => {
    const response = await api.patch(`/finance/categories/${categoryId}/toggle-required`);
    return response.data;
  };

  const createCategory = async (categoryData: CreateCategoryDto): Promise<FinanceCategory> => {
    const response = await api.post('/finance/categories', categoryData);
    return response.data;
  };

  const updateCategory = async (categoryId: string, updateData: UpdateCategoryDto): Promise<FinanceCategory> => {
    const response = await api.patch(`/finance/categories/${categoryId}`, updateData);
    return response.data;
  };

  const deleteCategory = async (categoryId: string): Promise<void> => {
    await api.delete(`/finance/categories/${categoryId}`);
  };

  return {
    getAllCategories,
    getRequiredCategories,
    getOptionalCategories,
    getRequiredSummary,
    toggleRequired,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
