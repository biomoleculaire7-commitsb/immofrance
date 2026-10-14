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
import { CandidateDossier, Property } from './types.ts';
import { CheckCircle2, X, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'scanner' | 'candidate-portal' | 'landing'>('scanner');
  const [properties, setProperties] = useState<Property[]>([]);
  const [candidates, setCandidates] = useState<CandidateDossier[]>([]);
  const [inspectedCandidate, setInspectedCandidate] = useState<CandidateDossier | null>(null);
  const [reportCandidate, setReportCandidate] = useState<CandidateDossier | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isBillingOpen, setIsBillingOpen] = useState<boolean>(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [feedbackSnippet, setFeedbackSnippet] = useState<string | undefined>(undefined);
  const [portalDefaultPropId, setPortalDefaultPropId] = useState<string | undefined>(undefined);
  const [notificationBanner, setNotificationBanner] = useState<{
    title: string;
    message: string;
    type: 'success' | 'info';
  } | null>(null);

  // Initial fetch of properties and candidates
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

    fetch('/api/properties')
      .then((res) => res.json())
      .then((data: Property[]) => setProperties(data))
      .catch((err) => console.error('Failed to fetch properties:', err));

    fetch('/api/candidates')
      .then((res) => res.json())
      .then((data: CandidateDossier[]) => setCandidates(data))
      .catch((err) => console.error('Failed to fetch candidates:', err));
  }, []);

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
        {currentTab === 'dashboard' && (
          <DashboardView
            candidates={candidates}
            properties={properties}
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
              دليل المعمارية والربط
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
        onClose={() => setReportCandidate(null)}
      />

      {/* Developer Architecture Guide Modal in Arabic */}
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
    </div>
  );
}
