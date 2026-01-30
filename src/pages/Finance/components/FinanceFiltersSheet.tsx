import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, X, Search, Filter } from "lucide-react";
import dayjs from "dayjs";
import type {
  RevenueFilters,
  EntryModelType,
  RevenueStatus,
} from "@/interfaces/finance";
import { cn } from "@/lib/utils";

interface FinanceFiltersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: RevenueFilters;
  onChange: (filters: Partial<RevenueFilters>) => void;
}

export function FinanceFiltersSheet({
  isOpen,
  onClose,
  filters,
  onChange,
}: FinanceFiltersSheetProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [fromDate, setFromDate] = useState<Date | undefined>(
    filters.from ? new Date(filters.from) : undefined
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    filters.to ? new Date(filters.to) : undefined
  );

  // Sincronizar com os filtros externos quando mudarem
  useEffect(() => {
    setLocalFilters(filters);
    setFromDate(filters.from ? new Date(filters.from) : undefined);
    setToDate(filters.to ? new Date(filters.to) : undefined);
  }, [filters]);

  const handleApplyFilters = () => {
    const newFilters = {
      ...localFilters,
      from: fromDate ? dayjs(fromDate).format("YYYY-MM-DD") : undefined,
      to: toDate ? dayjs(toDate).format("YYYY-MM-DD") : undefined,
      page: 1, // Reset página ao aplicar filtros
    };
    onChange(newFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      page: 1,
      pageSize: 20,
      fairId: filters.fairId, // Mantém a feira selecionada
    };
    setLocalFilters(clearedFilters);
    setFromDate(undefined);
    setToDate(undefined);
    onChange(clearedFilters);
    onClose();
  };

  const hasActiveFilters = () => {
    return !!(
      localFilters.q ||
      (localFilters.status && localFilters.status !== "all") ||
      (localFilters.type && localFilters.type !== "all") ||
      fromDate ||
      toDate
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full max-w-2xl min-w-120 overflow-y-auto p-0 border-none bg-white dark:bg-slate-950">
        <div className="relative h-32 w-full flex items-end p-8 bg-linear-to-br from-[#F39B0C] to-[#EB2970] overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          
          <div className="relative z-10 w-full flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">
                  Refinar Buscas
                </p>
                <SheetTitle className="text-2xl font-black text-white tracking-tighter">
                  Filtros Avançados
                </SheetTitle>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-white/60 hover:text-white hover:bg-white/10 rounded-full h-10 w-10 transition-all duration-300"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="p-8 space-y-8">

        <div className="space-y-6">
          {/* Busca por texto */}
          <div className="space-y-2">
            <Label className="text-base font-medium text-gray-900 dark:text-white">
              Buscar
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cliente, modelo, observações..."
                value={localFilters.q || ""}
                onChange={(e) =>
                  setLocalFilters((prev) => ({ ...prev, q: e.target.value }))
                }
                className="pl-10"
              />
            </div>
          </div>

          {/* Grid de filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Feira */}
            <div className="space-y-2">
              <Label className="text-base font-medium text-gray-900 dark:text-white">
                Feira
              </Label>
              <Select
                value={localFilters.fairId || ""}
                onValueChange={(value) =>
                  setLocalFilters((prev) => ({ ...prev, fairId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a feira" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feira-1">Feira de Exemplo 2024</SelectItem>
                  <SelectItem value="feira-2">
                    Feira de Tecnologia 2024
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-base font-medium text-gray-900 dark:text-white">
                Status
              </Label>
              <Select
                value={localFilters.status || "all"}
                onValueChange={(value) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    status:
                      value === "all" ? undefined : (value as RevenueStatus),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="PARCIAL">Parcial</SelectItem>
                  <SelectItem value="PAGO">Pago</SelectItem>
                  <SelectItem value="ATRASADO">Atrasado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label className="text-base font-medium text-gray-900 dark:text-white">
                Tipo
              </Label>
              <Select
                value={localFilters.type || "all"}
                onValueChange={(value) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    type:
                      value === "all" ? undefined : (value as EntryModelType),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="STAND">Stand</SelectItem>
                  <SelectItem value="PATROCINIO">Patrocínio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Forma de Pagamento - Removido pois não está na interface */}
            {/* 
            <div className="space-y-2">
              <Label className="text-base font-medium text-gray-900 dark:text-white">
                Forma de Pagamento
              </Label>
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Em desenvolvimento" />
                </SelectTrigger>
              </Select>
            </div>
            */}

            {/* Condição - Removido pois não está na interface */}
            {/* 
            <div className="space-y-2">
              <Label className="text-base font-medium text-gray-900 dark:text-white">
                Condição
              </Label>
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Em desenvolvimento" />
                </SelectTrigger>
              </Select>
            </div>
            */}

            {/* Campo de data */}
            <div className="space-y-2">
              <Label className="text-base font-medium text-gray-900 dark:text-white">
                Campo de Data
              </Label>
              <Select
                value={localFilters.dateField || "contrato"}
                onValueChange={(value) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    dateField: value as "contrato" | "vencimento" | "pagamento",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contrato">Data do Contrato</SelectItem>
                  <SelectItem value="vencimento">Data de Vencimento</SelectItem>
                  <SelectItem value="pagamento">Data de Pagamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Período */}
          <div className="space-y-4">
            <Label className="text-base font-medium text-gray-900 dark:text-white">
              Período
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data Inicial */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600 dark:text-gray-400">
                  Data Inicial
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fromDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? (
                        dayjs(fromDate).format("DD/MM/YYYY")
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Data Final */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600 dark:text-gray-400">
                  Data Final
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !toDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? (
                        dayjs(toDate).format("DD/MM/YYYY")
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200/30 dark:border-gray-700/30">
            <Button
              type="button"
              variant="outline"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters()}
            >
              Limpar Filtros
            </Button>
            <Button
              type="button"
              onClick={handleApplyFilters}
              className="bg-blue-600 hover:bg-blue-700 px-8 font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              Aplicar Filtros
            </Button>
          </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
