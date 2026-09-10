import { useEffect } from "react";
import io from "socket.io-client";
import type { Visitor } from "@/interfaces/visitors";

let socket: ReturnType<typeof io> | null = null;
let subscribers = 0;

/**
 * Escuta o WebSocket e chama o callback quando os dados do visitante chegam
 * @param onVisitorReceived Função que recebe os dados do visitante
 */
export function useCheckinSocket(
  onVisitorReceived: (visitor: Visitor) => void
) {
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_BASE_URL.replace(/^https/, "wss");
    if (!socket) {
      socket = io(socketUrl, {
        transports: ["websocket"],
      });
    }

    const connection = socket;
    subscribers += 1;
    const handleConnect = () => {
      console.log("🟢 Conectado ao WebSocket");
    };

    const handleVisitor = (visitorData: Visitor) => {
      onVisitorReceived(visitorData);
    };

    const handleDisconnect = () => {
      console.warn("🔴 WebSocket desconectado");
    };

    connection.on("connect", handleConnect);
    connection.on("checkinConfirmed", handleVisitor);
    connection.on("disconnect", handleDisconnect);

    return () => {
      connection.off("connect", handleConnect);
      connection.off("checkinConfirmed", handleVisitor);
      connection.off("disconnect", handleDisconnect);
      subscribers -= 1;
      if (subscribers === 0) {
        connection.disconnect();
        socket = null;
      }
    };
  }, [onVisitorReceived]);
}
