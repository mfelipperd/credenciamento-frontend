import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Visitor } from "@/interfaces/visitors";
import { MoreHorizontal, PencilLine, Trash2 } from "lucide-react";
import { ConfirmDeleteModal } from "../ModalDelete";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EditVisitorModal } from "../ModalEdit";
import { useState } from "react";

export interface VisitorTableProps {
  filteredData: Visitor[];
  handleDelete: () => void;
  setIsOpen: (params: boolean) => void;
  isOpen: boolean;
  openDeleteModal: (id: string) => void;
  handleClick: (checkinId: string) => void;
  reload?: () => void;
}

export const VisitorTable: React.FC<VisitorTableProps> = ({
  filteredData,
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

  const handleEdit = (visitor?: Visitor) => {
    if (visitor) {
      setVisitorEdit(visitor);
    }
    setOpenEditModal((prev) => !prev);
  };
  return (
    <Table className=" h-[50vh]max-h-[60rem] scrollable-content">
      <TableHeader className="sticky top-0 z-40 bg-gray-100">
        <TableRow className="border-none">
          <TableHead>
            {" "}
            <div
              className="text-white rounded-full w-full flex justify-center items-center px-4 py-2 uppercase  text-sm"
              style={{ background: "#7764A5" }}
            >
              Nome
            </div>
          </TableHead>
          <TableHead>
            {" "}
            <div
              className="text-white rounded-full w-[80%] flex justify-center items-center px-4 py-2 uppercase  text-sm"
              style={{ background: "#7764A5" }}
            >
              Empresa
            </div>
          </TableHead>
          <TableHead>
            <div
              className="text-white rounded-full w-full flex justify-center items-center px-4 py-2 uppercase  text-sm"
              style={{ background: "#7764A5" }}
            >
              Email
            </div>
          </TableHead>
          <TableHead align="center">
            <div
              className="text-white rounded-full w-full flex justify-center items-center px-4 py-2 uppercase  text-sm"
              style={{ background: "#7764A5" }}
            >
              CNPJ
            </div>
          </TableHead>
          <TableHead>
            <div
              className="text-white rounded-full w-full flex justify-center items-center px-4 py-2 uppercase  text-sm"
              style={{ background: "#7764A5" }}
            >
              Telefone
            </div>
          </TableHead>
          <TableHead>
            <div
              className="text-white rounded-full w-full flex justify-center items-center px-4 py-2 uppercase  text-sm"
              style={{ background: "#7764A5" }}
            >
              Data de Registro
            </div>
          </TableHead>
          <TableHead>
            <div
              className="text-white rounded-full w-full flex justify-center items-center px-4 py-2 uppercase  text-sm"
              style={{ background: "#7764A5" }}
            >
              Ações
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.map((visitor) => (
          <TableRow
            key={visitor.registrationCode}
            onClick={() => handleClick(visitor.registrationCode)}
            className="cursor-pointer hover:bg-purple-100 transition-colors"
          >
            <TableCell className="truncate text-nowrap max-w-[15rem] w">
              {visitor.name}
            </TableCell>
            <TableCell className="truncate text-nowrap max-w-[15rem] w">
              {visitor.company}
            </TableCell>
            <TableCell>{visitor.email}</TableCell>
            <TableCell align="center">{visitor.cnpj}</TableCell>
            <TableCell align="center">{visitor.phone}</TableCell>

            <TableCell align="center">
              {new Date(visitor.registrationDate).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </TableCell>
            <TableCell align="center">
              <Popover>
                <PopoverTrigger onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center items-center gap-2">
                    <MoreHorizontal className="cursor-pointer" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="bg-white p-4 shadow-lg rounded-lg max-w-[20rem]">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (handleEdit) {
                          handleEdit(visitor);
                        }
                      }}
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <PencilLine size={13} />
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(visitor.registrationCode);
                      }}
                      className="text-red-600 hover:underline flex items-center gap-2"
                    >
                      <Trash2 size={13} />
                      Deletar
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
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
    </Table>
  );
};
