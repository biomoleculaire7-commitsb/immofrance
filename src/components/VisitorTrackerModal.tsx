import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  Users,
  Mail,
  Sparkles,
  UserCheck,
  Clock,
  Eye,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Building2,
  Trash2,
  Copy,
  Link2,
  Play,
  ArrowRight,
} from 'lucide-react';
import { AnalyticsStats, VisitorEvent } from '../types.ts';

interface VisitorTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToScanner?: () => void;
}

export const VisitorTrackerModal: React.FC<VisitorTrackerModalProps> = ({
  isOpen,
  onClose,
  onNavigateToScanner,
}) => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [testAgencyInput, setTestAgencyInput] = useState<string>('Century 21 Paris');
  const [copiedTrackedLink, setCopiedTrackedLink] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/analytics/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
      const interval = setInterval(fetchStats, 5000); // Live poll every 5s while open
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleClearHistory = async () => {
    if (!window.confirm('Voulez-vous réinitialiser l\'historique des visites ?')) return;
    try {
      setIsClearing(true);
      await fetch('/api/analytics/clear', { method: 'POST' });
      await fetchStats();
    } catch (e) {
      console.error(e);
    } finally {
      setIsClearing(false);
    }
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://immoai.fr';
  const customTrackedUrl = testAgencyInput.trim()
    ? `${currentOrigin}/?ref=outreach&agency=${encodeURIComponent(testAgencyInput.trim())}`
    : `${currentOrigin}/?ref=outreach`;

  const handleCopyTrackedLink = async () => {
    try {
      await navigator.clipboard.writeText(customTrackedUrl);
      setCopiedTrackedLink(true);
      setTimeout(() => setCopiedTrackedLink(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateVisit = async () => {
    try {
      setIsSimulating(true);
      const agency = testAgencyInput.trim() || 'Agence Immobilière Test';
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'email_outreach',
          agencyName: agency,
          action: 'PAGE_VIEW',
          page: `/?ref=outreach&agency=${encodeURIComponent(agency)}`,
          details: `Visite détectée suite à l'email envoyé à ${agency}`,
        }),
      });
      await fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  if (!isOpen) return null;

  const totalVisits = stats?.totalVisits || 0;
  const outreachVisits = stats?.outreachVisits || 0;
  const scannerTests = stats?.scannerTests || 0;
  const portalVisits = stats?.portalVisits || 0;
  const events = stats?.recentEvents || [];

  const formatEventTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'À l\'instant';
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Récemment';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-fadeIn">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-xl font-black text-white">
                  Suivi des Visites & Détection des Prospects
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  En direct
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Découvrez en temps réel si les 20 agences que vous avez démarchées ont cliqué sur votre lien
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchStats}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Actualiser les visites"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Visites Totales</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">{totalVisits}</div>
              <div className="text-[10px] text-emerald-400 font-medium">Pages consultées</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Clics Emails</span>
                <Mail className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-indigo-300">{outreachVisits}</div>
              <div className="text-[10px] text-indigo-300 font-medium">Via vos 20 agences</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Tests IA Réalisés</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300">{scannerTests}</div>
              <div className="text-[10px] text-amber-400 font-medium">Bulletins qualifiés</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Portail Candidat</span>
                <UserCheck className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-black text-teal-300">{portalVisits}</div>
              <div className="text-[10px] text-teal-400 font-medium">Dépôts de dossiers</div>
            </div>
          </div>

          {/* Explanation Box & Interactive Link Generator */}
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/50 border border-indigo-700/60 space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">
                  Comment savoir exactement quelle agence a visité le site ?
                </h4>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Grâce aux liens de suivi intelligents avec paramètre d'agence (ex: <code className="text-emerald-300 font-mono">?ref=outreach&agency=Century21</code>).
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-indigo-800/40 text-xs text-slate-300 space-y-2">
              <p className="leading-relaxed">
                1. <strong>Lien envoyé :</strong> Lorsque vous envoyez vos messages (via l'onglet Démarchage ou en copiant le lien ci-dessous), le nom de l'agence est encodé dans le lien.
              </p>
              <p className="leading-relaxed">
                2. <strong>Détection automatique :</strong> Dès que le directeur ou le négociateur clique sur votre lien, <strong>son agence est immédiatement identifiée</strong> et enregistrée dans le journal ci-dessous.
              </p>
              <p className="leading-relaxed">
                3. <strong>Bannière personnalisée :</strong> L'agence est accueillie avec un message personnalisé (<em className="text-emerald-300">« Bienvenue à l'équipe [Nom de l'agence] ! »</em>) et un accès direct sans carte bancaire.
              </p>
            </div>

            {/* Interactive Link Builder & Test Box */}
            <div className="pt-2 border-t border-indigo-800/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-emerald-400" />
                  <span>Générateur de lien de suivi personnalisé pour une agence :</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Tapez le nom de l'agence pour générer son lien unique
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={testAgencyInput}
                  onChange={(e) => setTestAgencyInput(e.target.value)}
                  placeholder="ex: Century 21 Paris, Orpi Lyon..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />

                <button
                  onClick={handleCopyTrackedLink}
                  className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  {copiedTrackedLink ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Lien copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copier le lien</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleSimulateVisit}
                  disabled={isSimulating}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 shadow-md shadow-emerald-600/20"
                  title="Simule instantanément un clic d'agence pour vérifier le fonctionnement"
                >
                  <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                  <span>{isSimulating ? 'Simulation...' : 'Simuler un clic de test'}</span>
                </button>

                <a
                  href={customTrackedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shrink-0"
                  title="Tester en ouvrant dans un nouvel onglet"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tester</span>
                </a>
              </div>

              {/* URL Preview */}
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] font-mono text-emerald-400 break-all select-all flex items-center justify-between gap-2">
                <span className="truncate">{customTrackedUrl}</span>
                <span className="text-[10px] text-slate-500 uppercase shrink-0 font-sans">Lien détecteur</span>
              </div>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Journal d'activité des visiteurs (En direct)</span>
              </h4>
              <span className="text-xs text-slate-400 font-mono">
                {events.length} événement(s)
              </span>
            </div>

            {events.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <h5 className="text-sm font-bold text-white">Aucune visite enregistrée pour l'instant</h5>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Dès qu'un destinataire de vos 20 emails ouvrira le lien ou testera une fiche de paie, l'activité apparaîtra ici en quelques secondes.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          evt.source === 'email_outreach'
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                            : evt.action === 'SCANNER_TEST'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        {evt.source === 'email_outreach' ? (
                          <Mail className="w-4 h-4" />
                        ) : evt.action === 'SCANNER_TEST' ? (
                          <Sparkles className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {evt.agencyName ? (
                            <strong className="text-white font-bold flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                              {evt.agencyName}
                            </strong>
                          ) : (
                            <strong className="text-white font-bold">Visiteur Web</strong>
                          )}

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                              evt.source === 'email_outreach'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {evt.source === 'email_outreach' ? 'Email Prospection' : 'Accès Direct'}
                          </span>
                        </div>

                        <p className="text-slate-300 text-xs">
                          {evt.details ||
                            (evt.action === 'SCANNER_TEST'
                              ? 'A testé une fiche de paie dans le Scanner IA'
                              : evt.action === 'PORTAL_VIEW'
                              ? 'A visité le Portail Candidat'
                              : 'A visité la plateforme')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-400 font-mono block">
                        {formatEventTime(evt.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={handleClearHistory}
            disabled={isClearing}
            className="text-slate-500 hover:text-rose-400 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Réinitialiser l'historique</span>
          </button>

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
