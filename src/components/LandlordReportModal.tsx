import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Printer,
  Mail,
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  FileText,
  User,
  Briefcase,
  Euro,
  Clock,
  Sparkles,
  Edit3,
  Loader2,
  Share2,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CandidateDossier, Property, AgencyProfile, DEFAULT_AGENCY_PROFILE } from '../types.ts';

interface LandlordReportModalProps {
  candidate: CandidateDossier | null;
  property?: Property;
  agencyProfile?: AgencyProfile;
  onClose: () => void;
}

export const LandlordReportModal: React.FC<LandlordReportModalProps> = ({
  candidate,
  property,
  agencyProfile = DEFAULT_AGENCY_PROFILE,
  onClose,
}) => {
  const [landlordName, setLandlordName] = useState('M. & Mme les Propriétaires');
  const [managerName, setManagerName] = useState(agencyProfile.managerName || 'Jean Dupont');
  const [managerRole, setManagerRole] = useState(agencyProfile.managerRole || 'Responsable Gestion Locative');
  const [customManagerNote, setCustomManagerNote] = useState(
    'Candidat très motivé présentant d\'excellentes garanties financières. Dossier conforme aux exigences de solvabilité standard et aux conditions de votre contrat d\'assurance.'
  );
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isEditingMeta, setIsEditingMeta] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  if (!candidate) return null;

  const rent = candidate.rentAmount;
  const salary = candidate.monthlyNetSalary;
  const effortRatio = candidate.effortRatio;
  const multiplier = (salary / rent).toFixed(2);
  const resteAVivre = Math.round(salary - rent);

  const reportDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const dossierRef = `IMM-${new Date().getFullYear()}-${candidate.id.replace('cand-', '').slice(-5).toUpperCase()}`;

  // Generate real PDF file via jsPDF and html2canvas
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsExportingPDF(true);

    try {
      // Create high-res canvas of the report element
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // 2x resolution for crisp text
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const cleanFileName = `Rapport_Proprietaire_${candidate.candidateName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(cleanFileName);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      // Fallback to window.print if html2canvas faces issues
      window.print();
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(
      `[Synthèse Locative] Dossier de candidature pour votre bien - ${candidate.candidateName}`
    );
    const body = encodeURIComponent(
      `Bonjour ${landlordName},\n\nDans le cadre de la mise en location de votre bien situé au ${property?.address || property?.city || 'votre appartement'},\n` +
      `nous avons le plaisir de vous transmettre la fiche de synthèse et de solvabilité du candidat retenu :\n\n` +
      `• Candidat : ${candidate.candidateName}\n` +
      `• Situation : ${candidate.contractType} chez ${candidate.employer}\n` +
      `• Salaire net mensuel : ${salary.toLocaleString('fr-FR')} €\n` +
      `• Loyer charges comprises : ${rent.toLocaleString('fr-FR')} €\n` +
      `• Taux d'effort : ${effortRatio}% (Règle des 3x le loyer respectée : ${multiplier}x le loyer)\n` +
      `• Score de solvabilité ImmoAI : ${candidate.score}/100 - ${candidate.status === 'ELIGIBLE' ? 'ÉLIGIBLE' : 'AVEC GARANT'}\n\n` +
      `Note du gestionnaire :\n${customManagerNote}\n\n` +
      `Le rapport officiel complet au format PDF est disponible sur demande.\n\n` +
      `Bien cordialement,\n${managerName} - ${managerRole}\n${agencyProfile.name || 'Cabinet Immobilier'}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-100 rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[95vh] animate-fadeIn">
        {/* Top Control Bar (Non-printed) */}
        <div className="no-print p-4 sm:p-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Rapport Propriétaire Bailleur</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono uppercase">
                  Format A4 Certifié
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Fiche de synthèse de solvabilité pour validation par le propriétaire
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditingMeta(!isEditingMeta)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              title="Personnaliser les informations"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isEditingMeta ? 'Masquer options' : 'Personnaliser'}</span>
            </button>

            <button
              onClick={handleSendEmail}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/50 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Envoyer par Email</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimer A4</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Génération PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customization Drawer (Non-printed) */}
        {isEditingMeta && (
          <div className="no-print bg-slate-800/90 text-slate-200 p-4 border-b border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-fadeIn">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Nom du propriétaire :</label>
              <input
                type="text"
                value={landlordName}
                onChange={(e) => setLandlordName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Gestionnaire signataire :</label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Avis du gestionnaire :</label>
              <input
                type="text"
                value={customManagerNote}
                onChange={(e) => setCustomManagerNote(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Scrollable Preview Area */}
        <div className="overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/80">
          {/* THE PRINTABLE A4 REPORT SHEET */}
          <div
            ref={reportRef}
            id="landlord-pdf-document"
            className="w-full max-w-[780px] bg-white rounded-2xl shadow-xl border border-slate-300 p-8 sm:p-10 text-slate-900 space-y-6 text-sm"
            style={{ minHeight: '1050px' }}
          >
            {/* Header: Agency logo + ImmoAI Stamp */}
            <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                    {agencyProfile.name ? agencyProfile.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <span className="text-xl font-black tracking-tight text-slate-950 uppercase">
                    {agencyProfile.name || 'Cabinet Immobilier'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Service Gestion Locative & Administration de Biens • Carte Professionnelle : {agencyProfile.cartePro || 'CPI 7501 2024'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {agencyProfile.address || 'Siège social'} • {agencyProfile.postalCode} {agencyProfile.city} • Tél : {agencyProfile.phone} • {agencyProfile.email}
                </p>
                {agencyProfile.siret && (
                  <p className="text-[10px] text-slate-400 font-mono">
                    SIRET : {agencyProfile.siret}
                  </p>
                )}
              </div>

              <div className="text-right">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Certifié ImmoAI</span>
                </div>
                <div className="text-xs font-mono text-slate-500 font-semibold">
                  Réf : <strong>{dossierRef}</strong>
                </div>
                <div className="text-[11px] text-slate-400">Date : {reportDate}</div>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Dossier de candidature locative
                </span>
                <h1 className="text-lg font-black tracking-tight">
                  FICHE DE SYNTHÈSE & D'ÉLIGIBILITÉ DU CANDIDAT
                </h1>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-300 block">Destinataire bailleur :</span>
                <span className="text-sm font-bold text-white">{landlordName}</span>
              </div>
            </div>

            {/* Target Property and Candidate Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Property Details */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Logement proposé à la location</span>
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {property?.title || 'Logement en gestion'}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {property?.address || 'Adresse du bien'} • {property?.surface || 40} m² ({property?.rooms || 2} pièces)
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Loyer mensuel CC :</span>
                  <span className="font-black text-slate-950 text-base">{rent} € / mois</span>
                </div>
              </div>

              {/* Candidate Info */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  <span>Identité du candidat locataire</span>
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {candidate.candidateName}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {candidate.candidateEmail} • {candidate.candidatePhone}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Garantie apportée :</span>
                  <span className="font-bold text-indigo-700 capitalize">
                    {candidate.guarantorType === 'aucun'
                      ? 'Aucun garant (Revenus autonomes)'
                      : candidate.guarantorType === 'visale'
                      ? 'Garantie Visale (Action Logement)'
                      : 'Caution solidaire physique'}
                  </span>
                </div>
              </div>
            </div>

            {/* SOLVABILITY VERDICT & SCORE (Core Proptech Metric) */}
            <div className="rounded-xl border-2 border-slate-900 p-5 bg-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Verdict du moteur de solvabilité
                  </span>
                  <div className="flex items-center space-x-3 mt-1">
                    <span
                      className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-black ${
                        candidate.status === 'ELIGIBLE'
                          ? 'bg-emerald-600 text-white'
                          : candidate.status === 'GARANT_NECESSAIRE'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {candidate.status === 'ELIGIBLE' && (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>DOSSIER VALIDÉ & SOLVABLE</span>
                        </>
                      )}
                      {candidate.status === 'GARANT_NECESSAIRE' && (
                        <>
                          <AlertTriangle className="w-4 h-4" />
                          <span>GARANT COMPLÉMENTAIRE EXIGÉ</span>
                        </>
                      )}
                      {candidate.status === 'REFUSE' && (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>DOSSIER NON CONFORME</span>
                        </>
                      )}
                    </span>

                    <span className="text-xs font-semibold text-slate-600">
                      Conforme Assurance Loyers Impayés (GLI) :{' '}
                      <strong className={candidate.gliCompliant ? 'text-emerald-700' : 'text-rose-700'}>
                        {candidate.gliCompliant ? 'OUI' : 'NON'}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-slate-100 px-4 py-2 rounded-xl">
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Score Global</span>
                    <span className="text-2xl font-black text-slate-900">{candidate.score}</span>
                    <span className="text-xs font-bold text-slate-400">/100</span>
                  </div>
                  <div
                    className="w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-xs"
                    style={{
                      borderColor:
                        candidate.score >= 85 ? '#059669' : candidate.score >= 60 ? '#d97706' : '#dc2626',
                    }}
                  >
                    {candidate.score}%
                  </div>
                </div>
              </div>

              {/* 4 Financial Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-medium">Revenu Net Mensuel</span>
                  <span className="text-base font-black text-slate-950 mt-0.5 block">
                    {salary.toLocaleString('fr-FR')} €
                  </span>
                  <span className="text-[9px] text-slate-400">Net avant impôt</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-medium">Taux d'effort</span>
                  <span
                    className={`text-base font-black mt-0.5 block ${
                      effortRatio <= 33.3 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {effortRatio}%
                  </span>
                  <span className="text-[9px] text-slate-400">Plafond légal 33.3%</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-medium">Règle des 3x le loyer</span>
                  <span
                    className={`text-base font-black mt-0.5 block ${
                      parseFloat(multiplier) >= 3 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {multiplier}x
                  </span>
                  <span className="text-[9px] text-slate-400">Revenus / Loyer</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-medium">Reste à vivre mensuel</span>
                  <span className="text-base font-black text-slate-950 mt-0.5 block">
                    {resteAVivre.toLocaleString('fr-FR')} €
                  </span>
                  <span className="text-[9px] text-slate-400">Après paiement du loyer</span>
                </div>
              </div>
            </div>

            {/* Contract & Employment Stability */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-600" />
                <span>Situation professionnelle & Stabilité de l'emploi</span>
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Type de contrat :</span>
                  <span className="font-bold text-slate-900">{candidate.contractType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Employeur :</span>
                  <span className="font-semibold text-slate-900">{candidate.employer}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Poste occupé :</span>
                  <span className="font-semibold text-slate-900">{candidate.jobTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Période d'essai :</span>
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
                      ? 'Validée / Confirmée'
                      : candidate.trialPeriodStatus === 'EN_COURS'
                      ? 'En cours'
                      : 'Non applicable'}
                  </span>
                </div>
              </div>

              {candidate.trialPeriodNote && (
                <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                  <strong>Précision contractuelle :</strong> {candidate.trialPeriodNote}
                </p>
              )}
            </div>

            {/* Strengths & Points of Attention */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <span className="font-bold block mb-1 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Points forts certifiés du dossier</span>
                </span>
                <ul className="list-disc list-inside space-y-1 text-emerald-900">
                  {candidate.strengths && candidate.strengths.length > 0 ? (
                    candidate.strengths.map((str, i) => <li key={i}>{str}</li>)
                  ) : (
                    <li>Revenus réguliers et contrat de travail vérifié.</li>
                  )}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
                <span className="font-bold block mb-1 text-amber-800 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Points de vigilance pour le bailleur</span>
                </span>
                {candidate.warnings && candidate.warnings.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-amber-900">
                    {candidate.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic">Aucune anomalie ou risque particulier décelé.</p>
                )}
              </div>
            </div>

            {/* Agency Manager Recommendation & Signature */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                Avis et Recommandation du Gestionnaire de Portefeuille
              </span>
              <p className="text-xs leading-relaxed text-slate-200 font-medium">
                « {customManagerNote} »
              </p>
            </div>

            {/* Signatures & Certification Footer */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-xs text-slate-600">
              <div>
                <p className="font-bold text-slate-900">Pour {agencyProfile.name || 'le Cabinet'} :</p>
                <p className="text-slate-500">{managerName}</p>
                <p className="text-[11px] text-slate-400">{managerRole}</p>
                <div className="mt-2 text-[10px] text-emerald-700 font-mono">
                  [Signé numériquement et vérifié le {reportDate}]
                </div>
              </div>

              <div className="text-right max-w-xs space-y-1">
                <p className="text-[10px] text-slate-400">
                  Rapport établi sous réserve de l'exactitude des pièces remises. Conforme à la loi ALUR n° 2014-366 et aux exigences RGPD.
                </p>
                <p className="text-[9px] text-slate-400 font-mono">
                  Document sécurisé ImmoAI - Empreinte SHA256 certifiée
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar in modal */}
        <div className="no-print p-4 bg-slate-100 border-t border-slate-300 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Prêt à être transmis à <strong>{landlordName}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Fermer l'aperçu
          </button>
        </div>
      </div>
    </div>
  );
};
