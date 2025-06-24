import { useLocation } from "react-router-dom";

export function useCheckinId(): string | null {
  const location = useLocation();

  const pathname = location.pathname; // ex: /checkinb64bfb9f-b215-48c4-8203-6e7418b28dfa

  const match = pathname.match(/\/checkin([0-9a-fA-F-]{36})/);

  if (match && match[1]) {
    return match[1]; // retorna só o UUID
  }

  return null;
}
