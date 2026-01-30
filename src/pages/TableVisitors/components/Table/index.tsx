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
        className="cursor-pointer hover:bg-white/5 transition-all group border-b border-white/5"
      >
        <TableCell className="truncate text-nowrap max-w-60 text-white font-bold uppercase tracking-tight text-sm">
          {visitor.name}
        </TableCell>
        <TableCell className="truncate text-nowrap max-w-60 text-white/50 font-medium text-xs uppercase tracking-wider">
          {visitor.company}
        </TableCell>
        <TableCell className="truncate max-w-[20rem] text-brand-cyan/70 font-black text-[10px] uppercase">
          {visitor.email}
        </TableCell>
        <TableCell className="text-center text-white/40 font-bold text-[10px]">
          {visitor.cnpj}
        </TableCell>
        <TableCell className="text-center text-white/40 font-bold text-[10px]">
          {visitor.phone}
        </TableCell>
        <TableCell className="text-center text-white/30 font-black text-[9px] uppercase tracking-widest">
          {new Date(visitor.registrationDate).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </TableCell>
        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
            {/* Botão Editar */}
            <button
              onClick={handleEditClick}
              className="p-2 bg-brand-cyan/10 text-brand-cyan rounded-xl hover:bg-brand-cyan hover:text-white transition-all shadow-lg active:scale-90"
              title="Editar visitante"
            >
              <PencilLine size={16} />
            </button>

            {/* Botão Deletar */}
            <button
              onClick={handleDeleteClick}
              className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90"
              title="Deletar visitante"
            >
              <Trash2 size={16} />
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
        <div className="overflow-auto max-h-[60vh] custom-scrollbar">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableHead>
                  <div className="text-brand-pink font-black text-[10px] uppercase tracking-[0.2em] py-4">NOME</div>
                </TableHead>
                <TableHead>
                  <div className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em] py-4">EMPRESA</div>
                </TableHead>
                <TableHead>
                  <div className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em] py-4">EMAIL</div>
                </TableHead>
                <TableHead>
                  <div className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em] py-4 text-center">CNPJ</div>
                </TableHead>
                <TableHead>
                  <div className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em] py-4 text-center">TELEFONE</div>
                </TableHead>
                <TableHead>
                  <div className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em] py-4 text-center">DATA</div>
                </TableHead>
                <TableHead className="w-40 text-center">
                  <div className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em] py-4">AÇÕES</div>
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
