// hooks/useURLSearchParams.ts
import { useSearchParams as useRouterSearchParams } from "react-router-dom";
import { useMemo } from "react";

export const useSearchParams = () => {
  const [searchParams, setSearchParams] = useRouterSearchParams();
  
  const fairId = useMemo(() => {
    const id = searchParams.get("fairId");
    // Retorna undefined se não há fairId válido, evitando strings vazias
    return id && id.trim() !== "" ? id : undefined;
  }, [searchParams]);

  return [searchParams, setSearchParams, fairId] as const;
};
