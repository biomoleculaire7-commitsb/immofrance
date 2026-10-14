import React, { useState } from 'react';
import {
  X,
  Code2,
  Cpu,
  Database,
  CheckCircle2,
  Copy,
  Terminal,
  FileCode,
  Layers,
} from 'lucide-react';

interface DeveloperGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperGuideModal: React.FC<DeveloperGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'nodejs' | 'python'>('architecture');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard?.writeText?.(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const pythonSnippet = `# العقل المدبر لـ ImmoAI بلغة بايثون (Python 3.10+ & Google GenAI)
# تثبيت الحزم: pip install google-genai fastapi uvicorn pydantic

import os
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def analyser_fiche_paie(document_text: str, loyer_mensuel: float):
    prompt = f"""
    أنت خبير في تدقيق ملفات الإيجار وقوانين العقارات الفرنسية (Loi ALUR / GLI).
    قم بقراءة وثيقة قسيمة الراتب واستخراج التالي بدقة:
    1. Salaire Net avant impôt (صافي الراتب الشهري)
    2. Type de contrat (CDI, CDD, Intérim, Fonctionnaire)
    3. Période d'essai (هل فترة التجربة سارية أم منتهية)
    4. حساب نسبة الملاءة المالية: (Loyer / Salaire Net) * 100
    5. هل يتحقق شرط فرنسا الشهير (الراتب يعادل 3 أضعاف الإيجار على الأقل)؟
    
    الإيجار المطلوب: {loyer_mensuel} يورو/شهرياً.
    نص الوثيقة:
    {document_text}
    """
    
    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )
    return response.text
`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full shadow-2xl text-slate-100 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>دليل البنية البرمجية والذكاء الاصطناعي</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                  TypeScript & Node.js
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                إجابة سؤالك وخريطة الطريق التقنية لتطبيق ImmoAI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 pt-3 space-x-3">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'architecture'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>خطة النظام والمعمارية</span>
          </button>
          <button
            onClick={() => setActiveTab('nodejs')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'nodejs'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>كود Node.js المدمج حالياً</span>
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'python'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>كود بايثون المقابل (Python Script)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-sm leading-relaxed text-slate-300">
          {activeTab === 'architecture' && (
            <div className="space-y-4 text-right" dir="rtl">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                <h3 className="font-bold text-white text-base mb-2 text-emerald-400">
                  لقد قمنا ببناء المشروع بالكامل بـ TypeScript / Node.js
                </h3>
                <p className="text-xs text-slate-300">
                  بما أن بيئة التطبيق الحالية تعتمد على Vite و React و Express، فقد قمنا بكتابة الـ Backend كاملاً بـ
                  <strong> TypeScript (Node.js)</strong> واستخدام حزمة <code>@google/genai</code> الرسمية من Google في المسار <code>/api/analyze-dossier</code>.
                  كما أعددنا لك كود بايثون في التبويب الآخر إذا أردت تشغيله مستقلاً!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <span className="font-bold text-white block mb-1">1. الواجهة (Frontend)</span>
                  <ul className="space-y-1 text-slate-400">
                    <li>• لوحة تحكم الوكيل العقاري الفرنسي</li>
                    <li>• ماسح ومختبر فوري لقسائم الرواتب</li>
                    <li>• بوابة تقديم إلكترونية للمستأجرين</li>
                    <li>• صفحة هبوط موجهة للوكالات العقارية</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <span className="font-bold text-white block mb-1">2. محرك الذكاء (AI Core)</span>
                  <ul className="space-y-1 text-slate-400">
                    <li>• نموذج <code>gemini-3.8-flash</code> فائق السرعة</li>
                    <li>• استخراج الراتب الصافي ونوع العقد بدقة</li>
                    <li>• رصد فترة التجربة (Période d'essai)</li>
                    <li>• حساب معادلة 33% والتأمين ضد التعثر</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <span className="font-bold text-white block mb-1">3. قاعدة البيانات (Database)</span>
                  <ul className="space-y-1 text-slate-400">
                    <li>• مهيأة حالياً بذاكرة حية مع عينات فرنسية</li>
                    <li>• جاهزة للربط الفوري مع Supabase / PostgreSQL أو Firestore عند رغبتك</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nodejs' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">server.ts → POST /api/analyze-dossier</span>
                <span className="text-emerald-400 font-semibold">يعمل الآن بالفعل على المنفذ 3000</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800 leading-normal">
{`import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

app.post('/api/analyze-dossier', async (req, res) => {
  const { documentText, rentAmount } = req.body;
  const rent = parseFloat(rentAmount) || 800;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: documentText,
    config: {
      systemInstruction: 'Expert analyse bulletin de paie français & calcul 3x loyer (loi ALUR/GLI)',
      responseMimeType: 'application/json',
      responseSchema: { ... }
    }
  });

  res.json({ analysis: JSON.parse(response.text) });
});`}
              </pre>
            </div>
          )}

          {activeTab === 'python' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">script_immoai.py (بايثون البديل)</span>
                <button
                  onClick={() => handleCopy(pythonSnippet, 'py')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied === 'py' ? 'تم النسخ !' : 'نسخ الكود'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-emerald-300/90 overflow-x-auto border border-slate-800 leading-normal">
                {pythonSnippet}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
