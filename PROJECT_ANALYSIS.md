# Análise Detalhada do Projeto: Credenciamento Frontend

## 1. Visão Geral do Projeto
Este projeto é uma aplicação frontend moderna construída com **React 19**, **Vite**, **TypeScript** e **Tailwind CSS**. A interface utiliza componentes do **Shadcn UI** (Radix UI) e implementa uma arquitetura baseada em serviços para comunicação com a API.

### Stack Tecnológico Principal
- **Framework:** React 19 + Vite
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS v4, Tailwind Merge, Class Variance Authority
- **UI Components:** Shadcn UI (@radix-ui/*), Lucide React (ícones)
- **Gerenciamento de Estado/Query:** React Query (@tanstack/react-query), Context API (Auth)
- **Roteamento:** React Router DOM v7 (RouterProvider)
- **HTTP Client:** Axios com interceptors personalizados
- **Formulários:** React Hook Form + Zod
- **Gráficos/PDF:** ApexCharts, PDFRenderer, jsPDF

---

## 2. Arquitetura e Estrutura de Pastas

A estrutura do projeto segue o padrão modular, separando responsabilidades de forma clara:

- `src/auth`: Contexto de autenticação (`AuthProvider`) e controle de sessão.
- `src/components`: Componentes reutilizáveis (UI) e componentes de negócio específicos.
- `src/hooks`: Custom hooks, incluindo clientes Axios configurados (`useAxio`, `useAxiosPublic`).
- `src/pages`: Páginas da aplicação, geralmente com seus próprios sub-componentes.
- `src/routes`: Definição central das rotas (`AppRoutes.tsx`).
- `src/service`: Camada de serviço centralizada. Cada entidade tem seu próprio arquivo de serviço.
- `src/utils`: Utilitários gerais e wrappers de requisição (`handleRequest`).

---

## 3. Mapeamento de Rotas (`src/routes/AppRoutes.tsx`)

O sistema utiliza `createBrowserRouter` e protege rotas via `AdminRouteGuard` ou `ProtectedRoute`.

| Caminho | Componente/Página | Tipo de Acesso |
| :--- | :--- | :--- |
| `/login` | `Login` | Público |
| `/sucess` / `/sucess-totem` | `SucessForm` / `SucessFormTotem` | Público |
| `/public-form/:fairId` | `PublicForm` | Público |
| `/public-form-totem/:fairId` | `PublicFormtotem` | Público |
| `/` | `Dashboard` | Privado |
| `/visitors-table` | `TabeleVisitors` | Privado |
| `/visitor/:id` | `Visitor` | Privado |
| `/financeiro/receitas` | `FinancePage` | Admin |
| `/expenses` | `ExpensesPage` | Admin |
| `/partners` | `PartnersPage` | Admin |
| `/fairs` | `FairsPage` | Admin |
| `/user-management` | `UserManagementPage` | Admin |

*(Lista resumida, ver arquivo `AppRoutes.tsx` para todas as rotas)*

---

## 4. Integração com API (Endpoints)

A comunicação é feita através da pasta `src/service`. Os serviços utilizam uma instância de Axios configurada (`useAxio` ou `useAxiosPublic`).

### Serviços Identificados e Endpoints Inferidos

#### `visitors.service.ts`
- `GET /visitors` (Listagem com filtros)
- `GET /visitors/:id` (Detalhes)
- `POST /checkins` (Check-in de visitante)
- `GET /checkins/today` (KPIs de check-in)
- `PATCH /visitors/:id` (Atualização)
- `DELETE /visitors/:id` (Remoção)

#### `finance.service.ts`
- `GET /finance/entry-models` (Modelos de entrada)
- `GET /finance/clients` (Clientes)
- `GET /finance/revenues` (Receitas)
- `POST /finance/revenues` (Criar Receita)
- `GET /finance/revenues/kpis` (KPIs Financeiros)
- `POST /finance/revenues/:id/installments/generate` (Gerar Parcelas)

#### `auth.service.ts`
- `POST /auth/login` (Autenticação)

#### Outros Serviços (Baseado nos nomes dos arquivos)
- `categories.service.ts`: Gerenciamento de categorias.
- `dashboard.service.ts`: Dados para o dashboard principal.
- `fair.service.ts` / `fairs.service.ts`: CRUD de feiras.
- `partners.service.ts` / `fair-partners.service.ts`: Gestão de parceiros.
- `stands.service.ts`: Gestão de stands/mapas.
- `user.service.ts`: Gestão de usuários do sistema.

---

## 5. Análise de Arquivos e Código Morto (Unused Files)

Com base na análise estática e verificação de importações, foram identificados arquivos potencialmente sem uso ou duplicados.

### Potenciais Componentes Sem Uso
Estes arquivos existem no diretório `components` mas não parecem ser importados nas rotas principais ou páginas correspondentes (suspeita de refatoração ou código legado):

1.  **`src/components/StandConfigurator`**
    - Não encontrado em `FairsPage` ou `AppRoutes`. Pode ser um componente antigo ou um recurso ainda não integrado totalmente.
2.  **`src/components/StandMap`**
    - Similar ao `StandConfigurator`, possivelmente relacionado a uma feature de mapa de feira não ativa nas rotas principais.
3.  **`src/components/Layout/ModalCreateFair`**
    - A página `FairsPage` utiliza um componente local `./components/FairForm` em vez deste modal global. Isso indica uma possível duplicação.
4.  **`src/components/Layout/ModalCreateUser`**
    - Verificar se `UserManagementPage` utiliza este componente ou uma versão local.

### Observações sobre Dependências
- O projeto possui dependências de gráficos (`apexcharts`, `chart.js`) e PDF (`jspdf`, `@react-pdf/renderer`). Verifique se ambas as bibliotecas de PDF são necessárias ou se é possível padronizar em uma.

---

## 6. Recomendações

1.  **Limpeza de Código:** Verificar e remover os componentes listados na seção "Potenciais Componentes Sem Uso" caso confirmado que não são utilizados.
2.  **Padronização de Serviços:** Alguns serviços parecem ter nomes duplicados ou muito similares (`expense.service.ts` vs `expenses.service.ts`). Verificar se é possível unificar.
3.  **Tipagem:** Reforçar o uso de interfaces compartilhadas em `src/interfaces` para evitar repetição de tipos nos serviços.
