import { CyclePhaseId } from '../types/cycle';
import { getPhaseForDay } from './cycleData';

export type MoodType = 'peaceful' | 'focused' | 'vibrant' | 'reflective' | 'irritable';

export interface MoodMeta {
  id: MoodType;
  label: string;
  shortLabel: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  valenceScore: number; // 0 to 100 emotional wellness score
  description: string;
}

export const MOOD_DEFINITIONS: Record<MoodType, MoodMeta> = {
  vibrant: {
    id: 'vibrant',
    label: 'Radiante / Vital',
    shortLabel: 'Radiante',
    emoji: '✨',
    color: '#D97706', // amber-600
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    valenceScore: 95,
    description: 'Alta energía expansiva, magnetismo social, agilidad mental y entusiasmo.'
  },
  focused: {
    id: 'focused',
    label: 'Enfocada / Lúcida',
    shortLabel: 'Enfocada',
    emoji: '🎯',
    color: '#059669', // emerald-600
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    valenceScore: 85,
    description: 'Claridad cognitiva, resolución eficiente de problemas y motivación orientada a metas.'
  },
  peaceful: {
    id: 'peaceful',
    label: 'Serena / Equilibrada',
    shortLabel: 'Serena',
    emoji: '🕊️',
    color: '#2563EB', // blue-600
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    valenceScore: 78,
    description: 'Calma interna profunda, estabilidad neuromuscular, balance y satisfacción.'
  },
  reflective: {
    id: 'reflective',
    label: 'Reflexiva / Introspectiva',
    shortLabel: 'Reflexiva',
    emoji: '🌙',
    color: '#7C3AED', // violet-600
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    valenceScore: 65,
    description: 'Sensibilidad perceptiva agudizada, deseo de repliegue, discernimiento e introspección.'
  },
  irritable: {
    id: 'irritable',
    label: 'Sensible / Vulnerable',
    shortLabel: 'Sensible',
    emoji: '⚡',
    color: '#E11D48', // rose-600
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    valenceScore: 42,
    description: 'Tensión emocional o psicofísica, sobreestimulación sensorial y reactividad hormonal.'
  }
};

export interface DayMoodRecord {
  day: number;
  mood: MoodType;
  intensity: number; // 1 to 5
  note?: string;
}

// Baseline realistic 28-day cycle mood dataset correlated with endocrine physiology
export const DEFAULT_CYCLE_MOODS: DayMoodRecord[] = [
  // Menstrual Phase (Days 1 - 5) - Basal hormone levels: introspective & calm
  { day: 1, mood: 'reflective', intensity: 4, note: 'Inicio del sangrado, necesidad de descanso cálido' },
  { day: 2, mood: 'reflective', intensity: 5, note: 'Introspección y desconexión intencional' },
  { day: 3, mood: 'peaceful', intensity: 3, note: 'Alivio del dolor pélvico, calma mental' },
  { day: 4, mood: 'peaceful', intensity: 4, note: 'Sensación de renovación y ligereza' },
  { day: 5, mood: 'focused', intensity: 3, note: 'Fin del flujo menstrual, energía en reactivación' },

  // Follicular Phase (Days 6 - 13) - Rising estrogen: clear mind, motivation & vibrancy
  { day: 6, mood: 'focused', intensity: 4, note: 'Planificación de metas semanales' },
  { day: 7, mood: 'focused', intensity: 4, note: 'Alta concentración en el trabajo y proyectos' },
  { day: 8, mood: 'focused', intensity: 5, note: 'Fluidez analítica excelente' },
  { day: 9, mood: 'vibrant', intensity: 4, note: 'Ganas de socializar y salir a entrenar' },
  { day: 10, mood: 'vibrant', intensity: 4, note: 'Creatividad desbordante' },
  { day: 11, mood: 'focused', intensity: 5, note: 'Resolución ágil de pendientes complejos' },
  { day: 12, mood: 'vibrant', intensity: 5, note: 'Excelente autoestima y vitalidad' },
  { day: 13, mood: 'vibrant', intensity: 5, note: 'Oleada previa a la ovulación, magnetismo' },

  // Ovulatory Phase (Days 14 - 16) - Peak estrogen & LH: peak radiance, communication
  { day: 14, mood: 'vibrant', intensity: 5, note: 'Día de ovulación: pico máximo de carisma y energía' },
  { day: 15, mood: 'vibrant', intensity: 5, note: 'Agilidad verbal en reuniones y socialización' },
  { day: 16, mood: 'peaceful', intensity: 4, note: 'Transición suave post-ovulación' },

  // Luteal Phase (Days 17 - 28) - Progesterone dominant, then premenstrual drop
  { day: 17, mood: 'peaceful', intensity: 4, note: 'Efecto calmante y sedante de la progesterona' },
  { day: 18, mood: 'focused', intensity: 4, note: 'Capacidad de síntesis y orden meticuloso' },
  { day: 19, mood: 'peaceful', intensity: 4, note: 'Ganas de actividades hogareñas tranquilas' },
  { day: 20, mood: 'focused', intensity: 3, note: 'Atención al detalle en tareas pendientes' },
  { day: 21, mood: 'peaceful', intensity: 3, note: 'Pico lúteo de progesterona' },
  { day: 22, mood: 'reflective', intensity: 3, note: 'Inicio de repliegue sensorial' },
  { day: 23, mood: 'reflective', intensity: 4, note: 'Filtro social bajo, preferencia por el silencio' },
  { day: 24, mood: 'irritable', intensity: 3, note: 'Leve tensión premenstrual por bajada estrogénica' },
  { day: 25, mood: 'irritable', intensity: 4, note: 'Sensibilidad a ruidos y demandas externas' },
  { day: 26, mood: 'irritable', intensity: 4, note: 'Mayor irritabilidad, necesidad de magnesio y descanso' },
  { day: 27, mood: 'reflective', intensity: 5, note: 'Cierre del ciclo, escucha corporal intuitiva' },
  { day: 28, mood: 'reflective', intensity: 4, note: 'Preparación para el nuevo ciclo menstrual' }
];

export interface PhaseMoodStats {
  phaseId: CyclePhaseId;
  totalDays: number;
  dominantMood: MoodType;
  averageValence: number;
  moodCounts: Record<MoodType, number>;
  moodPercentages: Record<MoodType, number>;
  physiologicalDriver: string;
  recommendation: string;
}

export function calculatePhaseMoodStats(records: DayMoodRecord[]): Record<CyclePhaseId, PhaseMoodStats> {
  const phases: CyclePhaseId[] = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
  const result: Partial<Record<CyclePhaseId, PhaseMoodStats>> = {};

  const drivers: Record<CyclePhaseId, { driver: string; recommendation: string }> = {
    menstrual: {
      driver: 'Niveles basales bajos de estrógeno y progesterona favorecen el descanso, la introspección reflexiva y el repliegue del sistema nervioso simpático.',
      recommendation: 'Acepta los momentos reflexivos sin autoexigencia; prioriza el sueño reparador y comidas tibias reconfortantes.'
    },
    follicular: {
      driver: 'Ascenso constante del estradiol que estimula los receptores de dopamina y serotonina, incrementando el enfoque mental, el optimismo y la resolución ejecutiva.',
      recommendation: 'Canaliza esta claridad cognitiva hacia proyectos ambiciosos, nuevos aprendizajes y entrenamientos de fuerza.'
    },
    ovulatory: {
      driver: 'Pico simultáneo de estrógeno, testosterona y oleada de LH; modula el estado de ánimo hacia la máxima vitalidad, carisma y apertura empática.',
      recommendation: 'Aprovecha tu pico radiante para conversaciones importantes, ponencias, vida social y colaboraciones creativas.'
    },
    luteal: {
      driver: 'Elevación de progesterona (que modula receptores GABA promoviendo calma inicial), seguido por una caída hormonal brusca que activa mayor sensibilidad e irritabilidad premenstrual.',
      recommendation: 'Reduce la sobrecarga social en los días 23-28. Incorpora magnesio, carbohidratos complejos y pausas conscientes para estabilizar la sensibilidad.'
    }
  };

  phases.forEach(phase => {
    const phaseRecords = records.filter(r => getPhaseForDay(r.day) === phase);
    const count = phaseRecords.length || 1;

    const moodCounts: Record<MoodType, number> = {
      peaceful: 0,
      focused: 0,
      vibrant: 0,
      reflective: 0,
      irritable: 0
    };

    let totalValence = 0;
    phaseRecords.forEach(r => {
      moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1;
      totalValence += MOOD_DEFINITIONS[r.mood].valenceScore;
    });

    const moodPercentages: Record<MoodType, number> = {
      peaceful: Math.round((moodCounts.peaceful / count) * 100),
      focused: Math.round((moodCounts.focused / count) * 100),
      vibrant: Math.round((moodCounts.vibrant / count) * 100),
      reflective: Math.round((moodCounts.reflective / count) * 100),
      irritable: Math.round((moodCounts.irritable / count) * 100)
    };

    // Find dominant mood
    let dominantMood: MoodType = 'peaceful';
    let maxCount = -1;
    (Object.keys(moodCounts) as MoodType[]).forEach(m => {
      if (moodCounts[m] > maxCount) {
        maxCount = moodCounts[m];
        dominantMood = m;
      }
    });

    result[phase] = {
      phaseId: phase,
      totalDays: count,
      dominantMood,
      averageValence: Math.round(totalValence / count),
      moodCounts,
      moodPercentages,
      physiologicalDriver: drivers[phase].driver,
      recommendation: drivers[phase].recommendation
    };
  });

  return result as Record<CyclePhaseId, PhaseMoodStats>;
}

export interface ChartDayPoint {
  day: number;
  dayLabel: string;
  phaseId: CyclePhaseId;
  phaseName: string;
  mood: MoodType;
  moodLabel: string;
  intensity: number;
  valenceScore: number;
  note: string;
  // Frequency metrics / presence indicators for individual lines
  vibrantFrequency: number;
  focusedFrequency: number;
  peacefulFrequency: number;
  reflectiveFrequency: number;
  irritableFrequency: number;
  // Moving average of emotional wellness
  rollingWellness: number;
}

export function buildChartData(records: DayMoodRecord[]): ChartDayPoint[] {
  const phaseNames: Record<CyclePhaseId, string> = {
    menstrual: 'Fase Menstrual',
    follicular: 'Fase Folicular',
    ovulatory: 'Fase Ovulatoria',
    luteal: 'Fase Lútea'
  };

  // Build moving window frequency for each mood up to that point
  return records.map((record, index) => {
    const phaseId = getPhaseForDay(record.day);
    const meta = MOOD_DEFINITIONS[record.mood];

    // Compute moving window (3-day window) mood scores for smooth line visualization
    const windowStart = Math.max(0, index - 1);
    const windowEnd = Math.min(records.length - 1, index + 1);
    const windowItems = records.slice(windowStart, windowEnd + 1);

    const countVibrant = windowItems.filter(r => r.mood === 'vibrant').length;
    const countFocused = windowItems.filter(r => r.mood === 'focused').length;
    const countPeaceful = windowItems.filter(r => r.mood === 'peaceful').length;
    const countReflective = windowItems.filter(r => r.mood === 'reflective').length;
    const countIrritable = windowItems.filter(r => r.mood === 'irritable').length;

    const windowSize = windowItems.length;
    const avgValence = Math.round(
      windowItems.reduce((acc, curr) => acc + MOOD_DEFINITIONS[curr.mood].valenceScore, 0) / windowSize
    );

    return {
      day: record.day,
      dayLabel: `Día ${record.day}`,
      phaseId,
      phaseName: phaseNames[phaseId],
      mood: record.mood,
      moodLabel: meta.shortLabel,
      intensity: record.intensity,
      valenceScore: meta.valenceScore,
      note: record.note || '',
      vibrantFrequency: Math.round((countVibrant / windowSize) * 100),
      focusedFrequency: Math.round((countFocused / windowSize) * 100),
      peacefulFrequency: Math.round((countPeaceful / windowSize) * 100),
      reflectiveFrequency: Math.round((countReflective / windowSize) * 100),
      irritableFrequency: Math.round((countIrritable / windowSize) * 100),
      rollingWellness: avgValence
    };
  });
}
