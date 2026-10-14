import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Send,
  HelpCircle,
  FileText,
  Clock,
  Sparkles,
  Ticket,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  ticketNumber: string;
  createdAt: string;
  category: 'ANOMALIE_EXTRACTION' | 'BUG_INTERFACE' | 'CALCUL_SOLVABILITE' | 'SUGGESTION' | 'AUTRE';
  userEmail: string;
  agencyName?: string;
  message: string;
  documentSnippet?: string;
  status: 'OUVERT' | 'EN_COURS' | 'RESOLU';
}

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledSnippet?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  prefilledSnippet,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [category, setCategory] = useState<FeedbackItem['category']>('ANOMALIE_EXTRACTION');
  const [userEmail, setUserEmail] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [message, setMessage] = useState('');
  const [documentSnippet, setDocumentSnippet] = useState(prefilledSnippet || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successTicket, setSuccessTicket] = useState<FeedbackItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchFeedbacks();
      if (prefilledSnippet) setDocumentSnippet(prefilledSnippet);
    }
  }, [isOpen, prefilledSnippet]);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('/api/feedbacks');
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      }
    } catch (e) {
      console.error('Error fetching feedbacks:', e);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !userEmail.trim()) {
      setErrorMsg('Veuillez renseigner votre email et décrire le problème rencontré.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          userEmail,
          agencyName: agencyName || 'Agence Immobilière',
          message,
          documentSnippet,
        }),
      });

      if (!res.ok) throw new Error('Erreur lors de l\'enregistrement du signalement');

      const data = await res.json();
      setSuccessTicket(data.feedback);
      fetchFeedbacks();
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Impossible d\'envoyer le signalement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-fadeIn">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Centre de Signalement & Retours d'Expérience
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold uppercase">
                  Support Réactif
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Signalez un bug, une anomalie de lecture de fiche de paie ou proposez une amélioration
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

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 pt-3 space-x-4 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('form');
              setSuccessTicket(null);
            }}
            className={`pb-3 transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'form'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Nouveau signalement / Feedback</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Historique des tickets ({feedbacks.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 max-h-[72vh]">
          {activeTab === 'form' && (
            <>
              {successTicket ? (
                /* Ticket Confirmation view */
                <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/40 text-center space-y-4 animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-500/30">
                      Ticket n° {successTicket.ticketNumber}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-3">
                      Signalement enregistré avec succès !
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                      Merci pour votre vigilance. Notre équipe technique analyse les anomalies remontées pour affiner la précision de Gemini et des règles de solvabilité.
                    </p>
                  </div>

                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={() => setSuccessTicket(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition cursor-pointer"
                    >
                      Envoyer un autre retour
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition cursor-pointer"
                    >
                      Retourner au travail
                    </button>
                  </div>
                </div>
              ) : (
                /* Feedback submission form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Category Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Type d'anomalie ou de retour :
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {[
                        { id: 'ANOMALIE_EXTRACTION', label: 'Lecture Fiche de Paie', icon: FileText },
                        { id: 'CALCUL_SOLVABILITE', label: 'Règle des 33% / Calcul', icon: Sparkles },
                        { id: 'BUG_INTERFACE', label: 'Bug d\'affichage / PDF', icon: AlertTriangle },
                        { id: 'SUGGESTION', label: 'Idée & Amélioration', icon: MessageSquare },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = category === item.id;
                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => setCategory(item.id as any)}
                            className={`p-2.5 rounded-xl border text-left transition flex flex-col items-start gap-1 cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-950/60 border-emerald-500 text-white font-bold ring-1 ring-emerald-500'
                                : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                            <span className="text-[11px] leading-tight">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contact Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Votre adresse email pro <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="agent@agence-immobiliere.fr"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nom de votre agence / structure
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Cabinet Haussmann Immobilier"
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Description du problème ou de la remarque <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Expliquez ce qui s'est passé (ex: 'Le salaire extrait était de 2400 € au lieu de 2700 € car la prime de panier a été déduite...')"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                    />
                  </div>

                  {/* Document snippet if relevant */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-semibold text-slate-400">
                        Extrait du bulletin ou message d'erreur (facultatif) :
                      </label>
                      <span className="text-[10px] text-slate-500">Pour reproduction</span>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Collez ici les lignes problématiques de la fiche de paie..."
                      value={documentSnippet}
                      onChange={(e) => setDocumentSnippet(e.target.value)}
                      className="w-full text-[11px] font-mono rounded-xl border border-slate-800 bg-slate-950/80 p-2 text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/20 transition flex items-center justify-center space-x-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Transmission du ticket...' : 'Transmettre le signalement'}</span>
                  </button>
                </form>
              )}
            </>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Liste des retours enregistrés par les agences et utilisateurs sur cette instance :
              </p>

              {feedbacks.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                  Aucun ticket n'a encore été signalé.
                </div>
              ) : (
                feedbacks.map((f) => (
                  <div
                    key={f.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px]">
                          {f.ticketNumber}
                        </span>
                        <span className="font-semibold text-white">{f.agencyName}</span>
                        <span className="text-slate-500 text-[11px]">({f.userEmail})</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          f.status === 'RESOLU'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : f.status === 'EN_COURS'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            : 'bg-indigo-950 text-indigo-400 border border-indigo-500/30'
                        }`}
                      >
                        {f.status}
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed">{f.message}</p>

                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Catégorie : {f.category}</span>
                      <span>Signalé le {new Date(f.createdAt).toLocaleString('fr-FR')}</span>
                    </div>
                  </div>
                ))
              )}
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
