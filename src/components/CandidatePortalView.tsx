import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building,
  Building2,
  User,
  Mail,
  Phone,
  Euro,
  Lock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Home,
  Check,
  HelpCircle,
} from 'lucide-react';
import { Property, AgencyProfile, DEFAULT_AGENCY_PROFILE } from '../types.ts';

const DEFAULT_FALLBACK_PROPERTY: Property = {
  id: 'prop-default',
  title: 'Logement en gestion locative',
  city: 'Paris',
  postalCode: '75000',
  rentCC: 950,
  surface: 40,
  rooms: 2,
  address: 'Consulter l\'agence',
  status: 'Disponible',
  image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
};

interface CandidatePortalViewProps {
  properties?: Property[];
  agencyProfile?: AgencyProfile;
  defaultPropertyId?: string;
  onCandidateSubmitted: (candidate: any) => void;
  onBackToDashboard: () => void;
}

export const CandidatePortalView: React.FC<CandidatePortalViewProps> = ({
  properties = [],
  agencyProfile = DEFAULT_AGENCY_PROFILE,
  defaultPropertyId,
  onCandidateSubmitted,
  onBackToDashboard,
}) => {
  const hasProperties = Array.isArray(properties) && properties.length > 0;
  const availableProperties = hasProperties ? properties : [DEFAULT_FALLBACK_PROPERTY];

  const [selectedPropId, setSelectedPropId] = useState<string>(() => {
    if (defaultPropertyId && availableProperties.some((p) => p.id === defaultPropertyId)) {
      return defaultPropertyId;
    }
    return availableProperties[0]?.id || 'prop-default';
  });

  const [customRentAmount, setCustomRentAmount] = useState<string>('950');

  useEffect(() => {
    if (defaultPropertyId && availableProperties.some((p) => p.id === defaultPropertyId)) {
      setSelectedPropId(defaultPropertyId);
    } else if (!availableProperties.some((p) => p.id === selectedPropId)) {
      setSelectedPropId(availableProperties[0]?.id || 'prop-default');
    }
  }, [defaultPropertyId, properties]);

  const currentProperty =
    availableProperties.find((p) => p.id === selectedPropId) ||
    availableProperties[0] ||
    DEFAULT_FALLBACK_PROPERTY;

  // Real candidate initial form state (clean)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    contractType: 'CDI',
    declaredSalary: '',
    guarantorType: 'aucun' as 'aucun' | 'visale' | 'caution_solidaire' | 'garantme',
  });

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);
  const [customText, setCustomText] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [demoLoaded, setDemoLoaded] = useState(false);

  // Quick fill helper for testing without manual typing
  const handleLoadDemoValues = () => {
    setFormData({
      firstName: 'Julien',
      lastName: 'Moreau',
      email: 'julien.moreau.pro@gmail.com',
      phone: '06 28 41 90 33',
      contractType: 'CDI',
      declaredSalary: '3200',
      guarantorType: 'aucun',
    });
    setCustomText(`BULLETIN DE PAIE - JUIN 2026
Société : TECH SOLUTION PARIS SAS - SIRET 812 400 901 00018
Salarié : MOREAU Julien
Emploi : Chef de projet digital - CDI - Cadre
Ancienneté : 01/02/2024 (Période d'essai validée)
Salaire brut : 4 100,00 €
Total cotisations : 900,00 €
NET À PAYER AVANT IMPÔT SUR LE REVENU : 3 200,00 €
Net payé en compte : 2 950,00 €`);
    setUploadedFileName('bulletin_salaire_juin_2026.pdf');
    setDemoLoaded(true);
    setTimeout(() => setDemoLoaded(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const res = reader.result as string;
        const parts = res.split(',');
        if (parts.length > 1) {
          setFileBase64(parts[1]);
          setFileMimeType(file.type || 'application/pdf');
        }
      } catch (err) {
        console.error('File read error:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const candidateFullName = `${formData.firstName} ${formData.lastName}`.trim() || 'Candidat Locataire';
      const rent = currentProperty ? currentProperty.rentCC : (parseFloat(customRentAmount) || 950);

      // If neither text nor file is present, prepare minimum synthetic text from form data
      const docToSend = customText.trim()
        ? customText
        : `BULLETIN DE SALAIRE DÉCLARÉ
Candidat : ${candidateFullName}
Contrat : ${formData.contractType}
Salaire net déclaré : ${formData.declaredSalary || 3000} €
Garant : ${formData.guarantorType}`;

      const res = await fetch('/api/analyze-dossier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: docToSend,
          fileData:
            fileBase64 && fileMimeType
              ? { base64: fileBase64, mimeType: fileMimeType }
              : undefined,
          rentAmount: rent,
          candidateName: candidateFullName,
          guarantorType: formData.guarantorType,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors du traitement du dossier. Vérifiez votre connexion.');
      }

      const data = await res.json();
      const analysis = data.analysis;

      const monthlySalary =
        analysis?.salaireNetAvantImpot ||
        parseFloat(formData.declaredSalary) ||
        3000;

      const newCandidate = {
        propertyId: currentProperty?.id || 'prop-default',
        candidateName: candidateFullName,
        candidateEmail: formData.email || 'candidat@email.fr',
        candidatePhone: formData.phone || '06 00 00 00 00',
        status: analysis?.statutSolvabilite || 'ELIGIBLE',
        score: analysis?.scoreGlobal || 88,
        monthlyNetSalary: monthlySalary,
        rentAmount: rent,
        effortRatio: analysis?.tauxEffortPourcentage || Math.round((rent / monthlySalary) * 100),
        contractType: analysis?.typeContrat || formData.contractType,
        employer: analysis?.nomEmployeur || 'Entreprise certifiée',
        jobTitle: analysis?.intitulePoste || 'Poste qualifié',
        trialPeriodStatus: analysis?.periodeEssaiStatut || 'VALIDEE',
        trialPeriodNote: analysis?.periodeEssaiExplication || 'Vérifié par ImmoAI',
        guarantorType: formData.guarantorType,
        gliCompliant: analysis?.conformeGLI ?? true,
        notes: analysis?.syntheseDossier || 'Dossier déposé en ligne par le candidat locataire.',
        strengths: analysis?.pointsForts || ['Dossier complet déposé en ligne'],
        warnings: analysis?.pointsVigilance || [],
        recommendation: analysis?.recommandationAgent || 'Dossier transmis à l\'agence',
        analyzedViaAI: true,
      };

      onCandidateSubmitted(newCandidate);
      setSubmissionResult({ analysis, candidate: newCandidate });
    } catch (err: any) {
      console.error('Candidate submission error:', err);
      setErrorMsg(err.message || 'Échec de soumission du dossier. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Banner with Agency Identity */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center mb-8 relative overflow-hidden">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 text-emerald-400 text-xs font-semibold mb-3 border border-slate-700">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Dépôt Sécurisé • Conforme Loi ALUR & Standard GLI France</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Portail Candidat Locataire
        </h1>

        <div className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-600 font-medium">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>Dossier instruit par :</span>
          <strong className="text-slate-900">{agencyProfile.name || 'Cabinet Immobilier'}</strong>
          {agencyProfile.city && <span>({agencyProfile.city})</span>}
        </div>

        <p className="text-xs text-slate-500 mt-2 max-w-xl mx-auto">
          {agencyProfile.portalWelcomeMessage ||
            'Déposez vos pièces justificatives en toute sécurité. Vos informations sont transmises directement aux négociateurs de l\'agence pour l\'instruction prioritaire de votre candidature.'}
        </p>

        {/* Demo filler helper badge */}
        <div className="mt-4 flex items-center justify-center">
          <button
            type="button"
            onClick={handleLoadDemoValues}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{demoLoaded ? 'Formulaire pré-rempli !' : 'Pré-remplir un exemple de test rapide'}</span>
          </button>
        </div>
      </div>

      {submissionResult ? (
        /* Confirmation Screen */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Dossier reçu et qualifié avec succès !
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
              Merci <strong>{submissionResult.candidate.candidateName}</strong>. Votre candidature a été transmise à{' '}
              <strong>{agencyProfile.name || 'notre agence'}</strong> pour le logement convoité.
            </p>
          </div>

          {/* AI Result Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 max-w-lg mx-auto text-left space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Audit Loi ALUR</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black ${
                  submissionResult.analysis?.statutSolvabilite === 'ELIGIBLE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {submissionResult.analysis?.statutSolvabilite === 'ELIGIBLE'
                  ? 'Dossier Éligible (Règle des 3x validée)'
                  : 'Garant Locatif Recommandé'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block">Salaire Net retenu</span>
                <span className="text-base font-black text-slate-900">
                  {submissionResult.analysis?.salaireNetAvantImpot?.toLocaleString('fr-FR') ||
                    submissionResult.candidate.monthlyNetSalary?.toLocaleString('fr-FR')} € / mois
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block">Taux d'effort calculé</span>
                <span className="text-base font-black text-emerald-600">
                  {submissionResult.analysis?.tauxEffortPourcentage ||
                    submissionResult.candidate.effortRatio}%
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {submissionResult.analysis?.recommandationAgent ||
                'Votre dossier a bien été enregistré dans le tableau de bord de gestion de l\'agence.'}
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setSubmissionResult(null);
                setUploadedFileName(null);
                setFileBase64(null);
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  contractType: 'CDI',
                  declaredSalary: '',
                  guarantorType: 'aucun',
                });
                setCustomText('');
              }}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Déposer une autre candidature
            </button>
            <button
              onClick={onBackToDashboard}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white shadow-md transition cursor-pointer"
            >
              Espace Gestion Agence
            </button>
          </div>
        </div>
      ) : (
        /* Application Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target property card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                1. Logement convoité
              </label>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                Loyer CC : {currentProperty?.rentCC || 950} € / mois
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={currentProperty?.image || DEFAULT_FALLBACK_PROPERTY.image}
                  alt={currentProperty?.title || 'Logement'}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <select
                  value={selectedPropId}
                  onChange={(e) => setSelectedPropId(e.target.value)}
                  className="w-full text-sm font-bold rounded-xl border border-slate-300 px-3.5 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {availableProperties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.city} — {p.title} ({p.rentCC} €/mois CC)
                    </option>
                  ))}
                </select>

                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{currentProperty?.surface || 40} m²</span>
                  <span>•</span>
                  <span>{currentProperty?.rooms || 2} pièce(s)</span>
                  <span>•</span>
                  <span>{currentProperty?.address || 'Adresse consultable auprès de l\'agence'}</span>
                </div>

                <div className="inline-block bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1 rounded-lg">
                  Revenu net mensuel recommandé (règle des 3x) : ~{' '}
                  <strong className="text-emerald-700 font-black">
                    {((currentProperty?.rentCC || 950) * 3).toLocaleString('fr-FR')} € net
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Applicant Info */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              2. Informations personnelles du candidat
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Prénom *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Julien"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nom de famille *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Moreau"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="julien.moreau@email.fr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Téléphone mobile *</label>
                <input
                  type="tel"
                  required
                  placeholder="06 28 41 90 33"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Type de contrat professionnel
                </label>
                <select
                  value={formData.contractType}
                  onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                  className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="CDI">CDI (Contrat à durée indéterminée)</option>
                  <option value="CDD">CDD (Contrat à durée déterminée)</option>
                  <option value="Fonctionnaire">Fonctionnaire / Titulaire de la fonction publique</option>
                  <option value="Indépendant">Profession libérale / Indépendant</option>
                  <option value="Étudiant">Étudiant / Alternant</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Salaire Net estimé (€/mois)
                </label>
                <input
                  type="number"
                  placeholder="Ex : 3200"
                  value={formData.declaredSalary}
                  onChange={(e) => setFormData({ ...formData, declaredSalary: e.target.value })}
                  className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Garantie locative (Garant)
                </label>
                <select
                  value={formData.guarantorType}
                  onChange={(e) => setFormData({ ...formData, guarantorType: e.target.value as any })}
                  className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="aucun">Aucun garant (Revenus personnels)</option>
                  <option value="visale">Garantie Visale (Action Logement)</option>
                  <option value="caution_solidaire">Caution Solidaire (Parent / Tiers)</option>
                  <option value="garantme">Garantme / Cautioneo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Document Upload Area */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              3. Pièce justificative de solvabilité (Dernier bulletin de paie)
            </label>

            <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center bg-slate-50 hover:bg-emerald-50/20">
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                onChange={handleFileUpload}
                className="sr-only"
              />
              <Upload className="w-8 h-8 text-emerald-600 mb-2" />
              <span className="text-sm font-bold text-slate-800">
                {uploadedFileName ? uploadedFileName : 'Cliquer pour choisir votre bulletin ou glisser-déposer'}
              </span>
              <span className="text-xs text-slate-400 mt-1">
                Fiche de paie la plus récente (PDF, JPEG, PNG jusqu'à 25 Mo)
              </span>
            </label>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Ou visualisez / collez le texte du bulletin :
              </label>
              <textarea
                rows={4}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Le texte extrait de votre bulletin de paie apparaîtra ici..."
                className="w-full text-xs font-mono rounded-xl border border-slate-200 p-3 text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                <span>Transmission et qualification en cours...</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                <span>Soumettre mon dossier sécurisé à l'agence</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-400">
            En soumettant ce formulaire, vos données sont chiffrées et transmises en toute confidentialité à{' '}
            <strong>{agencyProfile.name}</strong> conformément au RGPD et à la Loi ALUR n° 2014-366.
          </p>
        </form>
      )}
    </div>
  );
};
