import { useState, type ReactNode } from 'react';
import {
  Briefcase,
  Calculator,
  MapPin,
  FileCode,
  Calendar,
  ShieldCheck,
  DollarSign,
  Package,
  BarChart3,
  UserCheck,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { ModuleArea } from '../../types/crm.js';

interface ModuleNavItem {
  id: ModuleArea;
  label: string;
  icon: LucideIcon;
}

/** Ordem e ícones dos 10 módulos na sidebar. */
const MODULE_NAV_ITEMS: readonly ModuleNavItem[] = [
  { id: 'comercial', label: 'Comercial', icon: Briefcase },
  { id: 'orcamentos', label: 'Orçamentos', icon: Calculator },
  { id: 'visita_tecnica', label: 'Visita Técnica', icon: MapPin },
  { id: 'projetos', label: 'Projetos', icon: FileCode },
  { id: 'instalacao', label: 'Instalação', icon: Calendar },
  { id: 'pos_vendas', label: 'Pós-Vendas', icon: ShieldCheck },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'estoque', label: 'Estoque', icon: Package },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  { id: 'usuarios', label: 'Usuários', icon: UserCheck },
];

export function getModuleLabel(modulo: ModuleArea): string {
  return MODULE_NAV_ITEMS.find((m) => m.id === modulo)?.label ?? modulo;
}

interface AppLayoutProps {
  activeModule: ModuleArea;
  onModuleChange: (modulo: ModuleArea) => void;
  children: ReactNode;
}

export default function AppLayout({ activeModule, onModuleChange, children }: AppLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  function selectModule(modulo: ModuleArea) {
    onModuleChange(modulo);
    setDrawerOpen(false);
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      {/* Overlay no mobile, atrás da gaveta */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: gaveta retrátil no mobile, fixa no desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-slate-100 transition-transform duration-200 md:static md:translate-x-0 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold tracking-tight">TEP · Elios</span>
          <button
            type="button"
            className="rounded p-1 text-slate-300 hover:bg-slate-800 md:hidden"
            onClick={() => setDrawerOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2">
          <ul className="space-y-1">
            {MODULE_NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const isActive = id === activeModule;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => selectModule(id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Coluna principal: header + conteúdo */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded p-1.5 text-slate-600 hover:bg-slate-100 md:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-base font-semibold text-slate-800 md:text-lg">
              {getModuleLabel(activeModule)}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Online
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
