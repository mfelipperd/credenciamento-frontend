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
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCheckinId } from "@/hooks/useCheckinId";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { CreateUserModal } from "./ModalCreateUser";

export const MainLayout: React.FC = () => {
  const { fairs, getFairs, loading } = useFairService();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get("fairId") ?? fairs[0]?.id ?? "";
  const fairID = searchParams.get("faird");
  const [selectedId, setSelectedId] = useState(initialId);
  const auth = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);

    setSearchParams({ fairId: id });
  };

  const checkinId = useCheckinId();

  const selectedFair = fairs.find((f) => f.id === selectedId);

  const search = `?fairId=${selectedId}`;

  useEffect(() => {
    getFairs();
  }, []);

  // Se as fairs chegarem depois, garanta que o selectedId acompanhe
  useEffect(() => {
    if (searchParams.get("faird") && fairs.length > 0) {
      setSelectedId(fairID || fairs[0].id);
    }
    if (!searchParams.get("fairId") && fairs.length > 0) {
      setSearchParams({ fairId: fairs[0].id });
      setSelectedId(fairs[0].id);
    }
  }, [fairs, searchParams, fairID, checkinId]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      {/* Header Principal */}
      <header className="relative w-full bg-gradient-to-r from-blue-900 to-purple-800 shadow-lg">
        {/* Background Image com Overlay */}
        <div className="absolute inset-0">
          <img
            src="/bg.png"
            alt="Background"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-800/80" />
        </div>

        {/* Conteúdo do Header */}
        <div className="relative z-10 px-4 py-4 md:px-6">
          {/* Top Row: Logo + User Controls */}
          <div className="flex items-center justify-between mb-4">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-8 w-auto sm:h-10 md:h-12"
              />
            </div>

            {/* User Info + Controls */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* User Email */}
              <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white text-sm font-medium truncate max-w-32 md:max-w-none">
                  {auth.user?.email}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 sm:gap-2">
                <RefreshCcw
                  onClick={() => window.location.reload()}
                  className={`h-6 w-6 text-white/80 hover:text-white cursor-pointer transition-all hover:scale-110 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Settings className="h-6 w-6 text-white/80 hover:text-white cursor-pointer transition-all hover:scale-110" />
                  </PopoverTrigger>
                  <PopoverContent className="bg-white shadow-lg border-0 rounded-lg p-0">
                    <div className="p-4 space-y-3">
                      <div 
                        onClick={auth.signOut}
                        className="flex items-center gap-2 text-gray-700 hover:text-red-600 cursor-pointer transition-colors p-2 rounded-lg hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        <span className="font-medium">Sair</span>
                      </div>
                      <CreateUserModal />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Main Content: Fair Selection + Info */}
          <div className="space-y-4">
            {/* Fair Selector */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="bg-green-400 rounded-full h-3 w-3 flex-shrink-0 animate-pulse"></div>
              <div className="flex-1 min-w-0">
                <select
                  value={selectedId}
                  onChange={handleChange}
                  className="bg-transparent text-white text-base sm:text-lg md:text-xl font-semibold w-full appearance-none focus:outline-none truncate"
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
              </div>
              <svg
                className="h-5 w-5 text-white/70 flex-shrink-0"
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

            {/* Fair Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Data e Horário */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 text-white">
                  <Calendar className="h-4 w-4 text-blue-300 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm md:text-base truncate">
                      {selectedFair?.date}
                    </p>
                    <p className="text-xs sm:text-sm text-white/80">
                      13h às 21h
                    </p>
                  </div>
                </div>
              </div>

              {/* Local */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 text-white">
                  <MapPin className="h-4 w-4 text-green-300 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm md:text-base">
                      Estação das Docas
                    </p>
                    <p className="text-xs sm:text-sm text-white/80 truncate">
                      Belém - PA
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile User Email */}
            <div className="sm:hidden bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2 text-white">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium truncate">
                  {auth.user?.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-purple-600 to-purple-700 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
            <Link
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
              to={{ pathname: "/", search }}
            >
              <HomeIcon size={18} />
              <span className="hidden sm:inline font-medium">Home</span>
            </Link>
            <Link
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
              to={{ pathname: "/visitors-table", search }}
            >
              <User2 size={18} />
              <span className="hidden sm:inline font-medium">Visitantes</span>
            </Link>
            <Link
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
              to={{ pathname: "/marketing", search }}
            >
              <Mail size={18} />
              <span className="hidden sm:inline font-medium">Marketing</span>
            </Link>
          </div>
        </div>
      </nav>
      <main className="flex-grow p-6 bg-neutral-100">
        <Outlet />
      </main>
      <footer className="bg-gray-200 text-gray-700 p-4 text-center">
        © {new Date().getFullYear()} Meu App. Todos os direitos reservados.
      </footer>
    </div>
  );
};
