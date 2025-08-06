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
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-800/90" />
        </div>

        {/* Conteúdo do Header - Tudo numa única linha */}
        <div className="relative z-10 px-4 py-2">
          <div className="flex items-center gap-3 text-white">
            {/* Logo */}
            <img
              src="/logo.png"
              alt="Logo"
              className="h-8 w-auto flex-shrink-0"
            />

            {/* Separator */}
            <div className="h-6 w-px bg-white/30"></div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
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
                <PopoverContent className="bg-white shadow-lg border-0 rounded-lg p-0">
                  <div className="p-3 space-y-2">
                    <div
                      onClick={auth.signOut}
                      className="flex items-center gap-2 text-gray-700 hover:text-red-600 cursor-pointer transition-colors p-2 rounded-lg hover:bg-red-50"
                    >
                      <LogOut size={14} />
                      <span className="text-sm font-medium">Sair</span>
                    </div>
                    <CreateUserModal />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-white/30"></div>

            {/* User Email */}
            <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span className="text-xs font-medium truncate max-w-32">
                {auth.user?.email}
              </span>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-white/30 hidden sm:block"></div>

            {/* Fair Selector */}
            <div className="flex items-center gap-2 flex-1 min-w-0 bg-white/10 backdrop-blur-sm rounded px-3 py-1">
              <div className="bg-green-400 rounded-full h-2 w-2 flex-shrink-0"></div>
              <select
                value={selectedId}
                onChange={handleChange}
                className="bg-transparent text-white text-xs font-semibold flex-1 min-w-0 appearance-none focus:outline-none truncate pr-4"
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
