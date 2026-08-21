# API de WhatsApp — Disparo em Massa

## Como funciona (visão geral)

O fluxo é o mesmo do email marketing ([docs/emails-api.md](./emails-api.md)) — a diferença é o canal de entrega (Z-API/WhatsApp em vez de Brevo/email) e as regras extra de anti-banimento. Passo a passo:

1. **Selecionar o banco de visitantes** — o "banco" é sempre **os visitantes de uma feira** (`GET /fairs` → escolher `targetFairId`) + um recorte dentro dela (`sendTo`: todos os inscritos ou só quem não fez check-in). Ver seção dedicada abaixo — é exatamente o mesmo mecanismo do email marketing.
2. **Pré-visualizar** (`GET /whatsapp/campaigns/preview`) — o backend conta quantos visitantes elegíveis existem nessa base e quantos efetivamente serão enfileirados hoje (o limite de aquecimento pode cortar o número).
3. **Escrever a mensagem** — texto livre com variáveis `{{nome}}` e `{{empresa}}`, substituídas por visitante na hora do envio.
4. **Disparar** (`POST /whatsapp/campaigns/send`) — o backend cria a campanha, grava um registro por destinatário e agenda os envios respeitando rate limit, horário comercial e o teto diário.
5. **Acompanhar** — a fila processa em background (BullMQ + Redis); o frontend consulta `GET /whatsapp/campaigns` (lista) e `GET /whatsapp/campaigns/:id/recipients` (detalhe por destinatário) pra ver o progresso, e pode pausar/retomar/cancelar a qualquer momento.

Tudo roda assíncrono: o `POST /campaigns/send` retorna na hora (não espera nenhum envio real acontecer), e as mensagens saem aos poucos em background pelos próximos minutos/horas/dias, conforme o volume.

---

## Selecionar o banco de visitantes (igual ao email marketing)

**É o mesmo conceito e os mesmos dois campos do endpoint de email `POST /emails/marketing/send`:**

| Campo          | O que é                                                                                                                                                                   | Onde popular no frontend                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `targetFairId` | **Qual banco de visitantes** — toda campanha (email ou WhatsApp) mira nos visitantes cadastrados em **uma feira específica**. Não existe "banco geral" fora de uma feira. | `GET /fairs` → combo de seleção de feira |
| `sendTo`       | **Recorte dentro desse banco** — `"all"` = todos os inscritos da feira; `"absent"` = só quem se inscreveu mas não fez check-in                                            | Toggle/radio `all` \| `absent`           |

Se o frontend de email marketing já tem uma tela com "selecione a feira" + "todos / só ausentes", é **a mesma tela e os mesmos dois campos** — só troca o endpoint de destino e o corpo da mensagem (texto puro em vez de HTML). Não é necessário nenhum seletor novo além desses dois.

**Diferença em relação ao email:** o email marketing tem um terceiro campo, `templateFairId`, que permite usar os dados de uma feira (nome, local, data) no HTML enquanto envia para os inscritos de outra (remarketing cross-feira). O WhatsApp **não tem equivalente** a esse campo — a mensagem é texto simples digitado pelo usuário (só `{{nome}}`/`{{empresa}}` são substituídos automaticamente), então não há "dados da feira" pra puxar de um lugar diferente do banco de destino.

Por baixo dos panos, a query que resolve `targetFairId` + `sendTo` em uma lista de visitantes é a mesma lógica usada nos dois módulos: junta `visitors` com `fair_visitor` pela feira, e — se `sendTo = "absent"` — exclui quem tem registro em `checkins`. No WhatsApp, ainda filtra por `whatsappOptOut = false` (não existe opt-out de email hoje).

---

## ⚠️ Leia antes de implementar o frontend

O número Z-API conectado (`Meu número`, instância `3F7A19145E...`) foi **conectado ao Z-API hoje, 14/08/2026** — mas o número em si já tem **alguns meses de uso orgânico normal no WhatsApp** (conversas reais, contatos salvos) antes disso. Isso muda o cálculo de risco: não estamos no cenário mais perigoso (SIM novo, zero histórico), mas ainda assim é a **primeira vez que esse número faz envio automatizado em massa** — e esse padrão de comportamento (não a idade do número) é o que a Meta monitora mais de perto.

**Atualização:** o backend agora aplica esses limites automaticamente (ver seção "O que já existe no backend"). O rate limit varia por volume, o horário comercial é respeitado na hora de agendar cada envio, e existe um teto diário de aquecimento que trunca campanhas grandes automaticamente. O frontend não precisa mais reimplementar essa lógica — só precisa **exibir** o que o backend calcula (`GET /whatsapp/campaigns/preview` e `GET /whatsapp/warmup-status`) para o usuário tomar decisões informadas antes de confirmar o disparo.

---

## Regras para evitar banimento (pesquisa 2026)

### Aquecimento de automação em número com uso orgânico prévio (obrigatório nos primeiros ~10 dias)

Como o número já tem alguns meses de uso real (não é SIM novo), pode pular a faixa mais conservadora usada pra números zerados — mas ainda precisa ramping, porque o comportamento automatizado em si é novo pra esse número.

| Dias desde o 1º disparo automatizado | Volume máx./dia      | Observação                                                 |
| ------------------------------------ | -------------------- | ---------------------------------------------------------- |
| 1–2                                  | 50–100 mensagens     | Priorizar contatos com maior chance de responder/interagir |
| 3–5                                  | 100–200 mensagens    | Monitorar taxa de bloqueio/opt-out antes de subir          |
| 6–10                                 | 200–400 mensagens    | Só escalar se bloqueio < 1% e sem sinais de alerta         |
| 11+                                  | Escalar gradualmente | Baseado na taxa de resposta e bloqueio, nunca em salto     |

> Se em algum momento a taxa de bloqueio passar de 2% ou o `totalFailed` de uma campanha ficar muito acima do normal, pare de escalar e volte pro patamar anterior por alguns dias.

### Limites de ritmo (mesmo após o aquecimento)

- **Menos de 30 mensagens/hora** é a faixa considerada segura para números não-oficiais (Z-API). Acima de 60/hora aumenta risco de forma acentuada.
- **Nunca mais que ~1 msg/minuto** de forma constante — rajadas de 5+/min disparam detecção de comportamento automatizado.
- **Delay fixo é um sinal de automação.** Variar o intervalo entre mensagens (ex: 5–10s aleatório) é mais seguro que um valor fixo de 7s cravado.
- **Concentrar os envios numa janela de ~8h por dia** (comercial), nunca 24h corridas.

### Conteúdo e destinatários

- **Nunca enviar para quem não deu opt-in** — na prática, aqui significa: só quem se cadastrou numa feira (já é a base atual da tabela `visitors`).
- **Excluir sempre quem já deu opt-out** (`whatsappOptOut = true`) — já implementado no backend.
- **Sempre oferecer opt-out visível** no texto ("Para não receber mais mensagens, responda SAIR").
- **Variar o texto entre envios** quando possível (mesmo texto idêntico em massa é padrão de spam) — na prática, usar sempre `{{nome}}`/`{{empresa}}` já ajuda, mas evitar link encurtado genérico e palavras-gatilho de spam ("grátis", "promoção imperdível", "clique agora", "urgente").
- **Monitorar taxa de bloqueio**: abaixo de 1% é seguro; acima de 2% é sinal de alerta e a campanha deveria ser pausada.

### Horário e infraestrutura

- Enviar **somente entre 8h e 20h** (horário local), nunca de madrugada.
- Evitar domingos e feriados nacionais.
- **Nunca conectar o mesmo número em duas ferramentas simultâneas** (ex: Z-API + WhatsApp Web aberto em paralelo) — é sinalizado como comportamento irregular.

> Essas regras vêm de práticas consolidadas de mercado para APIs não-oficiais (Z-API/similares) em 2026 — não são regras publicadas oficialmente pela Meta, que só documenta limites para a API oficial (tiers de 250/1.000/10.000/100.000 contatos por 24h). Como usamos Z-API (não a API oficial), estamos sujeitos aos critérios de detecção comportamental do WhatsApp, que são mais conservadores. Fontes ao final do documento.

---

## O que já existe no backend

O módulo (`src/modules/whatsapp/`) implementa:

- Fila de envio com BullMQ (Redis), `concurrency: 1`
- **Rate limit dinâmico por volume** (`whatsapp-scheduling.util.ts`): até 500 contatos → 5s/lote de 50/pausa 10min; 500–1.500 → 7s/50/15min; 1.500–3.000 → 10s/40/20min; 3.000+ → 12s/30/30min (tabela de `zAPI-doc.md`)
- **Janela comercial automática**: cada envio é agendado para cair entre 8h–20h (horário de Brasília), pulando domingos e feriados nacionais de data fixa — se o cálculo cair fora da janela, o envio é empurrado pro próximo horário válido
- **Limite diário de aquecimento**: calculado a partir do dia do primeiro disparo automatizado (100/dia nos dias 1–2, 200 nos dias 3–5, 400 nos dias 6–10, 800 nos dias 11–20, 1.500 depois). Uma campanha que exceder o restante do dia é **truncada automaticamente** (`totalQueued < totalEligible`), nunca rejeitada por completo se houver pelo menos 1 destinatário elegível dentro da cota
- **Circuit breaker por taxa de falha**: se uma campanha acumular ≥20 envios e taxa de falha >10%, ela é pausada automaticamente (status `paused`) — os jobs restantes na fila são pulados até alguém retomar
- Checagem de instância conectada antes de aceitar a campanha
- Normalização/validação de telefone (`55DDNÚMERO`)
- Exclusão automática de quem deu opt-out
- Webhook que detecta respostas com palavras de opt-out (`sair`, `parar`, `cancelar`, `stop`, `remover`, `não quero`) e marca o visitante
- **Log por destinatário** (`whatsapp_messages`): status individual (`queued`/`sent`/`failed`/`skipped`), `zaapId`, erro e tentativas — dá pra saber exatamente quem falhou e por quê
- **Controle de ciclo de vida da campanha**: pausar, retomar e cancelar (com remoção dos jobs pendentes da fila)
- **Preview sem efeitos colaterais**: calcula elegíveis, quanto entraria hoje, rate limit e duração estimada sem criar nada no banco

O que ainda não existe (fora do escopo desta rodada):

- Feriados móveis (Carnaval, Sexta-feira Santa, Corpus Christi) não são cobertos — só feriados de data fixa
- Sem agendamento automático do excedente truncado para os dias seguintes — se uma campanha for truncada, é preciso criar uma nova campanha manualmente no próximo dia disponível
- Sem randomização do delay entre mensagens (é fixo dentro de cada tier, não varia ±alguns segundos)

---

## Contrato de API para o frontend

### Base URL

```text
https://credenciamento-api-production.up.railway.app
```

Todos os endpoints exigem **JWT**:

```text
Authorization: Bearer <token>
```

### 1. Status da instância

```text
GET /whatsapp/instance/status
```

**Resposta:**

```json
{
  "connected": true,
  "value": { "connected": true, "smartphoneConnected": true, "...": "..." }
}
```

Chamar **antes de habilitar o botão de disparo** no frontend. Se `connected: false`, bloquear o envio e mostrar aviso pra escanear o QR Code no painel Z-API.

### 2. Listar feiras (para o seletor de "base")

```text
GET /fairs
```

Usar para popular o combo de seleção da feira-alvo (`targetFairId`). Ver [fairs.controller.ts](../src/modules/fairs/fairs.controller.ts) para o shape completo do retorno.

### 3. Status de aquecimento

```text
GET /whatsapp/warmup-status
```

**Resposta:**

```json
{
  "day": 1,
  "dailyCap": 100,
  "usedToday": 0,
  "remainingToday": 100,
  "startedAt": "2026-08-14T14:30:00.000Z"
}
```

`day` conta a partir da primeira campanha já criada no sistema (ou "hoje", se ainda não houver nenhuma). Usar pra mostrar uma barra "quanto já foi usado hoje" fixa na tela, independente de qual campanha o usuário está montando.

### 4. Pré-visualizar campanha (sem efeitos colaterais)

```text
GET /whatsapp/campaigns/preview?targetFairId=uuid-da-feira&sendTo=all
```

**Resposta:**

```json
{
  "eligibleCount": 842,
  "willQueueToday": 100,
  "truncatedByWarmup": true,
  "warmup": {
    "day": 1,
    "dailyCap": 100,
    "usedToday": 0,
    "remainingToday": 100,
    "startedAt": "2026-08-14T14:30:00.000Z"
  },
  "rateLimit": { "delayMs": 5000, "batchSize": 50, "pauseMs": 600000 },
  "estimatedDurationMs": 495000
}
```

Chamar sempre que o usuário mudar a feira ou o `sendTo`, **antes** de mostrar o botão de confirmar. Se `truncatedByWarmup: true`, avisar explicitamente: "só X de Y elegíveis serão enviados hoje por causa do limite de aquecimento (dia N)".

### 5. Disparar campanha

```text
POST /whatsapp/campaigns/send
```

**Body:**

```json
{
  "title": "Lembrete — Feira começa semana que vem",
  "targetFairId": "uuid-da-feira",
  "sendTo": "all",
  "message": "Olá, {{nome}}! A {{empresa}} está te esperando: a feira começa na próxima semana 🎉\n\nPara não receber mais mensagens, responda SAIR."
}
```

**Campos:**

| Campo          | Tipo                | Obrigatório | Descrição                                                                                          |
| -------------- | ------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `title`        | `string` (máx 255)  | Sim         | Nome interno da campanha (não vai pro destinatário)                                                |
| `targetFairId` | `string (UUID)`     | Sim         | Feira cujos visitantes vão receber a mensagem — **essa é a "base" que o front seleciona**          |
| `sendTo`       | `"all" \| "absent"` | Sim         | `"all"` = todos inscritos com telefone válido e sem opt-out; `"absent"` = só quem não fez check-in |
| `message`      | `string`            | Sim         | Template. Suporta `{{nome}}` e `{{empresa}}`                                                       |

**Comportamento no backend:**

- Rejeita com 400 se a instância estiver desconectada
- Busca visitantes da feira, filtra opt-out e telefone inválido → `totalEligible`
- Corta a lista pelo restante da cota diária de aquecimento → `totalQueued` (pode ser menor que `totalEligible`)
- Rejeita com 400 se a cota diária já tiver zerado (nenhum destinatário entra hoje)
- Cria a campanha (`status: "running"`), grava uma linha em `whatsapp_messages` por destinatário enfileirado
- Agenda cada job respeitando o rate limit por volume e a janela comercial (8h–20h BRT, sem domingo/feriado fixo)
- Retorna a campanha criada imediatamente (o envio acontece em background)

**Resposta (201):**

```json
{
  "id": "uuid-da-campanha",
  "title": "Lembrete — Feira começa semana que vem",
  "targetFairId": "uuid-da-feira",
  "sendTo": "all",
  "messageTemplate": "Olá, {{nome}}! ...",
  "campaignTag": "wzap-a1b2c3d4e5f6",
  "status": "running",
  "totalEligible": 842,
  "totalQueued": 100,
  "totalSent": 0,
  "totalFailed": 0,
  "createdAt": "2026-08-14T14:30:00.000Z"
}
```

Se `totalQueued < totalEligible`, a campanha foi truncada pelo limite de aquecimento — mostrar isso claramente na UI (ex: "100 de 842 enfileirados hoje; crie uma nova campanha amanhã pro restante").

### 6. Listar campanhas (histórico)

```text
GET /whatsapp/campaigns
```

Retorna todas as campanhas ordenadas por `createdAt DESC`, com os mesmos campos do retorno do `POST /campaigns/send`, incluindo `status` e os contadores atualizados (`totalSent`, `totalFailed`) conforme a fila processa.

Usar para uma tela de "histórico de disparos" com progresso (`totalSent + totalFailed` sobre `totalQueued`) e o `status` da campanha (`running`/`paused`/`completed`/`canceled`).

### 7. Destinatários de uma campanha

```text
GET /whatsapp/campaigns/:id/recipients
```

Retorna um array de `{ id, visitorRegistrationCode, phone, status, zaapId, error, attempts, sentAt, createdAt }` — um item por destinatário. `status` é `queued` | `sent` | `failed` | `skipped`. Usar pra uma tabela de detalhe da campanha, filtrável por status no frontend (ex: mostrar só os `failed` com o campo `error`).

### 8. Pausar / retomar / cancelar campanha

```text
PATCH /whatsapp/campaigns/:id/pause
PATCH /whatsapp/campaigns/:id/resume
PATCH /whatsapp/campaigns/:id/cancel
```

- `pause`: só funciona em campanhas `running`. Os jobs que já estão na fila continuam existindo, mas o processor pula o envio (marca como `skipped`) enquanto o status não for `running` de novo.
- `resume`: só funciona em campanhas `paused`. Volta pra `running` e os jobs restantes voltam a ser processados normalmente.
- `cancel`: funciona em qualquer status exceto `completed`/`canceled`. Remove os jobs pendentes da fila (BullMQ) e marca as mensagens `queued` restantes como `skipped`. **Não reverte mensagens já enviadas.**

Todos retornam a campanha atualizada. Usar no histórico de campanhas para dar controle manual ao usuário — por exemplo, se o circuit breaker pausar uma campanha automaticamente (taxa de falha >10%), o botão "retomar" fica disponível pra decisão humana em vez de a campanha ficar travada sem explicação.

---

## Recomendação de UX para o frontend

1. **Seletor de feira/base** (`GET /fairs`) + seletor `all`/`absent`. A cada mudança, chamar `GET /whatsapp/campaigns/preview` e mostrar `eligibleCount` (quantos existem no total) vs `willQueueToday` (quantos realmente vão sair hoje).
2. **Editor de mensagem** com atalhos pra inserir `{{nome}}` e `{{empresa}}`, e um lembrete fixo na UI: "inclua uma forma de opt-out (ex: 'responda SAIR')".
3. **Bloqueio duro** se `GET /whatsapp/instance/status` retornar `connected: false`.
4. **Barra de aquecimento sempre visível** — chamar `GET /whatsapp/warmup-status` no topo da tela (não só na hora do envio) pra mostrar "dia N de aquecimento, X/Y usados hoje", com um progress bar. Isso deixa claro pro usuário por que às vezes o disparo vem truncado.
5. **Confirmação explícita** antes de enviar — usar `estimatedDurationMs` do preview pra mostrar "essa campanha deve levar ~Xh para concluir" e, se `truncatedByWarmup`, avisar quantos ficarão de fora hoje.
6. **Tela de histórico** consumindo `GET /whatsapp/campaigns`, com barra de progresso `(totalSent + totalFailed)/totalQueued`, o `status` da campanha (badge `running`/`paused`/`completed`/`canceled`) e botões de pausar/retomar/cancelar (`PATCH /whatsapp/campaigns/:id/{pause,resume,cancel}`) conforme o status atual.
7. **Detalhe da campanha** consumindo `GET /whatsapp/campaigns/:id/recipients`, com filtro por status — priorizar mostrar os `failed` com o campo `error` pra facilitar diagnóstico.
8. **Alerta de pausa automática**: se uma campanha aparecer com `status: "paused"` sem o usuário ter clicado em pausar, destacar isso (foi o circuit breaker — taxa de falha passou de 10%) e sugerir revisar os `recipients` com status `failed` antes de retomar.

---

## Infraestrutura

| Componente             | Serviço                                                              |
| ---------------------- | -------------------------------------------------------------------- |
| Provedor WhatsApp      | [Z-API](https://z-api.io) (não-oficial, baseado em WhatsApp Web)     |
| Fila de jobs           | BullMQ                                                               |
| Redis                  | Railway                                                              |
| Concorrência do worker | 1 mensagem por vez (`concurrency: 1`, nunca aumentar — risco de ban) |
| Retry                  | 3 tentativas, backoff exponencial (10s base)                         |

## Variáveis de ambiente

| Variável            | Descrição                                                                       |
| ------------------- | ------------------------------------------------------------------------------- |
| `ZAPI_BASE_URL`     | Base da API Z-API (`https://api.z-api.io/instances`)                            |
| `ZAPI_INSTANCE_ID`  | ID da instância conectada                                                       |
| `ZAPI_TOKEN`        | Token da instância                                                              |
| `ZAPI_CLIENT_TOKEN` | Client-Token de segurança da conta Z-API                                        |
| `WEBHOOK_SECRET`    | Chave usada para validar o header `client-token` no webhook `/whatsapp/webhook` |
| `REDIS_URL`         | URL de conexão com o Redis (fila)                                               |

---

## Fontes

- [O que é banimento no WhatsApp e como proteger a operação da sua empresa em 2026 — Z-API](https://z-api.io/blog/o-que-e-banimento-no-whatsapp-e-como-proteger-a-operacao-da-sua-empresa-em-2026/)
- [How to Avoid a WhatsApp Ban in 2026 — Whapi.Cloud](https://whapi.cloud/blog/how-to-avoid-whatsapp-ban-2026)
- [WhatsApp Messaging Limits 2026: Scale Without Getting Banned — Chatarmin](https://chatarmin.com/en/blog/whats-app-messaging-limits)
- [Boas práticas para evitar bloqueio no WhatsApp Business API — Treble.ai](https://treble.ai/pt/blog/checklist-boas-praticas-para-evitar-bloqueio-no-whatsapp-business-api/)
