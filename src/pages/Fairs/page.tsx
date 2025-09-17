import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Filter } from "lucide-react";
import { FairForm } from "./components/FairForm";
import { FairList } from "./components/FairList";
import { FairStats } from "./components/FairStats";
import { useFairs, useCreateFair, useUpdateFair, useDeleteFair, useToggleFairActive, useFairStats } from "@/hooks/useFairs";
import type { Fair, CreateFairForm, UpdateFairForm, FairFilters } from "@/interfaces/fairs";

export default function FairsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFair, setEditingFair] = useState<Fair | null>(null);
  const [filters, setFilters] = useState<FairFilters>({
    page: 1,
    pageSize: 20,
  });

  // Hooks
  const { data: fairs, isLoading } = useFairs(filters);
  const { data: stats, isLoading: statsLoading } = useFairStats(fairs);
  const createFairMutation = useCreateFair();
  const updateFairMutation = useUpdateFair();
  const deleteFairMutation = useDeleteFair();
  const toggleActiveMutation = useToggleFairActive();

  // Handlers
  const handleCreateFair = (data: CreateFairForm) => {
    createFairMutation.mutate(data, {
      onSuccess: () => {
        setIsFormOpen(false);
        setEditingFair(null);
      },
    });
  };

  const handleUpdateFair = (data: UpdateFairForm) => {
    if (editingFair) {
      updateFairMutation.mutate(
        { id: editingFair.id, data },
        {
          onSuccess: () => {
            setIsFormOpen(false);
            setEditingFair(null);
          },
        }
      );
    }
  };

  const handleEditFair = (fair: Fair) => {
    setEditingFair(fair);
    setIsFormOpen(true);
  };

  const handleDeleteFair = (fair: Fair) => {
    if (window.confirm(`Tem certeza que deseja excluir a feira "${fair.name}"?`)) {
      deleteFairMutation.mutate(fair.id);
    }
  };

  const handleToggleActive = (fair: Fair) => {
    toggleActiveMutation.mutate(fair.id);
  };

  const handleViewFair = (fair: Fair) => {
    // Implementar visualização de detalhes se necessário
    console.log("Visualizar feira:", fair);
  };

  const handleFiltersChange = (newFilters: Partial<FairFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingFair(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gerenciamento de Feiras
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie feiras, configurações e informações financeiras
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Feira
        </Button>
      </div>

      {/* Estatísticas */}
      <FairStats stats={stats} isLoading={statsLoading} />

      {/* Lista de Feiras */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Feiras Cadastradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FairList
            fairs={fairs || []}
            isLoading={isLoading}
            onEdit={handleEditFair}
            onDelete={handleDeleteFair}
            onView={handleViewFair}
            onToggleActive={handleToggleActive}
            onFiltersChange={handleFiltersChange}
            filters={filters}
          />
        </CardContent>
      </Card>

      {/* Modal de Formulário */}
      <FairForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingFair ? handleUpdateFair : (data: CreateFairForm | UpdateFairForm) => handleCreateFair(data as CreateFairForm)}
        fair={editingFair}
        isLoading={createFairMutation.isPending || updateFairMutation.isPending}
      />
    </div>
  );
}