/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar, NavView } from './components/Sidebar';
import { Header } from './components/Header';
import { PhaseDialCard } from './components/PhaseDialCard';
import { VitalsGrid } from './components/VitalsGrid';
import { CycleSyncingCard } from './components/CycleSyncingCard';
import { SymptomLoggerCard } from './components/SymptomLoggerCard';
import { HormoneChartCard } from './components/HormoneChartCard';
import { CycleHistoryCard } from './components/CycleHistoryCard';
import { SettingsView } from './components/SettingsView';
import { LogModal } from './components/LogModal';
import { ChatDrawer } from './components/ChatDrawer';
import { CalendarView } from './components/CalendarView';
import { CycleProjectionsCard } from './components/CycleProjectionsCard';
import { GoogleMeetView } from './components/GoogleMeetView';
import { MoodAnalyticsView } from './components/MoodAnalyticsView';
import { MoodAnalyticsPreviewCard } from './components/MoodAnalyticsPreviewCard';
import { Sparkles, Video } from 'lucide-react';
import { 
  PHASES_DATA, 
  INITIAL_VITALS, 
  INITIAL_SYMPTOMS, 
  getPhaseForDay 
} from './data/cycleData';
import { DailyVitals, ActiveSymptoms } from './types/cycle';

export default function App() {
  const [currentDay, setCurrentDay] = useState<number>(14);
  const [currentView, setCurrentView] = useState<NavView>('overview');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [vitals, setVitals] = useState<DailyVitals>(INITIAL_VITALS);
  const [symptoms, setSymptoms] = useState<ActiveSymptoms>(INITIAL_SYMPTOMS);
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [periodLength, setPeriodLength] = useState<number>(5);

  const currentPhase = PHASES_DATA[getPhaseForDay(currentDay)];

  const handleUpdateVitals = (updated: Partial<DailyVitals>) => {
    setVitals(prev => ({ ...prev, ...updated }));
  };

  const handleUpdateSymptoms = (newSymptoms: ActiveSymptoms) => {
    setSymptoms(newSymptoms);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 font-sans flex flex-col relative">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        currentDay={currentDay}
        currentPhase={currentPhase}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Main Content Area (Offset for desktop sidebar) */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Main Top Header */}
        <Header
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
          currentDay={currentDay}
          onSetCurrentDay={setCurrentDay}
          currentPhase={currentPhase}
          currentView={currentView}
          onOpenLogModal={() => setIsLogModalOpen(true)}
          onOpenChat={() => setIsChatOpen(true)}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          
          {/* Main Dashboard Overview View */}
          {currentView === 'overview' && (
            <>
              {/* Dominant Hero Card: Biological Phase & Cycle Dial */}
              <PhaseDialCard
                currentDay={currentDay}
                currentPhase={currentPhase}
                onSelectDay={setCurrentDay}
              />

              {/* Interactive Calendar with Google Calendar Sync */}
              <CalendarView
                currentDay={currentDay}
                onSelectDay={setCurrentDay}
                currentPhase={currentPhase}
              />

              {/* Vitals & Biomarkers Metric Grid */}
              <VitalsGrid
                vitals={vitals}
                onUpdateVitals={handleUpdateVitals}
              />

              {/* Endocrine Flux & Hormone Trajectory Chart */}
              <HormoneChartCard
                currentDay={currentDay}
                onSelectDay={setCurrentDay}
              />

              {/* Mood Analytics Correlation Preview */}
              <MoodAnalyticsPreviewCard
                currentDay={currentDay}
                currentPhase={currentPhase}
                currentMood={symptoms.mood}
                onOpenFullAnalytics={() => setCurrentView('moods')}
              />

              {/* Two-Column Layout for Cycle Syncing & Interactive Symptom Logger */}
              <div className="space-y-6">
                <CycleSyncingCard currentPhase={currentPhase} />
                <SymptomLoggerCard
                  symptoms={symptoms}
                  onUpdateSymptoms={handleUpdateSymptoms}
                />
              </div>

              {/* Google Meet & Telehealth Quick Action Card */}
              <div className="bg-gradient-to-r from-teal-900/80 via-stone-900 to-teal-950 text-white rounded-2xl p-5 border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-medium border border-teal-500/30">
                    <Video className="w-3 h-3" />
                    <span>Google Meet Integrado</span>
                  </div>
                  <h4 className="text-base font-serif font-medium">¿Necesitas una consulta médica o asesoría biorrítmica?</h4>
                  <p className="text-xs text-stone-300 max-w-xl">
                    Crea videollamadas instantáneas con Google Meet o agenda una sesión de ginecología, nutrición o SPM vinculada a tu Google Calendar.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('meet')}
                  className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-stone-950 font-semibold text-xs rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Abrir Google Meet</span>
                </button>
              </div>

              {/* Longitudinal History & Regularity Grid */}
              <CycleHistoryCard />
            </>
          )}

          {/* Dedicated Calendar View */}
          {currentView === 'calendar' && (
            <div className="space-y-6">
              <CalendarView
                currentDay={currentDay}
                onSelectDay={setCurrentDay}
                currentPhase={currentPhase}
              />
              <PhaseDialCard
                currentDay={currentDay}
                currentPhase={currentPhase}
                onSelectDay={setCurrentDay}
              />
            </div>
          )}

          {/* Dedicated Cycle Projections View */}
          {currentView === 'projections' && (
            <div className="space-y-6">
              <CalendarView
                currentDay={currentDay}
                onSelectDay={setCurrentDay}
                currentPhase={currentPhase}
              />
            </div>
          )}

          {/* Dedicated Mood Analytics View */}
          {currentView === 'moods' && (
            <div className="space-y-6">
              <MoodAnalyticsView
                currentDay={currentDay}
                onSelectDay={setCurrentDay}
                currentPhase={currentPhase}
                onUpdateCurrentDayMood={(newMood) => setSymptoms(prev => ({ ...prev, mood: newMood }))}
              />
            </div>
          )}

          {/* Dedicated Google Meet & Telehealth View */}
          {currentView === 'meet' && (
            <div className="space-y-6">
              <GoogleMeetView
                currentDay={currentDay}
                currentPhase={currentPhase}
              />
            </div>
          )}

          {/* Dedicated Cycle Dial & Phases View */}
          {currentView === 'wheel' && (
            <div className="space-y-6">
              <PhaseDialCard
                currentDay={currentDay}
                currentPhase={currentPhase}
                onSelectDay={setCurrentDay}
              />
              <HormoneChartCard
                currentDay={currentDay}
                onSelectDay={setCurrentDay}
              />
            </div>
          )}

          {/* Dedicated Vitals & Symptoms View */}
          {currentView === 'vitals' && (
            <div className="space-y-6">
              <VitalsGrid
                vitals={vitals}
                onUpdateVitals={handleUpdateVitals}
              />
              <SymptomLoggerCard
                symptoms={symptoms}
                onUpdateSymptoms={handleUpdateSymptoms}
              />
            </div>
          )}

          {/* Dedicated Cycle Syncing View */}
          {currentView === 'syncing' && (
            <div className="space-y-6">
              <CycleSyncingCard currentPhase={currentPhase} />
              <PhaseDialCard
                currentDay={currentDay}
                currentPhase={currentPhase}
                onSelectDay={setCurrentDay}
              />
            </div>
          )}

          {/* Dedicated Hormones Curve View */}
          {currentView === 'hormones' && (
            <div className="space-y-6">
              <HormoneChartCard
                currentDay={currentDay}
                onSelectDay={setCurrentDay}
              />
              <PhaseDialCard
                currentDay={currentDay}
                currentPhase={currentPhase}
                onSelectDay={setCurrentDay}
              />
            </div>
          )}

          {/* Dedicated Cycle History View */}
          {currentView === 'history' && (
            <div className="space-y-6">
              <CycleHistoryCard />
            </div>
          )}

          {/* Dedicated Settings & Calibration View */}
          {currentView === 'settings' && (
            <SettingsView
              cycleLength={cycleLength}
              onUpdateCycleLength={setCycleLength}
              periodLength={periodLength}
              onUpdatePeriodLength={setPeriodLength}
            />
          )}

          {/* Quiet, Human Editorial Footer */}
          <footer className="pt-8 pb-4 text-xs text-stone-500 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>Cyclia · Inteligencia Biorrítmica & Sincronización Hormonal · Privado y Encriptado</p>
            <p className="font-mono tabular-nums">Día {currentDay} del Ciclo de {cycleLength} días</p>
          </footer>
        </main>
      </div>

      {/* Quick Entry Log Modal */}
      <LogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        currentDay={currentDay}
        vitals={vitals}
        onSaveVitals={setVitals}
        symptoms={symptoms}
        onSaveSymptoms={setSymptoms}
      />

      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-stone-900 text-amber-200 rounded-full shadow-lg hover:bg-stone-800 hover:scale-105 active:scale-95 transition-all text-xs font-semibold cursor-pointer border border-stone-800/80"
        aria-label="Abrir asistente Cyclia"
      >
        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        <span>Chat con Cyclia</span>
      </button>

      {/* Interactive Real-Time Companion Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentDay={currentDay}
        currentPhase={currentPhase}
        vitals={vitals}
        symptoms={symptoms}
      />
    </div>
  );
}
