import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFair, useUpdateFair, useDeleteFair, useToggleFairActive } from "@/hooks/useFairs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useExpensesService } from "@/service/expenses.service";
import { useFairService } from "@/service/fair.service";
import { ExpenseForm } from "@/pages/Expenses/components/ExpenseForm";
import type { AllocatedOverheadExpense, CreateOverheadExpenseForm, UpdateOverheadExpenseForm } from "@/interfaces/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Edit2,
  Check,
  X,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Navigation,
  Plus,
  Trash2,
  ExternalLink,
  Building2,
  Image,
  Info,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
} from "lucide-react";
import type { Fair, UpdateFairForm, DaySchedule, StandConfiguration, FairStatus } from "@/interfaces/fairs";
import { toast } from "sonner";

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<FairStatus, { label: string; className: string }> = {
  upcoming:  { label: "Em breve",     className: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  ongoing:   { label: "Em andamento", className: "bg-green-500/20 text-green-300 border-green-500/30" },
  ended:     { label: "Encerrada",    className: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
  cancelled: { label: "Cancelada",    className: "bg-red-500/20 text-red-300 border-red-500/30" },
};

const BR_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d?: string | null) => {
  if (!d) return null;
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

const fmtCurrency = (v: number | string | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v ?? 0));

// ─── SectionCard ─────────────────────────────────────────────────────────────

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  isEditing: boolean;
  isSaving?: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({
  icon, title, isEditing, isSaving, onEdit, onSave, onCancel, children,
}) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8">
      <h3 className="flex items-center gap-2 text-sm font-bold text-white/80 uppercase tracking-widest">
        <span className="text-white/40">{icon}</span>
        {title}
      </h3>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            disabled={isSaving}
            className="h-8 text-white/50 hover:text-white hover:bg-white/10"
          >
            <X className="h-3.5 w-3.5 mr-1" /> Cancelar
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="h-8 bg-brand-cyan/20 hover:bg-brand-cyan/30 text-brand-cyan border border-brand-cyan/30"
          >
            {isSaving ? (
              <span className="animate-pulse">Salvando…</span>
            ) : (
              <><Check className="h-3.5 w-3.5 mr-1" /> Salvar</>
            )}
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          onClick={onEdit}
          className="h-8 text-white/40 hover:text-white hover:bg-white/10"
        >
          <Edit2 className="h-3.5 w-3.5 mr-1" /> Editar
        </Button>
      )}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ─── Componentes de campo ─────────────────────────────────────────────────────

const Field: React.FC<{ label: string; value?: string | number | null; empty?: string }> = ({
  label, value, empty = "—",
}) => (
  <div>
    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-0.5">{label}</p>
    <p className="text-sm text-white/80">{value || empty}</p>
  </div>
);

const EditField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  step?: string;
}> = ({ label, value, onChange, type = "text", placeholder, step }) => (
  <div>
    <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 block">{label}</Label>
    <Input
      type={type}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-white/5 border-white/15 text-white placeholder:text-white/20 focus:border-brand-cyan/50 h-9"
    />
  </div>
);

// ─── Página principal ─────────────────────────────────────────────────────────

export default function FairDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: fair, isLoading } = useFair(id!);
  const updateMutation = useUpdateFair();
  const deleteMutation = useDeleteFair();
  const toggleMutation = useToggleFairActive();

  // Estado de qual seção está em modo de edição
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const saving = updateMutation.isPending;

  // Estado e hooks para despesas overhead / rateio
  const [isOverheadFormOpen, setIsOverheadFormOpen] = useState(false);
  const [editingOverhead, setEditingOverhead] = useState<AllocatedOverheadExpense | null>(null);
  const [overheadToDelete, setOverheadToDelete] = useState<AllocatedOverheadExpense | null>(null);

  const expensesService = useExpensesService();
  const fairService = useFairService();
  const queryClient = useQueryClient();

  // Query para buscar despesas (inclui rateio overhead)
  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ["expenses", id],
    queryFn: () => expensesService.getExpenses({ fairId: id! }),
    enabled: !!id,
  });

  // Query para buscar contas bancárias
  const { data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => expensesService.getAccounts(),
  });

  // Query para buscar lista de todas as feiras
  const { data: fairsList } = useQuery({
    queryKey: ["fairs"],
    queryFn: () => fairService.getFairs(),
  });

  // Mutation para criar despesa overhead
  const createOverheadMutation = useMutation({
    mutationFn: (data: CreateOverheadExpenseForm) =>
      expensesService.createOverheadExpense(data),
    onSuccess: () => {
      toast.success("Despesa overhead criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["expenses", id] });
      queryClient.invalidateQueries({ queryKey: ["expenses-total", id] });
      queryClient.invalidateQueries({ queryKey: ["fairs", id] });
      queryClient.invalidateQueries({ queryKey: ["fairs"] });
      setIsOverheadFormOpen(false);
    },
    onError: (error) => {
      console.error("Erro ao criar despesa overhead:", error);
      toast.error("Erro ao criar despesa overhead. Tente novamente.");
    },
  });

  // Mutation para atualizar despesa overhead
  const updateOverheadMutation = useMutation({
    mutationFn: ({ overheadId, data }: { overheadId: string; data: UpdateOverheadExpenseForm }) =>
      expensesService.updateOverheadExpense(overheadId, data),
    onSuccess: () => {
      toast.success("Despesa overhead atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["expenses", id] });
      queryClient.invalidateQueries({ queryKey: ["expenses-total", id] });
      queryClient.invalidateQueries({ queryKey: ["fairs", id] });
      queryClient.invalidateQueries({ queryKey: ["fairs"] });
      setIsOverheadFormOpen(false);
      setEditingOverhead(null);
    },
    onError: (error) => {
      console.error("Erro ao atualizar despesa overhead:", error);
      toast.error("Erro ao atualizar despesa overhead. Tente novamente.");
    },
  });

  // Mutation para deletar despesa overhead
  const deleteOverheadMutation = useMutation({
    mutationFn: (overheadId: string) => expensesService.deleteOverheadExpense(overheadId),
    onSuccess: () => {
      toast.success("Despesa overhead removida com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["expenses", id] });
      queryClient.invalidateQueries({ queryKey: ["expenses-total", id] });
      queryClient.invalidateQueries({ queryKey: ["fairs", id] });
      queryClient.invalidateQueries({ queryKey: ["fairs"] });
      setOverheadToDelete(null);
    },
    onError: (error) => {
      console.error("Erro ao remover despesa overhead:", error);
      toast.error("Erro ao remover despesa overhead. Tente novamente.");
    },
  });

  const startEdit = (s: string) => setEditing(s);
  const cancelEdit = () => setEditing(null);

  const save = (_section: string, data: UpdateFairForm) => {
    if (!id) return;
    updateMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          setEditing(null);
          toast.success("Seção atualizada!");
        },
      }
    );
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-64 bg-white/10" />
        <Skeleton className="h-40 w-full bg-white/10 rounded-2xl" />
        <Skeleton className="h-40 w-full bg-white/10 rounded-2xl" />
        <Skeleton className="h-40 w-full bg-white/10 rounded-2xl" />
      </div>
    );
  }

  if (!fair) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-white/40 text-lg">Feira não encontrada</p>
        <Button variant="ghost" onClick={() => navigate("/fairs")} className="text-white/60 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Feiras
        </Button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[fair.status] ?? STATUS_CONFIG.upcoming;

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ── Cabeçalho ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/fairs")}
            className="mt-0.5 shrink-0 text-white/40 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-black text-white truncate">{fair.name}</h1>
              {fair.edition && (
                <span className="text-sm text-white/40 font-normal">{fair.edition}</span>
              )}
              <Badge variant="outline" className={`text-[10px] font-bold px-2 shrink-0 ${statusCfg.className}`}>
                {statusCfg.label}
              </Badge>
              {!fair.isActive && (
                <Badge variant="outline" className="text-[10px] text-orange-400 border-orange-500/30 bg-orange-500/10 shrink-0">
                  Inativa
                </Badge>
              )}
            </div>
            {fair.description && (
              <p className="text-sm text-white/40 mt-0.5 line-clamp-1">{fair.description}</p>
            )}
          </div>
        </div>

        {/* Ações globais */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toggleMutation.mutate(fair.id)}
            disabled={toggleMutation.isPending}
            className="h-8 text-white/40 hover:text-white hover:bg-white/10 hidden sm:flex"
          >
            {fair.isActive
              ? <><ToggleLeft className="h-3.5 w-3.5 mr-1.5" /> Desativar</>
              : <><ToggleRight className="h-3.5 w-3.5 mr-1.5" /> Ativar</>
            }
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Excluir
          </Button>

          <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <AlertDialogContent className="bg-brand-blue border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" /> Excluir feira?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-white/50">
                  A feira <strong className="text-white">{fair.name}</strong> será excluída permanentemente.
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() =>
                    deleteMutation.mutate(fair.id, {
                      onSuccess: () => navigate("/fairs"),
                    })
                  }
                >
                  Excluir permanentemente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Banner */}
      {fair.bannerUrl && (
        <div className="h-48 rounded-2xl overflow-hidden border border-white/10">
          <img src={fair.bannerUrl} alt={fair.name} className="w-full h-full object-cover" />
        </div>
      )}

      {/* ── Seção 1: Identidade ──────────────────────────────────────────── */}
      <IdentitySection
        fair={fair}
        isEditing={editing === "identity"}
        isSaving={saving}
        onEdit={() => startEdit("identity")}
        onCancel={cancelEdit}
        onSave={(data) => save("identity", data)}
      />

      {/* ── Seção 2: Local ────────────────────────────────────────────────── */}
      <LocationSection
        fair={fair}
        isEditing={editing === "location"}
        isSaving={saving}
        onEdit={() => startEdit("location")}
        onCancel={cancelEdit}
        onSave={(data) => save("location", data)}
      />

      {/* ── Seção 3: Datas e Horários ─────────────────────────────────────── */}
      <ScheduleSection
        fair={fair}
        isEditing={editing === "schedule"}
        isSaving={saving}
        onEdit={() => startEdit("schedule")}
        onCancel={cancelEdit}
        onSave={(data) => save("schedule", data)}
      />

      {/* ── Seção 4: Planejamento ─────────────────────────────────────────── */}
      <PlanningSection
        fair={fair}
        isEditing={editing === "planning"}
        isSaving={saving}
        onEdit={() => startEdit("planning")}
        onCancel={cancelEdit}
        onSave={(data) => save("planning", data)}
      />

      {/* ── Seção 5: Financeiro ───────────────────────────────────────────── */}
      <FinancialSection
        fair={fair}
        isEditing={editing === "financial"}
        isSaving={saving}
        onEdit={() => startEdit("financial")}
        onCancel={cancelEdit}
        onSave={(data) => save("financial", data)}
      />

      {/* ── Seção 6: Configuração de Stands ──────────────────────────────── */}
      <StandsSection
        fair={fair}
        isEditing={editing === "stands"}
        isSaving={saving}
        onEdit={() => startEdit("stands")}
        onCancel={cancelEdit}
        onSave={(data) => save("stands", data)}
      />

      {/* ── Seção 7: Rateio de Custos (Overhead) ─────────────────────────── */}
      <OverheadSection
        fair={fair}
        expenses={expensesData?.allocatedOverhead || []}
        isLoading={expensesLoading}
        onAdd={() => {
          setEditingOverhead({
            isInitialTemplate: true,
            allocations: [
              {
                fairId: fair.id,
                percentual: 1.0,
              }
            ],
            data: new Date().toISOString().split("T")[0],
          } as any);
          setIsOverheadFormOpen(true);
        }}
        onEdit={(expense) => {
          setEditingOverhead(expense);
          setIsOverheadFormOpen(true);
        }}
        onDelete={(expense) => setOverheadToDelete(expense)}
      />

      {/* Modal de Formulário Despesa Overhead */}
      {isOverheadFormOpen && (
        <ExpenseForm
          isOpen={isOverheadFormOpen}
          onClose={() => {
            setIsOverheadFormOpen(false);
            setEditingOverhead(null);
          }}
          onSubmit={(submittedData) => {
            if (editingOverhead && !("isInitialTemplate" in editingOverhead)) {
              updateOverheadMutation.mutate({
                overheadId: editingOverhead.id,
                data: submittedData.payload as UpdateOverheadExpenseForm,
              });
            } else {
              createOverheadMutation.mutate(submittedData.payload as CreateOverheadExpenseForm);
            }
          }}
          expense={editingOverhead}
          accounts={accounts || []}
          fairsList={fairsList || []}
          isLoading={createOverheadMutation.isPending || updateOverheadMutation.isPending}
          defaultShared={true}
        />
      )}

      {/* Dialog de Confirmação de Exclusão Despesa Overhead */}
      <AlertDialog open={!!overheadToDelete} onOpenChange={() => setOverheadToDelete(null)}>
        <AlertDialogContent className="bg-brand-blue border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" /> Excluir rateio de custo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              O rateio da despesa overhead <strong className="text-white">{overheadToDelete?.descricao || "Sem descrição"}</strong> será excluído permanentemente para todas as feiras associadas.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              onClick={() => setOverheadToDelete(null)}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (overheadToDelete) {
                  deleteOverheadMutation.mutate(overheadToDelete.id);
                }
              }}
            >
              Excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── SEÇÃO: IDENTIDADE ────────────────────────────────────────────────────────

interface SectionProps {
  fair: NonNullable<ReturnType<typeof useFair>["data"]>;
  isEditing: boolean;
  isSaving?: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: UpdateFairForm) => void;
}

function IdentitySection({ fair, isEditing, isSaving, onEdit, onCancel, onSave }: SectionProps) {
  const [name, setName] = useState(fair.name ?? "");
  const [edition, setEdition] = useState(fair.edition ?? "");
  const [description, setDescription] = useState(fair.description ?? "");
  const [bannerUrl, setBannerUrl] = useState(fair.bannerUrl ?? "");
  const [status, setStatus] = useState<FairStatus>(fair.status ?? "upcoming");

  const reset = () => {
    setName(fair.name ?? "");
    setEdition(fair.edition ?? "");
    setDescription(fair.description ?? "");
    setBannerUrl(fair.bannerUrl ?? "");
    setStatus(fair.status ?? "upcoming");
  };

  const handleSave = () => {
    if (!name.trim()) { toast.error("Nome é obrigatório"); return; }
    onSave({ name: name.trim(), edition: edition || undefined, description: description || undefined, bannerUrl: bannerUrl || undefined, status });
  };

  return (
    <SectionCard
      icon={<Info className="h-4 w-4" />}
      title="Identidade"
      isEditing={isEditing}
      isSaving={isSaving}
      onEdit={onEdit}
      onSave={handleSave}
      onCancel={() => { reset(); onCancel(); }}
    >
      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <EditField label="Nome *" value={name} onChange={setName} placeholder="Ex: ExpoMultimix Manaus 2026" />
            </div>
            <EditField label="Edição" value={edition} onChange={setEdition} placeholder="Ex: 5ª Edição" />
          </div>
          <div>
            <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 block">Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Descrição curta da feira"
              className="bg-white/5 border-white/15 text-white placeholder:text-white/20 focus:border-brand-cyan/50 resize-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 block">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as FairStatus)}>
                <SelectTrigger className="bg-white/5 border-white/15 text-white h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1e3d] border-white/10 text-white">
                  {(Object.entries(STATUS_CONFIG) as [FairStatus, typeof STATUS_CONFIG[FairStatus]][]).map(([v, cfg]) => (
                    <SelectItem key={v} value={v} className="focus:bg-white/10 focus:text-white">{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <EditField label="Banner (URL da imagem)" value={bannerUrl} onChange={setBannerUrl} placeholder="https://..." />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <Field label="Nome" value={fair.name} />
          </div>
          <Field label="Edição" value={fair.edition} />
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Status</p>
            <Badge variant="outline" className={`text-[10px] font-bold ${STATUS_CONFIG[fair.status]?.className}`}>
              {STATUS_CONFIG[fair.status]?.label}
            </Badge>
          </div>
          {fair.description && (
            <div className="sm:col-span-2 lg:col-span-4">
              <Field label="Descrição" value={fair.description} />
            </div>
          )}
          {fair.bannerUrl && (
            <div className="sm:col-span-2 lg:col-span-4">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Banner</p>
              <a href={fair.bannerUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-brand-cyan/70 hover:text-brand-cyan flex items-center gap-1 truncate">
                <Image className="h-3 w-3 shrink-0" />
                <span className="truncate">{fair.bannerUrl}</span>
              </a>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

// ─── SEÇÃO: LOCAL ─────────────────────────────────────────────────────────────

function LocationSection({ fair, isEditing, isSaving, onEdit, onCancel, onSave }: SectionProps) {
  const [venueName, setVenueName] = useState(fair.venueName ?? "");
  const [location, setLocation] = useState(fair.location ?? "");
  const [address, setAddress] = useState(fair.address ?? "");
  const [number, setNumber] = useState(fair.number ?? "");
  const [complement, setComplement] = useState(fair.complement ?? "");
  const [neighborhood, setNeighborhood] = useState(fair.neighborhood ?? "");
  const [city, setCity] = useState(fair.city ?? "");
  const [state, setState] = useState(fair.state ?? "");
  const [zipCode, setZipCode] = useState(fair.zipCode ?? "");
  const [country, setCountry] = useState(fair.country ?? "Brasil");
  const [googleMapsUrl, setGoogleMapsUrl] = useState(fair.googleMapsUrl ?? "");
  const [latitude, setLatitude] = useState(fair.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(fair.longitude?.toString() ?? "");

  const reset = () => {
    setVenueName(fair.venueName ?? ""); setLocation(fair.location ?? ""); setAddress(fair.address ?? "");
    setNumber(fair.number ?? ""); setComplement(fair.complement ?? ""); setNeighborhood(fair.neighborhood ?? "");
    setCity(fair.city ?? ""); setState(fair.state ?? ""); setZipCode(fair.zipCode ?? "");
    setCountry(fair.country ?? "Brasil"); setGoogleMapsUrl(fair.googleMapsUrl ?? "");
    setLatitude(fair.latitude?.toString() ?? ""); setLongitude(fair.longitude?.toString() ?? "");
  };

  const handleSave = () => {
    const data: UpdateFairForm = {};
    if (venueName) data.venueName = venueName;
    if (location) data.location = location;
    if (address) data.address = address;
    if (number) data.number = number;
    if (complement) data.complement = complement;
    if (neighborhood) data.neighborhood = neighborhood;
    if (city) data.city = city;
    if (state) data.state = state.toUpperCase();
    if (zipCode) data.zipCode = zipCode;
    if (country) data.country = country;
    if (googleMapsUrl) data.googleMapsUrl = googleMapsUrl;
    if (latitude) data.latitude = parseFloat(latitude);
    if (longitude) data.longitude = parseFloat(longitude);
    onSave(data);
  };

  const hasTransportLinks = fair.transportLinks &&
    Object.values(fair.transportLinks).some(Boolean);

  return (
    <SectionCard
      icon={<MapPin className="h-4 w-4" />}
      title="Local"
      isEditing={isEditing}
      isSaving={isSaving}
      onEdit={onEdit}
      onSave={handleSave}
      onCancel={() => { reset(); onCancel(); }}
    >
      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EditField label="Nome do Local" value={venueName} onChange={setVenueName} placeholder="Ex: Centro de Convenções Vasco Vasques" />
            <EditField label="Localização (texto livre)" value={location} onChange={setLocation} placeholder="Ex: Manaus, AM" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <EditField label="Logradouro" value={address} onChange={setAddress} placeholder="Ex: Av. Djalma Batista" />
            </div>
            <EditField label="Número" value={number} onChange={setNumber} placeholder="1350" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <EditField label="Complemento" value={complement} onChange={setComplement} placeholder="Bloco A" />
            <EditField label="Bairro" value={neighborhood} onChange={setNeighborhood} placeholder="Chapada" />
            <EditField label="CEP" value={zipCode} onChange={setZipCode} placeholder="69050-010" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <EditField label="Cidade" value={city} onChange={setCity} placeholder="Manaus" />
            <div>
              <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 block">UF</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger className="bg-white/5 border-white/15 text-white h-9">
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1e3d] border-white/10 text-white">
                  {BR_STATES.map((uf) => (
                    <SelectItem key={uf} value={uf} className="focus:bg-white/10 focus:text-white">{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <EditField label="País" value={country} onChange={setCountry} placeholder="Brasil" />
          </div>
          <EditField label="URL Google Maps" value={googleMapsUrl} onChange={setGoogleMapsUrl} placeholder="https://maps.app.goo.gl/..." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EditField label="Latitude" value={latitude} onChange={setLatitude} type="number" step="any" placeholder="-3.1190275" />
            <EditField label="Longitude" value={longitude} onChange={setLongitude} type="number" step="any" placeholder="-60.0217314" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fair.venueName && <Field label="Nome do Local" value={fair.venueName} />}
            {fair.location && <Field label="Localização" value={fair.location} />}
          </div>

          {(fair.address || fair.city) && (
            <div className="bg-white/3 rounded-xl p-4 space-y-1">
              {fair.venueName && <p className="text-sm font-semibold text-white/80">{fair.venueName}</p>}
              {(fair.address || fair.number) && (
                <p className="text-sm text-white/60">{[fair.address, fair.number].filter(Boolean).join(", ")}</p>
              )}
              {(fair.complement || fair.neighborhood) && (
                <p className="text-sm text-white/60">{[fair.complement, fair.neighborhood].filter(Boolean).join(" — ")}</p>
              )}
              {(fair.city || fair.state) && (
                <p className="text-sm text-white/60">
                  {[fair.city, fair.state].filter(Boolean).join(" — ")}
                  {fair.zipCode ? ` · ${fair.zipCode}` : ""}
                </p>
              )}
              {fair.latitude && fair.longitude && (
                <p className="text-xs text-white/30 mt-1 flex items-center gap-1">
                  <Navigation className="h-3 w-3" /> {fair.latitude}, {fair.longitude}
                </p>
              )}
            </div>
          )}

          {/* Links de transporte */}
          {hasTransportLinks && (
            <div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Links de Transporte</p>
              <div className="flex flex-wrap gap-2">
                {fair.transportLinks?.googleMaps && (
                  <a href={fair.transportLinks.googleMaps} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border border-blue-500/20 transition-colors">
                    <ExternalLink className="h-3 w-3" /> Google Maps
                  </a>
                )}
                {fair.transportLinks?.waze && (
                  <a href={fair.transportLinks.waze} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/20 transition-colors">
                    <Navigation className="h-3 w-3" /> Waze
                  </a>
                )}
                {fair.transportLinks?.uber && (
                  <a href={fair.transportLinks.uber} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 transition-colors">
                    Uber
                  </a>
                )}
                {fair.transportLinks?.taxi99 && (
                  <a href={fair.transportLinks.taxi99} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20 border border-yellow-500/20 transition-colors">
                    99
                  </a>
                )}
              </div>
            </div>
          )}

          {!fair.venueName && !fair.city && !fair.address && !fair.location && (
            <p className="text-sm text-white/30 italic">Nenhuma informação de local cadastrada</p>
          )}
        </div>
      )}
    </SectionCard>
  );
}

// ─── SEÇÃO: DATAS E HORÁRIOS ──────────────────────────────────────────────────

function ScheduleSection({ fair, isEditing, isSaving, onEdit, onCancel, onSave }: SectionProps) {
  const [startDate, setStartDate] = useState(fair.startDate ?? "");
  const [endDate, setEndDate] = useState(fair.endDate ?? "");
  const [startTime, setStartTime] = useState(fair.startTime ?? "");
  const [endTime, setEndTime] = useState(fair.endTime ?? "");
  const [schedules, setSchedules] = useState<DaySchedule[]>(fair.daySchedules ?? []);

  const reset = () => {
    setStartDate(fair.startDate ?? ""); setEndDate(fair.endDate ?? "");
    setStartTime(fair.startTime ?? ""); setEndTime(fair.endTime ?? "");
    setSchedules(fair.daySchedules ?? []);
  };

  const addSchedule = () =>
    setSchedules((p) => [...p, { date: "", startTime: "", endTime: "", note: "" }]);

  const removeSchedule = (i: number) =>
    setSchedules((p) => p.filter((_, idx) => idx !== i));

  const updateSchedule = (i: number, field: keyof DaySchedule, value: string) =>
    setSchedules((p) => { const u = [...p]; u[i] = { ...u[i], [field]: value }; return u; });

  const handleSave = () => {
    const data: UpdateFairForm = {};
    if (startDate) data.startDate = startDate;
    if (endDate) data.endDate = endDate;
    if (startTime) data.startTime = startTime;
    if (endTime) data.endTime = endTime;
    const valid = schedules.filter((s) => s.date && s.startTime && s.endTime);
    if (valid.length > 0) {
      data.daySchedules = valid.map(({ id: _id, ...rest }) => rest);
    }
    onSave(data);
  };

  const startFmt = fmtDate(fair.startDate);
  const endFmt = fmtDate(fair.endDate);
  const dateRange = !startFmt ? null
    : startFmt === endFmt || !endFmt ? startFmt
    : `${startFmt} a ${endFmt}`;

  return (
    <SectionCard
      icon={<Calendar className="h-4 w-4" />}
      title="Datas e Horários"
      isEditing={isEditing}
      isSaving={isSaving}
      onEdit={onEdit}
      onSave={handleSave}
      onCancel={() => { reset(); onCancel(); }}
    >
      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <EditField label="Data de Início" value={startDate} onChange={setStartDate} type="date" />
            <EditField label="Data de Fim" value={endDate} onChange={setEndDate} type="date" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <EditField label="Abertura (padrão)" value={startTime} onChange={setStartTime} type="time" />
            <EditField label="Encerramento (padrão)" value={endTime} onChange={setEndTime} type="time" />
          </div>

          {/* Programação por dia */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Programação por dia</p>
              <Button type="button" size="sm" variant="ghost"
                onClick={addSchedule}
                className="h-7 text-white/40 hover:text-white hover:bg-white/10 text-xs">
                <Plus className="h-3 w-3 mr-1" /> Adicionar dia
              </Button>
            </div>
            {schedules.map((s, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end bg-white/3 rounded-xl p-3">
                <div className="col-span-4">
                  <Label className="text-[10px] text-white/30 block mb-1">Data</Label>
                  <Input type="date" value={s.date} onChange={(e) => updateSchedule(i, "date", e.target.value)}
                    className="bg-white/5 border-white/15 text-white h-8 text-xs" />
                </div>
                <div className="col-span-2">
                  <Label className="text-[10px] text-white/30 block mb-1">Abertura</Label>
                  <Input type="time" value={s.startTime} onChange={(e) => updateSchedule(i, "startTime", e.target.value)}
                    className="bg-white/5 border-white/15 text-white h-8 text-xs" />
                </div>
                <div className="col-span-2">
                  <Label className="text-[10px] text-white/30 block mb-1">Fechamento</Label>
                  <Input type="time" value={s.endTime} onChange={(e) => updateSchedule(i, "endTime", e.target.value)}
                    className="bg-white/5 border-white/15 text-white h-8 text-xs" />
                </div>
                <div className="col-span-3">
                  <Label className="text-[10px] text-white/30 block mb-1">Obs</Label>
                  <Input value={s.note ?? ""} onChange={(e) => updateSchedule(i, "note", e.target.value)}
                    placeholder="Abertura oficial…"
                    className="bg-white/5 border-white/15 text-white h-8 text-xs placeholder:text-white/20" />
                </div>
                <div className="col-span-1">
                  <Button type="button" size="sm" variant="ghost"
                    onClick={() => removeSchedule(i)}
                    className="h-8 w-8 p-0 text-red-400/60 hover:text-red-400 hover:bg-red-500/10">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Período" value={dateRange} />
            <Field label="Duração"
              value={fair.durationDays ? `${fair.durationDays} ${fair.durationDays === 1 ? "dia" : "dias"}` : null} />
            <Field label="Horário padrão"
              value={fair.startTime ? `${fair.startTime}${fair.endTime ? ` – ${fair.endTime}` : ""}` : null} />
          </div>

          {fair.daySchedules && fair.daySchedules.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Programação por dia</p>
              <div className="space-y-1.5">
                {fair.daySchedules.map((ds, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/3 rounded-xl px-4 py-2.5">
                    <Clock className="h-3.5 w-3.5 text-white/30 shrink-0" />
                    <span className="text-xs font-semibold text-white/70 w-24 shrink-0">{fmtDate(ds.date)}</span>
                    <span className="text-xs text-white/50">{ds.startTime} – {ds.endTime}</span>
                    {ds.note && <span className="text-xs text-white/30 italic ml-auto">{ds.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!dateRange && !fair.startTime && (
            <p className="text-sm text-white/30 italic">Nenhuma data cadastrada</p>
          )}
        </div>
      )}
    </SectionCard>
  );
}

// ─── SEÇÃO: PLANEJAMENTO ──────────────────────────────────────────────────────

function PlanningSection({ fair, isEditing, isSaving, onEdit, onCancel, onSave }: SectionProps) {
  const [visitors, setVisitors] = useState(fair.expectedVisitors?.toString() ?? "");
  const [exhibitors, setExhibitors] = useState(fair.expectedExhibitors?.toString() ?? "");

  const reset = () => {
    setVisitors(fair.expectedVisitors?.toString() ?? "");
    setExhibitors(fair.expectedExhibitors?.toString() ?? "");
  };

  const handleSave = () => {
    const data: UpdateFairForm = {};
    if (visitors) data.expectedVisitors = parseInt(visitors, 10);
    if (exhibitors) data.expectedExhibitors = parseInt(exhibitors, 10);
    onSave(data);
  };

  return (
    <SectionCard
      icon={<Users className="h-4 w-4" />}
      title="Planejamento"
      isEditing={isEditing}
      isSaving={isSaving}
      onEdit={onEdit}
      onSave={handleSave}
      onCancel={() => { reset(); onCancel(); }}
    >
      {isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EditField label="Meta de Visitantes" value={visitors} onChange={setVisitors} type="number" placeholder="5000" />
          <EditField label="Nº de Expositores / Marcas" value={exhibitors} onChange={setExhibitors} type="number" placeholder="120" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-brand-cyan/60" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Visitantes esperados</p>
              <p className="text-xl font-black text-white">
                {fair.expectedVisitors ? Number(fair.expectedVisitors).toLocaleString("pt-BR") : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-pink/10 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-brand-pink/60" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Expositores / Marcas</p>
              <p className="text-xl font-black text-white">
                {fair.expectedExhibitors ? Number(fair.expectedExhibitors).toLocaleString("pt-BR") : "—"}
              </p>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ─── SEÇÃO: FINANCEIRO ────────────────────────────────────────────────────────

function FinancialSection({ fair, isEditing, isSaving, onEdit, onCancel, onSave }: SectionProps) {
  const [totalStands, setTotalStands] = useState(fair.totalStands?.toString() ?? "");
  const [costPerM2, setCostPerM2] = useState(fair.costPerSquareMeter?.toString() ?? "");
  const [setupCostPerM2, setSetupCostPerM2] = useState(fair.setupCostPerSquareMeter?.toString() ?? "");
  const [expectedRevenue, setExpectedRevenue] = useState(fair.expectedRevenue?.toString() ?? "");
  const [expectedProfit, setExpectedProfit] = useState(fair.expectedProfit?.toString() ?? "");
  const [expectedProfitMargin, setExpectedProfitMargin] = useState(fair.expectedProfitMargin?.toString() ?? "");

  const reset = () => {
    setTotalStands(fair.totalStands?.toString() ?? "");
    setCostPerM2(fair.costPerSquareMeter?.toString() ?? "");
    setSetupCostPerM2(fair.setupCostPerSquareMeter?.toString() ?? "");
    setExpectedRevenue(fair.expectedRevenue?.toString() ?? "");
    setExpectedProfit(fair.expectedProfit?.toString() ?? "");
    setExpectedProfitMargin(fair.expectedProfitMargin?.toString() ?? "");
  };

  const handleSave = () => {
    const data: UpdateFairForm = {};
    if (totalStands) data.totalStands = Number(totalStands);
    if (costPerM2) data.costPerSquareMeter = Number(costPerM2);
    if (setupCostPerM2) data.setupCostPerSquareMeter = Number(setupCostPerM2);
    if (expectedRevenue) data.expectedRevenue = Number(expectedRevenue);
    if (expectedProfit) data.expectedProfit = Number(expectedProfit);
    if (expectedProfitMargin) data.expectedProfitMargin = Number(expectedProfitMargin);
    onSave(data);
  };

  const kpis = [
    { label: "Receita Esperada", value: fmtCurrency(fair.expectedRevenue), accent: "text-green-400" },
    { label: "Lucro Esperado", value: fmtCurrency(fair.expectedProfit), accent: "text-emerald-400" },
    { label: "Margem (%)", value: Number(fair.expectedProfitMargin) > 0 ? `${Number(fair.expectedProfitMargin).toFixed(1)}%` : "—", accent: "text-brand-cyan" },
    { label: "Total de Stands", value: fair.totalStands?.toString() ?? "—", accent: "text-white" },
  ];

  return (
    <SectionCard
      icon={<DollarSign className="h-4 w-4" />}
      title="Financeiro"
      isEditing={isEditing}
      isSaving={isSaving}
      onEdit={onEdit}
      onSave={handleSave}
      onCancel={() => { reset(); onCancel(); }}
    >
      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <EditField label="Receita Esperada (R$)" value={expectedRevenue} onChange={setExpectedRevenue} type="number" step="0.01" placeholder="0.00" />
            <EditField label="Lucro Esperado (R$)" value={expectedProfit} onChange={setExpectedProfit} type="number" step="0.01" placeholder="0.00" />
            <EditField label="Margem de Lucro (%)" value={expectedProfitMargin} onChange={setExpectedProfitMargin} type="number" step="0.1" placeholder="0.0" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <EditField label="Total de Stands" value={totalStands} onChange={setTotalStands} type="number" placeholder="0" />
            <EditField label="Custo por m²" value={costPerM2} onChange={setCostPerM2} type="number" step="0.01" placeholder="0.00" />
            <EditField label="Custo de Montagem por m²" value={setupCostPerM2} onChange={setSetupCostPerM2} type="number" step="0.01" placeholder="0.00" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-white/3 rounded-xl p-3">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">{kpi.label}</p>
              <p className={`text-lg font-black ${kpi.accent}`}>{kpi.value}</p>
            </div>
          ))}
          {(Number(fair.costPerSquareMeter) > 0 || Number(fair.setupCostPerSquareMeter) > 0) && (
            <div className="col-span-2 sm:col-span-4 grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
              <Field label="Custo por m²" value={Number(fair.costPerSquareMeter) > 0 ? fmtCurrency(fair.costPerSquareMeter) : null} />
              <Field label="Custo de Montagem por m²" value={Number(fair.setupCostPerSquareMeter) > 0 ? fmtCurrency(fair.setupCostPerSquareMeter) : null} />
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

// ─── SEÇÃO: STANDS ────────────────────────────────────────────────────────────

function StandsSection({ fair, isEditing, isSaving, onEdit, onCancel, onSave }: SectionProps) {
  const [configs, setConfigs] = useState<StandConfiguration[]>(fair.standConfigurations ?? []);

  const reset = () => setConfigs(fair.standConfigurations ?? []);

  const add = () =>
    setConfigs((p) => [...p, { name: "", width: 0, height: 0, quantity: 0, pricePerSquareMeter: 0, setupCostPerSquareMeter: 0 }]);

  const remove = (i: number) => setConfigs((p) => p.filter((_, idx) => idx !== i));

  const update = (i: number, field: keyof StandConfiguration, value: any) =>
    setConfigs((p) => { const u = [...p]; u[i] = { ...u[i], [field]: value }; return u; });

  const handleSave = () => {
    onSave({ standConfigurations: configs });
  };

  return (
    <SectionCard
      icon={<Building2 className="h-4 w-4" />}
      title="Configurações de Stands"
      isEditing={isEditing}
      isSaving={isSaving}
      onEdit={onEdit}
      onSave={handleSave}
      onCancel={() => { reset(); onCancel(); }}
    >
      {isEditing ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button type="button" size="sm" variant="ghost" onClick={add}
              className="h-8 text-white/40 hover:text-white hover:bg-white/10">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Adicionar Stand
            </Button>
          </div>

          {configs.length === 0 && (
            <p className="text-sm text-white/30 italic text-center py-4">Nenhum stand configurado</p>
          )}

          {configs.map((cfg, i) => (
            <div key={i} className="bg-white/3 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white/50">Stand {i + 1}</p>
                <Button type="button" size="sm" variant="ghost" onClick={() => remove(i)}
                  className="h-7 w-7 p-0 text-red-400/60 hover:text-red-400 hover:bg-red-500/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] text-white/30 block mb-1">Nome</Label>
                  <Input value={cfg.name} onChange={(e) => update(i, "name", e.target.value)}
                    placeholder="Stand 2x3" className="bg-white/5 border-white/15 text-white h-8 text-xs placeholder:text-white/20" />
                </div>
                <div>
                  <Label className="text-[10px] text-white/30 block mb-1">Descrição</Label>
                  <Input value={cfg.description ?? ""} onChange={(e) => update(i, "description", e.target.value)}
                    placeholder="Opcional" className="bg-white/5 border-white/15 text-white h-8 text-xs placeholder:text-white/20" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label className="text-[10px] text-white/30 block mb-1">Largura (m)</Label>
                  <Input type="number" step="0.1" value={cfg.width} onChange={(e) => update(i, "width", Number(e.target.value))}
                    className="bg-white/5 border-white/15 text-white h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-[10px] text-white/30 block mb-1">Altura (m)</Label>
                  <Input type="number" step="0.1" value={cfg.height} onChange={(e) => update(i, "height", Number(e.target.value))}
                    className="bg-white/5 border-white/15 text-white h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-[10px] text-white/30 block mb-1">Qtd</Label>
                  <Input type="number" value={cfg.quantity} onChange={(e) => update(i, "quantity", Number(e.target.value))}
                    className="bg-white/5 border-white/15 text-white h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-[10px] text-white/30 block mb-1">Área (m²)</Label>
                  <Input value={(cfg.width * cfg.height * cfg.quantity).toFixed(2)} disabled
                    className="bg-white/5 border-white/10 text-white/40 h-8 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] text-white/30 block mb-1">Preço por m²</Label>
                  <Input type="number" step="0.01" value={cfg.pricePerSquareMeter} onChange={(e) => update(i, "pricePerSquareMeter", Number(e.target.value))}
                    className="bg-white/5 border-white/15 text-white h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-[10px] text-white/30 block mb-1">Custo montagem por m²</Label>
                  <Input type="number" step="0.01" value={cfg.setupCostPerSquareMeter} onChange={(e) => update(i, "setupCostPerSquareMeter", Number(e.target.value))}
                    className="bg-white/5 border-white/15 text-white h-8 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 bg-white/3 rounded-lg px-3 py-2 text-xs">
                <span className="text-white/40">Valor total: <strong className="text-white">{fmtCurrency(cfg.width * cfg.height * cfg.quantity * cfg.pricePerSquareMeter)}</strong></span>
                <span className="text-white/40">Montagem: <strong className="text-white">{fmtCurrency(cfg.width * cfg.height * cfg.quantity * cfg.setupCostPerSquareMeter)}</strong></span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {(!fair.standConfigurations || fair.standConfigurations.length === 0) && (
            <p className="text-sm text-white/30 italic">Nenhuma configuração de stand cadastrada</p>
          )}
          {fair.standConfigurations?.map((cfg, i) => (
            <div key={i} className="flex items-center justify-between bg-white/3 rounded-xl px-4 py-3">
              <div>
                <p className="font-semibold text-sm text-white/80">{cfg.name}</p>
                <p className="text-xs text-white/40 mt-0.5">
                  {cfg.width}m × {cfg.height}m · {cfg.quantity} {cfg.quantity === 1 ? "unidade" : "unidades"}
                  {cfg.description ? ` · ${cfg.description}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-sm text-white">{fmtCurrency(cfg.width * cfg.height * cfg.quantity * cfg.pricePerSquareMeter)}</p>
                <p className="text-[10px] text-white/30">{fmtCurrency(cfg.pricePerSquareMeter)}/m²</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

// ─── SEÇÃO: RATEIO DE CUSTOS OVERHEAD ──────────────────────────────────────────

interface OverheadSectionProps {
  fair: Fair;
  expenses: AllocatedOverheadExpense[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (expense: AllocatedOverheadExpense) => void;
  onDelete: (expense: AllocatedOverheadExpense) => void;
}

function OverheadSection({
  fair,
  expenses,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
}: OverheadSectionProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white/80 uppercase tracking-widest">
          <span className="text-white/40"><DollarSign className="h-4 w-4" /></span>
          Rateio de Custos (Overhead)
        </h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={onAdd}
          className="h-8 text-white/40 hover:text-white hover:bg-white/10"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Rateio
        </Button>
      </div>
      <div className="p-5 space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full bg-white/5 rounded-xl" />
            <Skeleton className="h-12 w-full bg-white/5 rounded-xl" />
          </div>
        ) : expenses.length === 0 ? (
          <p className="text-sm text-white/30 italic text-center py-4">
            Nenhum custo overhead rateado para esta feira.
          </p>
        ) : (
          <div className="space-y-3">
            {expenses.map((item) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white/3 border border-white/5 rounded-xl hover:border-white/10 transition-all"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-white/70 border border-white/10">
                      {item.categoria}
                    </span>
                    <span className="text-xs text-white/40">{fmtDate(item.data)}</span>
                  </div>
                  <p className="font-semibold text-sm text-white truncate">
                    {item.descricao || "Sem descrição"}
                  </p>
                  {item.feirasRateadas && item.feirasRateadas.length > 1 && (
                    <div className="text-[11px] text-white/30 flex items-center gap-1.5 flex-wrap">
                      <span>Divisão do custo:</span>
                      {item.feirasRateadas.map((fr) => (
                        <span
                          key={fr.fairId}
                          className={`px-1.5 py-0.5 rounded bg-white/3 border border-white/5 ${
                            fr.fairId === fair.id ? "text-brand-cyan font-bold" : ""
                          }`}
                        >
                          {fr.fairName}: {(fr.percentual * 100).toFixed(0)}%
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      Total: {fmtCurrency(item.valorTotal)}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs text-brand-pink font-semibold bg-brand-pink/10 px-1.5 py-0.5 rounded border border-brand-pink/20">
                        {(item.percentualDesteFair * 100).toFixed(1)}%
                      </span>
                      <span className="text-sm font-black text-white">
                        {fmtCurrency(item.valorAlocado)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(item)}
                      className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/10"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(item)}
                      className="h-8 w-8 p-0 text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
