import { useState, useMemo, type ReactNode } from "react";
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
} from "@/hooks/useFinance";
import { useSearchParams } from "@/hooks/useSearchParams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Tag,
  Building2,
  AlertTriangle,
  CheckCircle2,
  ImageOff,
  Camera,
  Images,
} from "lucide-react";
import { ClientFormModal } from "./components/ClientFormModal";
import { BrandsModal } from "./components/BrandsModal";
import { ClientImagesModal } from "./components/ClientImagesModal";
import { FairGalleryTab } from "./components/FairGalleryTab";
import type { Client, CreateClientForm } from "@/interfaces/finance";

type FilterTab = "all" | "participating" | "others";
type PageTab = "expositores" | "galeria";

export function ClientsPage() {
  const [, , fairId] = useSearchParams();
  const [pageTab, setPageTab] = useState<PageTab>("expositores");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [brandsClient, setBrandsClient] = useState<Client | null>(null);
  const [imagesClient, setImagesClient] = useState<Client | null>(null);

  // Sempre busca todos — fairId apenas aciona a flag isParticipatingInFair
  const { data: clients = [], isLoading } = useClients(fairId);

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();

  const allClients = clients as Client[];

  const filtered = useMemo(() => {
    let list = allClients;

    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.cnpj?.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term) ||
          c.responsavel?.toLowerCase().includes(term)
      );
    }

    if (tab === "participating") {
      list = list.filter((c) => c.isParticipatingInFair === true);
    } else if (tab === "others") {
      list = list.filter((c) => c.isParticipatingInFair === false);
    }

    return list;
  }, [allClients, search, tab]);

  const participating = allClients.filter((c) => c.isParticipatingInFair === true).length;
  const others = allClients.filter((c) => c.isParticipatingInFair === false).length;
  const withBrands = allClients.filter((c) => (c.brands?.length ?? 0) > 0).length;

  const handleCreate = (data: Omit<CreateClientForm, "fairId">) => {
    if (!fairId) return;
    createMutation.mutate(
      { ...data, fairId },
      { onSuccess: () => setIsFormOpen(false) }
    );
  };

  const handleUpdate = (data: Omit<CreateClientForm, "fairId">) => {
    if (!editingClient) return;
    updateMutation.mutate(
      { id: editingClient.id, data },
      { onSuccess: () => setEditingClient(null) }
    );
  };

  const handleDelete = () => {
    if (!deletingClient) return;
    deleteMutation.mutate(deletingClient.id, {
      onSuccess: () => setDeletingClient(null),
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden bg-linear-to-br from-[#00aacd] to-[#EB2970] p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="relative z-10">
          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            Gestão de Feiras
          </p>
          <h1 className="text-3xl font-black text-white tracking-tighter">
            Expositores
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Todos os expositores cadastrados na plataforma
          </p>
        </div>
      </div>

      {/* Tabs de página */}
      <div className="flex gap-1 border-b border-slate-100 dark:border-white/10">
        {(
          [
            { key: "expositores", label: "Expositores", icon: <Building2 className="w-4 h-4" /> },
            { key: "galeria", label: "Galeria da Feira", icon: <Images className="w-4 h-4" /> },
          ] as { key: PageTab; label: string; icon: ReactNode }[]
        ).map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setPageTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-t-xl transition-colors ${
              pageTab === key
                ? "text-[#00aacd] border-b-2 border-[#00aacd] -mb-px bg-[#00aacd]/5"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Galeria da Feira */}
      {pageTab === "galeria" && (
        <FairGalleryTab fairId={fairId} />
      )}

      {/* Conteúdo da aba Expositores */}
      {pageTab === "expositores" && <>

      {/* KPI chips */}
      <div className="flex flex-wrap gap-3">
        <KpiChip
          icon={<Building2 className="w-4 h-4 text-[#00aacd]" />}
          value={allClients.length}
          label="Total"
        />
        {fairId && (
          <>
            <KpiChip
              icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
              value={participating}
              label="Nesta feira"
              className="bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30"
              valueClassName="text-green-700 dark:text-green-400"
            />
            {others > 0 && (
              <KpiChip
                icon={<Building2 className="w-4 h-4 text-slate-400" />}
                value={others}
                label="Outras feiras"
                className="bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10"
                valueClassName="text-slate-500"
              />
            )}
          </>
        )}
        <KpiChip
          icon={<Tag className="w-4 h-4 text-purple-500" />}
          value={withBrands}
          label="Com marcas"
          className="bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/30"
          valueClassName="text-purple-700 dark:text-purple-400"
        />
      </div>

      {/* Barra de ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome, CNPJ, email ou responsável..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          disabled={!fairId}
          title={!fairId ? "Selecione uma feira para criar um expositor" : undefined}
          className="bg-linear-to-br from-[#00aacd] to-[#EB2970] text-white font-bold shrink-0 disabled:opacity-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Expositor
        </Button>
      </div>

      {/* Tabs de filtro — só aparecem quando há fairId */}
      {fairId && (
        <div className="flex gap-2 border-b border-slate-100 dark:border-white/10 pb-1">
          {(
            [
              { key: "all", label: "Todos", count: allClients.length },
              { key: "participating", label: "Nesta feira", count: participating },
              { key: "others", label: "Outras feiras", count: others },
            ] as { key: FilterTab; label: string; count: number }[]
          ).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm font-bold rounded-t-xl transition-colors ${
                tab === key
                  ? "text-[#00aacd] border-b-2 border-[#00aacd] -mb-px"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              {label}
              <span className="ml-1.5 text-[10px] font-black bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 rounded-full px-1.5 py-0.5">
                {count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <GridSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState hasSearch={!!search} tab={tab} hasFair={!!fairId} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              hasFair={!!fairId}
              onEdit={() => setEditingClient(client)}
              onDelete={() => setDeletingClient(client)}
              onBrands={() => setBrandsClient(client)}
              onImages={() => { setImagesClient(client); }}
            />
          ))}
        </div>
      )}

      </> /* fim aba expositores */}

      {/* Modais — fora do condicional para não desmontar ao trocar aba */}
      <ClientFormModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
      />
      <ClientFormModal
        open={!!editingClient}
        onClose={() => setEditingClient(null)}
        onSubmit={handleUpdate}
        isPending={updateMutation.isPending}
        editingClient={editingClient}
      />
      <BrandsModal
        client={brandsClient}
        open={!!brandsClient}
        onClose={() => setBrandsClient(null)}
      />
      <ClientImagesModal
        client={imagesClient}
        open={!!imagesClient}
        fairId={fairId}
        onClose={() => setImagesClient(null)}
      />
      <AlertDialog
        open={!!deletingClient}
        onOpenChange={(o) => !o && setDeletingClient(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Expositor</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover{" "}
              <strong>{deletingClient?.name}</strong>? Todas as marcas vinculadas
              também serão excluídas. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

interface KpiChipProps {
  icon: ReactNode;
  value: number;
  label: string;
  className?: string;
  valueClassName?: string;
}

function KpiChip({ icon, value, label, className = "", valueClassName = "text-slate-800 dark:text-white" }: KpiChipProps) {
  return (
    <div className={`bg-white dark:bg-white/5 rounded-2xl px-5 py-3 border border-slate-100 dark:border-white/10 flex items-center gap-2 ${className}`}>
      {icon}
      <span className={`font-black ${valueClassName}`}>{value}</span>
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  );
}

interface ClientCardProps {
  client: Client;
  hasFair: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onBrands: () => void;
  onImages: () => void;
}

function ClientCard({ client, hasFair, onEdit, onDelete, onBrands, onImages }: ClientCardProps) {
  const brands = client.brands ?? [];
  const isParticipating = client.isParticipatingInFair === true;
  const isOther = hasFair && client.isParticipatingInFair === false;

  return (
    <div
      className={`
        relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-200
        hover:shadow-lg hover:-translate-y-0.5 group
        ${isParticipating
          ? "border-[#00aacd]/40 bg-white dark:bg-white/5 shadow-sm shadow-[#00aacd]/10"
          : isOther
          ? "border-slate-200 dark:border-white/8 bg-slate-50/50 dark:bg-white/3 opacity-70 hover:opacity-100"
          : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5"
        }
      `}
    >
      {/* Badge de participação */}
      {hasFair && (
        <div className="absolute top-2 left-2 z-10">
          {isParticipating ? (
            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-[#00aacd] text-white px-2 py-0.5 rounded-full shadow">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Nesta feira
            </span>
          ) : (
            <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
              Outra feira
            </span>
          )}
        </div>
      )}

      {/* Menu de ações */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-colors">
              <MoreHorizontal className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={onBrands}>
              <Tag className="w-3.5 h-3.5 mr-2" />
              Marcas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onImages}>
              <Camera className="w-3.5 h-3.5 mr-2" />
              Fotos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="w-3.5 h-3.5 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Área de logos das marcas */}
      <div
        className={`
          aspect-square w-full flex items-center justify-center cursor-pointer
          ${isParticipating
            ? "bg-linear-to-br from-[#00aacd]/8 to-[#EB2970]/8"
            : "bg-slate-100/60 dark:bg-white/5"
          }
        `}
        onClick={onBrands}
      >
        {brands.length === 0 ? (
          <div className="flex flex-col items-center gap-1 text-slate-300 dark:text-slate-600">
            <ImageOff className="w-8 h-8" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Sem marcas
            </span>
          </div>
        ) : brands.length === 1 ? (
          <img
            src={brands[0].logoUrl}
            alt={brands[0].name}
            className={`w-3/4 h-3/4 object-contain transition-all ${isOther ? "grayscale" : ""}`}
          />
        ) : (
          <div className="grid grid-cols-2 gap-1.5 w-full h-full p-3">
            {brands.slice(0, 4).map((b, i) => (
              <div
                key={b.id}
                className="relative flex items-center justify-center bg-white dark:bg-white/10 rounded-lg overflow-hidden"
              >
                <img
                  src={b.logoUrl}
                  alt={b.name}
                  title={b.name}
                  className={`w-full h-full object-contain p-1 transition-all ${isOther ? "grayscale" : ""}`}
                />
                {i === 3 && brands.length > 4 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                    <span className="text-white text-xs font-black">
                      +{brands.length - 3}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rodapé do card */}
      <div className="p-3 space-y-1">
        <p
          className={`font-bold text-sm leading-tight line-clamp-2 ${
            isOther ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-white"
          }`}
        >
          {client.name}
        </p>

        <div className="flex items-center justify-between gap-1">
          {client.cnpj ? (
            <span className="text-[10px] text-slate-400 truncate">{client.cnpj}</span>
          ) : (
            <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
              <AlertTriangle className="w-2.5 h-2.5" />
              Sem CNPJ
            </span>
          )}
          {brands.length > 0 && (
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 h-4 text-purple-600 border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700 shrink-0"
            >
              {brands.length} marca{brands.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-100 dark:border-white/10 overflow-hidden animate-pulse"
        >
          <div className="aspect-square bg-slate-100 dark:bg-white/5" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-lg w-3/4" />
            <div className="h-3 bg-slate-100 dark:bg-white/5 rounded-lg w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  hasSearch,
  tab,
  hasFair,
}: {
  hasSearch: boolean;
  tab: FilterTab;
  hasFair: boolean;
}) {
  const msgs: Record<FilterTab, string> = {
    all: hasSearch
      ? "Nenhum expositor encontrado para essa busca."
      : "Nenhum expositor cadastrado ainda.",
    participating: "Nenhum expositor participando desta feira.",
    others: "Todos os expositores estão nesta feira.",
  };

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
      <Building2 className="w-12 h-12 opacity-20" />
      <p className="font-medium text-slate-500">{msgs[tab]}</p>
      {!hasSearch && tab === "all" && hasFair && (
        <p className="text-sm">Clique em "Novo Expositor" para começar.</p>
      )}
    </div>
  );
}
