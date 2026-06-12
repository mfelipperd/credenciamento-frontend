import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "@/hooks/useSearchParams";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Users, Lock, MessageCircle, MoreHorizontal, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { useVisitors } from "@/hooks/useVisitors";
import { useUserSession } from "@/hooks/useUserSession";
import { useAxio } from "@/hooks/useAxio";
import { AppEndpoints } from "@/constants/AppEndpoints";
import { toast } from "sonner";
import type { Visitor } from "@/interfaces/visitors";
import { TableSkeleton } from "./TableSkeleton";


export const EnhancedTableConsultant = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    user,
    currentFairId,
    setSelectedFairId,
    canAccessData,
    sessionStatus,
    fairStatus,
  } = useUserSession();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [limit] = useState(Number(searchParams.get("limit")) || 50);

  useEffect(() => {
    const urlSearch = searchParams.get("search") ?? "";
    const urlPage = Number(searchParams.get("page")) || 1;
    const urlFairId = searchParams.get("fairId");

    setSearch(urlSearch);
    setPage(urlPage);
    if (urlFairId) setSelectedFairId(urlFairId);
  }, [searchParams, setSelectedFairId]);

  const {
    data: visitorsData,
    isLoading: loading,
  } = useVisitors({
    fairId: currentFairId,
    search: debouncedSearch || undefined,
    page,
    limit,
  });

  const visitors = visitorsData?.data || [];
  const paginationMeta = visitorsData?.meta || null;

  const [visibleColumns] = useState<Record<keyof Visitor, boolean>>({
    id: false,
    registrationCode: false,
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

  const isConsultant = user?.role === "consultant";
  const api = useAxio();
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

  const handleExportPdf = useCallback(async () => {
    if (!currentFairId) return;
    setExportingPdf(true);
    try {
      const response = await api.get(AppEndpoints.VISITORS.EXPORT_PDF(currentFairId), {
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `visitantes-${currentFairId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF exportado com sucesso!");
    } catch {
      toast.error("Erro ao exportar PDF. Tente novamente.");
    } finally {
      setExportingPdf(false);
    }
  }, [api, currentFairId]);

  const handleExportCsv = useCallback(async () => {
    if (!currentFairId) return;
    setExportingCsv(true);
    try {
      const response = await api.get(AppEndpoints.VISITORS.BASE, {
        params: { fairId: currentFairId, limit: 9999, page: 1 },
      });
      const all: Visitor[] = response.data?.data ?? response.data ?? [];

      const headers = ["Código", "Nome", "Empresa", "Email", "CNPJ", "Telefone", "CEP", "Categoria", "Como Conheceu", "Setores"];
      const rows = all.map((v) => [
        v.registrationCode,
        v.name,
        v.company,
        v.email,
        v.cnpj,
        v.phone,
        v.zipCode,
        v.category,
        v.howDidYouKnow,
        v.sectors?.join("; ") ?? "",
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");

      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `visitantes-${currentFairId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`CSV exportado — ${all.length} visitantes`);
    } catch {
      toast.error("Erro ao exportar CSV. Tente novamente.");
    } finally {
      setExportingCsv(false);
    }
  }, [api, currentFairId]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (currentFairId) params.set("fairId", currentFairId);
    setSearchParams(params, { replace: true });
  }, [search, page, limit, currentFairId, setSearchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      if (search !== (searchParams.get("search") ?? "")) setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, searchParams]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900">

      {/* ── Header ── */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-900/40 rounded-lg p-2.5">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Visitantes
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {canAccessData && currentFairId
                  ? "Dados dos visitantes da feira selecionada"
                  : "Selecione uma feira para visualizar os dados"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {paginationMeta && canAccessData && (
              <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl px-5 py-3">
                <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {paginationMeta.totalItems.toLocaleString("pt-BR")}
                </span>
                <span className="text-xs text-purple-500 dark:text-purple-400 leading-tight">
                  visitantes<br />cadastrados
                </span>
              </div>
            )}

            {canAccessData && currentFairId && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCsv}
                  disabled={exportingCsv}
                  className="gap-1.5"
                >
                  {exportingCsv
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <FileSpreadsheet className="h-4 w-4 text-green-600" />}
                  Exportar CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPdf}
                  disabled={exportingPdf}
                  className="gap-1.5"
                >
                  {exportingPdf
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <FileText className="h-4 w-4 text-red-500" />}
                  Exportar PDF
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Painel do consultor ── */}
      {isConsultant && (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-800 dark:text-gray-200">{user?.name}</span>
            {" · "}
            {user?.email}
          </p>
          {fairStatus.type === "no_fairs" ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <span>⚠️ {fairStatus.message}</span>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50"
              >
                <a
                  href="https://api.whatsapp.com/send?phone=91982836424&text=Preciso%20de%20acesso%20aos%20dados%20da%20feira"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Solicitar acesso
                </a>
              </Button>
            </div>
          ) : !currentFairId ? (
            <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
              ⚠️ Selecione uma feira para acessar os dados.
            </p>
          ) : (
            <p className="mt-1 text-sm text-green-600 dark:text-green-400">
              ✅ {fairStatus.message}
            </p>
          )}
        </div>
      )}

      {/* ── Alerta sem acesso ── */}
      {!canAccessData && (
        <div className="mx-6 mt-4 mb-2 flex items-start gap-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
          <div className="shrink-0 bg-amber-400 rounded-full p-2">
            <Lock className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
              Acesso Premium Necessário
            </p>
            <p className="text-amber-700 dark:text-amber-400 text-sm mt-0.5">
              {sessionStatus.message}
            </p>
          </div>
          <Button
            asChild
            size="sm"
            className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white"
          >
            <a
              href="https://api.whatsapp.com/send?phone=91982836424&text=Quero%20acesso%20aos%20dados%20dos%20visitantes"
              target="_blank"
              rel="noopener noreferrer"
            >
              Adquirir acesso
            </a>
          </Button>
        </div>
      )}

      {/* ── Tabela full-width ── */}
      <div className="flex-1 overflow-x-auto">
        <Table className="w-full text-sm">
          <TableHeader className="sticky top-0 bg-gray-50 dark:bg-slate-800">
            <TableRow className="border-b border-gray-200 dark:border-slate-700">
              {visibleColumns.registrationCode && <TableHead className="px-6">Código</TableHead>}
              {visibleColumns.name && <TableHead className="px-6">Nome</TableHead>}
              {visibleColumns.company && <TableHead className="px-6">Empresa</TableHead>}
              {visibleColumns.email && <TableHead className="px-6">Email</TableHead>}
              {visibleColumns.cnpj && <TableHead className="px-6 text-center">CNPJ</TableHead>}
              {visibleColumns.phone && <TableHead className="px-6 text-center">Telefone</TableHead>}
              {visibleColumns.zipCode && <TableHead className="px-6">CEP</TableHead>}
              {visibleColumns.sectors && <TableHead className="px-6">Setores</TableHead>}
              {visibleColumns.howDidYouKnow && <TableHead className="px-6">Como Conheceu</TableHead>}
              {visibleColumns.category && <TableHead className="px-6">Categoria</TableHead>}
              {visibleColumns.registrationDate && <TableHead className="px-6">Data Cadastro</TableHead>}
              <TableHead className="px-6 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton
                rows={limit > 10 ? 10 : limit}
                columns={Object.values(visibleColumns).filter(Boolean).length + 1}
              />
            ) : visitors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-16">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Users className="h-8 w-8" />
                    <span className="text-sm">
                      {!canAccessData
                        ? "Acesso necessário para visualizar os visitantes"
                        : "Nenhum visitante encontrado"}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              visitors.map((visitor) => (
                <TableRow
                  key={visitor.registrationCode}
                  className="border-b border-gray-100 dark:border-slate-700 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors"
                >
                  {visibleColumns.registrationCode && (
                    <TableCell className="px-6 font-mono text-xs text-gray-500">{visitor.registrationCode}</TableCell>
                  )}
                  {visibleColumns.name && (
                    <TableCell className="px-6 font-medium">{visitor.name}</TableCell>
                  )}
                  {visibleColumns.company && (
                    <TableCell className="px-6 text-gray-600 dark:text-gray-300">{visitor.company}</TableCell>
                  )}
                  {visibleColumns.email && (
                    <TableCell className="px-6 text-gray-600 dark:text-gray-300">{visitor.email}</TableCell>
                  )}
                  {visibleColumns.cnpj && (
                    <TableCell className="px-6 text-center text-gray-600 dark:text-gray-300">
                      {visitor.category === "visitante" ? "—" : visitor.cnpj}
                    </TableCell>
                  )}
                  {visibleColumns.phone && (
                    <TableCell className="px-6 text-center">
                      <a
                        href={`https://api.whatsapp.com/send?phone=${visitor.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 dark:text-green-400 text-sm"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        {visitor.phone}
                      </a>
                    </TableCell>
                  )}
                  {visibleColumns.zipCode && (
                    <TableCell className="px-6 text-gray-600 dark:text-gray-300">{visitor.zipCode}</TableCell>
                  )}
                  {visibleColumns.sectors && (
                    <TableCell className="px-6 text-gray-600 dark:text-gray-300">{visitor.sectors?.join(", ")}</TableCell>
                  )}
                  {visibleColumns.howDidYouKnow && (
                    <TableCell className="px-6 text-gray-600 dark:text-gray-300">{visitor.howDidYouKnow}</TableCell>
                  )}
                  {visibleColumns.category && (
                    <TableCell className="px-6 text-gray-600 dark:text-gray-300">{visitor.category}</TableCell>
                  )}
                  {visibleColumns.registrationDate && (
                    <TableCell className="px-6 text-gray-600 dark:text-gray-300">
                      {new Date(visitor.registrationDate).toLocaleDateString("pt-BR")}
                    </TableCell>
                  )}
                  <TableCell className="px-6 text-center">
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Paginação ── */}
      <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1 || loading}
          onClick={() => setPage((p) => p - 1)}
        >
          Anterior
        </Button>
        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600" />
              Carregando...
            </>
          ) : (
            `Página ${page} de ${paginationMeta?.totalPages || 1}`
          )}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={(paginationMeta ? page >= paginationMeta.totalPages : false) || loading}
          onClick={() => setPage((p) => p + 1)}
        >
          Próxima
        </Button>
      </div>

    </div>
  );
};
