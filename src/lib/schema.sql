-- =====================================================================
-- TEP — Esquema PostgreSQL / Supabase
-- Espelha src/types/crm.ts. Ao mudar um, mude o outro.
--
-- Convenções:
-- - Listas de valores usam text + CHECK (mais fácil de evoluir que ENUM).
-- - Dinheiro: numeric(12,2) em BRL. Quantidades: numeric(12,3) (cabos em metros).
-- - RLS ligado em todas as tabelas, sem políticas: nada fica exposto pela
--   API do Supabase até as políticas serem criadas (próxima spec).
-- =====================================================================

create extension if not exists pgcrypto; -- gen_random_uuid()

-- ---------------------------------------------------------------------
-- Utilitários
-- ---------------------------------------------------------------------

create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Etapas válidas de cada Kanban. Mesma ordem de PIPELINE_STAGES em crm.ts.
create or replace function is_valid_stage(p_modulo text, p_etapa text) returns boolean
language sql immutable as $$
  select case p_modulo
    when 'comercial' then p_etapa in (
      'solicitar_orcamento', 'apresentar_orcamento', 'follow_up_1',
      'solicitar_visita_tecnica', 'apresentar_relatorio', 'follow_up_2',
      'solicitar_faturamento', 'coletar_documentacao', 'confirmar_pagamento')
    when 'orcamentos' then p_etapa in (
      'elaborar_orcamento', 'verificar_informacoes', 'cotar_equipamento',
      'negociar_distribuidor', 'gerar_documentacao')
    when 'visita_tecnica' then p_etapa in (
      'agendar_visita', 'realizar_visita', 'elaborar_relatorio')
    when 'projetos' then p_etapa in (
      'criar_pasta', 'organizar_documentacao', 'elaborar_projeto', 'gerar_art_trt',
      'enviar_projeto', 'consultar_projeto', 'reenviar_projeto',
      'solicitar_vistoria', 'confirmar_vistoria')
    when 'instalacao' then p_etapa in (
      'agendado', 'em_andamento', 'concluido', 'pendente')
    when 'pos_vendas' then p_etapa in (
      'cadastrar_monitoramento', 'gerar_pasta_entrega', 'realizar_entrega',
      'lancar_financeiro', 'realizar_auditoria', 'apresentar_auditoria',
      'orcar_preventiva', 'solicitar_preventiva', 'orcar_corretiva', 'solicitar_corretiva')
    else false
  end;
$$;

-- ---------------------------------------------------------------------
-- Usuários  (Usuario)
-- No Supabase, `id` pode passar a referenciar auth.users(id).
-- ---------------------------------------------------------------------

create table usuarios (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  email       text not null unique,
  papel       text not null default 'colaborador'
              check (papel in ('admin', 'gestor', 'colaborador')),
  modulos     text[] not null default '{}'
              check (modulos <@ array[
                'comercial', 'orcamentos', 'visita_tecnica', 'projetos', 'instalacao',
                'pos_vendas', 'financeiro', 'estoque', 'relatorios', 'usuarios']::text[]),
  ativo       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Projetos  (Projeto) — entidade central
-- ---------------------------------------------------------------------

create table projetos (
  id                         uuid primary key default gen_random_uuid(),
  cliente_nome               text not null,
  cidade                     text not null,
  telefone                   text not null,
  potencia_inversor_kw       numeric(6,2) check (potencia_inversor_kw > 0),
  quantidade_modulos         integer check (quantidade_modulos > 0),
  tipo_fixacao               text check (tipo_fixacao in
                               ('metalico', 'colonial', 'fibrocimento', 'solo', 'laje')),
  data_pagamento_confirmado  timestamptz,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Kanban  (PipelineCard, StageTransition)
-- ---------------------------------------------------------------------

create table pipeline_cards (
  id              uuid primary key default gen_random_uuid(),
  modulo          text not null check (modulo in
                    ('comercial', 'orcamentos', 'visita_tecnica', 'projetos', 'instalacao', 'pos_vendas')),
  etapa           text not null,
  projeto_id      uuid not null references projetos(id) on delete cascade,
  responsavel_id  uuid references usuarios(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint pipeline_cards_etapa_valida check (is_valid_stage(modulo, etapa)),
  constraint pipeline_cards_um_por_modulo unique (projeto_id, modulo)
);

create index pipeline_cards_board_idx on pipeline_cards (modulo, etapa);

create table stage_transitions (
  id          uuid primary key default gen_random_uuid(),
  card_id     uuid not null references pipeline_cards(id) on delete cascade,
  modulo      text not null,
  de          text,
  para        text not null,
  usuario_id  uuid not null references usuarios(id),
  data        timestamptz not null default now(),
  constraint stage_transitions_de_valida   check (de is null or is_valid_stage(modulo, de)),
  constraint stage_transitions_para_valida check (is_valid_stage(modulo, para))
);

create index stage_transitions_card_idx on stage_transitions (card_id, data);

-- ---------------------------------------------------------------------
-- Instalação  (InstallationScheduleItem)
-- cliente_nome/cidade/telefone espelham a planilha de programação.
-- ---------------------------------------------------------------------

create table installation_schedule (
  id                 uuid primary key default gen_random_uuid(),
  projeto_id         uuid not null references projetos(id) on delete cascade,
  semana             text not null,               -- ex: '26/10 à 30/10'
  dia                text not null check (dia in ('SEG', 'TER', 'QUA', 'QUI', 'SEX')),
  prazo_dias         integer not null check (prazo_dias >= 0), -- dias corridos desde o pagamento
  cliente_nome       text not null,
  cidade             text not null,
  telefone           text not null,
  equipamento_local  text not null check (equipamento_local in ('deposito', 'cliente')),
  tipo_instalacao    text not null,               -- ex: '27 Metalico'
  status             text not null default 'agendado'
                     check (status in ('agendado', 'em_andamento', 'concluido', 'pendente')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index installation_schedule_semana_idx on installation_schedule (semana, dia);

-- ---------------------------------------------------------------------
-- Estoque  (StockItem)
-- ---------------------------------------------------------------------

create table stock_items (
  id                  uuid primary key default gen_random_uuid(),
  codigo              text not null unique,
  descricao           text not null,
  categoria           text not null check (categoria in
                        ('infraestrutura', 'aterramento', 'condutores', 'protecao', 'terminais', 'reposicao')),
  preco_atualizado    numeric(12,2) not null check (preco_atualizado >= 0),
  unidade             text not null,
  quantidade_estoque  numeric(12,3) not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  -- O prefixo do código precisa bater com a categoria (STOCK_CODE_PREFIX).
  constraint stock_items_prefixo_valido check (
    split_part(codigo, '.', 1) = case categoria
      when 'infraestrutura' then 'INFR'
      when 'condutores'     then 'COND'
      when 'protecao'       then 'PROT'
      when 'aterramento'    then 'ATER'
      when 'terminais'      then 'TERM'
      when 'reposicao'      then 'REPO'
    end)
);

-- ---------------------------------------------------------------------
-- BOM  (BOMItem)
-- custo_total é calculado pelo banco: nunca diverge de quantidade × custo.
-- ---------------------------------------------------------------------

create table bom_items (
  id              uuid primary key default gen_random_uuid(),
  projeto_id      uuid not null references projetos(id) on delete cascade,
  stock_item_id   uuid not null references stock_items(id) on delete restrict,
  base            text not null check (base in ('eletrica', 'mecanica')),
  quantidade      numeric(12,3) not null check (quantidade > 0),
  custo_unitario  numeric(12,2) not null check (custo_unitario >= 0), -- preço congelado
  custo_total     numeric(14,2) generated always as (round(quantidade * custo_unitario, 2)) stored,
  created_at      timestamptz not null default now(),
  constraint bom_items_item_unico unique (projeto_id, stock_item_id, base)
);

-- ---------------------------------------------------------------------
-- Financeiro  (FinancialRecord)
-- ---------------------------------------------------------------------

create table financial_records (
  id               uuid primary key default gen_random_uuid(),
  tipo             text not null check (tipo in
                     ('projeto_entrada', 'manutencao_entrada', 'comissao_saida', 'contas_pagar_saida')),
  valor            numeric(12,2) not null check (valor > 0),
  data_vencimento  date not null,
  data_pagamento   date,
  status           text not null default 'pendente'
                   check (status in ('pendente', 'pago', 'atrasado')),
  projeto_id       uuid references projetos(id) on delete restrict, -- null = conta geral
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- Pago se e somente se há data de pagamento.
  constraint financial_records_pagamento_consistente
    check ((status = 'pago') = (data_pagamento is not null))
);

create index financial_records_vencimento_idx on financial_records (status, data_vencimento);

-- ---------------------------------------------------------------------
-- Triggers de updated_at
-- ---------------------------------------------------------------------

create trigger usuarios_updated_at              before update on usuarios              for each row execute function set_updated_at();
create trigger projetos_updated_at              before update on projetos              for each row execute function set_updated_at();
create trigger pipeline_cards_updated_at        before update on pipeline_cards        for each row execute function set_updated_at();
create trigger installation_schedule_updated_at before update on installation_schedule for each row execute function set_updated_at();
create trigger stock_items_updated_at           before update on stock_items           for each row execute function set_updated_at();
create trigger financial_records_updated_at     before update on financial_records     for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- Row Level Security (políticas na próxima spec)
-- ---------------------------------------------------------------------

alter table usuarios              enable row level security;
alter table projetos              enable row level security;
alter table pipeline_cards        enable row level security;
alter table stage_transitions     enable row level security;
alter table installation_schedule enable row level security;
alter table stock_items           enable row level security;
alter table bom_items             enable row level security;
alter table financial_records     enable row level security;
