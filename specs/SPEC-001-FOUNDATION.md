# SPEC-001 — Fundação do repositório

**Status:** CONCLUDED
**Aberta:** 2026-11-02 · **Concluída:** 2026-11-02
**Typecheck:** ✅ `npx tsc --noEmit` — 0 erros (TypeScript 7.0.2, Node.js 26.13.0)

## Objetivo

Criar a estrutura base do TEP: pastas, ambiente TypeScript estrito, mapa de processos, tipos dos 10 módulos e esquema do banco.

## Checklist de arquivos

### Estrutura de pastas
- [x] `docs/architecture/`
- [x] `specs/`
- [x] `src/types/`
- [x] `src/lib/`
- [x] `src/modules/` — `comercial`, `orcamentos`, `visita-tecnica`, `projetos`, `instalacao`, `pos-vendas`, `financeiro`, `estoque`, `relatorios`, `usuarios`
- [x] `.gitkeep` em cada pasta vazia

### Ambiente
- [x] Node.js LTS 26.13.0 instalado via winget
- [x] `package.json` (`npm init -y`, `private: true`, script `typecheck`)
- [x] `typescript` e `@types/node` como devDependencies
- [x] `tsconfig.json` — `strict`, `target: ES2022`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noEmit`

### `src/types/crm.ts`
- [x] `ModuleArea` (10 módulos)
- [x] `ComercialStage` (9), `OrcamentoStage` (5), `VisitaTecnicaStage` (3), `ProjetoStage` (9), `PosVendaStage` (10)
- [x] `InstallationScheduleItem` + `DiaSemana`, `EquipamentoLocal`, `InstallationStatus`
- [x] `StockItem`, `StockCategory`, `STOCK_CODE_PREFIX`, `BOMItem`, `BOMBase`
- [x] `FinancialEntryType`, `FinancialStatus`, `FinancialRecord`
- [x] `Projeto` (entidade central), `TipoFixacao`, `Usuario`, `UserRole`
- [x] Kanban genérico: `StageByModule`, `PIPELINE_STAGES`, `PipelineCard<M>`, `StageTransition<M>`
- [x] Helpers: `calcBOMItemTotal`, `calcBOMTotal`, `isStageOf`

### Documentação e banco
- [x] `docs/architecture/PROCESS_MAP.md` — módulos, fluxo ponta a ponta, 7 gatilhos validados, composição do BOM
- [x] `src/lib/schema.sql` — 8 tabelas PostgreSQL/Supabase
- [x] `specs/SPEC-001-FOUNDATION.md`

## Critérios de aceite

### Tipagem
| # | Critério | Resultado |
|---|---|---|
| 1 | Nenhum `any` em `src/types/` | ✅ |
| 2 | Compila com `strict` + `noUncheckedIndexedAccess` | ✅ 0 erros |
| 3 | Uniões de etapas derivadas de listas `as const` (ordem = colunas do Kanban) | ✅ |
| 4 | `PipelineCard<'comercial'>` recusa etapa de outro módulo | ✅ testado: `'criar_pasta'` em Comercial dá erro TS2322 |
| 5 | Categoria de estoque fora da lista é recusada | ✅ testado: `'paineis'` dá erro TS2322 |
| 6 | Campos nulos usam `\| null`, nunca `?` | ✅ |

### Integridade (garantida no banco por `schema.sql`)
| # | Regra | Como |
|---|---|---|
| 1 | `custo_total = quantidade × custo_unitario` | Coluna gerada (`generated always as`) |
| 2 | `bom_items.stock_item_id` existe no catálogo | FK com `on delete restrict` |
| 3 | `data_pagamento` preenchida se e somente se `status = 'pago'` | CHECK `financial_records_pagamento_consistente` |
| 4 | `stock_items.codigo` único e com prefixo da categoria | UNIQUE + CHECK `stock_items_prefixo_valido` |
| 5 | Etapa do card pertence ao módulo | CHECK com `is_valid_stage(modulo, etapa)` |
| 6 | Um card por projeto em cada módulo | UNIQUE `(projeto_id, modulo)` |

## Decisões tomadas

- **`Projeto`** virou a entidade central (tabela `projetos`), com cliente, potência do inversor, quantidade de módulos, tipo de fixação e data do pagamento confirmado.
- **`PipelineCard.cliente_nome`** foi removido: o nome vem do projeto, para não ter duas cópias.
- **`InstallationScheduleItem`** ganhou `projeto_id`. Mantém `cliente_nome`, `cidade` e `telefone` para espelhar a planilha de programação.
- **`BOMItem`** ganhou `id`, `projeto_id` e `base` (`eletrica` / `mecanica`).
- **`StockItem.id`** existe porque `BOMItem.stock_item_id` precisa de uma chave.
- **`FinancialRecord.projeto_id`** aceita `null` (contas a pagar gerais).
- **Valores fixos** no banco usam `text` + `CHECK` em vez de `ENUM`, para facilitar mudanças.
- **RLS** está ligado em todas as tabelas, sem políticas. Até a próxima spec, nada fica exposto pela API do Supabase.
- Regras validadas: prefixos `INFR`, `COND`, `PROT`, `ATER`, `TERM`, `REPO`; `tipo_instalacao` = módulos + fixação; `prazo_dias` = dias corridos desde o pagamento.

## Pendências para as próximas specs

- [ ] Rodar `schema.sql` num Postgres/Supabase real. Não foi executado: não há Postgres nesta máquina.
- [ ] Definir o `papel` dos usuários (`admin`, `gestor`, `colaborador` é proposta) e as políticas de RLS.
- [ ] Cadastrar as tabelas do BOM: potência do inversor → materiais elétricos; fixação × nº de módulos → materiais mecânicos.
- [ ] Importar os 96 itens do catálogo de estoque.
- [ ] Implementar os 7 gatilhos automáticos do PROCESS_MAP.
