import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { DocumentScannerView } from './components/DocumentScannerView.tsx';
import { CandidatePortalView } from './components/CandidatePortalView.tsx';
import { LandingView } from './components/LandingView.tsx';
import { CandidateModal } from './components/CandidateModal.tsx';
import { LandlordReportModal } from './components/LandlordReportModal.tsx';
import { DeveloperGuideModal } from './components/DeveloperGuideModal.tsx';
import { SubscriptionBillingModal } from './components/SubscriptionBillingModal.tsx';
import { PaywallModal } from './components/PaywallModal.tsx';
import { FeedbackModal } from './components/FeedbackModal.tsx';
import { DiagnosticsCenterModal } from './components/DiagnosticsCenterModal.tsx';
import { AgencyProfileModal } from './components/AgencyProfileModal.tsx';
import { AddPropertyModal } from './components/AddPropertyModal.tsx';
import { PromoVideoModal } from './components/PromoVideoModal.tsx';
import { CandidateDossier, Property, AgencyProfile, DEFAULT_AGENCY_PROFILE } from './types.ts';
import { CheckCircle2, X, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

const DEFAULT_PROPERTIES: Property[] = [
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
    title: 'Beau T3 Haussmannien avec balcon filant',
    city: 'Lyon',
    postalCode: '69006',
    rentCC: 1250,
    surface: 68,
    rooms: 3,
    address: '15 Boulevard des Belges, 69006 Lyon',
    status: 'Disponible',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'prop-3',
    title: 'Studio meublé rénové - Centre historique',
    city: 'Bordeaux',
    postalCode: '33000',
    rentCC: 620,
    surface: 24,
    rooms: 1,
    address: '8 Rue Sainte-Catherine, 33000 Bordeaux',
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

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onReset?: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto my-12 p-6 rounded-2xl bg-white border border-rose-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Une erreur d'affichage est survenue</h3>
          <p className="text-xs text-slate-500">
            {this.state.error?.message || 'Impossible d\'afficher cet onglet pour le moment.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
          >
            Rafraîchir cet affichage
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'scanner' | 'candidate-portal' | 'landing'>('scanner');
  const [properties, setProperties] = useState<Property[]>(DEFAULT_PROPERTIES);
  const [candidates, setCandidates] = useState<CandidateDossier[]>([]);
  const [agencyProfile, setAgencyProfile] = useState<AgencyProfile>(() => {
    try {
      const saved = localStorage.getItem('immoai_agency_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_AGENCY_PROFILE;
  });
  const [inspectedCandidate, setInspectedCandidate] = useState<CandidateDossier | null>(null);
  const [reportCandidate, setReportCandidate] = useState<CandidateDossier | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isBillingOpen, setIsBillingOpen] = useState<boolean>(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [isAgencyProfileOpen, setIsAgencyProfileOpen] = useState<boolean>(false);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState<boolean>(false);
  const [isPromoVideoOpen, setIsPromoVideoOpen] = useState<boolean>(false);
  const [feedbackSnippet, setFeedbackSnippet] = useState<string | undefined>(undefined);
  const [portalDefaultPropId, setPortalDefaultPropId] = useState<string | undefined>(undefined);
  const [notificationBanner, setNotificationBanner] = useState<{
    title: string;
    message: string;
    type: 'success' | 'info';
  } | null>(null);

  // Initial fetch of properties, candidates and agency profile
  useEffect(() => {
    // Check URL parameters if opened with ?tab=candidate-portal or ?billing_success=true
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    const propParam = urlParams.get('prop');
    const billingSuccess = urlParams.get('billing_success');

    if (billingSuccess === 'true') {
      setNotificationBanner({
        title: '🎉 Félicitations ! Votre abonnement ImmoAI Pro est activé',
        message: 'Votre période d\'essai de 14 jours a débuté avec succès. Vous bénéficiez désormais de l\'analyse et de la qualification illimitée des dossiers locatifs.',
        type: 'success',
      });
      // Clean query parameter from URL without reload
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        // ignore
      }
    }

    if (tabParam === 'candidate-portal') {
      setCurrentTab('candidate-portal');
      if (propParam) setPortalDefaultPropId(propParam);
    } else if (tabParam === 'dashboard') {
      setCurrentTab('dashboard');
    }

    fetch('/api/agency/profile')
      .then((res) => res.json())
      .then((data: AgencyProfile) => {
        if (data && data.name) {
          setAgencyProfile(data);
          try {
            localStorage.setItem('immoai_agency_profile', JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch((err) => console.error('Failed to fetch agency profile:', err));

    fetch('/api/properties')
      .then((res) => res.json())
      .then((data: Property[]) => {
        if (Array.isArray(data)) setProperties(data);
      })
      .catch((err) => console.error('Failed to fetch properties:', err));

    fetch('/api/candidates')
      .then((res) => res.json())
      .then((data: CandidateDossier[]) => {
        if (Array.isArray(data)) setCandidates(data);
      })
      .catch((err) => console.error('Failed to fetch candidates:', err));
  }, []);

  // Save agency profile
  const handleSaveAgencyProfile = async (updated: AgencyProfile) => {
    setAgencyProfile(updated);
    try {
      localStorage.setItem('immoai_agency_profile', JSON.stringify(updated));
      await fetch('/api/agency/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Failed to save agency profile:', err);
    }
    setNotificationBanner({
      title: 'Coordonnées de l\'agence enregistrées',
      message: `Votre agence « ${updated.name} » a été mise à jour avec succès.`,
      type: 'success',
    });
  };

  // Clear all candidates (mode réel / vider les exemples)
  const handleClearAllCandidates = async () => {
    try {
      await fetch('/api/candidates/clear-all', { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
    setCandidates([]);
    setNotificationBanner({
      title: 'Dossiers d\'exemples supprimés',
      message: 'Votre tableau de bord est désormais vierge et prêt à recevoir les dossiers de vos vrais candidats.',
      type: 'info',
    });
  };

  // Reset demo candidates
  const handleResetCandidates = async () => {
    try {
      const res = await fetch('/api/candidates/reset-samples', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates);
      }
    } catch (err) {
      console.error(err);
    }
    setNotificationBanner({
      title: 'Exemples de test rechargés',
      message: 'Les 4 candidatures de démonstration sont prêtes pour vos tests.',
      type: 'info',
    });
  };

  // Add real property
  const handleAddProperty = async (newProp: Property) => {
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProp),
      });
      if (res.ok) {
        const created = await res.json();
        setProperties((prev) => [...prev, created]);
      } else {
        setProperties((prev) => [...prev, newProp]);
      }
    } catch (err) {
      setProperties((prev) => [...prev, newProp]);
    }
    setNotificationBanner({
      title: 'Bien immobilier enregistré',
      message: `Le logement « ${newProp.title} » (${newProp.rentCC} €/mois) a été ajouté à votre portefeuille.`,
      type: 'success',
    });
  };

  // Delete property
  const handleDeleteProperty = async (propId: string) => {
    try {
      await fetch(`/api/properties/${propId}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
    setProperties((prev) => prev.filter((p) => p.id !== propId));
  };

  // Reset demo properties
  const handleResetProperties = async () => {
    try {
      const res = await fetch('/api/properties/reset-samples', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add new candidate from scanner or portal
  const handleAddCandidate = async (candidateData: any) => {
    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateData),
      });
      if (res.ok) {
        const created = await res.json();
        setCandidates((prev) => [created, ...prev]);
      } else {
        // Local fallback
        const localCand = {
          ...candidateData,
          id: `cand-${Date.now()}`,
          submittedAt: new Date().toISOString(),
        };
        setCandidates((prev) => [localCand, ...prev]);
      }
    } catch (err) {
      console.error(err);
      const localCand = {
        ...candidateData,
        id: `cand-${Date.now()}`,
        submittedAt: new Date().toISOString(),
      };
      setCandidates((prev) => [localCand, ...prev]);
    }
  };

  // Update status (e.g. Eligible, Garant, Refusé)
  const handleUpdateStatus = async (candidateId: string, newStatus: any) => {
    try {
      await fetch(`/api/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error(err);
    }

    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
    );

    if (inspectedCandidate && inspectedCandidate.id === candidateId) {
      setInspectedCandidate({ ...inspectedCandidate, status: newStatus });
    }
  };

  // Delete candidate
  const handleDeleteCandidate = async (candidateId: string) => {
    try {
      await fetch(`/api/candidates/${candidateId}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
    setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
  };

  const inspectedProperty = properties.find(
    (p) => p.id === inspectedCandidate?.propertyId
  );

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        candidateCount={candidates.length}
        agencyProfile={agencyProfile}
        onOpenAgencyProfile={() => setIsAgencyProfileOpen(true)}
        onOpenPromoVideo={() => setIsPromoVideoOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenBilling={() => setIsBillingOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onOpenFeedback={() => {
          setFeedbackSnippet(undefined);
          setIsFeedbackOpen(true);
        }}
      />

      {/* Notification Banner */}
      {notificationBanner && (
        <div className="bg-emerald-900 border-b border-emerald-700 text-white px-4 py-3 shadow-md animate-fadeIn">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{notificationBanner.title}</h4>
                <p className="text-xs text-emerald-200 mt-0.5">{notificationBanner.message}</p>
              </div>
            </div>
            <button
              onClick={() => setNotificationBanner(null)}
              className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Views */}
      <main className="flex-1">
        <ErrorBoundary onReset={() => setCurrentTab('scanner')}>
          {currentTab === 'dashboard' && (
            <DashboardView
              candidates={candidates}
              properties={properties}
              agencyProfile={agencyProfile}
              onOpenAgencyProfile={() => setIsAgencyProfileOpen(true)}
              onOpenAddProperty={() => setIsAddPropertyOpen(true)}
              onDeleteProperty={handleDeleteProperty}
              onClearAllCandidates={handleClearAllCandidates}
              onResetCandidates={handleResetCandidates}
              onResetProperties={handleResetProperties}
              onSelectCandidateToInspect={(candidate) => setInspectedCandidate(candidate)}
              onUpdateCandidateStatus={handleUpdateStatus}
              onDeleteCandidate={handleDeleteCandidate}
              onNavigateToScanner={() => setCurrentTab('scanner')}
              onNavigateToCandidatePortal={(propId) => {
                if (propId) setPortalDefaultPropId(propId);
                setCurrentTab('candidate-portal');
              }}
              onOpenLandlordReport={(candidate) => setReportCandidate(candidate)}
            />
          )}

          {currentTab === 'scanner' && (
            <DocumentScannerView
              properties={properties}
              onAddCandidateToDashboard={(cand) => {
                handleAddCandidate(cand);
                setCurrentTab('dashboard');
              }}
              onOpenLandlordReport={(cand) => setReportCandidate(cand)}
              onReportAnomaly={(snippet) => {
                setFeedbackSnippet(snippet);
                setIsFeedbackOpen(true);
              }}
            />
          )}

          {currentTab === 'candidate-portal' && (
            <CandidatePortalView
              properties={properties}
              agencyProfile={agencyProfile}
              defaultPropertyId={portalDefaultPropId}
              onCandidateSubmitted={(cand) => {
                handleAddCandidate(cand);
              }}
              onBackToDashboard={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'landing' && (
            <LandingView
              onStartDemo={() => setCurrentTab('scanner')}
              onGoToDashboard={() => setCurrentTab('dashboard')}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">ImmoAI</span>
            <span>•</span>
            <span>Plateforme de qualification des candidatures locatives</span>
            <span>•</span>
            <span className="text-emerald-400">Standard GLI & Loi ALUR France</span>
          </div>

          <div className="flex flex-wrap items-center space-x-3">
            <button
              onClick={() => setIsDiagnosticsOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
            >
              Diagnostic & État Système
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setIsPromoVideoOpen(true)}
              className="text-emerald-300 hover:text-emerald-200 font-bold underline cursor-pointer"
            >
              Vidéo & Kit Commercial
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => {
                setFeedbackSnippet(undefined);
                setIsFeedbackOpen(true);
              }}
              className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
            >
              Signaler une anomalie / Avis
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 font-medium underline cursor-pointer"
            >
              Architecture & Documentation API
            </button>
            <span className="text-slate-600">|</span>
            <span>Proptech Paris - Lyon - Bordeaux - Marseille</span>
          </div>
        </div>
      </footer>

      {/* Modal Inspection for Candidate */}
      <CandidateModal
        candidate={inspectedCandidate}
        property={inspectedProperty}
        onClose={() => setInspectedCandidate(null)}
        onUpdateStatus={handleUpdateStatus}
        onGenerateLandlordReport={(cand) => {
          setInspectedCandidate(null);
          setReportCandidate(cand);
        }}
      />

      {/* Landlord PDF Report Export Modal */}
      <LandlordReportModal
        candidate={reportCandidate}
        property={properties.find((p) => p.id === reportCandidate?.propertyId)}
        agencyProfile={agencyProfile}
        onClose={() => setReportCandidate(null)}
      />

      {/* Developer Architecture & Technical Documentation Modal */}
      <DeveloperGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Subscription & 14-day Trial Billing Guide & Simulation Modal */}
      <SubscriptionBillingModal
        isOpen={isBillingOpen}
        onClose={() => setIsBillingOpen(false)}
        onTriggerPaywall={() => {
          setIsBillingOpen(false);
          setIsPaywallOpen(true);
        }}
      />

      {/* Paywall Modal when 14-day trial without card expires */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onSubscribeSuccess={() => {
          setIsPaywallOpen(false);
          setNotificationBanner({
            title: 'Abonnement ImmoAI Pro Activé !',
            message: 'Votre formule Agence Pro à 79 €/mois est maintenant active.',
            type: 'success',
          });
        }}
      />

      {/* Diagnostics Center Modal */}
      <DiagnosticsCenterModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        onNavigateToScanner={() => {
          setIsDiagnosticsOpen(false);
          setCurrentTab('scanner');
        }}
        onNavigateToDashboard={() => {
          setIsDiagnosticsOpen(false);
          setCurrentTab('dashboard');
        }}
        onOpenFeedback={() => {
          setIsDiagnosticsOpen(false);
          setFeedbackSnippet(undefined);
          setIsFeedbackOpen(true);
        }}
      />

      {/* User Feedback & Anomaly Reporting Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        prefilledSnippet={feedbackSnippet}
      />

      {/* Agency Identity & Profile Modal */}
      <AgencyProfileModal
        isOpen={isAgencyProfileOpen}
        onClose={() => setIsAgencyProfileOpen(false)}
        profile={agencyProfile}
        onSaveProfile={handleSaveAgencyProfile}
      />

      {/* Add New Rental Property Modal */}
      <AddPropertyModal
        isOpen={isAddPropertyOpen}
        onClose={() => setIsAddPropertyOpen(false)}
        onAddProperty={handleAddProperty}
      />

      {/* Promotional Video Studio & Commercial Kit Modal */}
      <ErrorBoundary onReset={() => setIsPromoVideoOpen(false)}>
        <PromoVideoModal
          isOpen={isPromoVideoOpen}
          onClose={() => setIsPromoVideoOpen(false)}
          agencyProfile={agencyProfile}
        />
      </ErrorBoundary>
    </div>
  );
}
