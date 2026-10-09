import React, { useState } from 'react';
import { 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  CalendarDays,
  ChevronRight,
  Flame,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { ProjectedCycle } from '../types/cycle';
import { computeHistoricalStats, generateNextProjectedCycles } from '../data/cycleProjections';
import { HISTORICAL_CYCLES } from '../data/cycleData';

interface CycleProjectionsCardProps {
  onNavigateToCalendarMonth?: (year: number, month: number, day?: number) => void;
  currentCycleStart?: Date;
}

export const CycleProjectionsCard: React.FC<CycleProjectionsCardProps> = ({
  onNavigateToCalendarMonth,
  currentCycleStart = new Date(2026, 8, 12)
}) => {
  const stats = computeHistoricalStats(HISTORICAL_CYCLES);
  const projections = generateNextProjectedCycles(currentCycleStart, HISTORICAL_CYCLES, 3, 43);

  const [selectedCycleIndex, setSelectedCycleIndex] = useState<number>(0);
  const activeCycle: ProjectedCycle = projections[selectedCycleIndex];

  const handleJumpToCalendar = (cycle: ProjectedCycle) => {
    if (onNavigateToCalendarMonth) {
      onNavigateToCalendarMonth(cycle.startDate.getFullYear(), cycle.startDate.getMonth(), cycle.startDate.getDate());
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs">
      
      {/* Header with Title and Empirical Statistical Basis */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-medium text-stone-700">Modelo Predictivo Biorrítmico</span>
            <span aria-hidden="true">·</span>
            <span>Basado en tus últimos 4 ciclos</span>
          </div>
          <h3 className="font-display text-lg sm:text-xl font-medium text-stone-900">
            Proyección de los Próximos 3 Ciclos Menstruales
          </h3>
        </div>

        {/* Statistical Summary unboxed metadata */}
        <div className="flex items-center gap-3 text-xs text-stone-600 bg-stone-50/80 px-3 py-1.5 rounded-xl border border-stone-200/60 self-start sm:self-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500">Duración media:</span>
            <strong className="font-mono tabular-nums text-stone-900">{stats.averageCycleLength} días</strong>
          </div>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500">Regularidad:</span>
            <strong className="font-mono tabular-nums text-emerald-700">{stats.regularityScore}%</strong>
          </div>
        </div>
      </div>

      {/* 3 Projected Cycles Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-5">
        {projections.map((cycle, idx) => {
          const isSelected = selectedCycleIndex === idx;
          const monthLabel = cycle.startDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
          const capitalizedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

          return (
            <div
              key={cycle.cycleNumber}
              onClick={() => setSelectedCycleIndex(idx)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-stone-900 text-white border-stone-900 shadow-md ring-2 ring-stone-900/10'
                  : 'bg-stone-50/70 border-stone-200/70 hover:bg-stone-100/80 text-stone-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-semibold tracking-wider font-mono uppercase ${isSelected ? 'text-amber-300' : 'text-stone-500'}`}>
                    Ciclo #{cycle.cycleNumber} · +{idx + 1}
                  </span>
                  <span className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-stone-800 text-stone-300' : 'bg-stone-200/60 text-stone-600'
                  }`}>
                    {cycle.confidenceScore}% fiabilidad
                  </span>
                </div>

                <h4 className={`font-display text-base font-semibold leading-tight ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                  {capitalizedMonth}
                </h4>

                <p className={`text-xs font-mono tabular-nums mt-1 ${isSelected ? 'text-stone-300' : 'text-stone-600'}`}>
                  {cycle.formattedStartDate} – {cycle.formattedEndDate}
                </p>
              </div>

              <div className={`mt-4 pt-3 border-t text-[11px] space-y-1 ${isSelected ? 'border-stone-800 text-stone-300' : 'border-stone-200/60 text-stone-500'}`}>
                <div className="flex items-center justify-between">
                  <span>🩸 Menstruación:</span>
                  <strong className={`font-mono tabular-nums ${isSelected ? 'text-rose-300' : 'text-stone-700'}`}>
                    {cycle.phases.menstrual.formattedRange}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>☀️ Ovulación pico:</span>
                  <strong className={`font-mono tabular-nums ${isSelected ? 'text-amber-300' : 'text-stone-700'}`}>
                    {cycle.formattedOvulationDate}
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Inspection for Selected Projected Cycle */}
      <div className="mt-5 p-4 sm:p-5 rounded-xl bg-stone-50/70 border border-stone-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200/60">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-0.5">
              <CalendarDays className="w-3.5 h-3.5 text-stone-600" />
              <span className="font-semibold text-stone-800 font-mono">Detalle del Ciclo #{activeCycle.cycleNumber}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{activeCycle.totalLengthDays} días de duración</span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-500">Margen estimado: ±{activeCycle.varianceDays} día</span>
            </div>
            <h4 className="font-display text-base font-medium text-stone-900">
              Desglose Fisiológico Proyectado ({activeCycle.formattedStartDate} al {activeCycle.formattedEndDate})
            </h4>
          </div>

          {onNavigateToCalendarMonth && (
            <button
              onClick={() => handleJumpToCalendar(activeCycle)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-900 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Ver este ciclo en el Calendario</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
            </button>
          )}
        </div>

        {/* 4 Phases Timeline Grid for Selected Future Cycle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          
          {/* Phase 1: Menstrual */}
          <div className="p-3.5 rounded-xl bg-white border border-rose-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-rose-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Fase Menstrual
              </span>
              <span className="text-[10px] font-mono text-stone-500 tabular-nums">Días 1–{activeCycle.periodLengthDays}</span>
            </div>
            <p className="font-mono tabular-nums text-xs font-semibold text-stone-900">
              {activeCycle.phases.menstrual.formattedRange}
            </p>
            <p className="text-[11px] text-stone-600 mt-2 leading-relaxed">
              Inicio proyectado de menstruación. Priorizar descanso restaurador y alimentos ricos en hierro.
            </p>
          </div>

          {/* Phase 2: Follicular */}
          <div className="p-3.5 rounded-xl bg-white border border-emerald-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-emerald-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Fase Folicular
              </span>
              <span className="text-[10px] font-mono text-stone-500 tabular-nums">Días 6–13</span>
            </div>
            <p className="font-mono tabular-nums text-xs font-semibold text-stone-900">
              {activeCycle.phases.follicular.formattedRange}
            </p>
            <p className="text-[11px] text-stone-600 mt-2 leading-relaxed">
              Ascenso de estrógenos. Aumento progresivo de energía, creatividad y resistencia física.
            </p>
          </div>

          {/* Phase 3: Ovulatory */}
          <div className="p-3.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-amber-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Ventana Fértil
              </span>
              <span className="text-[10px] font-mono text-stone-500 tabular-nums">Días 14–16</span>
            </div>
            <p className="font-mono tabular-nums text-xs font-semibold text-stone-900">
              {activeCycle.phases.ovulatory.formattedRange}
            </p>
            <div className="mt-2 text-[11px] text-amber-900 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Ovulación estimada: <strong>{activeCycle.formattedOvulationDate}</strong></span>
            </div>
          </div>

          {/* Phase 4: Luteal */}
          <div className="p-3.5 rounded-xl bg-white border border-indigo-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-indigo-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Fase Lútea
              </span>
              <span className="text-[10px] font-mono text-stone-500 tabular-nums">Días 17–28</span>
            </div>
            <p className="font-mono tabular-nums text-xs font-semibold text-stone-900">
              {activeCycle.phases.luteal.formattedRange}
            </p>
            <p className="text-[11px] text-stone-600 mt-2 leading-relaxed">
              Progesterona dominante. Mayor enfoque en minuciosidad, yoga restaurador y alimentos reconfortantes.
            </p>
          </div>

        </div>

        {/* Quiet Scientific Note */}
        <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Algoritmo fisiológico ajustado a tus {HISTORICAL_CYCLES.length} ciclos registrados sin alteraciones externas.
          </span>
          <span className="font-mono tabular-nums hidden sm:inline">
            Desviación estándar: ±{stats.standardDeviation}d
          </span>
        </div>
      </div>

    </div>
  );
};
