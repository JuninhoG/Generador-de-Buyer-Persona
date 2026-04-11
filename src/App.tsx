/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import html2pdf from 'html2pdf.js';
import { 
  ChevronRight, 
  ChevronLeft, 
  Star, 
  Copy, 
  Check,
  MessageCircle,
  LayoutGrid, 
  Target, 
  Zap, 
  Globe,
  Home,
  Loader2
} from 'lucide-react';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface FormData {
  niche: string;
  experience: string;
  country: string;
  businessName: string;
  nicheSpecificAnswer: string;
  problem: string;
  goal: string;
  channels: string;
  approach: string;
}

export default function App() {
  const [step, setStep] = useState(1);
  const [aiResponse, setAiResponse] = useState('');
  const [step3Insight, setStep3Insight] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzingStep2, setIsAnalyzingStep2] = useState(false);
  const [copied, setCopied] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<FormData>({
    niche: '',
    experience: '',
    country: '',
    businessName: '',
    nicheSpecificAnswer: '',
    problem: 'El cliente no sabe donde ni a quien esta vendiendo su producto o servicio',
    goal: 'Previsibilidad y Escalamiento de ROAS',
    channels: 'Instagram, Facebook, TikTok',
    approach: 'Basado en datos'
  });

  const niches = [
    'Salud y bienestar', 'Fitness y pérdida de peso',
    'Nutrición', 'Finanzas personales',
    'Negocios y emprendimiento', 'Carrera y recolocación',
    'Relaciones', 'Educación y concursos',
    'Belleza y estética', 'Marketing y ventas',
    'Terapia y desarrollo personal', 'Otro'
  ];

  const nicheQuestions: Record<string, string> = {
    'Salud y bienestar': '¿En qué área específica de la salud te enfocas (ej. salud mental, física, holística)?',
    'Fitness y pérdida de peso': '¿Cuál es el perfil de tu cliente ideal (ej. principiantes, atletas, post-parto)?',
    'Nutrición': '¿Ofreces planes personalizados, suplementos o educación nutricional?',
    'Finanzas personales': '¿Tu enfoque es ahorro, inversión, gestión de deudas o libertad financiera?',
    'Negocios y emprendimiento': '¿Te diriges a emprendedores que están empezando o a negocios ya establecidos?',
    'Carrera y recolocación': '¿Ayudas con la búsqueda de empleo, cambio de carrera o habilidades de liderazgo?',
    'Relaciones': '¿Te enfocas en parejas, solteros o relaciones familiares/profesionales?',
    'Educación y concursos': '¿Qué nivel educativo o tipo de examen/concurso preparas?',
    'Belleza y estética': '¿Ofreces servicios físicos, productos o formación para profesionales?',
    'Marketing y ventas': '¿Cuál es tu especialidad principal (ej. Ads, SEO, Copywriting, Ventas B2B)?',
    'Terapia y desarrollo personal': '¿Qué metodología utilizas principalmente (ej. Coaching, Psicología, Mindfulness)?',
    'Otro': 'Describe brevemente tu nicho y el problema principal que resuelves.'
  };

  const experienceOptions = [
    'Estoy empezando ahora', 'Menos de 1 año',
    '1 a 3 años', 'Más de 3 años'
  ];

  const generateStep3Insight = async () => {
    setIsAnalyzingStep2(true);
    const prompt = `Como experto en marketing de AdsLab, analiza brevemente esta respuesta de un cliente (${formData.businessName}) en el nicho de ${formData.niche} para el mercado de ${formData.country}: "${formData.nicheSpecificAnswer}".
    Identifica un "Punto Ciego" o una oportunidad de mercado específica relacionada con su respuesta y el país mencionado. 
    Dirígete directamente a ${formData.businessName} en tu respuesta.
    Sé breve (máximo 2 párrafos), directo y usa un tono profesional pero provocativo. 
    Responde 100% en ESPAÑOL. No uses markdown, solo texto plano.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setStep3Insight(response.text || "Detectamos una oportunidad crítica en tu segmentación actual.");
      setStep(3);
    } catch (error) {
      console.error("Error generating insight:", error);
      setStep3Insight("AdsLab detectó una desconexión entre tu oferta y el mercado. Necesitamos re-calibrar tu audiencia ideal.");
      setStep(3);
    } finally {
      setIsAnalyzingStep2(false);
    }
  };

  const callGemini = async () => {
    setIsGenerating(true);
    const systemPrompt = `Actúa como Senior Growth Marketer de AdsLab. Genera un Buyer Persona detallado y una Estrategia de Ads completa y EXCLUSIVA para ${formData.businessName} en el mercado de ${formData.country}.
    
    IMPORTANTE: Personaliza TODO el informe mencionando a ${formData.businessName} frecuentemente. No debe parecer genérico.
    
    Contexto:
    - Nombre/Empresa: ${formData.businessName}
    - Nicho: ${formData.niche}
    - Experiencia: ${formData.experience}
    - País objetivo: ${formData.country}
    - Detalle específico: ${formData.nicheSpecificAnswer}
    - Insight previo: ${step3Insight}
    
    Estructura el informe en:
    1. Perfil del Público Ideal para ${formData.businessName} en ${formData.country}.
    2. Análisis de Mercado Personalizado.
    3. Estrategia de Contenidos y Ads Exclusiva para ${formData.businessName}.
    4. Plan de Escalamiento para ${formData.businessName}.

    Formato: Usa HTML básico (h4, p, strong, ul, li) para estructurar el resultado. Sé muy técnico, directo y profesional. No incluyas bloques de código markdown, solo el HTML. Todo en ESPAÑOL.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: systemPrompt,
      });
      
      const rawText = response.text || "No se pudo generar el análisis.";
      setAiResponse(rawText.replace(/```html/g, '').replace(/```/g, ''));
      setStep(7);
    } catch (error) {
      console.error("Gemini Error:", error);
      setAiResponse("<p class='text-red-500'>Error al conectar con AdsLab Engine. Verifica la configuración de la API.</p>");
      setStep(7);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (step === 6) {
      callGemini();
    }
  }, [step]);

  const nextStep = () => {
    if (step === 1) {
      if (!formData.niche || !formData.experience) return;
      setStep(2);
    } else if (step === 2) {
      if (!formData.nicheSpecificAnswer || !formData.country || !formData.businessName) return;
      generateStep3Insight();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const resetApp = () => {
    setStep(1);
    setFormData({
      niche: '',
      experience: '',
      country: '',
      businessName: '',
      nicheSpecificAnswer: '',
      problem: 'El cliente no sabe donde ni a quien esta vendiendo su producto o servicio',
      goal: 'Previsibilidad y Escalamiento de ROAS',
      channels: 'Instagram, Facebook, TikTok',
      approach: 'Basado en datos'
    });
    setAiResponse('');
    setStep3Insight('');
    setCopied(false);
  };

  const handleCopy = () => {
    if (!reportRef.current) return;
    const text = reportRef.current.innerText;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 bg-slate-950">
      <div className="w-full max-w-3xl glass-panel rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-adslab-blue/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-adslab-purple/10 rounded-full blur-[100px]" />

        {/* Header / Progress Bar */}
        <div className="relative z-10 mb-10">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={resetApp}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
              title="Volver al inicio"
            >
              <Home className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-white">Generador de Persona y Nicho</h1>
            <div className="w-9" /> {/* Spacer */}
          </div>
          
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div 
                key={s} 
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-adslab-blue shadow-[0_0_10px_rgba(0,102,249,0.5)]' : 'bg-slate-800'}`}
              />
            ))}
          </div>

          {step < 6 && (
            <div className="text-[10px] font-bold text-adslab-blue uppercase tracking-[0.2em] mb-2">
              ETAPA {step} DE 7
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="relative z-10 min-h-[450px] sm:min-h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-2">¿Cuál es tu área de actuación?</h2>
                  <p className="text-slate-500 text-sm">No necesitas ser específico todavía. Elige el área general.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {niches.map((n) => (
                    <button 
                      key={n}
                      onClick={() => setFormData({ ...formData, niche: n })}
                      className={`p-4 rounded-xl border transition-all text-left text-sm font-medium ${
                        formData.niche === n 
                        ? 'bg-adslab-blue/10 border-adslab-blue text-white shadow-[0_0_15px_rgba(0,102,249,0.2)]' 
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                <div className="pt-4">
                  <h2 className="text-lg font-bold mb-4">¿Hace cuánto tiempo trabajas con esto?</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {experienceOptions.map((exp) => (
                      <button 
                        key={exp}
                        onClick={() => setFormData({ ...formData, experience: exp })}
                        className={`p-4 rounded-xl border transition-all text-left text-sm font-medium ${
                          formData.experience === exp 
                          ? 'bg-adslab-blue/10 border-adslab-blue text-white shadow-[0_0_15px_rgba(0,102,249,0.2)]' 
                          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && !isAnalyzingStep2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold mb-2">Calibración de Nicho</h2>
                <p className="text-slate-400 mb-8 italic text-lg leading-relaxed">
                  "Personalicemos el motor para tu industria y mercado."
                </p>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        ¿Cuál es tu nombre o el de tu empresa?
                      </label>
                      <input 
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        placeholder="Ej: Dra. Luz / AdsLab Agency"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:border-adslab-blue focus:ring-1 focus:ring-adslab-blue outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        ¿En qué país quieres enfocar tu análisis?
                      </label>
                      <input 
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        placeholder="Ej: España, México, Colombia..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:border-adslab-blue focus:ring-1 focus:ring-adslab-blue outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {nicheQuestions[formData.niche] || 'Cuéntanos más sobre tu negocio:'}
                    </label>
                    <textarea 
                      value={formData.nicheSpecificAnswer}
                      onChange={(e) => setFormData({ ...formData, nicheSpecificAnswer: e.target.value })}
                      placeholder="Escribe tu respuesta aquí..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:border-adslab-blue focus:ring-1 focus:ring-adslab-blue outline-none transition-all min-h-[120px]"
                    />
                  </div>
                </div>
                
                <div className="p-6 rounded-2xl bg-adslab-blue/5 border border-adslab-blue/20 flex gap-4 items-start">
                  <div className="p-2 bg-adslab-blue/10 rounded-lg">
                    <Globe className="w-5 h-5 text-adslab-blue" />
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Esta información permitirá a AdsLab Engine generar un análisis mucho más preciso para <strong>{formData.niche}</strong> en <strong>{formData.country || 'tu país'}</strong>.
                  </p>
                </div>
              </motion.div>
            )}

            {isAnalyzingStep2 && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 flex flex-col items-center justify-center"
              >
                <div className="loader mb-8" />
                <h2 className="text-2xl font-bold mb-3">Analizando tu respuesta...</h2>
                <p className="text-slate-500 animate-pulse">
                  Detectando patrones de mercado en el sector de <span className="text-adslab-blue font-bold">{formData.niche}</span>
                </p>
              </motion.div>
            )}

            {step === 3 && !isAnalyzingStep2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold mb-2">El Punto Ciego</h2>
                <p className="text-slate-400 mb-8 italic text-lg leading-relaxed">
                  "Lo que no ves es lo que frena tu escalamiento."
                </p>
                <div className="p-6 rounded-2xl bg-adslab-purple/5 border border-adslab-purple/20 flex gap-4 items-start">
                  <div className="p-2 bg-adslab-purple/10 rounded-lg">
                    <Target className="w-5 h-5 text-adslab-purple" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-adslab-purple font-bold">Análisis de AdsLab Engine:</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {step3Insight}
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-500 italic">
                  Basado en tu respuesta: "{formData.nicheSpecificAnswer.substring(0, 100)}..."
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold mb-2">Objetivo: Previsibilidad</h2>
                <p className="text-slate-400 mb-8 italic">Convertir la incertidumbre en un sistema de ROAS constante.</p>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-5 rounded-xl bg-slate-900 adslab-border flex items-center gap-4">
                    <div className="w-8 h-8 bg-adslab-blue/10 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-adslab-blue" />
                    </div>
                    <span className="font-medium">Escalamiento basado en datos</span>
                  </div>
                  <div className="p-5 rounded-xl bg-slate-900 adslab-border flex items-center gap-4">
                    <div className="w-8 h-8 bg-adslab-purple/10 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-adslab-purple" />
                    </div>
                    <span className="font-medium">Identificación de "Whales" (Clientes de alto valor)</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold mb-2">Ecosistema de Tráfico</h2>
                <p className="text-slate-400 mb-8">Canales seleccionados para la recolección de datos y despliegue de activos:</p>
                <div className="flex flex-wrap gap-3">
                  <div className="px-6 py-3 rounded-2xl bg-adslab-blue/20 border border-adslab-blue/30 text-adslab-blue font-bold flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Instagram
                  </div>
                  <div className="px-6 py-3 rounded-2xl bg-adslab-deep/20 border border-adslab-deep/30 text-adslab-deep font-bold flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Facebook
                  </div>
                  <div className="px-6 py-3 rounded-2xl bg-adslab-purple/20 border border-adslab-purple/30 text-adslab-purple font-bold flex items-center gap-2">
                    <Globe className="w-4 h-4" /> TikTok
                  </div>
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 flex flex-col items-center justify-center"
              >
                <div className="loader mb-8" />
                <h2 className="text-2xl font-bold mb-3">AdsLab Engine está procesando...</h2>
                <p className="text-slate-500 animate-pulse max-w-xs mx-auto">
                  Consultando modelos de datos y tendencias actuales en <span className="text-adslab-blue font-bold">{formData.niche}</span>
                </p>
              </motion.div>
            )}

            {step === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="p-[1px] rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-adslab mb-6">
                  <div 
                    ref={reportRef}
                    className="bg-slate-950 rounded-[calc(1.5rem-1px)] sm:rounded-[calc(2rem-1px)] p-5 sm:p-6 md:p-10 pr-6 sm:pr-8 md:pr-12 max-h-[400px] sm:max-h-[500px] overflow-y-auto custom-scrollbar"
                  >
                    <div className="flex justify-center mb-6">
                      <div className="px-4 py-1 bg-adslab-blue/10 border border-adslab-blue/20 rounded-full">
                        <h3 className="text-adslab-blue font-bold uppercase text-[10px] tracking-[0.3em]">
                          Informe de Estrategia AdsLab
                        </h3>
                      </div>
                    </div>
                    <div 
                      className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4
                        [&>h4]:text-adslab-blue [&>h4]:font-bold [&>h4]:text-lg [&>h4]:mt-6 [&>h4]:mb-2
                        [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2
                        [&>p]:mb-4
                        [&>strong]:text-white"
                      dangerouslySetInnerHTML={{ __html: aiResponse }}
                    />
                    
                    {/* Footer for PDF/Copy only */}
                    <div className="hidden print-only mt-12 pt-6 border-t border-slate-800 text-center text-[10px] text-slate-500">
                      Informe Exclusivo para {formData.businessName} • AdsLab AI Engine • {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <button 
                    onClick={handleCopy}
                    className="w-full bg-slate-900/50 border border-slate-800 text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm tracking-widest hover:bg-slate-800 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4 sm:w-5 h-5 text-green-500" /> : <Copy className="w-4 h-4 sm:w-5 h-5" />}
                    {copied ? 'Copiado' : 'Copiar Resumen'}
                  </button>
                  
                  <a 
                    href="https://wa.me/595987145624"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-adslab text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm tracking-widest hover:opacity-90 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-adslab-blue/20"
                  >
                    <MessageCircle className="w-4 h-4 sm:w-5 h-5" /> Aplicar estrategia
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        {step < 6 && !isAnalyzingStep2 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 sm:mt-12 flex items-center justify-between relative z-10"
          >
            <button 
              onClick={prevStep}
              disabled={step === 1}
              className={`flex items-center gap-2 font-bold transition-colors text-sm sm:text-base ${step === 1 ? 'text-slate-800 cursor-not-allowed' : 'text-slate-500 hover:text-white'}`}
            >
              <ChevronLeft className="w-4 h-4" /> Atrás
            </button>
            <button 
              onClick={nextStep}
              disabled={
                (step === 1 && (!formData.niche || !formData.experience)) ||
                (step === 2 && (!formData.nicheSpecificAnswer || !formData.country || !formData.businessName))
              }
              className={`group bg-gradient-adslab px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-white text-sm sm:text-base shadow-xl transition-all active:scale-95 flex items-center gap-2 ${
                ((step === 1 && (!formData.niche || !formData.experience)) || (step === 2 && (!formData.nicheSpecificAnswer || !formData.country || !formData.businessName)))
                ? 'opacity-50 cursor-not-allowed grayscale' 
                : 'hover:shadow-adslab-blue/20 hover:scale-105'
              }`}
            >
              {step === 5 ? 'GENERAR ANÁLISIS' : 'CONTINUAR'}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-adslab-blue/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-adslab-purple/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
