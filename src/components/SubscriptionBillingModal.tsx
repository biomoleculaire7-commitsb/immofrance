import React, { useState } from 'react';
import {
  X,
  CreditCard,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Zap,
  Sparkles,
  Lock,
  ArrowRight,
  Code2,
  FileText,
  Copy,
  Clock,
  HelpCircle,
  Building2,
  Euro,
  Terminal,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

interface SubscriptionBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerPaywall?: () => void;
}

export const SubscriptionBillingModal: React.FC<SubscriptionBillingModalProps> = ({
  isOpen,
  onClose,
  onTriggerPaywall,
}) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'guide_ar' | 'payouts_ar' | 'code'>('guide_ar');
  const [selectedStrategy, setSelectedStrategy] = useState<'card_upfront' | 'no_card'>('no_card');
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(11);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [isSubscribedSuccess, setIsSubscribedSuccess] = useState<boolean>(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [checkoutMode, setCheckoutMode] = useState<'live' | 'test' | 'simulated' | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard?.writeText?.(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const handleStartCheckout = async (skipTrial: boolean = false) => {
    setIsSubscribing(true);
    setCheckoutError(null);
    setCheckoutUrl(null);

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyEmail: 'direction@agence-immobiliere.fr',
          agencyId: 'agency_current_test',
          skipTrial,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la génération de la session Stripe');
      }

      setCheckoutUrl(data.url);
      setCheckoutMode(data.mode || (data.simulated ? 'simulated' : 'test'));
    } catch (err: any) {
      setCheckoutError(err.message || 'Impossible de contacter l\'API de facturation');
    } finally {
      setIsSubscribing(false);
    }
  };

  const stripeBackendCode = `// 1. تثبيت الحزم: npm install stripe express dotenv
import Stripe from 'stripe';
import express from 'express';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const app = express();

// A. إنشاء جلسة الدفع باشتراك 79€ وتجربة مجانية 14 يوماً
app.post('/api/create-checkout-session', async (req, res) => {
  const { agencyEmail, agencyId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'sepa_debit'],
      mode: 'subscription',
      customer_email: agencyEmail,
      client_reference_id: agencyId,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'ImmoAI - Pack Agence Pro',
              description: 'Traitement illimité des dossiers locatifs & Scoring IA',
            },
            unit_amount: 7900, // 79.00 EUR (بدون الضرائب)
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      // 🌟 السر هنا: تحديد فترة التجربة المجانية 14 يوماً
      subscription_data: {
        trial_period_days: 14,
        metadata: { agencyId },
      },
      // تفعيل ضريبة القيمة المضافة الفرنسية تلقائياً (TVA 20%)
      automatic_tax: { enabled: true },
      success_url: \`\${process.env.APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true\`,
      cancel_url: \`\${process.env.APP_URL}/billing?canceled=true\`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// B. استقبال إشعارات Stripe (Webhooks) لتفعيل الحساب
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).send(\`Webhook Error: \${err.message}\`);
  }

  switch (event.type) {
    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription;
      // الحالة: trial_ends_at = 14 يوماً من الآن
      console.log('بدأت فترة التجربة لـ:', subscription.customer);
      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      // تم الخصم بنجاح بعد انتهاء الـ 14 يوماً
      console.log('تم دفع 79 يورو بنجاح!');
      break;
    }
    case 'customer.subscription.deleted': {
      // ألغت الوكالة الاشتراك
      break;
    }
  }

  res.json({ received: true });
});`;

  const noCardBackendCode = `// كود الخيار الثاني بالكامل (بدون بطاقة بنكية - No Card Required)
import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
const app = express();

// 1. تسجيل الوكالة وبدء الـ 14 يوماً فوراً (بدون طلب أي بطاقة)
app.post('/api/register-agency', async (req, res) => {
  const { name, email, phone } = req.body;
  
  // حساب تاريخ انتهاء الـ 14 يوماً
  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  // حفظ الوكالة في قاعدة بياناتك (PostgreSQL / Supabase)
  const agency = await db.agencies.create({
    data: {
      name,
      email,
      phone,
      trial_ends_at: trialEndsAt,
      subscription_status: 'trialing', // تجربة مجانية
    }
  });

  res.json({ success: true, agency, message: 'بدأت فترتك التجريبية لـ 14 يوماً بنجاح!' });
});

// 2. Middleware لحماية الـ API والتأكد من سريان التجربة أو الاشتراك المدفوع
export function checkAccess(req, res, next) {
  const agency = req.agency;
  const now = new Date();
  
  // فحص: هل الـ 14 يوماً ما زالت سارية؟
  const isTrialActive = agency.trial_ends_at && now < new Date(agency.trial_ends_at);
  // فحص: هل الوكالة مشتركة باشتراك مدفوع؟
  const isPaid = agency.subscription_status === 'active_pro';

  if (!isTrialActive && !isPaid) {
    // 🚨 انتهت الـ 14 يوماً: إرجاع خطأ يفتح شاشة الـ Paywall فوراً
    return res.status(403).json({
      error: 'TRIAL_EXPIRED',
      message: 'انتهت فترة الـ 14 يوماً المجانية. يرجى تفعيل اشتراك 79€/شهر للمتابعة.'
    });
  }

  next();
}

// 3. عند انتهاء الـ 14 يوماً: زر الترقية لـ 79€ شهرياً
app.post('/api/upgrade-to-pro', async (req, res) => {
  const { agencyId, agencyEmail } = req.body;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: agencyEmail,
    client_reference_id: agencyId,
    line_items: [{ price: 'price_79_eur_monthly', quantity: 1 }],
    automatic_tax: { enabled: true },
    success_url: \`\${process.env.APP_URL}/dashboard?upgraded=true\`,
    cancel_url: \`\${process.env.APP_URL}/billing\`,
  });

  res.json({ checkoutUrl: session.url });
});`;

  const clientCheckoutCode = `// في واجهة React: عند النقر على ترقية الحساب
const handleUpgrade = async () => {
  const res = await fetch('/api/upgrade-to-pro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agencyId: 'ag_123', agencyEmail: 'contact@agence.fr' }),
  });

  const { checkoutUrl } = await res.json();
  window.location.href = checkoutUrl; // تحويل لـ Stripe لدفع 79€
};`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[95vh] animate-fadeIn">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  نظام الاشتراك والدفع (14 يوم مجاناً ثم 79€/شهر)
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  Stripe SaaS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                دليل التنفيذ التقني، تجربة واجهة الوكالة العقارية، والأكواد البرمجية الجاهزة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 pt-3 space-x-4">
          <button
            onClick={() => setActiveTab('guide_ar')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'guide_ar'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>خطة الـ 14 يوماً</span>
          </button>

          <button
            onClick={() => setActiveTab('payouts_ar')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'payouts_ar'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Euro className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white">كيف تستلم أرباحك؟ (الدورة المالية)</span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'plans'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>واجهة العرض والاشتراك (Simulation)</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'code'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>الأكواد البرمجية</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* TAB 1: ARABIC STEP-BY-STEP IMPLEMENTATION GUIDE */}
          {activeTab === 'guide_ar' && (
            <div className="space-y-6 text-right leading-relaxed" dir="rtl">
              {/* Intro Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-800 to-slate-900 border border-emerald-500/30">
                <h3 className="text-base font-bold text-emerald-400 mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>كيف تبني هذا النموذج بالضبط ليكون مربحاً ومريحاً للوكالات؟</span>
                </h3>
                <p className="text-xs text-slate-300">
                  نموذج <strong>(14-day free trial then 79€/month)</strong> هو المعيار الذهبي لبرمجيات الـ B2B SaaS في فرنسا. في فرنسا الوكالات العقارية لا تشتري فوراً بل تحتاج تجربة فحص 4 أو 5 ملفات للتأكد من دقة الذكاء الاصطناعي، ثم تتحول تلقائياً لاشتراك 79€ شهرياً.
                </p>
              </div>

              {/* 2 Strategic Choices */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">القرار الأول المهم: هل تطلب البطاقة البنكية فوراً أم لا؟</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Strategy A */}
                  <div
                    onClick={() => setSelectedStrategy('card_upfront')}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${
                      selectedStrategy === 'card_upfront'
                        ? 'border-emerald-500 bg-emerald-950/30 shadow-md ring-1 ring-emerald-500'
                        : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-sm">1. طلب البطاقة مسبقاً (موصى به للمداخيل المضمونة)</span>
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-slate-300 mb-2">
                      يدخل الوكيل بطاقته في Stripe فوراً، ويحصل على <strong>14 يوماً مجاناً بسعر 0€</strong>. في اليوم الـ 15 يتم خصم <strong>79€</strong> تلقائياً دون أي تدخل منه إلا إذا ألغى الاشتراك.
                    </p>
                    <span className="text-[11px] text-emerald-400 font-semibold block">
                      الميزة: معدل تحويل مرتفع جداً للأموال (80%+ يستمرون بالدفع).
                    </span>
                  </div>

                  {/* Strategy B */}
                  <div
                    onClick={() => setSelectedStrategy('no_card')}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${
                      selectedStrategy === 'no_card'
                        ? 'border-emerald-500 bg-emerald-950/30 shadow-md ring-1 ring-emerald-500'
                        : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-sm">2. بدون بطاقة إطلاقاً (أعلى عدد مستخدمين)</span>
                      <Zap className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-slate-300 mb-2">
                      يسجل الوكيل بإيميله فقط ويجرب المنصة لمدة 14 يوماً. عند انقضاء المدة، تُقفل ميزة فحص الملفات وتظهر رسالة: «انتهت فترتك التجريبية، اشترك بـ 79€ للاستمرار».
                    </p>
                    <span className="text-[11px] text-amber-400 font-semibold block">
                      الميزة: صفر تردد في التسجيل واكتساب سريع جداً للعملاء.
                    </span>
                  </div>
                </div>
              </div>

              {/* 5 Implementation Steps */}
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-bold text-white">خطوات البناء التقني الـ 5 مع Stripe:</h4>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700">
                    <strong className="text-emerald-400 block mb-1">الخطوة 1: إنشاء حساب Stripe وتفعيل فرنسا</strong>
                    <p className="text-slate-300">
                      افتح حساباً على <code>stripe.com</code> وأنشئ منتجاً باسم <strong>ImmoAI Pro</strong> بسعر <strong>79.00 EUR شهرياً</strong> متكرر (Recurring). ستحصل على <code>Price ID</code> يبدأ بـ <code>price_xxx</code>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700">
                    <strong className="text-emerald-400 block mb-1">الخطوة 2: كود إنشاء جلسة الدفع التجريبية (Checkout Session)</strong>
                    <p className="text-slate-300">
                      في خادم Node.js / Express، عند استدعاء <code>stripe.checkout.sessions.create</code>، مرر المعامل:
                      <br />
                      <code className="text-emerald-300 bg-slate-950 px-2 py-0.5 rounded mt-1 inline-block" dir="ltr">
                        subscription_data: &#123; trial_period_days: 14 &#125;
                      </code>
                      <br />
                      هذا المعامل يخبر Stripe بألا يخصم أي سنت إلا بعد مرور 14 يوماً بالتحديد!
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700">
                    <strong className="text-emerald-400 block mb-1">الخطوة 3: معالجة الـ Webhooks لتحديث قاعدة البيانات</strong>
                    <p className="text-slate-300">
                      يرسل لك Stripe إشعاراً آلياً فورياً عند الأحداث التالية:
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-400">
                        <li><code>customer.subscription.created</code>: تم بدء الـ 14 يوم (حالة الحساب: <code>status = 'trialing'</code>).</li>
                        <li><code>invoice.payment_succeeded</code>: تم الخصم الأول لـ 79€ بنجاح (حالة الحساب: <code>status = 'active'</code>).</li>
                        <li><code>customer.subscription.deleted</code>: قام الوكيل بالإلغاء (حالة الحساب: <code>status = 'canceled'</code>).</li>
                      </ul>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700">
                    <strong className="text-emerald-400 block mb-1">الخطوة 4: حماية الـ API للتحقق من الاشتراك في كل فحص</strong>
                    <p className="text-slate-300">
                      في كل مرة تطلب الوكالة فحص قسيمة راتب عبر <code>POST /api/analyze-dossier</code>، يتحقق الخادم في سطر واحد:
                      <br />
                      <code className="text-emerald-300 bg-slate-950 px-2 py-0.5 rounded mt-1 inline-block" dir="ltr">
                        if (!agency.isTrialActive() && !agency.hasActiveSubscription()) return res.status(403).json(...)
                      </code>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700">
                    <strong className="text-emerald-400 block mb-1">الخطوة 5: الضرائب والفوترة الفرنسية (TVA 20%)</strong>
                    <p className="text-slate-300">
                      في فرنسا، الشركات تتعامل بأسعار <strong>HT (بدون ضريبة)</strong>. لذلك 79€ HT تعني <strong>94.80€ TTC</strong> للمؤسسات الفرنسية. عند تفعيل <code>automatic_tax: &#123; enabled: true &#125;</code> في Stripe، يقوم Stripe آلياً باحتساب ضريبة فرنسا وإصدار فاتورة قانونية مطابقة للمواصفات الفرنسية (Facture conforme TVA).
                    </p>
                  </div>
                </div>
              </div>

              {/* DETAILED BLUEPRINT FOR OPTION 2 (NO CARD REQUIRED) */}
              <div className="p-5 rounded-2xl bg-slate-950 border-2 border-emerald-500/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>تفاصيل الخيار الثاني (بدون بطاقة بنكية - No Card Required) بالتفصيل:</span>
                  </span>
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                    الأسهل في كسب المستخدمين
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <p>
                    <strong>1. هيكل جدول الوكالات في قاعدة البيانات (PostgreSQL / Supabase):</strong>
                  </p>
                  <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto leading-normal" dir="ltr">
{`CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  subscription_status TEXT DEFAULT 'trialing', -- 'trialing' | 'expired' | 'active_pro'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT
);`}
                  </pre>

                  <p>
                    <strong>2. عند التسجيل (Sign Up):</strong>
                    <br />
                    يسجل الوكيل بإيميله واسم وكالته فقط. ينشئ الخادم سجلاً مع <code>trial_ends_at = NOW() + 14 days</code> ويفتح له لوحة التحكم فوراً.
                  </p>

                  <p>
                    <strong>3. متى يُقفل الحساب (Locking & Paywall)؟</strong>
                    <br />
                    في اليوم الـ 15، تنتهي الـ 14 يوماً. عندما يحاول فحص قسيمة راتب أو الدخول، يقوم الـ Backend بإرجاع كود <code>403 TRIAL_EXPIRED</code>، فتظهر له شاشة الـ <strong>Paywall</strong> التي تحسب له:
                    <em> «لقد قمت بتحليل 14 ملفاً ووفرت 12 ساعة عمل خلال أسبوعين! اشترك الآن بـ 79€ للاستمرار».</em>
                  </p>

                  <p>
                    <strong>4. خطة الرسائل البريدية التلقائية (Email Drip Campaign):</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-slate-400">
                      <li><strong>اليوم 1:</strong> مرحباً بك في ImmoAI + فيديو 60 ثانية يشرح فحص أول قسيمة راتب.</li>
                      <li><strong>اليوم 5:</strong> دراسة حالة (كيف وفرت وكالة هاوسمان 10 ساعات أسبوعياً بفضل مطابقة 33%).</li>
                      <li><strong>اليوم 11:</strong> «تنبيه: تبقى 3 أيام فقط على فترتك التجريبية المجانية».</li>
                      <li><strong>اليوم 14 (الصباح):</strong> «اليوم هو اليوم الأخير! أمّن وصولك المستمر بـ 79€/شهرياً».</li>
                      <li><strong>اليوم 15:</strong> «تم إيقاف فحص الملفات مؤقتاً، اضغط هنا لتفعيل اشتراكك الفوري بـ 79€».</li>
                    </ul>
                  </p>

                  {/* Simulator button */}
                  {onTriggerPaywall && (
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          onClose();
                          onTriggerPaywall();
                        }}
                        className="w-full py-3 px-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <Lock className="w-4 h-4 text-slate-950" />
                        <span>جرّب الآن: محاكاة انتهاء الـ 14 يوماً وظهور شاشة الـ Paywall للوكيل العقاري</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: HOW DO YOU GET PAID (THE FINANCIAL PIPELINE) */}
          {activeTab === 'payouts_ar' && (
            <div className="space-y-6 text-right leading-relaxed" dir="rtl">
              {/* Critical Alert */}
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-start space-x-3 gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-black shrink-0">
                  <X className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-rose-300">
                    هل أضع رقم بطاقتي البنكية في المنصة؟ — الجواب: لا قطعيّاً!
                  </h3>
                  <p className="text-xs text-rose-200/90 mt-1">
                    أرقام البطاقات البنكية (16 رقماً مع تاريخ الصلاحية و CVV) مخصصة فقط <strong>للشراء والخصم</strong>، ولا تُستخدم لاستقبال أموال الاشتراكات من الزبائن.
                    وضع رقم بطاقتك في كود المنصة يعتبر خطأً أمنياً فادحاً!
                  </p>
                </div>
              </div>

              {/* Step by Step Flow: From French Agency to Your Bank */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Euro className="w-4 h-4 text-emerald-400" />
                  <span>كيف تصلك أموال الاشتراكات (79€) إلى حسابك البنكي الحقيقي؟</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Step 1 */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">
                      1
                    </div>
                    <h5 className="font-bold text-white">الوكالة العقارية تدفع</h5>
                    <p className="text-slate-400">
                      تقوم الوكالة الفرنسية بإدخال بطاقتها في صفحة Stripe Checkout الرسمية والمؤمنة بالكامل.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center">
                      2
                    </div>
                    <h5 className="font-bold text-white">Stripe يحتفظ بالمال</h5>
                    <p className="text-slate-400">
                      يستقبل Stripe مبلغ 79€ في رصيدك التجاري (Stripe Balance)، ويخصم عمولته البسيطة (~1.5%).
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center">
                      3
                    </div>
                    <h5 className="font-bold text-white">التحويل التلقائي لحسابك (IBAN)</h5>
                    <p className="text-slate-400">
                      يقوم Stripe أوتوماتيكياً بتحويل الأرباح (Payouts) مباشرة إلى رقم حسابك البنكي (IBAN) كل يومين أو أسبوعياً!
                    </p>
                  </div>
                </div>
              </div>

              {/* Where do you configure your IBAN? */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3 text-xs">
                <h4 className="text-sm font-bold text-white text-emerald-400">
                  أين تضع رقم حسابك البنكي (IBAN) إذاً؟
                </h4>
                <p className="text-slate-300">
                  تضع رقم حسابك البنكي الدولي (IBAN) في <strong>لوحة تحكم موقع Stripe</strong> فقط (وليس في كود التطبيق):
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pr-2">
                  <li>تسجل دخولك في <strong>dashboard.stripe.com</strong>.</li>
                  <li>تذهب إلى <strong>Settings &gt; Bank accounts and scheduling</strong>.</li>
                  <li>تضيف رقم الـ <strong>IBAN</strong> الخاص بك واسم صاحب الحساب.</li>
                  <li>تحدد متى تريد استلام الأموال (تحويل يومي تلقائي، أو أسبوعي، أو شهري).</li>
                </ol>
              </div>

              {/* What goes into the code? */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
                <h4 className="text-sm font-bold text-white">
                  وما الذي نضعه في كود المنصة البرمجية إذاً؟
                </h4>
                <p className="text-slate-300">
                  في ملف الإعدادات <code>.env</code> على الخادم، تضع فقط <strong>مفاتيح الربط البرمجي (API Keys)</strong> التي يعطيك إياها Stripe:
                </p>
                <pre className="p-3 rounded-xl bg-slate-950 font-mono text-emerald-300 text-[11px]" dir="ltr">
{`# مفاتيح الربط التي يمنحك إياها Stripe ليعرف أن الاشتراكات تخص حسابك:
STRIPE_SECRET_KEY="sk_live_51Pxxxxxxxxxxxx..."
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxx..."`}
                </pre>
                <p className="text-slate-400 text-[11px]">
                  بهذه الطريقة، عندما يدفع أي شخص، يعرف Stripe تلقائياً أن هذه الـ 79€ لك أنت ويحولها لحسابك البنكي المسجل هناك.
                </p>
              </div>

              {/* Supported Bank Accounts */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-2 text-xs">
                <h4 className="text-sm font-bold text-white">
                  ما هي الحسابات البنكية التي يدعمها Stripe لاستقبال أموال اليورو؟
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li><strong>إذا كنت في فرنسا / أوروبا:</strong> أي حساب بنكي أوروبي عادي (BoursoBank, BNP, Société Générale, Revolut, Qonto, N26).</li>
                  <li><strong>إذا كنت خارج فرنسا / في العالم العربي:</strong> يمكنك فتح حساب بنكي أعمال عبر <strong>Wise Business</strong> بـ IBAN أوروبي وربطه بـ Stripe، أو تأسيس شركة إلكترونية في بريطانيا أو أمريكا عبر <strong>Stripe Atlas</strong>.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE PRICING & CHECKOUT SIMULATION */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              {/* Active Trial Banner for Current Agency */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                      Statut de votre compte
                    </span>
                    <h3 className="text-base font-black text-white">
                      Période d'essai gratuit active
                    </h3>
                    <p className="text-xs text-slate-300">
                      Il vous reste <strong>{trialDaysLeft} jours</strong> sur votre période d'essai de 14 jours.
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Date de fin d'essai :</span>
                  <span className="text-sm font-bold text-white">
                    {new Date(Date.now() + trialDaysLeft * 86400000).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Pricing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Free Plan */}
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Formule Découverte</span>
                    <h4 className="text-xl font-bold text-white mt-1">Essai 14 Jours</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Idéal pour tester l'analyse sur vos 20 premiers dossiers locatifs.
                    </p>
                  </div>

                  <div className="py-2">
                    <span className="text-3xl font-black text-white">0 €</span>
                    <span className="text-xs text-slate-400 ml-1">pendant 14 jours</span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-700/60 pt-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Extraction automatique de bulletins de paie</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Calcul de solvabilité (Règle des 33% / 3x loyer)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Export PDF propriétaire certifié</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-500">
                      <X className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>Limite à 25 dossiers d'analyse au total</span>
                    </li>
                  </ul>
                </div>

                {/* Pro 79€ Plan */}
                <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border-2 border-emerald-500 p-6 space-y-4 relative shadow-xl shadow-emerald-950/40">
                  <div className="absolute -top-3 right-6 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-3 py-0.5 rounded-full shadow">
                    Recommandé Agences
                  </div>

                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Abonnement Mensuel</span>
                    <h4 className="text-xl font-black text-white mt-1">Pack Agence Pro</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Usage illimité sans engagement, résiliable à tout moment.
                    </p>
                  </div>

                  <div className="py-2 flex items-baseline">
                    <span className="text-4xl font-black text-white">79 €</span>
                    <span className="text-xs text-slate-400 ml-1">HT / mois (94,80 € TTC)</span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-700/60 pt-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <strong className="text-white">Dossiers de candidature illimités</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Moteur Gemini 3.8 Flash ultra-rapide</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Rapports PDF personnalisés avec logo agence</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Portail candidat en marque blanche</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Support prioritaire & Facturation conforme TVA</span>
                    </li>
                  </ul>

                  {checkoutError && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{checkoutError}</span>
                    </div>
                  )}

                  {checkoutUrl ? (
                    <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-emerald-500/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Session Stripe générée avec succès !
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                          {checkoutMode === 'live' ? 'Stripe Live' : 'Stripe Test (Sans frais)'}
                        </span>
                      </div>

                      <a
                        href={checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3.5 px-4 rounded-xl font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-400/20 cursor-pointer text-center block"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Ouvrir Stripe Checkout (Page de Paiement Sécurisée)</span>
                      </a>

                      {/* Test Card Assistant */}
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] space-y-1 text-slate-300">
                        <div className="font-bold text-white flex items-center justify-between">
                          <span>💳 Carte de test Stripe officielle :</span>
                          <span className="text-emerald-400 font-mono">0,00 € débités aujourd'hui</span>
                        </div>
                        <div className="flex justify-between font-mono text-emerald-300 bg-slate-950 px-2 py-1 rounded">
                          <span>Numéro : 4242 4242 4242 4242</span>
                          <span>Exp: 12/28 • CVC: 123</span>
                        </div>
                        <p className="text-[10px] text-slate-400 pt-0.5">
                          ✨ 14 jours d'essai gratuit inclus. Premier débit de 79 € HT dans 14 jours.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleStartCheckout(false)}
                        disabled={isSubscribing}
                        className="w-full py-3.5 px-4 rounded-xl font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-400/20 cursor-pointer disabled:opacity-50"
                      >
                        {isSubscribing ? (
                          <span>Génération de la session Stripe...</span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <Lock className="w-4 h-4" />
                            Démarrer l'essai 14 jours (Puis 79 €/mois)
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setIsSubscribedSuccess(true);
                        }}
                        className="w-full py-2 px-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition cursor-pointer"
                      >
                        Activer la simulation directe (sans redirection)
                      </button>
                    </div>
                  )}

                  <p className="text-[10px] text-center text-slate-400">
                    💳 Aucun prélèvement avant la fin des 14 jours. Annulation en 1 clic.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CODE SNIPPETS (NODE.JS & STRIPE) */}
          {activeTab === 'code' && (
            <div className="space-y-6">
              {/* Option 2 Code */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-400 font-mono">
                    ★ كود الخيار الثاني (بدون بطاقة - No Card Required): تسجيل 14 يوم + قفل الحساب + ترقية
                  </span>
                  <button
                    onClick={() => handleCopy(noCardBackendCode, 'nocard')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCodeId === 'nocard' ? 'تم النسخ بنجاح !' : 'نسخ كود الخيار الثاني'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-300 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                  {noCardBackendCode}
                </pre>
              </div>

              {/* Option 1 Code */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-mono">
                    كود الخيار الأول (طلب البطاقة مسبقاً مع trial_period_days: 14)
                  </span>
                  <button
                    onClick={() => handleCopy(stripeBackendCode, 'backend')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCodeId === 'backend' ? 'تم النسخ بنجاح !' : 'نسخ كود الخيار الأول'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                  {stripeBackendCode}
                </pre>
              </div>

              <div className="flex justify-between items-center text-xs pt-2">
                <span className="text-slate-400 font-mono">Frontend React (Bouton d'abonnement)</span>
                <button
                  onClick={() => handleCopy(clientCheckoutCode, 'client')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCodeId === 'client' ? 'تم النسخ بنجاح !' : 'نسخ كود الـ Frontend'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 text-indigo-300 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                {clientCheckoutCode}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Paiements sécurisés cryptés SSL / 3D-Secure 2</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
