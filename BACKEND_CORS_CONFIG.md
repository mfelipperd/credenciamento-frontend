# Configuração Necessária no Backend

## Problema Identificado
O middleware `FrontendOriginGuard` espera header `x-frontend-auth`, mas o CORS não permite este header.

## Solução: Atualizar CORS

### 1. Configurar CORS para aceitar header customizado

```typescript
// No main.ts ou app.module.ts
app.enableCors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://credenciamento-frontend.vercel.app',
    'https://www.expomultimix.com'
  ],
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization', 
    'x-frontend-auth'  // ← ADICIONAR ESTE HEADER
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
});
```

### 2. Variável de Ambiente no Backend

```bash
# .env do backend
FRONTEND_SECRET_KEY=your-secret-key-here
```

### 3. Frontend Atualizado ✅

- ✅ Usa criptografia AES-256-CBC (igual ao backend)
- ✅ Envia header `x-frontend-auth` 
- ✅ Usa mesma chave secreta
- ✅ Aplica apenas em rotas `/visitors` e `/auth`

## Resumo

O frontend agora gera tokens exatamente como o método `FrontendOriginGuard.generateFrontendAuth()` do backend.

**Só falta configurar o CORS do backend para aceitar o header `x-frontend-auth`!**
