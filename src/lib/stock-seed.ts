/**
 * TEP — Catálogo de estoque (96 itens).
 *
 * Fonte: planilha real "Elios_Custo material de instalação.xlsx", aba
 * ESTOQUE (preços lidos em 02/11/2026). Código, descrição e preço são
 * dados reais da Elios.
 *
 * O que NÃO veio da planilha (ela não tinha essas colunas) e foi inferido
 * aqui, portanto precisa de validação:
 * - `unidade`: estimada pelo tipo de material (ver comentário em cada bloco).
 * - `quantidade_estoque`: zerada. A planilha só tinha preço, não saldo.
 *
 * O `id` usa o próprio `codigo` como chave estável neste seed. No banco
 * real (schema.sql), `stock_items.id` é um uuid gerado por `gen_random_uuid()`;
 * o `codigo` continua sendo o campo único de negócio.
 */

import type { StockItem } from '../types/crm.js';

/** Base de um item do seed, sem `id`/`quantidade_estoque` (preenchidos abaixo). */
type SeedRow = Omit<StockItem, 'id' | 'quantidade_estoque'>;

function item(row: SeedRow): StockItem {
  return { ...row, id: row.codigo, quantidade_estoque: 0 };
}

// unidade: UN = unidade/peça, M = metro, KG = quilograma.
export const STOCK_SEED: readonly StockItem[] = [
  // --- INFR — Infraestrutura (eletrodutos, curvas, conduletes, eletrocalhas, quadros) ---
  item({ codigo: 'INFR.101', descricao: 'ELETRODUTO GALV. 3/4"', categoria: 'infraestrutura', preco_atualizado: 17.57, unidade: 'UN' }),
  item({ codigo: 'INFR.102', descricao: 'ELETRODUTO GALV. 1"', categoria: 'infraestrutura', preco_atualizado: 22.17, unidade: 'UN' }),
  item({ codigo: 'INFR.103', descricao: 'ELETRODUTO GALV. 2"', categoria: 'infraestrutura', preco_atualizado: 61, unidade: 'UN' }),
  item({ codigo: 'INFR.104', descricao: 'CURVA P/ ELETRODUTO 3/4"', categoria: 'infraestrutura', preco_atualizado: 3.32, unidade: 'UN' }),
  item({ codigo: 'INFR.105', descricao: 'CURVA P/ ELETRODUTO 1"', categoria: 'infraestrutura', preco_atualizado: 3.51, unidade: 'UN' }),
  item({ codigo: 'INFR.106', descricao: 'CURVA P/ ELETRODUTO 2"', categoria: 'infraestrutura', preco_atualizado: 14.63, unidade: 'UN' }),
  item({ codigo: 'INFR.107', descricao: 'ABRAÇADEIRA TIPO CUNHA P/ ELETRODUTO 3/4"', categoria: 'infraestrutura', preco_atualizado: 0.81, unidade: 'UN' }),
  item({ codigo: 'INFR.108', descricao: 'ABRAÇADEIRA TIPO CUNHA P/ ELETRODUTO 1"', categoria: 'infraestrutura', preco_atualizado: 0.87, unidade: 'UN' }),
  item({ codigo: 'INFR.109', descricao: 'ABRAÇADEIRA TIPO CUNHA P/ ELETRODUTO 2"', categoria: 'infraestrutura', preco_atualizado: 2.17, unidade: 'UN' }),
  item({ codigo: 'INFR.110', descricao: 'LUVA GALV P/ ELETRODUTO 3/4"', categoria: 'infraestrutura', preco_atualizado: 1.10, unidade: 'UN' }),
  item({ codigo: 'INFR.111', descricao: 'LUVA GALV P/ ELETRODUTO 1"', categoria: 'infraestrutura', preco_atualizado: 1.66, unidade: 'UN' }),
  item({ codigo: 'INFR.112', descricao: 'LUVA GALV P/ ELETRODUTO 2"', categoria: 'infraestrutura', preco_atualizado: 4.81, unidade: 'UN' }),
  item({ codigo: 'INFR.113', descricao: 'CONDULETE MULTIPLO TIPO X C/ TAMPA 3/4"', categoria: 'infraestrutura', preco_atualizado: 9.16, unidade: 'UN' }),
  item({ codigo: 'INFR.114', descricao: 'CONDULETE MULTIPLO TIPO X C/ TAMPA 1"', categoria: 'infraestrutura', preco_atualizado: 16.74, unidade: 'UN' }),
  item({ codigo: 'INFR.115', descricao: 'CONDULETE MULTIPLO TIPO X C/ TAMPA 2"', categoria: 'infraestrutura', preco_atualizado: 58.33, unidade: 'UN' }),
  item({ codigo: 'INFR.116', descricao: 'UNIDUTE MULTIPLO S/ROSCA P/ CONDULETE 3/4"', categoria: 'infraestrutura', preco_atualizado: 2.62, unidade: 'UN' }),
  item({ codigo: 'INFR.117', descricao: 'UNIDUTE MULTIPLO S/ROSCA P/ CONDULETE 1"', categoria: 'infraestrutura', preco_atualizado: 3.38, unidade: 'UN' }),
  item({ codigo: 'INFR.118', descricao: 'UNIDUTE MULTIPLO S/ROSCA P/ CONDULETE 2"', categoria: 'infraestrutura', preco_atualizado: 9.01, unidade: 'UN' }),
  item({ codigo: 'INFR.119', descricao: 'TAMPAO EM PVC P/ CONDULETE 3/4"', categoria: 'infraestrutura', preco_atualizado: 0.27, unidade: 'UN' }),
  item({ codigo: 'INFR.120', descricao: 'TAMPAO EM PVC P/ CONDULETE 1"', categoria: 'infraestrutura', preco_atualizado: 0.27, unidade: 'UN' }),
  item({ codigo: 'INFR.121', descricao: 'TAMPAO EM PVC P/ CONDULETE 2"', categoria: 'infraestrutura', preco_atualizado: 1.31, unidade: 'UN' }),
  item({ codigo: 'INFR.201', descricao: 'ELETROCALHA GALV. PERFURADA S/VIROLA 3MT CH24 50x50MM', categoria: 'infraestrutura', preco_atualizado: 32.48, unidade: 'UN' }),
  item({ codigo: 'INFR.202', descricao: 'ELETROCALHA GALV. PERFURADA S/VIROLA 3MT CH24 100x50MM', categoria: 'infraestrutura', preco_atualizado: 37.08, unidade: 'UN' }),
  item({ codigo: 'INFR.203', descricao: 'MÃO FRANCESA SIMPLES GALV. P/ ELETROCALHA 50MM', categoria: 'infraestrutura', preco_atualizado: 3.67, unidade: 'UN' }),
  item({ codigo: 'INFR.204', descricao: 'MÃO FRANCESA SIMPLES GALV. P/ ELETROCALHA 100MM', categoria: 'infraestrutura', preco_atualizado: 4.21, unidade: 'UN' }),
  item({ codigo: 'INFR.205', descricao: 'TAMPA P/ ELETROCALHA 3MT 50MM', categoria: 'infraestrutura', preco_atualizado: 11.87, unidade: 'UN' }),
  item({ codigo: 'INFR.206', descricao: 'TAMPA P/ ELETROCALHA 3MT 100MM', categoria: 'infraestrutura', preco_atualizado: 18.31, unidade: 'UN' }),
  item({ codigo: 'INFR.301', descricao: 'QUADRO SOBREPOR PVC 4DIN', categoria: 'infraestrutura', preco_atualizado: 35.33, unidade: 'UN' }),
  item({ codigo: 'INFR.302', descricao: 'QUADRO SOBREPOR PVC 6DIN', categoria: 'infraestrutura', preco_atualizado: 0, unidade: 'UN' }),
  item({ codigo: 'INFR.303', descricao: 'QUADRO SOBREPOR PVC 8DIN', categoria: 'infraestrutura', preco_atualizado: 58.79, unidade: 'UN' }),
  item({ codigo: 'INFR.304', descricao: 'QUADRO COMANDO METALICO 400x300MM', categoria: 'infraestrutura', preco_atualizado: 273.15, unidade: 'UN' }),
  item({ codigo: 'INFR.305', descricao: 'QUADRO COMANDO METALICO 500x400MM', categoria: 'infraestrutura', preco_atualizado: 437.74, unidade: 'UN' }),
  item({ codigo: 'INFR.306', descricao: 'QUADRO COMANDO METALICO 600x500MM', categoria: 'infraestrutura', preco_atualizado: 418.69, unidade: 'UN' }),
  item({ codigo: 'INFR.307', descricao: 'QUADRO COMANDO METALICO 800x600MM', categoria: 'infraestrutura', preco_atualizado: 743.70, unidade: 'UN' }),
  item({ codigo: 'INFR.308', descricao: 'TRILHO P/ DISJUNTOR DIN 1M', categoria: 'infraestrutura', preco_atualizado: 12.02, unidade: 'UN' }),
  item({ codigo: 'INFR.401', descricao: 'CONDUITE REFORÇADO TIPO HELIFLEX ROLO 25 MT 3/4"', categoria: 'infraestrutura', preco_atualizado: 4.06, unidade: 'M' }),
  item({ codigo: 'INFR.402', descricao: 'CONDUITE REFORÇADO TIPO HELIFLEX ROLO 25 MT 1"', categoria: 'infraestrutura', preco_atualizado: 5.81, unidade: 'M' }),
  item({ codigo: 'INFR.403', descricao: 'CONDUITE REFORÇADO TIPO HELIFLEX ROLO 25 MT 2"', categoria: 'infraestrutura', preco_atualizado: 16.70, unidade: 'M' }),

  // --- ATER — Aterramento (hastes, conectores) ---
  item({ codigo: 'ATER.101', descricao: 'BALDE DE INSPEÇÃO ATERRAMENTO', categoria: 'aterramento', preco_atualizado: 0, unidade: 'UN' }),
  item({ codigo: 'ATER.102', descricao: 'HASTE ATERRAMENTO B. CAMADA 5/8" X 2,40M', categoria: 'aterramento', preco_atualizado: 67.90, unidade: 'UN' }),
  item({ codigo: 'ATER.103', descricao: 'CONECTOR P/ HASTE ATERRAMENTO 5/8"', categoria: 'aterramento', preco_atualizado: 4.32, unidade: 'UN' }),

  // --- COND — Condutores (cabos solares e flexíveis) ---
  item({ codigo: 'COND.101', descricao: 'CABO PP CLASSE 4 0,6/1KV PRETO 3x4MM²', categoria: 'condutores', preco_atualizado: 14.54, unidade: 'M' }),
  item({ codigo: 'COND.102', descricao: 'CABO PP CLASSE 4 0,6/1KV PRETO 3x6MM²', categoria: 'condutores', preco_atualizado: 21.71, unidade: 'M' }),
  item({ codigo: 'COND.201', descricao: 'CABO FLEXIVEL 750V PRETO 4MM²', categoria: 'condutores', preco_atualizado: 4.30, unidade: 'M' }),
  item({ codigo: 'COND.202', descricao: 'CABO FLEXIVEL 750V PRETO 6MM²', categoria: 'condutores', preco_atualizado: 6.40, unidade: 'M' }),
  item({ codigo: 'COND.301', descricao: 'CABO FLEXIVEL XLPE/HEPR 1KV PRETO 10MM²', categoria: 'condutores', preco_atualizado: 12.05, unidade: 'M' }),
  item({ codigo: 'COND.302', descricao: 'CABO FLEXIVEL XLPE/HEPR 1KV PRETO 16MM²', categoria: 'condutores', preco_atualizado: 18.68, unidade: 'M' }),
  item({ codigo: 'COND.303', descricao: 'CABO FLEXIVEL XLPE/HEPR 1KV PRETO 25MM²', categoria: 'condutores', preco_atualizado: 28.76, unidade: 'M' }),
  item({ codigo: 'COND.304', descricao: 'CABO FLEXIVEL XLPE/HEPR 1KV PRETO 35MM²', categoria: 'condutores', preco_atualizado: 40.39, unidade: 'M' }),
  item({ codigo: 'COND.305', descricao: 'CABO FLEXIVEL XLPE/HEPR 1KV PRETO 50MM²', categoria: 'condutores', preco_atualizado: 56.97, unidade: 'M' }),
  item({ codigo: 'COND.306', descricao: 'CABO FLEXIVEL XLPE/HEPR 1KV PRETO 70MM²', categoria: 'condutores', preco_atualizado: 81.97, unidade: 'M' }),
  item({ codigo: 'COND.307', descricao: 'CABO FLEXIVEL XLPE/HEPR 1KV PRETO 95MM²', categoria: 'condutores', preco_atualizado: 107.55, unidade: 'M' }),
  item({ codigo: 'COND.401', descricao: 'BARRAMENTO MONOFÁSICO 1X12P 80A', categoria: 'condutores', preco_atualizado: 16.47, unidade: 'UN' }),
  item({ codigo: 'COND.402', descricao: 'BARRAMENTO BIFÁSICO 1X12P 80A', categoria: 'condutores', preco_atualizado: 34.72, unidade: 'UN' }),

  // --- PROT — Proteção (DPS, disjuntores) ---
  item({ codigo: 'PROT.101', descricao: 'DISJUNTOR BIPOLAR CURVA C25A', categoria: 'protecao', preco_atualizado: 46.37, unidade: 'UN' }),
  item({ codigo: 'PROT.102', descricao: 'DISJUNTOR BIPOLAR CURVA C40A', categoria: 'protecao', preco_atualizado: 51.80, unidade: 'UN' }),
  item({ codigo: 'PROT.103', descricao: 'DISJUNTOR BIPOLAR CURVA C63A', categoria: 'protecao', preco_atualizado: 72.77, unidade: 'UN' }),
  item({ codigo: 'PROT.201', descricao: 'DISJUNTOR TRIPOLAR CURVA C63A', categoria: 'protecao', preco_atualizado: 224.94, unidade: 'UN' }),
  item({ codigo: 'PROT.202', descricao: 'DISJUNTOR TRIPOLAR CURVA C80A', categoria: 'protecao', preco_atualizado: 224.94, unidade: 'UN' }),
  item({ codigo: 'PROT.203', descricao: 'DISJUNTOR TRIPOLAR CURVA C100A', categoria: 'protecao', preco_atualizado: 350, unidade: 'UN' }),
  item({ codigo: 'PROT.301', descricao: 'DISJUNTOR TRIPOLAR CURVA C200A', categoria: 'protecao', preco_atualizado: 450, unidade: 'UN' }),
  item({ codigo: 'PROT.401', descricao: 'PROTETOR CONTRA SURTO DPS 275V 45KA', categoria: 'protecao', preco_atualizado: 38.73, unidade: 'UN' }),

  // --- TERM — Terminais (ilhós, bimetálicos, anéis, perfuração) ---
  item({ codigo: 'TERM.101', descricao: 'TERMINAL ANEL A COMPRESSAO 6MM', categoria: 'terminais', preco_atualizado: 0.76, unidade: 'UN' }),
  item({ codigo: 'TERM.102', descricao: 'TERMINAL ANEL A COMPRESSAO 10MM', categoria: 'terminais', preco_atualizado: 0.86, unidade: 'UN' }),
  item({ codigo: 'TERM.103', descricao: 'TERMINAL ANEL A COMPRESSAO 16MM', categoria: 'terminais', preco_atualizado: 1.27, unidade: 'UN' }),
  item({ codigo: 'TERM.104', descricao: 'TERMINAL ANEL A COMPRESSAO 25MM', categoria: 'terminais', preco_atualizado: 1.95, unidade: 'UN' }),
  item({ codigo: 'TERM.105', descricao: 'TERMINAL ANEL A COMPRESSAO 35MM', categoria: 'terminais', preco_atualizado: 2.35, unidade: 'UN' }),
  item({ codigo: 'TERM.106', descricao: 'TERMINAL ANEL A COMPRESSAO 50MM', categoria: 'terminais', preco_atualizado: 4.54, unidade: 'UN' }),
  item({ codigo: 'TERM.107', descricao: 'TERMINAL ANEL A COMPRESSAO 70MM', categoria: 'terminais', preco_atualizado: 6.55, unidade: 'UN' }),
  item({ codigo: 'TERM.108', descricao: 'TERMINAL ANEL A COMPRESSAO 95MM', categoria: 'terminais', preco_atualizado: 6.84, unidade: 'UN' }),
  item({ codigo: 'TERM.201', descricao: 'TERMINAL DE CONEXÃO GENÉRICO PINO CURTO 25MM', categoria: 'terminais', preco_atualizado: 8.19, unidade: 'UN' }),
  item({ codigo: 'TERM.301', descricao: 'TERMINAL ILHOS TUBULAR DUPLO PRE-ISSO 6MM', categoria: 'terminais', preco_atualizado: 0.61, unidade: 'UN' }),
  item({ codigo: 'TERM.302', descricao: 'TERMINAL ILHOS TUBULAR DUPLO PRE-ISSO 10MM', categoria: 'terminais', preco_atualizado: 0, unidade: 'UN' }),
  item({ codigo: 'TERM.303', descricao: 'TERMINAL ILHOS TUBULAR DUPLO PRE-ISSO 16MM', categoria: 'terminais', preco_atualizado: 0, unidade: 'UN' }),
  item({ codigo: 'TERM.401', descricao: 'CONECTOR ALUMÍNIO A COMPRESSÃO TIPO H 25MM', categoria: 'terminais', preco_atualizado: 0, unidade: 'UN' }),
  item({ codigo: 'TERM.402', descricao: 'CONECTOR ALUMÍNIO A COMPRESSÃO TIPO H 35MM', categoria: 'terminais', preco_atualizado: 0, unidade: 'UN' }),
  item({ codigo: 'TERM.403', descricao: 'CONECTOR ALUMÍNIO A COMPRESSÃO TIPO H 50MM', categoria: 'terminais', preco_atualizado: 0, unidade: 'UN' }),
  item({ codigo: 'TERM.404', descricao: 'CONECTOR ALUMÍNIO A COMPRESSÃO TIPO H 70MM', categoria: 'terminais', preco_atualizado: 0, unidade: 'UN' }),
  item({ codigo: 'TERM.405', descricao: 'CONECTOR ALUMÍNIO A COMPRESSÃO TIPO H 95MM', categoria: 'terminais', preco_atualizado: 0, unidade: 'UN' }),
  item({ codigo: 'TERM.501', descricao: 'CONECTOR PARAF FENDIDO BIMETALICO 16MM²', categoria: 'terminais', preco_atualizado: 9.33, unidade: 'UN' }),
  item({ codigo: 'TERM.502', descricao: 'CONECTOR PARAF FENDIDO BIMETALICO 25MM²', categoria: 'terminais', preco_atualizado: 11.41, unidade: 'UN' }),
  item({ codigo: 'TERM.503', descricao: 'CONECTOR PARAF FENDIDO BIMETALICO 35MM²', categoria: 'terminais', preco_atualizado: 13.98, unidade: 'UN' }),
  item({ codigo: 'TERM.504', descricao: 'CONECTOR PARAF FENDIDO BIMETALICO 50MM²', categoria: 'terminais', preco_atualizado: 18.58, unidade: 'UN' }),
  item({ codigo: 'TERM.505', descricao: 'CONECTOR PARAF FENDIDO BIMETALICO 70MM²', categoria: 'terminais', preco_atualizado: 24.56, unidade: 'UN' }),
  item({ codigo: 'TERM.506', descricao: 'CONECTOR PARAF FENDIDO BIMETALICO 95MM²', categoria: 'terminais', preco_atualizado: 40.11, unidade: 'UN' }),
  item({ codigo: 'TERM.601', descricao: 'CONECTOR PERFURAÇÃO CDP-120-120', categoria: 'terminais', preco_atualizado: 0, unidade: 'UN' }),
  item({ codigo: 'TERM.602', descricao: 'CONECTOR PERFURAÇÃO CDP-150-10', categoria: 'terminais', preco_atualizado: 0, unidade: 'UN' }),
  item({ codigo: 'TERM.603', descricao: 'CONECTOR PERFURAÇÃO CDP-150-35', categoria: 'terminais', preco_atualizado: 0, unidade: 'UN' }),

  // --- REPO — Reposição e vedação (fitas, massas, vedacalha) ---
  item({ codigo: 'REPO.101', descricao: 'ABRAÇADEIRA NYLON T50R', categoria: 'reposicao', preco_atualizado: 0.20, unidade: 'UN' }),
  item({ codigo: 'REPO.102', descricao: 'ABRAÇADEIRA NYLON T80L', categoria: 'reposicao', preco_atualizado: 0.16, unidade: 'UN' }),
  item({ codigo: 'REPO.201', descricao: 'FITA AUTO FUSAO SCOTCH 19MMX5M', categoria: 'reposicao', preco_atualizado: 30.04, unidade: 'UN' }),
  item({ codigo: 'REPO.202', descricao: 'FITA ISOLANTE IMPERIAL 3M 18MMX10M', categoria: 'reposicao', preco_atualizado: 8.32, unidade: 'UN' }),
  item({ codigo: 'REPO.301', descricao: 'MASSA CALAFETAR 1KG', categoria: 'reposicao', preco_atualizado: 27.51, unidade: 'KG' }),
  item({ codigo: 'REPO.302', descricao: 'MANTA ASFALTICA ALUMINIZADA 20cmX10m', categoria: 'reposicao', preco_atualizado: 10.3825, unidade: 'UN' }),
  item({ codigo: 'REPO.401', descricao: 'VEDA CALHA', categoria: 'reposicao', preco_atualizado: 15, unidade: 'UN' }),
  item({ codigo: 'REPO.402', descricao: 'SILICONE', categoria: 'reposicao', preco_atualizado: 15, unidade: 'UN' }),
];

/** Mapa código → item, para lookup O(1) na calculadora do BOM. */
export const STOCK_BY_CODE: ReadonlyMap<string, StockItem> = new Map(
  STOCK_SEED.map((i) => [i.codigo, i]),
);

export function getStockItemByCode(codigo: string): StockItem {
  const found = STOCK_BY_CODE.get(codigo);
  if (!found) {
    throw new Error(`stock-seed: código de estoque desconhecido: ${codigo}`);
  }
  return found;
}
