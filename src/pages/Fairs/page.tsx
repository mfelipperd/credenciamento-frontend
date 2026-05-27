import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Filter } from "lucide-react";
import { FairForm } from "./components/FairForm";
import { FairList } from "./components/FairList";
import { FairStats } from "./components/FairStats";
import {
  useFairs,
  useCreateFair,
  useDeleteFair,
  useToggleFairActive,
  useFairStats,
} from "@/hooks/useFairs";
import type { Fair, CreateFairForm, FairFilters } from "@/interfaces/fairs";

export default function FairsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filters, setFilters] = useState<FairFilters>({});

  // Hooks
  const { data: fairs, isLoading } = useFairs(filters);
  const { data: stats, isLoading: statsLoading } = useFairStats(fairs);
  const createFairMutation = useCreateFair();
  const deleteFairMutation = useDeleteFair();
  const toggleActiveMutation = useToggleFairActive();

  // Handlers
  const handleCreateFair = (data: CreateFairForm) => {
    createFairMutation.mutate(data, {
      onSuccess: () => setIsFormOpen(false),
    });
  };

  const handleDeleteFair = (fair: Fair) => {
    if (window.confirm(`Tem certeza que deseja excluir a feira "${fair.name}"?`)) {
      deleteFairMutation.mutate(fair.id);
    }
  };

  const handleToggleActive = (fair: Fair) => {
    toggleActiveMutation.mutate(fair.id);
  };

  const handleFiltersChange = (newFilters: Partial<FairFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Gerenciamento de Feiras</h1>
          <p className="text-white/50 text-sm mt-1">
            Clique em uma feira para ver detalhes e editar
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Nova Feira
        </Button>
      </div>

      {/* Estatísticas */}
      <FairStats stats={stats} isLoading={statsLoading} />

      {/* Lista de Feiras */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Feiras Cadastradas
            {fairs && (
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {fairs.length} {fairs.length === 1 ? "feira" : "feiras"}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FairList
            fairs={fairs ?? []}
            isLoading={isLoading}
            onDelete={handleDeleteFair}
            onToggleActive={handleToggleActive}
            onFiltersChange={handleFiltersChange}
            filters={filters}
          />
        </CardContent>
      </Card>

      {/* Modal de Criação */}
      <FairForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={(data) => handleCreateFair(data as CreateFairForm)}
        isLoading={createFairMutation.isPending}
      />
    </div>
  );
}
