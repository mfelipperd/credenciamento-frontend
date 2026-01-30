import { useAxio } from "@/hooks/useAxio";
import type { FinanceCategory, CreateCategoryDto, UpdateCategoryDto, RequiredCategoriesSummary } from "@/interfaces/categories";
import { AppEndpoints } from "@/constants/AppEndpoints";

export const useCategoriesService = () => {
  const api = useAxio();

  const getAllCategories = async (fairId: string): Promise<FinanceCategory[]> => {
    const response = await api.get(AppEndpoints.FINANCE.CATEGORIES_BY_FAIR(fairId));
    return response.data;
  };

  const getRequiredCategories = async (fairId: string): Promise<FinanceCategory[]> => {
    const response = await api.get(`${AppEndpoints.FINANCE.CATEGORIES_BY_FAIR(fairId)}/required`);
    return response.data;
  };

  const getOptionalCategories = async (fairId: string): Promise<FinanceCategory[]> => {
    const response = await api.get(`${AppEndpoints.FINANCE.CATEGORIES_BY_FAIR(fairId)}/optional`);
    return response.data;
  };

  const getRequiredSummary = async (fairId: string): Promise<RequiredCategoriesSummary> => {
    const response = await api.get(`${AppEndpoints.FINANCE.CATEGORIES_BY_FAIR(fairId)}/required/summary`);
    return response.data;
  };

  const toggleRequired = async (categoryId: string): Promise<FinanceCategory> => {
    const response = await api.patch(`${AppEndpoints.FINANCE.CATEGORIES}/${categoryId}/toggle-required`);
    return response.data;
  };

  const createCategory = async (categoryData: CreateCategoryDto): Promise<FinanceCategory> => {
    const response = await api.post(AppEndpoints.FINANCE.CATEGORIES, categoryData);
    return response.data;
  };

  const updateCategory = async (categoryId: string, updateData: UpdateCategoryDto): Promise<FinanceCategory> => {
    const response = await api.patch(AppEndpoints.FINANCE.CATEGORY_BY_ID(categoryId), updateData);
    return response.data;
  };

  const deleteCategory = async (categoryId: string): Promise<void> => {
    await api.delete(AppEndpoints.FINANCE.CATEGORY_BY_ID(categoryId));
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
