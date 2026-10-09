import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceArea, 
  ReferenceLine 
} from 'recharts';
import { Brain, TrendingUp, Sparkles, ChevronRight, Activity, Smile } from 'lucide-react';
import { CyclePhaseInfo } from '../types/cycle';
import { 
  DEFAULT_CYCLE_MOODS, 
  MOOD_DEFINITIONS, 
  buildChartData, 
  MoodType 
} from '../data/moodData';

interface MoodAnalyticsPreviewCardProps {
  currentDay: number;
  currentPhase: CyclePhaseInfo;
  currentMood?: MoodType;
  onOpenFullAnalytics: () => void;
}

export const MoodAnalyticsPreviewCard: React.FC<MoodAnalyticsPreviewCardProps> = ({
  currentDay,
  currentPhase,
  currentMood = 'vibrant',
  onOpenFullAnalytics
}) => {
  // Read records from localStorage if available
  let records = DEFAULT_CYCLE_MOODS;
  try {
    const saved = localStorage.getItem('femme_cycle_mood_records_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 28) {
        records = parsed;
      }
    }
  } catch (e) {
    // ignore
  }

  const chartData = buildChartData(records);
  const activeMoodMeta = MOOD_DEFINITIONS[currentMood] || MOOD_DEFINITIONS.vibrant;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-0.5">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-semibold border border-violet-200/60 text-[11px]">
              <Brain className="w-3.5 h-3.5" />
              Mood Analytics
            </span>
            <span aria-hidden="true">·</span>
            <span>Correlación con Fases Biológicas</span>
          </div>
          <h3 className="font-display text-lg font-medium text-stone-900">
            Frecuencia & Trayectoria Emocional del Ciclo
          </h3>
        </div>

        <button
          onClick={onOpenFullAnalytics}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <span>Explorar Analítica Completa</span>
          <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
        </button>
      </div>

      {/* Mini metric bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200/60">
          <div className="text-[11px] text-stone-500 font-medium">Estado Hoy (Día {currentDay})</div>
          <div className="text-sm font-bold text-stone-900 flex items-center gap-1.5 mt-0.5">
            <span>{activeMoodMeta.emoji}</span>
            <span>{activeMoodMeta.shortLabel}</span>
          </div>
        </div>

        <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200/60">
          <div className="text-[11px] text-stone-500 font-medium">Fase Actual</div>
          <div className="text-sm font-bold text-stone-900 mt-0.5 truncate">
            {currentPhase.name}
          </div>
        </div>

        <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200/60">
          <div className="text-[11px] text-stone-500 font-medium">Pico Radiante</div>
          <div className="text-sm font-bold text-amber-700 mt-0.5">
            Días 13–15 (Ovulación)
          </div>
        </div>

        <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200/60">
          <div className="text-[11px] text-stone-500 font-medium">Sensibilidad Lútea</div>
          <div className="text-sm font-bold text-indigo-700 mt-0.5">
            Días 24–27 (SPM)
          </div>
        </div>
      </div>

      {/* Recharts Line Chart Preview */}
      <div className="w-full h-56 pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            {/* Phase Reference Areas */}
            <ReferenceArea x1={1} x2={5} fill="#FFE4E6" fillOpacity={0.4} />
            <ReferenceArea x1={6} x2={13} fill="#D1FAE5" fillOpacity={0.35} />
            <ReferenceArea x1={14} x2={16} fill="#FEF3C7" fillOpacity={0.45} />
            <ReferenceArea x1={17} x2={28} fill="#E0E7FF" fillOpacity={0.3} />

            {/* Current Day line */}
            <ReferenceLine
              x={currentDay}
              stroke="#1C1917"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{ value: `Hoy`, position: 'top', fill: '#1C1917', fontSize: 10, fontWeight: 700 }}
            />

            <XAxis dataKey="day" stroke="#A8A29E" fontSize={10} tickFormatter={(d) => `D${d}`} interval={2} />
            <YAxis domain={[0, 100]} stroke="#A8A29E" fontSize={10} tickFormatter={(v) => `${v}%`} ticks={[0, 50, 100]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload;
                  return (
                    <div className="bg-stone-900 text-stone-100 p-2.5 rounded-lg text-xs shadow-md space-y-1">
                      <div className="font-bold text-amber-300">Día {pt.day} · {pt.phaseName}</div>
                      <div>Estado: {MOOD_DEFINITIONS[pt.mood as MoodType].emoji} {MOOD_DEFINITIONS[pt.mood as MoodType].shortLabel}</div>
                      <div className="text-stone-400 font-mono">Bienestar: {pt.rollingWellness}%</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Global Wellness Line */}
            <Line
              type="monotone"
              dataKey="rollingWellness"
              name="Bienestar General"
              stroke="#1C1917"
              strokeWidth={2.5}
              dot={{ r: 2 }}
            />
            {/* Radiant Frequency */}
            <Line
              type="monotone"
              dataKey="vibrantFrequency"
              name="Radiante"
              stroke="#D97706"
              strokeWidth={1.8}
              dot={false}
            />
            {/* Sensitive Frequency */}
            <Line
              type="monotone"
              dataKey="irritableFrequency"
              name="Sensible"
              stroke="#E11D48"
              strokeWidth={1.8}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-900" />
            <span className="font-medium text-stone-700">Bienestar General</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="font-medium text-stone-700">Frec. Radiante</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="font-medium text-stone-700">Frec. Sensible (PMS)</span>
          </div>
        </div>
        <span className="text-[11px] text-stone-400">Bandas: Menstrual, Folicular, Ovulatoria, Lútea</span>
      </div>
    </div>
  );
};
