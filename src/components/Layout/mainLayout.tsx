import { useEffect, useState, useMemo } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { useFairs } from "@/hooks/useFairs";
import {
  LogOut,
  RefreshCcw,
  Settings,
  Menu,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { SimpleFooter } from "../Footer";
import { useUserSession } from "@/hooks/useUserSession";
import { useAuth } from "@/hooks/useAuth";
import { CreateUserModal } from "./ModalCreateUser";
import { ModalCreateFair } from "./ModalCreateFair";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCookie } from "@/hooks/useCookie";
import { EUserRole } from "@/enums/user.enum";
import { Sidebar } from "./Sidebar";
import { LogoLoading } from "../LogoLoading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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

  // Filtrar feiras baseado no usuário - Memoizado para evitar re-renderizações infinitas
  const availableFairs = useMemo(() => {
    const list = fairs || [];
    if (!user) return [];
    if (user.role === EUserRole.ADMIN) return list;
    return list.filter((fair: any) => availableFairIds.length === 0 || availableFairIds.includes(fair.id));
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

  const handleSelectChange = (id: string) => {
    setSelectedId(id);
    setSavedFairId(id);
    setSearchParams({ fairId: id });
  };

  // const selectedFair = availableFairs.find((f: any) => f.id === selectedId);

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

  // Aguarda as feiras serem carregadas e o fairId ser definido antes de renderizar
  if (availableFairs.length === 0 || !selectedId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-blue">
        <LogoLoading size={80} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        search={search}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Principal */}
        <header className="sticky top-0 z-40 w-full bg-brand-blue/80 backdrop-blur-md border-b border-white/5 shadow-xl">
          <div className="px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
            {/* Lado Esquerdo */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2.5 rounded-xl hover:bg-white/10 transition-all active:scale-95 lg:hidden shrink-0 border border-white/5"
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5 text-white" />
              </button>

              <div className="flex items-center gap-4 min-w-0">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-7 sm:h-9 w-auto shrink-0 hidden xs:block"
                />
                
                <div className="h-6 w-px bg-white/10 hidden sm:block shrink-0"></div>

                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="bg-green-400 rounded-full h-2 w-2 shrink-0 shadow-[0_0_10px_rgba(74,222,128,0.5)] hidden xs:block"></div>
                  
                  <Select value={selectedId} onValueChange={handleSelectChange}>
                    <SelectTrigger className="h-9 sm:h-10 bg-white/5 border-white/5 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all rounded-2xl px-3 sm:px-4 cursor-pointer min-w-0 max-w-[180px] sm:max-w-none">
                      <SelectValue placeholder="Selecione uma feira" />
                    </SelectTrigger>
                    <SelectContent className="bg-brand-blue border-white/10 text-white">
                      {availableFairs.map((fair: any) => (
                        <SelectItem
                          key={fair.id}
                          value={fair.id}
                          className="text-[10px] sm:text-xs font-black uppercase tracking-widest focus:bg-white/10 focus:text-white"
                        >
                          {`${fair.name} ${fair.startDate ? new Date(fair.startDate).getFullYear() : 'N/A'}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="hidden lg:flex p-2 rounded-xl h-9 w-9 items-center justify-center hover:bg-white/10 transition-all text-white/60 hover:text-white"
                  aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
                >
                  <Menu className="h-4 w-4" />
                </button>
                
                <div className="h-5 w-px bg-white/10 hidden lg:block"></div>
                
                <ThemeToggle />
                
                <button
                  onClick={() => window.location.reload()}
                  className="p-2 rounded-xl h-9 w-9 flex items-center justify-center hover:bg-white/10 transition-all text-white/60 hover:text-white group relative"
                >
                  {loading ? (
                    <LogoLoading size={16} minimal className="animate-pulse" />
                  ) : (
                    <RefreshCcw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
                  )}
                </button>

                <Popover>
                  <PopoverTrigger asChild>
                    <button className="p-2 rounded-xl h-9 w-9 flex items-center justify-center hover:bg-white/10 transition-all text-white/60 hover:text-white">
                      <Settings className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 mt-2 bg-white border-white/5 p-2 rounded-2xl shadow-2xl mr-4" align="end">
                    <div className="space-y-1">
                      <div className="px-3 py-2 border-b border-black/5 mb-1 md:hidden">
                        <p className="text-[10px] text-black/40 font-black uppercase tracking-widest">Usuário</p>
                        <p className="text-sm font-bold truncate">{user?.email}</p>
                      </div>
                      <ModalCreateFair />
                      <CreateUserModal />
                      <div className="h-px bg-black/5 my-1"></div>
                      <button
                        onClick={signOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
                      >
                        <LogOut size={16} />
                        <span>Encerrar Sessão</span>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </header>

        <main className="grow p-6 bg-brand-blue relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-pink/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-cyan/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
        <div className="bg-brand-blue border-t border-white/5">
          <SimpleFooter />
        </div>
      </div>
    </div>
  );
};
