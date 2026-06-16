import React, { useEffect, useState, useCallback } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useProspectsService,
  type ProspectStatus,
  type ProspectType,
  type Prospect,
  type ProspectAnalytics,
  type ProspectGeoAnalytics,
  type DashboardOverview,
} from "@/service/prospects.service";
import { toast } from "sonner";
import {
  Target,
  Users,
  TrendingUp,
  Zap,
  RefreshCcw,
  Upload,
  Trash2,
  Search,
  Filter,
  Building2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  MapPin,
} from "lucide-react";

// ─── Config ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ProspectStatus,
  { label: string; color: string; bg: string; bar: string }
> = {
  NOVO: {
    label: "Novo",
    color: "text-gray-400",
    bg: "bg-gray-400/10 border-gray-400/20",
    bar: "bg-gray-400",
  },
  CONTATADO: {
    label: "Contatado",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    bar: "bg-blue-400",
  },
  RESPONDEU: {
    label: "Respondeu",
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/20",
    bar: "bg-amber-400",
  },
  INTERESSADO: {
    label: "Interessado",
    color: "text-orange-400",
    bg: "bg-orange-400/10 border-orange-400/20",
    bar: "bg-orange-400",
  },
  CONVERTIDO: {
    label: "Convertido",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
    bar: "bg-emerald-400",
  },
  DESCARTADO: {
    label: "Descartado",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/20",
    bar: "bg-red-400",
  },
};

const STATUS_ORDER: ProspectStatus[] = [
  "NOVO",
  "CONTATADO",
  "RESPONDEU",
  "INTERESSADO",
  "CONVERTIDO",
  "DESCARTADO",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCnpj(cnpj: string): string {
  const n = cnpj.replace(/\D/g, "");
  if (n.length !== 14) return cnpj;
  return `${n.slice(0, 2)}.${n.slice(2, 5)}.${n.slice(5, 8)}/${n.slice(8, 12)}-${n.slice(12)}`;
}

function countValidCnpjs(text: string): number {
  return text
    .split(/[\n,;]/)
    .map((s) => s.replace(/\D/g, ""))
    .filter((s) => s.length === 14).length;
}

import { ProspectMap } from "./ProspectMap";

// ─── Chart theme (consistent with dashboard) ──────────────────────────────────

const geoChartBase: ApexOptions = {
  chart: {
    background: "transparent",
    foreColor: "rgba(255,255,255,0.4)",
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: true, speed: 400 },
  },
  theme: { mode: "dark" },
  grid: { borderColor: "rgba(255,255,255,0.05)", strokeDashArray: 4 },
  tooltip: { theme: "dark", style: { fontSize: "12px" } },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 4,
      dataLabels: { position: "right" },
    },
  },
  dataLabels: {
    enabled: true,
    style: { fontSize: "10px", fontWeight: "bold" },
    offsetX: 4,
  },
  xaxis: {
    labels: {
      style: { colors: "rgba(255,255,255,0.3)", fontSize: "10px" },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: "rgba(255,255,255,0.5)", fontSize: "11px" },
      maxWidth: 120,
    },
  },
};

// ─── GeoSection ───────────────────────────────────────────────────────────────

interface GeoSectionProps {
  geo: ProspectGeoAnalytics;
  loading: boolean;
}

function GeoSection({ geo, loading }: GeoSectionProps) {
  // States chart — top 12
  const stateCategories = geo.charts?.stateBar?.categories?.slice(0, 12) ?? [];
  const stateSeries = [
    {
      name: "Prospects",
      data: geo.charts?.stateBar?.series?.[0]?.data?.slice(0, 12) ?? [],
    },
  ];

  // Cities chart — top 12 from byCity
  const topCities = (geo.byCity ?? []).slice(0, 12);
  const cityCategories = topCities.map((c) => `${c.city}/${c.state}`);
  const citySeries = [{ name: "Prospects", data: topCities.map((c) => c.count) }];

  // Neighborhoods chart — top 12
  const neighborhoodCategories =
    geo.charts?.neighborhoodBar?.categories?.slice(0, 12) ?? [];
  const neighborhoodSeries = [
    {
      name: "Prospects",
      data: geo.charts?.neighborhoodBar?.series?.[0]?.data?.slice(0, 12) ?? [],
    },
  ];

  const hasStates = stateCategories.length > 0;
  const hasCities = cityCategories.length > 0;
  const hasNeighborhoods = neighborhoodCategories.length > 0;

  const stateOptions: ApexOptions = {
    ...geoChartBase,
    colors: ["#00aacd"],
    xaxis: {
      ...geoChartBase.xaxis,
      categories: stateCategories,
    },
    dataLabels: { ...geoChartBase.dataLabels, formatter: (v) => String(v) },
  };

  const cityOptions: ApexOptions = {
    ...geoChartBase,
    colors: ["#EB2970"],
    xaxis: {
      ...geoChartBase.xaxis,
      categories: cityCategories,
    },
    dataLabels: { ...geoChartBase.dataLabels, formatter: (v) => String(v) },
  };

  const neighborhoodOptions: ApexOptions = {
    ...geoChartBase,
    colors: ["#f59e0b"],
    xaxis: {
      ...geoChartBase.xaxis,
      categories: neighborhoodCategories,
    },
    dataLabels: { ...geoChartBase.dataLabels, formatter: (v) => String(v) },
  };

  const barHeight = (count: number) => Math.max(count * 28 + 40, 120);

  const hasMap = !!geo.mapbox?.statesGeoJson?.features?.length;
  const hasNeighborhoodMap = !!geo.mapbox?.neighborhoodsGeoJson?.features?.length;

  return (
    <div className="glass-card border-white/5 rounded-[32px] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MapPin className="h-5 w-5 text-brand-pink" />
        <h2 className="text-sm font-black text-white uppercase tracking-widest">
          Distribuição Geográfica
        </h2>
        {hasMap && (
          <div className="flex items-center gap-1.5 ml-auto flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-pink inline-block" />
            <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">Estados</span>
            <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan inline-block ml-2" />
            <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">Cidades</span>
            {hasNeighborhoodMap && (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block ml-2" />
                <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">Bairros</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Map highlight ── */}
      {loading ? (
        <div className="h-[420px] bg-white/5 rounded-2xl animate-pulse" />
      ) : hasMap ? (
        <ProspectMap
          statesGeoJson={geo.mapbox!.statesGeoJson}
          citiesGeoJson={geo.mapbox!.citiesGeoJson}
          neighborhoodsGeoJson={geo.mapbox?.neighborhoodsGeoJson}
          fairCenter={geo.fairCenter}
          height={420}
        />
      ) : (
        <EmptyGeo label="Mapa disponível após enriquecimento dos CNPJs" height={200} />
      )}

      {/* ── Bar charts below the map ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* States bar */}
        <div className="space-y-2">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">
            Top Estados
          </p>
          {loading ? (
            <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
          ) : hasStates ? (
            <Chart
              type="bar"
              series={stateSeries}
              options={stateOptions}
              height={barHeight(stateCategories.length)}
            />
          ) : (
            <EmptyGeo label="Nenhum estado mapeado ainda" />
          )}
        </div>

        {/* Cities bar */}
        <div className="space-y-2">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">
            Top Cidades
          </p>
          {loading ? (
            <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
          ) : hasCities ? (
            <Chart
              type="bar"
              series={citySeries}
              options={cityOptions}
              height={barHeight(cityCategories.length)}
            />
          ) : (
            <EmptyGeo label="Nenhuma cidade mapeada ainda" />
          )}
        </div>
      </div>

      {/* Neighborhoods — full width */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">
          Top Bairros
          <span className="ml-2 text-white/15 normal-case font-normal tracking-normal">
            · populado conforme CNPJs são enriquecidos
          </span>
        </p>
        {loading ? (
          <div className="h-32 bg-white/5 rounded-xl animate-pulse" />
        ) : hasNeighborhoods ? (
          <Chart
            type="bar"
            series={neighborhoodSeries}
            options={neighborhoodOptions}
            height={barHeight(neighborhoodCategories.length)}
          />
        ) : (
          <EmptyGeo label="Bairros exibidos após enriquecimento dos CNPJs" />
        )}
      </div>
    </div>
  );
}

function EmptyGeo({ label, height = 96 }: { label: string; height?: number }) {
  return (
    <div
      style={{ height }}
      className="flex items-center justify-center border border-white/5 rounded-xl"
    >
      <p className="text-white/20 text-xs font-black uppercase tracking-widest text-center px-4">
        {label}
      </p>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

interface ProspectsTabProps {
  fairId?: string;
}

export const ProspectsTab: React.FC<ProspectsTabProps> = ({ fairId }) => {
  const {
    getDashboardOverview,
    getProspectAnalytics,
    getProspectGeoAnalytics,
    getProspects,
    updateProspectStatus,
    importCnpjs,
    enrichProspect,
    deleteProspect,
  } = useProspectsService();

  // Dashboard state
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [analytics, setAnalytics] = useState<ProspectAnalytics | null>(null);
  const [geoAnalytics, setGeoAnalytics] = useState<ProspectGeoAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Prospects list state
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [totalProspects, setTotalProspects] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingList, setLoadingList] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  // Import dialog
  const [showImport, setShowImport] = useState(false);
  const [importType, setImportType] = useState<ProspectType>("EXPOSITOR");
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);

  // Per-row action state
  const [enrichingId, setEnrichingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // ─── Data loaders ──────────────────────────────────────────────────────────

  const loadAnalytics = useCallback(async () => {
    if (!fairId) return;
    setLoadingAnalytics(true);
    const [ov, an, geo] = await Promise.all([
      getDashboardOverview(fairId),
      getProspectAnalytics(fairId),
      getProspectGeoAnalytics(fairId),
    ]);
    if (ov) setOverview(ov);
    if (an) setAnalytics(an);
    if (geo) setGeoAnalytics(geo);
    setLoadingAnalytics(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fairId]);

  const loadProspects = useCallback(async () => {
    if (!fairId) return;
    setLoadingList(true);
    const params: Record<string, string | number> = {
      page,
      limit: LIMIT,
    };
    if (filterType !== "ALL") params.type = filterType;
    if (filterStatus !== "ALL") params.status = filterStatus;
    if (search.trim()) params.search = search.trim();

    const result = await getProspects(fairId, params);
    if (result) {
      setProspects(Array.isArray(result.data) ? result.data : []);
      setTotalProspects(result.total ?? 0);
      setTotalPages(result.totalPages ?? 1);
    }
    setLoadingList(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fairId, page, filterType, filterStatus, search]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    loadProspects();
  }, [loadProspects]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filterType, filterStatus, search]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleStatusChange = async (
    prospect: Prospect,
    newStatus: ProspectStatus
  ) => {
    setUpdatingStatusId(prospect.id);
    const result = await updateProspectStatus(fairId!, prospect.id, newStatus);
    if (result) {
      setProspects((prev) =>
        prev.map((p) =>
          p.id === prospect.id ? { ...p, status: newStatus } : p
        )
      );
      toast.success(
        `Status atualizado para ${STATUS_CONFIG[newStatus].label}`
      );
    }
    setUpdatingStatusId(null);
  };

  const handleEnrich = async (prospect: Prospect) => {
    setEnrichingId(prospect.id);
    const result = await enrichProspect(fairId!, prospect.id);
    if (result) {
      setProspects((prev) =>
        prev.map((p) => (p.id === prospect.id ? result : p))
      );
      toast.success("Prospect enriquecido com sucesso");
    }
    setEnrichingId(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const ok = await deleteProspect(fairId!, id);
    if (ok) {
      setProspects((prev) => prev.filter((p) => p.id !== id));
      setTotalProspects((prev) => prev - 1);
      toast.success("Prospect removido");
    }
    setDeletingId(null);
  };

  const handleImport = async () => {
    if (!fairId || !importText.trim()) return;
    const cnpjs = importText
      .split(/[\n,;]/)
      .map((s) => s.replace(/\D/g, ""))
      .filter((s) => s.length === 14);

    if (!cnpjs.length) {
      toast.error("Nenhum CNPJ válido encontrado");
      return;
    }

    setImporting(true);
    const result = await importCnpjs(fairId, cnpjs, importType);
    setImporting(false);

    if (result) {
      toast.success(
        `Importados: ${result.imported} | Ignorados: ${result.skipped} | Erros: ${result.errors}`
      );
      setShowImport(false);
      setImportText("");
      loadProspects();
      loadAnalytics();
    }
  };

  // ─── Empty state ───────────────────────────────────────────────────────────

  if (!fairId) {
    return (
      <div className="glass-card border-white/5 rounded-[32px] p-12 flex flex-col items-center justify-center gap-4 text-center min-h-[300px]">
        <Target className="h-12 w-12 text-brand-pink/30" />
        <p className="text-white/30 font-black uppercase tracking-widest text-sm">
          Selecione uma feira no cabeçalho para ver os prospects
        </p>
      </div>
    );
  }

  // ─── Derived values ────────────────────────────────────────────────────────

  const attendanceRate =
    overview && overview.totalVisitors > 0
      ? ((overview.totalCheckIns / overview.totalVisitors) * 100).toFixed(1)
      : null;

  const funnelMax = Math.max(
    ...(analytics?.funnel?.map((f) => f.count) ?? [1]),
    1
  );
  const sectorMax = Math.max(
    ...(analytics?.sectorDistribution?.slice(0, 6).map((s) => s.count) ?? [1]),
    1
  );

  const kpis = [
    {
      label: "Inscritos",
      value: overview?.totalVisitors?.toLocaleString("pt-BR") ?? null,
      icon: <Users className="h-4 w-4" />,
      color: "text-brand-cyan",
    },
    {
      label: "Check-ins",
      value: overview?.totalCheckIns?.toLocaleString("pt-BR") ?? null,
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: "text-green-400",
    },
    {
      label: "Taxa Presença",
      value: attendanceRate ? `${attendanceRate}%` : null,
      icon: <TrendingUp className="h-4 w-4" />,
      color: "text-amber-400",
    },
    {
      label: "Prospects B2B",
      value: analytics?.overview?.total?.toLocaleString("pt-BR") ?? null,
      icon: <Target className="h-4 w-4" />,
      color: "text-brand-pink",
    },
    {
      label: "Convertidos",
      value:
        analytics?.overview?.conversionRate !== undefined
          ? `${analytics.overview.conversionRate.toFixed(1)}%`
          : null,
      icon: <Sparkles className="h-4 w-4" />,
      color: "text-emerald-400",
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map(({ label, value, icon, color }) => (
          <div
            key={label}
            className="glass-card border-white/5 rounded-2xl p-4 flex flex-col gap-1"
          >
            <div className={color}>{icon}</div>
            <p
              className={`text-2xl font-black leading-none mt-1 ${
                loadingAnalytics || value === null
                  ? "text-white/20"
                  : "text-white"
              }`}
            >
              {loadingAnalytics ? "…" : (value ?? "—")}
            </p>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-0.5">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Analytics charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Funnel */}
          <div className="glass-card border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest">
              Funil de Prospects B2B
            </h3>
            <div className="space-y-2.5">
              {STATUS_ORDER.map((status) => {
                const found = analytics.funnel?.find(
                  (f) => f.status === status
                );
                const count = found?.count ?? 0;
                const pct = funnelMax > 0 ? (count / funnelMax) * 100 : 0;
                const cfg = STATUS_CONFIG[status];
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest w-20 shrink-0 ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                    <div className="flex-1 bg-white/5 rounded-full h-1.5">
                      <div
                        className={`${cfg.bar} h-1.5 rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-white/40 text-xs font-black w-7 text-right tabular-nums">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sectors */}
          <div className="glass-card border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest">
              Setores — Top 6
            </h3>
            <div className="space-y-2.5">
              {(analytics.sectorDistribution?.slice(0, 6) ?? []).map(
                ({ sector, count, b2bPriority }) => {
                  const pct =
                    sectorMax > 0 ? (count / sectorMax) * 100 : 0;
                  return (
                    <div key={sector} className="flex items-center gap-3">
                      <span className="text-[9px] font-black text-white/40 truncate w-28 shrink-0">
                        {sector}
                      </span>
                      <div className="flex-1 bg-white/5 rounded-full h-1.5">
                        <div
                          className={`${
                            b2bPriority ? "bg-brand-pink" : "bg-white/25"
                          } h-1.5 rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-white/40 text-xs font-black w-7 text-right tabular-nums">
                        {count}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
            <p className="text-[9px] text-white/15 font-black uppercase tracking-widest">
              Rosa = setor B2B prioritário
            </p>
          </div>
        </div>
      )}

      {/* Geographic Distribution */}
      {geoAnalytics && (
        <GeoSection
          geo={geoAnalytics}
          loading={loadingAnalytics}
        />
      )}

      {/* Prospects list */}
      <div className="glass-card border-white/5 rounded-[32px] p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex flex-col sm:flex-row gap-2 flex-1 min-w-0">
            <div className="relative flex-1 min-w-0 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
              <Input
                placeholder="Buscar empresa, CNPJ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl text-sm h-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36 bg-white/5 border-white/10 text-white/60 rounded-xl h-9 text-[10px] font-black uppercase tracking-widest">
                <Filter className="h-3 w-3 mr-1 shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos tipos</SelectItem>
                <SelectItem value="EXPOSITOR">Expositor</SelectItem>
                <SelectItem value="VISITANTE">Visitante</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36 bg-white/5 border-white/10 text-white/60 rounded-xl h-9 text-[10px] font-black uppercase tracking-widest">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos status</SelectItem>
                {STATUS_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_CONFIG[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={loadProspects}
              disabled={loadingList}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all disabled:opacity-40"
            >
              <RefreshCcw
                className={`h-3.5 w-3.5 ${loadingList ? "animate-spin" : ""}`}
              />
            </button>
            <Button
              onClick={() => setShowImport(true)}
              className="bg-brand-pink hover:bg-brand-pink/90 text-white font-black uppercase tracking-widest rounded-xl h-9 text-[10px] px-4 shadow-lg shadow-brand-pink/20"
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Importar CNPJs
            </Button>
          </div>
        </div>

        {/* Column headers */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1.5fr_1fr_auto] gap-4 px-4 py-2 text-[9px] font-black text-white/20 uppercase tracking-widest border-b border-white/5">
          <span>Empresa</span>
          <span>CNPJ</span>
          <span>Setor</span>
          <span>Status</span>
          <span>Ações</span>
        </div>

        {/* Rows */}
        {loadingList ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-14 bg-white/5 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : !Array.isArray(prospects) || prospects.length === 0 ? (
          <div className="py-14 flex flex-col items-center gap-3 text-center">
            <Building2 className="h-10 w-10 text-white/10" />
            <p className="text-white/20 text-sm font-black uppercase tracking-widest">
              {search || filterType !== "ALL" || filterStatus !== "ALL"
                ? "Nenhum prospect encontrado com esses filtros"
                : "Nenhum prospect cadastrado para esta feira"}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {(Array.isArray(prospects) ? prospects : []).map((prospect) => {
              const cfg = STATUS_CONFIG[prospect.status];
              const isUpdating = updatingStatusId === prospect.id;
              const isEnriching = enrichingId === prospect.id;
              const isDeleting = deletingId === prospect.id;
              const displayName =
                prospect.nomeFantasia || prospect.razaoSocial;

              return (
                <div
                  key={prospect.id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1.5fr_1fr_auto] gap-3 md:gap-4 items-center px-4 py-3 bg-white/3 hover:bg-white/6 border border-white/5 rounded-2xl transition-all"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-bold truncate">
                        {displayName}
                      </p>
                      {prospect.isB2bPriority && (
                        <Badge className="bg-brand-pink/10 border border-brand-pink/20 text-brand-pink text-[8px] font-black uppercase tracking-widest shrink-0 px-1.5 py-0">
                          B2B
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {prospect.type && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                          {prospect.type === "EXPOSITOR"
                            ? "Expositor"
                            : "Visitante"}
                        </span>
                      )}
                      {prospect.city && (
                        <span className="text-[9px] text-white/20">
                          · {prospect.city}/{prospect.state}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-white/30 text-xs font-mono">
                    {formatCnpj(prospect.cnpj)}
                  </span>

                  <span className="text-white/40 text-xs truncate">
                    {prospect.sector || prospect.cnaeDescricao || "—"}
                  </span>

                  <Select
                    value={prospect.status}
                    onValueChange={(v) =>
                      handleStatusChange(prospect, v as ProspectStatus)
                    }
                    disabled={isUpdating}
                  >
                    <SelectTrigger
                      className={`h-7 text-[9px] font-black uppercase tracking-widest border rounded-lg px-2 min-w-0 ${cfg.color} ${cfg.bg} ${isUpdating ? "opacity-50" : ""}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_ORDER.map((s) => (
                        <SelectItem
                          key={s}
                          value={s}
                          className={`text-[10px] font-black uppercase tracking-widest ${STATUS_CONFIG[s].color}`}
                        >
                          {STATUS_CONFIG[s].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleEnrich(prospect)}
                      disabled={isEnriching || isDeleting}
                      title="Enriquecer dados via Receita Federal"
                      className="p-1.5 bg-white/5 hover:bg-brand-cyan/10 border border-white/10 hover:border-brand-cyan/20 rounded-lg text-white/25 hover:text-brand-cyan transition-all disabled:opacity-25"
                    >
                      <Zap
                        className={`h-3 w-3 ${isEnriching ? "animate-pulse text-brand-cyan" : ""}`}
                      />
                    </button>
                    <button
                      onClick={() => handleDelete(prospect.id)}
                      disabled={isDeleting || isEnriching}
                      title="Remover prospect"
                      className="p-1.5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 rounded-lg text-white/25 hover:text-red-400 transition-all disabled:opacity-25"
                    >
                      <Trash2
                        className={`h-3 w-3 ${isDeleting ? "animate-pulse text-red-400" : ""}`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">
              {totalProspects.toLocaleString("pt-BR")} prospects
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/50 disabled:opacity-20 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-white/40 text-xs font-black tabular-nums">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/50 disabled:opacity-20 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Import CNPJs Dialog */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="glass-card border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-black uppercase tracking-widest flex items-center gap-2">
              <Upload className="h-5 w-5 text-brand-pink" />
              Importar CNPJs
            </DialogTitle>
            <DialogDescription className="text-white/40 text-sm leading-relaxed">
              Cole os CNPJs abaixo (um por linha). Os dados serão enriquecidos
              automaticamente via Receita Federal — cerca de 1 segundo por CNPJ.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                Tipo de Prospect
              </label>
              <Select
                value={importType}
                onValueChange={(v) => setImportType(v as ProspectType)}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPOSITOR">
                    Expositor — comprador de stand
                  </SelectItem>
                  <SelectItem value="VISITANTE">
                    Visitante — lojista prospectado
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                CNPJs (um por linha)
              </label>
              <Textarea
                placeholder={"19131243000197\n00000000000191\n..."}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={8}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/15 rounded-xl font-mono text-sm resize-none"
              />
              <p className="text-white/20 text-[10px] font-black">
                {countValidCnpjs(importText)} CNPJs válidos detectados
              </p>
            </div>

            <Button
              onClick={handleImport}
              disabled={importing || !importText.trim()}
              className="w-full bg-brand-pink hover:bg-brand-pink/90 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand-pink/20 disabled:opacity-40"
            >
              {importing
                ? "Importando… aguarde"
                : `Importar ${countValidCnpjs(importText) > 0 ? countValidCnpjs(importText) : ""} CNPJs`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
