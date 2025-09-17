import { useEffect, useState } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { useFairs } from "@/hooks/useFairs";
import {
  Calendar,
  LogOut,
  MapPin,
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

export const MainLayout: React.FC = () => {
  const { data: fairs, isLoading: loading } = useFairs();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, availableFairIds } = useUserSession();
  const { signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Hook para gerenciar o cookie da feira selecionada
  const [savedFairId, setSavedFairId] = useCookie("selectedFairId", "", {
    days: 30,
  });

  // Filtrar feiras baseado no usuário
  const availableFairs = user?.role === EUserRole.ADMIN 
    ? (fairs || []) 
    : (fairs || []).filter((fair: any) => availableFairIds.length === 0 || availableFairIds.includes(fair.id));

  // Determina o ID inicial baseado em: URL params > Cookie > Primeira feira disponível
  const getInitialFairId = () => {
    const urlFairId = searchParams.get("fairId");
    if (urlFairId && availableFairs.find((f: any) => f.id === urlFairId)) return urlFairId;
    if (savedFairId && availableFairs.find((f: any) => f.id === savedFairId))
      return savedFairId;
    return availableFairs[0]?.id ?? "";
  };

  const [selectedId, setSelectedId] = useState(getInitialFairId);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);

    // Salva no cookie
    setSavedFairId(id);

    // Atualiza URL
    setSearchParams({ fairId: id });
  };

  const selectedFair = availableFairs.find((f: any) => f.id === selectedId);

  const search = `?fairId=${selectedId}`;

  // Removido - o hook useFairs já faz o fetch automaticamente

  // Sincroniza o selectedId quando as feiras são carregadas ou os params mudam
  useEffect(() => {
    if (availableFairs.length > 0) {
      const newId = getInitialFairId();
      if (newId && newId !== selectedId) {
        setSelectedId(newId);
        // Se não há fairId na URL, adiciona
        if (!searchParams.get("fairId")) {
          setSearchParams({ fairId: newId });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableFairs, searchParams]);

  // Aguarda as feiras serem carregadas e o fairId ser definido antes de renderizar
  if (availableFairs.length === 0 || !selectedId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {availableFairs.length === 0 ? "Nenhuma feira disponível" : "Carregando feiras..."}
          </p>
        </div>
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
      <div className="flex-1 flex flex-col">
        {/* Header Principal */}
        <header className="relative w-full bg-gradient-to-r from-blue-900 to-purple-800 shadow-lg">
        {/* Background Image com Overlay */}
        <div className="absolute inset-0">
          <img
            src="/bg.png"
            alt="Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-800/90" />
        </div>

        {/* Conteúdo do Header - Organizado com Esquerda e Direita */}
        <div className="relative z-10 px-4 py-2">
          <div className="flex items-center justify-between text-white">
            {/* Lado Esquerdo - Menu Button, Logo, Select, Data e Hora */}
            <div className="flex items-center gap-3">
              {/* Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Logo */}
              <img
                src="/logo.png"
                alt="Logo"
                className="h-8 w-auto flex-shrink-0"
              />

              {/* Separator */}
              <div className="h-6 w-px bg-white/30"></div>

              {/* Fair Selector */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded px-3 py-1">
                <div className="bg-green-400 rounded-full h-2 w-2 flex-shrink-0"></div>
                <select
                  value={selectedId}
                  onChange={handleChange}
                  className="bg-transparent text-white text-xs font-semibold min-w-0 appearance-none focus:outline-none truncate pr-4"
                >
                  {availableFairs.map((fair: any) => (
                    <option
                      key={fair.id}
                      value={fair.id}
                      className="text-black bg-white"
                    >
                      {`${fair.name} ${fair.startDate ? new Date(fair.startDate).getFullYear() : 'N/A'}`}
                    </option>
                  ))}
                </select>
                <svg
                  className="h-3 w-3 text-white/70 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {/* Separator */}
              <div className="h-6 w-px bg-white/30 hidden md:block"></div>

              {/* Data e Horário */}
              <div className="hidden md:flex items-center gap-1 flex-shrink-0 text-xs">
                <Calendar className="h-3 w-3 text-blue-300" />
                <span className="font-medium">{selectedFair?.startDate ? new Date(selectedFair.startDate).toLocaleDateString('pt-BR') : ''}</span>
                <span className="text-white/60">•</span>
                <span className="text-white/80">13h-21h</span>
              </div>

              {/* Separator */}
              <div className="h-6 w-px bg-white/30 hidden lg:block"></div>

              {/* Local */}
              <div className="hidden lg:flex items-center gap-1 flex-shrink-0 text-xs">
                <MapPin className="h-3 w-3 text-green-300" />
                <span className="font-medium">Estação das Docas</span>
              </div>
            </div>

            {/* Lado Direito - Email, Controls */}
            <div className="flex items-center gap-3">
              {/* User Email */}
              <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <span className="text-xs font-medium truncate max-w-32">
                  {user?.email}
                </span>
              </div>

              {/* Separator */}
              <div className="h-6 w-px bg-white/30 hidden sm:block"></div>

              {/* Controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Desktop Menu Button */}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="hidden lg:flex p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
                >
                  <Menu className="h-4 w-4" />
                </button>
                
                <ThemeToggle />
                <RefreshCcw
                  onClick={() => window.location.reload()}
                  className={`h-4 w-4 text-white/80 hover:text-white cursor-pointer transition-all hover:scale-110 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Settings className="h-4 w-4 text-white/80 hover:text-white cursor-pointer transition-all hover:scale-110" />
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-white  ">
                    <div className="p-3 space-y-2">
                      <ModalCreateFair />
                      <div
                        onClick={signOut}
                        className="flex items-center gap-2 text-foreground hover:text-red-600 cursor-pointer transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <LogOut size={14} />
                        <span className="text-sm font-medium">Sair</span>
                      </div>
                      <CreateUserModal />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
        </header>

        <main className="flex-grow p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950">
          <Outlet />
        </main>
        <SimpleFooter />
      </div>
    </div>
  );
};
