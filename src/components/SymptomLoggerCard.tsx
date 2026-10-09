import React, { useState } from 'react';
import { ActiveSymptoms } from '../types/cycle';
import { Check, Sparkles, AlertCircle } from 'lucide-react';

interface SymptomLoggerCardProps {
  symptoms: ActiveSymptoms;
  onUpdateSymptoms: (symptoms: ActiveSymptoms) => void;
}

export const SymptomLoggerCard: React.FC<SymptomLoggerCardProps> = ({
  symptoms,
  onUpdateSymptoms
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  const handleCrampsChange = (val: ActiveSymptoms['cramps']) => {
    onUpdateSymptoms({ ...symptoms, cramps: val });
    triggerToast(`Cólicos registrados como: ${val === 'none' ? 'Ninguno' : val === 'mild' ? 'Leves' : 'Moderados'}`);
  };

  const handleCervicalFluidChange = (val: ActiveSymptoms['cervicalFluid']) => {
    onUpdateSymptoms({ ...symptoms, cervicalFluid: val });
    const labels = { dry: 'Seco', sticky: 'Pegajoso', creamy: 'Cremoso', 'egg-white': 'Clara de huevo (Fértil)' };
    triggerToast(`Fluido cervical registrado: ${labels[val]}`);
  };

  const handleMoodChange = (val: ActiveSymptoms['mood']) => {
    onUpdateSymptoms({ ...symptoms, mood: val });
    const labels = { peaceful: 'Serena', focused: 'Enfocada', vibrant: 'Radiante', reflective: 'Reflexiva', irritable: 'Sensible' };
    triggerToast(`Estado anímico registrado: ${labels[val]}`);
  };

  const handleEnergyChange = (val: ActiveSymptoms['energy']) => {
    onUpdateSymptoms({ ...symptoms, energy: val });
    const labels = { low: 'Baja', steady: 'Estable', radiant: 'Radiante', restless: 'Inquieta' };
    triggerToast(`Energía vital registrada: ${labels[val]}`);
  };

  const toggleBooleanSymptom = (key: 'headache' | 'bloating' | 'breastTenderness', label: string) => {
    const updated = !symptoms[key];
    onUpdateSymptoms({ ...symptoms, [key]: updated });
    triggerToast(`${label} ${updated ? 'marcado' : 'desmarcado'}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-6 bg-stone-900 text-amber-200 text-xs px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150 z-20">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-0.5">
            <span className="font-medium text-stone-700">Registro de Salud Diario</span>
            <span aria-hidden="true">·</span>
            <span>Registro Táctil de Síntomas</span>
          </div>
          <h3 className="font-display text-lg font-medium text-stone-900">
            Indicadores Físicos y Emocionales de Hoy
          </h3>
        </div>
        <span className="text-xs text-stone-400 font-mono">Sincronizado</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-5">
        {/* Group 1: Cervical Fluid */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-2">
            Fluido Cervical
          </label>
          <div className="space-y-1.5">
            {[
              { id: 'dry', label: 'Seco' },
              { id: 'sticky', label: 'Pegajoso' },
              { id: 'creamy', label: 'Cremoso' },
              { id: 'egg-white', label: 'Clara de huevo (Fértil)' }
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleCervicalFluidChange(id as any)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center justify-between ${
                  symptoms.cervicalFluid === id
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200/70 hover:bg-stone-100'
                }`}
              >
                <span>{label}</span>
                {symptoms.cervicalFluid === id && <Check className="w-3.5 h-3.5 text-amber-300" />}
              </button>
            ))}
          </div>
        </div>

        {/* Group 2: Mood Spectrum */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-2">
            Estado Anímico
          </label>
          <div className="space-y-1.5">
            {[
              { id: 'peaceful', label: 'Serena' },
              { id: 'focused', label: 'Enfocada' },
              { id: 'vibrant', label: 'Radiante' },
              { id: 'reflective', label: 'Reflexiva' },
              { id: 'irritable', label: 'Sensible' }
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleMoodChange(id as any)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center justify-between ${
                  symptoms.mood === id
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200/70 hover:bg-stone-100'
                }`}
              >
                <span>{label}</span>
                {symptoms.mood === id && <Check className="w-3.5 h-3.5 text-amber-300" />}
              </button>
            ))}
          </div>
        </div>

        {/* Group 3: Energy Expression */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-2">
            Nivel de Energía
          </label>
          <div className="space-y-1.5">
            {[
              { id: 'low', label: 'Baja' },
              { id: 'steady', label: 'Estable' },
              { id: 'radiant', label: 'Radiante' },
              { id: 'restless', label: 'Inquieta' }
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleEnergyChange(id as any)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center justify-between ${
                  symptoms.energy === id
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200/70 hover:bg-stone-100'
                }`}
              >
                <span>{label}</span>
                {symptoms.energy === id && <Check className="w-3.5 h-3.5 text-amber-300" />}
              </button>
            ))}
          </div>
        </div>

        {/* Group 4: Somatic Symptoms Toggles */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-2">
            Sensaciones Somáticas
          </label>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => toggleBooleanSymptom('headache', 'Dolor de cabeza')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center justify-between ${
                symptoms.headache
                  ? 'bg-rose-50 text-rose-900 border-rose-300'
                  : 'bg-stone-50 text-stone-700 border-stone-200/70 hover:bg-stone-100'
              }`}
            >
              <span>Dolor de cabeza</span>
              <span className="font-mono text-[11px]">{symptoms.headache ? 'Presente' : 'Ninguno'}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleBooleanSymptom('bloating', 'Hinchazón')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center justify-between ${
                symptoms.bloating
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-stone-50 text-stone-700 border-stone-200/70 hover:bg-stone-100'
              }`}
            >
              <span>Retención / Hinchazón</span>
              <span className="font-mono text-[11px]">{symptoms.bloating ? 'Presente' : 'Ninguno'}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleBooleanSymptom('breastTenderness', 'Sensibilidad mamaria')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center justify-between ${
                symptoms.breastTenderness
                  ? 'bg-rose-50 text-rose-900 border-rose-300'
                  : 'bg-stone-50 text-stone-700 border-stone-200/70 hover:bg-stone-100'
              }`}
            >
              <span>Sensibilidad mamaria</span>
              <span className="font-mono text-[11px]">{symptoms.breastTenderness ? 'Presente' : 'Ninguno'}</span>
            </button>

            {/* Cramps Intensity */}
            <div className="pt-1">
              <span className="block text-[11px] text-stone-500 mb-1">Cólicos pélvicos:</span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'none', label: 'Ninguno' },
                  { id: 'mild', label: 'Leves' },
                  { id: 'moderate', label: 'Medios' }
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleCrampsChange(id as any)}
                    className={`py-1 text-[11px] font-medium rounded border ${
                      symptoms.cramps === id
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
