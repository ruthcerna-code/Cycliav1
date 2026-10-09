import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceArea, 
  ReferenceLine,
  Legend
} from 'recharts';
import { 
  Smile, 
  Sparkles, 
  Activity, 
  Heart, 
  Calendar, 
  Brain, 
  Zap, 
  Moon, 
  Filter, 
  Check, 
  RotateCcw, 
  TrendingUp, 
  Info,
  ChevronRight,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { CyclePhaseId, CyclePhaseInfo } from '../types/cycle';
import { 
  MoodType, 
  MOOD_DEFINITIONS, 
  DEFAULT_CYCLE_MOODS, 
  DayMoodRecord, 
  calculatePhaseMoodStats, 
  buildChartData,
  ChartDayPoint
} from '../data/moodData';
import { getPhaseForDay, PHASES_DATA } from '../data/cycleData';

interface MoodAnalyticsViewProps {
  currentDay: number;
  onSelectDay: (day: number) => void;
  currentPhase: CyclePhaseInfo;
  onUpdateCurrentDayMood?: (mood: MoodType) => void;
}

const STORAGE_KEY = 'femme_cycle_mood_records_v1';

export const MoodAnalyticsView: React.FC<MoodAnalyticsViewProps> = ({
  currentDay,
  onSelectDay,
  currentPhase,
  onUpdateCurrentDayMood
}) => {
  // Load persisted mood records or fallback to default dataset
  const [moodRecords, setMoodRecords] = useState<DayMoodRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 28) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading mood records from localStorage:', e);
    }
    return DEFAULT_CYCLE_MOODS;
  });

  // Active day being inspected in the detailed editor panel
  const [inspectDay, setInspectDay] = useState<number>(currentDay);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Line toggles in the chart
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({
    rollingWellness: true,
    vibrantFrequency: true,
    focusedFrequency: true,
    peacefulFrequency: true,
    reflectiveFrequency: false,
    irritableFrequency: true
  });

  // Selected phase filter to highlight
  const [highlightedPhase, setHighlightedPhase] = useState<CyclePhaseId | 'all'>('all');

  // Keep inspectDay in sync if currentDay prop changes and inspectDay was currentDay
  useEffect(() => {
    if (inspectDay === currentDay) {
      setInspectDay(currentDay);
    }
  }, [currentDay]);

  // Persist to localStorage whenever moodRecords change
  const saveRecords = (newRecords: DayMoodRecord[]) => {
    setMoodRecords(newRecords);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
    } catch (e) {
      console.warn('Failed saving mood records:', e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Update a single day's mood
  const handleUpdateDayMood = (day: number, newMood: MoodType, intensity = 4, note?: string) => {
    const updated = moodRecords.map(r => {
      if (r.day === day) {
        return {
          ...r,
          mood: newMood,
          intensity,
          note: note !== undefined ? note : r.note
        };
      }
      return r;
    });

    saveRecords(updated);
    if (day === currentDay && onUpdateCurrentDayMood) {
      onUpdateCurrentDayMood(newMood);
    }
    showToast(`Día ${day}: Estado actualizado a ${MOOD_DEFINITIONS[newMood].shortLabel}`);
  };

  // Reset to default baseline data
  const handleResetData = () => {
    if (window.confirm('¿Deseas restablecer los datos de estados de ánimo del ciclo a los valores fisiológicos basales?')) {
      saveRecords(DEFAULT_CYCLE_MOODS);
      showToast('Datos de estados de ánimo restablecidos con éxito');
    }
  };

  // Compute stats and chart points
  const phaseStats = calculatePhaseMoodStats(moodRecords);
  const chartData = buildChartData(moodRecords);

  // Inspected day record
  const currentInspectRecord = moodRecords.find(r => r.day === inspectDay) || moodRecords[inspectDay - 1] || moodRecords[0];
  const inspectPhaseId = getPhaseForDay(inspectDay);
  const inspectPhaseInfo = PHASES_DATA[inspectPhaseId];

  // Overall cycle metrics
  const totalValenceSum = moodRecords.reduce((acc, r) => acc + MOOD_DEFINITIONS[r.mood].valenceScore, 0);
  const overallEmotionalScore = Math.round(totalValenceSum / moodRecords.length);

  // Overall most frequent mood
  const overallMoodCounts: Record<MoodType, number> = {
    peaceful: 0,
    focused: 0,
    vibrant: 0,
    reflective: 0,
    irritable: 0
  };
  moodRecords.forEach(r => {
    overallMoodCounts[r.mood] = (overallMoodCounts[r.mood] || 0) + 1;
  });

  let topMoodKey: MoodType = 'focused';
  let topMoodCount = 0;
  (Object.keys(overallMoodCounts) as MoodType[]).forEach(k => {
    if (overallMoodCounts[k] > topMoodCount) {
      topMoodCount = overallMoodCounts[k];
      topMoodKey = k;
    }
  });
  const topMoodMeta = MOOD_DEFINITIONS[topMoodKey];
  const topMoodPercent = Math.round((topMoodCount / moodRecords.length) * 100);

  // Toggle line helper
  const toggleLine = (key: string) => {
    setVisibleLines(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-stone-100 text-xs px-4 py-2.5 rounded-xl shadow-lg border border-stone-800 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 font-semibold border border-violet-200/60 text-[11px]">
                <Brain className="w-3.5 h-3.5" />
                Mood Analytics & Neuro-Endocrinología
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-600 font-medium">Ciclo Actual de 28 Días</span>
            </div>
            <h2 className="font-display text-2xl font-semibold text-stone-900 tracking-tight">
              Analítica de Estados de Ánimo y Fases del Ciclo
            </h2>
            <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
              Visualiza cómo fluctúa tu valencia emocional y la frecuencia de cada estado psicológico a lo largo del ciclo, correlacionado de forma directa con los picos hormonales de estrógeno, progesterona y LH.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              onClick={handleResetData}
              className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Restablecer datos basales del ciclo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
            <button
              onClick={() => onSelectDay(inspectDay)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>Sincronizar Día {inspectDay}</span>
            </button>
          </div>
        </div>

        {/* 4 High-Level Key Performance Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-5">
          {/* KPI 1: Estado Dominante */}
          <div className="bg-[#FAF8F5] rounded-xl p-3.5 border border-stone-200/60">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>Estado Dominante</span>
              <span className="text-base">{topMoodMeta.emoji}</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-stone-900 truncate">
              {topMoodMeta.shortLabel}
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Representa el <strong className="text-stone-800">{topMoodPercent}%</strong> del ciclo actual
            </div>
          </div>

          {/* KPI 2: Bienestar Emocional Medio */}
          <div className="bg-[#FAF8F5] rounded-xl p-3.5 border border-stone-200/60">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>Valencia Emocional</span>
              <Heart className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-base sm:text-lg font-bold text-stone-900">
              {overallEmotionalScore} <span className="text-xs font-normal text-stone-500">/ 100</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Estabilidad alta y armónica</span>
            </div>
          </div>

          {/* KPI 3: Fase de Mayor Vitalidad */}
          <div className="bg-[#FAF8F5] rounded-xl p-3.5 border border-stone-200/60">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>Pico de Vitalidad</span>
              <Flame className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-base sm:text-lg font-bold text-stone-900">
              Ovulatoria
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Días 14–16 · 70% Radiante
            </div>
          </div>

          {/* KPI 4: Fase de Mayor Sensibilidad */}
          <div className="bg-[#FAF8F5] rounded-xl p-3.5 border border-stone-200/60">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>Ventana Vulnerable</span>
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="text-base sm:text-lg font-bold text-stone-900">
              Lútea Tardía
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Días 24–27 · Caída estrogénica
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Card with Recharts */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
        {/* Controls and Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-0.5">
              <Activity className="w-3.5 h-3.5 text-stone-500" />
              <span className="font-semibold text-stone-700">Frecuencia & Trayectoria Temporal</span>
              <span aria-hidden="true">·</span>
              <span>28 Días con Bandas de Fase</span>
            </div>
            <h3 className="font-display text-lg font-medium text-stone-900">
              Fluctuación de Estados de Ánimo según la Fase Biológica
            </h3>
          </div>

          {/* Phase Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100/80 rounded-xl text-xs overflow-x-auto">
            <button
              onClick={() => setHighlightedPhase('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                highlightedPhase === 'all'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setHighlightedPhase('menstrual')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                highlightedPhase === 'menstrual'
                  ? 'bg-rose-100 text-rose-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Menstrual
            </button>
            <button
              onClick={() => setHighlightedPhase('follicular')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                highlightedPhase === 'follicular'
                  ? 'bg-emerald-100 text-emerald-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Folicular
            </button>
            <button
              onClick={() => setHighlightedPhase('ovulatory')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                highlightedPhase === 'ovulatory'
                  ? 'bg-amber-100 text-amber-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Ovulatoria
            </button>
            <button
              onClick={() => setHighlightedPhase('luteal')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                highlightedPhase === 'luteal'
                  ? 'bg-indigo-100 text-indigo-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Lútea
            </button>
          </div>
        </div>

        {/* Phase Color Legend and Line Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          {/* Phase reference areas indicators */}
          <div className="flex items-center gap-3 text-stone-600">
            <span className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider">Fases:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-200 border border-rose-300" />
              <span>Menstrual (1-5)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-200 border border-emerald-300" />
              <span>Folicular (6-13)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-200 border border-amber-300" />
              <span>Ovulatoria (14-16)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-indigo-200 border border-indigo-300" />
              <span>Lútea (17-28)</span>
            </div>
          </div>

          {/* Interactive Line Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider">Líneas:</span>
            
            <button
              type="button"
              onClick={() => toggleLine('rollingWellness')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                visibleLines.rollingWellness
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Bienestar General</span>
            </button>

            <button
              type="button"
              onClick={() => toggleLine('vibrantFrequency')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                visibleLines.vibrantFrequency
                  ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold'
                  : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Radiante</span>
            </button>

            <button
              type="button"
              onClick={() => toggleLine('focusedFrequency')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                visibleLines.focusedFrequency
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                  : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Enfocada</span>
            </button>

            <button
              type="button"
              onClick={() => toggleLine('peacefulFrequency')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                visibleLines.peacefulFrequency
                  ? 'bg-blue-50 text-blue-800 border-blue-300 font-semibold'
                  : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Serena</span>
            </button>

            <button
              type="button"
              onClick={() => toggleLine('reflectiveFrequency')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                visibleLines.reflectiveFrequency
                  ? 'bg-violet-50 text-violet-800 border-violet-300 font-semibold'
                  : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-violet-500" />
              <span>Reflexiva</span>
            </button>

            <button
              type="button"
              onClick={() => toggleLine('irritableFrequency')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                visibleLines.irritableFrequency
                  ? 'bg-rose-50 text-rose-800 border-rose-300 font-semibold'
                  : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Sensible (PMS)</span>
            </button>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="w-full h-80 sm:h-96 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length > 0) {
                  const clickedDay = e.activePayload[0].payload.day;
                  if (clickedDay) {
                    setInspectDay(clickedDay);
                  }
                }
              }}
              margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EC" vertical={false} />
              
              {/* Phase Reference Areas */}
              <ReferenceArea
                x1={1}
                x2={5}
                y1={0}
                y2={100}
                fill="#FFE4E6"
                fillOpacity={highlightedPhase === 'menstrual' ? 0.8 : highlightedPhase === 'all' ? 0.45 : 0.15}
              />
              <ReferenceArea
                x1={6}
                x2={13}
                y1={0}
                y2={100}
                fill="#D1FAE5"
                fillOpacity={highlightedPhase === 'follicular' ? 0.75 : highlightedPhase === 'all' ? 0.4 : 0.15}
              />
              <ReferenceArea
                x1={14}
                x2={16}
                y1={0}
                y2={100}
                fill="#FEF3C7"
                fillOpacity={highlightedPhase === 'ovulatory' ? 0.8 : highlightedPhase === 'all' ? 0.5 : 0.15}
              />
              <ReferenceArea
                x1={17}
                x2={28}
                y1={0}
                y2={100}
                fill="#E0E7FF"
                fillOpacity={highlightedPhase === 'luteal' ? 0.75 : highlightedPhase === 'all' ? 0.35 : 0.15}
              />

              {/* Reference line for the user's current day in the cycle */}
              <ReferenceLine
                x={currentDay}
                stroke="#1C1917"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: `Hoy: D${currentDay}`,
                  position: 'top',
                  fill: '#1C1917',
                  fontSize: 11,
                  fontWeight: 600
                }}
              />

              {/* Active Inspected Day Reference Line */}
              {inspectDay !== currentDay && (
                <ReferenceLine
                  x={inspectDay}
                  stroke="#78716C"
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                  label={{
                    value: `Inspección: D${inspectDay}`,
                    position: 'insideTopLeft',
                    fill: '#57534E',
                    fontSize: 10
                  }}
                />
              )}

              <XAxis
                dataKey="day"
                tickLine={false}
                stroke="#A8A29E"
                fontSize={11}
                tickFormatter={(day) => `D${day}`}
                interval={1}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                stroke="#A8A29E"
                fontSize={11}
                tickFormatter={(val) => `${val}%`}
                ticks={[0, 25, 50, 75, 100]}
              />

              <Tooltip content={<CustomMoodChartTooltip />} />

              {/* Rolling Wellness Score line */}
              {visibleLines.rollingWellness && (
                <Line
                  type="monotone"
                  dataKey="rollingWellness"
                  name="Bienestar General"
                  stroke="#1C1917"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#1C1917', strokeWidth: 1, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, fill: '#1C1917', stroke: '#F59E0B', strokeWidth: 2 }}
                />
              )}

              {/* Vibrant Mood Frequency */}
              {visibleLines.vibrantFrequency && (
                <Line
                  type="monotone"
                  dataKey="vibrantFrequency"
                  name="Frecuencia Radiante"
                  stroke="#D97706"
                  strokeWidth={2.2}
                  dot={{ r: 2.5, fill: '#D97706' }}
                  activeDot={{ r: 5 }}
                />
              )}

              {/* Focused Mood Frequency */}
              {visibleLines.focusedFrequency && (
                <Line
                  type="monotone"
                  dataKey="focusedFrequency"
                  name="Frecuencia Enfocada"
                  stroke="#059669"
                  strokeWidth={2.2}
                  dot={{ r: 2.5, fill: '#059669' }}
                  activeDot={{ r: 5 }}
                />
              )}

              {/* Peaceful Mood Frequency */}
              {visibleLines.peacefulFrequency && (
                <Line
                  type="monotone"
                  dataKey="peacefulFrequency"
                  name="Frecuencia Serena"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: '#2563EB' }}
                  activeDot={{ r: 5 }}
                />
              )}

              {/* Reflective Mood Frequency */}
              {visibleLines.reflectiveFrequency && (
                <Line
                  type="monotone"
                  dataKey="reflectiveFrequency"
                  name="Frecuencia Reflexiva"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: '#7C3AED' }}
                  activeDot={{ r: 5 }}
                />
              )}

              {/* Irritable / Sensitive Mood Frequency */}
              {visibleLines.irritableFrequency && (
                <Line
                  type="monotone"
                  dataKey="irritableFrequency"
                  name="Frecuencia Sensible"
                  stroke="#E11D48"
                  strokeWidth={2.2}
                  dot={{ r: 2.5, fill: '#E11D48' }}
                  activeDot={{ r: 5 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-stone-400" />
            Haz clic en cualquier punto del gráfico para inspeccionar o editar el estado de ese día
          </span>
          <span className="font-mono text-stone-400">
            Día actual: {currentDay} / 28
          </span>
        </div>
      </div>

      {/* Interactive Day Inspector & Mood Modifier Panel */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-0.5">
              <span className="font-semibold text-stone-700">Editor Dinámico</span>
              <span aria-hidden="true">·</span>
              <span>Personaliza tu historial diario de estados</span>
            </div>
            <h3 className="font-display text-lg font-medium text-stone-900">
              Registrar o Modificar Estado para el Día {inspectDay}
            </h3>
          </div>

          {/* Quick day slider / selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-600">Día del ciclo:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setInspectDay(prev => Math.max(1, prev - 1))}
                disabled={inspectDay <= 1}
                className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-30 text-stone-700 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ‹
              </button>
              <span className="w-10 text-center font-mono font-bold text-sm text-stone-900">
                {inspectDay}
              </span>
              <button
                onClick={() => setInspectDay(prev => Math.min(28, prev + 1))}
                disabled={inspectDay >= 28}
                className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-30 text-stone-700 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Mini Day-Chip Strip (1 to 28) */}
        <div>
          <div className="text-xs text-stone-500 mb-2 flex items-center justify-between">
            <span>Selecciona un día para inspeccionar su registro:</span>
            <span className="text-[11px] font-medium text-stone-600">
              Fase: <strong className={inspectPhaseInfo.textAccent}>{inspectPhaseInfo.name}</strong>
            </span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            {Array.from({ length: 28 }, (_, i) => i + 1).map(day => {
              const rec = moodRecords.find(r => r.day === day);
              const moodMeta = rec ? MOOD_DEFINITIONS[rec.mood] : MOOD_DEFINITIONS.peaceful;
              const isSelected = day === inspectDay;
              const isToday = day === currentDay;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setInspectDay(day)}
                  className={`shrink-0 w-9 h-12 rounded-xl flex flex-col items-center justify-center text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs scale-105 z-10'
                      : isToday
                      ? 'bg-amber-100 text-stone-900 border-amber-300 font-bold'
                      : 'bg-stone-50 text-stone-700 border-stone-200/80 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-[10px] opacity-80">D{day}</span>
                  <span className="text-xs mt-0.5">{moodMeta.emoji}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Day State Editor */}
        <div className="bg-[#FAF8F5] rounded-xl p-5 border border-stone-200/70">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Column 1: Current Status of the day */}
            <div className="space-y-3">
              <div className="text-xs text-stone-500 font-medium">Estado actual en el Día {inspectDay}</div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{MOOD_DEFINITIONS[currentInspectRecord.mood].emoji}</span>
                <div>
                  <div className="font-semibold text-stone-900">
                    {MOOD_DEFINITIONS[currentInspectRecord.mood].label}
                  </div>
                  <div className="text-xs text-stone-500">
                    Valencia emocional: <strong className="text-stone-800">{MOOD_DEFINITIONS[currentInspectRecord.mood].valenceScore}%</strong>
                  </div>
                </div>
              </div>
              <div className="text-xs text-stone-600 bg-white p-3 rounded-lg border border-stone-200/60 leading-relaxed">
                <strong>Nota registrada:</strong> {currentInspectRecord.note || 'Sin nota específica para este día.'}
              </div>
            </div>

            {/* Column 2: Choose New Mood */}
            <div className="md:col-span-2 space-y-3">
              <div className="text-xs text-stone-500 font-medium">
                Cambiar estado de ánimo para este día:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(Object.keys(MOOD_DEFINITIONS) as MoodType[]).map(mKey => {
                  const meta = MOOD_DEFINITIONS[mKey];
                  const isCurrent = currentInspectRecord.mood === mKey;

                  return (
                    <button
                      key={mKey}
                      type="button"
                      onClick={() => handleUpdateDayMood(inspectDay, mKey, currentInspectRecord.intensity)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-stone-900 text-white border-stone-900 shadow-xs ring-2 ring-stone-900/10'
                          : 'bg-white text-stone-800 border-stone-200/80 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{meta.emoji}</span>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-amber-300" />}
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-semibold leading-tight">{meta.shortLabel}</div>
                        <div className={`text-[10px] ${isCurrent ? 'text-stone-300' : 'text-stone-500'} mt-0.5`}>
                          {meta.valenceScore} pts
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Note input for this day */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Añade una nota o síntoma observado en este día..."
                  defaultValue={currentInspectRecord.note || ''}
                  key={`${inspectDay}-${currentInspectRecord.mood}`}
                  onBlur={(e) => {
                    if (e.target.value !== currentInspectRecord.note) {
                      handleUpdateDayMood(inspectDay, currentInspectRecord.mood, currentInspectRecord.intensity, e.target.value);
                    }
                  }}
                  className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Correlated Cycle Phase Analysis Breakdown (4 Columns) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-medium text-stone-900">
              Correlación Fisiológica por Fase del Ciclo
            </h3>
            <p className="text-xs text-stone-500">
              Desglose detallado del impacto endocrino en tu perfil psico-emocional
            </p>
          </div>
          <span className="text-xs text-stone-500 font-mono">4 Fases Integradas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Phase 1: Menstrual */}
          <PhaseCorrelationCard
            phaseId="menstrual"
            phaseName="Fase Menstrual"
            daysRange="Días 1 – 5"
            colorBadge="bg-rose-50 text-rose-700 border-rose-200"
            borderAccent="hover:border-rose-300"
            stats={phaseStats.menstrual}
            onSelectPhase={() => setHighlightedPhase('menstrual')}
          />

          {/* Phase 2: Follicular */}
          <PhaseCorrelationCard
            phaseId="follicular"
            phaseName="Fase Folicular"
            daysRange="Días 6 – 13"
            colorBadge="bg-emerald-50 text-emerald-700 border-emerald-200"
            borderAccent="hover:border-emerald-300"
            stats={phaseStats.follicular}
            onSelectPhase={() => setHighlightedPhase('follicular')}
          />

          {/* Phase 3: Ovulatory */}
          <PhaseCorrelationCard
            phaseId="ovulatory"
            phaseName="Fase Ovulatoria"
            daysRange="Días 14 – 16"
            colorBadge="bg-amber-50 text-amber-800 border-amber-200"
            borderAccent="hover:border-amber-300"
            stats={phaseStats.ovulatory}
            onSelectPhase={() => setHighlightedPhase('ovulatory')}
          />

          {/* Phase 4: Luteal */}
          <PhaseCorrelationCard
            phaseId="luteal"
            phaseName="Fase Lútea"
            daysRange="Días 17 – 28"
            colorBadge="bg-indigo-50 text-indigo-800 border-indigo-200"
            borderAccent="hover:border-indigo-300"
            stats={phaseStats.luteal}
            onSelectPhase={() => setHighlightedPhase('luteal')}
          />
        </div>
      </div>
    </div>
  );
};

// Sub-component: Phase Correlation Card
interface PhaseCorrelationCardProps {
  phaseId: CyclePhaseId;
  phaseName: string;
  daysRange: string;
  colorBadge: string;
  borderAccent: string;
  stats: any;
  onSelectPhase: () => void;
}

const PhaseCorrelationCard: React.FC<PhaseCorrelationCardProps> = ({
  phaseId,
  phaseName,
  daysRange,
  colorBadge,
  borderAccent,
  stats,
  onSelectPhase
}) => {
  const dominantMeta = MOOD_DEFINITIONS[stats.dominantMood as MoodType];

  return (
    <div className={`bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs transition-all flex flex-col justify-between ${borderAccent}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colorBadge}`}>
            {phaseName}
          </span>
          <span className="text-[11px] font-mono text-stone-500 font-medium">
            {daysRange}
          </span>
        </div>

        {/* Dominant Mood in Phase */}
        <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">Estado Predominante</div>
            <div className="text-sm font-bold text-stone-900 flex items-center gap-1.5 mt-0.5">
              <span>{dominantMeta.emoji}</span>
              <span>{dominantMeta.shortLabel}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">Bienestar</div>
            <div className="text-sm font-mono font-bold text-stone-900 mt-0.5">
              {stats.averageValence}%
            </div>
          </div>
        </div>

        {/* Frequency Breakdown Mini Bars */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-semibold text-stone-700">Frecuencia en esta fase:</div>
          
          <div className="space-y-1 text-[11px]">
            {(Object.keys(stats.moodPercentages) as MoodType[]).map(mKey => {
              const pct = stats.moodPercentages[mKey];
              if (pct === 0) return null;
              const meta = MOOD_DEFINITIONS[mKey];

              return (
                <div key={mKey} className="flex items-center gap-2">
                  <span className="w-16 truncate text-stone-600 text-[10px] font-medium flex items-center gap-1">
                    <span>{meta.emoji}</span>
                    <span>{meta.shortLabel}</span>
                  </span>
                  <div className="flex-1 bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: meta.color }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-stone-500 w-7 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scientific Driver */}
        <div className="pt-2 border-t border-stone-100">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
            Motor Biológico
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            {stats.physiologicalDriver}
          </p>
        </div>
      </div>

      {/* Action footer */}
      <div className="pt-4 mt-2">
        <button
          onClick={onSelectPhase}
          className="w-full py-1.5 text-xs text-stone-700 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-lg font-medium border border-stone-200/60 transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>Destacar en Gráfico</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// Sub-component: Rich Tooltip for Recharts
const CustomMoodChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: ChartDayPoint = payload[0].payload;
    const moodMeta = MOOD_DEFINITIONS[data.mood];

    return (
      <div className="bg-stone-900 text-stone-100 p-3.5 rounded-xl shadow-xl border border-stone-800 text-xs space-y-2 min-w-56 max-w-72">
        {/* Header */}
        <div className="flex items-center justify-between pb-1.5 border-b border-stone-800">
          <div className="font-bold text-amber-300 text-sm">
            {data.dayLabel}
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 font-medium">
            {data.phaseName}
          </span>
        </div>

        {/* Recorded Mood */}
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-xl">{moodMeta.emoji}</span>
          <div>
            <div className="font-semibold text-white">{moodMeta.label}</div>
            <div className="text-[11px] text-stone-400">
              Valencia: <strong className="text-amber-300">{data.valenceScore} pts</strong>
            </div>
          </div>
        </div>

        {/* Note if any */}
        {data.note && (
          <div className="text-[11px] text-stone-300 italic bg-stone-800/80 p-1.5 rounded-md border border-stone-700/50">
            "{data.note}"
          </div>
        )}

        {/* Plotted values */}
        <div className="pt-1 space-y-1 text-[11px] border-t border-stone-800 font-mono">
          <div className="flex justify-between text-indigo-300">
            <span>Bienestar Móvil:</span>
            <span>{data.rollingWellness}%</span>
          </div>
          {data.vibrantFrequency > 0 && (
            <div className="flex justify-between text-amber-400">
              <span>Frec. Radiante:</span>
              <span>{data.vibrantFrequency}%</span>
            </div>
          )}
          {data.focusedFrequency > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Frec. Enfocada:</span>
              <span>{data.focusedFrequency}%</span>
            </div>
          )}
          {data.peacefulFrequency > 0 && (
            <div className="flex justify-between text-blue-400">
              <span>Frec. Serena:</span>
              <span>{data.peacefulFrequency}%</span>
            </div>
          )}
          {data.irritableFrequency > 0 && (
            <div className="flex justify-between text-rose-400">
              <span>Frec. Sensible:</span>
              <span>{data.irritableFrequency}%</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};
