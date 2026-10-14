import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building,
  Euro,
  ShieldCheck,
  Briefcase,
  User,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Clock,
  Printer,
  ChevronRight,
  FileCheck,
  FileSearch,
} from 'lucide-react';
import { SampleDocument, PayslipAnalysis, Property } from '../types.ts';

interface DocumentScannerViewProps {
  properties: Property[];
  onAddCandidateToDashboard: (candidateData: any) => void;
  onOpenLandlordReport?: (candidate: any) => void;
  onReportAnomaly?: (snippet: string) => void;
}

export const DocumentScannerView: React.FC<DocumentScannerViewProps> = ({
  properties,
  onAddCandidateToDashboard,
  onOpenLandlordReport,
  onReportAnomaly,
}) => {
  const [sampleDocs, setSampleDocs] = useState<SampleDocument[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('sample-cdi-senior');
  const [documentText, setDocumentText] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);

  // Form parameters
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('prop-1');
  const [rentAmount, setRentAmount] = useState<number>(980);
  const [candidateName, setCandidateName] = useState<string>('Alexandre Martin');
  const [candidateEmail, setCandidateEmail] = useState<string>('alexandre.martin75@gmail.com');
  const [candidatePhone, setCandidatePhone] = useState<string>('06 14 25 36 47');
  const [guarantorType, setGuarantorType] = useState<'aucun' | 'visale' | 'caution_solidaire' | 'garantme'>('aucun');

  // AI State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<PayslipAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  // Load sample documents on mount
  useEffect(() => {
    fetch('/api/sample-documents')
      .then((res) => res.json())
      .then((data: SampleDocument[]) => {
        setSampleDocs(data);
        if (data.length > 0) {
          const first = data[0];
          setSelectedSampleId(first.id);
          setDocumentText(first.content);
          setRentAmount(first.suggestedRent);
          if (first.propertyId) setSelectedPropertyId(first.propertyId);
        }
      })
      .catch((err) => console.error('Failed to fetch sample documents:', err));
  }, []);

  // When sample changes
  const handleSelectSample = (sample: SampleDocument) => {
    setSelectedSampleId(sample.id);
    setDocumentText(sample.content);
    setRentAmount(sample.suggestedRent);
    if (sample.propertyId) setSelectedPropertyId(sample.propertyId);
    setUploadedFileName(null);
    setFileBase64(null);
    setFileMimeType(null);
    setAnalysisResult(null);
    setAddedSuccess(false);

    // Auto update name for demo clarity
    if (sample.id.includes('cdi-senior')) {
      setCandidateName('Alexandre Martin');
      setCandidateEmail('alexandre.martin75@gmail.com');
    } else if (sample.id.includes('cdi-essai')) {
      setCandidateName('Sarah Benali');
      setCandidateEmail('s.benali.dev@outlook.fr');
    } else if (sample.id.includes('cdd')) {
      setCandidateName('Thomas Leroy');
      setCandidateEmail('thomas.leroy.design@gmail.com');
    } else if (sample.id.includes('fonctionnaire')) {
      setCandidateName('Emma Dupont');
      setCandidateEmail('emma.dupont.prof@ac-bordeaux.fr');
    }
  };

  // Sync rent with property selection if user changes property dropdown
  const handlePropertyChange = (propId: string) => {
    setSelectedPropertyId(propId);
    const found = properties.find((p) => p.id === propId);
    if (found) {
      setRentAmount(found.rentCC);
    }
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setSelectedSampleId('custom');
    setAnalysisResult(null);
    setAddedSuccess(false);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setFileBase64(base64Data);
      setFileMimeType(file.type || 'application/pdf');
    };
    reader.readAsDataURL(file);
  };

  // Run AI Analysis
  const handleAnalyze = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setAddedSuccess(false);

    try {
      const response = await fetch('/api/analyze-dossier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentText: documentText,
          fileData:
            fileBase64 && fileMimeType
              ? { base64: fileBase64, mimeType: fileMimeType }
              : undefined,
          rentAmount: rentAmount,
          candidateName: candidateName,
          guarantorType: guarantorType,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur (${response.status})`);
      }

      const data = await response.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
      } else {
        throw new Error(data.error || 'Aucune analyse retournée');
      }
    } catch (err: any) {
      console.error('Erreur analyse:', err);
      setErrorMsg(err.message || 'Impossible d\'analyser le document. Vérifiez la connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save to agency dashboard
  const handleSaveToDashboard = () => {
    if (!analysisResult) return;

    const newCandidate = {
      propertyId: selectedPropertyId,
      candidateName: candidateName || analysisResult.nomEmploye || 'Candidat Analysé',
      candidateEmail: candidateEmail || 'candidat@email.fr',
      candidatePhone: candidatePhone || '06 00 00 00 00',
      status: analysisResult.statutSolvabilite,
      score: analysisResult.scoreGlobal,
      monthlyNetSalary: analysisResult.salaireNetAvantImpot,
      rentAmount: rentAmount,
      effortRatio: analysisResult.tauxEffortPourcentage,
      contractType: analysisResult.typeContrat,
      employer: analysisResult.nomEmployeur,
      jobTitle: analysisResult.intitulePoste,
      trialPeriodStatus: analysisResult.periodeEssaiStatut,
      trialPeriodNote: analysisResult.periodeEssaiExplication,
      guarantorType: guarantorType,
      gliCompliant: analysisResult.conformeGLI,
      notes: analysisResult.syntheseDossier,
      strengths: analysisResult.pointsForts,
      warnings: analysisResult.pointsVigilance,
      recommendation: analysisResult.recommandationAgent,
      analyzedViaAI: true,
    };

    onAddCandidateToDashboard(newCandidate);
    setAddedSuccess(true);
  };

  const selectedProp = properties.find((p) => p.id === selectedPropertyId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="mb-8 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white border border-slate-700 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Moteur d'analyse IA multimodale Gemini & Règle des 3x le loyer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Testeur & Scanner IA de Bulletins de Paie
            </h1>
            <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
              Testez immédiatement la lecture automatique d'une fiche de paie française.
              L'IA extrait le salaire net, qualifie le type de contrat (CDI/CDD), vérifie la période
              d'essai et calcule instantanément le score de solvabilité selon les critères stricts des agences et assurances GLI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/80 backdrop-blur rounded-xl px-4 py-3 border border-slate-700">
              <span className="text-xs text-slate-400 block font-medium">Standard français</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> 33.3% max (3x Loyer)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input, Samples, File & Rent Configuration */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preset Sample Selector */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              1. Choisissez un cas d'usage français ou téléversez un fichier
            </label>
            <div className="space-y-2">
              {sampleDocs.map((sample) => {
                const isSelected = selectedSampleId === sample.id;
                return (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition-all flex items-start justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 text-slate-900 font-semibold shadow-sm ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <FileText className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span className="font-medium text-xs sm:text-sm">{sample.name}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 pl-6">
                        {sample.description}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded whitespace-nowrap ml-2 ${
                        sample.category.includes('Éligible')
                          ? 'bg-emerald-100 text-emerald-800'
                          : sample.category.includes('Attention')
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {sample.category.split('-')[0].trim()}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Upload or Drop Local File */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <label className="block text-xs font-medium text-slate-600 mb-2">
                Ou importez votre propre fichier (PDF, PNG, JPG) :
              </label>
              <label className="relative border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-lg p-3 text-center cursor-pointer transition flex flex-col items-center justify-center bg-slate-50/50 hover:bg-emerald-50/30">
                <input
                  type="file"
                  accept="image/png,image/jpeg,application/pdf"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-xs font-medium text-slate-700">
                  {uploadedFileName ? uploadedFileName : 'Glisser ou cliquer pour choisir une fiche de paie'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Gemini Flash analyse le document directement
                </span>
              </label>
            </div>
          </div>

          {/* Rental Property and Candidate Context */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              2. Paramètres du bien loué & Candidat
            </label>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Logement cible de l'agence
              </label>
              <select
                value={selectedPropertyId}
                onChange={(e) => handlePropertyChange(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.city} - {p.title} ({p.rentCC} €/mois CC)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Loyer CC (€ / mois)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(parseFloat(e.target.value) || 0)}
                    className="w-full text-sm rounded-lg border border-slate-300 pl-3 pr-8 py-2 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">€</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Garant proposé
                </label>
                <select
                  value={guarantorType}
                  onChange={(e) => setGuarantorType(e.target.value as any)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-2 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="aucun">Aucun garant</option>
                  <option value="visale">Garantie Visale (Action Logement)</option>
                  <option value="caution_solidaire">Caution Solidaire (Parents/Tiers)</option>
                  <option value="garantme">Garantme / Cautioneo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nom du candidat
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Document Content Preview / Editor */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">
                  Extrait textuel du document
                </label>
                <span className="text-[10px] text-slate-400">Modifiable</span>
              </div>
              <textarea
                rows={6}
                value={documentText}
                onChange={(e) => {
                  setDocumentText(e.target.value);
                  setSelectedSampleId('custom');
                }}
                placeholder="Collez ou modifiez le texte du bulletin de paie ici..."
                className="w-full text-xs font-mono rounded-lg border border-slate-300 p-2.5 text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Launch Action Button */}
            <button
              onClick={handleAnalyze}
              disabled={isLoading || (!documentText && !fileBase64)}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2 text-base cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Analyse IA en cours (Extraction & Solvabilité)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Qualifier le dossier avec ImmoAI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Qualification Report & Solvency Metrics */}
        <div className="lg:col-span-7">
          {errorMsg && (
            <div className="p-4 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Échec de l'analyse</p>
                <p className="text-xs mt-1">{errorMsg}</p>
              </div>
            </div>
          )}

          {!analysisResult && !isLoading && (
            <div className="h-full min-h-[460px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-emerald-600 mb-4">
                <FileSearch className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                En attente d'analyse
              </h3>
              <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
                Sélectionnez l'un des 4 bulletins de paie de démonstration à gauche et cliquez sur
                « Qualifier le dossier avec ImmoAI » pour lancer l'audit instantané.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-left">
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800 block">1. Extraction</span>
                  <span className="text-slate-500 text-[11px]">Net imposable, Net payé, SIRET, Ancienneté</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800 block">2. Période d'essai</span>
                  <span className="text-slate-500 text-[11px]">Détection des risques et dates clés</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800 block">3. Règle des 33%</span>
                  <span className="text-slate-500 text-[11px]">Calcul solvabilité & éligibilité GLI</span>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="h-full min-h-[460px] bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                <Sparkles className="w-8 h-8 text-emerald-600 absolute inset-0 m-auto" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Traitement IA en cours
              </h3>
              <p className="text-sm text-slate-500 max-w-md mt-1">
                Gemini extrait les rubriques du bulletin de paie français et effectue le calcul de solvabilité selon la règle des 3x le loyer...
              </p>
            </div>
          )}

          {analysisResult && !isLoading && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 animate-fadeIn">
              {/* Status & Score Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Verdict du dossier pour loyer de {rentAmount} € / mois
                  </span>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-sm font-extrabold shadow-sm ${
                        analysisResult.statutSolvabilite === 'ELIGIBLE'
                          ? 'bg-emerald-500 text-white'
                          : analysisResult.statutSolvabilite === 'GARANT_NECESSAIRE'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {analysisResult.statutSolvabilite === 'ELIGIBLE' && (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>DOSSIER ÉLIGIBLE</span>
                        </>
                      )}
                      {analysisResult.statutSolvabilite === 'GARANT_NECESSAIRE' && (
                        <>
                          <AlertTriangle className="w-4 h-4" />
                          <span>GARANT RECOMMANDÉ</span>
                        </>
                      )}
                      {analysisResult.statutSolvabilite === 'REFUSE' && (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>DOSSIER INSUFFISANT</span>
                        </>
                      )}
                    </span>

                    <span className="text-xs text-slate-500 font-medium">
                      Conforme GLI standard :{' '}
                      <strong className={analysisResult.conformeGLI ? 'text-emerald-600' : 'text-rose-600'}>
                        {analysisResult.conformeGLI ? 'Oui' : 'Non'}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Score Meter */}
                <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Score ImmoAI</span>
                    <span className="text-2xl font-black text-slate-900">{analysisResult.scoreGlobal}</span>
                    <span className="text-xs text-slate-400 font-semibold">/100</span>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-slate-200 flex items-center justify-center font-bold text-xs"
                    style={{
                      borderColor:
                        analysisResult.scoreGlobal >= 85
                          ? '#10b981'
                          : analysisResult.scoreGlobal >= 60
                          ? '#f59e0b'
                          : '#ef4444',
                    }}
                  >
                    {analysisResult.scoreGlobal}%
                  </div>
                </div>
              </div>

              {/* 4 Financial KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 block">Salaire Net Mensuel</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">
                    {analysisResult.salaireNetAvantImpot.toLocaleString('fr-FR')} €
                  </span>
                  <span className="text-[10px] text-slate-400">Avant impôt (Net fiscal)</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 block">Taux d'effort</span>
                  <span
                    className={`text-xl font-black mt-1 block ${
                      analysisResult.tauxEffortPourcentage <= 33.3
                        ? 'text-emerald-600'
                        : analysisResult.tauxEffortPourcentage <= 38
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {analysisResult.tauxEffortPourcentage}%
                  </span>
                  <span className="text-[10px] text-slate-400">Plafond légal 33.3%</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 block">Multiplicateur Loyer</span>
                  <span
                    className={`text-xl font-black mt-1 block ${
                      analysisResult.multiplicateurRevenu >= 3
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {analysisResult.multiplicateurRevenu}x
                  </span>
                  <span className="text-[10px] text-slate-400">Règle des 3x le loyer</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 block">Loyer Max Conseillé</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">
                    {Math.round(analysisResult.salaireNetAvantImpot / 3).toLocaleString('fr-FR')} €
                  </span>
                  <span className="text-[10px] text-slate-400">Capacité financière</span>
                </div>
              </div>

              {/* Solvency Visual Progress Bar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Taux d'effort par rapport aux revenus</span>
                  <span className="text-slate-500">
                    Loyer : {rentAmount} € | Reste à vivre : {(analysisResult.salaireNetAvantImpot - rentAmount).toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-500 ${
                      analysisResult.tauxEffortPourcentage <= 33.3
                        ? 'bg-emerald-500'
                        : analysisResult.tauxEffortPourcentage <= 40
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, analysisResult.tauxEffortPourcentage)}%` }}
                  />
                  {/* 33.3% marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
                    style={{ left: '33.3%' }}
                    title="Seuil légal standard de 33.3%"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0%</span>
                  <span className="font-bold text-slate-700">33.3% (Seuil GLI)</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Professional Contract & Trial Period Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 bg-white">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <Briefcase className="w-4 h-4 text-slate-500" />
                    <span>Situation professionnelle extraite</span>
                  </div>
                  <dl className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Employé :</dt>
                      <dd className="font-bold text-slate-900">{analysisResult.nomEmploye}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Employeur :</dt>
                      <dd className="font-medium text-slate-800">{analysisResult.nomEmployeur || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Poste :</dt>
                      <dd className="font-medium text-slate-800">{analysisResult.intitulePoste || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Contrat :</dt>
                      <dd className="font-bold text-indigo-700">{analysisResult.typeContrat}</dd>
                    </div>
                  </dl>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>Audit Période d'essai</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                          analysisResult.periodeEssaiStatut === 'VALIDEE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : analysisResult.periodeEssaiStatut === 'EN_COURS'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {analysisResult.periodeEssaiStatut === 'VALIDEE' && 'VALIDÉE / HORS PÉRIODE D\'ESSAI'}
                        {analysisResult.periodeEssaiStatut === 'EN_COURS' && 'EN COURS (ATTENTION ASSURANCE)'}
                        {analysisResult.periodeEssaiStatut === 'NON_APPLICABLE' && 'NON APPLICABLE'}
                        {analysisResult.periodeEssaiStatut === 'NON_SPECIFIEE' && 'NON SPÉCIFIÉE SUR LE DOCUMENT'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {analysisResult.periodeEssaiExplication ||
                        'Statut déduit de l\'ancienneté et des mentions contractuelles du bulletin.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Synthesis, Strengths & Warnings */}
              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Synthèse de l'IA pour l'agent immobilier
                  </h4>
                  <p className="text-sm text-slate-800 leading-relaxed font-medium">
                    {analysisResult.syntheseDossier}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900">
                    <span className="font-bold block mb-1 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Forces du dossier
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-emerald-950">
                      {analysisResult.pointsForts?.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900">
                    <span className="font-bold block mb-1 text-amber-800 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Points de vigilance & risques
                    </span>
                    {analysisResult.pointsVigilance && analysisResult.pointsVigilance.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1 text-amber-950">
                        {analysisResult.pointsVigilance.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500 italic">Aucune anomalie ou point bloquant détecté.</p>
                    )}
                  </div>
                </div>

                {/* Agent Actionable Recommendation */}
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950">
                  <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider block mb-1">
                    Recommandation opérationnelle
                  </span>
                  <p className="text-sm font-semibold">{analysisResult.recommandationAgent}</p>
                </div>
              </div>

              {/* Action Buttons: Add to Dashboard, Print Fiche, Landlord PDF */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      if (!onOpenLandlordReport) return;
                      const cand = {
                        id: `cand-${Date.now()}`,
                        propertyId: selectedPropertyId,
                        candidateName: candidateName || analysisResult.nomEmploye || 'Candidat Analysé',
                        candidateEmail: candidateEmail || 'candidat@email.fr',
                        candidatePhone: candidatePhone || '06 00 00 00 00',
                        submittedAt: new Date().toISOString(),
                        status: analysisResult.statutSolvabilite,
                        score: analysisResult.scoreGlobal,
                        monthlyNetSalary: analysisResult.salaireNetAvantImpot,
                        rentAmount: rentAmount,
                        effortRatio: analysisResult.tauxEffortPourcentage,
                        contractType: analysisResult.typeContrat,
                        employer: analysisResult.nomEmployeur,
                        jobTitle: analysisResult.intitulePoste,
                        trialPeriodStatus: analysisResult.periodeEssaiStatut,
                        trialPeriodNote: analysisResult.periodeEssaiExplication,
                        guarantorType: guarantorType,
                        gliCompliant: analysisResult.conformeGLI,
                        notes: analysisResult.syntheseDossier,
                        strengths: analysisResult.pointsForts,
                        warnings: analysisResult.pointsVigilance,
                        recommendation: analysisResult.recommandationAgent,
                        analyzedViaAI: true,
                      };
                      onOpenLandlordReport(cand);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Générer Rapport Propriétaire (PDF)</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-slate-500" />
                    <span>Imprimer A4</span>
                  </button>

                  {onReportAnomaly && (
                    <button
                      onClick={() => onReportAnomaly(documentText)}
                      className="px-3 py-2.5 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                      title="Signaler un résultat incorrect sur ce bulletin"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Signaler anomalie</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={handleSaveToDashboard}
                  disabled={addedSuccess}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-2 cursor-pointer ${
                    addedSuccess
                      ? 'bg-slate-100 text-slate-500 border border-slate-300'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Ajouté au Tableau de Bord !</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>Enregistrer ce candidat dans le Tableau de Bord Agence</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
