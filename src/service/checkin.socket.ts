import { useEffect } from "react";
import io from "socket.io-client";
import type { Socket } from "socket.io-client";
import type { Visitor } from "@/interfaces/visitors";

// Armazena o socket fora do hook para manter conexão estável
let socket: Socket | null = null;

/**
 * Escuta o WebSocket e chama o callback quando os dados do visitante chegam
 * @param onVisitorReceived Função que recebe os dados do visitante
 */
export function useCheckinSocket(
  onVisitorReceived: (visitor: Visitor) => void
) {
  const socketUrl = import.meta.env.VITE_API_BASE_URL.replace(/^https/, "wss");
  useEffect(() => {
    if (!socket) {
      socket = io(socketUrl, {
        transports: ["websocket"],
      });
    }

    socket.on("connect", () => {
      console.log("🟢 Conectado ao WebSocket");
    });

    socket.on("checkinConfirmed", (visitorData: Visitor) => {
      onVisitorReceived(visitorData);
    });

    socket.on("disconnect", () => {
      console.warn("🔴 WebSocket desconectado");
    });

    return () => {
      // opcional: manter conexão ativa ou não
      // socket?.disconnect(); // descomente se quiser encerrar ao desmontar
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
