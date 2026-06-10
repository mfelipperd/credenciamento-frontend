# Backend — Módulo de Feiras

Documento de referência para implementação/ajuste dos endpoints consumidos pelo frontend no módulo de Feiras (`/fairs`).

---

## Endpoints existentes (já implementados)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/fairs` | Listar feiras com filtros |
| `GET` | `/fairs/:id` | Buscar feira por ID |
| `POST` | `/fairs` | Criar nova feira |
| `PUT` | `/fairs/:id` | Atualizar feira |
| `DELETE` | `/fairs/:id` | Excluir feira |
| `PATCH` | `/fairs/:id/toggle-active` | Ativar / desativar feira |

---

## Ajuste necessário — `GET /fairs`

O frontend envia o parâmetro `search` na query string. O backend precisa suportar busca textual pelo nome da feira.

**Query params suportados (esperados pelo frontend):**

| Param | Tipo | Descrição |
|-------|------|-----------|
| `search` | `string` | Filtra feiras cujo `name` contenha o valor (case-insensitive) |
| `status` | `'upcoming' \| 'ongoing' \| 'ended' \| 'cancelled'` | Filtra por status |
| `uf` | `string` (2 letras) | Filtra pelo campo `state` da feira |
| `isActive` | `boolean` | Filtra por feiras ativas ou inativas |

**Resposta esperada:** `Fair[]`

---

## Endpoint novo — `GET /fairs/stats`

Retorna estatísticas agregadas de todas as feiras para exibição nos cards do dashboard de feiras.

**Regra de negócio importante:**
- `totalFairs` e `activeFairs`/`inactiveFairs` consideram **todas** as feiras
- `totalExpectedRevenue`, `totalExpectedProfit` e `averageProfitMargin` consideram **somente feiras ativas** (`isActive = true`)

**Resposta esperada:**

```ts
{
  totalFairs: number;           // total de feiras cadastradas
  activeFairs: number;          // feiras com isActive = true
  inactiveFairs: number;        // feiras com isActive = false
  totalExpectedRevenue: number; // soma de expectedRevenue das feiras ATIVAS — deve ser number, não string
  totalExpectedProfit: number;  // soma de expectedProfit das feiras ATIVAS — deve ser number, não string
  averageProfitMargin: number;  // média de expectedProfitMargin das feiras ATIVAS com margem > 0 — deve ser number, não string
}
```

> ⚠️ **Atenção:** `totalExpectedRevenue`, `totalExpectedProfit` e `averageProfitMargin` devem ser retornados como `number` (float/decimal), não como `string`. O frontend faz coerção como fallback, mas o ideal é o tipo correto diretamente.

**Exemplo de resposta:**

```json
{
  "totalFairs": 12,
  "activeFairs": 8,
  "inactiveFairs": 4,
  "totalExpectedRevenue": 450000.00,
  "totalExpectedProfit": 135000.00,
  "averageProfitMargin": 30.0
}
```

**Sugestão de implementação (NestJS/Prisma):**

```ts
// GET /fairs/stats
async getFairStats() {
  const [total, active] = await Promise.all([
    this.prisma.fair.count(),
    this.prisma.fair.findMany({ where: { isActive: true } }),
  ]);

  const activeFairs = active.length;
  const inactiveFairs = total - activeFairs;

  const totalExpectedRevenue = active.reduce(
    (sum, f) => sum + (f.expectedRevenue ?? 0), 0
  );
  const totalExpectedProfit = active.reduce(
    (sum, f) => sum + (f.expectedProfit ?? 0), 0
  );

  const fairsWithMargin = active.filter(f => (f.expectedProfitMargin ?? 0) > 0);
  const averageProfitMargin = fairsWithMargin.length > 0
    ? fairsWithMargin.reduce((sum, f) => sum + (f.expectedProfitMargin ?? 0), 0) / fairsWithMargin.length
    : 0;

  return {
    totalFairs: total,
    activeFairs,
    inactiveFairs,
    totalExpectedRevenue,
    totalExpectedProfit,
    averageProfitMargin,
  };
}
```

---

## Interface `Fair` — campos financeiros esperados

Os cards de estatísticas dependem destes campos presentes no objeto `Fair` retornado pela listagem:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `expectedRevenue` | `number \| null` | Receita planejada para a feira |
| `expectedProfit` | `number \| null` | Lucro planejado para a feira |
| `expectedProfitMargin` | `number \| null` | Margem de lucro esperada (%) |
| `isActive` | `boolean` | Se a feira está ativa no sistema |

Esses campos são preenchidos pelo operador no formulário de criação/edição da feira e **não** são calculados a partir de receitas reais.

---

## Integração frontend → backend

Com a implementação do `GET /fairs/stats`, o frontend estará 100% pronto para consumir o endpoint sem nenhuma alteração adicional.

- **Endpoint:** `GET /fairs/stats`
- **Auth:** requer token JWT (padrão do sistema)
- **Cache key no React Query:** `["fairs", "stats"]`
- **Invalidado automaticamente** quando uma feira é criada, atualizada, excluída ou tem seu status alternado
