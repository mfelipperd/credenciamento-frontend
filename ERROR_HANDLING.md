# Sistema de Tratamento de Erros

Este projeto implementa um sistema robusto de tratamento de erros para a aplicação React + Vite.

## 📁 Estrutura dos Arquivos

```
src/
├── components/
│   ├── ErrorBoundary/index.tsx     # Error Boundary para erros React
│   └── AppWrapper/index.tsx        # Wrapper com hooks globais
├── pages/
│   ├── ErrorPage/index.tsx         # Página de erro personalizada
│   └── ErrorTestPage/index.tsx     # Página para testar erros (dev only)
├── hooks/
│   └── useGlobalErrorHandler.ts    # Hook para erros JavaScript globais
└── plugins/
    └── errorPagePlugin.ts          # Plugin Vite para erros de build
```

## 🛡️ Tipos de Erros Capturados

### 1. **Erros React (Error Boundary)**

- Erros durante renderização de componentes
- Erros em métodos do ciclo de vida
- Erros em construtores

**Como funciona:**

```tsx
// Automaticamente captura erros como:
const ComponenteComErro = () => {
  throw new Error("Algo deu errado!");
  return <div>Nunca será renderizado</div>;
};
```

### 2. **Erros JavaScript Globais**

- Erros JavaScript não capturados
- Erros em código assíncrono
- Erros de sintaxe em runtime

**Como funciona:**

```tsx
// Captura erros como:
setTimeout(() => {
  throw new Error("Erro assíncrono");
}, 1000);
```

### 3. **Promises Rejeitadas**

- Promises rejeitadas sem `.catch()`
- Erros em async/await sem try/catch
- Falhas de API não tratadas

**Como funciona:**

```tsx
// Captura rejeições como:
Promise.reject(new Error("Promise falhou"));

// Ou
async function fetchData() {
  throw new Error("API falhou");
}
fetchData(); // Sem await/catch
```

### 4. **Erros de Build/Desenvolvimento (Vite Plugin)**

- Erros de compilação
- Erros de hot reload
- Erros de sintaxe

## 🎨 Interface da Página de Erro

A página de erro exibe:

- **Ícone de alerta** visual
- **Título claro** sobre o erro
- **Código do erro** destacado
- **Botões de ação**: Recarregar, Ir para Início, Tentar Novamente
- **Detalhes técnicos** (opcional, expansível):
  - Stack trace completo
  - Component stack (para erros React)
- **Informações de contato** para suporte

## 🧪 Testando o Sistema

### Página de Teste (Desenvolvimento)

Acesse `/error-test` para testar diferentes tipos de erros:

1. **Erro React**: Dispara erro em componente
2. **Erro JavaScript**: Erro assíncrono global
3. **Promise Rejeitada**: Promise sem tratamento
4. **Erro de Rede**: Simula falha de conexão

### Testando Manualmente

```tsx
// 1. Erro React
const TesteErroReact = () => {
  throw new Error("Teste de erro React");
};

// 2. Erro JavaScript Global
window.addEventListener("click", () => {
  throw new Error("Erro global");
});

// 3. Promise Rejeitada
Promise.reject(new Error("Promise rejeitada"));

// 4. Erro de Rede
fetch("/api/inexistente");
```

## ⚙️ Configuração

### 1. Error Boundary

```tsx
// main.tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 2. Hook Global de Erros

```tsx
// AppWrapper.tsx
import { useGlobalErrorHandler } from "@/hooks/useGlobalErrorHandler";

export const AppWrapper = () => {
  useGlobalErrorHandler(); // Ativa captura global
  return <App />;
};
```

### 3. Plugin Vite

```ts
// vite.config.ts
import { errorPagePlugin } from "./src/plugins/errorPagePlugin";

export default defineConfig({
  plugins: [react(), errorPagePlugin()],
});
```

## 📊 Monitoramento (Produção)

Para produção, você pode integrar com serviços de monitoramento:

### Sentry

```tsx
// ErrorBoundary.tsx
import * as Sentry from '@sentry/react';

componentDidCatch(error, errorInfo) {
  Sentry.captureException(error, { contexts: { react: errorInfo } });
}
```

### LogRocket

```tsx
// useGlobalErrorHandler.ts
import LogRocket from "logrocket";

const handleError = (event) => {
  LogRocket.captureException(event.error);
};
```

## 🚀 Features

- ✅ **Captura múltiplos tipos de erro**
- ✅ **Interface amigável ao usuário**
- ✅ **Detalhes técnicos para desenvolvedores**
- ✅ **Botões de recuperação inteligentes**
- ✅ **Integração com toast notifications**
- ✅ **Plugin Vite para erros de build**
- ✅ **Página de teste para desenvolvimento**
- ✅ **Suporte a monitoramento externo**

## 🔧 Personalização

### Customizar Página de Erro

Edite `src/pages/ErrorPage/index.tsx` para modificar:

- Layout e cores
- Mensagens de erro
- Botões de ação
- Informações de contato

### Customizar Tratamento de Erros

Edite `src/hooks/useGlobalErrorHandler.ts` para:

- Filtrar tipos de erro
- Adicionar logging personalizado
- Integrar com serviços externos

## 📝 Notas Importantes

1. **Remover página de teste em produção**: A rota `/error-test` deve ser removida antes do deploy
2. **Configurar monitoramento**: Adicione serviços como Sentry em produção
3. **Personalizar mensagens**: Adapte as mensagens para seu público-alvo
4. **Testar regularmente**: Use a página de teste durante desenvolvimento

## 🤝 Contribuição

Para adicionar novos tipos de tratamento de erro:

1. Crie um novo hook em `src/hooks/`
2. Importe no `AppWrapper`
3. Adicione testes na `ErrorTestPage`
4. Documente o novo tipo neste README
