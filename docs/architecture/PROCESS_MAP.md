# Mapa de Processos — TEP

CRM/ERP de Energia Solar da Elios. Este documento descreve os 10 módulos, o fluxo de ponta a ponta e a regra de integração Orçamentos ↔ Estoque.

Tipos de referência: [src/types/crm.ts](../../src/types/crm.ts).

## 1. Visão geral dos módulos

| Módulo (`ModuleArea`) | Pasta | Responsabilidade | Visão |
|---|---|---|---|
| `comercial` | `src/modules/comercial` | Entrada do lead até a confirmação do pagamento | Kanban (`ComercialStage`, 9 etapas) |
| `orcamentos` | `src/modules/orcamentos` | Dimensionamento, cotação e proposta, com BOM de materiais | Kanban (`OrcamentoStage`, 5 etapas) |
| `visita_tecnica` | `src/modules/visita-tecnica` | Agendamento, vistoria no local e relatório técnico | Kanban (`VisitaTecnicaStage`, 3 etapas) |
| `projetos` | `src/modules/projetos` | Engenharia, ART/TRT e homologação na concessionária | Kanban (`ProjetoStage`, 9 etapas) |
| `instalacao` | `src/modules/instalacao` | Programação semanal das equipes de obra | Grade semanal SEG–SEX (`InstallationScheduleItem`) |
| `pos_vendas` | `src/modules/pos-vendas` | Monitoramento, entrega, auditoria e O&M | Kanban (`PosVendaStage`, 10 etapas) |
| `financeiro` | `src/modules/financeiro` | Entradas (projeto, manutenção) e saídas (comissão, contas a pagar) | Lista (`FinancialRecord`) |
| `estoque` | `src/modules/estoque` | Cadastro e saldo de materiais de instalação | Lista (`StockItem`) |
| `relatorios` | `src/modules/relatorios` | Indicadores consolidados de todos os módulos | Somente leitura |
| `usuarios` | `src/modules/usuarios` | Usuários, papéis e permissões por módulo | Lista |

O **projeto** (`Projeto`, tabela `projetos`) é a entidade que atravessa todos os módulos. Cada módulo com pipeline guarda um card (`PipelineCard<M>`) ligado ao mesmo `projeto_id`. Esquema do banco: [src/lib/schema.sql](../../src/lib/schema.sql).

## 2. Fluxo operacional de ponta a ponta

```text
LEAD
 │
 ▼
COMERCIAL ── solicitar_orcamento ──────────────► ORÇAMENTOS
 │                                                elaborar_orcamento → verificar_informacoes
 │                                                → cotar_equipamento → negociar_distribuidor
 │                                                → gerar_documentacao  (BOM gerado aqui)
 │◄──────────────────────────── proposta pronta ─┘
 ├─ apresentar_orcamento → follow_up_1
 │
 ├─ solicitar_visita_tecnica ──────────────────► VISITA TÉCNICA
 │                                                agendar_visita → realizar_visita
 │                                                → elaborar_relatorio
 │◄───────────────────────────── relatório pronto ┘
 ├─ apresentar_relatorio → follow_up_2
 ├─ solicitar_faturamento
 ├─ coletar_documentacao
 └─ confirmar_pagamento ──┬────────────────────► FINANCEIRO (contas a receber: projeto_entrada)
                          ▼
PROJETOS  criar_pasta → organizar_documentacao → elaborar_projeto → gerar_art_trt
          → enviar_projeto → consultar_projeto ─┬─ parecer DEFERIDO ─► (segue)
                                                └─ indeferido ─► reenviar_projeto → consultar_projeto
          │
          ▼  (parecer de acesso deferido + materiais disponíveis no estoque)
INSTALAÇÃO  Programação Semanal: agendado → em_andamento → concluido   (pendente = bloqueio)
          │   baixa no ESTOQUE conforme o BOM
          ▼  (montagem mecânica e elétrica concluída)
PROJETOS  solicitar_vistoria → confirmar_vistoria   (VISTORIA + troca do medidor bidirecional)
          │
          ▼  (vistoria confirmada = usina homologada)
PÓS-VENDA cadastrar_monitoramento → gerar_pasta_entrega → realizar_entrega (entrega técnica)
          → lancar_financeiro ─────────────────► FINANCEIRO (quitação final + libera comissao_saida)
          → realizar_auditoria → apresentar_auditoria
          │
          └─ O&M (recorrente)
             orcar_preventiva → solicitar_preventiva ─► FINANCEIRO (manutencao_entrada)
             orcar_corretiva  → solicitar_corretiva  ─► FINANCEIRO (manutencao_entrada)
```

### Gatilhos automáticos entre módulos (validados)

| # | Origem → Destino | Evento | Efeito |
|---|---|---|---|
| 1 | Comercial → Orçamentos | Ação `solicitar_orcamento` | Cria o registro de proposta em `elaborar_orcamento` |
| 2 | Orçamentos → Comercial | Proposta concluída (`gerar_documentacao` finalizada) | Move o lead para `apresentar_orcamento` e inicia a régua de follow-up (`follow_up_1`) |
| 3 | Comercial → Visita Técnica | Ação `solicitar_visita_tecnica` | Cria a ordem de visita em `agendar_visita` |
| 4 | Visita Técnica → Comercial | Relatório concluído (`elaborar_relatorio` finalizada) | Move o lead para `apresentar_relatorio` e em seguida `follow_up_2` |
| 5 | Comercial → Projetos + Financeiro | Ação `confirmar_pagamento` | Cria o projeto de engenharia em `criar_pasta`, gera a entrada `projeto_entrada` no contas a receber e grava `Projeto.data_pagamento_confirmado` (início do `prazo_dias`) |
| 6 | Projetos → Instalação | `consultar_projeto` com parecer de acesso **DEFERIDO** pela concessionária **e** materiais do BOM disponíveis no estoque | Libera a montagem em campo: cria o registro na Programação Semanal (`InstallationScheduleItem`, status `agendado`) |
| 7 | Instalação → Projetos (Vistoria) | Status `concluido` (montagem mecânica e elétrica concluída) | Move o projeto para `solicitar_vistoria` junto à concessionária e dá baixa do BOM no estoque |
| 8 | Vistoria → Pós-Venda + Financeiro | `confirmar_vistoria` (troca efetiva do medidor bidirecional pela distribuidora) | Libera a usina para `cadastrar_monitoramento`, entrega técnica (`gerar_pasta_entrega` → `realizar_entrega`) e quitação final; libera a comissão (`comissao_saida`) no Financeiro |

> Correção validada pela engenharia (SPEC-002): a vistoria da concessionária acontece **depois** da montagem, não antes.

Eventos internos (sem gatilho automático): Pós-Venda `solicitar_preventiva` / `solicitar_corretiva` geram `manutencao_entrada` manualmente no Financeiro.

## 3. Integração Orçamentos ↔ Estoque (BOM dinâmico)

O catálogo de materiais de instalação tem **96 itens** de infraestrutura (`StockItem`), com código por categoria:

| Prefixo | Categoria (`StockCategory`) | Exemplos |
|---|---|---|
| `INFR.*` | `infraestrutura` | eletrodutos, curvas, conduletes |
| `COND.*` | `condutores` | cabos solares e flexíveis |
| `PROT.*` | `protecao` | DPS, disjuntores |
| `ATER.*` | `aterramento` | hastes, conectores |
| `TERM.*` | `terminais` | ilhós, bimetálicos |
| `REPO.*` | `reposicao` | fitas, massas, vedacalha |

Todos os prefixos estão homologados conforme as planilhas da Elios (constante `STOCK_CODE_PREFIX`).

### Composição do BOM

O BOM tem duas bases, registradas em `BOMItem.base`:

| Base | Entrada (`Projeto`) | Itens definidos |
|---|---|---|
| **Elétrica** (`eletrica`) | `potencia_inversor_kw` (ex: 3k, 5k, 8k) | Calibre dos cabos (COND), disjuntores e DPS (PROT), diâmetro de eletrodutos e conduletes (INFR), conforme a tabela da Elios |
| **Mecânica** (`mecanica`) | `tipo_fixacao` (`metalico`, `colonial`, `fibrocimento`, `solo`, `laje`) + `quantidade_modulos` | Trilhos, grampos intermediários e finais, parafusos e ganchos |

> A tabela de potência → materiais e a de fixação × módulos → materiais ainda precisam ser cadastradas (ver SPEC-001, pendências).

### Tipo de instalação e prazo

- `tipo_instalacao` segue o padrão `<qtd. de módulos> <estrutura de fixação>`, ex: `27 Metalico`, `12 Colonial`. É o resumo visual da base mecânica.
- `prazo_dias` conta **dias corridos** desde a confirmação do pagamento (Comercial → `confirmar_pagamento`) até a conclusão do projeto.

### Regras

1. **Geração.** Na etapa `cotar_equipamento`, o orçamento monta a lista de `BOMItem` a partir do catálogo, somando a base elétrica e a base mecânica descritas acima.
2. **Preço congelado.** `custo_unitario` recebe o `preco_atualizado` do `StockItem` no momento da geração. Mudanças de preço posteriores no estoque **não** alteram orçamentos já gerados.
3. **Total.** `custo_total = quantidade × custo_unitario`, arredondado a 2 casas (`calcBOMItemTotal`). O total do BOM é a soma dos itens (`calcBOMTotal`).
4. **Integridade.** Todo `BOMItem.stock_item_id` precisa existir no catálogo. Quantidade deve ser > 0.
5. **Disponibilidade.** Ao agendar a instalação, o sistema compara o BOM com `quantidade_estoque` e sinaliza faltas.
6. **Baixa.** Quando a instalação vai para `concluido`, as quantidades do BOM são debitadas de `quantidade_estoque`.
7. **Recotação.** Se o orçamento voltar para `cotar_equipamento`, o BOM é regerado com os preços atuais.
