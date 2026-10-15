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

export interface AgencyProfile {
  name: string;
  managerName: string;
  managerRole: string;
  email: string;
  phone: string;
  siret: string;
  cartePro: string;
  address: string;
  city: string;
  postalCode: string;
  gliPartner: string;
  portalWelcomeMessage?: string;
}

export const DEFAULT_AGENCY_PROFILE: AgencyProfile = {
  name: 'Cabinet Haussmann Immobilier',
  managerName: 'Jean-Marc Dupont',
  managerRole: 'Directeur Gestion Locative',
  email: 'contact@haussmann-gestion.fr',
  phone: '01 42 68 50 00',
  siret: '842 190 321 00024',
  cartePro: 'CPI 7501 2024 000 012 345 (Gestion & Transaction)',
  address: '14 Avenue de l\'Opéra',
  city: 'Paris',
  postalCode: '75001',
  gliPartner: 'Allianz GLI & Garantie Visale',
  portalWelcomeMessage: 'Déposez vos pièces justificatives en toute sécurité. Vos informations sont analysées en temps réel selon les critères de solvabilité de la Loi ALUR.',
};
