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
      <div className="relative w-full h-40 rounded- ">
        <img
          src="/bg.png"
          alt="Background"
          className="w-full h-full object-cover "
        />

        <div className="absolute inset-0 bg-blue-900 opacity-70" />
        <img
          src="/logo.png"
          alt="logo"
          className="absolute top-7 left-3 text-xl w-28 "
        />
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Settings className="absolute right-5 top-5 text-white z-50 cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent className="bg-white">
              <div onClick={auth.signOut}>
                <p className="flex items-center gap-2 text-gray-700 hover:text-gray-900 cursor-pointer">
                  <LogOut size={16} /> Sair
                </p>
              </div>
              <CreateUserModal />
            </PopoverContent>
          </Popover>
        </div>
        <RefreshCcw
          onClick={() => window.location.reload()}
          className={`absolute right-5 top-16 text-white z-50 cursor-pointer ${
            loading ? "animate-spin" : ""
          }`}
        />
        <div className="absolute inset-0 flex flex-col gap-6 items-center justify-center w-full">
          <div className="flex items-center gap-4 w-[80%]">
            <div className="bg-green-500 rounded-full h-4 w-4" />

            <select
              value={selectedId}
              onChange={handleChange}
              className="
                bg-transparent
                text-white
                text-2xl
                w-full
                text-start
                appearance-none
                focus:outline-none
                capitalize
              "
            >
              {fairs.map((fair) => (
                <option
                  key={fair.id}
                  value={fair.id}
                  className="text-black capitalize"
                >
                  {`${fair.name} ${new Date(fair.date).getFullYear()} – ${
                    fair.location
                  }`}
                </option>
              ))}
            </select>

            <svg
              className="h-6 w-6 text-white pointer-events-none"
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
          <div className="flex items-center gap-8 text-white w-[73%]">
            <div>
              <p className="flex items-center gap-2 font-semibold">
                <Calendar /> {selectedFair?.date}
              </p>
              <p className="font-light text-sm">13h às 21h</p>
            </div>
            <div>
              <p className="flex items-center gap-2 font-semibold">
                <MapPin /> {selectedFair?.location}
              </p>
              <p className="font-light text-sm">Av. Visconde de Souza...</p>
            </div>
          </div>
        </div>
      </div>
      <div
        className="w-full h-8 flex justify-center items-center gap-4 uppercase text-sm font-bold text-white rounded-b-4xl"
        style={{ background: "#AC9FCC" }}
      >
        <h3>{auth.user?.email}</h3>
        <Link
          className="flex items-center gap-2"
          to={{ pathname: "/", search }}
        >
          <HomeIcon size={18} />
          Home
        </Link>
        <Link
          className="flex items-center gap-2"
          to={{ pathname: "/visitors-table", search }}
        >
          <User2 size={18} />
          Visitantes
        </Link>
      </div>
      <main className="flex-grow p-6 bg-neutral-100">
        <Outlet />
      </main>
      <footer className="bg-gray-200 text-gray-700 p-4 text-center">
        © {new Date().getFullYear()} Meu App. Todos os direitos reservados.
      </footer>
    </div>
  );
};
