import { CycleHistoryEntry, ProjectedCycle } from '../types/cycle';
import { HISTORICAL_CYCLES } from './cycleData';

// Helper to add days to a Date
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Helper to format Date to Spanish short string: "10 Oct 2026"
export function formatSpanishDate(date: Date, includeYear: boolean = true): string {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  return includeYear ? `${day} ${month} ${date.getFullYear()}` : `${day} ${month}`;
}

// Helper to format Date to full Spanish string: "10 de Octubre de 2026"
export function formatFullSpanishDate(date: Date): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

export interface HistoricalStats {
  averageCycleLength: number;
  averagePeriodLength: number;
  averageOvulationDay: number;
  standardDeviation: number;
  regularityScore: number; // percentage, e.g. 98%
}

// Calculate statistical averages from user historical cycles
export function computeHistoricalStats(history: CycleHistoryEntry[] = HISTORICAL_CYCLES): HistoricalStats {
  if (!history || history.length === 0) {
    return {
      averageCycleLength: 28,
      averagePeriodLength: 5,
      averageOvulationDay: 14,
      standardDeviation: 0.5,
      regularityScore: 98
    };
  }

  const totalLengthSum = history.reduce((acc, c) => acc + c.totalLengthDays, 0);
  const periodLengthSum = history.reduce((acc, c) => acc + c.periodLengthDays, 0);
  const ovulationDaySum = history.reduce((acc, c) => acc + c.ovulationDay, 0);

  const avgLength = Math.round((totalLengthSum / history.length) * 10) / 10;
  const avgPeriod = Math.round((periodLengthSum / history.length) * 10) / 10;
  const avgOvulation = Math.round((ovulationDaySum / history.length) * 10) / 10;

  // Calculate variance / standard deviation of cycle lengths
  const variance = history.reduce((acc, c) => acc + Math.pow(c.totalLengthDays - avgLength, 2), 0) / history.length;
  const stdDev = Math.round(Math.sqrt(variance) * 10) / 10;

  // Regularity score (100 - penalty per day of deviation)
  const regularityScore = Math.max(80, Math.min(100, Math.round(100 - stdDev * 3.5)));

  return {
    averageCycleLength: avgLength,
    averagePeriodLength: avgPeriod,
    averageOvulationDay: avgOvulation,
    standardDeviation: stdDev,
    regularityScore
  };
}

// Project the next 3 menstrual cycles based on user history and current cycle start
export function generateNextProjectedCycles(
  currentCycleStart: Date = new Date(2026, 8, 12),
  history: CycleHistoryEntry[] = HISTORICAL_CYCLES,
  count: number = 3,
  latestCycleNumber: number = 43
): ProjectedCycle[] {
  const stats = computeHistoricalStats(history);
  const roundedCycleLen = Math.round(stats.averageCycleLength);
  const roundedPeriodLen = Math.round(stats.averagePeriodLength);
  const roundedOvulationDay = Math.round(stats.averageOvulationDay);

  const projectedList: ProjectedCycle[] = [];

  // Start with cycle 1 after current
  let nextCycleStartDate = addDays(currentCycleStart, roundedCycleLen);

  for (let i = 0; i < count; i++) {
    const cycleNum = latestCycleNumber + 1 + i;
    const cycleStart = new Date(nextCycleStartDate);
    const cycleEnd = addDays(cycleStart, roundedCycleLen - 1);

    // Phases breakdown:
    // 1. Menstrual: Days 1 to period length
    const menstrualStart = new Date(cycleStart);
    const menstrualEnd = addDays(menstrualStart, roundedPeriodLen - 1);

    // 2. Follicular: Day after menstrual to ovulation day - 2
    const follicularStart = addDays(menstrualEnd, 1);
    const follicularEnd = addDays(cycleStart, roundedOvulationDay - 3);

    // 3. Ovulatory / Fertile window: Day ovulation - 2 to ovulation + 1
    const ovulatoryStart = addDays(cycleStart, roundedOvulationDay - 2);
    const ovulationDate = addDays(cycleStart, roundedOvulationDay - 1);
    const ovulatoryEnd = addDays(cycleStart, roundedOvulationDay);

    // 4. Luteal: Day after ovulatory to end of cycle
    const lutealStart = addDays(ovulatoryEnd, 1);
    const lutealEnd = new Date(cycleEnd);

    projectedList.push({
      cycleNumber: cycleNum,
      startDate: cycleStart,
      endDate: cycleEnd,
      formattedStartDate: formatSpanishDate(cycleStart),
      formattedEndDate: formatSpanishDate(cycleEnd),
      totalLengthDays: roundedCycleLen,
      periodLengthDays: roundedPeriodLen,
      ovulationDate,
      formattedOvulationDate: formatSpanishDate(ovulationDate, false),
      phases: {
        menstrual: {
          phaseId: 'menstrual',
          name: 'Fase Menstrual',
          startDate: menstrualStart,
          endDate: menstrualEnd,
          formattedRange: `${formatSpanishDate(menstrualStart, false)} – ${formatSpanishDate(menstrualEnd, false)}`,
          durationDays: roundedPeriodLen
        },
        follicular: {
          phaseId: 'follicular',
          name: 'Fase Folicular',
          startDate: follicularStart,
          endDate: follicularEnd,
          formattedRange: `${formatSpanishDate(follicularStart, false)} – ${formatSpanishDate(follicularEnd, false)}`,
          durationDays: Math.max(1, Math.round((follicularEnd.getTime() - follicularStart.getTime()) / (1000 * 60 * 60 * 24)) + 1)
        },
        ovulatory: {
          phaseId: 'ovulatory',
          name: 'Ventana Fértil & Ovulación',
          startDate: ovulatoryStart,
          endDate: ovulatoryEnd,
          formattedRange: `${formatSpanishDate(ovulatoryStart, false)} – ${formatSpanishDate(ovulatoryEnd, false)}`,
          durationDays: 3
        },
        luteal: {
          phaseId: 'luteal',
          name: 'Fase Lútea',
          startDate: lutealStart,
          endDate: lutealEnd,
          formattedRange: `${formatSpanishDate(lutealStart, false)} – ${formatSpanishDate(lutealEnd, false)}`,
          durationDays: roundedCycleLen - roundedOvulationDay - 1
        }
      },
      confidenceScore: Math.max(90, stats.regularityScore - i * 2), // Confidence drops slightly further out
      varianceDays: Math.max(1, Math.round(stats.standardDeviation + i * 0.5))
    });

    // Prepare for next cycle projection
    nextCycleStartDate = addDays(cycleStart, roundedCycleLen);
  }

  return projectedList;
}

// Function to find if a date belongs to a projected cycle
export function getProjectionForDate(date: Date, projectedCycles: ProjectedCycle[]): {
  isProjected: boolean;
  projectedCycle?: ProjectedCycle;
  phaseId?: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  phaseName?: string;
  dayInCycle?: number;
} {
  const time = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

  for (const pc of projectedCycles) {
    const start = new Date(pc.startDate.getFullYear(), pc.startDate.getMonth(), pc.startDate.getDate()).getTime();
    const end = new Date(pc.endDate.getFullYear(), pc.endDate.getMonth(), pc.endDate.getDate()).getTime();

    if (time >= start && time <= end) {
      const dayDiff = Math.floor((time - start) / (1000 * 60 * 60 * 24)) + 1;

      // Identify phase
      let phaseId: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' = 'luteal';
      let phaseName = 'Fase Lútea';

      if (dayDiff <= pc.periodLengthDays) {
        phaseId = 'menstrual';
        phaseName = 'Fase Menstrual';
      } else if (dayDiff < pc.totalLengthDays - 15) {
        phaseId = 'follicular';
        phaseName = 'Fase Folicular';
      } else if (dayDiff >= pc.totalLengthDays - 15 && dayDiff <= pc.totalLengthDays - 12) {
        phaseId = 'ovulatory';
        phaseName = 'Ventana Fértil & Ovulación';
      }

      return {
        isProjected: true,
        projectedCycle: pc,
        phaseId,
        phaseName,
        dayInCycle: dayDiff
      };
    }
  }

  return { isProjected: false };
}
