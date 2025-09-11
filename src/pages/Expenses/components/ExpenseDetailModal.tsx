import {
  X,
  Calendar,
  DollarSign,
  Tag,
  Building,
  FileText,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Expense } from "@/interfaces/finance";

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onEdit: (expense: Expense) => void;
}

export function ExpenseDetailModal({
  isOpen,
  onClose,
  expense,
  onEdit,
}: ExpenseDetailModalProps) {
  if (!expense) return null;

  const formatCurrency = (value: number) => {
    // O valor vem em centavos do backend, então dividimos por 100
    const valueInReais = value / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valueInReais);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const getAccountTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CORRENTE: "Conta Corrente",
      POUPANCA: "Conta Poupança",
      OUTRO: "Outro",
      corrente: "Conta Corrente", // Para compatibilidade com lowercase
      poupanca: "Conta Poupança",
      outro: "Outro",
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Detalhes da Despesa
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(expense)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Principais */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5" />
                  Valor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(expense.valor)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5" />
                  Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatDate(expense.data)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Tag className="w-5 h-5" />
                  Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {expense.category?.name || "N/A"}
                </Badge>
                {expense.category?.global && (
                  <p className="text-sm text-gray-500 mt-1">Categoria Global</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Descrição e Observações */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {expense.descricao && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Descrição
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 break-words">
                    {expense.descricao}
                  </p>
                </CardContent>
              </Card>
            )}

            {expense.observacoes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Observações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 break-words">
                    {expense.observacoes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Informações da Conta Bancária */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Conta Bancária
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nome da Conta
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white break-words">
                    {expense.account?.nomeConta || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Banco
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white break-words">
                    {expense.account?.banco || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tipo
                  </p>
                  <Badge variant="secondary">
                    {expense.account?.tipo
                      ? getAccountTypeLabel(expense.account.tipo)
                      : "N/A"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações da Feira */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Informações da Feira
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nome da Feira
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white break-words">
                    {expense.fair?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ID da Feira
                  </p>
                  <p className="font-mono text-sm text-gray-500 dark:text-gray-400 break-all">
                    {expense.fairId}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações da Categoria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Detalhes da Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nome
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {expense.category?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Escopo
                  </p>
                  <Badge
                    variant={expense.category?.global ? "default" : "outline"}
                  >
                    {expense.category?.global
                      ? "Global"
                      : "Específica da Feira"}
                  </Badge>
                </div>
                {expense.category?.parent && (
                  <div className="lg:col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Categoria Pai
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white break-words">
                      {expense.category.parent.name}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Informações de IDs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Identificadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ID da Despesa
                  </p>
                  <p className="font-mono text-sm text-gray-500 dark:text-gray-400 break-all">
                    {expense.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ID da Categoria
                  </p>
                  <p className="font-mono text-sm text-gray-500 dark:text-gray-400 break-all">
                    {expense.categoryId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ID da Conta
                  </p>
                  <p className="font-mono text-sm text-gray-500 dark:text-gray-400 break-all">
                    {expense.accountId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ID da Feira
                  </p>
                  <p className="font-mono text-sm text-gray-500 dark:text-gray-400 break-all">
                    {expense.fairId}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Informações de Auditoria */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>Criado em:</strong> {formatDateTime(expense.createdAt)}
            </p>
            <p>
              <strong>Última atualização:</strong>{" "}
              {formatDateTime(expense.updatedAt)}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
