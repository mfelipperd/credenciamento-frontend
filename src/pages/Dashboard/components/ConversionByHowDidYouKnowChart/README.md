# Gráfico de Conversões por Meio de Divulgação

Este componente exibe um gráfico de conversões mostrando como os visitantes ficaram sabendo da feira.

## 📊 Funcionalidades

- **Gráfico Donut**: Visualização clara das conversões por canal
- **Legenda Personalizada**: Informações detalhadas de cada canal
- **Insights Adicionais**: Cards com métricas importantes
- **Design Responsivo**: Adaptável a diferentes tamanhos de tela
- **Estados de Loading**: Indicador visual durante carregamento
- **Estado Vazio**: Mensagem quando não há dados

## 🎯 Endpoint Utilizado

```
GET /dashboard/conversions/how-did-you-know?fairId={fairId}
```

## 📱 Interface Esperada

```typescript
interface DashboardConversionResponse {
  fairId: string;
  conversionsByHowDidYouKnow: ConversionByHowDidYouKnow[];
}

interface ConversionByHowDidYouKnow {
  howDidYouKnow: string;
  count: string;
}
```

## 🎨 Canais Suportados

- **Facebook** - Azul (#3B82F6)
- **Instagram** - Rosa (#E91E63)
- **Google** - Verde (#4CAF50)
- **Outdoor** - Laranja (#FF9800)
- **Busdoor** - Roxo (#9C27B0)
- **TV** - Vermelho (#F44336)
- **Indicação** - Ciano (#00BCD4)
- **Representante** - Marrom (#795548)
- **Outros** - Cinza Azulado (#607D8B)

## 📈 Métricas Exibidas

1. **Canal Mais Efetivo**: Canal com maior número de conversões
2. **Total de Canais**: Quantidade de canais ativos
3. **Total de Conversões**: Soma de todas as conversões

## 🛠️ Uso no Componente

```tsx
import { ConversionByHowDidYouKnowChart } from "./components/ConversionByHowDidYouKnowChart";

// Na dashboard
<ConversionByHowDidYouKnowChart fairId={fairId} />;
```

## 🎛️ Configurações do ApexChart

- **Tipo**: Donut Chart
- **Animações**: Habilitadas com velocidade 800ms
- **DataLabels**: Percentuais formatados
- **Tooltip**: Mostra contagem de conversões
- **Responsivo**: Adapta para telas pequenas

## 🎨 Estilos Personalizados

- **Container**: Background branco com sombra sutil
- **Título**: Texto grande e em destaque
- **Legenda**: Hover effects e informações detalhadas
- **Cards de Insights**: Cores diferenciadas por métrica
- **Estado Vazio**: Ícone SVG e mensagem explicativa

## 📱 Responsividade

- **Desktop**: Gráfico e legenda lado a lado
- **Tablet**: Layout em coluna com gráfico no topo
- **Mobile**: Componentes empilhados com largura total

## 🔧 Manutenção

Para adicionar novos canais:

1. Adicione a cor em `CONVERSION_COLORS`
2. Inclua o mapeamento em `LABEL_MAPPING`
3. O componente se adapta automaticamente

## ⚡ Performance

- Loading state durante requisição
- Memoização automática do ApexChart
- Cleanup de effects no desmount
- Estados de erro tratados graciosamente
