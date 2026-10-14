import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  Building2,
  ArrowRight,
  Zap,
  Users,
  AlertTriangle,
  Lock,
} from 'lucide-react';

interface LandingViewProps {
  onStartDemo: () => void;
  onGoToDashboard: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onStartDemo,
  onGoToDashboard,
}) => {
  // Interactive mini calculator
  const [calcRent, setCalcRent] = useState<number>(950);
  const [calcSalary, setCalcSalary] = useState<number>(3100);

  const ratio = Math.round((calcRent / calcSalary) * 1000) / 10;
  const isEligible = ratio <= 33.3;
  const requiredSalary = calcRent * 3;

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-900 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Proptech Spécialisée Marché Locatif Français</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Qualifiez vos dossiers locataires en{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              3 secondes grâce à l'IA
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Fini les 10 heures hebdomadaires passées à décortiquer des bulletins de paie,
            détecter des périodes d'essai masquées et calculer des taux d'effort. ImmoAI automatise la lecture,
            la règle des 3x le loyer et la conformité GLI pour les agences immobilières.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-emerald-500/25 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Zap className="w-5 h-5 text-slate-950" />
              <span>Tester un bulletin avec l'IA</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onGoToDashboard}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm sm:text-base border border-slate-700 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span>Accéder au Tableau de Bord</span>
            </button>
          </div>
        </div>

        {/* Live Interactive 3x Rent Simulator */}
        <div className="max-w-3xl mx-auto mt-14 bg-slate-800/90 backdrop-blur rounded-3xl border border-slate-700 p-6 sm:p-8 shadow-2xl relative z-10">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
              Simulateur interactif
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Le calcul français de solvabilité en direct (Règle des 33%)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                  <span>Loyer Charges Comprises :</span>
                  <span className="text-emerald-400 font-bold">{calcRent} € / mois</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="2500"
                  step="50"
                  value={calcRent}
                  onChange={(e) => setCalcRent(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                  <span>Salaire Net Mensuel du Candidat :</span>
                  <span className="text-emerald-400 font-bold">{calcSalary} € / mois</span>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="7000"
                  step="100"
                  value={calcSalary}
                  onChange={(e) => setCalcSalary(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Salaire net minimum recommandé pour ce loyer : <strong>{requiredSalary} €</strong>
              </p>
            </div>

            {/* Verdict Card */}
            <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-700 text-center space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Taux d'effort calculé
              </span>
              <div
                className={`text-4xl font-black ${
                  isEligible ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {ratio}%
              </div>

              <div
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black ${
                  isEligible
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {isEligible ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Dossier Solvable (Règle 3x validée)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Dossier Insuffisant (Garant exigé)</span>
                  </>
                )}
              </div>

              <p className="text-xs text-slate-400">
                Reste à vivre :{' '}
                <strong className="text-white">{(calcSalary - calcRent).toLocaleString('fr-FR')} €</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Core Pillars */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Comment ImmoAI transforme la gestion locative
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
            Une suite complète conçue pour répondre aux exigences juridiques et pratiques des professionnels de l'immobilier en France.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Extraction Ultra-Précise</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Gemini 3.8 Flash extrait le salaire net avant impôt, le net payé, le nom de l'employeur, le SIRET et l'intitulé exact du poste sur n'importe quel bulletin français.
            </p>
          </div>

          <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Détection Période d'Essai</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Identifie immédiatement les embauches récentes sous période d'essai pour éviter le refus d'indemnisation par les assurances de Garantie Loyers Impayés (GLI).
            </p>
          </div>

          <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Rapport GLI & Synthèse</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Génère une fiche de synthèse imprimable avec score sur 100, forces du dossier et recommandation opérationnelle pour le propriétaire bailleur.
            </p>
          </div>
        </div>
      </section>

      {/* Problem & ROI */}
      <section className="py-12 bg-slate-950/70 border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block mb-2">
              Le gouffre de temps actuel
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              60 dossiers par annonce à trier manuellement ?
            </h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Dans les zones tendues (Paris, Lyon, Marseille, Bordeaux, Lille), un négociateur locatif reçoit
              en moyenne 40 à 80 candidatures par bien. 70% de ces dossiers ne respectent pas le critère des 33% ou comportent des incohérences.
            </p>
            <div className="mt-6 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Gain moyen : 12 heures économisées par agent chaque semaine</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Sélection des candidats les plus solvables en premier</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Expérience moderne et fluide pour les candidats locataires</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Simulation d'économie pour votre agence
            </h3>
            <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400 block">Dossiers traités par mois</span>
                <span className="text-xl font-black text-white">120 dossiers</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Temps gagné</span>
                <span className="text-xl font-black text-emerald-400">~ 48 heures</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400 block">Délai de relocation</span>
                <span className="text-xl font-black text-white">Divisé par 2</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Satisfaction bailleur</span>
                <span className="text-xl font-black text-emerald-400">98%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 text-center px-4">
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Prêt à tester l'IA sur vos propres bulletins ?
        </h2>
        <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
          Accédez au testeur dès maintenant avec des bulletins de paie de démonstration.
        </p>
        <div className="mt-6">
          <button
            onClick={onStartDemo}
            className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition cursor-pointer"
          >
            Lancer le testeur de bulletins de paie
          </button>
        </div>
      </section>
    </div>
  );
};
