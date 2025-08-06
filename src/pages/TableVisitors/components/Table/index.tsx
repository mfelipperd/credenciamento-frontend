import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Visitor } from "@/interfaces/visitors";
import { PencilLine, Trash2 } from "lucide-react";
import { ConfirmDeleteModal } from "../ModalDelete";
import { EditVisitorModal } from "../ModalEdit";
import { useState, memo, useCallback } from "react";

export interface VisitorTableProps {
  filteredData: Visitor[];
  error?: string | null;
  handleDelete: () => void;
  setIsOpen: (params: boolean) => void;
  isOpen: boolean;
  openDeleteModal: (id: string) => void;
  handleClick: (checkinId: string) => void;
  reload?: () => void;
}

// Componente otimizado para linha da tabela
const VisitorRow = memo(
  ({
    visitor,
    onRowClick,
    onEditClick,
    onDeleteClick,
  }: {
    visitor: Visitor;
    onRowClick: (checkinId: string) => void;
    onEditClick: (visitor: Visitor) => void;
    onDeleteClick: (id: string) => void;
  }) => {
    const handleRowClick = useCallback(() => {
      onRowClick(visitor.registrationCode);
    }, [onRowClick, visitor.registrationCode]);

    const handleEditClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onEditClick(visitor);
      },
      [onEditClick, visitor]
    );

    const handleDeleteClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onDeleteClick(visitor.registrationCode);
      },
      [onDeleteClick, visitor.registrationCode]
    );

    return (
      <TableRow
        onClick={handleRowClick}
        className="cursor-pointer hover:bg-gray-50 transition-colors group"
      >
        <TableCell className="truncate text-nowrap max-w-[15rem]">
          {visitor.name}
        </TableCell>
        <TableCell className="truncate text-nowrap max-w-[15rem]">
          {visitor.company}
        </TableCell>
        <TableCell className="truncate max-w-[20rem]">
          {visitor.email}
        </TableCell>
        <TableCell className="text-center">{visitor.cnpj}</TableCell>
        <TableCell className="text-center">{visitor.phone}</TableCell>
        <TableCell className="text-center">
          {new Date(visitor.registrationDate).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </TableCell>
        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Botão Editar */}
            <button
              onClick={handleEditClick}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors min-w-[2rem] shadow-sm"
              title="Editar visitante"
            >
              <PencilLine size={12} />
              <span className="hidden md:inline">Editar</span>
            </button>

            {/* Botão Deletar */}
            <button
              onClick={handleDeleteClick}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors min-w-[2rem] shadow-sm"
              title="Deletar visitante"
            >
              <Trash2 size={12} />
              <span className="hidden md:inline">Deletar</span>
            </button>
          </div>
        </TableCell>
      </TableRow>
    );
  }
);

VisitorRow.displayName = "VisitorRow";

export const VisitorTable: React.FC<VisitorTableProps> = memo(
  ({
    filteredData,
    error,
    handleDelete,
    isOpen,
    setIsOpen,
    openDeleteModal,
    handleClick,
    reload,
  }) => {
    const [openEditModal, setOpenEditModal] = useState<boolean>(false);
    const [visitorEdit, setVisitorEdit] = useState<Visitor | undefined>(
      undefined
    );

    const handleEdit = useCallback((visitor?: Visitor) => {
      if (visitor) {
        setVisitorEdit(visitor);
      }
      setOpenEditModal((prev) => !prev);
    }, []);

    const handleRowClick = useCallback(
      (checkinId: string) => {
        handleClick(checkinId);
      },
      [handleClick]
    );

    const handleEditClick = useCallback(
      (visitor: Visitor) => {
        handleEdit(visitor);
      },
      [handleEdit]
    );

    const handleDeleteClick = useCallback(
      (id: string) => {
        openDeleteModal(id);
      },
      [openDeleteModal]
    );

    return (
      <>
        <div className="overflow-auto max-h-[50vh]">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white">
              <TableRow className="border-none">
                <TableHead>
                  <div
                    className="text-white rounded-full w-full flex justify-center items-center px-3 py-2 text-xs font-semibold"
                    style={{ background: "#7764A5" }}
                  >
                    NOME
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="text-white rounded-full w-full flex justify-center items-center px-3 py-2 text-xs font-semibold"
                    style={{ background: "#7764A5" }}
                  >
                    EMPRESA
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="text-white rounded-full w-full flex justify-center items-center px-3 py-2 text-xs font-semibold"
                    style={{ background: "#7764A5" }}
                  >
                    EMAIL
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="text-white rounded-full w-full flex justify-center items-center px-3 py-2 text-xs font-semibold"
                    style={{ background: "#7764A5" }}
                  >
                    CNPJ
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="text-white rounded-full w-full flex justify-center items-center px-3 py-2 text-xs font-semibold"
                    style={{ background: "#7764A5" }}
                  >
                    TELEFONE
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="text-white rounded-full w-full flex justify-center items-center px-3 py-2 text-xs font-semibold"
                    style={{ background: "#7764A5" }}
                  >
                    DATA
                  </div>
                </TableHead>
                <TableHead className="w-32">
                  <div
                    className="text-white rounded-full w-full flex justify-center items-center px-3 py-2 text-xs font-semibold"
                    style={{ background: "#7764A5" }}
                  >
                    AÇÕES
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-red-500 font-medium">
                        ⚠️ Erro ao carregar dados
                      </div>
                      <div className="text-sm text-gray-600">{error}</div>
                      <button
                        onClick={() => (window.location.href = "/login")}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Fazer Login
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-gray-500">
                        Nenhum visitante encontrado
                      </div>
                      <div className="text-xs text-gray-400">
                        Verifique se você está logado e se há visitantes
                        cadastrados para esta feira
                      </div>
                      <div className="text-xs text-gray-400">
                        Total de dados recebidos: {filteredData.length}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((visitor) => (
                  <VisitorRow
                    key={visitor.registrationCode}
                    visitor={visitor}
                    onRowClick={handleRowClick}
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteClick}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <ConfirmDeleteModal
          isOpen={isOpen}
          onCancel={() => setIsOpen(false)}
          onConfirm={handleDelete}
          title="Tem certeza que deseja deletar esse visitante?"
        />

        {visitorEdit && (
          <EditVisitorModal
            open={openEditModal}
            onOpenChange={handleEdit}
            visitor={visitorEdit}
            reload={reload}
          />
        )}
      </>
    );
  }
);

VisitorTable.displayName = "VisitorTable";
