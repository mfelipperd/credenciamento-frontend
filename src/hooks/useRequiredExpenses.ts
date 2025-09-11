import { useQuery } from "@tanstack/react-query";
import { useAxio } from "@/hooks/useAxio";

export const useRequiredExpenses = (fairId: string) => {
  const api = useAxio();

  return useQuery({
    queryKey: ["required-expenses", fairId],
    queryFn: async () => {
      try {
        // Buscar todas as despesas da feira
        const expensesResponse = await api.get(`/expenses/fairs/${fairId}/expenses`);
        const expenses = expensesResponse.data || [];
        
        // Buscar categorias obrigatórias
        const categoriesResponse = await api.get(`/finance/categories/fair/${fairId}/required`);
        const requiredCategories = categoriesResponse.data || [];
        const requiredCategoryIds = requiredCategories.map((cat: any) => cat.id);
        
        // Filtrar despesas por categorias obrigatórias
        const requiredExpenses = expenses.filter((expense: any) => 
          requiredCategoryIds.includes(expense.categoryId)
        );
        
              // Calcular total de despesas obrigatórias (já em centavos)
              const totalValue = requiredExpenses.reduce((sum: number, expense: any) => 
                sum + (expense.value || 0), 0
              );
              
              // Calcular área total baseada na quantidade de stands
              // Assumindo que cada stand tem em média 9m² (3x3) e há 32 stands
              const averageStandArea = 9; // 3x3 metros
              const totalStands = 32; // Quantidade total de stands
              const totalArea = totalStands * averageStandArea; // 288m² total
        
        console.log('Required expenses data:', {
          totalValue,
          totalArea,
          requiredExpenses: requiredExpenses.length,
          requiredCategories: requiredCategories.length
        });
        
        return {
          totalValue,
          totalArea,
          expenses: requiredExpenses
        };
      } catch (error) {
        console.log('Error fetching required expenses:', error);
        return { totalValue: 0, totalArea: 1, expenses: [] };
      }
    },
    enabled: !!fairId,
  });
};
