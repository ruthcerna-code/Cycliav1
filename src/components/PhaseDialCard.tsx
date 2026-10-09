import React from 'react';
import { CyclePhaseInfo, CyclePhaseId } from '../types/cycle';
import { PHASES_DATA } from '../data/cycleData';
import { Calendar, Flame, Heart, Zap, Sparkles } from 'lucide-react';

interface PhaseDialCardProps {
  currentDay: number;
  currentPhase: CyclePhaseInfo;
  onSelectDay: (day: number) => void;
}

export const PhaseDialCard: React.FC<PhaseDialCardProps> = ({
  currentDay,
  currentPhase,
  onSelectDay
}) => {
  const daysUntilNextPeriod = 28 - currentDay;

  // 4 phase segments configuration
  const phaseList: { id: CyclePhaseId; name: string; range: string; start: number; end: number; color: string }[] = [
    { id: 'menstrual', name: 'Menstrual', range: '1–5', start: 1, end: 5, color: '#E11D48' },
    { id: 'follicular', name: 'Follicular', range: '6–13', start: 6, end: 13, color: '#059669' },
    { id: 'ovulatory', name: 'Ovulatory', range: '14–16', start: 14, end: 16, color: '#D97706' },
    { id: 'luteal', name: 'Luteal', range: '17–28', start: 17, end: 28, color: '#4F46E5' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs transition-all">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: Visual Circular Dial & Phase Stepper (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-2 sm:p-4">
          <div className="relative w-56 h-56 flex items-center justify-center">
            {/* SVG Cycle Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="78"
                fill="none"
                stroke="#F5F5F4"
                strokeWidth="12"
              />
              
              {/* Menstrual Phase Arc (Days 1-5 = 5/28 ~ 17.8%) */}
              <circle
                cx="100"
                cy="100"
                r="78"
                fill="none"
                stroke="#FDA4AF"
                strokeWidth="12"
                strokeDasharray={`${(5/28) * 490} 490`}
                strokeDashoffset="0"
                className="opacity-70"
              />

              {/* Follicular Phase Arc (Days 6-13 = 8/28 ~ 28.5%) */}
              <circle
                cx="100"
                cy="100"
                r="78"
                fill="none"
                stroke="#6EE7B7"
                strokeWidth="12"
                strokeDasharray={`${(8/28) * 490} 490`}
                strokeDashoffset={`${-((5/28) * 490)}`}
                className="opacity-70"
              />

              {/* Ovulatory Phase Arc (Days 14-16 = 3/28 ~ 10.7%) */}
              <circle
                cx="100"
                cy="100"
                r="78"
                fill="none"
                stroke="#FCD34D"
                strokeWidth="12"
                strokeDasharray={`${(3/28) * 490} 490`}
                strokeDashoffset={`${-((13/28) * 490)}`}
                className="opacity-80"
              />

              {/* Luteal Phase Arc (Days 17-28 = 12/28 ~ 42.8%) */}
              <circle
                cx="100"
                cy="100"
                r="78"
                fill="none"
                stroke="#A5B4FC"
                strokeWidth="12"
                strokeDasharray={`${(12/28) * 490} 490`}
                strokeDashoffset={`${-((16/28) * 490)}`}
                className="opacity-70"
              />

              {/* Current Day Pointer Needle / Ring */}
              {(() => {
                const fraction = (currentDay - 0.5) / 28;
                const angle = fraction * 2 * Math.PI;
                const cx = 100 + 78 * Math.cos(angle);
                const cy = 100 + 78 * Math.sin(angle);
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="8"
                    fill={currentPhase.color}
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    className="filter drop-shadow-sm transition-all duration-300"
                  />
                );
              })()}
            </svg>

            {/* Inner Dial Metrics */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-xs uppercase tracking-wider text-stone-600 font-semibold mb-0.5">
                Día del Ciclo
              </span>
              <span className="font-display text-4xl sm:text-5xl font-semibold text-stone-900 leading-none">
                {currentDay}
              </span>
              <span className="text-xs text-stone-500 font-mono tabular-nums mt-1">
                de 28 días
              </span>
            </div>
          </div>

          {/* Quick day buttons bar */}
          <div className="mt-4 flex items-center justify-center gap-1.5 w-full max-w-xs">
            {phaseList.map((p) => {
              const isCurrentPhase = currentPhase.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectDay(p.start)}
                  className={`flex-1 py-1.5 px-2 text-[11px] font-medium rounded-lg text-center transition-all ${
                    isCurrentPhase
                      ? 'bg-stone-900 text-white font-semibold shadow-xs'
                      : 'bg-stone-100/90 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                  }`}
                >
                  <span className="block truncate">{p.name}</span>
                  <span className="block text-[10px] opacity-75 font-mono tabular-nums">D{p.range}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Biological Phase Breakdown & Hormone Status (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            {/* Clean unboxed metadata separator */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mb-1.5">
              <span className="font-medium text-stone-700">{currentPhase.daysRange}</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-stone-700">Fertilidad: {currentPhase.conceptionChance === 'Peak' ? 'Pico Máximo' : currentPhase.conceptionChance === 'Very Low' ? 'Muy Baja' : currentPhase.conceptionChance === 'Low' ? 'Baja' : 'Media'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {daysUntilNextPeriod > 0 ? `${daysUntilNextPeriod} días para el periodo` : 'Periodo iniciando hoy'}
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-medium text-stone-900 tracking-tight">
              {currentPhase.name}
            </h2>

            <p className="mt-2 text-stone-600 text-sm leading-relaxed">
              {currentPhase.summary}
            </p>
          </div>

          {/* Physiological Indicators Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-stone-100">
            <div className="p-3 rounded-xl bg-stone-50/80 border border-stone-200/60">
              <div className="flex items-center gap-1.5 text-xs text-stone-600 mb-1 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Estrógeno</span>
              </div>
              <p className="text-sm font-semibold text-stone-900 truncate">
                {currentPhase.estrogenStatus}
              </p>
              <p className="text-[11px] text-stone-600 mt-0.5">Soporte neurotransmisor alto</p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50/80 border border-stone-200/60">
              <div className="flex items-center gap-1.5 text-xs text-stone-600 mb-1 font-medium">
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                <span>Progesterona</span>
              </div>
              <p className="text-sm font-semibold text-stone-900 truncate">
                {currentPhase.progesteroneStatus}
              </p>
              <p className="text-[11px] text-stone-600 mt-0.5">Elevación metabólica basal</p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50/80 border border-stone-200/60">
              <div className="flex items-center gap-1.5 text-xs text-stone-600 mb-1 font-medium">
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Hormona LH</span>
              </div>
              <p className="text-sm font-semibold text-stone-900 truncate">
                {currentPhase.lhStatus}
              </p>
              <p className="text-[11px] text-stone-600 mt-0.5">Disparador ovulatorio</p>
            </div>
          </div>

          {/* Mindset & Energy Note */}
          <div className="p-3 rounded-xl bg-stone-100/70 border border-stone-200/60 text-xs text-stone-700 leading-relaxed flex items-start gap-2.5">
            <Heart className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-stone-900">Enfoque Biológico: </span>
              <span>{currentPhase.mindsetAdvice}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
