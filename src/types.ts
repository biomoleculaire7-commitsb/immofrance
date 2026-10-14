export interface Property {
  id: string;
  title: string;
  city: string;
  postalCode: string;
  rentCC: number;
  surface: number;
  rooms: number;
  address: string;
  status: 'Disponible' | 'Option' | 'Loué';
  image: string;
}

export interface PayslipAnalysis {
  nomEmploye: string;
  nomEmployeur: string;
  intitulePoste: string;
  typeContrat: string;
  dateEmbauche?: string;
  periodeEssaiStatut: 'VALIDEE' | 'EN_COURS' | 'NON_APPLICABLE' | 'NON_SPECIFIEE';
  periodeEssaiExplication?: string;
  salaireNetAvantImpot: number;
  netPaye: number;
  cumulNetImposable?: number;
  statutSolvabilite: 'ELIGIBLE' | 'GARANT_NECESSAIRE' | 'REFUSE';
  scoreGlobal: number; // 0 à 100
  tauxEffortPourcentage: number; // % du salaire
  multiplicateurRevenu: number; // ex: 3.52x
  conformeGLI: boolean;
  pointsForts: string[];
  pointsVigilance: string[];
  recommandationAgent: string;
  syntheseDossier: string;
}

export interface CandidateDossier {
  id: string;
  propertyId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  submittedAt: string;
  status: 'ELIGIBLE' | 'GARANT_NECESSAIRE' | 'REFUSE' | 'EN_COURS';
  score: number;
  monthlyNetSalary: number;
  rentAmount: number;
  effortRatio: number;
  contractType: string;
  employer: string;
  jobTitle: string;
  trialPeriodStatus: 'VALIDEE' | 'EN_COURS' | 'NON_APPLICABLE' | 'NON_SPECIFIEE';
  trialPeriodNote?: string;
  guarantorType: 'aucun' | 'visale' | 'caution_solidaire' | 'garantme';
  gliCompliant: boolean;
  notes: string;
  strengths: string[];
  warnings: string[];
  recommendation: string;
  analyzedViaAI: boolean;
}

export interface SampleDocument {
  id: string;
  name: string;
  category: string;
  suggestedRent: number;
  propertyId: string;
  description: string;
  content: string;
}
