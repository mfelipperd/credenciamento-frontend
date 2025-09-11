import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Lock, 
  Unlock, 
  Edit, 
  Trash2,
  Globe,
  Building
} from "lucide-react";
import type { FinanceCategory } from "@/interfaces/categories";

interface CategoryCardProps {
  category: FinanceCategory;
  onToggleRequired: (categoryId: string) => void;
  onEdit: (category: FinanceCategory) => void;
  onDelete: (categoryId: string) => void;
  isToggling?: boolean;
}

export function CategoryCard({ 
  category, 
  onToggleRequired, 
  onEdit, 
  onDelete, 
  isToggling = false 
}: CategoryCardProps) {
  // Debug: verificar os dados da categoria
  console.log('CategoryCard - category data:', category);
  
  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      category.isRequired 
        ? 'border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-900/10' 
        : 'border-l-4 border-l-gray-300 bg-gray-50/50 dark:bg-gray-800/50'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              {category.nome || (category as any).name || 'Nome não disponível'}
            </CardTitle>
            {category.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {category.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleRequired(category.id)}
              disabled={isToggling}
              className={category.isRequired 
                ? 'text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20' 
                : 'text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900/20'
              }
            >
              {category.isRequired ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Unlock className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(category)}
              className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/20"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(category.id)}
              className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant={category.isRequired ? "destructive" : "secondary"}
            className="text-xs"
          >
            {category.isRequired ? 'Obrigatória' : 'Opcional'}
          </Badge>
          
          <Badge 
            variant={category.global ? "default" : "outline"}
            className="text-xs flex items-center gap-1"
          >
            {category.global ? (
              <>
                <Globe className="h-3 w-3" />
                Global
              </>
            ) : (
              <>
                <Building className="h-3 w-3" />
                Específica
              </>
            )}
          </Badge>
          
          {category.parent && (
            <Badge variant="outline" className="text-xs">
              Subcategoria de: {category.parent.nome}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
