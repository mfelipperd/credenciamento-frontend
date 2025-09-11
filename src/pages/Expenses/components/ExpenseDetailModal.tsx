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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Expense } from "@/interfaces/finance";
import { getCategoryColor } from "@/utils/categoryColors";

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
      <DialogContent className="max-w-7xl w-[98vw] max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Detalhes da Despesa
                </DialogTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {expense.id.slice(0, 8)}...
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(expense)}
                className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* Resumo Principal */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 rounded-xl p-6 border border-red-200 dark:border-red-800">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {expense.descricao || "Despesa sem descrição"}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(expense.data)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {expense.category?.name || "N/A"}
                  </div>
                </div>
              </div>
              <div className="text-center lg:text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Valor Total</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(expense.valor)}
                </p>
              </div>
              <div className="text-center lg:text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Categoria</p>
                <Badge className={`text-sm ${getCategoryColor(expense.category?.name || "")}`}>
                  {expense.category?.name || "N/A"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Informações Detalhadas */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Coluna Esquerda */}
            <div className="space-y-6">
              {/* Informações da Categoria */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Tag className="w-5 h-5 text-blue-600" />
                    Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Nome</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {expense.category?.name || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Escopo:</p>
                    <Badge variant={expense.category?.global ? "default" : "outline"}>
                      {expense.category?.global ? "Global" : "Específica da Feira"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Categoria:</p>
                    <Badge className={getCategoryColor(expense.category?.name || "")}>
                      {expense.category?.name || "N/A"}
                    </Badge>
                  </div>
                  {expense.category?.parent && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Categoria Pai</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {expense.category.parent.name}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informações da Conta Bancária */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building className="w-5 h-5 text-green-600" />
                    Conta Bancária
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Nome da Conta</p>
                    <p className="font-medium text-gray-900 dark:text-white break-words">
                      {expense.account?.nomeConta || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Banco</p>
                    <p className="font-medium text-gray-900 dark:text-white break-words">
                      {expense.account?.banco || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tipo</p>
                    <Badge variant="secondary">
                      {expense.account?.tipo
                        ? getAccountTypeLabel(expense.account.tipo)
                        : "N/A"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-6">
              {/* Informações da Feira */}
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building className="w-5 h-5 text-purple-600" />
                    Feira
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Nome da Feira</p>
                    <p className="font-medium text-gray-900 dark:text-white break-words">
                      {expense.fair?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">ID da Feira</p>
                    <p className="font-mono text-sm text-gray-500 dark:text-gray-400 break-all">
                      {expense.fairId}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Descrição e Observações */}
              {(expense.descricao || expense.observacoes) && (
                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="w-5 h-5 text-orange-600" />
                      Detalhes Adicionais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {expense.descricao && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Descrição</p>
                        <p className="text-gray-700 dark:text-gray-300 break-words">
                          {expense.descricao}
                        </p>
                      </div>
                    )}
                    {expense.observacoes && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Observações</p>
                        <p className="text-gray-700 dark:text-gray-300 break-words">
                          {expense.observacoes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Informações de Auditoria e IDs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações de Auditoria */}
            <Card className="border-l-4 border-l-gray-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-gray-600" />
                  Auditoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Criado em</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDateTime(expense.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Última atualização</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDateTime(expense.updatedAt)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Identificadores */}
            <Card className="border-l-4 border-l-indigo-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Identificadores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ID da Despesa</p>
                  <p className="font-mono text-sm text-gray-500 dark:text-gray-400 break-all">
                    {expense.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ID da Categoria</p>
                  <p className="font-mono text-sm text-gray-500 dark:text-gray-400 break-all">
                    {expense.categoryId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ID da Conta</p>
                  <p className="font-mono text-sm text-gray-500 dark:text-gray-400 break-all">
                    {expense.accountId}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
