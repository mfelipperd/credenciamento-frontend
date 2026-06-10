import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, CalendarDays } from "lucide-react";
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

  const { data: fairs, isLoading } = useFairs(filters);
  const { data: stats, isLoading: statsLoading } = useFairStats();
  const createFairMutation = useCreateFair();
  const deleteFairMutation = useDeleteFair();
  const toggleActiveMutation = useToggleFairActive();

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

  const handleFiltersChange = (newFilters: Partial<FairFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <CalendarDays className="h-8 w-8 text-brand-pink" />
              GESTÃO DE <span className="text-brand-cyan">FEIRAS</span>
            </h1>
            <div className="h-1.5 w-24 bg-linear-to-r from-brand-pink to-brand-cyan rounded-full" />
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-linear-to-br from-[#00aacd] to-[#EB2970] text-white rounded-xl px-6 font-bold shadow-lg shadow-pink-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Feira
          </Button>
        </div>

        {/* Estatísticas */}
        <FairStats stats={stats} isLoading={statsLoading} />

        {/* Lista */}
        <FairList
          fairs={fairs ?? []}
          isLoading={isLoading}
          onDelete={handleDeleteFair}
          onToggleActive={(fair) => toggleActiveMutation.mutate(fair.id)}
          onFiltersChange={handleFiltersChange}
          filters={filters}
        />

        <FairForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={(data) => handleCreateFair(data as CreateFairForm)}
          isLoading={createFairMutation.isPending}
        />
      </div>
    </div>
  );
}
