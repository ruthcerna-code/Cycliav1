import React, { useState } from 'react';
import { X, Check, Thermometer, Moon, Battery, Heart, FileText } from 'lucide-react';
import { DailyVitals, ActiveSymptoms } from '../types/cycle';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDay: number;
  vitals: DailyVitals;
  onSaveVitals: (vitals: DailyVitals) => void;
  symptoms: ActiveSymptoms;
  onSaveSymptoms: (symptoms: ActiveSymptoms) => void;
}

export const LogModal: React.FC<LogModalProps> = ({
  isOpen,
  onClose,
  currentDay,
  vitals,
  onSaveVitals,
  symptoms,
  onSaveSymptoms
}) => {
  const [bbt, setBbt] = useState<number>(vitals.basalBodyTemp);
  const [rhr, setRhr] = useState<number>(vitals.restingHeartRate);
  const [sleep, setSleep] = useState<string>(vitals.sleepDuration);
  const [energy, setEnergy] = useState<number>(vitals.energyScore);
  const [mood, setMood] = useState<ActiveSymptoms['mood']>(symptoms.mood);
  const [fluid, setFluid] = useState<ActiveSymptoms['cervicalFluid']>(symptoms.cervicalFluid);
  const [notes, setNotes] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveVitals({
      ...vitals,
      basalBodyTemp: Number(bbt),
      restingHeartRate: Number(rhr),
      sleepDuration: sleep,
      energyScore: Number(energy)
    });
    onSaveSymptoms({
      ...symptoms,
      mood,
      cervicalFluid: fluid
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#FAF8F5]">
          <div>
            <h3 className="font-display text-lg font-medium text-stone-900">
              Registrar Biomarcadores Diarios
            </h3>
            <p className="text-xs text-stone-500 font-mono">
              Día {currentDay} del Ciclo · 25 de Septiembre
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Row 1: BBT & RHR */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                <span>Temperatura Basal (°C)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="35.5"
                max="38.5"
                value={bbt}
                onChange={(e) => setBbt(parseFloat(e.target.value) || 36.5)}
                className="w-full px-3 py-2 text-sm font-mono border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-amber-500" />
                <span>Frecuencia en Reposo (bpm)</span>
              </label>
              <input
                type="number"
                min="40"
                max="120"
                value={rhr}
                onChange={(e) => setRhr(parseInt(e.target.value, 10) || 60)}
                className="w-full px-3 py-2 text-sm font-mono border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
                required
              />
            </div>
          </div>

          {/* Row 2: Sleep & Energy */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Horas de Sueño</span>
              </label>
              <input
                type="text"
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
                placeholder="ej. 8h 15m"
                className="w-full px-3 py-2 text-sm font-mono border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <Battery className="w-3.5 h-3.5 text-emerald-500" />
                <span>Nivel de Energía ({energy}/10)</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={energy}
                onChange={(e) => setEnergy(parseFloat(e.target.value))}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900 mt-3"
              />
            </div>
          </div>

          {/* Row 3: Cervical Fluid & Mood */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Fluido Cervical
              </label>
              <select
                value={fluid}
                onChange={(e) => setFluid(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-medium border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
              >
                <option value="dry">Seco</option>
                <option value="sticky">Pegajoso</option>
                <option value="creamy">Cremoso</option>
                <option value="egg-white">Clara de huevo (Fértil)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Estado Emocional
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-medium border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
              >
                <option value="peaceful">Serena</option>
                <option value="focused">Enfocada</option>
                <option value="vibrant">Radiante y Social</option>
                <option value="reflective">Reflexiva</option>
                <option value="irritable">Sensible / Irritable</option>
              </select>
            </div>
          </div>

          {/* Row 4: Personal Journal Entry */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-stone-500" />
              <span>Notas Personales & Observaciones</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ej. Mucha concentración en la mañana, ligera caminata al aire libre, sin cólicos."
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>¡Guardado!</span>
                </>
              ) : (
                <span>Guardar Registro</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
