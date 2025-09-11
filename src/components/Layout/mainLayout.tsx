import { useEffect, useState } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { useFairService } from "@/service/fair.service";
import {
  Calendar,
  HomeIcon,
  LogOut,
  MapPin,
  RefreshCcw,
  Settings,
  User2,
  Mail,
  DollarSign,
  Users,
  CreditCard,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { SimpleFooter } from "../Footer";
import { useAuth } from "@/hooks/useAuth";
import { CreateUserModal } from "./ModalCreateUser";
import { ModalCreateFair } from "./ModalCreateFair";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCookie } from "@/hooks/useCookie";
import { EUserRole } from "@/enums/user.enum";

export const MainLayout: React.FC = () => {
  const { fairs, getFairs, loading } = useFairService();
  const [searchParams, setSearchParams] = useSearchParams();
  const auth = useAuth();

  // Hook para gerenciar o cookie da feira selecionada
  const [savedFairId, setSavedFairId] = useCookie("selectedFairId", "", {
    days: 30,
  });

  // Determina o ID inicial baseado em: URL params > Cookie > Primeira feira disponível
  const getInitialFairId = () => {
    const urlFairId = searchParams.get("fairId");
    if (urlFairId) return urlFairId;
    if (savedFairId && fairs.find((f) => f.id === savedFairId))
      return savedFairId;
    return fairs[0]?.id ?? "";
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

  const selectedFair = fairs.find((f) => f.id === selectedId);

  const search = `?fairId=${selectedId}`;

  useEffect(() => {
    getFairs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executa apenas uma vez no mount

  // Sincroniza o selectedId quando as feiras são carregadas ou os params mudam
  useEffect(() => {
    if (fairs.length > 0) {
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
  }, [fairs, searchParams]);

  // Aguarda as feiras serem carregadas e o fairId ser definido antes de renderizar
  if (fairs.length === 0 || !selectedId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Carregando feiras...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
            {/* Lado Esquerdo - Logo, Select, Data e Hora */}
            <div className="flex items-center gap-3">
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
                  {fairs.map((fair) => (
                    <option
                      key={fair.id}
                      value={fair.id}
                      className="text-black bg-white"
                    >
                      {`${fair.name} ${new Date(fair.date).getFullYear()}`}
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
                <span className="font-medium">{selectedFair?.date}</span>
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
                  {auth.user?.email}
                </span>
              </div>

              {/* Separator */}
              <div className="h-6 w-px bg-white/30 hidden sm:block"></div>

              {/* Controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
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
                        onClick={auth.signOut}
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

      {/* Navigation Bar Compacta */}
      <nav className="bg-gradient-to-r from-purple-600 to-purple-700">
        <div className="px-4 py-2">
          <div className="flex items-center justify-center gap-3 sm:gap-6">
            <Link
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
              to={{ pathname: "/", search }}
            >
              <HomeIcon size={16} />
              <span className="hidden sm:inline text-sm font-medium">Home</span>
            </Link>
            <Link
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
              to={{ pathname: "/visitors-table", search }}
            >
              <User2 size={16} />
              <span className="hidden sm:inline text-sm font-medium">
                Visitantes
              </span>
            </Link>
            <Link
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
              to={{ pathname: "/marketing", search }}
            >
              <Mail size={16} />
              <span className="hidden sm:inline text-sm font-medium">
                Marketing
              </span>
            </Link>
            {auth?.user?.role === EUserRole.ADMIN && (
              <Link
                className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
                to={{ pathname: "/financeiro/receitas", search }}
              >
                <DollarSign size={16} />
                <span className="hidden sm:inline text-sm font-medium">
                  Receitas
                </span>
              </Link>
            )}
            {auth?.user?.role === EUserRole.ADMIN && (
              <Link
                className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
                to={{ pathname: "/expenses", search }}
              >
                <DollarSign size={16} />
                <span className="hidden sm:inline text-sm font-medium">
                  Despesas
                </span>
              </Link>
            )}
            {(auth?.user?.role === EUserRole.ADMIN || auth?.user?.role === EUserRole.PARTNER) && (
              <Link
                className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
                to={{ pathname: auth?.user?.role === EUserRole.ADMIN ? "/partners" : "/partner-dashboard", search: auth?.user?.role === EUserRole.ADMIN ? search : undefined }}
              >
                <Users size={16} />
                <span className="hidden sm:inline text-sm font-medium">
                  {auth?.user?.role === EUserRole.ADMIN ? "Sócios" : "Meu Painel"}
                </span>
              </Link>
            )}
            {auth?.user?.role === EUserRole.ADMIN && (
              <Link
                className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
                to={{ pathname: "/partners/withdrawals", search }}
              >
                <CreditCard size={16} />
                <span className="hidden sm:inline text-sm font-medium">
                  Saques
                </span>
              </Link>
            )}
            {auth?.user?.role === EUserRole.ADMIN && (
              <Link
                className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
                to={{ pathname: "/user-management", search }}
              >
                <Settings size={16} />
                <span className="hidden sm:inline text-sm font-medium">
                  Usuários
                </span>
              </Link>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-grow p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950">
        <Outlet />
      </main>
      <SimpleFooter />
    </div>
  );
};
