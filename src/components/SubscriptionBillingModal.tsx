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
  const [activeTab, setActiveTab] = useState<'plans' | 'model_fr' | 'payouts_fr' | 'code'>('plans');
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

  const stripeBackendCode = `// 1. Installation des dépendances : npm install stripe express dotenv
import Stripe from 'stripe';
import express from 'express';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const app = express();

// A. Création de la session Checkout avec essai 14 jours puis 79 €/mois
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
              description: 'Traitement illimité des dossiers locatifs & Scoring Loi ALUR',
            },
            unit_amount: 7900, // 79.00 EUR HT
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      // Période d'essai gratuit de 14 jours (0 € débités immédiatement)
      subscription_data: {
        trial_period_days: 14,
        metadata: { agencyId },
      },
      success_url: \`\${process.env.APP_URL}/?session_id={CHECKOUT_SESSION_ID}&billing_success=true\`,
      cancel_url: \`\${process.env.APP_URL}/?billing_canceled=true\`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// B. Réception des événements Stripe Webhooks
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
      // Début de l'essai de 14 jours (statut 'trialing')
      break;
    }
    case 'invoice.payment_succeeded': {
      // Paiement de 79 € HT réussi à l'issue des 14 jours
      break;
    }
  }

  res.json({ received: true });
});`;

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
                  Abonnement & Facturation (Essai 14 jours puis 79 € / mois)
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  Stripe SaaS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tarification B2B agences immobilières, cycle d'encaissement et intégration technique
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
            onClick={() => setActiveTab('plans')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'plans'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Offres & Souscription</span>
          </button>

          <button
            onClick={() => setActiveTab('model_fr')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'model_fr'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Modèle 14 Jours & Stratégie B2B</span>
          </button>

          <button
            onClick={() => setActiveTab('payouts_fr')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'payouts_fr'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Euro className="w-4 h-4 text-emerald-400" />
            <span>Virements & Encaissements SEPA</span>
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
            <span>Code & Webhooks Stripe</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* TAB 1: PRICING & CHECKOUT */}
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
                      Statut de votre compte agence
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
                      Idéal pour évaluer la précision de l'IA sur vos dossiers en cours.
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
                      Usage illimité sans engagement, résiliable à tout moment en 1 clic.
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
                      <span>Facturation française conforme TVA & Support dédié</span>
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
                        <span>Ouvrir Stripe Checkout (Page Sécurisée)</span>
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

          {/* TAB 2: MODEL B2B SAAS STRATEGY */}
          {activeTab === 'model_fr' && (
            <div className="space-y-6 leading-relaxed">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-800 to-slate-900 border border-emerald-500/30">
                <h3 className="text-base font-bold text-emerald-400 mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Le modèle standard des logiciels PropTech en France</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Le modèle <strong>Essai gratuit 14 jours puis 79 € HT / mois</strong> est la norme pour les solutions B2B destinées aux agences immobilières. Les professionnels ont besoin de vérifier la fiabilité de l'analyse sur 4 à 5 dossiers réels avant de s'abonner.
                </p>
              </div>

              {/* 2 Strategic Choices */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Deux stratégies de conversion disponibles :</h4>
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
                      <span className="font-bold text-white text-sm">1. Carte bancaire à l'inscription (Recommandé)</span>
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-slate-300 mb-2">
                      L'agence renseigne sa carte sur Stripe Checkout pour <strong>0,00 € immédiatement</strong>. Le 15ème jour, le débit récurrent de <strong>79 € HT</strong> s'enclenche automatiquement sans intervention manuelle.
                    </p>
                    <span className="text-[11px] text-emerald-400 font-semibold block">
                      Taux de conversion élevé (+75% de rétention payante).
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
                      <span className="font-bold text-white text-sm">2. Sans carte bancaire (Acquisition rapide)</span>
                      <Zap className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-slate-300 mb-2">
                      L'agence s'inscrit avec son simple email. Au 15ème jour, l'analyse est verrouillée et une modale Paywall propose d'activer le Pack Pro à 79 €/mois pour continuer.
                    </p>
                    <span className="text-[11px] text-amber-400 font-semibold block">
                      Zéro friction à l'inscription, idéal pour le lancement.
                    </span>
                  </div>
                </div>
              </div>

              {/* 5 Implementation Steps */}
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-bold text-white">Les 5 étapes de fonctionnement avec Stripe :</h4>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700">
                    <strong className="text-emerald-400 block mb-1">Étape 1 : Création du produit récurrent dans Stripe</strong>
                    <p className="text-slate-300">
                      Un produit <strong>ImmoAI Pro</strong> à <strong>79,00 € EUR mensuel</strong> récurrent est créé sur Stripe. Il génère un identifiant de prix (Price ID).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700">
                    <strong className="text-emerald-400 block mb-1">Étape 2 : Configuration du délai de grâce de 14 jours</strong>
                    <p className="text-slate-300">
                      Le paramètre <code>subscription_data: &#123; trial_period_days: 14 &#125;</code> dans la session Checkout indique à Stripe de ne réaliser aucun prélèvement avant l'échéance des 14 jours.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700">
                    <strong className="text-emerald-400 block mb-1">Étape 3 : Traitement des Webhooks Stripe</strong>
                    <p className="text-slate-300">
                      Stripe notifie votre serveur en temps réel lors des événements clés :
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-400">
                        <li><code>customer.subscription.created</code> : Activation de l'essai (statut 'trialing').</li>
                        <li><code>invoice.payment_succeeded</code> : Premier prélèvement de 79 € réussi après 14 jours.</li>
                        <li><code>customer.subscription.deleted</code> : Résiliation de l'abonnement par l'agence.</li>
                      </ul>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700">
                    <strong className="text-emerald-400 block mb-1">Étape 4 : TVA française à 20% & Facturation conforme</strong>
                    <p className="text-slate-300">
                      Entre professionnels français, les prix sont exprimés en <strong>HT (Hors Taxes)</strong>. Un abonnement à 79 € HT correspond à <strong>94,80 € TTC</strong>. Stripe émet automatiquement des factures acquittées conformes aux normes fiscales françaises.
                    </p>
                  </div>
                </div>
              </div>

              {/* Trigger Paywall Simulation */}
              {onTriggerPaywall && (
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-4">
                  <div>
                    <h5 className="font-bold text-amber-300 text-xs">Simuler l'expiration de la période d'essai</h5>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Affichez l'écran de blocage Paywall tel qu'il apparaît à une agence après 14 jours d'utilisation.
                    </p>
                  </div>
                  <button
                    onClick={onTriggerPaywall}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition cursor-pointer"
                  >
                    Tester le Paywall
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PAYOUTS & BANK TRANSFERS */}
          {activeTab === 'payouts_fr' && (
            <div className="space-y-6 leading-relaxed">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30">
                <h3 className="text-base font-bold text-emerald-400 mb-1 flex items-center gap-2">
                  <Euro className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Comment les 79 € mensuels sont-ils versés sur votre compte bancaire ?</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Le système d'encaissement repose sur Stripe Payments. Vous n'avez jamais besoin d'exposer ou de stocker de coordonnées bancaires dans l'application.
                </p>
              </div>

              {/* 3 Step Flow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">1</div>
                  <h5 className="font-bold text-white">L'agence règle sur Stripe</h5>
                  <p className="text-slate-400">
                    L'agence immobilière saisit sa carte ou son mandat SEPA sur la page hébergée et sécurisée par Stripe Checkout.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center">2</div>
                  <h5 className="font-bold text-white">Stripe encaisse les fonds</h5>
                  <p className="text-slate-400">
                    Les 79 € sont crédités sur votre solde commercial Stripe (Stripe Balance) avec déduction des frais de transaction standards.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center">3</div>
                  <h5 className="font-bold text-white">Virement vers votre IBAN</h5>
                  <p className="text-slate-400">
                    Stripe effectue des virements automatiques (Payouts) directement vers votre compte bancaire professionnel (quotidien ou hebdomadaire).
                  </p>
                </div>
              </div>

              {/* Where to configure IBAN */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3 text-xs">
                <h4 className="text-sm font-bold text-emerald-400">
                  Où configurer votre IBAN bancaire ?
                </h4>
                <p className="text-slate-300">
                  Votre relevé d'identité bancaire (IBAN) doit être renseigné directement dans votre <strong>Dashboard Stripe</strong> (et jamais dans le code source) :
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-2">
                  <li>Connectez-vous sur <strong>dashboard.stripe.com</strong>.</li>
                  <li>Rendez-vous dans <strong>Paramètres &gt; Comptes bancaires et virements</strong>.</li>
                  <li>Ajoutez votre <strong>IBAN</strong> professionnel et le nom du titulaire du compte.</li>
                  <li>Définissez la fréquence des virements souhaitée (automatique tous les jours ou chaque semaine).</li>
                </ol>
              </div>

              {/* Environment Variables */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
                <h4 className="text-sm font-bold text-white">
                  Que contient le fichier de configuration du serveur ?
                </h4>
                <p className="text-slate-300">
                  Sur le serveur, seules les clés d'API fournies par Stripe sont nécessaires dans votre fichier <code>.env</code> :
                </p>
                <pre className="p-3 rounded-xl bg-slate-950 font-mono text-emerald-300 text-[11px]">
{`# Clés de connexion sécurisée Stripe :
STRIPE_SECRET_KEY="sk_live_51Pxxxxxxxxxxxx..."
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxx..."`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: CODE SNIPPETS */}
          {activeTab === 'code' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Backend Express & Stripe Checkout (Abonnement avec période d'essai)</span>
                  <button
                    onClick={() => handleCopy(stripeBackendCode, 'backend')}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCodeId === 'backend' ? 'Copié !' : 'Copier le code'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800 leading-normal">
                  {stripeBackendCode}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
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
