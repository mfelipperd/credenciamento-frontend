import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Lock, 
  Unlock, 
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react";
import { CategoryCard } from "./CategoryCard";
import { CategoryForm } from "./CategoryForm";
import type { FinanceCategory } from "@/interfaces/categories";

interface CategoriesConfigProps {
  fairId: string;
}

export function CategoriesConfig({ fairId }: CategoriesConfigProps) {
  const {
    categories,
    requiredCategories,
    optionalCategories,
    summary,
    isLoading,
    toggleRequired,
    createCategory,
    updateCategory,
    deleteCategory,
    isToggling,
    isCreating,
    isUpdating,
  } = useCategories(fairId);

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FinanceCategory | undefined>();

  const handleToggleRequired = async (categoryId: string) => {
    try {
      await toggleRequired(categoryId);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  const handleCreateCategory = async (data: any) => {
    try {
      await createCategory(data);
      setShowForm(false);
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
    }
  };

  const handleUpdateCategory = async (data: any) => {
    if (!editingCategory) return;
    
    try {
      await updateCategory({ id: editingCategory.id, data });
      setEditingCategory(undefined);
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta categoria?")) return;
    
    try {
      await deleteCategory(categoryId);
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
    }
  };

  const handleEditCategory = (category: FinanceCategory) => {
    setEditingCategory(category);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(undefined);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configuração de Categorias
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie as categorias obrigatórias e opcionais para esta feira
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Resumo */}
      {summary && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Info className="h-5 w-5" />
              Resumo das Categorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {summary.totalRequired}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Obrigatórias
                </div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {optionalCategories.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Opcionais
                </div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categorias Obrigatórias */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Categorias Obrigatórias ({requiredCategories.length})
          </h3>
          <Badge variant="destructive" className="text-xs">
            Essenciais
          </Badge>
        </div>
        
        {requiredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requiredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onToggleRequired={handleToggleRequired}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                isToggling={isToggling}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhuma categoria obrigatória
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Adicione categorias e marque-as como obrigatórias para controlar despesas essenciais.
            </p>
          </Card>
        )}
      </div>

      {/* Categorias Opcionais */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Unlock className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Categorias Opcionais ({optionalCategories.length})
          </h3>
          <Badge variant="secondary" className="text-xs">
            Flexíveis
          </Badge>
        </div>
        
        {optionalCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {optionalCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onToggleRequired={handleToggleRequired}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                isToggling={isToggling}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhuma categoria opcional
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Todas as categorias estão marcadas como obrigatórias.
            </p>
          </Card>
        )}
      </div>

      {/* Formulários */}
      <CategoryForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleCreateCategory}
        fairId={fairId}
        isLoading={isCreating}
      />

      <CategoryForm
        isOpen={!!editingCategory}
        onClose={handleCloseForm}
        onSubmit={handleUpdateCategory}
        category={editingCategory}
        fairId={fairId}
        isLoading={isUpdating}
      />
    </div>
  );
}
