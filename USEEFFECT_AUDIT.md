# Auditoria de useEffect

## Correções implementadas após a auditoria

Foco desta implementação: reduzir chamadas desnecessárias à API.

- Drawer e seletor compartilham `useAvailableStands`, com cache de 30 segundos. Eliminada a busca acionada por um objeto de serviço instável. Clientes e modelos só são consultados com o drawer aberto e feira selecionada. A criação de receita invalida a disponibilidade dos stands.
- Prospects usa consultas por feira/filtros/página, com debounce de 300 ms. A mudança de filtro redefine a página no mesmo evento. Trocar de feira reinicia o componente. Atualização manual permanece disponível; mutações invalidam os dados relacionados.
- Controller do dashboard de público consulta apenas overview e ausentes. Removidas as buscas não consumidas de visitantes com check-in, setores e check-ins por hora. Os seis gráficos usam consultas com cache por endpoint/feira/data e valores derivados, sem efeitos de busca. O overview é compartilhado com prospects.
- Receitas reinicia filtros e paginação ao trocar de feira, sem sincronização posterior via efeito que preserve a feira anterior.
- CEP aguarda 300 ms, cancela timer/requisição substituída e ignora respostas obsoletas.
- WebSocket remove os próprios listeners e encerra a conexão ao sair o último consumidor. O visitante passa um callback estável.
- Redirecionamento de consultor sem feiras não navega novamente quando já está em `/login`.

Testes de regressão: `node --test tests/api-effects.test.cjs`, usando callbacks/hooks da aplicação, mocks de HTTP e observadores/cache reais do TanStack Query. Não substituem validação visual no navegador. Os demais itens abaixo permanecem como registro da auditoria original; não representam todos correções feitas nesta etapa.

## Auditoria original

Revisão em 10/09/2026: **49 efeitos em 36 arquivos**. Inclui `React.useEffect`; não foram encontrados `useLayoutEffect` ou `useInsertionEffect`. Código de dependências e artefatos de build não entram na contagem.

Foram examinados os corpos dos efeitos, dependências, serviços chamados, consumidores relevantes, cleanup e comportamento assíncrono. Na etapa original de auditoria nenhum arquivo da aplicação foi alterado. Havia alterações locais anteriores e arquivos sendo modificados durante a revisão; as linhas abaixo correspondem à versão examinada antes das correções.

## Problemas prioritários

1. **Alta — requisições contínuas no preenchimento de receitas.** `src/pages/Finance/components/ReceitaDrawer.tsx:224`: `standService` é dependência, mas `useStandService` retorna um objeto novo a cada render. Com drawer aberto, feira e stand pré-selecionado encontrado, a resposta chama `setSelectedStand` com outro objeto, renderiza e dispara outra busca. Digitar também dispara buscas. Não há proteção contra respostas após fechamento/troca da feira. Usar uma consulta com chave por feira/stand ou estabilizar o método do serviço e proteger respostas obsoletas; apenas desestruturar o método atual não resolve, porque ele também é recriado.

2. **Alta — listeners de WebSocket acumulados.** `src/service/checkin.socket.ts:14`: registra três handlers e o cleanup não remove nenhum. `Visitor/page.tsx` passa callback inline, portanto cada render repete as inscrições. Ao desmontar, handlers continuam ativos. Remover cada handler com a mesma referência usada em `on`, estabilizar o callback e definir o ciclo de vida da conexão compartilhada. Simulação de três setups seguidos dos respectivos cleanups deixou três handlers `checkinConfirmed` ativos.

3. **Alta — redirecionamento repetido para login.** `src/auth/AuthProvider.tsx:84`: consultor sem `fairIds` chama `navigate('/login')` mesmo já estando em `/login`. A navegação altera `location`, que é dependência, e o usuário continua preenchendo a condição. O `state.from` também recebe a localização anterior. Evitar navegar novamente para o destino atual e tratar explicitamente a sessão sem feira. Simulação confirmou que o efeito continua solicitando navegação estando no destino.

4. **Média — respostas antigas sobrescrevem dados atuais.** Ocorre na consulta de CEP (`PrivateForm/FormCreateVisitor/index.tsx:448`), buscas de visitantes (`Visitor/page.tsx:26` e formulário privado `:466`), dashboard/controller e seus seis gráficos, e loaders de `Marketing/ProspectsTab.tsx:436,440`. Nenhum desses fluxos invalida a resposta da busca anterior. Exemplo: pesquisar CEP A, depois B; B responde primeiro e A sobrescreve o endereço. O cenário foi reproduzido com promises controladas. Usar cancelamento/identificador de requisição ou React Query com chaves adequadas. Nos serviços de visitantes/dashboard, o próprio método escreve estado depois do `await`; um `ignore` apenas no componente não protege esse estado interno. O timer de 50 ms do formulário só cancela o início da busca, não uma busca já iniciada.

5. **Média — paginação de prospects dispara duas consultas ao mudar filtros.** `Marketing/ProspectsTab.tsx:445`: o reset de página acontece depois da renderização que já disparou a busca com filtros novos e página antiga. Na página 3, mudar o filtro busca página 3 e depois página 1; sem proteção de concorrência, a resposta da página 3 pode prevalecer. Alterar filtro e página na mesma atualização/evento. A troca de `fairId` também não reseta a página.

6. **Média — seleção do layout diverge da URL.** `components/Layout/mainLayout.tsx:223`: `hasInitialized` impede a sincronização depois da primeira lista de feiras. Voltar/avançar no navegador pode deixar a URL em B e o seletor/links da sidebar em A. Na inicialização, um `fairId` inválido resulta em seleção local válida, mas não corrige a URL; quando não há `fairId`, `setSearchParams({ fairId: newId })` apaga os demais parâmetros. Definir uma fonte de verdade e preservar os parâmetros existentes.

7. **Média — stand selecionado pode permanecer obsoleto.** `components/StandSelector/index.tsx:44`: quando `value` existe, mas não é encontrado na lista atual, o efeito mantém o objeto selecionado anteriormente. Isso pode mostrar detalhes/preço antigos após atualização de disponibilidade ou troca da feira. Derivar a seleção de `value` e da lista atual, retornando `null` quando não existir.

8. **Média — cleanup do diálogo altera scroll que não lhe pertence.** `components/ui/alert-dialog.tsx:13`: sempre define `body.style.overflow = 'unset'`, inclusive para um efeito que iniciou com `open=false`. Não restaura o valor anterior e pode liberar o scroll de outro modal aberto. Só adquirir/liberar o bloqueio quando aberto, com gerenciamento compartilhado se houver sobreposição de diálogos.

9. **Média — filtro financeiro mantém feira anterior.** `Finance/ReceitasTabContent.tsx:34`: ao remover `fairId` da URL, o `if (fairId)` mantém a feira antiga em `filters`, e as queries continuam habilitadas para ela. Ao trocar a feira, a página anterior também é mantida. Derivar a feira da URL e reiniciar a paginação conforme a regra de navegação.

## Dependências suprimidas e melhorias

- `Dashboard/components/ConversionByHowDidYouKnowChart/index.tsx:113`: lint suprimido para `chart.options` e `getConversionsByHowDidYouKnow`. Usar atualização funcional de `setChart` e incluir o método estável. Adicionar `chart.options` diretamente geraria repetição, pois o efeito o modifica. Quando a nova resposta não tem conversões, o retorno antecipado mantém o gráfico anterior.
- `Expenses/components/ConvertToOverheadDialog.tsx:72`: depende de `expense?.id`, mas testa `expense` e usa `currentFairId`. A ausência de `currentFairId` pode deixar a seleção inicial na feira antiga se essa prop mudar com o diálogo aberto. Pode-se testar o ID diretamente e incluir a feira, definindo quando um reset deve preservar edições do usuário.
- `Marketing/ProspectsTab.tsx`: os efeitos dependem dos loaders, mas os `useCallback` desses loaders suprimem dependências de métodos do serviço. Corrigir também a estabilidade dos métodos antes de adicioná-los, para não criar loops. Isso é separado da concorrência das respostas.
- `Marketing/ProspectMap.tsx:39,342`: cleanup de mapa/popup existe. Porém a montagem captura dados/centro iniciais com `[]`, enquanto a atualização retorna se o estilo não carregou, sem reagendar. Mudanças durante esse intervalo podem se perder. Atualizar só `setData` não recalcula os máximos usados nos raios, não cria camada de bairros ausente inicialmente, não limpa bairros quando a prop some e não atualiza o centro. **Ressalva:** o pai atual desmonta o mapa enquanto carrega analytics, mitigando esses cenários no fluxo usual; são limitações reais do componente ao receber novas props sem remontagem, não evidência de falha em toda troca de feira.
- `AuthProvider.tsx:72`: dependências corretas para validar o token quando ele muda. Não agenda sua expiração durante uma sessão ociosa. Se o requisito é logout automático ao expirar, falta timer com cleanup; não confundir com validação de autorização no servidor.
- Dashboard/controller e gráficos com `lastFetchedRef`/`hasFetchedRef`: marcar a chave antes da resposta impede nova tentativa para a mesma chave após falha e bloqueia execução mesmo se o serviço mudar. A ref não é cache nem proteção contra respostas fora de ordem. Evitar deduplicação improvisada e usar o mecanismo de consultas do projeto.
- `MetaPixel.tsx:22`: inicialização/evento repetidos em cada montagem e ao mudar as props. Com `StrictMode` habilitado em `main.tsx`, há duas chamadas do evento no ciclo inicial de desenvolvimento. Separar inicialização por pixel do evento por navegação/conversão e definir deduplicação de negócio. Não é necessário remover o script global a cada desmontagem.
- Efeitos vazios em `UserFormModal.tsx:104` e `ModalEdit/index.tsx:45` podem ser removidos. O log de categorias em `ExpenseForm.tsx:129` é apenas diagnóstico.
- `SucessTotem/page.tsx:10` limpa corretamente o intervalo, mas o recria a cada segundo. Um timeout por passo ou intervalo separado da navegação simplifica o comportamento.
- Resets de React Hook Form não são automaticamente bugs. Os efeitos examinados têm dependências declaradas, mas receber outro objeto da mesma entidade durante edição pode apagar um rascunho. A política de reset por abertura/identidade deve ser deliberada. Preferir depender de `reset` em vez do objeto inteiro `form` reduz acoplamento.

## Inventário completo

Linhas agrupadas na mesma célula representam efeitos distintos. “Adequado” significa que não foi identificado defeito concreto no ciclo do efeito pelo código examinado, não garantia de todo o componente.

| Arquivo em `src/` | Linhas dos efeitos | Avaliação |
| --- | --- | --- |
| auth/AuthProvider.tsx | 72; 84 | 72: validação pontual adequada, observar expiração; 84: redirecionamento repetido |
| hooks/useGlobalErrorHandler.ts | 13 | Adequado: listener removido com a referência correta |
| hooks/useIntersectionObserver.ts | 20 | Adequado para nó fixo: desconecta observer; não há consumidor encontrado. Trocas de `.current` sozinhas não reexecutam o efeito |
| hooks/useTheme.tsx | 39 | Adequado: sincroniza classe e remove listener de tema do sistema |
| service/checkin.socket.ts | 14 | Problema: falta remover listeners |
| components/MetaPixel/MetaPixel.tsx | 22 | Revisar repetição da inicialização e eventos |
| components/Layout/mainLayout.tsx | 223 | Problema: sincronização bloqueada após inicialização e perda de parâmetros |
| components/StandSelector/index.tsx | 44 | Problema: mantém seleção obsoleta; estado derivável |
| components/StandConfigurator/index.tsx | 38 | Reset ao abrir adequado; atualização de contagem externa também reinicia o campo |
| components/ui/alert-dialog.tsx | 13 | Listener adequado; cleanup do scroll incorreto |
| components/ui/calendar.tsx | 179 | Adequado: foco DOM conforme `modifiers.focused` |
| pages/Visitor/page.tsx | 26 | Busca sem proteção contra resposta obsoleta; URL/mobile podem ser derivados/inicializados separadamente |
| pages/ConsultantPage/Table/index.tsx | 45; 153 | 45: redundante, pois `useUserFairs` já prioriza o fairId da URL; 153: inicialização de parâmetros com guarda adequada. Não foi confirmado loop entre os dois |
| pages/ConsultantPage/PopupOverlay/index.tsx | 36; 62 | Adequados: timeout e intervalo com cleanup; contador também roda enquanto popup oculto |
| pages/Clients/components/ClientFormModal.tsx | 53 | Reset por cliente/abertura adequado; observar rascunhos se objeto mudar |
| pages/Dashboard/dashboard.controller.ts | 21 | Concorrência das respostas e bloqueio de nova tentativa por ref |
| pages/Dashboard/components/CheckinPerHourChat/index.tsx | 22 | Concorrência feira/data e bloqueio por ref |
| pages/Dashboard/components/SectorRadialChart/index.tsx | 16 | Concorrência das respostas e bloqueio por ref |
| pages/Dashboard/components/CategoryRadialChart/index.tsx | 16 | Concorrência das respostas e bloqueio por ref |
| pages/Dashboard/components/OriginRadialChart/index.tsx | 15 | Concorrência das respostas e bloqueio por ref |
| pages/Dashboard/components/ConversionChart/index.tsx | 27 | Concorrência das respostas e bloqueio por ref |
| pages/Dashboard/components/ConversionByHowDidYouKnowChart/index.tsx | 113 | Concorrência, dependências suprimidas e gráfico anterior preservado em resposta vazia |
| pages/PrivateForm/FormCreateVisitor/index.tsx | 448; 466 | 448: CEP sem cancelamento; 466: cancela timeout, mas não a busca iniciada |
| pages/Expenses/components/ExpenseForm.tsx | 129; 147 | 129: diagnóstico removível; 147: reset com dependências declaradas, observar rascunhos |
| pages/Expenses/components/ConvertToOverheadDialog.tsx | 72 | Dependências omitidas; feira usada na inicialização pode ficar antiga |
| pages/Fairs/components/CategoryForm.tsx | 56 | Reset adequado; observar mudança de referência durante edição |
| pages/Fairs/components/FairForm.tsx | 192 | Reset adequado; observar mudança de referência durante edição |
| pages/Finance/ReceitasTabContent.tsx | 34 | Não limpa feira removida nem reinicia página ao trocar feira |
| pages/Finance/components/ReceitaDrawer.tsx | 212; 224; 246; 255 | 212: reset ao fechar adequado; 224: loop de requisições; 246: sincronização de desconto válida; 255: preenchimento por modelo válido, pode ser feito no evento de seleção |
| pages/Finance/components/FinanceFiltersSheet.tsx | 54 | Sincronização declarada adequada; sem consumidor encontrado. Reabrir sem mudança em `filters` preserva rascunho não aplicado — definir intenção |
| pages/Marketing/ProspectMap.tsx | 39; 342 | Cleanup adequado; atualização parcial/perdida de props, com mitigação por remontagem no pai |
| pages/Marketing/ProspectsTab.tsx | 436; 440; 445 | Loaders sem proteção contra concorrência; reset de página produz consulta intermediária |
| pages/SucessTotem/page.tsx | 10 | Cleanup adequado; intervalo recriado desnecessariamente |
| pages/TableVisitors/tableVisitors.controller.ts | 62 | Debounce de 300 ms com cleanup adequado |
| pages/TableVisitors/components/ModalEdit/index.tsx | 45; 49 | 45: vazio; 49: reset adequado, observar rascunhos |
| pages/UserManagement/components/UserFormModal.tsx | 104; 111 | 104: vazio; 111: reset por usuário/abertura adequado |

## Verificação e limites

- Contagem e extração dos efeitos pela AST do TypeScript, além de busca textual no projeto.
- ESLint em `src`: na execução examinada, 2 erros de imports não usados em `ProspectsTab.tsx` e 3 avisos de dependências instáveis de `useMemo` em `tableVisitors.controller.ts`. Nenhum aviso ativo de `useEffect`, mas **3 diagnósticos de efeitos suprimidos**: gráfico de conversões, conversão de despesa e montagem do mapa. Também há supressões de callbacks dos loaders de prospects. Esses números não substituem a análise comportamental.
- `npx tsc -b --pretty false` falhou: import não utilizado e duas referências a `useCallback` sem import em `ProspectsTab.tsx`. O arquivo foi alterado durante a auditoria; são resultados do estado local observado, sem atribuir origem às alterações.
- Quatro simulações locais extraindo callbacks reais e usando mocks confirmaram: handlers acumulados, novo fetch/estado em cada execução do prefill, navegação solicitada já no login e resposta antiga de CEP prevalecendo. São verificações isoladas, não testes de integração React/navegador nem acesso ao backend.
- Critérios de referência: [documentação oficial de useEffect](https://react.dev/reference/react/useEffect), especialmente dependências reativas, simetria de setup/cleanup e proteção contra respostas fora de ordem.
