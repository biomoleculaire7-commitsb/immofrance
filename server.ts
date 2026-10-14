import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import Stripe from 'stripe';

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Realistic French demo listings
interface Property {
  id: string;
  title: string;
  city: string;
  postalCode: string;
  rentCC: number; // Loyer Charges Comprises
  surface: number; // m²
  rooms: number;
  address: string;
  status: 'Disponible' | 'Option' | 'Loué';
  image: string;
}

const properties: Property[] = [
  {
    id: 'prop-1',
    title: 'Appartement T2 lumineux - Proche Métro Charonne',
    city: 'Paris',
    postalCode: '75011',
    rentCC: 980,
    surface: 42,
    rooms: 2,
    address: '28 Rue de la Roquette, 75011 Paris',
    status: 'Disponible',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'prop-2',
    title: 'T3 de standing avec balcon - Quartier Foch',
    city: 'Lyon',
    postalCode: '69006',
    rentCC: 1250,
    surface: 68,
    rooms: 3,
    address: '14 Boulevard des Belges, 69006 Lyon',
    status: 'Disponible',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'prop-3',
    title: 'Studio meublé rénové - Hyper centre',
    city: 'Bordeaux',
    postalCode: '33000',
    rentCC: 620,
    surface: 26,
    rooms: 1,
    address: '5 Rue Sainte-Catherine, 33000 Bordeaux',
    status: 'Disponible',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'prop-4',
    title: 'T3 vue mer avec terrasse - Corniche Kennedy',
    city: 'Marseille',
    postalCode: '13007',
    rentCC: 1450,
    surface: 75,
    rooms: 3,
    address: '42 Corniche JF Kennedy, 13007 Marseille',
    status: 'Disponible',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
  },
];

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
  effortRatio: number; // en %
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

// Initial realistic French tenant application records
let candidates: CandidateDossier[] = [
  {
    id: 'cand-1',
    propertyId: 'prop-1',
    candidateName: 'Alexandre Martin',
    candidateEmail: 'alexandre.martin75@gmail.com',
    candidatePhone: '06 14 25 36 47',
    submittedAt: '2026-10-12T10:30:00Z',
    status: 'ELIGIBLE',
    score: 96,
    monthlyNetSalary: 3450,
    rentAmount: 980,
    effortRatio: 28.4,
    contractType: 'CDI Cadre',
    employer: 'Capgemini France',
    jobTitle: 'Consultant Senior Cloud',
    trialPeriodStatus: 'VALIDEE',
    trialPeriodNote: 'Période d\'essai validée (ancienneté 3 ans et 2 mois)',
    guarantorType: 'aucun',
    gliCompliant: true,
    notes: 'Dossier exemplaire. Revenus supérieurs à 3.5x le loyer, contrat très stable.',
    strengths: ['Ratio d\'effort très sain (28.4% < 33%)', 'CDI confirmé hors période d\'essai', 'Éligible Garantie Loyers Impayés (GLI)'],
    warnings: [],
    recommendation: 'Dossier prioritaire : proposer une visite dès que possible.',
    analyzedViaAI: true,
  },
  {
    id: 'cand-2',
    propertyId: 'prop-1',
    candidateName: 'Sarah Benali',
    candidateEmail: 's.benali.dev@outlook.fr',
    candidatePhone: '07 82 19 44 02',
    submittedAt: '2026-10-12T14:15:00Z',
    status: 'GARANT_NECESSAIRE',
    score: 74,
    monthlyNetSalary: 3100,
    rentAmount: 980,
    effortRatio: 31.6,
    contractType: 'CDI',
    employer: 'Fintech Spark SAS',
    jobTitle: 'Développeuse Fullstack',
    trialPeriodStatus: 'EN_COURS',
    trialPeriodNote: 'Embauche récente (2 mois), période d\'essai de 4 mois en cours d\'exécution',
    guarantorType: 'visale',
    gliCompliant: false,
    notes: 'Très bon salaire mais période d\'essai non échue. Garantie Visale activée par la candidate.',
    strengths: ['Salaire net supérieur à 3x le loyer', 'Secteur informatique porteur', 'Passeport Visale valide fourni'],
    warnings: ['Période d\'essai en cours (risque de rupture d\'essai unilatérale)', 'Exclusion standard par certaines GLI sans avenant'],
    recommendation: 'Valider avec le propriétaire sous réserve de la Garantie Visale ou attendre fin de période d\'essai.',
    analyzedViaAI: true,
  },
  {
    id: 'cand-3',
    propertyId: 'prop-2',
    candidateName: 'Thomas Leroy',
    candidateEmail: 'thomas.leroy.design@gmail.com',
    candidatePhone: '06 99 12 78 45',
    submittedAt: '2026-10-11T09:00:00Z',
    status: 'REFUSE',
    score: 41,
    monthlyNetSalary: 2200,
    rentAmount: 1250,
    effortRatio: 56.8,
    contractType: 'CDD 6 mois',
    employer: 'Agence Pixel Lyon',
    jobTitle: 'Motion Designer',
    trialPeriodStatus: 'NON_APPLICABLE',
    trialPeriodNote: 'Contrat temporaire se terminant dans 4 mois',
    guarantorType: 'aucun',
    gliCompliant: false,
    notes: 'Revenus insuffisants pour un loyer de 1 250 € (règle des 3x non respectée : 1.76x seulement).',
    strengths: ['Documents authentiques et complets'],
    warnings: ['Taux d\'effort critique à 56.8% (plafond légal recommandé: 33%)', 'CDD de courte durée sans garant', 'Rejet automatique par toutes les assurances GLI'],
    recommendation: 'Dossier insuffisant : notifier le candidat ou réorienter vers un bien dont le loyer est <= 730 €.',
    analyzedViaAI: true,
  },
  {
    id: 'cand-4',
    propertyId: 'prop-3',
    candidateName: 'Emma Dupont',
    candidateEmail: 'emma.dupont.prof@ac-bordeaux.fr',
    candidatePhone: '06 51 33 89 20',
    submittedAt: '2026-10-13T08:20:00Z',
    status: 'ELIGIBLE',
    score: 93,
    monthlyNetSalary: 2350,
    rentAmount: 620,
    effortRatio: 26.4,
    contractType: 'Fonctionnaire titulaire',
    employer: 'Ministère de l\'Éducation Nationale',
    jobTitle: 'Professeure certifiée',
    trialPeriodStatus: 'VALIDEE',
    trialPeriodNote: 'Titularisée depuis 4 ans',
    guarantorType: 'aucun',
    gliCompliant: true,
    notes: 'Sécurité de l\'emploi absolue, loyer très modéré par rapport au revenu net (3.8x le loyer).',
    strengths: ['Statut fonctionnaire inaliénable', 'Taux d\'effort très favorable (26.4%)', 'Reste à vivre confortable de 1 730 €'],
    warnings: [],
    recommendation: 'Dossier parfait pour le studio : inviter directement à la visite.',
    analyzedViaAI: true,
  },
];

// Sample realistic French pay slip texts for testing & demonstration
const sampleDocuments = [
  {
    id: 'sample-cdi-senior',
    name: 'Bulletin de paie CDI Cadre (Alexandre M. - 3 450 € net)',
    category: 'CDI Confirmé - Éligible',
    suggestedRent: 980,
    propertyId: 'prop-1',
    description: 'Fiche de paie d\'un ingénieur en CDI depuis 3 ans chez Capgemini. Solide et parfaitement solvable.',
    content: `BULLETIN DE PAIE - JUIN 2026
Société : CAPGEMINI TECHNOLOGY SERVICES SAS - SIRET 479 924 389 00042
Adresse : 147 Boulevard Vivier Merle, 69003 Lyon
Convention Collective : SYNTEC - IDCC 1486

Salarié : MARTIN Alexandre
Emploi : Consultant Cloud Senior - Statut Cadre - Coefficient 170
Date d'ancienneté : 01/04/2023
Période de travail : du 01/06/2026 au 30/06/2026
Période d'essai : VALIDÉE (Ancienneté supérieure à 36 mois)

ÉLÉMENTS DE RÉMUNÉRATION :
- Salaire de base (151.67 h) : 4 450,00 €
- Prime d'astreinte : 250,00 €
TOTAL SALAIRE BRUT : 4 700,00 €

COTISATIONS ET CONTRIBUTIONS SOCIALES :
- Santé et accidents du travail : 124,30 €
- Retraite complémentaire AGIRC-ARRCO : 380,50 €
- Famille et Sécurité Sociale : 210,20 €
- CSG / CRDS : 425,00 €
TOTAL CHARGES SALARIALES : 1 140,00 €

MONTANTS RÉCAPITULATIFS :
- NET À PAYER AVANT IMPÔT SUR LE REVENU : 3 450,00 €
- Impôt sur le revenu prélevé à la source (Taux 8.2%) : 282,90 €
- NET PAYÉ EN EUROS (Virement compte FR76 3000...) : 3 167,10 €
- CUMUL NET IMPOSABLE ANNUEL : 20 700,00 €`,
  },
  {
    id: 'sample-cdi-essai',
    name: 'Bulletin de paie CDI avec Période d\'Essai en cours (Sarah B. - 3 100 € net)',
    category: 'Période d\'essai en cours - Attention',
    suggestedRent: 980,
    propertyId: 'prop-1',
    description: 'Développeuse embauchée il y a 2 mois en CDI. Bon salaire mais période d\'essai de 4 mois non encore échue.',
    content: `BULLETIN DE PAIE - MAI 2026
Employeur : SPARK FINTECH SAS - SIREN 894 120 541
Siège social : 12 Rue de la Paix, 75002 Paris
Convention Collective : Syntec Bureau d'études techniques

Matricule : SP-2026-089
Salariée : BENALI Sarah
Poste : Développeuse Full-Stack - Position 2.1
Date d'embauche : 01/04/2026
Période d'essai : EN COURS (Durée initiale 4 mois renouvelable - Échéance 31/07/2026)
Période de paie : Mai 2026

DÉTAIL DU SALAIRE :
- Salaire de base mensuel : 4 050,00 €
TOTAL BRUT : 4 050,00 €
- Total déductions sociales salariales : 950,00 €

- NET FISCAL MENSUEL : 3 100,00 €
- NET À PAYER AVANT IMPÔT SUR LE REVENU : 3 100,00 €
- Prélèvement à la source (Taux non personnalisé 6.5%) : 201,50 €
- NET PAYÉ : 2 898,50 €
Cumul annuel net imposable : 6 200,00 €`,
  },
  {
    id: 'sample-cdd-faible',
    name: 'Bulletin de paie CDD 6 mois (Thomas L. - 1 750 € net)',
    category: 'CDD Court & Loyer Élevé - Risque Refus',
    suggestedRent: 1250,
    propertyId: 'prop-2',
    description: 'Graphiste en CDD de 6 mois avec salaire net de 1 750 € postulant pour un loyer de 1 250 €.',
    content: `BULLETIN DE PAIE - JUIN 2026
Entreprise : ATELIER PIXEL STUDIO SARL
Convention Collective de la Publicité

Salarié : LEROY Thomas
Nature du contrat : CONTRAT À DURÉE DÉTERMINÉE (CDD) de 6 mois
Motif d'embauche : Accroissement temporaire d'activité
Date de début : 01/02/2026 - Date de fin prévisionnelle : 31/07/2026
Période d'essai : Terminée

RÉMUNÉRATION :
- Heures normales (151.67 h à 14.85 €/h) : 2 252,30 €
Total Brut : 2 252,30 €
Charges sociales : 502,30 €
- NET À PAYER AVANT IMPÔT : 1 750,00 €
- Net payé par virement : 1 710,00 €`,
  },
  {
    id: 'sample-fonctionnaire',
    name: 'Bulletin de paie Fonction Publique (Emma D. - 2 350 € net)',
    category: 'Fonctionnaire Titulaire - Solide',
    suggestedRent: 620,
    propertyId: 'prop-3',
    description: 'Professeure de l\'Éducation Nationale, sécurité de l\'emploi totale, loyer inférieur à 30% du salaire.',
    content: `MINISTÈRE DE L'ÉDUCATION NATIONALE
ACADÉMIE DE BORDEAUX - CENTRE DE SERVICES PARTAGÉS
BULLETIN DE PAYE - JUIN 2026

Agent : DUPONT Emma
Statut : TITULAIRE - Professeur Certifié de l'Enseignement Secondaire
Grade : Classe Normale 6ème Échelon - Indice majoré 514
Date d'effet dans le grade : 01/09/2022
Temps partiel : NON (100%)

TRAITEMENT ET INDEMNITÉS :
- Traitement brut de base : 2 550,45 €
- Indemnité de Suivi et d'Orientation des Élèves (ISOE) : 212,50 €
- Indemnité de résidence : 38,25 €
TOTAL BRUT : 2 801,20 €
TOTAL RETENUES (Pension civile, RAFP, CSG/CRDS) : 451,20 €

- NET À PAYER AVANT PAS : 2 350,00 €
- Retenue PAS (Taux 4.1%) : 96,35 €
- NET PAYÉ : 2 253,65 €`,
  },
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'ImmoAI',
    version: '1.0.0',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/properties', (req, res) => {
  res.json(properties);
});

app.get('/api/candidates', (req, res) => {
  res.json(candidates);
});

app.post('/api/candidates', (req, res) => {
  const newCandidate: CandidateDossier = {
    ...req.body,
    id: `cand-${Date.now()}`,
    submittedAt: new Date().toISOString(),
  };
  candidates.unshift(newCandidate);
  res.status(201).json(newCandidate);
});

app.patch('/api/candidates/:id', (req, res) => {
  const { id } = req.params;
  const index = candidates.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Candidat introuvable' });
  }
  candidates[index] = { ...candidates[index], ...req.body };
  res.json(candidates[index]);
});

app.delete('/api/candidates/:id', (req, res) => {
  const { id } = req.params;
  candidates = candidates.filter((c) => c.id !== id);
  res.json({ success: true, id });
});

app.get('/api/sample-documents', (req, res) => {
  res.json(sampleDocuments);
});

// STRIPE BILLING & SUBSCRIPTION ENDPOINTS (79 €/mois)
app.get('/api/billing/config', (req, res) => {
  res.json({
    stripeConfigured: !!stripe,
    mode: stripeSecretKey.startsWith('sk_live_') ? 'live' : 'test',
    priceEur: 79,
    trialDays: 14,
  });
});

app.post('/api/create-checkout-session', async (req, res) => {
  const { agencyEmail = 'contact@agence-immobiliere.fr', agencyId = 'agency_current', skipTrial = false } = req.body;
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

  if (!stripe) {
    // Return graceful simulated payload if STRIPE_SECRET_KEY is not yet in .env
    return res.json({
      success: true,
      simulated: true,
      message: 'Stripe non configuré avec STRIPE_SECRET_KEY dans .env. Mode simulation actif.',
      simulatedUrl: `${appUrl}/?billing_success=true&mode=simulated`,
    });
  }

  try {
    const sessionParams: any = {
      mode: 'subscription',
      customer_email: agencyEmail,
      client_reference_id: agencyId,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'ImmoAI - Pack Agence Pro',
              description: 'Traitement et qualification illimitée des dossiers locatifs & Scoring IA (Loi ALUR & GLI)',
            },
            unit_amount: 7900, // 79.00 EUR
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/?session_id={CHECKOUT_SESSION_ID}&billing_success=true`,
      cancel_url: `${appUrl}/?billing_canceled=true`,
    };

    // If 14-day free trial is requested
    if (!skipTrial) {
      sessionParams.subscription_data = {
        trial_period_days: 14,
        metadata: {
          agencyId,
          plan: 'immoai_pro_79_monthly',
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({
      success: true,
      url: session.url,
      sessionId: session.id,
      mode: stripeSecretKey.startsWith('sk_live_') ? 'live' : 'test',
      trialDays: skipTrial ? 0 : 14,
    });
  } catch (err: any) {
    console.error('Erreur Stripe Checkout:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      hint: err.message.includes('tax')
        ? 'Désactivez ou configurez les taxes dans votre Dashboard Stripe.'
        : 'Vérifiez la validité de vos clés Stripe dans les variables d\'environnement.',
    });
  }
});

// Test Stripe connection live
app.post('/api/system/test-stripe', async (req, res) => {
  if (!stripe) {
    return res.json({
      success: false,
      configured: false,
      error: 'STRIPE_SECRET_KEY manquante dans .env',
    });
  }

  const startTime = Date.now();
  try {
    // Ping Stripe by retrieving account or balance
    const balance = await stripe.balance.retrieve();
    const latency = Date.now() - startTime;
    const isLive = stripeSecretKey.startsWith('sk_live_');

    res.json({
      success: true,
      configured: true,
      mode: isLive ? 'live' : 'test',
      latencyMs: latency,
      availableCurrencies: balance.available?.map((b) => b.currency) || ['eur'],
      livemode: balance.livemode,
      message: isLive
        ? 'Connexion Stripe Live réussie. Prêt à recevoir des paiements réels.'
        : 'Connexion Stripe Test réussie. Utilisez les cartes de test Stripe pour essayer sans frais.',
    });
  } catch (err: any) {
    res.json({
      success: false,
      configured: true,
      error: err.message,
      latencyMs: Date.now() - startTime,
    });
  }
});

// Retrieve Stripe Session Status
app.get('/api/billing/session-status', async (req, res) => {
  const sessionId = req.query.session_id as string;
  if (!sessionId) {
    return res.status(400).json({ error: 'session_id requis' });
  }

  if (!stripe) {
    return res.json({
      status: 'complete',
      simulated: true,
      customer_email: 'agence-demo@immoai.fr',
    });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.json({
      status: session.status,
      customer_email: session.customer_details?.email || session.customer_email,
      payment_status: session.payment_status,
      mode: session.mode,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (stripe && webhookSecret && sig) {
    try {
      const event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
      console.log(`[Stripe Webhook] Événement reçu : ${event.type}`);
    } catch (err: any) {
      console.warn(`[Stripe Webhook] Signature invalide : ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  res.json({ received: true });
});

// USER FEEDBACK & ANOMALY REPORTING SYSTEM
interface UserFeedback {
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

let feedbacks: UserFeedback[] = [
  {
    id: 'fbk-1',
    ticketNumber: 'TK-8492',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    category: 'CALCUL_SOLVABILITE',
    userEmail: 'direction@agence-paris11.fr',
    agencyName: 'Cabinet Bastille Immobilier',
    message: 'Le calcul des 33% est parfait pour le CDI. Pouvez-vous ajouter une mention spécifique pour les auto-entrepreneurs avec 2 bilans ?',
    status: 'EN_COURS',
  },
];

app.get('/api/feedbacks', (req, res) => {
  res.json(feedbacks);
});

app.post('/api/feedbacks', (req, res) => {
  const { category, userEmail, agencyName, message, documentSnippet } = req.body;

  if (!message || !userEmail) {
    return res.status(400).json({ error: 'Email et message requis' });
  }

  const newFeedback: UserFeedback = {
    id: `fbk-${Date.now()}`,
    ticketNumber: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    category: category || 'AUTRE',
    userEmail,
    agencyName: agencyName || 'Agence Immobilière',
    message,
    documentSnippet: documentSnippet ? documentSnippet.slice(0, 300) : undefined,
    status: 'OUVERT',
  };

  feedbacks.unshift(newFeedback);
  console.log(`[Feedback Utilisateur Reçu] Ticket ${newFeedback.ticketNumber} de ${userEmail}: ${message}`);
  res.status(201).json({ success: true, feedback: newFeedback });
});

app.patch('/api/feedbacks/:id', (req, res) => {
  const { id } = req.params;
  const index = feedbacks.findIndex((f) => f.id === id);
  if (index !== -1) {
    feedbacks[index] = { ...feedbacks[index], ...req.body };
    return res.json(feedbacks[index]);
  }
  res.status(404).json({ error: 'Feedback non trouvé' });
});

// SYSTEM DIAGNOSTICS & HEALTH CHECK
app.get('/api/system/diagnostics', async (req, res) => {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;
  const hasStripeKey = !!stripeSecretKey;
  const stripeMode = stripeSecretKey.startsWith('sk_live_') ? 'live' : 'test';

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    gemini: {
      configured: hasGeminiKey,
      model: 'gemini-3.8-flash',
      status: hasGeminiKey ? 'Opérationnel' : 'Clé API manquante',
    },
    stripe: {
      configured: hasStripeKey,
      mode: hasStripeKey ? stripeMode : 'non_configuré',
      status: hasStripeKey ? `Prêt (${stripeMode})` : 'Clé Stripe non détectée',
      webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
    },
    system: {
      memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      nodeVersion: process.version,
      propertiesLoaded: properties.length,
      candidatesActive: candidates.length,
      feedbacksRecorded: feedbacks.length,
    },
  });
});

// TEST GEMINI CONNECTION LIVE
app.post('/api/system/test-gemini', async (req, res) => {
  const startTime = Date.now();
  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      success: false,
      error: 'GEMINI_API_KEY non configurée dans les variables d\'environnement.',
    });
  }

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Délai d\'attente dépassé (5s)')), 5000)
    );

    const callPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Réponds en un seul mot: "OPÉRATIONNEL"',
    });

    const response: any = await Promise.race([callPromise, timeoutPromise]);
    const latency = Date.now() - startTime;

    res.json({
      success: true,
      latencyMs: latency,
      response: response.text?.trim() || 'OPÉRATIONNEL',
    });
  } catch (err: any) {
    res.json({
      success: false,
      latencyMs: Date.now() - startTime,
      error: err.message || 'Erreur lors du test de l\'IA',
      fallbackEngineActive: true,
    });
  }
});

// CORE AI ROUTE: Analyze French Payslip & Solvency qualification
app.post('/api/analyze-dossier', async (req, res) => {
  try {
    const {
      documentText,
      fileData, // { mimeType: string, base64: string }
      rentAmount,
      candidateName,
      guarantorType = 'aucun',
      guarantorSalary = 0,
    } = req.body;

    const rent = parseFloat(rentAmount) || 800;

    // Build prompt for Gemini
    const systemPrompt = `Tu es l'analyste expert n°1 des dossiers de location pour les agences immobilières françaises, spécialiste de la loi ALUR, des garanties GLI (Garantie Loyers Impayés) et de l'analyse des bulletins de paie français (fiches de paie).

Ta mission :
1. Extraire avec une précision chirurgicale les données du bulletin de salaire français :
   - Salaire Net Mensuel avant impôt sur le revenu (ou Net payé)
   - Type de contrat de travail (CDI, CDD, Intérim, Fonctionnaire titulaire, Stagiaire, Indépendant)
   - Statut de la période d'essai : Indiquer si elle est VALIDEE, EN_COURS, NON_APPLICABLE ou NON_SPECIFIEE. Mentionner tout indice (date d'embauche récente < 4 mois, mention explicite "période d'essai", ancienneté, etc.)
   - Nom de l'employeur et intitulé du poste
   - Date d'ancienneté ou embauche

2. Appliquer la RÈGLE FRANÇAISE DES 3x LE LOYER (Taux d'effort <= 33.3%) :
   - Le candidat doit idéalement gagner au moins 3 fois le montant du loyer charges comprises.
   - Taux d'effort = (Loyer / Salaire Net) * 100
   - Multiplicateur = Salaire Net / Loyer
   - Si le salaire net >= 3 * loyer ET CDI confirmé (ou fonctionnaire) : Statut ELIGIBLE (Score >= 85)
   - Si période d'essai en cours OU contrat CDD OU ratio entre 33% et 40% : Statut GARANT_NECESSAIRE (Score 60-84), sauf si Garant Visale ou garant physique solide déjà apporté
   - Si ratio > 40% (ou salaire < 2.5x loyer) sans garant solide : Statut REFUSE (Score < 60)

3. Restituer une analyse professionnelle pour l'agent immobilier en français impeccable avec forces, alertes de vigilance et recommandation claire.`;

    const userPromptText = `Voici les détails de la demande :
- Loyer mensuel charges comprises du bien convoité : ${rent} € / mois
- Nom déclaré du candidat : ${candidateName || 'Non précisé'}
- Garant fourni déclaré : ${guarantorType} (Revenu garant : ${guarantorSalary} €)

${documentText ? `CONTENU DU DOCUMENT / BULLETIN DE PAIE :
"""
${documentText}
"""` : 'Veuillez analyser le document joint en image/fichier.'}`;

    // Check if we can call Gemini API
    if (process.env.GEMINI_API_KEY) {
      try {
        const parts: any[] = [];

        if (fileData && fileData.base64 && fileData.mimeType) {
          parts.push({
            inlineData: {
              data: fileData.base64,
              mimeType: fileData.mimeType,
            },
          });
        }

        parts.push({
          text: userPromptText,
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout after 8s')), 8000)
        );

        const geminiCall = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: parts.length === 1 ? parts[0].text : { parts },
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                nomEmploye: { type: Type.STRING },
                nomEmployeur: { type: Type.STRING },
                intitulePoste: { type: Type.STRING },
                typeContrat: { type: Type.STRING },
                dateEmbauche: { type: Type.STRING },
                periodeEssaiStatut: {
                  type: Type.STRING,
                  enum: ['VALIDEE', 'EN_COURS', 'NON_APPLICABLE', 'NON_SPECIFIEE'],
                },
                periodeEssaiExplication: { type: Type.STRING },
                salaireNetAvantImpot: { type: Type.NUMBER },
                netPaye: { type: Type.NUMBER },
                cumulNetImposable: { type: Type.NUMBER },
                statutSolvabilite: {
                  type: Type.STRING,
                  enum: ['ELIGIBLE', 'GARANT_NECESSAIRE', 'REFUSE'],
                },
                scoreGlobal: { type: Type.NUMBER },
                tauxEffortPourcentage: { type: Type.NUMBER },
                multiplicateurRevenu: { type: Type.NUMBER },
                conformeGLI: { type: Type.BOOLEAN },
                pointsForts: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                pointsVigilance: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                recommandationAgent: { type: Type.STRING },
                syntheseDossier: { type: Type.STRING },
              },
              required: [
                'nomEmploye',
                'typeContrat',
                'periodeEssaiStatut',
                'salaireNetAvantImpot',
                'statutSolvabilite',
                'scoreGlobal',
                'tauxEffortPourcentage',
                'multiplicateurRevenu',
                'recommandationAgent',
                'syntheseDossier',
              ],
            },
          },
        });

        const response: any = await Promise.race([geminiCall, timeoutPromise]);

        const rawJson = response.text?.trim();
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          return res.json({
            success: true,
            source: 'gemini-3.8-flash',
            analysis: parsed,
            computedWithRent: rent,
          });
        }
      } catch (geminiError) {
        console.warn('Gemini API call timed out or failed, using French algorithmic rule engine:', geminiError);
      }
    }

    // Heuristic / Algorithmic fallback rule engine if API key is not ready or failed
    const fallbackSalary = extractSalaryHeuristic(documentText || '') || 2800;
    const ratio = Math.round((rent / fallbackSalary) * 1000) / 10;
    const mult = Math.round((fallbackSalary / rent) * 10) / 10;

    let isEssai = (documentText || '').toLowerCase().includes('en cours') && (documentText || '').toLowerCase().includes('essai');
    let isCDD = (documentText || '').toLowerCase().includes('cdd');
    let isFonct = (documentText || '').toLowerCase().includes('titulaire') || (documentText || '').toLowerCase().includes('ministère');

    let status: 'ELIGIBLE' | 'GARANT_NECESSAIRE' | 'REFUSE' = 'ELIGIBLE';
    let score = 90;

    if (ratio > 40 || (isCDD && guarantorType === 'aucun')) {
      status = 'REFUSE';
      score = Math.max(30, Math.min(58, Math.round(100 - ratio * 1.5)));
    } else if (isEssai || ratio > 33.3 || isCDD) {
      status = 'GARANT_NECESSAIRE';
      score = 72;
    } else {
      status = 'ELIGIBLE';
      score = Math.min(98, Math.round(75 + (mult - 3) * 10));
    }

    const fallbackResult = {
      nomEmploye: candidateName || 'Candidat Déclaré',
      nomEmployeur: isFonct ? 'Secteur Public' : 'Entreprise Référencée',
      intitulePoste: isCDD ? 'Salarié CDD' : isFonct ? 'Agent titulaire' : 'Salarié CDI',
      typeContrat: isCDD ? 'CDD' : isFonct ? 'Fonctionnaire titulaire' : 'CDI',
      dateEmbauche: 'Constatée sur le bulletin',
      periodeEssaiStatut: isEssai ? 'EN_COURS' : isCDD ? 'NON_APPLICABLE' : 'VALIDEE',
      periodeEssaiExplication: isEssai
        ? 'Mention de période d\'essai active constatée sur le bulletin.'
        : 'Ancienneté confirmée ou sans mention de période d\'essai restante.',
      salaireNetAvantImpot: fallbackSalary,
      netPaye: Math.round(fallbackSalary * 0.95),
      cumulNetImposable: fallbackSalary * 6,
      statutSolvabilite: status,
      scoreGlobal: score,
      tauxEffortPourcentage: ratio,
      multiplicateurRevenu: mult,
      conformeGLI: status === 'ELIGIBLE',
      pointsForts: [
        `Revenus nets constatés : ${fallbackSalary} € / mois`,
        mult >= 3 ? `Règle des 3x le loyer respectée (${mult}x)` : `Ratio d'effort calculé à ${ratio}%`,
        isFonct ? 'Sécurité statutaire optimale' : 'Fiche de paie structurée',
      ],
      pointsVigilance: [
        ...(isEssai ? ['Période d\'essai en cours - Exiger garant solidaire ou Visale'] : []),
        ...(ratio > 33.3 ? [`Taux d'effort (${ratio}%) supérieur au standard de 33%`] : []),
        ...(isCDD ? ['Contrat à durée déterminée'] : []),
      ],
      recommandationAgent:
        status === 'ELIGIBLE'
          ? 'Dossier qualifié : convoquer pour une visite physique prioritaire.'
          : status === 'GARANT_NECESSAIRE'
          ? 'Demander la caution d\'un garant ou un certificat Visale pour sécuriser la location.'
          : 'Dossier insuffisant au regard de la solvabilité demandée.',
      syntheseDossier: `Analyse du bulletin de paie pour un loyer de ${rent} €. Revenu net de ${fallbackSalary} €, taux d'effort de ${ratio}%.`,
    };

    return res.json({
      success: true,
      source: 'algorithmic-rule-engine',
      analysis: fallbackResult,
      computedWithRent: rent,
    });
  } catch (error: any) {
    console.error('Error analyzing dossier:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'analyse du document',
    });
  }
});

function extractSalaryHeuristic(text: string): number | null {
  // Common French payslip label formats:
  // "NET À PAYER AVANT IMPÔT SUR LE REVENU : 3 450,00 €"
  // "NET FISCAL MENSUEL : 3 100,00 €"
  // "NET À PAYER : 2 850 €"
  const patterns = [
    /net\s*(?:à\s*payer\s*(?:avant\s*impôt(?:\s*sur\s*le\s*revenu)?)?|fiscal(?:\s*mensuel)?|payé(?:\s*en\s*euros)?)\s*[:=\s]+([0-9\s.,]+)/i,
    /net\s*imposable\s*[:=\s]+([0-9\s.,]+)/i,
    /salaire\s*net\s*[:=\s]+([0-9\s.,]+)/i,
    /([1-9][0-9]{0,2}(?:\s?[0-9]{3})*(?:[.,][0-9]{2})?)\s*€\s*net/i,
  ];

  for (const pat of patterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const cleaned = match[1].replace(/\s/g, '').replace(',', '.');
      const val = parseFloat(cleaned);
      if (!isNaN(val) && val >= 500 && val <= 50000) return val;
    }
  }

  // Fallback to highest plausible net amount
  const euroMatches = [...text.matchAll(/([1-9][0-9]{2,3}(?:[.,][0-9]{2})?)\s*€/g)];
  for (const m of euroMatches) {
    const cleaned = m[1].replace(/\s/g, '').replace(',', '.');
    const val = parseFloat(cleaned);
    if (!isNaN(val) && val >= 1200 && val <= 8000) return val;
  }

  return null;
}

// Mount Vite middleware in development, or serve static dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ImmoAI] Server listening on port ${PORT}`);
  });
}

startServer();
