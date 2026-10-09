import React, { useState } from 'react';
import { 
  Menu, 
  Calendar as CalendarIcon, 
  Plus, 
  Bell, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { CyclePhaseInfo } from '../types/cycle';
import { NavView } from './Sidebar';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  currentDay: number;
  onSetCurrentDay: (day: number) => void;
  currentPhase: CyclePhaseInfo;
  currentView: NavView;
  onOpenLogModal: () => void;
  onOpenChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  currentDay,
  onSetCurrentDay,
  currentPhase,
  currentView,
  onOpenLogModal,
  onOpenChat
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationDismissed, setNotificationDismissed] = useState(false);

  const viewTitles: Record<NavView, string> = {
    overview: 'Panel Principal',
    calendar: 'Calendario del Ciclo',
    projections: 'Proyecciones (3 Ciclos)',
    wheel: 'Dial Biológico',
    vitals: 'Constantes & Síntomas',
    syncing: 'Cycle Syncing',
    hormones: 'Curva Hormonal',
    history: 'Historial',
    settings: 'Ajustes'
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FCFAF7]/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Zone 1: Brand / Contextual Breadcrumb (single line) */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
          aria-label="Abrir menú lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm text-stone-500 truncate">
          <span className="font-semibold text-stone-900 font-display text-base">Cyclia</span>
          <span aria-hidden="true" className="text-stone-300">/</span>
          <span className="font-medium text-stone-700 hidden sm:inline">{viewTitles[currentView]}</span>
          <span aria-hidden="true" className="text-stone-300 hidden sm:inline">·</span>
          <span className="font-mono tabular-nums text-xs text-stone-600">Día {currentDay} de 28</span>
        </div>
      </div>

      {/* Zone 2: Day Navigator / Quick Stepper */}
      <div className="hidden md:flex items-center gap-1.5 bg-stone-100/80 p-1 rounded-lg border border-stone-200/60">
        <button
          onClick={() => onSetCurrentDay(Math.max(1, currentDay - 1))}
          disabled={currentDay <= 1}
          className="p-1 text-stone-600 hover:text-stone-900 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Día anterior del ciclo"
          aria-label="Día anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="px-2.5 py-0.5 text-xs font-medium text-stone-800 flex items-center gap-1.5 whitespace-nowrap">
          <CalendarIcon className="w-3.5 h-3.5 text-stone-500" />
          <span className="font-mono tabular-nums font-semibold">Día {currentDay}</span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span className="text-stone-600">{currentPhase.name.replace('Fase ', '')}</span>
          {currentDay === 14 && (
            <span className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider ml-1 bg-amber-100/80 px-1.5 py-0.2 rounded">
              Hoy
            </span>
          )}
        </div>

        <button
          onClick={() => onSetCurrentDay(Math.min(28, currentDay + 1))}
          disabled={currentDay >= 28}
          className="p-1 text-stone-600 hover:text-stone-900 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Siguiente día del ciclo"
          aria-label="Día siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Zone 3: 1-2 Primary Actions */}
      <div className="flex items-center gap-2.5">
        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors relative"
            aria-label="Ver alertas biológicas"
          >
            <Bell className="w-4 h-4" />
            {!notificationDismissed && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-stone-200/90 rounded-xl shadow-lg p-3.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                <span className="text-xs font-semibold text-stone-800">Alertas Biológicas</span>
                <button 
                  onClick={() => setNotificationDismissed(true)} 
                  className="text-[11px] text-stone-500 hover:text-stone-800 font-medium"
                >
                  Marcar leídas
                </button>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-900">Pico de Oleada de Estrógeno</p>
                      <p className="text-amber-800/90 mt-0.5 leading-relaxed text-[11px]">
                        Hoy experimentas tu mayor vitalidad y elocuencia verbal. Momento ideal para reuniones clave y entrenamiento intenso.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-stone-50 border border-stone-200/60">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-stone-800">Elevación BBT Confirmada</p>
                      <p className="text-stone-600 mt-0.5 text-[11px]">
                        Temperatura basal en 36.65°C confirmando cambio bifásico post-ovulación.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Lateral Trigger Button */}
        <button
          onClick={onOpenChat}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-800 bg-amber-100/70 hover:bg-amber-100 border border-amber-300/80 rounded-lg transition-colors whitespace-nowrap active:scale-[0.98]"
          title="Abrir Chat con Cyclia"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span className="hidden sm:inline">Chat con Cyclia</span>
          <span className="sm:hidden">Chat</span>
        </button>

        {/* Primary Action Button */}
        <button
          onClick={onOpenLogModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors shadow-xs whitespace-nowrap active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Datos</span>
        </button>
      </div>
    </header>
  );
};
