import { useEffect, useState } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { useFairService } from "@/service/fair.service";
import { Calendar, MapPin, Settings, User2 } from "lucide-react";

export const MainLayout: React.FC = () => {
  const { fairs, getFairs } = useFairService();

  // useSearchParams te dá [searchParams, setSearchParams]
  const [searchParams, setSearchParams] = useSearchParams();

  // Pega do URL ou, se não existir, usa o primeiro da lista
  const initialId = searchParams.get("fairId") ?? fairs[0]?.id ?? "";

  const [selectedId, setSelectedId] = useState(initialId);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);

    // atualiza a URL sem recarregar
    setSearchParams({ fairId: id });
  };

  const selectedFair = fairs.find((f) => f.id === selectedId);

  useEffect(() => {
    getFairs();
  }, []);

  // Se as fairs chegarem depois, garanta que o selectedId acompanhe
  useEffect(() => {
    if (!searchParams.get("fairId") && fairs.length > 0) {
      setSearchParams({ fairId: fairs[0].id });
      setSelectedId(fairs[0].id);
    }
  }, [fairs, searchParams, setSearchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-neutral-100 text-white p-4 h-20 flex items-center justify-between shadow-2xl">
        <img src="/logo.png" alt="logo" className="text-xl w-28" />
        <User2 size={40} className="text-gray-600 border-1 rounded-full p-1" />
      </header>
      <div className="bg-purple-300 w-full h-8"></div>
      <div className="relative w-full h-40 rounded- ">
        {/* imagem de fundo */}
        <img
          src="/bg.png"
          alt="Background"
          className="w-full h-full object-cover rounded-b-4xl"
        />

        <div className="absolute inset-0 bg-blue-900 opacity-70 rounded-b-4xl" />
        <Settings className="absolute right-5 top-5 text-white" />

        <div className="absolute inset-0 flex flex-col gap-6 items-center justify-center w-full">
          <div className="flex items-center gap-4 w-[80%]">
            {/* Indicador de status */}
            <div className="bg-green-500 rounded-full h-4 w-4" />

            {/* Select estilizado */}
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
              "
            >
              {fairs.map((fair) => (
                <option key={fair.id} value={fair.id} className="text-black">
                  {`${fair.name} ${new Date(fair.date).getFullYear()} – ${
                    fair.location
                  }`}
                </option>
              ))}
            </select>

            {/* Ícone de dropdown */}
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
      <main className="flex-grow p-6 bg-neutral-100">
        <Outlet />
      </main>
      <footer className="bg-gray-200 text-gray-700 p-4 text-center">
        © {new Date().getFullYear()} Meu App. Todos os direitos reservados.
      </footer>
    </div>
  );
};
