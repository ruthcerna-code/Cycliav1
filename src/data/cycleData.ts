import { CyclePhaseInfo, CyclePhaseId, CycleHistoryEntry, DailyVitals, ActiveSymptoms } from '../types/cycle';

export const PHASES_DATA: Record<CyclePhaseId, CyclePhaseInfo> = {
  menstrual: {
    id: 'menstrual',
    name: 'Fase Menstrual',
    daysRange: 'Días 1 – 5',
    dayStart: 1,
    dayEnd: 5,
    color: '#E11D48', // rose-600
    accentBg: 'bg-rose-50',
    borderColor: 'border-rose-200',
    textAccent: 'text-rose-700',
    summary: 'Desprendimiento del endometrio. Tanto el estrógeno como la progesterona se encuentran en sus niveles basales. Momento natural para la introspección, el descanso reparador y la reposición de hierro.',
    estrogenStatus: 'Nivel basal bajo',
    progesteroneStatus: 'Nivel basal bajo',
    lhStatus: 'Línea base',
    conceptionChance: 'Very Low',
    recommendedWorkouts: [
      'Yoga restaurativo Yin y movilidad suave',
      'Caminatas tranquilas de 30 min en la naturaleza',
      'Estiramientos pélvicos y respiración diafragmática'
    ],
    recommendedFoods: [
      'Lentejas ricas en hierro, espinacas y remolacha',
      'Caldos calientes reconfortantes e infusiones de jengibre',
      'Grasas saludables: semillas de calabaza y aguacate'
    ],
    mindsetAdvice: 'Prioriza el descanso profundo, límites claros en tus compromisos y autocompasión. Honra el repliegue natural de tu cuerpo.'
  },
  follicular: {
    id: 'follicular',
    name: 'Fase Folicular',
    daysRange: 'Días 6 – 13',
    dayStart: 6,
    dayEnd: 13,
    color: '#059669', // emerald-600
    accentBg: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textAccent: 'text-emerald-700',
    summary: 'La hipófisis libera FSH y maduran los folículos ováricos. El estrógeno se incrementa progresivamente, impulsando la neuroplasticidad, creatividad, apertura social y energía física.',
    estrogenStatus: 'Ascenso constante y rápido',
    progesteroneStatus: 'Línea base en reposo',
    lhStatus: 'Iniciando elevación',
    conceptionChance: 'Medium',
    recommendedWorkouts: [
      'Entrenamiento de fuerza progresivo (hipertrofia)',
      'Running dinámico, bicicleta o trail',
      'Pilates fluido a ritmo medio y danza'
    ],
    recommendedFoods: [
      'Brotes germinados, edamame y crucíferas',
      'Alimentos fermentados: kéfir, chucrut y probióticos',
      'Semillas de lino y calabaza para metabolizar estrógenos'
    ],
    mindsetAdvice: 'Ventana idónea para iniciar nuevos proyectos creativos, liderar propuestas, aprender temas complejos y expandir tu red social.'
  },
  ovulatory: {
    id: 'ovulatory',
    name: 'Fase Ovulatoria',
    daysRange: 'Días 14 – 16',
    dayStart: 14,
    dayEnd: 16,
    color: '#D97706', // amber-600
    accentBg: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textAccent: 'text-amber-800',
    summary: 'El pico brusco de la hormona luteinizante (LH) desencadena la ovulación. Estrógeno y testosterona alcanzan su máximo nivel mensual. Máxima agilidad verbal, magnetismo y vitalidad.',
    estrogenStatus: 'Pico mensual máximo',
    progesteroneStatus: 'Inicio de ascenso post-ovulatorio',
    lhStatus: 'Pico de oleada (disparador)',
    conceptionChance: 'Peak',
    recommendedWorkouts: [
      'Entrenamientos interválicos de alta intensidad (HIIT)',
      'Levantamiento de peso pesado y marcas personales',
      'Actividades atléticas grupales o deportes dinámicos'
    ],
    recommendedFoods: [
      'Vegetales crucíferos (apoyan la función hepática)',
      'Alimentos ricos en zinc: semillas de calabaza y huevos de campo',
      'Arándanos silvestres antioxidantes y cacao puro'
    ],
    mindsetAdvice: 'Aprovecha tu máxima elocuencia para negociaciones clave, ponencias importantes, conversaciones determinantes y vida social.'
  },
  luteal: {
    id: 'luteal',
    name: 'Fase Lútea',
    daysRange: 'Días 17 – 28',
    dayStart: 17,
    dayEnd: 28,
    color: '#4F46E5', // indigo-600
    accentBg: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textAccent: 'text-indigo-800',
    summary: 'El cuerpo lúteo secreta progesterona para nutrir el endometrio. La temperatura basal se eleva entre +0.3 y +0.5°C. La atención se dirige a la minuciosidad, orden y confort.',
    estrogenStatus: 'Segundo ascenso suave y posterior descenso',
    progesteroneStatus: 'Dominante y elevada',
    lhStatus: 'Línea base baja',
    conceptionChance: 'Low',
    recommendedWorkouts: [
      'Pilates de resistencia moderada y trabajo isométrico',
      'Caminatas en pendiente en zona 2 constante',
      'Yoga somático reconfortante y estiramientos suaves'
    ],
    recommendedFoods: [
      'Carbohidratos complejos de absorción lenta: boniato, quinoa, avena',
      'Alimentos ricos en magnesio: chocolate negro, almendras y semillas',
      'Semillas de sésamo y girasol (seed cycling de fase lútea)'
    ],
    mindsetAdvice: 'Gran agudeza para tareas de detalle, auditorías, organización del hogar, cerrar ciclos pendientes y buscar espacios de calma.'
  }
};

export const INITIAL_VITALS: DailyVitals = {
  cycleDay: 14,
  date: '25 de Septiembre de 2026',
  basalBodyTemp: 36.65,
  restingHeartRate: 64,
  sleepDuration: '8h 12m',
  sleepScore: 89,
  energyScore: 8.8,
  waterIntakeLiters: 2.3
};

export const INITIAL_SYMPTOMS: ActiveSymptoms = {
  cramps: 'none',
  energy: 'radiant',
  mood: 'vibrant',
  cervicalFluid: 'egg-white',
  flow: 'none',
  libido: 'high',
  headache: false,
  bloating: false,
  breastTenderness: false
};

export const HISTORICAL_CYCLES: CycleHistoryEntry[] = [
  {
    cycleNumber: 42,
    startDate: '28 Ago 2026',
    endDate: '24 Sep 2026',
    totalLengthDays: 28,
    periodLengthDays: 5,
    ovulationDay: 14,
    status: 'Regular'
  },
  {
    cycleNumber: 41,
    startDate: '31 Jul 2026',
    endDate: '27 Ago 2026',
    totalLengthDays: 28,
    periodLengthDays: 5,
    ovulationDay: 14,
    status: 'Regular'
  },
  {
    cycleNumber: 40,
    startDate: '02 Jul 2026',
    endDate: '30 Jul 2026',
    totalLengthDays: 29,
    periodLengthDays: 5,
    ovulationDay: 15,
    status: 'Slight Variance'
  },
  {
    cycleNumber: 39,
    startDate: '04 Jun 2026',
    endDate: '01 Jul 2026',
    totalLengthDays: 28,
    periodLengthDays: 4,
    ovulationDay: 14,
    status: 'Regular'
  }
];

export function getPhaseForDay(day: number): CyclePhaseId {
  if (day >= 1 && day <= 5) return 'menstrual';
  if (day >= 6 && day <= 13) return 'follicular';
  if (day >= 14 && day <= 16) return 'ovulatory';
  return 'luteal';
}

// 28-day hormone curve simulation points
export const HORMONE_CURVE_DATA = Array.from({ length: 28 }, (_, i) => {
  const day = i + 1;
  // Estrogen peaks around day 13-14, dips, rises mildly in luteal (day 21), then drops
  let estrogen = 20;
  if (day <= 5) estrogen = 20 + day * 3;
  else if (day <= 13) estrogen = 35 + Math.pow(day - 5, 1.8) * 12;
  else if (day === 14) estrogen = 95;
  else if (day <= 17) estrogen = 95 - (day - 14) * 20;
  else if (day <= 22) estrogen = 45 + Math.sin((day - 17) / 5 * Math.PI) * 22;
  else estrogen = Math.max(15, 60 - (day - 22) * 8);

  // Progesterone stays low until day 15, then rises and peaks around day 21, then drops
  let progesterone = 5;
  if (day >= 15 && day <= 22) {
    progesterone = 5 + Math.pow(day - 14, 1.7) * 9;
  } else if (day > 22) {
    progesterone = Math.max(4, 85 - Math.pow(day - 22, 1.8) * 14);
  }

  // LH stays low then spikes abruptly on day 13-14
  let lh = 10;
  if (day === 13) lh = 55;
  else if (day === 14) lh = 98;
  else if (day === 15) lh = 38;
  else lh = 10 + Math.random() * 3;

  return { day, estrogen: Math.round(estrogen), progesterone: Math.round(progesterone), lh: Math.round(lh) };
});
