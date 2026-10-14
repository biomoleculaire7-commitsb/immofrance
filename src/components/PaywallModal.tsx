import React, { useState } from 'react';
import {
  Lock,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Zap,
  Building2,
  X,
  FileText,
} from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribeSuccess: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  onSubscribeSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSubscribeSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-3xl max-w-xl w-full shadow-2xl text-slate-100 overflow-hidden animate-fadeIn relative">
        {/* Glow effect */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 text-center relative z-10">
          {/* Lock Icon */}
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8 text-emerald-400" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Période d'essai de 14 jours terminée
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
              Continuez à qualifier vos dossiers avec ImmoAI
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
              Vos 14 jours d'accès gratuit sans carte bancaire sont arrivés à échéance.
              Passez à la formule <strong>Pack Pro à 79 €/mois</strong> pour débloquer immédiatement l'analyse IA illimitée et l'export PDF propriétaire.
            </p>
          </div>

          {/* Value Gained Summary (Social proof / Loss aversion) */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block font-semibold">Dossiers qualifiés</span>
              <span className="text-lg font-black text-white mt-0.5 block">14 reçus</span>
            </div>
            <div className="border-x border-slate-700">
              <span className="text-slate-400 text-[10px] block font-semibold">Temps économisé</span>
              <span className="text-lg font-black text-emerald-400 mt-0.5 block">~ 12 heures</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-semibold">Taux solvabilité</span>
              <span className="text-lg font-black text-white mt-0.5 block">100% GLI</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-gradient-to-b from-slate-800/90 to-slate-900 rounded-2xl p-5 border border-emerald-500/40 text-left space-y-3">
            <div className="flex justify-between items-baseline">
              <div>
                <h4 className="font-extrabold text-white text-base">Abonnement Agence Pro</h4>
                <p className="text-[11px] text-slate-400">Sans engagement • Résiliable à tout moment</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-emerald-400">79 €</span>
                <span className="text-[10px] text-slate-400 block font-semibold">HT / mois (94,80 € TTC)</span>
              </div>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-300 border-t border-slate-700 pt-3">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Analyses et lectures de fiches de paie illimitées</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Rapports PDF propriétaires certifiés avec votre logo</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Facture avec TVA 20% conforme pour votre comptabilité</span>
              </li>
            </ul>
          </div>

          {/* Subscribe CTA */}
          <button
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="w-full py-4 px-6 rounded-2xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition flex items-center justify-center space-x-2 shadow-xl shadow-emerald-500/20 text-sm sm:text-base cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Redirection sécurisée vers Stripe...</span>
            ) : (
              <>
                <CreditCard className="w-5 h-5 text-slate-950" />
                <span>Activer l'abonnement à 79 €/mois</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paiement sécurisé par Stripe • Débit mensuel automatique</span>
          </p>
        </div>
      </div>
    </div>
  );
};
