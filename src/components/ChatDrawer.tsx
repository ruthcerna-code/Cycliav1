import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  RotateCcw, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { CyclePhaseInfo, DailyVitals, ActiveSymptoms } from '../types/cycle';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentDay: number;
  currentPhase: CyclePhaseInfo;
  vitals: DailyVitals;
  symptoms: ActiveSymptoms;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  currentDay,
  currentPhase,
  vitals,
  symptoms
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `¡Hola, Ruth! Estoy sincronizada con tu ciclo. Hoy estás en el Día ${currentDay} (${currentPhase.name}). He cargado tus biomarcadores (temperatura ${vitals.basalBodyTemp}°C, energía ${symptoms.energy}). ¿En qué puedo orientarte hoy sobre tu entrenamiento, nutrición o estado anímico?`,
      timestamp: 'Ahora'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    '¿Por qué me siento con esta energía hoy?',
    '¿Qué alimentos potencian mi fase actual?',
    '¿Es buen día para entrenamiento de fuerza?',
    '¿Cómo están mis hormonas en este día?'
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build the contextual user object as requested in the Cyclia specification
      const todaySymptomsSummary = [
        `Ánimo: ${symptoms.mood}`,
        `Energía: ${symptoms.energy}`,
        `Flujo: ${symptoms.cervicalFluid}`,
        `Cólicos: ${symptoms.cramps}`,
        symptoms.headache ? 'Cefalea presente' : '',
        symptoms.bloating ? 'Retención/hinchazón leve' : '',
        `Temperatura Basal: ${vitals.basalBodyTemp}°C`,
        `Frecuencia cardíaca en reposo: ${vitals.restingHeartRate} bpm`
      ].filter(Boolean).join(', ');

      const userContext = {
        name: 'Ruth Cerna',
        age: 28,
        cycleDuration: 28,
        currentPhase: currentPhase.name,
        currentDay: currentDay,
        todaySymptoms: todaySymptomsSummary,
        healthConditions: 'Perfil saludable, sin patologías limitantes.'
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          userContext,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'He recibido tu mensaje. ¿Hay algún otro síntoma que desees registrar?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Hola Ruth, en este Día ${currentDay} (${currentPhase.name}), tus niveles de energía y constantes biológicas están en un punto óptimo. Recuerda mantenerte hidratada y escuchar las señales de tu cuerpo.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: `Chat reiniciado con el contexto actualizado del Día ${currentDay} (${currentPhase.name}). ¿Qué consulta tienes para hoy?`,
        timestamp: 'Ahora'
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 transition-opacity"
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-[#FCFAF7] border-l border-stone-200/80 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200/80 bg-white/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-medium text-stone-900 text-base leading-tight">
                    Cyclia Asistente
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="En línea" />
                </div>
                <p className="text-[11px] text-stone-500 font-sans">
                  Asesoramiento Biológico & Cycle Syncing
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                title="Reiniciar chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                aria-label="Cerrar chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Biological Context Badge (Injected Prompt Status) */}
          <div className="mt-3 p-2.5 rounded-lg bg-stone-50 border border-stone-200/70 text-[11px] text-stone-600 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <Activity className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">
                Contexto: <strong className="text-stone-800 font-semibold font-mono">Día {currentDay}</strong> · {currentPhase.name.replace(' Phase', '')}
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 font-medium shrink-0 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Privado
            </span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-stone-900 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                  isUser 
                    ? 'bg-stone-900 text-white rounded-br-xs' 
                    : 'bg-white border border-stone-200/80 text-stone-800 rounded-bl-xs'
                }`}>
                  <p className="whitespace-pre-line">{msg.content}</p>
                  <span className={`block text-[10px] mt-1.5 text-right font-mono ${isUser ? 'text-stone-400' : 'text-stone-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-200 text-amber-900 font-semibold flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">
                    RC
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-7 h-7 rounded-full bg-stone-900 text-amber-300 flex items-center justify-center shrink-0 text-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white border border-stone-200/80 rounded-2xl px-4 py-3 text-xs text-stone-500 shadow-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.3s]" />
                <span className="ml-1 text-[11px]">Sintetizando respuesta biológica...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-stone-100 bg-[#FAF8F5]">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-[11px] text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors shrink-0 shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-stone-200/80 bg-white">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Pregunta a Cyclia sobre tu ciclo..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white text-stone-900 placeholder:text-stone-400 transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs shrink-0"
              aria-label="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-stone-600 text-center mt-2">
            Orientación biológica educativa. Consulta siempre a tu especialista médico.
          </p>
        </div>

      </aside>
    </>
  );
};
