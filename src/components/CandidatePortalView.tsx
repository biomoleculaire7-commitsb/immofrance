import React, { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building,
  User,
  Mail,
  Phone,
  Euro,
  Lock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Property, CandidateDossier } from '../types.ts';

interface CandidatePortalViewProps {
  properties: Property[];
  defaultPropertyId?: string;
  onCandidateSubmitted: (candidate: any) => void;
  onBackToDashboard: () => void;
}

export const CandidatePortalView: React.FC<CandidatePortalViewProps> = ({
  properties,
  defaultPropertyId,
  onCandidateSubmitted,
  onBackToDashboard,
}) => {
  const [selectedPropId, setSelectedPropId] = useState<string>(
    defaultPropertyId || (properties.length > 0 ? properties[0].id : 'prop-1')
  );

  const [formData, setFormData] = useState({
    firstName: 'Julien',
    lastName: 'Moreau',
    email: 'julien.moreau.pro@gmail.com',
    phone: '06 28 41 90 33',
    contractType: 'CDI',
    declaredSalary: '3200',
    guarantorType: 'aucun' as 'aucun' | 'visale' | 'caution_solidaire' | 'garantme',
    sampleQuickPick: 'standard',
  });

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);
  const [customText, setCustomText] = useState<string>(`BULLETIN DE PAIE - JUIN 2026
Société : TECH SOLUTION PARIS SAS - SIRET 812 400 901 00018
Salarié : MOREAU Julien
Emploi : Chef de projet digital - CDI - Cadre
Ancienneté : 01/02/2024 (Période d'essai validée)
Salaire brut : 4 100,00 €
Total cotisations : 900,00 €
NET À PAYER AVANT IMPÔT SUR LE REVENU : 3 200,00 €
Net payé en compte : 2 950,00 €`);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentProperty = properties.find((p) => p.id === selectedPropId) || properties[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const base64 = res.split(',')[1];
      setFileBase64(base64);
      setFileMimeType(file.type || 'application/pdf');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const candidateFullName = `${formData.firstName} ${formData.lastName}`.trim();
      const rent = currentProperty ? currentProperty.rentCC : 980;

      const res = await fetch('/api/analyze-dossier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: customText,
          fileData:
            fileBase64 && fileMimeType
              ? { base64: fileBase64, mimeType: fileMimeType }
              : undefined,
          rentAmount: rent,
          candidateName: candidateFullName,
          guarantorType: formData.guarantorType,
        }),
      });

      if (!res.ok) throw new Error('Erreur lors du traitement du dossier');

      const data = await res.json();
      const analysis = data.analysis;

      const newCandidate = {
        propertyId: selectedPropId,
        candidateName: candidateFullName,
        candidateEmail: formData.email,
        candidatePhone: formData.phone,
        status: analysis?.statutSolvabilite || 'ELIGIBLE',
        score: analysis?.scoreGlobal || 90,
        monthlyNetSalary: analysis?.salaireNetAvantImpot || parseFloat(formData.declaredSalary) || 3000,
        rentAmount: rent,
        effortRatio: analysis?.tauxEffortPourcentage || Math.round((rent / 3200) * 100),
        contractType: analysis?.typeContrat || formData.contractType,
        employer: analysis?.nomEmployeur || 'Entreprise certifiée',
        jobTitle: analysis?.intitulePoste || 'Cadre',
        trialPeriodStatus: analysis?.periodeEssaiStatut || 'VALIDEE',
        trialPeriodNote: analysis?.periodeEssaiExplication,
        guarantorType: formData.guarantorType,
        gliCompliant: analysis?.conformeGLI || true,
        notes: analysis?.syntheseDossier || 'Dossier déposé en ligne par le candidat.',
        strengths: analysis?.pointsForts || ['Documents complets déposés en ligne'],
        warnings: analysis?.pointsVigilance || [],
        recommendation: analysis?.recommandationAgent || 'Dossier à étudier',
        analyzedViaAI: true,
      };

      onCandidateSubmitted(newCandidate);
      setSubmissionResult({ analysis, candidate: newCandidate });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Échec de soumission du dossier');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 text-emerald-400 text-xs font-semibold mb-3 border border-slate-700">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Dépôt Sécurisé et Pré-qualification Conforme Loi ALUR</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Espace Candidat Locataire
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
          Déposez vos pièces justificatives en toute sécurité pour le logement de votre choix.
          Vos informations sont vérifiées immédiatement par notre intelligence artificielle.
        </p>
      </div>

      {submissionResult ? (
        /* Confirmation screen */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Dossier reçu et qualifié avec succès !
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
              Merci {submissionResult.candidate.candidateName}. Votre candidature pour{' '}
              <strong>{currentProperty?.title}</strong> a été enregistrée et transmise à l'agence immobilière.
            </p>
          </div>

          {/* AI Result Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 max-w-lg mx-auto text-left space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Pré-qualification IA</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black ${
                  submissionResult.analysis?.statutSolvabilite === 'ELIGIBLE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {submissionResult.analysis?.statutSolvabilite === 'ELIGIBLE'
                  ? 'Dossier Éligible (3x validé)'
                  : 'Garant Recommandé'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block">Salaire Net validé</span>
                <span className="text-base font-black text-slate-900">
                  {submissionResult.analysis?.salaireNetAvantImpot?.toLocaleString('fr-FR')} € / mois
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block">Taux d'effort</span>
                <span className="text-base font-black text-emerald-600">
                  {submissionResult.analysis?.tauxEffortPourcentage}%
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {submissionResult.analysis?.recommandationAgent}
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setSubmissionResult(null);
                setUploadedFileName(null);
                setFileBase64(null);
              }}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Déposer un autre dossier
            </button>
            <button
              onClick={onBackToDashboard}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white shadow-md transition cursor-pointer"
            >
              Retourner au Tableau de Bord Agence
            </button>
          </div>
        </div>
      ) : (
        /* Form view */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target property card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
              1. Logement convoité
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="h-28 rounded-xl overflow-hidden">
                <img
                  src={currentProperty.image}
                  alt={currentProperty.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <select
                  value={selectedPropId}
                  onChange={(e) => setSelectedPropId(e.target.value)}
                  className="w-full text-sm font-bold rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.city} - {p.title} ({p.rentCC} €/mois CC)
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{currentProperty.surface} m²</span>
                  <span>•</span>
                  <span>{currentProperty.rooms} pièce(s)</span>
                  <span>•</span>
                  <span>{currentProperty.address}</span>
                </div>
                <div className="inline-block bg-emerald-50 text-emerald-800 text-xs font-black px-3 py-1 rounded-lg">
                  Loyer exigé : {currentProperty.rentCC} € CC (Revenus souhaités : ~ {currentProperty.rentCC * 3} € net)
                </div>
              </div>
            </div>
          </div>

          {/* Applicant Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              2. Informations du candidat locataire
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Prénom</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nom</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Type de contrat professionnel
                </label>
                <select
                  value={formData.contractType}
                  onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                  className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="CDI">CDI (Contrat à durée indéterminée)</option>
                  <option value="CDD">CDD (Contrat à durée déterminée)</option>
                  <option value="Fonctionnaire">Fonctionnaire / Agent public</option>
                  <option value="Indépendant">Profession libérale / Indépendant</option>
                  <option value="Étudiant">Étudiant</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Garantie locative (Garant)
                </label>
                <select
                  value={formData.guarantorType}
                  onChange={(e) => setFormData({ ...formData, guarantorType: e.target.value as any })}
                  className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="aucun">Aucun garant (Revenus personnels seuls)</option>
                  <option value="visale">Garantie Visale (Action Logement)</option>
                  <option value="caution_solidaire">Caution Solidaire (Parent / Tiers)</option>
                  <option value="garantme">Garantme / Cautioneo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Document Upload Area */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              3. Téléversement de votre dernier bulletin de paie
            </label>

            <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center bg-slate-50 hover:bg-emerald-50/20">
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                onChange={handleFileUpload}
                className="sr-only"
              />
              <Upload className="w-7 h-7 text-emerald-600 mb-2" />
              <span className="text-sm font-semibold text-slate-800">
                {uploadedFileName ? uploadedFileName : 'Cliquer pour choisir un fichier ou glisser-déposer'}
              </span>
              <span className="text-xs text-slate-400 mt-1">
                Fiche de paie la plus récente (PDF, JPEG, PNG jusqu'à 25 Mo)
              </span>
            </label>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Ou visualisez le texte extrait du bulletin pour le test :
              </label>
              <textarea
                rows={4}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full text-xs font-mono rounded-xl border border-slate-200 p-2.5 text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-xl shadow-emerald-600/25 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Analyse et qualification instantanée par l'IA...</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                <span>Soumettre mon dossier sécurisé à l'agence</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
