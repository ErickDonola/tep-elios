/**
 * TEP — Tipos de domínio do CRM/ERP de Energia Solar da Elios.
 *
 * Cada pipeline é definido primeiro como uma lista ordenada (`as const`)
 * e o tipo de união é derivado dela. Assim a ordem das colunas do Kanban
 * e o tipo nunca ficam fora de sincronia.
 *
 * Convenções:
 * - Datas são strings ISO 8601 (ex: '2026-11-02').
 * - Valores monetários são `number` em reais (BRL).
 * - Campos opcionais de negócio usam `| null`, não `undefined`.
 */

/* ------------------------------------------------------------------ */
/* Base                                                               */
/* ------------------------------------------------------------------ */

/** Data no formato ISO 8601 (ex: '2026-11-02' ou '2026-11-02T14:30:00Z'). */
export type ISODateString = string;

export interface BaseEntity {
  id: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/* ------------------------------------------------------------------ */
/* Módulos                                                            */
/* ------------------------------------------------------------------ */

export const MODULE_AREAS = [
  'comercial',
  'orcamentos',
  'visita_tecnica',
  'projetos',
  'instalacao',
  'pos_vendas',
  'financeiro',
  'estoque',
  'relatorios',
  'usuarios',
] as const;

export type ModuleArea = (typeof MODULE_AREAS)[number];

/* ------------------------------------------------------------------ */
/* Usuários                                                           */
/* ------------------------------------------------------------------ */

export const USER_ROLES = ['admin', 'gestor', 'colaborador'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface Usuario extends BaseEntity {
  nome: string;
  email: string;
  papel: UserRole;
  /** Módulos que o usuário pode acessar. */
  modulos: ModuleArea[];
  ativo: boolean;
}

/* ------------------------------------------------------------------ */
/* Projeto (entidade central)                                         */
/* ------------------------------------------------------------------ */

export const TIPOS_FIXACAO = [
  'metalico',
  'colonial',
  'fibrocimento',
  'solo',
  'laje',
] as const;

export type TipoFixacao = (typeof TIPOS_FIXACAO)[number];

/**
 * O negócio que atravessa todos os módulos, do lead ao O&M.
 * Os dados técnicos alimentam a regra do BOM:
 * - base elétrica  ← `potencia_inversor_kw`
 * - base mecânica ← `tipo_fixacao` + `quantidade_modulos`
 */
export interface Projeto extends BaseEntity {
  cliente_nome: string;
  cidade: string;
  telefone: string;
  /** Ex: 3, 5, 8 (kW). `null` até o dimensionamento. */
  potencia_inversor_kw: number | null;
  quantidade_modulos: number | null;
  tipo_fixacao: TipoFixacao | null;
  /** Início da contagem de `prazo_dias`. */
  data_pagamento_confirmado: ISODateString | null;
}

/* ------------------------------------------------------------------ */
/* Comercial                                                          */
/* ------------------------------------------------------------------ */

export const COMERCIAL_STAGES = [
  'solicitar_orcamento',
  'apresentar_orcamento',
  'follow_up_1',
  'solicitar_visita_tecnica',
  'apresentar_relatorio',
  'follow_up_2',
  'solicitar_faturamento',
  'coletar_documentacao',
  'confirmar_pagamento',
] as const;

export type ComercialStage = (typeof COMERCIAL_STAGES)[number];

/* ------------------------------------------------------------------ */
/* Orçamentos                                                         */
/* ------------------------------------------------------------------ */

export const ORCAMENTO_STAGES = [
  'elaborar_orcamento',
  'verificar_informacoes',
  'cotar_equipamento',
  'negociar_distribuidor',
  'gerar_documentacao',
] as const;

export type OrcamentoStage = (typeof ORCAMENTO_STAGES)[number];

/* ------------------------------------------------------------------ */
/* Visita Técnica                                                     */
/* ------------------------------------------------------------------ */

export const VISITA_TECNICA_STAGES = [
  'agendar_visita',
  'realizar_visita',
  'elaborar_relatorio',
] as const;

export type VisitaTecnicaStage = (typeof VISITA_TECNICA_STAGES)[number];

/* ------------------------------------------------------------------ */
/* Projetos (Engenharia e Homologação)                                */
/* ------------------------------------------------------------------ */

export const PROJETO_STAGES = [
  'criar_pasta',
  'organizar_documentacao',
  'elaborar_projeto',
  'gerar_art_trt',
  'enviar_projeto',
  'consultar_projeto',
  'reenviar_projeto',
  'solicitar_vistoria',
  'confirmar_vistoria',
] as const;

export type ProjetoStage = (typeof PROJETO_STAGES)[number];

/* ------------------------------------------------------------------ */
/* Instalação (Programação Operacional)                               */
/* ------------------------------------------------------------------ */

export const DIAS_SEMANA = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'] as const;
export type DiaSemana = (typeof DIAS_SEMANA)[number];

export type EquipamentoLocal = 'deposito' | 'cliente';

export const INSTALLATION_STATUSES = [
  'agendado',
  'em_andamento',
  'concluido',
  'pendente',
] as const;

export type InstallationStatus = (typeof INSTALLATION_STATUSES)[number];

export interface InstallationScheduleItem {
  id: string;
  projeto_id: string;
  /** Faixa da semana, ex: '26/10 à 30/10'. */
  semana: string;
  dia: DiaSemana;
  /** Dias corridos desde a confirmação do pagamento até a conclusão do projeto. */
  prazo_dias: number;
  cliente_nome: string;
  cidade: string;
  telefone: string;
  equipamento_local: EquipamentoLocal;
  /** Quantidade de módulos + estrutura de fixação do telhado, ex: '27 Metalico', '12 Colonial'. */
  tipo_instalacao: string;
  status: InstallationStatus;
}

/* ------------------------------------------------------------------ */
/* Pós-Venda                                                          */
/* ------------------------------------------------------------------ */

export const POS_VENDA_STAGES = [
  'cadastrar_monitoramento',
  'gerar_pasta_entrega',
  'realizar_entrega',
  'lancar_financeiro',
  'realizar_auditoria',
  'apresentar_auditoria',
  'orcar_preventiva',
  'solicitar_preventiva',
  'orcar_corretiva',
  'solicitar_corretiva',
] as const;

export type PosVendaStage = (typeof POS_VENDA_STAGES)[number];

/* ------------------------------------------------------------------ */
/* Estoque & Materiais de Instalação (BOM)                            */
/* ------------------------------------------------------------------ */

export const STOCK_CATEGORIES = [
  'infraestrutura',
  'aterramento',
  'condutores',
  'protecao',
  'terminais',
  'reposicao',
] as const;

export type StockCategory = (typeof STOCK_CATEGORIES)[number];

/** Prefixo do código de cada categoria (homologado nas planilhas da Elios). */
export const STOCK_CODE_PREFIX: { readonly [C in StockCategory]: string } = {
  infraestrutura: 'INFR', // eletrodutos, curvas, conduletes
  condutores: 'COND', // cabos solares e flexíveis
  protecao: 'PROT', // DPS, disjuntores
  aterramento: 'ATER', // hastes, conectores
  terminais: 'TERM', // ilhós, bimetálicos
  reposicao: 'REPO', // fitas, massas, vedacalha
};

export interface StockItem {
  /** Chave interna. Referenciada por `BOMItem.stock_item_id`. */
  id: string;
  /** Código da planilha, ex: 'INFR.101', 'COND.201', 'PROT.101'. */
  codigo: string;
  descricao: string;
  categoria: StockCategory;
  preco_atualizado: number;
  unidade: string;
  quantidade_estoque: number;
}

/** Origem do item no BOM (ver regra de composição em PROCESS_MAP.md). */
export type BOMBase = 'eletrica' | 'mecanica';

export interface BOMItem {
  id: string;
  projeto_id: string;
  stock_item_id: string;
  base: BOMBase;
  quantidade: number;
  /** Preço do item no momento do orçamento (congelado). */
  custo_unitario: number;
  /** Sempre igual a `quantidade * custo_unitario`. Use `calcBOMItemTotal`. */
  custo_total: number;
}

/* ------------------------------------------------------------------ */
/* Financeiro                                                         */
/* ------------------------------------------------------------------ */

export const FINANCIAL_ENTRY_TYPES = [
  'projeto_entrada',
  'manutencao_entrada',
  'comissao_saida',
  'contas_pagar_saida',
] as const;

export type FinancialEntryType = (typeof FINANCIAL_ENTRY_TYPES)[number];

export type FinancialStatus = 'pendente' | 'pago' | 'atrasado';

export interface FinancialRecord {
  id: string;
  tipo: FinancialEntryType;
  valor: number;
  data_vencimento: ISODateString;
  /** `null` enquanto não pago. */
  data_pagamento: ISODateString | null;
  status: FinancialStatus;
  /** `null` para lançamentos sem projeto (ex: contas a pagar gerais). */
  projeto_id: string | null;
}

/* ------------------------------------------------------------------ */
/* Kanban genérico                                                    */
/* ------------------------------------------------------------------ */

/** Mapa de cada módulo com pipeline para o seu tipo de etapa. */
export interface StageByModule {
  comercial: ComercialStage;
  orcamentos: OrcamentoStage;
  visita_tecnica: VisitaTecnicaStage;
  projetos: ProjetoStage;
  instalacao: InstallationStatus;
  pos_vendas: PosVendaStage;
}

export type PipelineModule = keyof StageByModule;

/** Ordem das colunas de cada Kanban. */
export const PIPELINE_STAGES: { readonly [M in PipelineModule]: readonly StageByModule[M][] } = {
  comercial: COMERCIAL_STAGES,
  orcamentos: ORCAMENTO_STAGES,
  visita_tecnica: VISITA_TECNICA_STAGES,
  projetos: PROJETO_STAGES,
  instalacao: INSTALLATION_STATUSES,
  pos_vendas: POS_VENDA_STAGES,
};

/** Um card no Kanban de um módulo. A etapa é tipada pelo módulo. */
export interface PipelineCard<M extends PipelineModule> extends BaseEntity {
  modulo: M;
  etapa: StageByModule[M];
  /** Projeto/negócio que atravessa todos os módulos (dados do cliente ficam lá). */
  projeto_id: string;
  responsavel_id: string | null;
}

/** Registro de movimentação entre etapas (histórico/auditoria). */
export interface StageTransition<M extends PipelineModule> {
  card_id: string;
  modulo: M;
  de: StageByModule[M] | null;
  para: StageByModule[M];
  usuario_id: string;
  data: ISODateString;
}

/* ------------------------------------------------------------------ */
/* Helpers puros                                                      */
/* ------------------------------------------------------------------ */

export function calcBOMItemTotal(quantidade: number, custo_unitario: number): number {
  return Math.round(quantidade * custo_unitario * 100) / 100;
}

export function calcBOMTotal(items: readonly BOMItem[]): number {
  return Math.round(items.reduce((sum, i) => sum + i.custo_total, 0) * 100) / 100;
}

export function isStageOf<M extends PipelineModule>(
  modulo: M,
  value: string,
): value is StageByModule[M] {
  return (PIPELINE_STAGES[modulo] as readonly string[]).includes(value);
}
