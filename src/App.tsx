import { useMemo, useState } from 'react';
import AppLayout, { getModuleLabel } from './components/layout/AppLayout.js';
import type { ModuleArea, TipoFixacao } from './types/crm.js';
import { MODULE_AREAS, TIPOS_FIXACAO } from './types/crm.js';
import { calculateBOM } from './lib/bom-calculator.js';
import { getStockItemByCode, STOCK_SEED } from './lib/stock-seed.js';

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * Indicadores dos 10 módulos. "Estoque" usa a contagem real do catálogo
 * (`stock-seed.ts`); os demais ainda não têm fonte de dados (nenhum backend
 * foi conectado nesta etapa), então mostram "—" em vez de número inventado.
 */
const MODULE_SUMMARY: ReadonlyArray<{ modulo: ModuleArea; valor: string; legenda: string }> = [
  { modulo: 'comercial', valor: '—', legenda: 'Aguardando integração' },
  { modulo: 'orcamentos', valor: '—', legenda: 'Aguardando integração' },
  { modulo: 'visita_tecnica', valor: '—', legenda: 'Aguardando integração' },
  { modulo: 'projetos', valor: '—', legenda: 'Aguardando integração' },
  { modulo: 'instalacao', valor: '—', legenda: 'Aguardando integração' },
  { modulo: 'pos_vendas', valor: '—', legenda: 'Aguardando integração' },
  { modulo: 'financeiro', valor: '—', legenda: 'Aguardando integração' },
  { modulo: 'estoque', valor: `${STOCK_SEED.length} itens`, legenda: 'Dados reais (stock-seed.ts)' },
  { modulo: 'relatorios', valor: '—', legenda: 'Aguardando integração' },
  { modulo: 'usuarios', valor: '—', legenda: 'Aguardando integração' },
];

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleArea>('comercial');

  // Demo interativa da calculadora do BOM: a cesta elétrica do inversor de
  // 3kW é fixa e validada (total sempre R$ 766,04); nº de módulos e
  // estrutura só afetam a parte mecânica (sem preço — ver aviso abaixo).
  const [modulesCount, setModulesCount] = useState(10);
  const [structureType, setStructureType] = useState<TipoFixacao>('metalico');

  const bom = useMemo(
    () => calculateBOM(3, modulesCount, structureType),
    [modulesCount, structureType],
  );

  return (
    <AppLayout activeModule={activeModule} onModuleChange={setActiveModule}>
      <div className="space-y-6">
        <section>
          <h2 className="mb-1 text-sm font-medium text-slate-500">
            Prévia do módulo selecionado
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-slate-700">
              Visualização do módulo <strong>{getModuleLabel(activeModule)}</strong> — a
              tela completa deste módulo entra na próxima etapa.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-medium text-slate-500">Painel do pipeline</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {MODULE_SUMMARY.map(({ modulo, valor, legenda }) => (
              <button
                key={modulo}
                type="button"
                onClick={() => setActiveModule(modulo)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  modulo === activeModule
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 bg-white hover:border-emerald-300'
                }`}
              >
                <div className="text-xs font-medium text-slate-500">
                  {getModuleLabel(modulo)}
                </div>
                <div className="mt-1 text-2xl font-semibold text-slate-800">{valor}</div>
                <div className="mt-1 text-xs text-slate-400">{legenda}</div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-medium text-slate-500">
            Calculadora do BOM — inversor de 3kW
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-4 flex flex-wrap items-end gap-4">
              <label className="flex flex-col text-sm text-slate-600">
                Quantidade de módulos
                <input
                  type="number"
                  min={1}
                  value={modulesCount}
                  onChange={(e) => setModulesCount(Math.max(1, Number(e.target.value) || 1))}
                  className="mt-1 w-32 rounded-md border border-slate-300 px-2 py-1"
                />
              </label>
              <label className="flex flex-col text-sm text-slate-600">
                Estrutura de fixação
                <select
                  value={structureType}
                  onChange={(e) => setStructureType(e.target.value as TipoFixacao)}
                  className="mt-1 rounded-md border border-slate-300 px-2 py-1 capitalize"
                >
                  {TIPOS_FIXACAO.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <h3 className="mb-2 text-sm font-semibold text-slate-700">
              Materiais de infraestrutura/elétrica (base fixa do inversor de 3kW)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-1 pr-3">Código</th>
                    <th className="py-1 pr-3">Item</th>
                    <th className="py-1 pr-3 text-right">Qtd.</th>
                    <th className="py-1 pr-3 text-right">R$ Unit.</th>
                    <th className="py-1 text-right">R$ Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bom.eletrica.map((i) => {
                    // `stock_item_id` == `codigo` neste seed (ver stock-seed.ts).
                    const stock = getStockItemByCode(i.stock_item_id);
                    return (
                      <tr key={i.stock_item_id} className="border-b border-slate-100">
                        <td className="py-1 pr-3 font-mono text-xs text-slate-500">
                          {stock.codigo}
                        </td>
                        <td className="py-1 pr-3">{stock.descricao}</td>
                        <td className="py-1 pr-3 text-right">{i.quantidade}</td>
                        <td className="py-1 pr-3 text-right">{BRL.format(i.custo_unitario)}</td>
                        <td className="py-1 text-right">{BRL.format(i.custo_total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="pt-2 text-right font-medium text-slate-600">
                      Total:
                    </td>
                    <td className="pt-2 text-right font-semibold text-slate-900">
                      {BRL.format(bom.custo_total_eletrica)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <h3 className="mt-5 mb-2 text-sm font-semibold text-slate-700">
              Estrutura mecânica (quantidades estimadas, sem preço)
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-sm text-slate-700 sm:grid-cols-5">
              <li className="rounded-lg bg-slate-50 p-2">
                Trilhos: <strong>{bom.mecanica.trilhos_m} m</strong>
              </li>
              <li className="rounded-lg bg-slate-50 p-2">
                Grampos interm.: <strong>{bom.mecanica.grampos_intermediarios}</strong>
              </li>
              <li className="rounded-lg bg-slate-50 p-2">
                Grampos finais: <strong>{bom.mecanica.grampos_finais}</strong>
              </li>
              <li className="rounded-lg bg-slate-50 p-2">
                Parafusos: <strong>{bom.mecanica.parafusos}</strong>
              </li>
              <li className="rounded-lg bg-slate-50 p-2">
                Ganchos: <strong>{bom.mecanica.ganchos}</strong>
              </li>
            </ul>

            {bom.warnings.length > 0 && (
              <ul className="mt-4 space-y-1 border-t border-amber-200 pt-3 text-xs text-amber-700">
                {bom.warnings.map((w) => (
                  <li key={w}>⚠ {w}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
