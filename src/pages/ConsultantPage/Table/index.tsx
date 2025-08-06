import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { CardRoot } from "@/components/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { SlidersHorizontal, MessageCircle, MoreHorizontal } from "lucide-react";
import { useVisitorsService } from "@/service/visitors.service";
import { useFairService } from "@/service/fair.service";
import { useAuth } from "@/hooks/useAuth";
import { Label } from "@/components/ui/label";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { Visitor } from "@/interfaces/visitors";
import { TableSkeleton } from "./TableSkeleton";

// Extend User interface to include fairIds
interface UserWithFairIds {
  id: number;
  name: string;
  email: string;
  role: string;
  fairIds?: string[];
}

export const EnhancedTableConsultant = () => {
  const { visitors, getVisitorsPaginated, loading, paginationMeta, error } =
    useVisitorsService();
  const { fairs, getFairs } = useFairService();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados da consulta
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = useState(Number(searchParams.get("limit")) || 50);
  const [selectedFairId, setSelectedFairId] = useState<string>("");

  // Estados da UI
  const [visibleColumns, setVisibleColumns] = useState<
    Record<keyof Visitor, boolean>
  >({
    id: false,
    registrationCode: true,
    name: true,
    company: true,
    email: true,
    cnpj: true,
    phone: true,
    zipCode: false,
    sectors: false,
    howDidYouKnow: false,
    category: false,
    registrationDate: false,
    fair_visitor: false,
  });

  // Verificar se é consultant e definir fairId automaticamente
  const isConsultant = user?.role === "consultant";
  const shouldShowFairSelect = !isConsultant;

  // Para consultants, usar o primeiro fairId do usuário
  // Para outros usuários, usar o selectedFairId do state
  const currentFairId = useMemo(() => {
    if (isConsultant) {
      const userWithFairs = user as UserWithFairIds;
      const userFairIds = userWithFairs?.fairIds || [];

      // Se é consultant, usar o fairId selecionado se houver múltiplas feiras
      // ou o primeiro fairId se houver apenas uma
      if (userFairIds.length > 1) {
        return selectedFairId || userFairIds[0];
      } else if (userFairIds.length === 1) {
        return userFairIds[0];
      }
      return "";
    }
    return selectedFairId;
  }, [isConsultant, user, selectedFairId]);

  // Para UI, calcular se deve mostrar select para consultant com múltiplas feiras
  const shouldShowConsultantFairSelect = useMemo(() => {
    if (!isConsultant) return false;
    const userWithFairs = user as UserWithFairIds;
    const userFairIds = userWithFairs?.fairIds || [];
    return userFairIds.length > 1;
  }, [isConsultant, user]);

  // Estado para controlar fetch inicial
  const [hasInitialFetch, setHasInitialFetch] = useState(false);
  const [hasFairsFetch, setHasFairsFetch] = useState(false);

  // Buscar feiras quando necessário (para admins e consultants com múltiplas feiras)
  useEffect(() => {
    if (
      (shouldShowFairSelect || shouldShowConsultantFairSelect) &&
      !hasFairsFetch
    ) {
      getFairs();
      setHasFairsFetch(true);
    }
  }, [
    shouldShowFairSelect,
    shouldShowConsultantFairSelect,
    hasFairsFetch,
    getFairs,
  ]);

  // Definir fairId inicial para não-consultants
  useEffect(() => {
    if (shouldShowFairSelect && fairs.length > 0 && !selectedFairId) {
      const fairFromUrl = searchParams.get("fairId");
      if (fairFromUrl && fairs.some((f) => f.id === fairFromUrl)) {
        setSelectedFairId(fairFromUrl);
      } else {
        // Selecionar primeira feira por padrão
        setSelectedFairId(fairs[0].id);
      }
    }
  }, [fairs, selectedFairId, shouldShowFairSelect, searchParams]);

  // Atualizar URL com parâmetros
  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (currentFairId) params.set("fairId", currentFairId);

    setSearchParams(params, { replace: true });
  }, [search, page, limit, currentFairId, setSearchParams]);

  // Fetch inicial e quando currentFairId mudar
  useEffect(() => {
    if (currentFairId && !hasInitialFetch) {
      getVisitorsPaginated({
        page: 1,
        limit,
        search: search || undefined,
        fairId: currentFairId,
      });
      setHasInitialFetch(true);
      setPage(1);
    }
  }, [currentFairId, hasInitialFetch, getVisitorsPaginated, limit, search]);

  // Reset hasInitialFetch quando fairId mudar
  useEffect(() => {
    if (currentFairId) {
      setHasInitialFetch(false);
    }
  }, [currentFairId]);

  // Função para fazer fetch dos dados (sem page nas dependências para evitar loops)
  const fetchData = useCallback(
    (targetPage: number, resetPage = false) => {
      if (!currentFairId) return;

      if (resetPage) setPage(1);

      getVisitorsPaginated({
        page: targetPage,
        limit,
        search: search || undefined,
        fairId: currentFairId,
      });
    },
    [currentFairId, limit, search, getVisitorsPaginated]
  );

  // Fetch inicial e quando currentFairId mudar
  useEffect(() => {
    if (currentFairId && !hasInitialFetch) {
      fetchData(1, true);
      setHasInitialFetch(true);
    }
  }, [currentFairId, hasInitialFetch, fetchData]);

  // Reset hasInitialFetch quando fairId mudar
  useEffect(() => {
    if (currentFairId) {
      setHasInitialFetch(false);
    }
  }, [currentFairId]);

  // Debounce search
  useEffect(() => {
    if (!hasInitialFetch) return;

    const timer = setTimeout(() => {
      fetchData(1, true);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, fetchData, hasInitialFetch]);

  // Fetch quando página mudar
  useEffect(() => {
    if (hasInitialFetch && currentFairId) {
      fetchData(page, false);
    }
  }, [page, hasInitialFetch, currentFairId, fetchData]);

  // Fetch quando limite mudar
  useEffect(() => {
    if (hasInitialFetch) {
      fetchData(1, true);
    }
  }, [limit, fetchData, hasInitialFetch]);

  // Category filter from URL
  const categoryFilter = useMemo(() => {
    const param = searchParams.get("category");
    return param ? param.split(",") : [];
  }, [searchParams]);

  const toggleCategory = (cat: string, checked: boolean) => {
    const current = categoryFilter;
    const next = checked
      ? Array.from(new Set([...current, cat]))
      : current.filter((c) => c !== cat);
    const params = new URLSearchParams(searchParams);
    if (next.length) params.set("category", next.join(","));
    else params.delete("category");
    params.set("page", "1");
    setSearchParams(params);
    setPage(1);
  };

  // Category options
  const categories = ["visitante", "lojista", "representante comercial"];

  return (
    <div className="space-y-6">
      {/* Hero Section para Expositores */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4">
              🎪 Dados Exclusivos da ExpoMultiMix
            </h1>
            <p className="text-xl mb-6 text-purple-100">
              Acesse informações privilegiadas dos visitantes, análises
              avançadas e ferramentas de CRM para maximizar seus resultados na
              feira
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg transform hover:scale-105 transition-all"
              >
                <a
                  href="https://api.whatsapp.com/send?phone=91982836424&text=Quero%20saber%20mais%20sobre%20os%20dados%20da%20ExpoMultiMix"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💼 Quero Meu Stand
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 px-6 py-3 rounded-full"
              >
                <a
                  href="https://api.whatsapp.com/send?phone=91982836424&text=Preciso%20de%20ajuda%20com%20os%20dados"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 Suporte
                </a>
              </Button>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-2">+2.500</h3>
              <p className="text-purple-200">Visitantes Cadastrados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info do Consultor/Expositor */}
      {isConsultant && (
        <div className="bg-white rounded-lg border border-purple-200 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
            🏢 Painel do Expositor
          </h2>
          <p className="text-gray-600 mb-4">
            <strong>Usuário:</strong> {user?.name} | <strong>Email:</strong>{" "}
            {user?.email}
          </p>
          {(() => {
            const userWithFairs = user as UserWithFairIds;
            const userFairIds = userWithFairs?.fairIds || [];
            if (userFairIds.length === 0) {
              return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">
                    ⚠️ Nenhuma feira associada. Entre em contato para adquirir
                    seu acesso.
                  </p>
                  <Button
                    asChild
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <a
                      href="https://api.whatsapp.com/send?phone=91982836424&text=Preciso%20de%20acesso%20aos%20dados%20da%20feira"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Solicitar Acesso
                    </a>
                  </Button>
                </div>
              );
            }
            return (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700">
                  ✅ Acesso liberado para {userFairIds.length} feira(s)
                  {userFairIds.length > 1 &&
                    " - Use o filtro abaixo para alternar entre elas"}
                </p>
              </div>
            );
          })()}
        </div>
      )}

      <CardRoot
        title="📊 Central de Dados dos Visitantes"
        className="bg-white shadow-lg border-t-4 border-t-purple-600"
      >
        <>
          {/* Alerta Premium para quem não tem acesso */}
          {!currentFairId && (
            <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-amber-500 rounded-full p-2">
                    <SlidersHorizontal className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">
                    🔒 Acesso Premium Necessário
                  </h3>
                  <p className="text-amber-700 mb-4">
                    {isConsultant
                      ? "Para acessar os dados completos dos visitantes, você precisa de uma feira associada ao seu perfil."
                      : "Esta é uma área exclusiva para expositores. Adquira seu stand e tenha acesso a dados valiosos dos visitantes."}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      asChild
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      <a
                        href="https://api.whatsapp.com/send?phone=91982836424&text=Quero%20acesso%20aos%20dados%20dos%20visitantes"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        💰 Adquirir Acesso
                      </a>
                    </Button>
                    <Button variant="outline" className="border-amber-300">
                      Ver Demonstração
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toolbar Premium - Funcionalidades de Análise */}
          <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  ⚡ Ferramentas Avançadas de Análise
                  {!currentFairId && (
                    <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">
                      PREMIUM
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  Filtre, organize e analise dados com precisão profissional
                </p>
              </div>
              {!currentFairId && (
                <Button
                  asChild
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  <a
                    href="https://api.whatsapp.com/send?phone=91982836424&text=Quero%20liberar%20as%20ferramentas%20premium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🚀 Liberar Agora
                  </a>
                </Button>
              )}
            </div>

            <div
              className={`w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 ${
                !currentFairId ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  {/* Select de Feira para admins */}
                  {shouldShowFairSelect && (
                    <Select
                      value={selectedFairId}
                      onValueChange={(value) => {
                        setSelectedFairId(value);
                        setPage(1); // Reset página ao trocar feira
                      }}
                      disabled={!currentFairId}
                    >
                      <SelectTrigger className="w-full sm:w-[200px] h-9 bg-white">
                        <SelectValue placeholder="Selecione uma feira" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {fairs.map((fair) => (
                          <SelectItem key={fair.id} value={fair.id}>
                            {fair.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Select de Feira para consultants com múltiplas feiras */}
                  {shouldShowConsultantFairSelect && (
                    <Select
                      value={selectedFairId || currentFairId}
                      onValueChange={(value) => {
                        setSelectedFairId(value);
                        setPage(1); // Reset página ao trocar feira
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[200px] h-9 bg-white">
                        <SelectValue placeholder="Selecione uma feira" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {(() => {
                          const userWithFairs = user as UserWithFairIds;
                          const userFairIds = userWithFairs?.fairIds || [];
                          // Filtrar apenas as feiras que o consultant tem acesso
                          return fairs
                            .filter((fair) => userFairIds.includes(fair.id))
                            .map((fair) => (
                              <SelectItem key={fair.id} value={fair.id}>
                                {fair.name}
                              </SelectItem>
                            ));
                        })()}
                      </SelectContent>
                    </Select>
                  )}

                  <Input
                    placeholder="🔍 Busca inteligente por nome, empresa, email..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                    className="flex-1 sm:max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                    disabled={!currentFairId}
                  />
                </div>

                {/* Info de resultados com badges premium */}
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <span className="text-gray-600">
                    {loading
                      ? "Carregando..."
                      : paginationMeta
                      ? `${paginationMeta.totalItems} visitante${
                          paginationMeta.totalItems !== 1 ? "s" : ""
                        } encontrado${
                          paginationMeta.totalItems !== 1 ? "s" : ""
                        } (página ${paginationMeta.page} de ${
                          paginationMeta.totalPages
                        })`
                      : `${visitors.length} visitante${
                          visitors.length !== 1 ? "s" : ""
                        } encontrado${visitors.length !== 1 ? "s" : ""}`}
                  </span>

                  {search && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      🎯 Busca Ativa
                    </span>
                  )}
                  {paginationMeta && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      🚀 Sistema Otimizado
                    </span>
                  )}
                  {currentFairId && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      💎 Modo Premium
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap">
                <Select
                  value={String(limit)}
                  onValueChange={(val) => {
                    setLimit(Number(val));
                    setPage(1);
                  }}
                  disabled={!currentFairId}
                >
                  <SelectTrigger className="w-full sm:w-[120px] h-9 bg-white">
                    <SelectValue placeholder="Qtd" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {[10, 25, 50, 100].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}/página
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white w-full sm:w-auto relative"
                      disabled={!currentFairId}
                    >
                      📊 Colunas Personalizadas
                      {!currentFairId && (
                        <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs px-1 rounded-full">
                          PRO
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    {Object.entries(visibleColumns).map(([col, isVisible]) => {
                      const labels: Record<keyof Visitor, string> = {
                        id: "ID",
                        registrationCode: "Código",
                        name: "Nome",
                        company: "Empresa",
                        email: "Email",
                        cnpj: "CNPJ",
                        phone: "Telefone",
                        zipCode: "CEP",
                        sectors: "Setores",
                        howDidYouKnow: "Como Conheceu",
                        category: "Categoria",
                        registrationDate: "Data Cadastro",
                        fair_visitor: "Feiras",
                      };

                      return (
                        <DropdownMenuCheckboxItem
                          key={col}
                          checked={isVisible}
                          onCheckedChange={(checked) =>
                            setVisibleColumns((prev) => ({
                              ...prev,
                              [col]: checked,
                            }))
                          }
                        >
                          {labels[col as keyof Visitor]}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Side sheet for advanced filters */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full sm:w-auto relative ${
                        categoryFilter.length > 0
                          ? "bg-purple-600 text-white"
                          : ""
                      }`}
                      disabled={!currentFairId}
                    >
                      <SlidersHorizontal className="mr-1" />
                      Filtros Avançados
                      {!currentFairId && (
                        <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs px-1 rounded-full">
                          PRO
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 bg-white p-6 z-50">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        🎯 Filtros Profissionais
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          PREMIUM
                        </span>
                      </SheetTitle>
                    </SheetHeader>
                    <div className="space-y-6 mt-6">
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          🏷️ Categoria de Visitante
                        </h4>
                        <div className="space-y-3">
                          {categories.map((cat) => (
                            <Label
                              key={cat}
                              className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded"
                            >
                              <Checkbox
                                checked={categoryFilter.includes(cat)}
                                onCheckedChange={(checked) =>
                                  toggleCategory(cat, checked as boolean)
                                }
                              />
                              <span className="capitalize">{cat}</span>
                            </Label>
                          ))}
                        </div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-medium text-purple-800 mb-2">
                          💡 Dica Premium
                        </h4>
                        <p className="text-sm text-purple-600">
                          Use os filtros para segmentar seus leads e criar
                          campanhas direcionadas mais eficazes.
                        </p>
                      </div>
                    </div>
                    <SheetClose asChild>
                      <Button className="mt-6 w-full bg-purple-600 hover:bg-purple-700">
                        Aplicar Filtros
                      </Button>
                    </SheetClose>
                  </SheetContent>
                </Sheet>

                <HoverCard>
                  <HoverCardTrigger>
                    <Button
                      disabled
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto relative opacity-60"
                    >
                      📄 Exportar PDF
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        EM BREVE
                      </span>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="bg-white w-fit px-3 py-2">
                    Funcionalidade em desenvolvimento - Aguarde novidades!
                  </HoverCardContent>
                </HoverCard>

                <HoverCard>
                  <HoverCardTrigger>
                    <Button
                      disabled
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto relative opacity-60"
                    >
                      📊 Exportar Excel
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        EM BREVE
                      </span>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="bg-white w-fit px-3 py-2">
                    Funcionalidade em desenvolvimento - Aguarde novidades!
                  </HoverCardContent>
                </HoverCard>

                <HoverCard>
                  <HoverCardTrigger>
                    <Button
                      disabled
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto relative opacity-60"
                    >
                      📧 Email Marketing
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        EM BREVE
                      </span>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="bg-white w-fit px-3 py-2">
                    Disparo de campanhas personalizadas - Em desenvolvimento
                  </HoverCardContent>
                </HoverCard>

                <HoverCard>
                  <HoverCardTrigger>
                    <Button
                      disabled
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto relative opacity-60"
                    >
                      � Analytics
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        EM BREVE
                      </span>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="bg-white w-fit px-3 py-2">
                    Relatórios avançados e métricas - Em breve
                  </HoverCardContent>
                </HoverCard>

                <HoverCard>
                  <HoverCardTrigger>
                    <Button
                      disabled
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto relative opacity-60"
                    >
                      🎯 CRM Integrado
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        EM BREVE
                      </span>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="bg-white w-fit px-3 py-2">
                    Sistema CRM completo para gestão de leads - Novidade!
                  </HoverCardContent>
                </HoverCard>

                <HoverCard>
                  <HoverCardTrigger>
                    <Button
                      disabled
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto relative opacity-60"
                    >
                      📱 App Mobile
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        EM BREVE
                      </span>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="bg-white w-fit px-3 py-2">
                    Aplicativo para captura de leads em campo - Em
                    desenvolvimento
                  </HoverCardContent>
                </HoverCard>

                <HoverCard>
                  <HoverCardTrigger>
                    <Button
                      disabled
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto relative opacity-60"
                    >
                      🔔 Automações
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        EM BREVE
                      </span>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="bg-white w-fit px-3 py-2">
                    Follow-ups automáticos e workflows inteligentes - Novidade!
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
          </div>

          {/* Table */}
          <Table className="">
            <TableHeader className="sticky top-0 ">
              <TableRow>
                {visibleColumns.registrationCode && (
                  <TableHead>Código</TableHead>
                )}
                {visibleColumns.name && <TableHead>Nome</TableHead>}
                {visibleColumns.company && <TableHead>Empresa</TableHead>}
                {visibleColumns.email && <TableHead>Email</TableHead>}
                {visibleColumns.cnpj && (
                  <TableHead align="center">CNPJ</TableHead>
                )}
                {visibleColumns.phone && (
                  <TableHead align="center">Telefone</TableHead>
                )}
                {visibleColumns.zipCode && <TableHead>CEP</TableHead>}
                {visibleColumns.sectors && <TableHead>Setores</TableHead>}
                {visibleColumns.howDidYouKnow && (
                  <TableHead>Como Conheceu</TableHead>
                )}
                {visibleColumns.category && <TableHead>Categoria</TableHead>}
                {visibleColumns.registrationDate && (
                  <TableHead>Data Cadastro</TableHead>
                )}
                <TableHead align="center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton
                  rows={limit > 10 ? 10 : limit}
                  columns={
                    Object.values(visibleColumns).filter(Boolean).length + 1
                  }
                />
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    <div className="text-red-500">{error}</div>
                  </TableCell>
                </TableRow>
              ) : visitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    <div className="text-gray-500">
                      {!currentFairId
                        ? "Selecione uma feira para visualizar os visitantes"
                        : "Nenhum visitante encontrado"}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                visitors.map((visitor) => (
                  <TableRow
                    key={visitor.registrationCode}
                    className="hover:bg-purple-50"
                  >
                    {visibleColumns.registrationCode && (
                      <TableCell>{visitor.registrationCode}</TableCell>
                    )}
                    {visibleColumns.name && (
                      <TableCell>{visitor.name}</TableCell>
                    )}
                    {visibleColumns.company && (
                      <TableCell>{visitor.company}</TableCell>
                    )}
                    {visibleColumns.email && (
                      <TableCell>{visitor.email}</TableCell>
                    )}
                    {visibleColumns.cnpj && (
                      <TableCell align="center">
                        {visitor.category === "visitante"
                          ? "Visitante"
                          : visitor.cnpj}
                      </TableCell>
                    )}
                    {visibleColumns.phone && (
                      <TableCell align="center">
                        <Button variant="link" asChild>
                          <a
                            href={`https://api.whatsapp.com/send?phone=${visitor.phone.replace(
                              /\D/g,
                              ""
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="inline-block mr-1" />
                            {visitor.phone}
                          </a>
                        </Button>
                      </TableCell>
                    )}
                    {visibleColumns.zipCode && (
                      <TableCell>{visitor.zipCode}</TableCell>
                    )}
                    {visibleColumns.sectors && (
                      <TableCell>{visitor.sectors?.join(", ")}</TableCell>
                    )}
                    {visibleColumns.howDidYouKnow && (
                      <TableCell>{visitor.howDidYouKnow}</TableCell>
                    )}
                    {visibleColumns.category && (
                      <TableCell>{visitor.category}</TableCell>
                    )}
                    {visibleColumns.registrationDate && (
                      <TableCell>
                        {new Date(visitor.registrationDate).toLocaleDateString(
                          "pt-BR"
                        )}
                      </TableCell>
                    )}

                    <TableCell align="center">
                      <Button variant="link">
                        <MoreHorizontal />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Button
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="relative"
            >
              {loading && page > 1 ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              ) : null}
              Anterior
            </Button>
            <span className="flex items-center gap-2">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                  Carregando...
                </>
              ) : (
                `Página ${page} de ${paginationMeta?.totalPages || 1}`
              )}
            </span>
            <Button
              disabled={
                (paginationMeta && page >= paginationMeta.totalPages) || loading
              }
              onClick={() => setPage((p) => p + 1)}
              className="relative"
            >
              {loading && page < (paginationMeta?.totalPages || 1) ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current ml-2"></div>
              ) : null}
              Próxima
            </Button>
          </div>
        </>
      </CardRoot>
    </div>
  );
};
