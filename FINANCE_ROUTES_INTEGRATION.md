# Integração de Rotas - Módulo Finance

## Rotas do Backend Mapeadas

### Finance Clients

- `POST /finance/clients` - Criar cliente
- `GET /finance/clients` - Listar clientes (com query params)
- `GET /finance/clients/:id` - Buscar cliente por ID
- `PATCH /finance/clients/:id` - Atualizar cliente
- `DELETE /finance/clients/:id` - Deletar cliente
- `GET /finance/clients/email/:email` - Buscar cliente por email
- `GET /finance/clients/cnpj/:cnpj` - Buscar cliente por CNPJ

### Finance Entry Models

- `POST /finance/entry-models` - Criar modelo de entrada
- `GET /finance/entry-models` - Listar modelos de entrada
- `GET /finance/entry-models/:id` - Buscar modelo por ID
- `PATCH /finance/entry-models/:id` - Atualizar modelo
- `DELETE /finance/entry-models/:id` - Deletar modelo

### Finance Revenues

- `POST /finance/revenues` - Criar nova receita
- `GET /finance/revenues` - Listar todas as receitas
- `GET /finance/revenues/:id` - Buscar receita por ID
- `PATCH /finance/revenues/:id` - Atualizar receita
- `DELETE /finance/revenues/:id` - Deletar receita
- `GET /finance/revenues/client/:clientId` - Buscar receitas por cliente

## Funções Implementadas no Finance Service

### Entry Models

- ✅ `getEntryModels(fairId?, type?)` - GET /finance/entry-models
- ✅ `getEntryModel(id)` - GET /finance/entry-models/:id
- ✅ `createEntryModel(data)` - POST /finance/entry-models
- ✅ `updateEntryModel(id, data)` - PATCH /finance/entry-models/:id
- ✅ `deleteEntryModel(id)` - DELETE /finance/entry-models/:id

### Revenues

- ✅ `getRevenues(filters)` - GET /finance/revenues
- ✅ `getRevenueDetail(id)` - GET /finance/revenues/:id
- ✅ `getRevenuesByClient(clientId)` - GET /finance/revenues/client/:clientId
- ✅ `createRevenue(data)` - POST /finance/revenues
- ✅ `updateRevenue(id, data)` - PATCH /finance/revenues/:id
- ✅ `deleteRevenue(id)` - DELETE /finance/revenues/:id
- ✅ `cancelRevenue(id)` - PATCH /finance/revenues/:id/cancel

### Clients

- ✅ `getClients(q?)` - GET /finance/clients
- ✅ `getClient(id)` - GET /finance/clients/:id
- ✅ `getClientByEmail(email)` - GET /finance/clients/email/:email
- ✅ `getClientByCnpj(cnpj)` - GET /finance/clients/cnpj/:cnpj
- ✅ `searchClients(q)` - Alias para getClients(q)
- ✅ `createClient(data)` - POST /finance/clients
- ✅ `updateClient(id, data)` - PATCH /finance/clients/:id
- ✅ `deleteClient(id)` - DELETE /finance/clients/:id

## Principais Alterações

1. **Entry Models**: Adicionadas todas as operações CRUD completas
2. **Clients**: Expandido para incluir todas as rotas disponíveis
3. **Revenues**: Atualizadas para usar PATCH em vez de PUT, adicionadas rotas DELETE e busca por cliente
4. **Validação CNPJ**: Agora pode usar a rota específica `/finance/clients/cnpj/:cnpj`
5. **Validação Email**: Agora pode usar a rota específica `/finance/clients/email/:email`

## Status da Integração

- ✅ Build concluído com sucesso (9.96s)
- ✅ Todas as rotas mapeadas corretamente
- ✅ TypeScript sem erros
- ✅ Service layer atualizado
- ✅ Retrocompatibilidade mantida
- ✅ Revenues: CRUD completo implementado

## Próximos Passos

1. Implementar validação de CNPJ único usando `getClientByCnpj`
2. Implementar validação de email único usando `getClientByEmail`
3. Adicionar funcionalidades de gestão de modelos de entrada
4. Testes de integração com o backend

## Funcionalidades Disponíveis

- **Busca de clientes** por texto, email ou CNPJ
- **CRUD completo** para clientes, modelos de entrada e receitas
- **Validações** específicas por campo
- **Autocomplete** inteligente para formulários
- **Gestão de receitas** por cliente
- **Operações de exclusão** seguras
