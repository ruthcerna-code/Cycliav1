import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  LogOut, 
  CalendarCheck, 
  Info,
  TrendingUp,
  Flame,
  ArrowRight
} from 'lucide-react';
import { CyclePhaseInfo } from '../types/cycle';
import { PHASES_DATA, HISTORICAL_CYCLES, getPhaseForDay } from '../data/cycleData';
import { 
  computeHistoricalStats, 
  generateNextProjectedCycles, 
  getProjectionForDate,
  formatSpanishDate
} from '../data/cycleProjections';
import { 
  auth, 
  signInWithGoogle, 
  logoutGoogle, 
  getAccessToken, 
  syncCycleToGoogleCalendar, 
  SyncResult 
} from '../services/googleAuth';
import { User, onAuthStateChanged } from 'firebase/auth';
import { CycleProjectionsCard } from './CycleProjectionsCard';

interface CalendarViewProps {
  currentDay: number;
  onSelectDay: (day: number) => void;
  currentPhase: CyclePhaseInfo;
  initialYear?: number;
  initialMonth?: number;
  onNavigateToCalendarMonth?: (year: number, month: number, day?: number) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentDay,
  onSelectDay,
  currentPhase,
  initialYear,
  initialMonth
}) => {
  // Calendar month state (0-indexed month)
  // September 2026 as baseline
  const [viewYear, setViewYear] = useState<number>(initialYear ?? 2026);
  const [viewMonth, setViewMonth] = useState<number>(initialMonth ?? 8); // 8 is September (0-indexed)

  // Selected date in calendar (defaults to today: Sep 25, 2026)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 8, 25));

  // Active view tab inside calendar section: 'calendar' or 'projections'
  const [calendarSubTab, setCalendarSubTab] = useState<'calendar' | 'projections' | 'both'>('both');

  // Auth & Google Calendar state
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Cycle start anchor date: Sep 12, 2026 (so Sep 25 is day 14 of cycle #43)
  const cycleAnchorStart = new Date(2026, 8, 12);
  const stats = computeHistoricalStats(HISTORICAL_CYCLES);
  const projectedCycles = generateNextProjectedCycles(cycleAnchorStart, HISTORICAL_CYCLES, 3, 43);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setGoogleUser(user);
    });
    return () => unsubscribe();
  }, []);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const jumpToCycle = (cycleStart: Date) => {
    setViewYear(cycleStart.getFullYear());
    setViewMonth(cycleStart.getMonth());
    setSelectedDate(new Date(cycleStart));
  };

  // Helper to calculate cycle day and projection information for any given date
  const getCycleDayForDate = (date: Date) => {
    const diffTime = date.getTime() - cycleAnchorStart.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Check if within current active cycle (#43): Days 0 to 27
    if (diffDays >= 0 && diffDays < 28) {
      const cycleDay = diffDays + 1;
      const phaseId = getPhaseForDay(cycleDay);
      return {
        cycleDay,
        phase: PHASES_DATA[phaseId],
        isCurrentCycle: true,
        isProjected: false,
        cycleNumber: 43,
        isOvulationPeak: cycleDay === 14,
        isPeriodStart: cycleDay === 1
      };
    }

    // Check future projected cycles (#44, #45, #46)
    if (diffDays >= 28) {
      const proj = getProjectionForDate(date, projectedCycles);
      if (proj.isProjected && proj.projectedCycle) {
        const phaseId = proj.phaseId || 'follicular';
        const phase = PHASES_DATA[phaseId];
        const isOvulationPeak = date.toDateString() === proj.projectedCycle.ovulationDate.toDateString();
        const isPeriodStart = proj.dayInCycle === 1;

        return {
          cycleDay: proj.dayInCycle || 1,
          phase,
          isCurrentCycle: false,
          isProjected: true,
          projectedCycle: proj.projectedCycle,
          cycleNumber: proj.projectedCycle.cycleNumber,
          isOvulationPeak,
          isPeriodStart
        };
      }
    }

    // Fallback for dates before anchor or beyond 3 projected cycles
    const normalizedDay = ((diffDays % 28) + 28) % 28 + 1;
    const phaseId = getPhaseForDay(normalizedDay);
    return {
      cycleDay: normalizedDay,
      phase: PHASES_DATA[phaseId],
      isCurrentCycle: false,
      isProjected: false,
      cycleNumber: Math.floor(diffDays / 28) + 43,
      isOvulationPeak: normalizedDay === 14,
      isPeriodStart: normalizedDay === 1
    };
  };

  // Generate days in month grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Monday = 0

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await signInWithGoogle();
      if (result) {
        setGoogleUser(result.user);
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'No se pudo completar el inicio de sesión con Google.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setSyncResult(null);
  };

  const handleExecuteCalendarSync = async () => {
    setShowConfirmModal(false);
    setIsSyncing(true);
    setAuthError(null);

    try {
      const token = getAccessToken();
      if (!token) {
        // Need to sign in first
        const authRes = await signInWithGoogle();
        if (!authRes?.accessToken) {
          throw new Error('Se requiere autenticación con Google Calendar.');
        }
        const res = await syncCycleToGoogleCalendar(authRes.accessToken, cycleAnchorStart, 28, 5, true);
        setSyncResult(res);
      } else {
        const res = await syncCycleToGoogleCalendar(token, cycleAnchorStart, 28, 5, true);
        setSyncResult(res);
      }
    } catch (err: any) {
      console.error('Error sincronizando calendario:', err);
      setAuthError('Ocurrió un error al crear los eventos en Google Calendar: ' + (err.message || ''));
    } finally {
      setIsSyncing(false);
    }
  };

  // Metadata for the currently selected date in the inspection card
  const selectedDateDayInfo = getCycleDayForDate(selectedDate);
  const isSelectedDateToday = 
    selectedDate.getDate() === 25 && 
    selectedDate.getMonth() === 8 && 
    selectedDate.getFullYear() === 2026;

  const selectedDateFormatted = selectedDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const capitalizedSelectedDate = selectedDateFormatted.charAt(0).toUpperCase() + selectedDateFormatted.slice(1);

  return (
    <div className="space-y-6">
      
      {/* Google Account & Calendar Synchronization Banner */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base sm:text-lg font-medium text-stone-900 leading-tight">
                  Sincronización con Google Calendar
                </h3>
                {googleUser && (
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Conectado
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {googleUser 
                  ? `Vinculado como ${googleUser.email || googleUser.displayName}. Exporta tus fases activas y las 3 proyecciones futuras a tu cuenta Gmail.`
                  : 'Vincula tu cuenta Gmail para exportar automáticamente tus fases y los próximos 3 ciclos proyectados a tu Google Calendar personal.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {!googleUser ? (
              <button
                onClick={handleGoogleSignIn}
                disabled={isAuthenticating}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-800 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-all shadow-xs disabled:opacity-60 active:scale-[0.98] cursor-pointer"
              >
                {/* Official Google 'G' Logo SVG */}
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>{isAuthenticating ? 'Conectando...' : 'Vincular cuenta Google'}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors shadow-xs disabled:opacity-50 cursor-pointer active:scale-[0.98]"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar a Google Calendar'}</span>
                </button>

                <button
                  onClick={handleGoogleSignOut}
                  className="p-2 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
                  title="Desvincular cuenta Google"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {authError && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {authError}
          </div>
        )}

        {/* Sync Success Feedback */}
        {syncResult && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>¡Sincronización completada!</strong> Se han exportado {syncResult.createdCount} eventos (ciclo actual y 3 ciclos proyectados) con sus fases menstruales y ventanas fértiles a tu cuenta de Google.
              </span>
            </div>
            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950 underline shrink-0"
            >
              <span>Abrir Google Calendar</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Main Interactive Cycle Calendar Card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs">
        
        {/* Quick Cycle Navigation Jumper Chips (Current + 3 Projections) */}
        <div className="pb-4 mb-4 border-b border-stone-100">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-stone-500 font-mono flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              Navegación de Ciclos Proyectados
            </span>
            <span className="text-[11px] text-stone-500 font-mono">
              Regularidad: <strong className="text-emerald-700">{stats.regularityScore}%</strong> (Media {stats.averageCycleLength}d)
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {/* Active Cycle Button */}
            <button
              onClick={() => jumpToCycle(cycleAnchorStart)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                viewMonth === 8 && viewYear === 2026
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Ciclo Actual #43 (Sep 2026)</span>
            </button>

            {/* Next 3 Projected Cycles Buttons */}
            {projectedCycles.map((pCycle, idx) => {
              const isCurrentView = viewMonth === pCycle.startDate.getMonth() && viewYear === pCycle.startDate.getFullYear();
              const monthLabel = pCycle.startDate.toLocaleDateString('es-ES', { month: 'short' });
              const capMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

              return (
                <button
                  key={pCycle.cycleNumber}
                  onClick={() => jumpToCycle(pCycle.startDate)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isCurrentView
                      ? 'bg-amber-600 text-white font-semibold shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isCurrentView ? 'bg-white' : 'bg-amber-500'}`} />
                  <span>Proyección #{pCycle.cycleNumber} · {capMonth} (+{idx + 1})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Calendar Month Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <CalendarIcon className="w-3.5 h-3.5 text-stone-500" />
              <span className="font-medium text-stone-700">Calendario Fisiológico y Predictivo</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {viewMonth === 8 && viewYear === 2026 
                  ? `Día ${currentDay} del Ciclo Activo` 
                  : `Visualizando fechas futuras`}
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-medium text-stone-900">
              {monthNames[viewMonth]} {viewYear}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setViewYear(2026);
                setViewMonth(8); // September
                setSelectedDate(new Date(2026, 8, 25));
                onSelectDay(14);
              }}
              className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              Hoy (Día 14)
            </button>
            <div className="flex items-center gap-1 border border-stone-200 rounded-lg p-0.5">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Phase Color Legend with Projection distinction */}
        <div className="py-3.5 flex flex-wrap items-center justify-between gap-y-2 text-xs text-stone-600 border-b border-stone-100">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="font-medium text-stone-800">Menstrual (D1–5)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="font-medium text-stone-800">Folicular (D6–13)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="font-medium text-stone-800">Ventana Fértil (D14–16)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="font-medium text-stone-800">Lútea (D17–28)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-stone-500">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Ovulación pico</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full border border-stone-400 bg-transparent" />
              <span>Días futuros proyectados</span>
            </span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="mt-4">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-stone-500 mb-2">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mié</div>
            <div>Jue</div>
            <div>Vie</div>
            <div>Sáb</div>
            <div>Dom</div>
          </div>

          {/* Days Cells */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Empty prefix slots */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[58px] sm:min-h-[74px] bg-stone-50/40 rounded-xl" />
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(viewYear, viewMonth, dayNum);
              const info = getCycleDayForDate(dateObj);
              const isToday = viewYear === 2026 && viewMonth === 8 && dayNum === 25;
              const isSelectedDate = 
                selectedDate.getDate() === dayNum && 
                selectedDate.getMonth() === viewMonth && 
                selectedDate.getFullYear() === viewYear;

              // Style per phase
              let bgClass = 'bg-stone-50/80 hover:bg-stone-100 text-stone-700 border-stone-200/60';
              let badgeColor = 'text-stone-500';

              if (info.phase.id === 'menstrual') {
                bgClass = info.isProjected 
                  ? 'bg-rose-50/70 hover:bg-rose-100/80 text-rose-950 border-rose-300 border-dashed'
                  : 'bg-rose-50/90 hover:bg-rose-100 text-rose-950 border-rose-200';
                badgeColor = 'text-rose-600 font-medium';
              } else if (info.phase.id === 'follicular') {
                bgClass = info.isProjected
                  ? 'bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-950 border-emerald-300 border-dashed'
                  : 'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-950 border-emerald-200';
                badgeColor = 'text-emerald-700';
              } else if (info.phase.id === 'ovulatory') {
                bgClass = info.isProjected
                  ? 'bg-amber-50/80 hover:bg-amber-100 text-amber-950 border-amber-300 border-dashed'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-200';
                badgeColor = 'text-amber-700 font-semibold';
              } else if (info.phase.id === 'luteal') {
                bgClass = info.isProjected
                  ? 'bg-indigo-50/60 hover:bg-indigo-100/70 text-indigo-950 border-indigo-300 border-dashed'
                  : 'bg-indigo-50/80 hover:bg-indigo-100 text-indigo-950 border-indigo-200';
                badgeColor = 'text-indigo-700';
              }

              return (
                <button
                  key={dayNum}
                  onClick={() => {
                    setSelectedDate(dateObj);
                    if (info.isCurrentCycle) {
                      onSelectDay(info.cycleDay);
                    }
                  }}
                  className={`
                    min-h-[58px] sm:min-h-[74px] p-1.5 sm:p-2 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer
                    ${bgClass}
                    ${isSelectedDate ? 'ring-2 ring-stone-900 ring-offset-1 font-bold shadow-xs' : ''}
                    ${isToday ? 'border-amber-500 ring-1 ring-amber-400' : ''}
                  `}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs sm:text-sm font-semibold font-mono tabular-nums leading-none ${isToday ? 'text-amber-950 font-bold' : ''}`}>
                      {dayNum}
                    </span>

                    <div className="flex items-center gap-1">
                      {info.isOvulationPeak && (
                        <span title="Ovulación pico estimada">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                        </span>
                      )}
                      {isToday && (
                        <span className="text-[9px] font-sans font-bold bg-amber-200 text-amber-900 px-1 rounded uppercase tracking-wider">
                          Hoy
                        </span>
                      )}
                      {info.isProjected && !isToday && (
                        <span className="text-[8px] font-mono font-medium text-stone-500 bg-white/70 px-1 rounded border border-stone-200">
                          #{info.cycleNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-[10px] sm:text-[11px] font-mono tabular-nums truncate mt-1">
                    <span className={badgeColor}>Día {info.cycleDay}</span>
                    <span className="block text-[9px] text-stone-500 font-sans truncate hidden sm:block">
                      {info.isProjected ? `${info.phase.name.replace('Fase ', '')} (Proy)` : info.phase.name.replace('Fase ', '')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Context Inspection Card */}
        <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4.5 rounded-xl bg-stone-50/80 border border-stone-200/70">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mb-1">
              <Info className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              <span className="font-semibold text-stone-800">{capitalizedSelectedDate}</span>
              <span aria-hidden="true">·</span>
              
              {selectedDateDayInfo.isCurrentCycle ? (
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-semibold">
                  Ciclo Actual #43 · Día {selectedDateDayInfo.cycleDay} de 28
                </span>
              ) : selectedDateDayInfo.isProjected ? (
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Ciclo Proyectado #{selectedDateDayInfo.cycleNumber} · Día {selectedDateDayInfo.cycleDay} de 28
                </span>
              ) : (
                <span className="font-mono tabular-nums">Día {selectedDateDayInfo.cycleDay} de 28</span>
              )}
            </div>

            <h4 className="font-display text-base font-semibold text-stone-900">
              {selectedDateDayInfo.phase.name} — Fertilidad: {selectedDateDayInfo.phase.conceptionChance === 'Peak' ? 'Pico Máximo' : selectedDateDayInfo.phase.conceptionChance}
              {selectedDateDayInfo.isOvulationPeak && ' ☀️ (Día de Ovulación Pico Estimado)'}
            </h4>

            <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
              {selectedDateDayInfo.isProjected 
                ? `Predicción para fechas futuras calculada a partir de tu regularidad histórica (${stats.regularityScore}%). Recomendación: ${selectedDateDayInfo.phase.summary}`
                : selectedDateDayInfo.phase.summary}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start md:self-auto shrink-0 text-xs">
            {selectedDateDayInfo.isProjected ? (
              <div className="text-right sm:text-right">
                <span className="text-[11px] text-amber-800 font-semibold block">
                  Proyección basada en histórico
                </span>
                <span className="text-[10px] text-stone-500 font-mono">
                  Margen de variación: ±{selectedDateDayInfo.projectedCycle?.varianceDays || 1}d
                </span>
              </div>
            ) : (
              <span className="text-xs text-stone-500 font-mono">
                {28 - selectedDateDayInfo.cycleDay > 0 
                  ? `Faltan ${28 - selectedDateDayInfo.cycleDay} días para el periodo` 
                  : 'Inicio de periodo estimado'}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Embedded 3-Cycle Predictive Forecasting Component */}
      <CycleProjectionsCard
        currentCycleStart={cycleAnchorStart}
        onNavigateToCalendarMonth={(year, month, day) => {
          setViewYear(year);
          setViewMonth(month);
          if (day) {
            setSelectedDate(new Date(year, month, day));
          }
        }}
      />

      {/* Confirmation Dialog Modal for Google Calendar Sync */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setShowConfirmModal(false)}
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-stone-200 p-6 shadow-xl z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-medium text-stone-900">
              ¿Sincronizar fases con Google Calendar?
            </h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Cyclia añadirá a tu Google Calendar principal ({googleUser?.email || 'tu cuenta'}) todos los eventos del ciclo actual y los próximos 3 ciclos proyectados:
            </p>
            <ul className="text-xs text-stone-700 mt-2 space-y-1.5 list-disc list-inside">
              <li>🩸 <strong>Fases Menstruales:</strong> Ciclo actual (#43) y próximos 3 ciclos (#44, #45, #46)</li>
              <li>☀️ <strong>Ventanas Fértiles y Ovulación:</strong> Días fértiles proyectados con alerta de pico</li>
              <li>🌙 <strong>Fases Lúteas:</strong> Desgloses para planificación deportiva y nutricional</li>
              <li>🔮 <strong>Total de 12 eventos de ciclo</strong> sincronizados con código de color</li>
            </ul>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteCalendarSync}
                className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Confirmar y Sincronizar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
