import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Visitor } from "@/interfaces/visitors";
import { Trash2 } from "lucide-react";
import { ConfirmDeleteModal } from "../ModalDelete";

export interface VisitorTableProps {
  filteredData: Visitor[];
  handleDelete: () => void;
  setIsOpen: (params: boolean) => void;
  isOpen: boolean;
  openDeleteModal: (id: string) => void;
}

export const VisitorTable: React.FC<VisitorTableProps> = ({
  filteredData,
  handleDelete,
  isOpen,
  setIsOpen,
  openDeleteModal,
}) => {
  return (
    <Table className=" h-[50vh] w-full max-h-[60rem] scrollable-content">
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
              className="text-white rounded-full w-full flex justify-center items-center px-4 py-2 uppercase  text-sm"
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
          <TableRow key={visitor.registrationCode}>
            <TableCell>{visitor.name}</TableCell>
            <TableCell>{visitor.company}</TableCell>
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
              <Trash2
                onClick={() => openDeleteModal(visitor.registrationCode)}
              />
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
    </Table>
  );
};
