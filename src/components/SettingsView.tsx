import React, { useState } from 'react';
import { Sliders, ShieldCheck, Download, Bell, Sparkles, Check } from 'lucide-react';

interface SettingsViewProps {
  cycleLength: number;
  onUpdateCycleLength: (len: number) => void;
  periodLength: number;
  onUpdatePeriodLength: (len: number) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  cycleLength,
  onUpdateCycleLength,
  periodLength,
  onUpdatePeriodLength
}) => {
  const [cycleVal, setCycleVal] = useState(cycleLength);
  const [periodVal, setPeriodVal] = useState(periodLength);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privateMode, setPrivateMode] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    onUpdateCycleLength(cycleVal);
    onUpdatePeriodLength(periodVal);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      exportDate: new Date().toISOString(),
      cycleLength: cycleVal,
      periodLength: periodVal,
      version: "1.0",
      app: "Cyclia"
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cyclia_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-0.5">
              <Sliders className="w-3.5 h-3.5 text-stone-500" />
              <span className="font-medium text-stone-700">Calibración Biológica</span>
              <span aria-hidden="true">·</span>
              <span>Parámetros Fisiológicos Individuales</span>
            </div>
            <h3 className="font-display text-lg font-medium text-stone-900">
              Ajustes de Ciclo y Privacidad en Dispositivo
            </h3>
          </div>
          {savedNotice && (
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Guardado
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
          {/* Setting 1: Average Cycle Length */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Duración Promedio del Ciclo (Días)
            </label>
            <input
              type="number"
              min="21"
              max="40"
              value={cycleVal}
              onChange={(e) => setCycleVal(parseInt(e.target.value, 10) || 28)}
              className="w-full px-3 py-2 text-sm font-mono border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Rango adulto habitual de 24 a 35 días. Empleado para estimar la ventana de ovulación.
            </p>
          </div>

          {/* Setting 2: Period Duration */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Duración Promedio de la Menstruación (Días)
            </label>
            <input
              type="number"
              min="2"
              max="9"
              value={periodVal}
              onChange={(e) => setPeriodVal(parseInt(e.target.value, 10) || 5)}
              className="w-full px-3 py-2 text-sm font-mono border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Días de sangrado menstrual habitual para proyectar el inicio de la fase folicular.
            </p>
          </div>
        </div>

        {/* Preferences */}
        <div className="pt-6 border-t border-stone-100 mt-6 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/60">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-stone-600" />
              <div>
                <p className="text-xs font-semibold text-stone-800">Alertas de Cambio de Fase</p>
                <p className="text-[11px] text-stone-500">Recibe avisos antes de la ovulación y de la próxima menstruación.</p>
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                notificationsEnabled ? 'bg-stone-900' : 'bg-stone-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                notificationsEnabled ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/60">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-xs font-semibold text-stone-800">Privacidad y Aislamiento de Datos</p>
                <p className="text-[11px] text-stone-500">Tus datos de salud y biomarcadores permanecen privados y protegidos en tu sesión.</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-700 font-mono">ACTIVO</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-6 border-t border-stone-100 mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Datos en JSON</span>
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            Guardar Calibración
          </button>
        </div>
      </div>
    </div>
  );
};
