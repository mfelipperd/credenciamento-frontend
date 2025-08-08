import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
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
import { Calendar as CalendarIcon, Search, X } from "lucide-react";
import dayjs from "dayjs";
import type {
  RevenueFilters,
  EntryModelType,
  RevenueStatus,
} from "@/interfaces/finance";
import { cn } from "@/lib/utils";

interface FinanceFiltersProps {
  filters: RevenueFilters;
  onChange: (filters: Partial<RevenueFilters>) => void;
}

export function FinanceFilters({ filters, onChange }: FinanceFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [fromDate, setFromDate] = useState<Date | undefined>(
    filters.from ? new Date(filters.from) : undefined
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    filters.to ? new Date(filters.to) : undefined
  );

  const handleApplyFilters = () => {
    const newFilters = {
      ...localFilters,
      from: fromDate ? dayjs(fromDate).format("YYYY-MM-DD") : undefined,
      to: toDate ? dayjs(toDate).format("YYYY-MM-DD") : undefined,
    };
    onChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      page: 1,
      fairId: filters.fairId, // Mantém a feira selecionada
    };
    setLocalFilters(clearedFilters);
    setFromDate(undefined);
    setToDate(undefined);
    onChange(clearedFilters);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Feira (simulando que vem do contexto) */}
        <div className="space-y-2">
          <Label>Feira</Label>
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
              <SelectItem value="feira-2">Feira de Tecnologia 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={localFilters.status || ""}
            onValueChange={(value) =>
              setLocalFilters((prev) => ({
                ...prev,
                status: value as RevenueStatus | "all",
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="PARTIAL">Parcial</SelectItem>
              <SelectItem value="PAID">Pago</SelectItem>
              <SelectItem value="OVERDUE">Atrasado</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de Entrada */}
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select
            value={localFilters.type || ""}
            onValueChange={(value) =>
              setLocalFilters((prev) => ({
                ...prev,
                type: value as EntryModelType | "all",
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="STANDS">Stands</SelectItem>
              <SelectItem value="PATROCINIO">Patrocínio</SelectItem>
              <SelectItem value="PALESTRAS">Palestras</SelectItem>
              <SelectItem value="OUTROS">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Campo de busca */}
        <div className="space-y-2">
          <Label>Buscar</Label>
          <Input
            placeholder="Cliente, empresa..."
            value={localFilters.q || ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, q: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Data Início */}
        <div className="space-y-2">
          <Label>Data Início</Label>
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
                {fromDate
                  ? dayjs(fromDate).format("DD/MM/YYYY")
                  : "Selecionar data"}
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

        {/* Data Fim */}
        <div className="space-y-2">
          <Label>Data Fim</Label>
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
                {toDate
                  ? dayjs(toDate).format("DD/MM/YYYY")
                  : "Selecionar data"}
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

        {/* Campo de data */}
        <div className="space-y-2">
          <Label>Campo de Data</Label>
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

      {/* Botões de Ação */}
      <div className="flex gap-2">
        <Button
          onClick={handleApplyFilters}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Search className="w-4 h-4 mr-2" />
          Aplicar Filtros
        </Button>
        <Button variant="outline" onClick={handleClearFilters}>
          <X className="w-4 h-4 mr-2" />
          Limpar
        </Button>
      </div>
    </div>
  );
}
