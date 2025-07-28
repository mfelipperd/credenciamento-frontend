import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export interface Visitor {
  name: string;
  company: string;
  email: string;
  cnpj: string;
  phone: string;
}

export const EnhancedTableConsultant = () => {
  const { visitors, getVisitors } = useVisitorsService();
  const [searchParams, setSearchParams] = useSearchParams();
  const fairId = searchParams.get("fairId") ?? "";

  // Local UI state
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 0);
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("pageSize")) || 10
  );
  const [visibleColumns, setVisibleColumns] = useState<
    Record<keyof Visitor, boolean>
  >({
    name: true,
    company: true,
    email: true,
    cnpj: true,
    phone: true,
  });

  // Persist search & pagination to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("search", search);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    setSearchParams(params, { replace: true });
  }, [search, page, pageSize]);

  // Category filter from URL
  const categoryFilter = useMemo(() => {
    const param = searchParams.get("category");
    return param ? param.split(",") : [];
  }, [searchParams]);

  // Fetch data
  useEffect(() => {
    getVisitors(fairId);
  }, [fairId]);

  // Apply filters
  const filteredVisitors = useMemo(() => {
    return visitors
      .filter(
        (v) =>
          v.name.toLowerCase().includes(search.toLowerCase()) ||
          v.company.toLowerCase().includes(search.toLowerCase())
      )
      .filter((v) =>
        categoryFilter.length > 0 ? categoryFilter.includes(v.category) : true
      );
  }, [visitors, search, categoryFilter]);

  const pageCount = Math.ceil(filteredVisitors.length / pageSize) || 1;
  const pageData = useMemo(
    () => filteredVisitors.slice(page * pageSize, page * pageSize + pageSize),
    [filteredVisitors, page, pageSize]
  );

  // Category options
  const categories = ["visitante", "lojista", "representante comercial"];

  const hasActiveFilters = categoryFilter.length > 0;

  const toggleCategory = (cat: string, checked: boolean) => {
    const current = categoryFilter;
    const next = checked
      ? Array.from(new Set([...current, cat]))
      : current.filter((c) => c !== cat);
    const params = new URLSearchParams(searchParams);
    if (next.length) params.set("category", next.join(","));
    else params.delete("category");
    params.set("page", "0");
    setSearchParams(params);
    setPage(0);
  };

  return (
    <>
      <img
        src="/public/logo2.png"
        alt="Marca d'água"
        className="
    fixed
    top-1/2 left-1/2            /* centraliza */
    transform -translate-x-1/2 -translate-y-1/2
    opacity-5                   /* opacidade suave */
    pointer-events-none          /* cliques passam por ela */
    z-30                          /* atrás de todo o conteúdo */
    w-[50rem] h-auto                  /* ajuste de tamanho */
  "
      />
      <Card className=" relative bg-neutral-100  ">
        <CardContent>
          {/* Toolbar: Search, PageSize, Columns, Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Input
              placeholder="Buscar por nome ou empresa"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="max-w-sm"
            />
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[100px] h-9 bg-white">
                <SelectValue placeholder="Qtd" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}/pág
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white">
                  Colunas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40">
                {Object.entries(visibleColumns).map(([col, isVisible]) => (
                  <DropdownMenuCheckboxItem
                    key={col}
                    checked={isVisible}
                    onCheckedChange={(checked) =>
                      setVisibleColumns((prev) => ({ ...prev, [col]: checked }))
                    }
                  >
                    {col}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Side sheet for advanced filters */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={hasActiveFilters ? "bg-purple-600 text-white" : ""}
                >
                  <SlidersHorizontal />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-64 min-w-[25rem] bg-white p-4 z-50"
              >
                <SheetHeader className="mt-[140px]">
                  <SheetTitle>Filtros Avançados</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <h4 className="font-medium mb-2">Categoria</h4>
                    <div className="space-y-1 grid grid-cols-3 gap-2">
                      {categories.map((cat) => (
                        <Label>
                          <Checkbox
                            key={cat}
                            checked={categoryFilter.includes(cat)}
                            onCheckedChange={(checked) =>
                              toggleCategory(cat, checked as boolean)
                            }
                          ></Checkbox>
                          {cat}
                        </Label>
                      ))}
                    </div>
                  </div>
                  {/* Adicione outros filtros aqui */}
                </div>
                <SheetClose asChild>
                  <Button className="mt-6 w-full">Fechar</Button>
                </SheetClose>
              </SheetContent>
            </Sheet>
            <div>
              <p>
                {" "}
                <span className="font-bold">Total de Inscritos:</span>{" "}
                {visitors.length}
              </p>
            </div>
            <HoverCard>
              <HoverCardTrigger>
                <Button disabled variant="outline" size="sm">
                  Exportar PDF
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="bg-white w-fit px-2 h-fit">
                Em breve
              </HoverCardContent>
            </HoverCard>
            <HoverCard>
              <HoverCardTrigger>
                <Button disabled variant="outline" size="sm">
                  Exportar CSV
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="bg-white w-fit px-2 h-fit">
                Em breve
              </HoverCardContent>
            </HoverCard>
          </div>

          {/* Table */}
          <Table className="">
            <TableHeader className="sticky top-0 ">
              <TableRow>
                {visibleColumns.name && <TableHead>Nome</TableHead>}
                {visibleColumns.company && <TableHead>Empresa</TableHead>}
                {visibleColumns.email && <TableHead>Email</TableHead>}
                {visibleColumns.cnpj && (
                  <TableHead align="center">CNPJ</TableHead>
                )}
                {visibleColumns.phone && (
                  <TableHead align="center">Telefone</TableHead>
                )}

                <TableHead align="center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.map((visitor) => (
                <TableRow key={visitor.id} className="hover:bg-purple-50">
                  {visibleColumns.name && <TableCell>{visitor.name}</TableCell>}
                  {visibleColumns.company && (
                    <TableCell>{visitor.company}</TableCell>
                  )}
                  {visibleColumns.email && (
                    <TableCell>{visitor.email}</TableCell>
                  )}
                  {visibleColumns.cnpj && (
                    <TableCell align="center">
                      {visitor.category === "visitante"
                        ? "Visistante"
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

                  <TableCell align="center">
                    <Button variant="link">
                      <MoreHorizontal />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </Button>
            <span>
              Página {page + 1} de {pageCount}
            </span>
            <Button
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
