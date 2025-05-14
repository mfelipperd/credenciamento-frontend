import { Calendar, MapPin, Settings, User2 } from "lucide-react";
import React from "react";
import { Outlet } from "react-router-dom";

export const MainLayout: React.FC = () => (
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
        <h1 className="text-white text-2xl w-[80%] text-start flex items-center gap-4">
          <div className="bg-green-500 rounded-full h-4 w-4" /> Expo MultiMix
          2025 - Manaus
        </h1>
        <div className="flex items-center  gap-8 text-white w-[73%]">
          <div className="">
            <p className="flex items-center gap-2 font-semibold">
              <Calendar /> 05/08/2025 - 05/08/2025
            </p>
            <p className="font-light text-sm"> 13h ás 21h</p>
          </div>
          <div className="">
            <p className="flex items-center gap-2 font-semibold">
              <MapPin /> Estação das Docas - Belém
            </p>
            <p className="font-light text-sm">Av.Visconde de Souza...</p>
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
