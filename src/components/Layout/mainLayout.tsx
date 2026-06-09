import { useEffect, useState, useMemo } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { useFairs } from "@/hooks/useFairs";
import {
  LogOut,
  RefreshCcw,
  Settings,
  Menu,
  ChevronRight,
  ChevronDown,
  Search,
  Check,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { SimpleFooter } from "../Footer";
import { useUserSession } from "@/hooks/useUserSession";
import { useAuth } from "@/hooks/useAuth";
import { CreateUserModal } from "./ModalCreateUser";
import { ModalCreateFair } from "./ModalCreateFair";
import { useCookie } from "@/hooks/useCookie";
import { EUserRole } from "@/enums/user.enum";
import { Sidebar } from "./Sidebar";
import { LogoLoading } from "../LogoLoading";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export const MainLayout: React.FC = () => {
  const { data: fairs, isLoading: loading } = useFairs();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, availableFairIds } = useUserSession();
  const { signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Hook para gerenciar o cookie da feira selecionada
  const [savedFairId, setSavedFairId] = useCookie("selectedFairId", "", {
    days: 30,
  });

  const isReceptionist = user?.role === EUserRole.RECEPTIONIST;

  // Header mostra todas as feiras (com filtros no select) — marketing usa todas para remarketing
  const availableFairs = useMemo(() => {
    const list = fairs || [];
    if (!user) return [];
    if (user.role === EUserRole.ADMIN) return list;
    const roleFiltered = list.filter((fair: any) => availableFairIds.length === 0 || availableFairIds.includes(fair.id));
    // Recepcionista só vê feiras ativas
    if (user.role === EUserRole.RECEPTIONIST) return roleFiltered.filter((fair: any) => fair.isActive);
    return roleFiltered;
  }, [fairs, user, availableFairIds]);

  // Determina o ID inicial baseado em: URL params > Cookie > Primeira feira disponível
  const getInitialFairId = () => {
    const urlFairId = searchParams.get("fairId");
    if (urlFairId && availableFairs.find((f: any) => f.id === urlFairId)) return urlFairId;
    if (savedFairId && availableFairs.find((f: any) => f.id === savedFairId))
      return savedFairId;
    return availableFairs[0]?.id ?? "";
  };

  const [selectedId, setSelectedId] = useState(getInitialFairId);

  // Filtros locais para a busca de feiras no popover
  const [isFairPopoverOpen, setIsFairPopoverOpen] = useState(false);
  const [fairSearchText, setFairSearchText] = useState("");
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all"); // "all", "active", "inactive"

  // Extrai anos únicos a partir das datas em que a feira acontece (startDate, endDate, startDateTime, endDateTime)
  const uniqueYears = useMemo(() => {
    const yearsSet = new Set<string>();
    availableFairs.forEach((fair: any) => {
      const datesToTry = [
        fair.startDate,
        fair.endDate,
        fair.startDateTime,
        fair.endDateTime
      ];
      
      datesToTry.forEach((dateStr) => {
        if (dateStr) {
          try {
            const yearStr = dateStr.split("-")[0];
            if (yearStr && yearStr.length === 4 && !isNaN(Number(yearStr))) {
              yearsSet.add(yearStr);
            } else {
              const year = new Date(dateStr).getFullYear().toString();
              if (year && year !== "NaN" && year.length === 4) {
                yearsSet.add(year);
              }
            }
          } catch (e) {
            // ignore
          }
        }
      });
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [availableFairs]);

  // Filtra as feiras baseado na pesquisa por texto, status e ano do acontecimento
  const filteredFairs = useMemo(() => {
    return availableFairs.filter((fair: any) => {
      if (fairSearchText.trim()) {
        const matchesName = fair.name.toLowerCase().includes(fairSearchText.toLowerCase());
        if (!matchesName) return false;
      }

      if (selectedYearFilter !== "all") {
        const hasMatchingEventYear = [
          fair.startDate,
          fair.endDate,
          fair.startDateTime,
          fair.endDateTime
        ].some((dateStr) => {
          if (!dateStr) return false;
          try {
            const yearStr = dateStr.split("-")[0];
            if (yearStr && yearStr.length === 4 && !isNaN(Number(yearStr))) {
              return yearStr === selectedYearFilter;
            }
            const year = new Date(dateStr).getFullYear().toString();
            return year === selectedYearFilter;
          } catch (e) {
            return false;
          }
        });

        if (!hasMatchingEventYear) return false;
      }

      if (selectedStatusFilter === "active") {
        if (!fair.isActive) return false;
      } else if (selectedStatusFilter === "inactive") {
        if (fair.isActive) return false;
      }

      return true;
    });
  }, [availableFairs, fairSearchText, selectedYearFilter, selectedStatusFilter]);

  const handleSelectChange = (id: string) => {
    setSelectedId(id);
    setSavedFairId(id);
    setSearchParams({ fairId: id });
  };

  const selectedFair = useMemo(() => {
    return availableFairs.find((f: any) => f.id === selectedId);
  }, [availableFairs, selectedId]);

  const fairCity = useMemo(() => {
    if (!isReceptionist || !selectedFair) return null;
    const city = (selectedFair.city ?? "").toLowerCase();
    const state = (selectedFair.state ?? "").toUpperCase();
    const loc = (selectedFair.location ?? "").toLowerCase();
    const year =
      selectedFair.startDate?.split("-")[0] ??
      (selectedFair.startDateTime ? new Date(selectedFair.startDateTime).getFullYear().toString() : null);
    if (city.includes("manaus") || state === "AM" || loc.includes("manaus"))
      return { label: "Manaus", year, flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Bandeira_do_Amazonas.svg/120px-Bandeira_do_Amazonas.svg.png" };
    if (city.includes("bel") || state === "PA" || loc.includes("belém") || loc.includes("belem"))
      return { label: "Belém", year, flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Bandeira_do_Pará.svg/120px-Bandeira_do_Pará.svg.png" };
    return null;
  }, [isReceptionist, selectedFair]);

  const search = `?fairId=${selectedId}`;

  // Removido - o hook useFairs já faz o fetch automaticamente

  // Sincroniza o selectedId apenas quando necessário
  useEffect(() => {
    if (availableFairs.length > 0) {
      const newId = getInitialFairId();
      
      // Só atualiza o estado local se mudou
      if (newId && newId !== selectedId) {
        setSelectedId(newId);
      }

      // Só atualiza a URL se não houver fairId nela
      if (newId && !searchParams.get("fairId")) {
        setSearchParams({ fairId: newId }, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableFairs.length]); // Apenas quando a lista de feiras deixar de estar vazia

  // Só bloqueia a renderização enquanto o carregamento inicial estiver em progresso
  // Se houver erro ou feiras vazias, renderiza o layout mesmo assim para não travar
  if (loading && availableFairs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-blue">
        <LogoLoading size={80} />
      </div>
    );
  }

  return (
    // App shell: altura travada no viewport — somente o <main> faz scroll
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        search={search}
      />

      {/* Coluna direita: cresce para preencher, não faz scroll */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header — fica fixo no topo naturalmente (acima do scroll container) */}
        <header className="relative shrink-0 z-40 w-full bg-brand-blue/80 backdrop-blur-md border-b border-white/5 shadow-xl">
          {fairCity && (
            <h1 className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center gap-3 pointer-events-none select-none">
              <img src={fairCity.flag} alt={fairCity.label} className="h-8 sm:h-10 w-auto rounded shadow-lg" />
              <span className="text-2xl sm:text-4xl font-black text-white uppercase tracking-widest drop-shadow-lg">
                {fairCity.label}
              </span>
              {fairCity.year && (
                <span className="text-2xl sm:text-4xl font-black uppercase tracking-widest drop-shadow-lg bg-gradient-to-r from-[#EB2970] to-[#00aacd] bg-clip-text text-transparent">
                  {fairCity.year}
                </span>
              )}
              <img src={fairCity.flag} alt="" aria-hidden className="h-8 sm:h-10 w-auto rounded shadow-lg" />
            </h1>
          )}
          <div className="px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
            {/* Lado Esquerdo */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile: abre o drawer */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2.5 rounded-xl hover:bg-white/10 transition-all active:scale-95 lg:hidden shrink-0 border border-white/5"
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5 text-white" />
              </button>

              <div className="flex items-center gap-4 min-w-0">
                {/* Logo: sempre visível no mobile; no desktop só quando a sidebar está recolhida
                    (quando aberta, o logo já aparece no header da sidebar) */}
                <img
                  src="/logo.png"
                  alt="Logo"
                  className={cn(
                    "h-7 sm:h-9 w-auto shrink-0",
                    // mobile: hidden xs → visible; desktop: oculto quando sidebar aberta
                    isSidebarOpen ? "hidden xs:hidden lg:hidden" : "hidden xs:block"
                  )}
                />

                {/* Desktop: botão para expandir a sidebar quando recolhida */}
                {!isSidebarOpen && (
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="hidden lg:flex p-2 rounded-xl hover:bg-white/10 transition-all text-white/50 hover:text-white shrink-0 border border-white/5"
                    aria-label="Expandir menu"
                    title="Expandir menu"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}

                {/* Separador: só aparece quando há logo ou botão à esquerda */}
                <div className={cn(
                  "h-6 w-px bg-white/10 shrink-0",
                  isSidebarOpen ? "hidden sm:hidden lg:hidden" : "hidden sm:block"
                )}></div>

                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={cn(
                    "rounded-full h-2 w-2 shrink-0 hidden xs:block transition-all duration-300",
                    selectedFair?.isActive
                      ? "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                      : "bg-white/20"
                  )}></div>
                  
                  <Popover open={isFairPopoverOpen} onOpenChange={setIsFairPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button className="h-9 sm:h-10 bg-white/5 border border-white/10 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all rounded-2xl px-3 sm:px-4 cursor-pointer flex items-center gap-2 max-w-[180px] sm:max-w-none">
                        <span className="truncate">
                          {selectedFair ? selectedFair.name : "Selecione uma feira"}
                        </span>
                        <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 mt-2 bg-slate-950 border border-white/10 text-white p-4 rounded-2xl shadow-2xl z-50">
                      <div className="space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 border-b border-white/5 pb-2">
                          Filtrar Feiras
                        </div>
                        
                        {/* Campo de Busca */}
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
                          <Input
                            placeholder="Buscar feira pelo nome..."
                            value={fairSearchText}
                            onChange={(e) => setFairSearchText(e.target.value)}
                            className="pl-9 bg-white/5 border-white/10 text-white rounded-xl text-xs h-9 focus:border-brand-pink/50 focus:ring-brand-pink/20"
                          />
                        </div>

                        {/* Status (Ativas / Inativas / Todas) — oculto para recepcionista */}
                        <div className={cn("space-y-1.5", isReceptionist && "hidden")}>
                          <div className="text-[9px] font-black uppercase tracking-wider text-white/40">Status</div>
                          <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
                            <button
                              type="button"
                              onClick={() => setSelectedStatusFilter("all")}
                              className={cn(
                                "flex-1 text-[9px] font-black uppercase tracking-wider py-1.5 rounded-lg transition-all cursor-pointer",
                                selectedStatusFilter === "all" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/75"
                              )}
                            >
                              Todas
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedStatusFilter("active")}
                              className={cn(
                                "flex-1 text-[9px] font-black uppercase tracking-wider py-1.5 rounded-lg transition-all cursor-pointer",
                                selectedStatusFilter === "active" ? "bg-white/10 text-green-400" : "text-white/40 hover:text-white/75"
                              )}
                            >
                              Ativas
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedStatusFilter("inactive")}
                              className={cn(
                                "flex-1 text-[9px] font-black uppercase tracking-wider py-1.5 rounded-lg transition-all cursor-pointer",
                                selectedStatusFilter === "inactive" ? "bg-white/10 text-white/60" : "text-white/40 hover:text-white/75"
                              )}
                            >
                              Inativas
                            </button>
                          </div>
                        </div>

                        {/* Filtro por Ano */}
                        <div className="space-y-1.5">
                          <div className="text-[9px] font-black uppercase tracking-wider text-white/40">Ano</div>
                          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                            <button
                              type="button"
                              onClick={() => setSelectedYearFilter("all")}
                              className={cn(
                                "text-[9px] font-bold py-1 px-2.5 rounded-lg border transition-all cursor-pointer",
                                selectedYearFilter === "all"
                                  ? "bg-linear-to-br from-[#00aacd] to-[#EB2970] border-none text-white"
                                  : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                              )}
                            >
                              Todos
                            </button>
                            {uniqueYears.map((year) => (
                              <button
                                key={year}
                                type="button"
                                onClick={() => setSelectedYearFilter(year)}
                                className={cn(
                                  "text-[9px] font-bold py-1 px-2.5 rounded-lg border transition-all cursor-pointer",
                                  selectedYearFilter === year
                                    ? "bg-linear-to-br from-[#00aacd] to-[#EB2970] border-none text-white"
                                    : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                                )}
                              >
                                {year}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Listagem das Feiras Filtradas */}
                        <div className="space-y-1.5">
                          <div className="text-[9px] font-black uppercase tracking-wider text-white/40">Feiras ({filteredFairs.length})</div>
                          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 border border-white/5 bg-white/3 rounded-xl p-1.5">
                            {filteredFairs.length > 0 ? (
                              filteredFairs.map((fair: any) => {
                                const isSelected = fair.id === selectedId;
                                return (
                                  <button
                                    key={fair.id}
                                    type="button"
                                    onClick={() => {
                                      handleSelectChange(fair.id);
                                      setIsFairPopoverOpen(false);
                                    }}
                                    className={cn(
                                      "w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between gap-2 cursor-pointer",
                                      isSelected
                                        ? "bg-white/10 text-white border border-white/10"
                                        : "text-white/60 hover:bg-white/5 hover:text-white"
                                    )}
                                  >
                                    <span className="truncate flex-1">{fair.name}</span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className={cn(
                                        "h-1.5 w-1.5 rounded-full",
                                        fair.isActive ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]" : "bg-white/20"
                                      )} />
                                      {isSelected && <Check className="w-3.5 h-3.5 text-brand-pink shrink-0" />}
                                    </div>
                                  </button>
                                );
                              })
                            ) : (
                              <div className="text-center py-4 text-[9px] font-bold text-white/30 uppercase tracking-wider">
                                Nenhuma feira encontrada
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Lado Direito */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* User - Hidden on very small screens */}
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Operador</span>
                <span className="text-xs text-white font-bold truncate max-w-[120px]">
                  {user?.email.split('@')[0]}
                </span>
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={() => window.location.reload()}
                  className="p-2 rounded-xl h-9 w-9 flex items-center justify-center hover:bg-white/10 transition-all text-white/60 hover:text-white group relative"
                  aria-label="Recarregar página"
                  title="Recarregar página"
                >
                  {loading ? (
                    <LogoLoading size={16} minimal className="animate-pulse" />
                  ) : (
                    <RefreshCcw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
                  )}
                </button>

                <Popover>
                  <PopoverTrigger asChild>
                    <button className="p-2 rounded-xl h-9 w-9 flex items-center justify-center hover:bg-white/10 transition-all text-white/60 hover:text-white" aria-label="Configurações" title="Configurações">
                      <Settings className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 mt-2 bg-slate-950 border border-white/10 p-2 rounded-2xl shadow-2xl" align="end">
                    {/* Cabeçalho — usuário conectado */}
                    <div className="px-3 py-2.5 mb-1 border-b border-white/5">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-0.5">Conectado como</p>
                      <p className="text-xs font-bold text-white truncate">{user?.email}</p>
                    </div>

                    {/* Ações */}
                    <div className="space-y-0.5 py-1">
                      <ModalCreateFair />
                      <CreateUserModal />
                    </div>

                    {/* Separador + Logout */}
                    <div className="border-t border-white/5 mt-1 pt-1">
                      <button
                        onClick={signOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-xs font-black uppercase tracking-wider"
                      >
                        <LogOut className="h-3.5 w-3.5 shrink-0" />
                        <span>Encerrar Sessão</span>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </header>

        {/* Área de conteúdo — ÚNICO elemento que faz scroll */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-brand-blue relative">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-pink/5 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-cyan/5 blur-[120px] rounded-full translate-y-1/2 pointer-events-none" />

          <div className="relative z-10">
            <Outlet />
          </div>

          <div className="border-t border-white/5 mt-12">
            <SimpleFooter />
          </div>
        </main>
      </div>
    </div>
  );
};
