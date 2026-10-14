import React from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Briefcase,
  Euro,
  Clock,
  Printer,
  Phone,
  Mail,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { CandidateDossier, Property } from '../types.ts';

interface CandidateModalProps {
  candidate: CandidateDossier | null;
  property?: Property;
  onClose: () => void;
  onUpdateStatus: (candidateId: string, status: any) => void;
  onGenerateLandlordReport: (candidate: CandidateDossier) => void;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({
  candidate,
  property,
  onClose,
  onUpdateStatus,
  onGenerateLandlordReport,
}) => {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center font-bold">
              {candidate.score}
            </div>
            <div>
              <h3 className="text-lg font-bold">{candidate.candidateName}</h3>
              <p className="text-xs text-slate-400">
                Candidature déposée le {new Date(candidate.submittedAt).toLocaleDateString('fr-FR')} pour{' '}
                {property?.title || 'le bien'}
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status & Solvency summary */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                Statut de solvabilité ImmoAI
              </span>
              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black ${
                  candidate.status === 'ELIGIBLE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : candidate.status === 'GARANT_NECESSAIRE'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {candidate.status === 'ELIGIBLE' && (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Dossier Éligible (Score: {candidate.score}/100)</span>
                  </>
                )}
                {candidate.status === 'GARANT_NECESSAIRE' && (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Garant Recommandé (Score: {candidate.score}/100)</span>
                  </>
                )}
                {candidate.status === 'REFUSE' && (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Dossier Insuffisant (Score: {candidate.score}/100)</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-right">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">LOYER CC</span>
                <span className="text-base font-black text-slate-900">{candidate.rentAmount} €</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">SALAIRE NET</span>
                <span className="text-base font-black text-emerald-600">
                  {candidate.monthlyNetSalary.toLocaleString('fr-FR')} €
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">EFFORT</span>
                <span className="text-base font-black text-slate-900">{candidate.effortRatio}%</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <a
              href={`mailto:${candidate.candidateEmail}`}
              className="p-3 rounded-xl border border-slate-200 flex items-center space-x-2 text-slate-700 hover:bg-slate-50 transition"
            >
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="font-semibold truncate">{candidate.candidateEmail}</span>
            </a>
            <a
              href={`tel:${candidate.candidatePhone}`}
              className="p-3 rounded-xl border border-slate-200 flex items-center space-x-2 text-slate-700 hover:bg-slate-50 transition"
            >
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="font-semibold">{candidate.candidatePhone}</span>
            </a>
          </div>

          {/* Contract & Employment */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2 text-xs">
            <div className="flex items-center space-x-2 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>Situation professionnelle</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="text-slate-400 block">Type de contrat :</span>
                <span className="font-bold text-slate-900">{candidate.contractType}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Poste :</span>
                <span className="font-medium text-slate-800">{candidate.jobTitle}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Employeur :</span>
                <span className="font-medium text-slate-800">{candidate.employer}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Période d'essai :</span>
                <span
                  className={`font-bold ${
                    candidate.trialPeriodStatus === 'VALIDEE'
                      ? 'text-emerald-700'
                      : candidate.trialPeriodStatus === 'EN_COURS'
                      ? 'text-amber-700'
                      : 'text-slate-700'
                  }`}
                >
                  {candidate.trialPeriodStatus === 'VALIDEE'
                    ? 'Validée'
                    : candidate.trialPeriodStatus === 'EN_COURS'
                    ? 'En cours'
                    : 'Non applicable'}
                </span>
              </div>
            </div>
          </div>

          {/* Notes & Strengths / Warnings */}
          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
              <span className="font-bold text-slate-500 uppercase block mb-1 text-[10px]">
                Synthèse IA & Observations
              </span>
              <p className="leading-relaxed">{candidate.notes}</p>
            </div>

            {candidate.strengths && candidate.strengths.length > 0 && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950">
                <span className="font-bold block mb-1 text-emerald-800">Points forts</span>
                <ul className="list-disc list-inside space-y-0.5">
                  {candidate.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {candidate.warnings && candidate.warnings.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950">
                <span className="font-bold block mb-1 text-amber-800">Points de vigilance</span>
                <ul className="list-disc list-inside space-y-0.5">
                  {candidate.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-950">
              <span className="font-bold block mb-1 text-indigo-900 text-[10px] uppercase">
                Conseil pour l'agent immobilier
              </span>
              <p className="font-semibold">{candidate.recommendation}</p>
            </div>
          </div>

          {/* Quick status change */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500">Changer la décision manuellement :</span>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateStatus(candidate.id, 'ELIGIBLE')}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold hover:bg-emerald-100"
              >
                Accepter
              </button>
              <button
                onClick={() => onUpdateStatus(candidate.id, 'GARANT_NECESSAIRE')}
                className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-300 font-bold hover:bg-amber-100"
              >
                Garant
              </button>
              <button
                onClick={() => onUpdateStatus(candidate.id, 'REFUSE')}
                className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-300 font-bold hover:bg-rose-100"
              >
                Refuser
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onGenerateLandlordReport(candidate)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Générer le Rapport PDF Propriétaire</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
