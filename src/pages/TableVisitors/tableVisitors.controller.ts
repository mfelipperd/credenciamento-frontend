import { useVisitorsService } from "@/service/visitors.service";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "@/hooks/useSearchParams";

export const useTableVisitorsController = () => {
  const [, , fairId] = useSearchParams();
  const [id, setId] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openCreateForm, setOpenCreateForm] = useState<boolean>(false);
  const {
    getVisitorsPaginated,
    loading,
    visitors,
    paginationMeta,
    error,
    deleteVisitor,
  } = useVisitorsService();
  const [search, setSearch] = useState("");

  // Estados para paginação e busca
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // 50 itens por página
  const [debouncedSearch, setDebouncedSearch] = useState<string | undefined>(
    undefined
  );
  const [searchField, setSearchField] = useState<string>("all");

  // Função para detectar automaticamente o tipo de busca
  const detectSearchType = (searchTerm: string): string => {
    if (!searchTerm) return "all";

    // Detectar email
    if (searchTerm.includes("@")) return "email";

    // Detectar código de registro (padrão: letras seguidas de números)
    if (/^[A-Z]{2,4}\d{3,6}$/i.test(searchTerm.replace(/\s/g, ""))) {
      return "registrationCode";
    }

    // Detectar se é apenas números (possivelmente telefone)
    if (/^\d+$/.test(searchTerm.replace(/[\s\-()]/g, ""))) {
      return "phone";
    }

    // Detectar se parece com nome de empresa (contém palavras como Ltd, Inc, SA, etc)
    if (
      /\b(ltd|inc|sa|ltda|corp|corporation|company|cia)\b/i.test(searchTerm)
    ) {
      return "company";
    }

    // Se tem múltiplas palavras, provavelmente é nome completo
    if (searchTerm.trim().split(" ").length > 1) {
      return "name";
    }

    // Default para busca geral
    return "all";
  };

  // Debounce do search para evitar muitas requisições
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedSearch = search.trim();
      setDebouncedSearch(trimmedSearch || undefined); // Converte string vazia para undefined
      setCurrentPage(1); // Reset page when searching

      // Detectar automaticamente o tipo de busca
      const detectedType = detectSearchType(trimmedSearch);
      setSearchField(detectedType);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Função para decidir entre busca simples ou paginada
  const fetchVisitors = useCallback(async () => {
    if (!fairId) return;

    try {
      // SEMPRE usa paginação server-side para melhor performance e consistência
      await getVisitorsPaginated({
        fairId,
        search: debouncedSearch,
        searchField: searchField !== "all" ? searchField : undefined,
        page: currentPage,
        limit: itemsPerPage,
        sortBy: "name",
        sortOrder: "asc",
      });
    } catch {
      // Erro já é tratado no service, apenas ignora aqui para não quebrar o fluxo
    }
  }, [fairId, debouncedSearch, searchField, currentPage, itemsPerPage]);

  // Buscar dados quando parâmetros mudarem
  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const handleCreateForm = () => {
    setOpenCreateForm((prev) => !prev);
  };

  const handleClick = (checkinId: string) => {
    const params = new URLSearchParams(window.location.search);
    const fairId = params.get("fairId");

    if (!fairId) {
      console.warn("fairId não encontrado na URL.");
      return;
    }

    const url = `${window.location.origin}/visitor/checkin${checkinId}?fairId=${fairId}`;
    window.open(url, "_blank");
  };

  // Dados para exibição - usa visitors diretamente (vem do backend)
  const paginatedData = useMemo(() => {
    // Proteção contra visitors undefined ou null
    if (!visitors || !Array.isArray(visitors)) {
      return [];
    }

    // Se tem paginationMeta, significa que o backend já fez a paginação
    if (paginationMeta) {
      return visitors; // Backend já retorna dados da página atual
    }

    // Fallback para paginação client-side (compatibilidade)
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return visitors.slice(startIndex, endIndex);
  }, [visitors, currentPage, itemsPerPage, paginationMeta]);

  // Calcular total de páginas
  const totalPages = useMemo(() => {
    // Se tem metadata do backend, usa ela
    if (paginationMeta) {
      return paginationMeta.totalPages;
    }

    // Proteção contra visitors undefined
    if (!visitors || !Array.isArray(visitors)) {
      return 1;
    }

    // Fallback para cálculo client-side
    return Math.ceil(visitors.length / itemsPerPage);
  }, [visitors, itemsPerPage, paginationMeta]);

  // Total de itens
  const totalItems = useMemo(() => {
    if (paginationMeta) {
      return paginationMeta.totalItems;
    }

    // Proteção contra visitors undefined
    if (!visitors || !Array.isArray(visitors)) {
      return 0;
    }

    return visitors.length;
  }, [visitors, paginationMeta]);

  const reload = () => {
    fetchVisitors();
  };

  const handleDelete = async () => {
    const result = await deleteVisitor(id);
    if (!result) return;
    await fetchVisitors(); // Recarrega dados após deletar
    setIsOpen(false);
  };

  const openDeleteModal = (id: string) => {
    setIsOpen(true);
    setId(id);
  };

  return {
    loading,
    error,
    setSearch,
    filteredData: paginatedData, // Retorna dados paginados
    search,
    handleDelete,
    isOpen,
    setIsOpen,
    openDeleteModal,
    handleClick,
    reload,
    handleCreateForm,
    openCreateForm,
    // Estados de paginação - com suporte a server-side
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    totalItems, // Agora usa paginationMeta quando disponível
    // Busca inteligente
    searchField,
    setSearchField,
    // Metadata de paginação server-side
    paginationMeta,
  };
};
