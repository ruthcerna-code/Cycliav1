export type CyclePhaseId = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export interface CyclePhaseInfo {
  id: CyclePhaseId;
  name: string;
  daysRange: string;
  dayStart: number;
  dayEnd: number;
  color: string;
  accentBg: string;
  borderColor: string;
  textAccent: string;
  summary: string;
  estrogenStatus: string;
  progesteroneStatus: string;
  lhStatus: string;
  conceptionChance: 'Low' | 'Medium' | 'Peak' | 'Very Low';
  recommendedWorkouts: string[];
  recommendedFoods: string[];
  mindsetAdvice: string;
}

export interface DailyVitals {
  cycleDay: number;
  date: string;
  basalBodyTemp: number; // in Celsius e.g. 36.65
  restingHeartRate: number; // bpm
  sleepDuration: string; // e.g. "8h 12m"
  sleepScore: number; // percentage
  energyScore: number; // out of 10
  waterIntakeLiters: number;
}

export interface CycleHistoryEntry {
  cycleNumber: number;
  startDate: string;
  endDate: string;
  totalLengthDays: number;
  periodLengthDays: number;
  ovulationDay: number;
  status: 'Regular' | 'Slight Variance';
}

export interface ActiveSymptoms {
  cramps: 'none' | 'mild' | 'moderate' | 'strong';
  energy: 'low' | 'steady' | 'radiant' | 'restless';
  mood: 'peaceful' | 'focused' | 'vibrant' | 'reflective' | 'irritable';
  cervicalFluid: 'dry' | 'sticky' | 'creamy' | 'egg-white';
  flow: 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
  libido: 'low' | 'moderate' | 'high';
  headache: boolean;
  bloating: boolean;
  breastTenderness: boolean;
}

export interface ProjectedCyclePhase {
  phaseId: CyclePhaseId;
  name: string;
  startDate: Date;
  endDate: Date;
  formattedRange: string;
  durationDays: number;
}

export interface ProjectedCycle {
  cycleNumber: number;
  startDate: Date;
  endDate: Date;
  formattedStartDate: string;
  formattedEndDate: string;
  totalLengthDays: number;
  periodLengthDays: number;
  ovulationDate: Date;
  formattedOvulationDate: string;
  phases: {
    menstrual: ProjectedCyclePhase;
    follicular: ProjectedCyclePhase;
    ovulatory: ProjectedCyclePhase;
    luteal: ProjectedCyclePhase;
  };
  confidenceScore: number;
  varianceDays: number;
}

