import React, { useState } from 'react';
import { Dumbbell, Utensils, Brain, Check, Sparkles } from 'lucide-react';
import { CyclePhaseInfo } from '../types/cycle';

interface CycleSyncingCardProps {
  currentPhase: CyclePhaseInfo;
}

export const CycleSyncingCard: React.FC<CycleSyncingCardProps> = ({ currentPhase }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'workouts' | 'nutrition' | 'mindset'>('all');
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({
    'Arándanos silvestres antioxidantes y cacao puro': true
  });

  const toggleItem = (itemText: string) => {
    setCompletedItems(prev => ({
      ...prev,
      [itemText]: !prev[itemText]
    }));
  };

  const tabLabels = {
    all: 'Todas las guías',
    workouts: 'Entrenamiento',
    nutrition: 'Nutrición',
    mindset: 'Mente & Foco'
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-medium text-stone-700">Matriz de Cycle Syncing</span>
            <span aria-hidden="true">·</span>
            <span>Personalizada para {currentPhase.name}</span>
          </div>
          <h3 className="font-display text-lg font-medium text-stone-900">
            Recomendaciones de Estilo de Vida en Sincronía
          </h3>
        </div>

        {/* Tab Filter Controls (Functional Button Elements) */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs font-medium self-start sm:self-auto">
          {(['all', 'workouts', 'nutrition', 'mindset'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
        {/* Column 1: Movement & Training */}
        {(activeTab === 'all' || activeTab === 'workouts') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-800">
              <div className="w-6 h-6 rounded-md bg-stone-100 text-stone-700 flex items-center justify-center">
                <Dumbbell className="w-3.5 h-3.5" />
              </div>
              <h4>Movimiento & Entrenamiento</h4>
            </div>
            <ul className="space-y-2 text-xs text-stone-600">
              {currentPhase.recommendedWorkouts.map((workout, idx) => (
                <li
                  key={idx}
                  onClick={() => toggleItem(workout)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    completedItems[workout]
                      ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-900'
                      : 'bg-stone-50/70 border-stone-200/60 hover:bg-stone-100/70 text-stone-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-colors ${
                    completedItems[workout]
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-stone-300 bg-white'
                  }`}>
                    {completedItems[workout] && <Check className="w-3 h-3" />}
                  </div>
                  <span className={`leading-relaxed ${completedItems[workout] ? 'line-through opacity-80' : ''}`}>
                    {workout}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Column 2: Nutrition & Seed Cycling */}
        {(activeTab === 'all' || activeTab === 'nutrition') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-800">
              <div className="w-6 h-6 rounded-md bg-stone-100 text-stone-700 flex items-center justify-center">
                <Utensils className="w-3.5 h-3.5" />
              </div>
              <h4>Nutrición & Micronutrientes</h4>
            </div>
            <ul className="space-y-2 text-xs text-stone-600">
              {currentPhase.recommendedFoods.map((food, idx) => (
                <li
                  key={idx}
                  onClick={() => toggleItem(food)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    completedItems[food]
                      ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-900'
                      : 'bg-stone-50/70 border-stone-200/60 hover:bg-stone-100/70 text-stone-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-colors ${
                    completedItems[food]
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-stone-300 bg-white'
                  }`}>
                    {completedItems[food] && <Check className="w-3 h-3" />}
                  </div>
                  <span className={`leading-relaxed ${completedItems[food] ? 'line-through opacity-80' : ''}`}>
                    {food}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Column 3: Mindset & Productivity */}
        {(activeTab === 'all' || activeTab === 'mindset') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-800">
              <div className="w-6 h-6 rounded-md bg-stone-100 text-stone-700 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5" />
              </div>
              <h4>Mente & Estado Cognitivo</h4>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 text-xs text-amber-900 leading-relaxed">
              <p className="font-medium mb-1">Estado de Neuroplasticidad:</p>
              <p className="text-stone-700">{currentPhase.mindsetAdvice}</p>
              <div className="mt-3 pt-2.5 border-t border-amber-200/50 flex items-center justify-between text-[11px] text-amber-800">
                <span>Hormona Dominante: Estrógeno</span>
                <span className="font-medium">Alta Claridad Ejecutiva</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
