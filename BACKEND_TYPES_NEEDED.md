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
