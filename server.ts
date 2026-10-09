import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// POST /api/chat - Interactive real-time companion with user context
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userContext, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const name = userContext?.name || 'Ruth';
    const age = userContext?.age || '28';
    const cycleDuration = userContext?.cycleDuration || '28';
    const currentPhase = userContext?.currentPhase || 'Fase Ovulatoria';
    const currentDay = userContext?.currentDay || '14';
    const todaySymptoms = userContext?.todaySymptoms || 'Sin molestias particulares registradas hoy; energía alta.';
    const healthConditions = userContext?.healthConditions || 'Ninguna condición limitante reportada.';

    const systemPrompt = `[CYCLIA_SYSTEM_PROMPT]
CONTEXTO DE LA USUARIA ACTUAL:
- Nombre: ${name}
- Edad: ${age} años
- Ciclo promedio: ${cycleDuration} días
- Fase menstrual actual: ${currentPhase} (Día del ciclo: Día ${currentDay})
- Síntomas y notas de hoy: ${todaySymptoms}
- Condiciones de salud del perfil: ${healthConditions}

INSTRUCCIÓN ADICIONAL PARA EL CHAT:
- La usuaria te está hablando por un chat fluido e interactivo de asesoramiento continuo.
- Sé directa, concisa y empática (evita textos gigantes en el chat para mantener la legibilidad, máximo 150-200 palabras por respuesta).
- Si te pregunta sobre su estado actual, utiliza el contexto de su fase y síntomas de hoy para responder con precisión y calidez.
- Responde siempre en español con tono cálido, profesional, científico y motivador.`;

    if (!ai) {
      // Intelligent fallback when running without configured API key
      const fallbackReply = generateFallbackResponse(message, currentPhase, currentDay, name);
      return res.json({ reply: fallbackReply, source: 'local_engine' });
    }

    // Format chat history into contents array for Gemini
    const contents: any[] = [];
    
    // Add history
    if (Array.isArray(history)) {
      for (const turn of history.slice(-6)) {
        if (turn.role === 'user') {
          contents.push({ role: 'user', parts: [{ text: turn.content }] });
        } else if (turn.role === 'model' || turn.role === 'assistant') {
          contents.push({ role: 'model', parts: [{ text: turn.content }] });
        }
      }
    }

    // Add current user message
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'Entendido. Estoy aquí para acompañarte en cada momento de tu ciclo.';
    return res.json({ reply: replyText, source: 'gemini' });
  } catch (error: any) {
    console.error('Error handling /api/chat:', error);
    // Provide a helpful response even if API errors
    const fallbackReply = `Hola, he recibido tu consulta sobre el día ${req.body.userContext?.currentDay || 14}. Al encontrarte en tu ${req.body.userContext?.currentPhase || 'fase activa'}, tus niveles hormonales favorecen la adaptación y vitalidad. ¿Cómo te sientes respecto a tu energía y nutrición hoy?`;
    return res.json({ reply: fallbackReply, source: 'fallback' });
  }
});

// POST /api/daily-advice - Generate personalized daily cycle syncing advice
app.post('/api/daily-advice', async (req, res) => {
  try {
    const { userContext } = req.body;
    const currentPhase = userContext?.currentPhase || 'Fase Ovulatoria';
    const currentDay = userContext?.currentDay || '14';
    const name = userContext?.name || 'Ruth';

    if (!ai) {
      return res.json({
        advice: `Hola ${name}, hoy estás en el Día ${currentDay} (${currentPhase}). Tu estrógeno se encuentra en su pico más alto, lo cual amplifica tu memoria verbal, claridad mental y fuerza muscular. Aprovecha para entrenar fuerza o realizar tareas que requieran liderazgo y comunicación abierta. Prioriza alimentos frescos ricos en zinc y antioxidantes.`,
      });
    }

    const prompt = `Genera un breve consejo del día para ${name}, que está en el Día ${currentDay} de su ciclo (${currentPhase}).
Recuerda mantenerlo por debajo de 150-200 palabras, con un tono muy amable, empático y fundamentado en endocrinología femenina. Incluye un consejo de movimiento y uno de nutrición.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Eres Cyclia, la asistente de bienestar y ciclo biológico femenino. Eres cálida, rigurosa y empática.',
        temperature: 0.7,
      },
    });

    return res.json({ advice: response.text });
  } catch (err: any) {
    console.error('Error generating daily advice:', err);
    return res.json({
      advice: 'Tu cuerpo se encuentra en un ritmo óptimo. Escucha tus niveles de energía hoy y mantén una hidratación abundante.',
    });
  }
});

// Rule-based fallback generator for zero-latency testing
function generateFallbackResponse(message: string, currentPhase: string, currentDay: string | number, name: string): string {
  const lower = message.toLowerCase();
  
  if (lower.includes('energía') || lower.includes('vitalidad') || lower.includes('cansad')) {
    return `Hola ${name}. Al estar en tu ${currentPhase} (Día ${currentDay}), la fluctuación de estrógeno y progesterona tiene un impacto directo en tu metabolismo. En esta fase, aprovecha tus picos naturales de energía para actividades de mayor demanda o permítete descansar si sientes que tu cuerpo lo pide.`;
  }
  
  if (lower.includes('comer') || lower.includes('nutrición') || lower.includes('alimento') || lower.includes('dieta')) {
    return `Para tu ${currentPhase}, te recomiendo priorizar alimentos que apoyen la metabolización hepática del estrógeno: vegetales crucíferos (brócoli, rúcula), semillas de calabaza ricas en zinc, y bayas antioxidantes. Mantén una buena ingesta de agua mineralizada.`;
  }

  if (lower.includes('ejercicio') || lower.includes('entrenar') || lower.includes('fuerza') || lower.includes('gym')) {
    return `En el Día ${currentDay} (${currentPhase}), tu capacidad de recuperación neuromuscular es excelente. Los entrenamientos de resistencia, HIIT o levantamiento de pesas son ideales hoy. Solo mantén buena técnica en articulaciones debido a la relajación ligamentosa por los estrógenos.`;
  }

  return `Hola ${name}. En tu ${currentPhase} (Día ${currentDay}), tu cuerpo está transitando un momento biológico clave. Tus biomarcadores registrados indican estabilidad. Cuéntame si experimentas alguna molestia o si deseas adaptar tu alimentación o entrenamiento de hoy.`;
}

// Start Server and mount Vite
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cyclia Full-Stack server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
