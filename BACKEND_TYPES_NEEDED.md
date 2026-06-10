# Tipos do Backend Necessários

Os seguintes items precisam de confirmação da API do backend para tipagem correta:

## 1. AllocatedOverheadExpense — Template de criação

**Arquivo:** `src/pages/Fairs/FairDetail/page.tsx` (~linha 480)
**Problema:** `setEditingOverhead` é tipado como `AllocatedOverheadExpense | null`, mas ao criar uma nova despesa overhead, passamos um objeto template `{ isInitialTemplate: true, allocations: [...], data: "..." }` que não corresponde à interface.
**Solução atual:** O estado aceita uma union com o tipo template inline: `AllocatedOverheadExpense | { isInitialTemplate: true; allocations: { fairId: string; percentual: number }[]; data: string } | null`.
**Pergunta:** Qual é o tipo correto para o estado de edição do formulário de overhead? Deve ser `OverheadExpense`, `Partial<AllocatedOverheadExpense>`, ou uma interface separada?

## 2. User Create/Update Input

**Arquivo:** `src/hooks/useUsers.ts`
**Problema:** `ICreateUserInput` em `interfaces/user.ts` só define `name, email, password, role`. O formulário de usuário também envia `cpf, phone, isActive, fairIds`.
**Solução atual:** Interface `CreateUserInput` duplicada localmente em `useUsers.ts` com os campos extras.
**Pergunta:** Confirmar os campos aceitos pelo endpoint `POST /users` e `PATCH /users/:id` e atualizar `ICreateUserInput` em `interfaces/user.ts` para refletir a API real.

RESPONS FRONTEND: # Tipagem Frontend — Respostas da API

## 1. Overhead — Estado do formulário de edição

### Problema

O estado `editingOverhead` precisa representar tanto uma edição (registro existente) quanto a criação (template inicial).

### Resposta

Use **duas interfaces distintas** baseadas nos DTOs reais:

```ts
// Tipo de criação (POST /finance/overhead)
interface CreateOverheadInput {
  categoryId: string; // obrigatório — UUID de finance_category global
  accountId?: string; // opcional — UUID
  descricao?: string;
  valor: number; // obrigatório — mínimo 0.01
  data: string; // obrigatório — ISO date string "YYYY-MM-DD"
  observacoes?: string;
  fairs: Array<{
    fairId: string; // obrigatório
    percentual?: number; // 0.0001–1.0000; omitir em todos = divisão igualitária
  }>;
}

// Tipo de atualização (PATCH /finance/overhead/:id)
type UpdateOverheadInput = Partial<CreateOverheadInput>;

// Tipo de resposta da listagem (GET /finance/overhead?fairId=)
interface AllocatedOverheadItem {
  id: string;
  category: { id: string; nome: string } | null;
  descricao: string | null;
  data: Date;
  valorTotal: number;
  percentualDesteFair: number;
  valorAlocado: number;
  account: { id: string; nomeConta: string; banco: string } | null;
  feirasRateadas: Array<{
    fairId: string;
    fairName: string;
    percentual: number;
  }>;
}
```

**Estado do formulário:**

```ts
// Sem union com tipo template inline — use CreateOverheadInput diretamente
const [editingOverhead, setEditingOverhead] = useState<
  | (AllocatedOverheadItem & { _draft?: CreateOverheadInput })
  | CreateOverheadInput
  | null
>(null);
```

Ou, mais simples, dois estados separados:

```ts
const [editingOverhead, setEditingOverhead] =
  useState<AllocatedOverheadItem | null>(null);
const [isCreating, setIsCreating] = useState(false);
```

---

## 2. User — Campos aceitos pela API

### `POST /users`

| Campo      | Tipo                                                     | Obrigatório |
| ---------- | -------------------------------------------------------- | ----------- |
| `name`     | `string` (2–255 chars)                                   | sim         |
| `email`    | `string` (email válido)                                  | sim         |
| `password` | `string` (mín. 8 chars)                                  | sim         |
| `role`     | `'admin' \| 'receptionist' \| 'consultant' \| 'partner'` | sim         |
| `cpf`      | `string` (exatamente 11 dígitos numéricos)               | não         |
| `phone`    | `string` (10–20 chars)                                   | não         |
| `isActive` | `boolean` (default: `true`)                              | não         |
| `notes`    | `string`                                                 | não         |
| `fairIds`  | `string[]` (array de UUIDs)                              | não         |

### `PATCH /users/:id`

Mesmos campos acima, todos opcionais. **Sem `password`** — troca de senha usa endpoint separado:

```
PATCH /users/:id/change-password
Body: { currentPassword: string; newPassword: string }
```

### Interface corrigida para `interfaces/user.ts`

```ts
type UserRole = "admin" | "receptionist" | "consultant" | "partner";

interface ICreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  cpf?: string; // 11 dígitos numéricos, sem formatação
  phone?: string; // 10–20 chars
  isActive?: boolean;
  notes?: string;
  fairIds?: string[];
}

interface IUpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
  cpf?: string;
  phone?: string;
  isActive?: boolean;
  notes?: string;
  fairIds?: string[];
  // sem password — use PATCH /users/:id/change-password
}
```

> **CPF:** enviar apenas dígitos (`"12345678901"`), sem pontos ou traço. A API rejeita qualquer outro formato.
