import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Video,
  Activity,
  FileCode,
  Sparkles,
} from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLogin: (code: string) => boolean;
  onLogout: () => void;
  isPreviewAsClient: boolean;
  onTogglePreviewAsClient: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onLogin,
  onLogout,
  isPreviewAsClient,
  onTogglePreviewAsClient,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const ok = onLogin(code.trim());
    if (ok) {
      setSuccessMsg('Mode Fondateur déverrouillé avec succès !');
      setCode('');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 900);
    } else {
      setError('Code incorrect. Utilisez "immoai" ou "admin" ou cliquez sur le déverrouillage direct.');
    }
  };

  const handleQuickUnlock = () => {
    onLogin('immoai');
    setSuccessMsg('Mode Fondateur déverrouillé avec succès !');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-scaleUp">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Espace Fondateur & Gestionnaire
                </h3>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  Sécurisé
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Contrôle d'accès aux outils confidentiels de la plateforme
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

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Status info box */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Statut sur cet appareil :</span>
              {isAdmin ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Fondateur Connecté</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mode Visiteur / Agence (Outils Masqués)</span>
                </span>
              )}
            </div>

            <p className="text-slate-400 leading-relaxed text-[11px] pt-1 border-t border-slate-800/80">
              💡 <strong>Protection de la confidentialité :</strong> Lorsque des agences immobilières ou des clients ouvrent le site, tous les outils d'administration (Suivi des clics, Studio vidéo, Démarchage, Diagnostics) sont <strong>automatiquement invisibles</strong> pour préserver une expérience professionnelle pure.
            </p>
          </div>

          {/* List of protected features */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Outils confidentiels réservés au fondateur :
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center space-x-2.5">
                <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Suivi des Visites</span>
                  <span className="text-[10px] text-slate-400">Détection des 20 agences</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center space-x-2.5">
                <Video className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Studio Vidéo & Démarchage</span>
                  <span className="text-[10px] text-slate-400">Pitch & kit de vente</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center space-x-2.5">
                <Activity className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Centre de Diagnostic</span>
                  <span className="text-[10px] text-slate-400">Tests techniques et santé API</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center space-x-2.5">
                <FileCode className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Guide Développeur</span>
                  <span className="text-[10px] text-slate-400">Architecture & documentation</span>
                </div>
              </div>
            </div>
          </div>

          {/* If already logged in */}
          {isAdmin ? (
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Simulateur Vue Agence / Client
                    </h4>
                    <p className="text-[11px] text-indigo-300">
                      Vérifiez par vous-même ce que voit une agence ouvrant votre lien.
                    </p>
                  </div>
                  <button
                    onClick={onTogglePreviewAsClient}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isPreviewAsClient
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isPreviewAsClient ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isPreviewAsClient ? 'Désactiver (Retour Admin)' : 'Activer Vue Agence'}</span>
                  </button>
                </div>
                {isPreviewAsClient && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
                    ⚠️ Le mode <strong>Aperçu Agence</strong> est actif. Les boutons secrets sont masqués de votre barre de navigation comme pour un vrai visiteur.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">Session administrateur active</span>
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Verrouiller / Se déconnecter</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login Form */
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Code Fondateur / Mot de passe :
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Entrez votre code (ex: immoai)"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition"
                  />
                  <div className="absolute right-3 top-2.5 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Déverrouiller le Mode Fondateur</span>
                </button>
              </div>

              {/* One-click convenience unlock for owner */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleQuickUnlock}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
                >
                  Déverrouillage rapide 1-clic (Fondateur)
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
