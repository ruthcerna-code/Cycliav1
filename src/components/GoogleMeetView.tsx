import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Calendar as CalendarIcon, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Clock, 
  User as UserIcon, 
  Plus, 
  ShieldCheck, 
  LogOut, 
  AlertCircle,
  Stethoscope,
  HeartPulse,
  Brain,
  Apple,
  MessageSquare
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  signInWithGoogle, 
  logoutGoogle, 
  createMeetSpace, 
  scheduleMeetInGoogleCalendar, 
  MeetSpace, 
  ScheduledMeetSession, 
  getAccessToken,
  initAuth
} from '../services/googleAuth';
import { CyclePhaseInfo } from '../types/cycle';

interface GoogleMeetViewProps {
  currentDay: number;
  currentPhase: CyclePhaseInfo;
}

const CONSULTATION_TYPES = [
  {
    id: 'gyn_eval',
    title: 'Consulta Ginecológica & Hormonal',
    specialty: 'Ginecología & Endocrinología',
    suggestedPhase: 'menstrual',
    icon: Stethoscope,
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Evaluación de sangrado, dolor menstrual, analíticas hormonales (LH, FSH, estradiol) y bienestar reproductivo.'
  },
  {
    id: 'fertility',
    title: 'Asesoría de Fertilidad & Ventana Ovulatoria',
    specialty: 'Fertilidad & Salud Reproductiva',
    suggestedPhase: 'ovulatory',
    icon: HeartPulse,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Seguimiento del moco cervical, temperatura basal, cálculo del pico de LH y planificación preconcepcional.'
  },
  {
    id: 'pms_luteal',
    title: 'Manejo de SPM & Fase Lútea',
    specialty: 'Medicina Funcional & Bienestar',
    suggestedPhase: 'luteal',
    icon: Brain,
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Estrategias para regular cambios de humor, insomnio, retención de líquidos y apoyo a la progesterona.'
  },
  {
    id: 'cycle_nutrition',
    title: 'Nutrición Biorrítmica & Cycle Syncing',
    specialty: 'Nutrición Femenina Integrativa',
    suggestedPhase: 'follicular',
    icon: Apple,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Alineación de macronutrientes, semillas y micronutrientes según tus fluctuaciones metabólicas.'
  }
];

export const GoogleMeetView: React.FC<GoogleMeetViewProps> = ({
  currentDay,
  currentPhase
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(getAccessToken());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Instant Meet Space State
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);
  const [activeMeetSpace, setActiveMeetSpace] = useState<MeetSpace | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Scheduling State
  const [selectedConsultation, setSelectedConsultation] = useState(CONSULTATION_TYPES[0]);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('11:00');
  const [doctorName, setDoctorName] = useState('Dra. Ruth Cerna (Especialista en Salud Femenina)');
  const [notes, setNotes] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState<string | null>(null);

  // Stored sessions in localStorage
  const [savedSessions, setSavedSessions] = useState<ScheduledMeetSession[]>(() => {
    try {
      const stored = localStorage.getItem('cyclia_meet_sessions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        setAuthError(null);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      setAuthError(null);
      const res = await signInWithGoogle();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error al autenticar con Google');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setCurrentUser(null);
    setAccessToken(null);
    setActiveMeetSpace(null);
  };

  const handleCreateInstantSpace = async () => {
    if (!accessToken) {
      setAuthError('Por favor conecta tu cuenta de Google primero para generar una sala.');
      return;
    }

    try {
      setIsCreatingSpace(true);
      setAuthError(null);
      const space = await createMeetSpace(accessToken, 'OPEN');
      setActiveMeetSpace(space);

      // Save to recent sessions
      const newSession: ScheduledMeetSession = {
        id: `meet-${Date.now()}`,
        title: `Sala Instantánea de Google Meet (${selectedConsultation.title})`,
        specialty: selectedConsultation.specialty,
        phaseId: currentPhase.id,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        durationMinutes: 45,
        meetUri: space.meetingUri,
        meetCode: space.meetingCode,
        createdAt: new Date().toISOString()
      };

      const updated = [newSession, ...savedSessions].slice(0, 10);
      setSavedSessions(updated);
      localStorage.setItem('cyclia_meet_sessions', JSON.stringify(updated));
    } catch (err: any) {
      setAuthError(err.message || 'No se pudo crear la sala en Google Meet.');
    } finally {
      setIsCreatingSpace(false);
    }
  };

  const handleScheduleConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      setAuthError('Inicia sesión con Google para agendar la consulta en Meet y Calendar.');
      return;
    }

    try {
      setIsScheduling(true);
      setAuthError(null);
      setScheduleSuccess(null);

      // 1. Create a dedicated Google Meet space
      const space = await createMeetSpace(accessToken, 'OPEN');

      // 2. Compute ISO strings for start and end
      const startDateTime = `${scheduledDate}T${scheduledTime}:00`;
      const startD = new Date(startDateTime);
      const endD = new Date(startD.getTime() + 45 * 60000); // 45 min session
      const endDateTime = endD.toISOString().replace('.000Z', '');

      // 3. Insert into Google Calendar
      const calRes = await scheduleMeetInGoogleCalendar(accessToken, {
        title: `${selectedConsultation.title} - ${doctorName}`,
        description: `Sesión de telemedicina biorrítmica durante Día ${currentDay} (${currentPhase.name}).\n${notes ? `Notas: ${notes}\n` : ''}`,
        startDateTime: startD.toISOString(),
        endDateTime: endD.toISOString(),
        meetUri: space.meetingUri
      });

      // 4. Save session record
      const newSession: ScheduledMeetSession = {
        id: `meet-sched-${Date.now()}`,
        title: selectedConsultation.title,
        specialty: selectedConsultation.specialty,
        doctorOrGuide: doctorName,
        phaseId: currentPhase.id,
        date: scheduledDate,
        time: scheduledTime,
        durationMinutes: 45,
        meetUri: space.meetingUri,
        meetCode: space.meetingCode,
        notes: notes,
        calendarEventId: calRes.id,
        createdAt: new Date().toISOString()
      };

      const updated = [newSession, ...savedSessions].slice(0, 10);
      setSavedSessions(updated);
      localStorage.setItem('cyclia_meet_sessions', JSON.stringify(updated));

      setActiveMeetSpace(space);
      setScheduleSuccess(`¡Consulta agendada y sala de Google Meet creada con éxito! Sincronizada con Google Calendar.`);
      setNotes('');
    } catch (err: any) {
      setAuthError(err.message || 'Error al agendar la sesión con Google Meet.');
    } finally {
      setIsScheduling(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-medium">
              <Video className="w-3.5 h-3.5 text-teal-300" />
              <span>Google Meet API Habilitada</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-white">
              Telemedicina & Consultas con Google Meet
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed">
              Crea salas instantáneas y agenda videollamadas con ginecólogas, endocrinólogas y asesoras de salud según tu fase biológica actual (<span className="text-amber-300 font-medium">{currentPhase.name}</span>, Día {currentDay}).
            </p>
          </div>

          {/* Account connection status */}
          <div className="shrink-0 bg-stone-800/80 backdrop-blur-xs p-4 rounded-xl border border-stone-700/80 flex flex-col gap-3 min-w-[240px]">
            {currentUser ? (
              <div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Google Meet Conectado</span>
                </div>
                <p className="text-sm font-semibold text-white truncate max-w-[200px]">
                  {currentUser.displayName || currentUser.email}
                </p>
                <p className="text-xs text-stone-400 truncate mb-3">
                  {currentUser.email}
                </p>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 text-xs text-stone-300 hover:text-white bg-stone-700/60 hover:bg-stone-700 rounded-lg transition-colors border border-stone-600/50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Desconectar</span>
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-stone-300 mb-2.5">
                  Conéctate con tu cuenta Google para generar salas y agendar consultas:
                </p>
                <button
                  onClick={handleSignIn}
                  disabled={isAuthenticating}
                  className="w-full flex items-center justify-center gap-2.5 py-2 px-3.5 bg-white text-stone-800 hover:bg-stone-50 font-medium text-xs rounded-lg shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isAuthenticating ? 'Conectando...' : 'Vincular Google Meet'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Errors or Success Notifications */}
      {authError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Atención con Google Meet</p>
            <p className="text-xs text-rose-700 mt-0.5">{authError}</p>
          </div>
        </div>
      )}

      {scheduleSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-3 text-sm animate-in fade-in duration-300">
          <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-emerald-900">Operación exitosa</p>
            <p className="text-xs text-emerald-700 mt-0.5">{scheduleSuccess}</p>
          </div>
        </div>
      )}

      {/* Active Instant Meet Space Card */}
      {activeMeetSpace && (
        <div className="bg-teal-950/20 border-2 border-teal-500/40 rounded-2xl p-6 bg-gradient-to-r from-teal-900/30 to-stone-900/40 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
                <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Sala de Google Meet Lista</span>
              </div>
              <h3 className="text-xl font-serif text-stone-900 dark:text-white font-medium">
                {activeMeetSpace.meetingUri}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                Código de reunión: <span className="font-mono font-bold text-teal-600 dark:text-teal-300">{activeMeetSpace.meetingCode}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => copyToClipboard(activeMeetSpace.meetingUri)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-50 text-xs font-medium transition-all shadow-xs"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? '¡Copiado!' : 'Copiar enlace'}</span>
              </button>

              <a
                href={activeMeetSpace.meetingUri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md transition-all active:scale-[0.98]"
              >
                <Video className="w-4 h-4" />
                <span>Entrar a Google Meet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Create Space & Schedule Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Actions & Types */}
        <div className="lg:col-span-5 space-y-6">
          {/* Instant Meet Creator */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg text-stone-900 font-semibold flex items-center gap-2">
                <Video className="w-5 h-5 text-teal-600" />
                <span>Videollamada Instantánea</span>
              </h3>
              <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                API v2
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Inicia una reunión de Google Meet en 1 clic para compartir con tu médico, doula o especialista en salud femenina.
            </p>

            <button
              onClick={handleCreateInstantSpace}
              disabled={isCreatingSpace}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-600 hover:to-teal-700 text-white font-medium text-sm shadow-sm transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <Video className="w-4 h-4" />
              <span>{isCreatingSpace ? 'Generando sala en Google Meet...' : 'Crear Sala Inmediata de Meet'}</span>
            </button>
          </div>

          {/* Consultation Categories */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs space-y-4">
            <h3 className="font-serif text-base text-stone-900 font-semibold">
              Tipos de Asesorías Biorrítmicas
            </h3>
            <p className="text-xs text-stone-500">
              Selecciona el enfoque para personalizar la videollamada:
            </p>

            <div className="space-y-2.5">
              {CONSULTATION_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedConsultation.id === type.id;
                return (
                  <div
                    key={type.id}
                    onClick={() => setSelectedConsultation(type)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-teal-600 bg-teal-50/50 shadow-xs' 
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${type.badgeColor} shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-stone-900">{type.title}</h4>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-teal-600" />}
                        </div>
                        <p className="text-[11px] text-stone-500 font-medium">{type.specialty}</p>
                        <p className="text-[11px] text-stone-600 mt-1 line-clamp-2">{type.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Schedule & Calendar Integration */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/90 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-serif text-lg text-stone-900 font-semibold">
                  Agendar Sesión en Google Calendar & Meet
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Genera la sala oficial de Google Meet y programa el evento en tu calendario de Google.
                </p>
              </div>
              <div className="p-2 bg-stone-100 rounded-xl text-stone-600">
                <CalendarIcon className="w-5 h-5" />
              </div>
            </div>

            <form onSubmit={handleScheduleConsultation} className="space-y-4">
              {/* Consultation details badge */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-semibold text-stone-400">Tipo Seleccionado</span>
                  <p className="text-xs font-semibold text-stone-900">{selectedConsultation.title}</p>
                </div>
                <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${selectedConsultation.badgeColor}`}>
                  {selectedConsultation.specialty}
                </span>
              </div>

              {/* Doctor / Specialist */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Profesional de Salud / Especialista
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="Ej. Dra. Ruth Cerna"
                    required
                  />
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Fecha de la Consulta
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Hora (Duración: 45 min)
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Notes / Symptoms to Discuss */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Notas Clínicas o Síntomas a Revisar (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={`Ej. Revisión de SPM en fase lútea, dudas sobre analítica de progesterona o dolor pélvico en Día ${currentDay}.`}
                  className="w-full p-3 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isScheduling}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-200 font-semibold text-xs transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{isScheduling ? 'Creando sala y agendando en Calendar...' : 'Agendar Sesión con Enlace de Google Meet'}</span>
              </button>
            </form>
          </div>

          {/* Recent Meet Sessions List */}
          {savedSessions.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-sm font-semibold text-stone-900">
                  Salas Recientes & Próximas Citas
                </h4>
                <span className="text-[11px] text-stone-500">
                  {savedSessions.length} registradas
                </span>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {savedSessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl border border-stone-200/80 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900">{s.title}</span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        {s.date} a las {s.time} · {s.doctorOrGuide || s.specialty}
                      </p>
                      <p className="text-[11px] font-mono text-teal-700">
                        {s.meetUri}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => copyToClipboard(s.meetUri)}
                        className="p-1.5 rounded-lg border border-stone-300 hover:bg-white text-stone-600 transition-colors"
                        title="Copiar enlace"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={s.meetUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium text-[11px] transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Unirse</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
