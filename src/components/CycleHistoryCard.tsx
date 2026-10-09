import React from 'react';
import { HISTORICAL_CYCLES } from '../data/cycleData';
import { History, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const CycleHistoryCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-0.5">
            <History className="w-3.5 h-3.5 text-stone-500" />
            <span className="font-medium text-stone-700">Registro Histórico</span>
            <span aria-hidden="true">·</span>
            <span>Últimos 4 Ciclos Registrados</span>
          </div>
          <h3 className="font-display text-lg font-medium text-stone-900">
            Regularidad del Ciclo & Métricas Fisiológicas
          </h3>
        </div>
        <div className="text-xs text-stone-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Ciclo promedio: <strong className="text-stone-900 font-mono tabular-nums">28.2 días</strong> (±0.5d)</span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500 font-medium">
              <th className="pb-2.5 font-normal">Ciclo</th>
              <th className="pb-2.5 font-normal">Fechas</th>
              <th className="pb-2.5 font-normal text-right">Duración</th>
              <th className="pb-2.5 font-normal text-right">Menses</th>
              <th className="pb-2.5 font-normal text-right">Ovulación</th>
              <th className="pb-2.5 font-normal text-right">Regularidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {HISTORICAL_CYCLES.map((cycle) => (
              <tr key={cycle.cycleNumber} className="hover:bg-stone-50/60 transition-colors">
                <td className="py-3 font-semibold text-stone-900 font-mono">
                  #{cycle.cycleNumber}
                </td>
                <td className="py-3 text-stone-600">
                  {cycle.startDate} – {cycle.endDate}
                </td>
                <td className="py-3 text-right font-mono tabular-nums font-semibold text-stone-900">
                  {cycle.totalLengthDays} días
                </td>
                <td className="py-3 text-right font-mono tabular-nums text-stone-700">
                  {cycle.periodLengthDays} días
                </td>
                <td className="py-3 text-right font-mono tabular-nums text-stone-700">
                  Día {cycle.ovulationDay}
                </td>
                <td className="py-3 text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs text-stone-700">
                    <span 
                      className={`w-2 h-2 rounded-full ${cycle.status === 'Regular' ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                      aria-hidden="true" 
                    />
                    <span>{cycle.status === 'Regular' ? 'Regular' : 'Ligera Variación'}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
