

## Refinamento do Dashboard Analítico

### 1. Remover BG Switcher
- Excluir `src/components/BgSwitcher.tsx` e arquivos de backgrounds não usados (`AnimatedGridPattern`, `Vortex`, `Spotlight`, `DotBackground`).
- Manter apenas `DotSpotlight` como fundo fixo global.
- Remover estado `bg` e import correspondente em `Index.tsx`.

### 2. Exibir Dashboard só após “Parar coleta”
- Em `Index.tsx`, condicionar a seção do dashboard a `done === true`.
- Antes da primeira coleta concluída, mostrar uma faixa minimalista com texto tipo *“Inicie uma coleta para visualizar o painel analítico”*.
- Ao clicar em **Parar**, `done` vira `true` → dashboard aparece com `animate-fade-in`.

### 3. Barra de filtros e ordenação global do dashboard
Novo componente `src/components/dashboard/DashboardControls.tsx` posicionado no topo da seção do dashboard. Estilo minimalista (chips/segmented + select sutil), tudo controlado por estado em `Index.tsx` e propagado via Context (`DashboardFiltersContext`) para os filhos (KPIs, Heatmap, OperatorList, “Em Ataque”).

Filtros:
- **IX**: Todos · IX Maranhão · IX Ceará (segmented)
- **Status**: Todos · Em ataque · Normal · Sem mitigação (chips multi-toggle)
- **Busca**: input compacto por nome de operadora/ASN

Ordenação (select minimalista):
- Nome (A→Z / Z→A)
- Prefixos /24 (↑/↓)
- Mitigação % (↑/↓)
- Status (criticidade)

Os dados filtrados/ordenados ficam em `useMemo` derivado de `operators` e são consumidos por todos os blocos.

### 4. KPI “Em Ataque” mostrando suspeitas
Refatorar o card no `Index.tsx`:
- Listar até 3 operadoras com `status === "attack"` (nome + IX + % mitigação) em fonte pequena.
- Linha extra “+N outras” quando exceder 3.
- Usar tons `status-attack` discretos.

### 5. Tabela de Operadoras
Atualizar `OperatorList.tsx`:
- Adicionar **cabeçalho** com colunas: Operadora · ASNs · /24 · Mitigação · Status (acompanhando o grid atual).
- Indicador visual de ordenação ativa (seta ao lado da coluna usada no controle global).
- Coluna **Prefixos /24** já existe — reforçar com label “/24” no header e formatação `tabular-nums`.
- Lista renderiza `filteredOperators` vindo do contexto.
- Rodapé com contagem “X de Y operadoras”.

### 6. Heatmap com paginação + filtros
Atualizar `TimelineHeatmap.tsx`:
- Substituir `timelineData` estático por uma função `buildTimeline(operators)` em `mockData.ts` que gera 24h por operadora dada.
- Receber `filteredOperators` do contexto.
- **Paginação**: 6 linhas por página, com controles `‹ Página 1/N ›` no header (à direita, ao lado da legenda).
- A ordenação global afeta a ordem das linhas exibidas.
- Corrigir warning React (substituir `<>` dentro do `.map` por `<Fragment key>`).

### 7. Estrutura de arquivos
- **Novo**: `src/components/dashboard/DashboardControls.tsx`, `src/context/DashboardFiltersContext.tsx`
- **Editado**: `Index.tsx`, `OperatorList.tsx`, `TimelineHeatmap.tsx`, `mockData.ts` (export `buildTimeline`)
- **Removido**: `BgSwitcher.tsx`, `AnimatedGridPattern.tsx`, `Vortex.tsx`, `Spotlight.tsx`, `DotBackground.tsx`

### Notas técnicas
- Tudo segue tokens semânticos (`--primary`, `--status-*`, `--muted-foreground`).
- Animações leves: `animate-fade-in` no dashboard ao surgir, `transition-colors` nos chips.
- Sem novas dependências.

