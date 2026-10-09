import React from 'react';
import { Thermometer, Heart, Moon, BatteryCharging, ArrowUpRight, TrendingUp } from 'lucide-react';
import { DailyVitals } from '../types/cycle';

interface VitalsGridProps {
  vitals: DailyVitals;
  onUpdateVitals: (updated: Partial<DailyVitals>) => void;
}

export const VitalsGrid: React.FC<VitalsGridProps> = ({ vitals, onUpdateVitals }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Vitals Card 1: Basal Body Temp */}
      <div className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs">
        <div className="flex items-center justify-between text-stone-500 mb-2">
          <span className="text-xs font-medium text-stone-600">Temperatura Basal</span>
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <Thermometer className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold font-mono tabular-nums text-stone-900">
            {vitals.basalBodyTemp.toFixed(2)}
          </span>
          <span className="text-xs font-medium text-stone-500">°C</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-stone-600">
          <TrendingUp className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>+0.35° cambio bifásico detectado</span>
        </div>
      </div>

      {/* Vitals Card 2: Resting Heart Rate */}
      <div className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs">
        <div className="flex items-center justify-between text-stone-500 mb-2">
          <span className="text-xs font-medium text-stone-600">Frecuencia en Reposo</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Heart className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold font-mono tabular-nums text-stone-900">
            {vitals.restingHeartRate}
          </span>
          <span className="text-xs font-medium text-stone-500">bpm</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-stone-600">
          <ArrowUpRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Rango regular esperado (62–66)</span>
        </div>
      </div>

      {/* Vitals Card 3: Sleep & Recovery */}
      <div className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs">
        <div className="flex items-center justify-between text-stone-500 mb-2">
          <span className="text-xs font-medium text-stone-600">Sueño & Recuperación</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Moon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold font-mono tabular-nums text-stone-900">
            {vitals.sleepDuration}
          </span>
          <span className="text-xs font-mono tabular-nums font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            {vitals.sleepScore}%
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-stone-600">
          <span>REM 2h 08m · Profundo 1h 45m</span>
        </div>
      </div>

      {/* Vitals Card 4: Energy & Vitality */}
      <div className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs">
        <div className="flex items-center justify-between text-stone-500 mb-2">
          <span className="text-xs font-medium text-stone-600">Índice de Vitalidad</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BatteryCharging className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold font-mono tabular-nums text-stone-900">
            {vitals.energyScore}
          </span>
          <span className="text-xs font-medium text-stone-500">/ 10</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-stone-600">
          <span>Alta resistencia · Enfoque social</span>
        </div>
      </div>
    </div>
  );
};
