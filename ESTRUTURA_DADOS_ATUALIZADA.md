# 🎯 Interfaces TypeScript Atualizadas - Sistema de Receitas

## ✅ Estrutura Atualizada Conforme Backend

### 📊 Interface Principal - RevenueListItem

```typescript
export interface RevenueListItem {
  // Informações principais da receita
  id: string;
  fairId: string;
  type: EntryModelType; // "STAND" | "PATROCINIO"
  entryModelId: string;
  clientId: string;

  // Valores monetários (em centavos)
  baseValue: number; // R$ 5.000,00 = 500000
  discountCents: number; // R$ 500,00 = 50000
  contractValue: number; // R$ 4.500,00 = 450000

  // Configurações de pagamento
  paymentMethod: PaymentMethod;
  numberOfInstallments: number;

  // Status e informações adicionais
  status: RevenueStatus;
  condition?: string; // condições especiais (opcional)
  notes?: string; // observações gerais (opcional)
  createdBy: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relacionamentos (opcionais - dependem do include)
  client?: Client;
  entryModel?: EntryModel;
  installments?: Installment[];
}
```

### 💰 Sistema de Parcelas Atualizado

```typescript
export interface Installment {
  id: string;
  revenueId: string;
  n: number; // Número da parcela
  valueCents: number; // Valor em centavos
  dueDate: string;
  paidAt?: string | null; // Data de pagamento (se paga)
  status: InstallmentStatus; // "A_VENCER" | "VENCIDA" | "PAGA" | "CANCELADA"
  proofUrl?: string | null; // URL do comprovante (se houver)
  createdAt: string;
  updatedAt: string;
}
```

### 👥 Cliente e Modelo de Entrada

```typescript
export interface Client {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
}

export interface EntryModel {
  id: string;
  fairId?: string;
  type: EntryModelType;
  name: string;
  baseValue: number; // Agora obrigatório
  costCents?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

## 🔄 Exemplo Completo de Resposta do Backend

```json
[
  {
    "id": "revenue-uuid-123",
    "fairId": "feira-uuid-456",
    "type": "STAND",
    "entryModelId": "model-uuid-789",
    "clientId": "client-uuid-abc",

    "baseValue": 500000,
    "discountCents": 50000,
    "contractValue": 450000,

    "paymentMethod": "PIX",
    "numberOfInstallments": 3,

    "status": "EM_ANDAMENTO",
    "condition": "Desconto promocional",
    "notes": "Cliente VIP - Stand premium",
    "createdBy": "user-uuid-def",

    "createdAt": "2025-08-08T10:30:00.000Z",
    "updatedAt": "2025-08-08T10:30:00.000Z",

    "client": {
      "id": "client-uuid-abc",
      "name": "Empresa Teste Ltda",
      "email": "contato@empresa.com",
      "cnpj": "12.345.678/0001-90"
    },

    "entryModel": {
      "id": "model-uuid-789",
      "name": "Stand Premium 3x3",
      "type": "STAND"
    },

    "installments": [
      {
        "id": "inst-1",
        "revenueId": "revenue-uuid-123",
        "n": 1,
        "valueCents": 150000,
        "dueDate": "2025-09-08T00:00:00.000Z",
        "paidAt": "2025-08-07T14:30:00.000Z",
        "status": "PAGA",
        "proofUrl": "https://storage.com/comprovante1.pdf",
        "createdAt": "2025-08-08T10:30:00.000Z",
        "updatedAt": "2025-08-07T14:30:00.000Z"
      },
      {
        "id": "inst-2",
        "revenueId": "revenue-uuid-123",
        "n": 2,
        "valueCents": 150000,
        "dueDate": "2025-10-08T00:00:00.000Z",
        "paidAt": null,
        "status": "A_VENCER",
        "proofUrl": null,
        "createdAt": "2025-08-08T10:30:00.000Z",
        "updatedAt": "2025-08-08T10:30:00.000Z"
      },
      {
        "id": "inst-3",
        "revenueId": "revenue-uuid-123",
        "n": 3,
        "valueCents": 150000,
        "dueDate": "2025-11-08T00:00:00.000Z",
        "paidAt": null,
        "status": "A_VENCER",
        "proofUrl": null,
        "createdAt": "2025-08-08T10:30:00.000Z",
        "updatedAt": "2025-08-08T10:30:00.000Z"
      }
    ]
  }
]
```

## 🛠️ Componentes Atualizados

### 1. **FinanceTable.tsx**

- ✅ Campos opcionais tratados com fallbacks
- ✅ `nextDueDate` calculado dinamicamente das parcelas
- ✅ Suporte a relacionamentos opcionais

### 2. **RevenueDetailModal.tsx**

- ✅ Mock atualizado com nova estrutura
- ✅ Dados completos incluindo timestamps
- ✅ Sistema de parcelas atualizado

### 3. **Interfaces TypeScript**

- ✅ `RevenueListItem` alinhada com backend
- ✅ `Installment` com todos os campos do backend
- ✅ Relacionamentos opcionais configurados

## 🎯 Benefícios da Atualização

1. **Compatibilidade Total**: Interfaces 100% alinhadas com backend
2. **Type Safety**: TypeScript previne erros de tipos
3. **Flexibilidade**: Relacionamentos opcionais suportados
4. **Performance**: Estrutura otimizada para queries com includes
5. **Manutenibilidade**: Código limpo e bem tipado

## 🚀 Status de Implementação

- ✅ Interfaces TypeScript atualizadas
- ✅ Componentes adaptados para nova estrutura
- ✅ Mock de dados atualizado
- ✅ Build compilando sem erros
- ✅ Fallbacks para campos opcionais
- ✅ Cálculo dinâmico de próxima data de vencimento

O sistema está 100% preparado para receber os dados no formato especificado pelo backend! 🎉
