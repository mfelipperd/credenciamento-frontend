import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  ToggleLeft,
  ToggleRight,
  Navigation,
  Building2,
  ExternalLink,
  Search,
} from "lucide-react";
import type { Fair, FairFilters, FairStatus } from "@/interfaces/fairs";

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<FairStatus, { label: string; dot: string; badge: string }> = {
  upcoming:  { label: "Em breve",      dot: "bg-blue-400",   badge: "bg-blue-500/15 text-blue-300 border-blue-500/20" },
  ongoing:   { label: "Em andamento",  dot: "bg-green-400",  badge: "bg-green-500/15 text-green-300 border-green-500/20" },
  ended:     { label: "Encerrada",     dot: "bg-white/30",   badge: "bg-white/5 text-white/40 border-white/10" },
  cancelled: { label: "Cancelada",     dot: "bg-red-400",    badge: "bg-red-500/15 text-red-300 border-red-500/20" },
};

const STATUS_GLOW: Record<FairStatus, string> = {
  upcoming:  "#3b82f6",
  ongoing:   "#22c55e",
  ended:     "#ffffff",
  cancelled: "#ef4444",
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface FairListProps {
  fairs: Fair[];
  isLoading: boolean;
  onDelete: (fair: Fair) => void;
  onToggleActive: (fair: Fair) => void;
  onFiltersChange: (filters: Partial<FairFilters>) => void;
  filters: FairFilters;
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function FairCardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden">
      <Skeleton className="h-28 w-full rounded-none bg-white/10" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-3/4 bg-white/10" />
            <Skeleton className="h-3 w-1/3 bg-white/10" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
        </div>
        <Skeleton className="h-3 w-full bg-white/10" />
        <Skeleton className="h-3 w-2/3 bg-white/10" />
        <Skeleton className="h-3 w-1/2 bg-white/10" />
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export const FairList: React.FC<FairListProps> = ({
  fairs,
  isLoading,
  onDelete,
  onToggleActive,
  onFiltersChange,
  filters,
}) => {
  const navigate = useNavigate();
  const [detailFair, setDetailFair] = useState<Fair | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-64 bg-white/10 rounded-xl" />
          <Skeleton className="h-10 w-36 bg-white/10 rounded-xl" />
          <Skeleton className="h-10 w-36 bg-white/10 rounded-xl" />
          <Skeleton className="h-10 w-28 bg-white/10 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <FairCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Filtros ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            placeholder="Buscar feiras..."
            value={filters.search ?? ""}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-10 w-64"
          />
        </div>

        <select
          value={filters.status ?? ""}
          onChange={(e) => onFiltersChange({ status: (e.target.value as FairStatus) || undefined })}
          className="px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white/70 outline-none focus:border-white/30 transition-colors"
        >
          <option value="">Todos os status</option>
          <option value="upcoming">Em breve</option>
          <option value="ongoing">Em andamento</option>
          <option value="ended">Encerradas</option>
          <option value="cancelled">Canceladas</option>
        </select>

        <select
          value={filters.uf ?? ""}
          onChange={(e) => onFiltersChange({ uf: e.target.value || undefined })}
          className="px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white/70 outline-none focus:border-white/30 transition-colors"
        >
          <option value="">Todos os estados</option>
          {BR_STATES.map((uf) => (
            <option key={uf} value={uf}>{uf}</option>
          ))}
        </select>

        <select
          value={filters.isActive === undefined ? "all" : filters.isActive.toString()}
          onChange={(e) => {
            const v = e.target.value;
            onFiltersChange({ isActive: v === "all" ? undefined : v === "true" });
          }}
          className="px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white/70 outline-none focus:border-white/30 transition-colors"
        >
          <option value="all">Ativas e Inativas</option>
          <option value="true">Somente ativas</option>
          <option value="false">Somente inativas</option>
        </select>
      </div>

      {/* ── Lista ─────────────────────────────────────────────────────────── */}
      {fairs.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-[32px] py-16 text-center">
          <p className="text-white/30 text-sm font-medium">Nenhuma feira encontrada com os filtros aplicados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fairs.map((fair) => {
            const statusCfg = STATUS_CONFIG[fair.status] ?? STATUS_CONFIG.upcoming;
            const glowColor = STATUS_GLOW[fair.status] ?? STATUS_GLOW.upcoming;
            const startFmt = fmtDate(fair.startDate);
            const endFmt = fmtDate(fair.endDate);
            const dateRange = !startFmt
              ? null
              : startFmt === endFmt || !endFmt
                ? startFmt
                : `${startFmt} a ${endFmt}`;

            return (
              <div
                key={fair.id}
                className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] flex flex-col cursor-pointer transition-all duration-300 hover:bg-white/8 hover:border-white/20 hover:scale-[1.01] shadow-xl"
                onClick={() => navigate(`/fairs/${fair.id}`)}
              >
                {/* Glow de status */}
                <div
                  className="absolute -right-6 -top-6 w-32 h-32 blur-3xl opacity-10 transition-opacity duration-300 group-hover:opacity-20 pointer-events-none"
                  style={{ backgroundColor: glowColor }}
                />

                {/* Banner */}
                {fair.bannerUrl ? (
                  <div className="h-32 overflow-hidden rounded-t-[32px] shrink-0">
                    <img
                      src={fair.bannerUrl}
                      alt={fair.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div
                    className="h-2 rounded-t-[32px] shrink-0"
                    style={{ backgroundColor: glowColor, opacity: 0.4 }}
                  />
                )}

                <div className="p-5 flex flex-col gap-3 flex-1 relative z-10">
                  {/* Nome + status + menu */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-white text-base leading-snug line-clamp-2 tracking-tight">
                        {fair.name}
                      </p>
                      {fair.edition && (
                        <p className="text-xs text-white/40 mt-0.5">{fair.edition}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold px-2 py-0.5 whitespace-nowrap ${statusCfg.badge}`}
                      >
                        <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-white/30 hover:text-white hover:bg-white/10 rounded-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDetailFair(fair); }}>
                            <Eye className="h-4 w-4 mr-2" /> Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/fairs/${fair.id}`); }}>
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleActive(fair); }}>
                            {fair.isActive
                              ? <><ToggleLeft className="h-4 w-4 mr-2" /> Desativar</>
                              : <><ToggleRight className="h-4 w-4 mr-2" /> Ativar</>
                            }
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                            onClick={(e) => { e.stopPropagation(); onDelete(fair); }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Descrição */}
                  {fair.description && (
                    <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
                      {fair.description}
                    </p>
                  )}

                  {/* Info rows */}
                  <div className="space-y-1.5 flex-1">
                    {/* Local */}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#00aacd]" />
                      <span className="text-xs text-white/50 line-clamp-1">
                        {[
                          fair.venueName,
                          fair.city && fair.state
                            ? `${fair.city} — ${fair.state}`
                            : (fair.city ?? fair.state),
                          fair.location,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Local não informado"}
                      </span>
                    </div>

                    {/* Datas */}
                    {dateRange && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-[#EB2970]" />
                        <span className="text-xs text-white/50">{dateRange}</span>
                        {fair.startTime && (
                          <>
                            <Clock className="h-3 w-3 shrink-0 text-white/30" />
                            <span className="text-xs text-white/40">
                              {fair.startTime}{fair.endTime ? ` – ${fair.endTime}` : ""}
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Visitantes / Expositores */}
                    {(fair.expectedVisitors || fair.expectedExhibitors) && (
                      <div className="flex gap-4">
                        {fair.expectedVisitors && (
                          <span className="flex items-center gap-1.5 text-xs text-white/40">
                            <Users className="h-3.5 w-3.5" />
                            {Number(fair.expectedVisitors).toLocaleString("pt-BR")}
                          </span>
                        )}
                        {fair.expectedExhibitors && (
                          <span className="flex items-center gap-1.5 text-xs text-white/40">
                            <Building2 className="h-3.5 w-3.5" />
                            {fair.expectedExhibitors} expositores
                          </span>
                        )}
                      </div>
                    )}

                    {/* Receita esperada */}
                    {Number(fair.expectedRevenue) > 0 && (
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 shrink-0 text-green-400" />
                        <span className="text-xs text-white/40">
                          {fmtCurrency(fair.expectedRevenue)}
                          {Number(fair.expectedProfitMargin) > 0 && (
                            <span className="text-green-400 font-bold ml-1">
                              ({Number(fair.expectedProfitMargin).toFixed(1)}%)
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rodapé */}
                  <div className="flex items-center justify-between pt-1 mt-auto">
                    {(fair.googleMapsUrl || fair.transportLinks?.googleMaps) ? (
                      <a
                        href={fair.googleMapsUrl ?? fair.transportLinks?.googleMaps ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-[#00aacd]/70 hover:text-[#00aacd] transition-colors font-bold uppercase tracking-wider"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Navigation className="h-3 w-3" />
                        Ver no Maps
                      </a>
                    ) : <span />}

                    {!fair.isActive && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-400/60">
                        Inativa
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal de detalhes ─────────────────────────────────────────────── */}
      {detailFair && (
        <Dialog open={!!detailFair} onOpenChange={() => setDetailFair(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {detailFair.name}
                {detailFair.edition && (
                  <span className="text-sm font-normal text-muted-foreground">— {detailFair.edition}</span>
                )}
              </DialogTitle>
              <div className="flex items-center gap-2 pt-1">
                <Badge
                  variant="outline"
                  className={`text-xs font-bold ${STATUS_CONFIG[detailFair.status]?.badge}`}
                >
                  {STATUS_CONFIG[detailFair.status]?.label}
                </Badge>
                {!detailFair.isActive && (
                  <Badge variant="outline" className="text-xs text-orange-400 border-orange-400/30 bg-orange-500/10">
                    Inativa
                  </Badge>
                )}
              </div>
            </DialogHeader>

            <div className="space-y-5 mt-2">
              {detailFair.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{detailFair.description}</p>
              )}

              {detailFair.bannerUrl && (
                <img
                  src={detailFair.bannerUrl}
                  alt={detailFair.name}
                  className="w-full h-40 object-cover rounded-2xl"
                />
              )}

              {/* Local */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> Local
                </h4>
                <div className="text-sm text-muted-foreground space-y-0.5 pl-5">
                  {detailFair.venueName && <p className="font-medium text-foreground">{detailFair.venueName}</p>}
                  {(detailFair.address || detailFair.number) && (
                    <p>{[detailFair.address, detailFair.number].filter(Boolean).join(", ")}</p>
                  )}
                  {(detailFair.complement || detailFair.neighborhood) && (
                    <p>{[detailFair.complement, detailFair.neighborhood].filter(Boolean).join(" — ")}</p>
                  )}
                  {(detailFair.city || detailFair.state) && (
                    <p>{[detailFair.city, detailFair.state].filter(Boolean).join(" — ")}{detailFair.zipCode ? `, ${detailFair.zipCode}` : ""}</p>
                  )}
                </div>

                {detailFair.transportLinks && Object.values(detailFair.transportLinks).some(Boolean) && (
                  <div className="flex flex-wrap gap-2 mt-3 pl-5">
                    {detailFair.transportLinks.googleMaps && (
                      <a href={detailFair.transportLinks.googleMaps} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors">
                        <ExternalLink className="h-3 w-3" /> Google Maps
                      </a>
                    )}
                    {detailFair.transportLinks.waze && (
                      <a href={detailFair.transportLinks.waze} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200 transition-colors">
                        <Navigation className="h-3 w-3" /> Waze
                      </a>
                    )}
                    {detailFair.transportLinks.uber && (
                      <a href={detailFair.transportLinks.uber} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition-colors">
                        Uber
                      </a>
                    )}
                    {detailFair.transportLinks.taxi99 && (
                      <a href={detailFair.transportLinks.taxi99} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-300 transition-colors">
                        99
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Período */}
              {(detailFair.startDate || detailFair.endDate) && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> Período
                  </h4>
                  <p className="text-sm text-muted-foreground pl-5">
                    {fmtDate(detailFair.startDate)}
                    {detailFair.endDate && detailFair.startDate !== detailFair.endDate && ` a ${fmtDate(detailFair.endDate)}`}
                    {detailFair.durationDays && detailFair.durationDays > 1 && (
                      <span className="ml-2 text-xs text-muted-foreground/70">({detailFair.durationDays} dias)</span>
                    )}
                  </p>
                  {detailFair.startTime && (
                    <p className="text-sm text-muted-foreground pl-5 mt-0.5">
                      {detailFair.startTime}{detailFair.endTime ? ` – ${detailFair.endTime}` : ""} (padrão)
                    </p>
                  )}
                  {detailFair.daySchedules && detailFair.daySchedules.length > 0 && (
                    <div className="mt-3 pl-5 space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Programação por dia:</p>
                      {detailFair.daySchedules.map((ds, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <span className="font-medium text-xs w-24">{fmtDate(ds.date)}</span>
                          <span className="text-muted-foreground text-xs">{ds.startTime} – {ds.endTime}</span>
                          {ds.note && <span className="text-xs text-muted-foreground/70 italic">{ds.note}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Planejamento */}
              {(detailFair.expectedVisitors || detailFair.expectedExhibitors) && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <Users className="h-4 w-4" /> Planejamento
                  </h4>
                  <div className="grid grid-cols-2 gap-3 pl-5">
                    {detailFair.expectedVisitors && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Visitantes:</span>
                        <span className="ml-2 font-semibold">{Number(detailFair.expectedVisitors).toLocaleString("pt-BR")}</span>
                      </div>
                    )}
                    {detailFair.expectedExhibitors && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Expositores:</span>
                        <span className="ml-2 font-semibold">{detailFair.expectedExhibitors}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Financeiro */}
              {(detailFair.expectedRevenue || detailFair.expectedProfit) && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4" /> Financeiro
                  </h4>
                  <div className="grid grid-cols-2 gap-3 pl-5 text-sm">
                    {detailFair.expectedRevenue !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Receita esperada:</span>
                        <span className="ml-2 font-semibold">{fmtCurrency(detailFair.expectedRevenue)}</span>
                      </div>
                    )}
                    {detailFair.expectedProfit !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Lucro esperado:</span>
                        <span className="ml-2 font-semibold">{fmtCurrency(detailFair.expectedProfit)}</span>
                      </div>
                    )}
                    {detailFair.expectedProfitMargin !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Margem:</span>
                        <span className="ml-2 font-semibold text-green-400">{Number(detailFair.expectedProfitMargin).toFixed(1)}%</span>
                      </div>
                    )}
                    {detailFair.totalStands !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Total de stands:</span>
                        <span className="ml-2 font-semibold">{detailFair.totalStands}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stands */}
              {detailFair.standConfigurations && detailFair.standConfigurations.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Configurações de Stands</h4>
                  <div className="space-y-2 pl-2">
                    {detailFair.standConfigurations.map((cfg, i) => (
                      <div key={i} className="border border-white/10 rounded-2xl p-3 flex items-center justify-between bg-white/5">
                        <div>
                          <p className="font-medium text-sm">{cfg.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {cfg.width}m × {cfg.height}m · {cfg.quantity} unidades
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-semibold">
                            {fmtCurrency(cfg.width * cfg.height * cfg.quantity * cfg.pricePerSquareMeter)}
                          </p>
                          <p className="text-xs text-muted-foreground">{fmtCurrency(cfg.pricePerSquareMeter)}/m²</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <Button variant="outline" size="sm" onClick={() => { setDetailFair(null); navigate(`/fairs/${detailFair.id}`); }}>
                  <Edit className="h-3.5 w-3.5 mr-1.5" /> Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDetailFair(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
