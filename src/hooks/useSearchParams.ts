// hooks/useURLSearchParams.ts
import { useState, useEffect } from "react";

export function useURLSearchParams() {
  // inicializa com o search atual
  const [searchParams, setSearchParams] = useState(
    () => new URLSearchParams(window.location.search)
  );

  useEffect(() => {
    // cria instância nova a cada mudança
    const updateParams = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };

    // 1) escuta volta/avança do navegador
    window.addEventListener("popstate", updateParams);

    // 2) intercepta pushState e replaceState
    const origPush = history.pushState;
    const origReplace = history.replaceState;

    history.pushState = function (...args) {
      origPush.apply(this, args);
      updateParams();
    };
    history.replaceState = function (...args) {
      origReplace.apply(this, args);
      updateParams();
    };

    return () => {
      window.removeEventListener("popstate", updateParams);
      history.pushState = origPush;
      history.replaceState = origReplace;
    };
  }, []);

  return searchParams;
}
