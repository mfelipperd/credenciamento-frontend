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

export interface VisitorTableProps {
  filteredData: Visitor[];
  handleDelete: (id: string) => void;
}

export const VisitorTable: React.FC<VisitorTableProps> = ({
  filteredData,
  handleDelete,
}) => {
  return (
    <Table className=" h-[50vh] w-full max-h-[60rem] scrollable-content">
      <TableHeader className="sticky top-0 z-40 bg-gray-100">
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>CNPJ</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>Data de Registro</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.map((visitor) => (
          <TableRow key={visitor.registrationCode}>
            <TableCell>{visitor.name}</TableCell>
            <TableCell>{visitor.company}</TableCell>
            <TableCell>{visitor.email}</TableCell>
            <TableCell>{visitor.cnpj}</TableCell>
            <TableCell>{visitor.phone}</TableCell>

            <TableCell>
              {new Date(visitor.registrationDate).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </TableCell>
            <TableCell>
              <Trash2 onClick={() => handleDelete(visitor.registrationCode)} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
