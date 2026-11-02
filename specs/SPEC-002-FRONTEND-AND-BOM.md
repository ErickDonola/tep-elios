# SPEC-002 — Frontend (Vite/React/Tailwind) e Calculadora do BOM

**Status:** CONCLUDED
**Aberta:** 2026-11-02 · **Concluída:** 2026-11-02
**Typecheck:** ✅ `npx tsc --noEmit` — 0 erros

## Objetivo

Corrigir o gatilho da vistoria no mapa de processos, montar o ecossistema frontend (React + Vite + Tailwind) escutando em `0.0.0.0:5173`, carregar o catálogo real de estoque e a cesta elétrica validada do inversor de 3kW, e construir o layout mestre da aplicação.

## Checklist

### 1. Correção do gatilho (Projetos → Instalação → Vistoria → Pós-Venda)
- [x] [docs/architecture/PROCESS_MAP.md](../docs/architecture/PROCESS_MAP.md) corrigido: a montagem libera com o parecer de acesso **deferido**; a vistoria da concessionária acontece **depois** da montagem (`solicitar_vistoria` → `confirmar_vistoria`, com troca do medidor bidirecional); só então o Pós-Venda e a quitação final são liberados.

### 2. Dados reais (planilhas da Elios)
- [x] Lidas as planilhas `Elios_Custo material de instalação.xlsx` (aba ESTOQUE, 96 itens; aba CUSTO POR INV, cesta do inversor de 3kW) e `Mapeamento de processos.xlsx` (confirma os nomes de etapa usados em `crm.ts`).
- [x] [src/lib/stock-seed.ts](../src/lib/stock-seed.ts) — os 96 itens reais (código, descrição, preço, categoria).
- [x] [src/lib/bom-calculator.ts](../src/lib/bom-calculator.ts) — `calculateBOM(inverterPowerKw, modulesCount, structureType)`.

### 3. Ambiente frontend
- [x] `react`, `react-dom`, `lucide-react` instalados.
- [x] `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, `@types/react`, `@types/react-dom` instalados como dev.
- [x] [tsconfig.json](../tsconfig.json) — `target: ES2022`, `lib: [DOM, DOM.Iterable, ES2022]`, `module: ESNext`, `moduleResolution: bundler`, `jsx: react-jsx`, `strict: true`, `skipLibCheck: true` (+ os extras de rigor já herdados da SPEC-001).
- [x] [vite.config.ts](../vite.config.ts) — `plugins: [react(), tailwindcss()]`, `server: { host: '0.0.0.0', port: 5173 }`.
- [x] [index.html](../index.html) — título "Elios Energia Solar - Gestão Operacional", viewport responsivo, `#root`, `<script type="module" src="/src/main.tsx">`.
- [x] [src/index.css](../src/index.css) — `@import "tailwindcss";` (ver decisão abaixo).
- [x] [src/main.tsx](../src/main.tsx) — monta `<App />` dentro de `<StrictMode>`.
- [x] `package.json` — scripts `dev`, `build`, `preview`, `typecheck`; `"type": "module"`.

### 4. Layout mestre
- [x] [src/components/layout/AppLayout.tsx](../src/components/layout/AppLayout.tsx)
  - Sidebar com gaveta retrátil no mobile (`-translate-x-full` ↔ `translate-x-0`) e fixa no desktop (`md:static`).
  - 10 módulos com ícone do Lucide: Comercial (Briefcase), Orçamentos (Calculator), Visita Técnica (MapPin), Projetos (FileCode), Instalação (Calendar), Pós-Vendas (ShieldCheck), Financeiro (DollarSign), Estoque (Package), Relatórios (BarChart3), Usuários (UserCheck).
  - Header com nome do módulo ativo, indicador "Online" e botão hambúrguer (visível só no mobile).
- [x] [src/App.tsx](../src/App.tsx)
  - Estado do módulo selecionado, compartilhado com `AppLayout`.
  - Painel resumo com os 10 módulos (clicáveis, trocam o módulo ativo).
  - Demonstração interativa da calculadora do BOM para o inversor de 3kW: tabela dos materiais de infraestrutura/elétrica com código, descrição, quantidade, preço unitário e total — **R$ 766,04** (fixo, validado) — mais os campos "quantidade de módulos" e "estrutura de fixação", que recalculam só a parte mecânica (sem preço).

## Decisões e correções em relação ao pedido

1. **CSS do Tailwind.** O pedido descrevia as diretivas `@tailwind base/components/utilities` (sintaxe do Tailwind v3). A versão instalada é a **v4** (mais recente, já era a disponível no `npm install`), que substituiu essas diretivas por `@import "tailwindcss";`. Usei a sintaxe do v4 — as diretivas antigas não são processadas pelo `@tailwindcss/vite` nessa versão, e o CSS não seria gerado.
2. **`moduleResolution: "bundler"`** e **`module: "ESNext"`** exigem `"type": "module"` no `package.json` (já ajustado na SPEC-002 anterior) para que `vite.config.ts` seja interpretado como ESM.
3. **Indicadores do painel.** Mostrei "—" para os 9 módulos sem fonte de dados ainda (nenhum backend conectado nesta etapa) e só "Estoque" com número real (`STOCK_SEED.length`, 96), para não exibir métrica inventada como se fosse real.
4. **Total fixo de R$ 766,04.** A cesta elétrica do inversor de 3kW não varia com a quantidade de módulos (confirmado pela planilha: é uma cesta por potência de inversor, não por painel). Por isso, na demo, o campo "quantidade de módulos" só afeta a estrutura mecânica (sem preço), não a tabela elétrica.

## Pendências (não cobertas por este pedido, herdadas da SPEC-001)

- [ ] Tabela real de materiais para inversores de 5kW e 8kW (`bom-calculator.ts` hoje estima por escala linear das cesta de 3kW, com aviso).
- [ ] Tabela real de trilhos/grampos/parafusos/ganchos por estrutura × nº de módulos, e os itens correspondentes cadastrados no estoque (hoje o catálogo de 96 itens não tem nenhum item de estrutura de fixação).
- [ ] Rodar `src/lib/schema.sql` num Postgres/Supabase real.
- [ ] Telas reais dos 10 módulos (hoje `App.tsx` só mostra uma prévia de texto por módulo).

## Como iniciar o servidor de desenvolvimento

```
npm run dev
```

Escuta em `0.0.0.0:5173`: acessível em `http://localhost:5173` nesta máquina e em `http://<IP-da-máquina-na-rede>:5173` por outro dispositivo na mesma rede (ex: celular), sem necessidade de túnel adicional dentro da LAN.
