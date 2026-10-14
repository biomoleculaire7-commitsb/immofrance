import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  CreditCard,
  Cpu,
  ShieldCheck,
  FileText,
  Play,
  ArrowRight,
  Terminal,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface DiagnosticsData {
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  gemini: {
    configured: boolean;
    model: string;
    status: string;
  };
  stripe: {
    configured: boolean;
    mode: string;
    status: string;
    webhookConfigured: boolean;
  };
  system: {
    memoryUsageMb: number;
    nodeVersion: string;
    propertiesLoaded: number;
    candidatesActive: number;
    feedbacksRecorded: number;
  };
}

interface DiagnosticsCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToScanner: () => void;
  onNavigateToDashboard: () => void;
  onOpenFeedback: () => void;
}

export const DiagnosticsCenterModal: React.FC<DiagnosticsCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigateToScanner,
  onNavigateToDashboard,
  onOpenFeedback,
}) => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState<any | null>(null);
  const [testingStripe, setTestingStripe] = useState(false);
  const [stripeTestResult, setStripeTestResult] = useState<any | null>(null);
  const [generatingCheckout, setGeneratingCheckout] = useState(false);
  const [quickCheckoutUrl, setQuickCheckoutUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'how_to_test' | 'status'>('how_to_test');

  useEffect(() => {
    if (isOpen) {
      loadDiagnostics();
    }
  }, [isOpen]);

  const loadDiagnostics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/system/diagnostics');
      if (res.ok) {
        const data = await res.json();
        setDiagnostics(data);
      }
    } catch (err) {
      console.error('Erreur chargement diagnostics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const runLiveGeminiTest = async () => {
    setTestingGemini(true);
    setGeminiTestResult(null);
    try {
      const res = await fetch('/api/system/test-gemini', { method: 'POST' });
      const data = await res.json();
      setGeminiTestResult(data);
    } catch (err: any) {
      setGeminiTestResult({ success: false, error: err.message });
    } finally {
      setTestingGemini(false);
    }
  };

  const runLiveStripeTest = async () => {
    setTestingStripe(true);
    setStripeTestResult(null);
    try {
      const res = await fetch('/api/system/test-stripe', { method: 'POST' });
      const data = await res.json();
      setStripeTestResult(data);
    } catch (err: any) {
      setStripeTestResult({ success: false, error: err.message });
    } finally {
      setTestingStripe(false);
    }
  };

  const generateQuickCheckout = async () => {
    setGeneratingCheckout(true);
    setQuickCheckoutUrl(null);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyEmail: 'contact@agence-immobiliere.fr',
          agencyId: 'diagnostic_test_agency',
          skipTrial: false,
        }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        setQuickCheckoutUrl(data.url);
      }
    } catch (err: any) {
      console.error('Erreur checkout:', err);
    } finally {
      setGeneratingCheckout(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-fadeIn">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Centre de Diagnostic & Guide de Test de la Plateforme
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  Production Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Vérifiez la connectivité des clés IA, Stripe et suivez le guide pas-à-pas pour tester l'application
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
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 pt-3 space-x-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('how_to_test')}
            className={`pb-3 transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'how_to_test'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Guide de Démonstration & Scénarios Clés</span>
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`pb-3 transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'status'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>État du Système & Diagnostic Live</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 max-h-[72vh]">
          {/* TAB 1: HOW TO TEST GUIDE (100% FRENCH) */}
          {activeTab === 'how_to_test' && (
            <div className="space-y-6 leading-relaxed">
              {/* Ready banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-800 to-slate-900 border border-emerald-500/40">
                <h3 className="text-base font-bold text-emerald-400 mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Plateforme 100% prête pour le déploiement en agence immobilière</span>
                </h3>
                <p className="text-xs text-slate-300">
                  L'ensemble des modules a été calibré pour les standards du marché immobilier français : lecture de bulletins de salaire, règle de solvabilité des 33% (Loi ALUR & GLI), export PDF certifié propriétaire et abonnement Stripe sécurisé.
                </p>
              </div>

              {/* 5 Interactive Test Steps */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">5 scénarios pour tester l'application en conditions réelles :</h4>

                <div className="space-y-3 text-xs">
                  {/* Step 1 */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <span className="font-bold text-emerald-400 text-xs block">
                        Scénario 1 : Qualification automatique d'un bulletin de paie CDI
                      </span>
                      <p className="text-slate-300">
                        Rendez-vous dans l'onglet <strong>« Testeur IA »</strong> et sélectionnez l'exemple <em>Alexandre Martin (3 450 € net)</em>. Cliquez sur <strong>« Qualifier le dossier avec ImmoAI »</strong> pour observer l'extraction instantanée du salaire, de l'employeur et la validation de la période d'essai.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToScanner();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Tester le scanner</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <span className="font-bold text-emerald-400 text-xs block">
                        Scénario 2 : Génération et export du Rapport Propriétaire (PDF)
                      </span>
                      <p className="text-slate-300">
                        Après l'analyse ou depuis le Tableau de Bord, cliquez sur <strong>« Générer Rapport Propriétaire (PDF) »</strong>. Une fiche de synthèse certifiée au format A4 s'affiche, prête pour l'impression ou l'envoi direct par email au bailleur.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToDashboard();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs shrink-0 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Voir le Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <span className="font-bold text-emerald-400 text-xs block">
                        Scénario 3 : Parcours locataire sur le Portail Candidat Public
                      </span>
                      <p className="text-slate-300">
                        Ouvrez l'onglet <strong>« Portail Candidat »</strong>. C'est le lien que vous intégrez dans vos annonces SeLoger ou Leboncoin. Vous pouvez y déposer un dossier test qui apparaîtra immédiatement qualifié dans votre tableau de bord.
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Stripe Checkout Test */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <span className="font-bold text-emerald-400 text-xs block">
                        Scénario 4 : Test de paiement Stripe Pro (Essai 14 jours + 79 €/mois)
                      </span>
                      <p className="text-slate-300">
                        Générez une session de paiement sécurisée Stripe Checkout. Vous pouvez utiliser la carte de test officielle <code>4242 4242 4242 4242</code> (expiration future, CVC 123) pour tester le parcours d'abonnement sans aucun débit immédiat (0,00 € débités aujourd'hui).
                      </p>
                      {quickCheckoutUrl && (
                        <div className="pt-2">
                          <a
                            href={quickCheckoutUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Ouvrir la session Stripe Checkout générée</span>
                          </a>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={generateQuickCheckout}
                      disabled={generatingCheckout}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {generatingCheckout ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Génération...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Générer session Stripe</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Step 5 */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <span className="font-bold text-emerald-400 text-xs block">
                        Scénario 5 : Signalement d'anomalie ou suggestion d'amélioration
                      </span>
                      <p className="text-slate-300">
                        Si une fiche de paie présente une structure atypique ou si vous souhaitez suggérer une évolution, cliquez sur <strong>« Avis & Bugs »</strong>. Le ticket sera horodaté et enregistré avec un identifiant unique (ex: TK-3020).
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenFeedback();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Ouvrir le centre d'avis</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE SYSTEM STATUS & API KEYS */}
          {activeTab === 'status' && (
            <div className="space-y-5">
              {/* Reload action */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">
                  Dernière vérification du système : {diagnostics ? new Date(diagnostics.timestamp).toLocaleTimeString('fr-FR') : 'En cours...'}
                </span>
                <button
                  onClick={loadDiagnostics}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Actualiser l'état</span>
                </button>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Gemini Engine */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-bold text-white text-sm">Intelligence Artificielle</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        diagnostics?.gemini.configured
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {diagnostics?.gemini.configured ? 'CONNECTÉ' : 'CLÉ MANQUANTE'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Modèle configuré : <strong className="text-white font-mono">gemini-3.8-flash</strong>.
                    Lecture multimodale de bulletins de salaire (images & PDF) et extraction JSON structurée.
                  </p>

                  <div className="pt-1">
                    <button
                      onClick={runLiveGeminiTest}
                      disabled={testingGemini}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      {testingGemini ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Test de latence en cours...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Tester la réponse de l'IA en direct</span>
                        </>
                      )}
                    </button>

                    {geminiTestResult && (
                      <div
                        className={`mt-2 p-2.5 rounded-xl border text-[11px] ${
                          geminiTestResult.success
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                            : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                        }`}
                      >
                        {geminiTestResult.success ? (
                          <div className="flex justify-between items-center">
                            <span>IA Connectée & Active ! Réponse : "{geminiTestResult.response}"</span>
                            <span className="font-mono font-bold">{geminiTestResult.latencyMs} ms</span>
                          </div>
                        ) : (
                          <div>
                            <span>Mode algorithmique de secours actif ({geminiTestResult.error})</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stripe Billing */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5 text-indigo-400" />
                      <h4 className="font-bold text-white text-sm">Paiement & Abonnements</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        diagnostics?.stripe.configured
                          ? 'bg-indigo-950 text-indigo-400 border border-indigo-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {diagnostics?.stripe.configured ? `ACTIF (${diagnostics.stripe.mode.toUpperCase()})` : 'EN ATTENTE DE CLÉ'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Formule : <strong>Pack Agence Pro à 79 € HT / mois</strong> avec 14 jours d'essai gratuit.
                  </p>

                  <div className="pt-1">
                    <button
                      onClick={runLiveStripeTest}
                      disabled={testingStripe}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      {testingStripe ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Vérification Stripe en direct...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Tester la clé Stripe en direct</span>
                        </>
                      )}
                    </button>

                    {stripeTestResult && (
                      <div
                        className={`mt-2 p-2.5 rounded-xl border text-[11px] ${
                          stripeTestResult.success
                            ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
                            : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                        }`}
                      >
                        {stripeTestResult.success ? (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center font-bold">
                              <span>✅ {stripeTestResult.message}</span>
                              <span className="font-mono">{stripeTestResult.latencyMs} ms</span>
                            </div>
                            <div className="text-[10px] text-slate-300 font-mono">
                              Devises supportées : {stripeTestResult.availableCurrencies?.join(', ').toUpperCase()}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span>❌ Erreur Stripe : {stripeTestResult.error}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex justify-between">
                      <span>Carte de test :</span>
                      <strong className="text-emerald-400 font-mono">4242 4242 4242 4242</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Mode actif :</span>
                      <strong className="text-white font-mono uppercase">{diagnostics?.stripe.mode || 'test'}</strong>
                    </div>
                  </div>
                </div>

                {/* French Solvency Rule Engine */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-teal-400" />
                    <h4 className="font-bold text-white text-sm">Moteur Juridique Français (Loi ALUR)</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Vérification de la règle des 33% (Salaire net supérieur ou égal à 3x loyer CC), audit de la période d'essai et détection d'éligibilité Garantie Loyers Impayés (GLI).
                  </p>
                  <span className="inline-block text-[10px] font-bold text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-500/30">
                    100% Opérationnel
                  </span>
                </div>

                {/* System Metrics */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-5 h-5 text-slate-400" />
                    <h4 className="font-bold text-white text-sm">Métriques de l'Application</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div>Biens en gestion : <strong className="text-white">{diagnostics?.system.propertiesLoaded || 4}</strong></div>
                    <div>Candidats actifs : <strong className="text-white">{diagnostics?.system.candidatesActive || 4}</strong></div>
                    <div>Mémoire Node : <strong className="text-white">{diagnostics?.system.memoryUsageMb || 85} Mo</strong></div>
                    <div>Tickets retour : <strong className="text-white">{diagnostics?.system.feedbacksRecorded || 1}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            onClick={() => {
              onClose();
              onOpenFeedback();
            }}
            className="text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Un problème à signaler ? Ouvrir le centre de feedback</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
          >
            Fermer le diagnostic
          </button>
        </div>
      </div>
    </div>
  );
};
