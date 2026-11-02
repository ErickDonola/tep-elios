/**
 * TEP — Calculadora do BOM (Base Elétrica + Base Mecânica).
 *
 * IMPORTANTE — o que é real e o que é estimativa:
 *
 * BASE ELÉTRICA (3kW): validada. Vem da planilha real
 * "Elios_Custo material de instalação.xlsx", aba "CUSTO POR INV", que lista
 * a cesta exata do inversor de 3kW: 22 itens, total R$ 766,04 (a planilha
 * mostra R$ 766,03525, arredondado a 2 casas = R$ 766,04).
 *
 * BASE ELÉTRICA (5kW, 8kW): ESTIMATIVA. A planilha só tem a aba do
 * inversor de 3kW. Para as outras potências, os itens contínuos (cabos,
 * medidos em metro) são escalados proporcionalmente à potência; os itens
 * discretos (disjuntor, DPS, quadro) são mantidos na mesma quantidade,
 * porque uma potência maior pode exigir um item de capacidade diferente
 * (ex: disjuntor de corrente maior), o que esta função não decide por
 * conta própria. Precisa da tabela real da Elios para 5kW e 8kW.
 *
 * BASE MECÂNICA (estrutura de fixação): NÃO VALIDADA. Nenhuma das duas
 * planilhas fornecidas tem uma tabela de trilhos/grampos/parafusos/ganchos
 * por tipo de estrutura, e o catálogo de 96 itens do estoque (stock-seed.ts)
 * não tem nenhum item desse tipo cadastrado (ele cobre só infraestrutura,
 * aterramento, condutores, proteção, terminais e reposição). Por isso esta
 * função calcula as QUANTIDADES com uma fórmula padrão do setor (comentada
 * item a item), mas não gera `BOMItem` com preço: não existe `stock_item_id`
 * real para esses materiais ainda. Assim que a Elios cadastrar os itens de
 * estrutura no estoque (com um prefixo próprio, ex: `ESTR.*`), esta função
 * pode ser estendida para precificá-los.
 */

import type { TipoFixacao, BOMItem } from '../types/crm.js';
import { getStockItemByCode } from './stock-seed.js';

/** Item do BOM antes de existir um projeto (sem `id`/`projeto_id`, atribuídos na persistência). */
export type ComposedBOMItem = Omit<BOMItem, 'id' | 'projeto_id'>;

export interface MechanicalQuantities {
  trilhos_m: number;
  grampos_intermediarios: number;
  grampos_finais: number;
  parafusos: number;
  ganchos: number;
}

export interface BOMCalculationResult {
  eletrica: ComposedBOMItem[];
  /** Quantidades da estrutura mecânica. Sem preço — ver aviso em `warnings`. */
  mecanica: MechanicalQuantities;
  custo_total_eletrica: number;
  warnings: string[];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function toComposedItem(codigo: string, quantidade: number, base: ComposedBOMItem['base']): ComposedBOMItem {
  const stock = getStockItemByCode(codigo);
  const custo_unitario = stock.preco_atualizado;
  return {
    stock_item_id: stock.id,
    base,
    quantidade,
    custo_unitario,
    custo_total: round2(quantidade * custo_unitario),
  };
}

/**
 * Cesta elétrica validada do inversor de 3kW (22 itens, R$ 766,04).
 * Fonte: "Elios_Custo material de instalação.xlsx", aba "CUSTO POR INV".
 */
const ELECTRICAL_BASKET_3KW: ReadonlyArray<{ codigo: string; quantidade: number }> = [
  { codigo: 'INFR.101', quantidade: 3 },
  { codigo: 'INFR.104', quantidade: 3 },
  { codigo: 'INFR.107', quantidade: 25 },
  { codigo: 'INFR.110', quantidade: 5 },
  { codigo: 'INFR.113', quantidade: 5 },
  { codigo: 'INFR.116', quantidade: 10 },
  { codigo: 'INFR.119', quantidade: 15 },
  { codigo: 'INFR.301', quantidade: 1 },
  { codigo: 'INFR.401', quantidade: 1 },
  { codigo: 'ATER.101', quantidade: 1 },
  { codigo: 'ATER.102', quantidade: 1 },
  { codigo: 'ATER.103', quantidade: 1 },
  { codigo: 'COND.101', quantidade: 2 },
  { codigo: 'COND.201', quantidade: 50 },
  { codigo: 'PROT.101', quantidade: 1 },
  { codigo: 'PROT.401', quantidade: 2 },
  { codigo: 'TERM.101', quantidade: 20 },
  { codigo: 'TERM.301', quantidade: 4 },
  { codigo: 'TERM.501', quantidade: 1 },
  { codigo: 'TERM.502', quantidade: 2 },
  { codigo: 'REPO.101', quantidade: 20 },
  { codigo: 'REPO.102', quantidade: 20 },
  { codigo: 'REPO.201', quantidade: 1 },
  { codigo: 'REPO.202', quantidade: 1 },
  { codigo: 'REPO.301', quantidade: 0.4 },
  { codigo: 'REPO.302', quantidade: 0.5 },
  { codigo: 'REPO.401', quantidade: 0.5 },
  { codigo: 'REPO.402', quantidade: 0.2 },
];

/** Tiers de inversor com cesta própria. Só 3 vem de dado real; os demais escalam o de 3kW. */
const VALIDATED_TIERS_KW = [3] as const;

/** Itens contínuos (cabo), onde escalar por potência faz sentido. Os demais (discretos) não escalam. */
const SCALABLE_BY_POWER_CODES = new Set(['COND.101', 'COND.201']);

function buildElectricalBasket(inverterPowerKw: number, warnings: string[]): ComposedBOMItem[] {
  const isValidated = (VALIDATED_TIERS_KW as readonly number[]).includes(inverterPowerKw);
  if (!isValidated) {
    warnings.push(
      `Base elétrica para ${inverterPowerKw}kW é uma ESTIMATIVA escalada a partir da cesta validada de 3kW ` +
      `(só cabos são escalados; disjuntor, DPS e quadro ficam na mesma quantidade). ` +
      `Peça à Elios a tabela real de ${inverterPowerKw}kW antes de usar em orçamento.`,
    );
  }

  const factor = inverterPowerKw / 3;
  return ELECTRICAL_BASKET_3KW.map(({ codigo, quantidade }) => {
    const qtd = isValidated || !SCALABLE_BY_POWER_CODES.has(codigo)
      ? quantidade
      : round2(quantidade * factor);
    return toComposedItem(codigo, qtd, 'eletrica');
  });
}

/**
 * Fórmulas padrão do setor para estrutura de fixação (NÃO validadas pela Elios).
 * Trilho: 1 trilho a cada 2 módulos em paisagem, com folga de 10%.
 * Grampos: 2 finais por fileira de trilho + 1 intermediário por módulo entre vizinhos.
 * Parafusos: 4 por módulo (2 por grampo intermediário, aproximando fixação em 2 pontos).
 * Ganchos: 1 por módulo em telhado inclinado; solo e laje não usam gancho de telha.
 */
const STRUCTURE_MULTIPLIER: { readonly [T in TipoFixacao]: { ganchoPorModulo: number } } = {
  metalico: { ganchoPorModulo: 0 }, // fixação direta na estrutura metálica, sem gancho de telha
  colonial: { ganchoPorModulo: 1 },
  fibrocimento: { ganchoPorModulo: 1 },
  solo: { ganchoPorModulo: 0 },
  laje: { ganchoPorModulo: 0 },
};

function calculateMechanicalQuantities(
  modulesCount: number,
  structureType: TipoFixacao,
  warnings: string[],
): MechanicalQuantities {
  warnings.push(
    'Base mecânica (trilhos/grampos/parafusos/ganchos) usa fórmula padrão do setor, ' +
    'NÃO validada pela Elios, e não tem item de estoque correspondente ainda ' +
    '(o catálogo de 96 itens não inclui estrutura de fixação). Os valores abaixo ' +
    'são apenas quantidades, sem custo.',
  );

  const fileiras = Math.max(1, Math.ceil(modulesCount / 2));
  const trilhos_m = round2(modulesCount * 1.1); // ~1,1m de trilho por módulo (paisagem + folga)
  const grampos_finais = fileiras * 2;
  const grampos_intermediarios = Math.max(0, modulesCount - fileiras);
  const parafusos = (grampos_intermediarios + grampos_finais) * 2;
  const ganchos = modulesCount * STRUCTURE_MULTIPLIER[structureType].ganchoPorModulo;

  return { trilhos_m, grampos_intermediarios, grampos_finais, parafusos, ganchos };
}

/**
 * Monta o BOM de um projeto a partir dos dados técnicos.
 *
 * @param inverterPowerKw Potência do inversor em kW (ex: 3, 5, 8). Só 3 é validado.
 * @param modulesCount Quantidade de módulos fotovoltaicos.
 * @param structureType Estrutura de fixação do telhado/solo.
 */
export function calculateBOM(
  inverterPowerKw: number,
  modulesCount: number,
  structureType: TipoFixacao,
): BOMCalculationResult {
  if (inverterPowerKw <= 0) throw new Error('calculateBOM: inverterPowerKw deve ser > 0');
  if (modulesCount <= 0) throw new Error('calculateBOM: modulesCount deve ser > 0');

  const warnings: string[] = [];
  const eletrica = buildElectricalBasket(inverterPowerKw, warnings);
  const mecanica = calculateMechanicalQuantities(modulesCount, structureType, warnings);
  const custo_total_eletrica = round2(eletrica.reduce((sum, i) => sum + i.custo_total, 0));

  return { eletrica, mecanica, custo_total_eletrica, warnings };
}
