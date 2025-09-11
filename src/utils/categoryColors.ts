/**
 * Utilitário para gerar cores consistentes para categorias
 * Categorias com o mesmo nome sempre terão a mesma cor
 */

// Paleta de cores predefinidas para categorias
const CATEGORY_COLORS = [
  "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
  "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
  "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300",
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300",
  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
  "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
  "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300",
  "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300",
  "bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-300",
] as const;

/**
 * Gera uma cor consistente baseada no nome da categoria
 * @param categoryName - Nome da categoria
 * @returns Classes CSS para o badge da categoria
 */
export function getCategoryColor(categoryName: string): string {
  if (!categoryName) {
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
  
  // Gerar hash simples do nome da categoria
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    const char = categoryName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Usar o hash para selecionar uma cor
  const colorIndex = Math.abs(hash) % CATEGORY_COLORS.length;
  return CATEGORY_COLORS[colorIndex];
}

/**
 * Gera uma cor de fundo para cards baseada no nome da categoria
 * @param categoryName - Nome da categoria
 * @returns Classes CSS para o fundo do card
 */
export function getCategoryCardColor(categoryName: string): string {
  if (!categoryName) {
    return "border-gray-200 dark:border-gray-700";
  }
  
  // Gerar hash simples do nome da categoria
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    const char = categoryName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Cores de borda para cards
  const cardColors = [
    "border-l-blue-500",
    "border-l-green-500",
    "border-l-purple-500",
    "border-l-pink-500",
    "border-l-indigo-500",
    "border-l-yellow-500",
    "border-l-red-500",
    "border-l-orange-500",
    "border-l-teal-500",
    "border-l-cyan-500",
    "border-l-emerald-500",
    "border-l-violet-500",
  ] as const;
  
  const colorIndex = Math.abs(hash) % cardColors.length;
  return cardColors[colorIndex];
}
