import React from 'react';
import {
  Building2,
  FileSearch,
  UserCheck,
  Sparkles,
  Layers,
  HelpCircle,
  ExternalLink,
  CreditCard,
  Activity,
  MessageSquare,
  Video,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'scanner' | 'candidate-portal' | 'landing';
  setCurrentTab: (tab: 'dashboard' | 'scanner' | 'candidate-portal' | 'landing') => void;
  candidateCount: number;
  agencyProfile?: { name: string; managerName: string };
  onOpenAgencyProfile?: () => void;
  onOpenPromoVideo?: () => void;
  onOpenGuide: () => void;
  onOpenBilling: () => void;
  onOpenDiagnostics: () => void;
  onOpenFeedback: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  candidateCount,
  agencyProfile,
  onOpenAgencyProfile,
  onOpenPromoVideo,
  onOpenGuide,
  onOpenBilling,
  onOpenDiagnostics,
  onOpenFeedback,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center space-x-3 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
                    ImmoAI
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                    MVP France
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Qualification IA des dossiers locatifs
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden md:inline">Tableau de bord</span>
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold rounded-full bg-slate-700 text-slate-200">
                {candidateCount}
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('scanner')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'scanner'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 hover:bg-emerald-900/40'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Testeur IA</span>
            </button>

            <button
              onClick={() => setCurrentTab('candidate-portal')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'candidate-portal'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Portail Candidat</span>
            </button>

            <button
              onClick={() => setCurrentTab('landing')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'landing'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileSearch className="w-4 h-4" />
              <span className="hidden lg:inline">Présentation Agences</span>
            </button>
          </nav>

          {/* Action Tools: Agency Profile, Billing, Diagnostics, Feedback, Dev Guide */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {onOpenAgencyProfile && (
              <button
                onClick={onOpenAgencyProfile}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
                title="Gérer le nom, le SIRET et le responsable de mon agence"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xl:inline">{agencyProfile?.name ? agencyProfile.name.slice(0, 18) + (agencyProfile.name.length > 18 ? '...' : '') : 'Mon Agence'}</span>
                <span className="xl:hidden">Agence</span>
              </button>
            )}

            {onOpenPromoVideo && (
              <button
                onClick={onOpenPromoVideo}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-bold transition cursor-pointer shadow-sm shadow-emerald-500/10"
                title="Studio Vidéo Démo Animée & Scripts Réseaux Sociaux"
              >
                <Video className="w-3.5 h-3.5 text-emerald-400" />
                <span>Vidéo & Kit Commercial</span>
              </button>
            )}

            <button
              onClick={onOpenDiagnostics}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25 text-xs font-bold transition cursor-pointer shadow-sm shadow-emerald-500/10"
              title="Centre de diagnostic & guide de test pas-à-pas"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Guide de Test & État</span>
            </button>

            <button
              onClick={onOpenFeedback}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-semibold transition cursor-pointer"
              title="Signaler une anomalie ou laisser un avis"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Avis & Bugs</span>
            </button>

            <button
              onClick={onOpenBilling}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-bold transition cursor-pointer"
              title="Abonnement Agence Pro & Essai 14 jours"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Essai 14j (79 €)</span>
              <span className="sm:hidden">79 €</span>
            </button>

            <button
              onClick={onOpenGuide}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/70 text-indigo-300 border border-indigo-700/50 hover:bg-indigo-900/80 text-xs font-medium transition cursor-pointer"
              title="Documentation technique & Architecture du système"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Doc API</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
