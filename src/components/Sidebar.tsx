import React from 'react';
import { 
  LayoutDashboard, 
  Orbit, 
  Activity, 
  Sparkles, 
  LineChart, 
  History, 
  Settings2, 
  Calendar as CalendarIcon,
  TrendingUp,
  Compass,
  X,
  ChevronRight,
  ShieldCheck,
  Moon,
  Video,
  Brain
} from 'lucide-react';
import { CyclePhaseInfo } from '../types/cycle';

export type NavView = 'overview' | 'calendar' | 'projections' | 'moods' | 'meet' | 'wheel' | 'vitals' | 'syncing' | 'hormones' | 'history' | 'settings';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentDay: number;
  currentPhase: CyclePhaseInfo;
  onOpenChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpenMobile,
  onCloseMobile,
  currentDay,
  currentPhase,
  onOpenChat
}) => {
  const navItems: { id: NavView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Panel Principal', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendario del Ciclo', icon: CalendarIcon },
    { id: 'projections', label: 'Proyecciones (3 Ciclos)', icon: TrendingUp },
    { id: 'moods', label: 'Mood Analytics', icon: Brain },
    { id: 'meet', label: 'Telemedicina Meet', icon: Video },
    { id: 'wheel', label: 'Dial Biológico & Fases', icon: Orbit },
    { id: 'vitals', label: 'Constantes & Síntomas', icon: Activity },
    { id: 'syncing', label: 'Guía de Cycle Syncing', icon: Compass },
    { id: 'hormones', label: 'Curva Hormonal', icon: LineChart },
    { id: 'history', label: 'Historial de Ciclos', icon: History },
    { id: 'settings', label: 'Calibración y Ajustes', icon: Settings2 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile} 
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#FCFAF7] border-r border-stone-200/80 flex flex-col justify-between
        transition-transform duration-200 ease-out lg:translate-x-0
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand & Header */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200/60">
            <div className="flex items-center gap-3">
              {/* Bespoke Cyclia Monogram / Orbital Motif */}
              <div className="w-9 h-9 rounded-xl bg-stone-900 text-amber-100 flex items-center justify-center shadow-xs">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" strokeOpacity="0.3" strokeDasharray="3 3" />
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 3a9 9 0 0 1 9 9" stroke="#F59E0B" strokeWidth="2.5" />
                </svg>
              </div>
              <div>
                <span className="font-display text-xl font-medium tracking-tight text-stone-900 block leading-tight">
                  Cyclia
                </span>
                <span className="text-[11px] font-sans text-stone-500 font-medium block">
                  Biorhythm Intelligence
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Phase Snapshot Pill in Sidebar */}
          <div className="px-5 pt-4 pb-2">
            <div className="p-3 rounded-xl bg-white border border-stone-200/80 shadow-xs">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
                <span className="font-medium text-stone-700">Current Phase</span>
                <span className="font-mono tabular-nums text-stone-600 font-semibold">Day {currentDay} of 28</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: currentPhase.color }}
                  aria-hidden="true" 
                />
                <span className="text-sm font-semibold text-stone-900 truncate">
                  {currentPhase.name}
                </span>
              </div>
              {/* Micro phase progress bar */}
              <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-rose-500" style={{ width: '18%' }} title="Menstrual" />
                <div className="h-full bg-emerald-500" style={{ width: '28%' }} title="Follicular" />
                <div className="h-full bg-amber-500" style={{ width: '11%' }} title="Ovulatory" />
                <div className="h-full bg-indigo-500" style={{ width: '43%' }} title="Luteal" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2 pt-2 border-t border-stone-100">
                <span>Next menses</span>
                <span className="font-mono tabular-nums font-medium text-stone-700">
                  {28 - currentDay > 0 ? `in ${28 - currentDay} days` : 'Expected today'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    onCloseMobile();
                  }}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-stone-900 text-white shadow-xs' 
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-stone-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />}
                </button>
              );
            })}

            {/* Featured Cyclia AI Chat button in sidebar */}
            <div className="pt-2">
              <button
                onClick={() => {
                  onOpenChat();
                  onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200/80 transition-colors shadow-2xs group"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                  <span>Chat con Cyclia</span>
                </div>
                <span className="text-[10px] font-mono bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded font-semibold">
                  AI
                </span>
              </button>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer / User Profile */}
        <div className="p-4 border-t border-stone-200/70">
          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-stone-100/80 transition-colors cursor-pointer group">
            {/* Minimalist styled avatar */}
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-rose-200 via-amber-100 to-emerald-200 border border-stone-200 flex items-center justify-center font-display font-medium text-stone-800 text-sm shrink-0">
              RC
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-stone-800 truncate leading-none mb-1">
                Ruth Cerna
              </p>
              <p className="text-xs text-stone-500 truncate flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 inline shrink-0" />
                <span>Private & On-Device</span>
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
