import { useVisitorsService } from "@/service/visitors.service";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "@/hooks/useSearchParams";
import { toast } from "sonner";

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
    exportVisitorsPdf,
  } = useVisitorsService();
  const [search, setSearch] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

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
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
    } catch {
      // Erro já é tratado no service, apenas ignora aqui para não quebrar o fluxo
    }
  }, [fairId, debouncedSearch, searchField, currentPage, itemsPerPage, dateFrom, dateTo, getVisitorsPaginated]);

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

    let data: typeof visitors;

    // Se tem paginationMeta, significa que o backend já fez a paginação
    if (paginationMeta) {
      data = visitors; // Backend já retorna dados da página atual
    } else {
      // Fallback para paginação client-side (compatibilidade)
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      data = visitors.slice(startIndex, endIndex);
    }

    // Filtro client-side por data (fallback caso o backend não suporte dateFrom/dateTo)
    if (dateFrom || dateTo) {
      data = data.filter((v) => {
        const d = (v.registrationDate ?? "").split("T")[0];
        if (!d) return true;
        if (dateFrom && d < dateFrom) return false;
        if (dateTo && d > dateTo) return false;
        return true;
      });
    }

    return data;
  }, [visitors, currentPage, itemsPerPage, paginationMeta, dateFrom, dateTo]);

  // Calcular total de páginas
  const totalPages = useMemo(() => {
    // Se tem metadata do backend, usa ela
    if (paginationMeta) {
      const totalPagesVal = paginationMeta.totalPages ?? (paginationMeta as Record<string, unknown>).total_pages;
      if (typeof totalPagesVal === 'number' && !isNaN(totalPagesVal)) {
        return totalPagesVal;
      }
      
      const totalItemsVal = paginationMeta.totalItems ?? (paginationMeta as Record<string, unknown>).total;
      if (typeof totalItemsVal === 'number' && !isNaN(totalItemsVal)) {
        return Math.ceil(totalItemsVal / itemsPerPage) || 1;
      }
    }

    // Proteção contra visitors undefined
    if (!visitors || !Array.isArray(visitors)) {
      return 1;
    }

    // Fallback para cálculo client-side
    return Math.ceil(visitors.length / itemsPerPage) || 1;
  }, [visitors, itemsPerPage, paginationMeta]);

  // Total de itens
  const totalItems = useMemo(() => {
    if (paginationMeta) {
      const totalItemsVal = paginationMeta.totalItems ?? (paginationMeta as Record<string, unknown>).total;
      if (typeof totalItemsVal === 'number' && !isNaN(totalItemsVal)) {
        return totalItemsVal;
      }
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

  const handleExportPdf = async () => {
    if (!fairId) {
      toast.error("ID da feira não encontrado.");
      return;
    }

    try {
      setIsExporting(true);
      toast.info("Gerando PDF, aguarde...", { id: "export-pdf" });
      const success = await exportVisitorsPdf(fairId);
      if (success) {
        toast.success("PDF exportado com sucesso!", { id: "export-pdf" });
      } else {
        toast.error("Erro ao exportar o PDF.", { id: "export-pdf" });
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao gerar o PDF.", { id: "export-pdf" });
    } finally {
      setIsExporting(false);
    }
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
    handleExportPdf,
    isExporting,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
  };
};
