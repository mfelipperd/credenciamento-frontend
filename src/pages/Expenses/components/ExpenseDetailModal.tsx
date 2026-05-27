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
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto bg-slate-950 border border-white/10 text-white p-0 rounded-2xl shadow-2xl">
        <DialogHeader className="relative h-24 w-full flex items-end p-6 bg-linear-to-br from-[#00aacd] to-[#EB2970] overflow-hidden rounded-t-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-white tracking-tight">
                  Detalhes da Despesa
                </DialogTitle>
                <p className="text-xs text-white/50">
                  ID: {expense.id.slice(0, 8)}...
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(expense)}
                className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl font-bold h-8 text-xs px-3"
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 bg-slate-950 text-white">
          {/* Resumo Principal */}
          <div className="bg-white/3 rounded-xl p-6 border border-white/5 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-white mb-2">
                  {expense.descricao || "Despesa sem descrição"}
                </h3>
                <div className="flex items-center gap-4 text-xs text-white/50">
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
              <div className="text-center md:text-right">
                <p className="text-xs text-white/40 mb-1 uppercase tracking-wider font-bold">Valor Total</p>
                <p className="text-2xl font-black text-red-400">
                  {formatCurrency(expense.valor)}
                </p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-xs text-white/40 mb-1 uppercase tracking-wider font-bold">Categoria</p>
                <Badge className={`text-xs font-bold ${getCategoryColor(expense.category?.name || "")}`}>
                  {expense.category?.name || "N/A"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Informações Detalhadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna Esquerda */}
            <div className="space-y-6">
              {/* Informações da Categoria */}
              <Card className="glass-card border border-white/5 rounded-xl bg-white/3 border-l-4 border-l-blue-500 hover:scale-100 hover:bg-white/3">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-white font-bold">
                    <Tag className="w-5 h-5 text-blue-400" />
                    Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Nome</p>
                    <p className="font-semibold text-white">
                      {expense.category?.name || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Escopo:</p>
                    <Badge variant={expense.category?.global ? "default" : "outline"} className="text-xs">
                      {expense.category?.global ? "Global" : "Específica da Feira"}
                    </Badge>
                  </div>
                  {expense.category?.parent && (
                    <div>
                      <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Categoria Pai</p>
                      <p className="font-semibold text-white">
                        {expense.category.parent.name}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informações da Conta Bancária */}
              <Card className="glass-card border border-white/5 rounded-xl bg-white/3 border-l-4 border-l-green-500 hover:scale-100 hover:bg-white/3">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-white font-bold">
                    <Building className="w-5 h-5 text-green-400" />
                    Conta Bancária
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Nome da Conta</p>
                    <p className="font-semibold text-white wrap-break-word">
                      {expense.account?.nomeConta || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Banco</p>
                    <p className="font-semibold text-white wrap-break-word">
                      {expense.account?.banco || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Tipo</p>
                    <Badge variant="secondary" className="text-xs">
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
              <Card className="glass-card border border-white/5 rounded-xl bg-white/3 border-l-4 border-l-purple-500 hover:scale-100 hover:bg-white/3">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-white font-bold">
                    <Building className="w-5 h-5 text-purple-400" />
                    Feira
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Nome da Feira</p>
                    <p className="font-semibold text-white wrap-break-word">
                      {expense.fair?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-wider">ID da Feira</p>
                    <p className="font-mono text-xs text-white/40 break-all">
                      {expense.fairId}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Descrição e Observações */}
              {(expense.descricao || expense.observacoes) && (
                <Card className="glass-card border border-white/5 rounded-xl bg-white/3 border-l-4 border-l-orange-500 hover:scale-100 hover:bg-white/3">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-white font-bold">
                      <FileText className="w-5 h-5 text-orange-400" />
                      Detalhes Adicionais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    {expense.descricao && (
                      <div>
                        <p className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1">Descrição</p>
                        <p className="text-white/80 wrap-break-word">
                          {expense.descricao}
                        </p>
                      </div>
                    )}
                    {expense.observacoes && (
                      <div>
                        <p className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1">Observações</p>
                        <p className="text-white/80 wrap-break-word">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações de Auditoria */}
            <Card className="glass-card border border-white/5 rounded-xl bg-white/3 border-l-4 border-l-gray-500 hover:scale-100 hover:bg-white/3">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-white font-bold">
                  <FileText className="w-5 h-5 text-white/60" />
                  Auditoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Criado em</p>
                  <p className="font-semibold text-white/80">
                    {formatDateTime(expense.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Última atualização</p>
                  <p className="font-semibold text-white/80">
                    {formatDateTime(expense.updatedAt)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Identificadores */}
            <Card className="glass-card border border-white/5 rounded-xl bg-white/3 border-l-4 border-l-indigo-500 hover:scale-100 hover:bg-white/3">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-white font-bold">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  Identificadores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs font-mono text-white/40">
                <div>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-wider font-sans mb-1">ID da Despesa</p>
                  <p className="break-all">{expense.id}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-wider font-sans mb-1">ID da Categoria</p>
                  <p className="break-all">{expense.categoryId}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-wider font-sans mb-1">ID da Conta</p>
                  <p className="break-all">{expense.accountId}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
