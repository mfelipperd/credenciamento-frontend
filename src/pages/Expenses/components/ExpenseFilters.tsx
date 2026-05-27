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
import type { DirectExpenseCategory, Account, ExpenseFilters } from "@/interfaces/finance";

export interface AppliedFilters {
  categoryId?: string;
  accountId?: string;
  from?: string;
  to?: string;
  minValue?: string;
  maxValue?: string;
}

interface ExpenseFiltersProps {
  categories: DirectExpenseCategory[];
  accounts: Account[];
  onApplyFilters: (filters: AppliedFilters) => void;
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
          acc[key as keyof AppliedFilters] = value;
        }
        return acc;
      },
      {} as AppliedFilters
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
            className="text-xs font-bold uppercase tracking-wider text-white/60"
          >
            Categoria
          </Label>
          <Select
            value={filters.categoryId || ""}
            onValueChange={(value) => handleFilterChange("categoryId", value === "clear" ? undefined : value)}
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl focus:border-brand-pink/50 focus:ring-brand-pink/20 placeholder:text-white/20 h-10">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border border-white/10 text-white">
              <SelectItem value="clear" className="hover:bg-white/10 cursor-pointer">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id} className="hover:bg-white/10 cursor-pointer">
                  {category.name}
                  {category.global && (
                    <span className="text-xs text-white/40 ml-2">(Global)</span>
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
            className="text-xs font-bold uppercase tracking-wider text-white/60"
          >
            Conta Bancária
          </Label>
          <Select
            value={filters.accountId || ""}
            onValueChange={(value) => handleFilterChange("accountId", value === "clear" ? undefined : value)}
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl focus:border-brand-pink/50 focus:ring-brand-pink/20 placeholder:text-white/20 h-10">
              <SelectValue placeholder="Todas as contas" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border border-white/10 text-white">
              <SelectItem value="clear" className="hover:bg-white/10 cursor-pointer">Todas as contas</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id} className="hover:bg-white/10 cursor-pointer">
                  {account.nomeConta}
                  {account.banco && (
                    <span className="text-xs text-white/40 ml-2">
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
          <Label className="text-xs font-bold uppercase tracking-wider text-white/60">Período</Label>
          <div className="flex gap-2">
            <Popover
              open={isCalendarFromOpen}
              onOpenChange={setIsCalendarFromOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal text-sm border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white rounded-xl h-10 transition-all duration-200",
                    !filters.from && "text-white/40"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-brand-cyan" />
                  {filters.from
                    ? new Date(filters.from).toLocaleDateString("pt-BR")
                    : "De"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-900 border border-white/10 text-white" align="start">
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
                    "w-full justify-start text-left font-normal text-sm border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white rounded-xl h-10 transition-all duration-200",
                    !filters.to && "text-white/40"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-brand-cyan" />
                  {filters.to
                    ? new Date(filters.to).toLocaleDateString("pt-BR")
                    : "Até"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-900 border border-white/10 text-white" align="start">
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
            className="text-xs font-bold uppercase tracking-wider text-white/60"
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
            className="bg-white/5 border-white/10 text-white rounded-xl focus:border-brand-pink/50 focus:ring-brand-pink/20 placeholder:text-white/20 h-10"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="maxValue"
            className="text-xs font-bold uppercase tracking-wider text-white/60"
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
            className="bg-white/5 border-white/10 text-white rounded-xl focus:border-brand-pink/50 focus:ring-brand-pink/20 placeholder:text-white/20 h-10"
          />
        </div>
      </div>

      {/* Filtros ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center bg-white/3 border border-white/5 rounded-xl p-3">
          <span className="text-xs text-white/40 font-bold uppercase tracking-wider">
            Filtros ativos:
          </span>
          {filters.categoryId && (
            <Badge variant="secondary" className="gap-1 bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 py-1 px-2.5 rounded-lg">
              Categoria:{" "}
              {categories.find((c) => c.id === filters.categoryId)?.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 text-white/40 hover:text-white hover:bg-white/10 rounded-full"
                onClick={() => handleFilterChange("categoryId", undefined)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.accountId && (
            <Badge variant="secondary" className="gap-1 bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 py-1 px-2.5 rounded-lg">
              Conta:{" "}
              {accounts.find((a) => a.id === filters.accountId)?.nomeConta}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 text-white/40 hover:text-white hover:bg-white/10 rounded-full"
                onClick={() => handleFilterChange("accountId", undefined)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.from && (
            <Badge variant="secondary" className="gap-1 bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 py-1 px-2.5 rounded-lg">
              De: {new Date(filters.from).toLocaleDateString("pt-BR")}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 text-white/40 hover:text-white hover:bg-white/10 rounded-full"
                onClick={() => handleFilterChange("from", "")}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.to && (
            <Badge variant="secondary" className="gap-1 bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 py-1 px-2.5 rounded-lg">
              Até: {new Date(filters.to).toLocaleDateString("pt-BR")}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 text-white/40 hover:text-white hover:bg-white/10 rounded-full"
                onClick={() => handleFilterChange("to", "")}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.minValue && (
            <Badge variant="secondary" className="gap-1 bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 py-1 px-2.5 rounded-lg">
              Mín: R$ {parseFloat(filters.minValue).toFixed(2)}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 text-white/40 hover:text-white hover:bg-white/10 rounded-full"
                onClick={() => handleFilterChange("minValue", "")}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.maxValue && (
            <Badge variant="secondary" className="gap-1 bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 py-1 px-2.5 rounded-lg">
              Máx: R$ {parseFloat(filters.maxValue).toFixed(2)}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 text-white/40 hover:text-white hover:bg-white/10 rounded-full"
                onClick={() => handleFilterChange("maxValue", "")}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
        <Button
          variant="outline"
          onClick={handleClearFilters}
          disabled={!hasActiveFilters}
          className="border-white/10 bg-white/5 text-white/80 hover:bg-white/10 rounded-xl font-bold h-11 transition-all duration-200"
        >
          Limpar Filtros
        </Button>
        <Button
          onClick={handleApplyFilters}
          className="bg-linear-to-br from-[#00aacd] to-[#EB2970] text-white rounded-xl px-6 font-bold shadow-lg shadow-pink-500/20 transition-all hover:scale-105 active:scale-95 h-11 border-none cursor-pointer"
        >
          <Filter className="w-4 h-4 mr-2" />
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
}
