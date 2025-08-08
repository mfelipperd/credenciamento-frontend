# 🚀 Payload Atualizado para Criar Receita

## ✅ Interface TypeScript Atualizada

```typescript
export interface CreateRevenueForm {
  fairId: string; // ✅ Obrigatório - ID da feira
  type: EntryModelType; // ✅ Obrigatório - "STAND" ou "PATROCINIO"
  entryModelId: string; // ✅ Obrigatório - ID do modelo de entrada
  clientId: string; // ✅ Obrigatório - ID do cliente
  baseValue: number; // ✅ Obrigatório - valor base em centavos
  discountCents: number; // ✅ Obrigatório - desconto em centavos
  contractValue: number; // ✅ Obrigatório - valor final em centavos
  paymentMethod: PaymentMethod; // ✅ Obrigatório - método de pagamento
  numberOfInstallments: number; // ✅ Obrigatório - número de parcelas (padrão: 1)
  createdBy: string; // ✅ Obrigatório - ID do usuário criador
  condition?: string; // ❌ Opcional - condições especiais
  notes?: string; // ❌ Opcional - observações
}
```

## 🎯 Enums Atualizados

### EntryModelType

```typescript
export type EntryModelType = "STAND" | "PATROCINIO";
```

### PaymentMethod

```typescript
export type PaymentMethod =
  | "PIX"
  | "BOLETO"
  | "CARTAO"
  | "TED"
  | "DINHEIRO"
  | "TRANSFERENCIA";
```

## 📊 Exemplo de Payload Completo

```json
{
  "fairId": "feira-uuid-123",
  "type": "STAND",
  "entryModelId": "modelo-uuid-456",
  "clientId": "cliente-uuid-789",
  "baseValue": 500000,
  "discountCents": 50000,
  "contractValue": 450000,
  "paymentMethod": "PIX",
  "numberOfInstallments": 3,
  "createdBy": "user-uuid-abc",
  "condition": "Desconto promocional",
  "notes": "Cliente VIP - Stand premium com localização privilegiada"
}
```

## 🔄 Mapeamento dos Campos

| Campo Frontend            | Campo Backend          | Tipo   | Status         | Descrição                  |
| ------------------------- | ---------------------- | ------ | -------------- | -------------------------- |
| `fairId`                  | `fairId`               | string | ✅ Obrigatório | ID da feira ativa          |
| `selectedEntryModel.type` | `type`                 | enum   | ✅ Obrigatório | Tipo extraído do modelo    |
| `entryModelId`            | `entryModelId`         | string | ✅ Obrigatório | ID do modelo selecionado   |
| `clientId`                | `clientId`             | string | ✅ Obrigatório | ID do cliente selecionado  |
| `baseValue`               | `baseValue`            | number | ✅ Obrigatório | Valor base em centavos     |
| `discountCents`           | `discountCents`        | number | ✅ Obrigatório | Desconto em centavos       |
| `contractValue`           | `contractValue`        | number | ✅ Obrigatório | Valor calculado final      |
| `paymentMethod`           | `paymentMethod`        | enum   | ✅ Obrigatório | Método selecionado no form |
| `installmentsCount`       | `numberOfInstallments` | number | ✅ Obrigatório | Convertido para número     |
| `user.id`                 | `createdBy`            | string | ✅ Obrigatório | ID do usuário logado       |
| `condition`               | `condition`            | string | ❌ Opcional    | Condições especiais        |
| `notes`                   | `notes`                | string | ❌ Opcional    | Observações do form        |

## 🎨 Componentes Atualizados

### 1. **Formulário de Criação (ReceitaDrawer)**

- ✅ Campo método de pagamento adicionado
- ✅ Validação Zod para paymentMethod
- ✅ Opções completas: PIX, Boleto, Cartão, TED, Dinheiro, Transferência
- ✅ Payload estruturado conforme especificação

### 2. **Modal de Detalhamento (RevenueDetailModal)**

- ✅ Opções de pagamento atualizadas
- ✅ Exibição correta dos métodos
- ✅ Suporte a TRANSFERENCIA adicionado

### 3. **Interfaces TypeScript**

- ✅ `CreateRevenueForm` alinhada com backend
- ✅ `PaymentMethod` enum atualizado
- ✅ Campos obrigatórios vs opcionais claramente definidos

## 🚀 Funcionalidades Implementadas

1. **Validação Completa**: Todos os campos obrigatórios validados
2. **Enum Safety**: Tipos seguros para métodos de pagamento
3. **FairId Dinâmico**: Obtido da URL da feira ativa
4. **Estrutura Limpa**: Payload simples sem configurações complexas
5. **Backward Compatible**: Mantém funcionalidades existentes

## ✨ Benefícios da Atualização

- 🎯 **Alinhamento Backend**: Payload exatamente como esperado
- 🔒 **Type Safety**: TypeScript previne erros de tipos
- 🚀 **Performance**: Estrutura simplificada e eficiente
- 📱 **UX Melhorada**: Campos obrigatórios claros no formulário
- 🔧 **Manutenibilidade**: Código limpo e bem documentado

O sistema está pronto para processar receitas com o novo formato de payload! 🎉
