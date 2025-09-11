import { useState } from "react";
import { Calendar as CalendarIcon, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FinanceCategory, Account } from "@/interfaces/finance";

interface ExpenseFiltersProps {
  categories: FinanceCategory[];
  accounts: Account[];
  onApplyFilters: (filters: any) => void;
}

export function ExpenseFilters({
  categories,
  accounts,
  onApplyFilters,
}: ExpenseFiltersProps) {
  const [filters, setFilters] = useState({
    categoryId: undefined as string | undefined,
    accountId: undefined as string | undefined,
    from: "",
    to: "",
    minValue: "",
    maxValue: "",
  });

  const [isCalendarFromOpen, setIsCalendarFromOpen] = useState(false);
  const [isCalendarToOpen, setIsCalendarToOpen] = useState(false);

  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    const activeFilters = Object.entries(filters).reduce(
      (acc, [key, value]) => {
        if (value && value !== "" && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, string>
    );

    onApplyFilters(activeFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      categoryId: undefined,
      accountId: undefined,
      from: "",
      to: "",
      minValue: "",
      maxValue: "",
    });
    onApplyFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value && value !== "" && value !== undefined
  );

  return (
    <div className="space-y-4">
      {/* Filtros principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Categoria */}
        <div className="space-y-2">
          <Label
            htmlFor="categoryId"
            className="text-gray-900 dark:text-gray-100"
          >
            Categoria
          </Label>
          <Select
            value={filters.categoryId || ""}
            onValueChange={(value) => handleFilterChange("categoryId", value === "clear" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clear">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                  {category.global && (
                    <span className="text-xs text-gray-500 ml-2">(Global)</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conta Bancária */}
        <div className="space-y-2">
          <Label
            htmlFor="accountId"
            className="text-gray-900 dark:text-gray-100"
          >
            Conta Bancária
          </Label>
          <Select
            value={filters.accountId || ""}
            onValueChange={(value) => handleFilterChange("accountId", value === "clear" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as contas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clear">Todas as contas</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.nomeConta}
                  {account.banco && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({account.banco})
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Período */}
        <div className="space-y-2">
          <Label className="text-gray-900 dark:text-gray-100">Período</Label>
          <div className="flex gap-2">
            <Popover
              open={isCalendarFromOpen}
              onOpenChange={setIsCalendarFromOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal text-sm",
                    !filters.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.from
                    ? new Date(filters.from).toLocaleDateString("pt-BR")
                    : "De"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.from ? new Date(filters.from) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      handleFilterChange(
                        "from",
                        date.toISOString().split("T")[0]
                      );
                      setIsCalendarFromOpen(false);
                    }
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover open={isCalendarToOpen} onOpenChange={setIsCalendarToOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal text-sm",
                    !filters.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.to
                    ? new Date(filters.to).toLocaleDateString("pt-BR")
                    : "Até"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.to ? new Date(filters.to) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      handleFilterChange(
                        "to",
                        date.toISOString().split("T")[0]
                      );
                      setIsCalendarToOpen(false);
                    }
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Filtros de valor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="minValue"
            className="text-gray-900 dark:text-gray-100"
          >
            Valor Mínimo (R$)
          </Label>
          <Input
            id="minValue"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={filters.minValue}
            onChange={(e) => handleFilterChange("minValue", e.target.value)}
            className="text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="maxValue"
            className="text-gray-900 dark:text-gray-100"
          >
            Valor Máximo (R$)
          </Label>
          <Input
            id="maxValue"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={filters.maxValue}
            onChange={(e) => handleFilterChange("maxValue", e.target.value)}
            className="text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Filtros ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Filtros ativos:
          </span>
          {filters.categoryId && (
            <Badge variant="secondary" className="gap-1">
              Categoria:{" "}
              {categories.find((c) => c.id === filters.categoryId)?.nome}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleFilterChange("categoryId", undefined)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.accountId && (
            <Badge variant="secondary" className="gap-1">
              Conta:{" "}
              {accounts.find((a) => a.id === filters.accountId)?.nomeConta}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleFilterChange("accountId", undefined)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.from && (
            <Badge variant="secondary" className="gap-1">
              De: {new Date(filters.from).toLocaleDateString("pt-BR")}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleFilterChange("from", "")}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.to && (
            <Badge variant="secondary" className="gap-1">
              Até: {new Date(filters.to).toLocaleDateString("pt-BR")}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleFilterChange("to", "")}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.minValue && (
            <Badge variant="secondary" className="gap-1">
              Mín: R$ {parseFloat(filters.minValue).toFixed(2)}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleFilterChange("minValue", "")}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.maxValue && (
            <Badge variant="secondary" className="gap-1">
              Máx: R$ {parseFloat(filters.maxValue).toFixed(2)}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleFilterChange("maxValue", "")}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex gap-3 justify-end pt-4">
        <Button
          variant="outline"
          onClick={handleClearFilters}
          disabled={!hasActiveFilters}
        >
          Limpar Filtros
        </Button>
        <Button
          onClick={handleApplyFilters}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Filter className="w-4 h-4 mr-2" />
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
}
