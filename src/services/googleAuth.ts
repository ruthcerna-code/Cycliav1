import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events'
];

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google Calendar.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Error al iniciar sesión con Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface SyncResult {
  createdCount: number;
  events: Array<{ summary: string; start: string; end: string }>;
}

// Function to sync cycle phases into Google Calendar
export const syncCycleToGoogleCalendar = async (
  accessToken: string,
  cycleStartDate: Date,
  cycleLength: number = 28,
  periodLength: number = 5,
  includeProjections: boolean = true
): Promise<SyncResult> => {
  const eventsToCreate = [];

  // Helper to format Date to YYYY-MM-DD
  const formatYMD = (d: Date) => d.toISOString().split('T')[0];

  // Helper to add days
  const addDays = (d: Date, days: number) => {
    const res = new Date(d);
    res.setDate(res.getDate() + days);
    return res;
  };

  // 1. Current Cycle (#43) Events
  const mensesStart = new Date(cycleStartDate);
  const mensesEnd = addDays(mensesStart, periodLength);
  eventsToCreate.push({
    summary: '🩸 Cyclia: Fase Menstrual (Ciclo Actual #43)',
    description: 'Fase de descanso reparador, baja energía hormonal e ingesta rica en hierro. Sincronizado automáticamente por Cyclia.',
    start: { date: formatYMD(mensesStart) },
    end: { date: formatYMD(mensesEnd) },
    colorId: '11' // Red in Google Calendar
  });

  const ovulDay = 14;
  const fertileStart = addDays(mensesStart, ovulDay - 3); // day 11
  const fertileEnd = addDays(mensesStart, ovulDay + 2); // day 16
  eventsToCreate.push({
    summary: '☀️ Cyclia: Ventana Fértil & Ovulación (Ciclo Actual #43)',
    description: 'Pico mensual de estrógeno y LH. Alta vitalidad neuromuscular, enfoque social y máxima fertilidad. Sincronizado por Cyclia.',
    start: { date: formatYMD(fertileStart) },
    end: { date: formatYMD(fertileEnd) },
    colorId: '5' // Banana / Yellow in Google Calendar
  });

  const lutealStart = addDays(mensesStart, 16);
  const lutealEnd = addDays(mensesStart, cycleLength);
  eventsToCreate.push({
    summary: '🌙 Cyclia: Fase Lútea (Ciclo Actual #43)',
    description: 'Progesterona dominante. Momento ideal para trabajo analítico, pilates/caminatas y nutrición con carbohidratos complejos. Sincronizado por Cyclia.',
    start: { date: formatYMD(lutealStart) },
    end: { date: formatYMD(lutealEnd) },
    colorId: '9' // Blueberry / Blue in Google Calendar
  });

  // 2. Next 3 Projected Cycles if enabled
  if (includeProjections) {
    for (let i = 1; i <= 3; i++) {
      const projCycleNum = 43 + i;
      const projStart = addDays(mensesStart, cycleLength * i);
      const projMensesEnd = addDays(projStart, periodLength);
      const projFertileStart = addDays(projStart, ovulDay - 3);
      const projFertileEnd = addDays(projStart, ovulDay + 2);
      const projLutealStart = addDays(projStart, 16);
      const projLutealEnd = addDays(projStart, cycleLength);

      eventsToCreate.push({
        summary: `🩸 Cyclia: Fase Menstrual Proyectada (Ciclo #${projCycleNum})`,
        description: `Proyección del ciclo #${projCycleNum} calculada por Cyclia en base a tu histórico (duración de 28 días).`,
        start: { date: formatYMD(projStart) },
        end: { date: formatYMD(projMensesEnd) },
        colorId: '11'
      });

      eventsToCreate.push({
        summary: `☀️ Cyclia: Ventana Fértil & Ovulación Proyectada (Ciclo #${projCycleNum})`,
        description: `Estimación de ovulación y fertilidad para el ciclo #${projCycleNum} proyectado por Cyclia.`,
        start: { date: formatYMD(projFertileStart) },
        end: { date: formatYMD(projFertileEnd) },
        colorId: '5'
      });

      eventsToCreate.push({
        summary: `🌙 Cyclia: Fase Lútea Proyectada (Ciclo #${projCycleNum})`,
        description: `Fase lútea proyectada para el ciclo #${projCycleNum} calculada por Cyclia.`,
        start: { date: formatYMD(projLutealStart) },
        end: { date: formatYMD(projLutealEnd) },
        colorId: '9'
      });
    }
  }

  const createdEvents = [];

  for (const ev of eventsToCreate) {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ev)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn('Google Calendar Event error:', errData);
    } else {
      const data = await res.json();
      createdEvents.push({
        summary: ev.summary,
        start: ev.start.date,
        end: ev.end.date
      });
    }
  }

  return {
    createdCount: createdEvents.length,
    events: createdEvents
  };
};
