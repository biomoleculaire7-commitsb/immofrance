import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Eye,
  Building2,
  Euro,
  FileCheck,
  Phone,
  Mail,
  Calendar,
  Share2,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Shield,
  Trash2,
  FileText,
  Plus,
  Settings,
  RefreshCw,
  Home,
  Check,
  RotateCcw,
  Video,
} from 'lucide-react';
import { CandidateDossier, Property, AgencyProfile, DEFAULT_AGENCY_PROFILE } from '../types.ts';

interface DashboardViewProps {
  candidates: CandidateDossier[];
  properties: Property[];
  agencyProfile?: AgencyProfile;
  onOpenAgencyProfile?: () => void;
  onOpenPromoVideo?: () => void;
  onOpenVisitorTracker?: () => void;
  onOpenAddProperty?: () => void;
  onDeleteProperty?: (propId: string) => void;
  onClearAllCandidates?: () => void;
  onResetCandidates?: () => void;
  onResetProperties?: () => void;
  onSelectCandidateToInspect: (candidate: CandidateDossier) => void;
  onUpdateCandidateStatus: (candidateId: string, status: any) => void;
  onDeleteCandidate: (candidateId: string) => void;
  onNavigateToScanner: () => void;
  onNavigateToCandidatePortal: (propertyId?: string) => void;
  onOpenLandlordReport: (candidate: CandidateDossier) => void;
  isAdmin?: boolean;
  isPreviewAsClient?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  candidates,
  properties,
  agencyProfile = DEFAULT_AGENCY_PROFILE,
  onOpenAgencyProfile,
  onOpenPromoVideo,
  onOpenVisitorTracker,
  onOpenAddProperty,
  onDeleteProperty,
  onClearAllCandidates,
  onResetCandidates,
  onResetProperties,
  onSelectCandidateToInspect,
  onUpdateCandidateStatus,
  onDeleteCandidate,
  onNavigateToScanner,
  onNavigateToCandidatePortal,
  onOpenLandlordReport,
  isAdmin = false,
  isPreviewAsClient = false,
}) => {
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedLinkPropertyId, setCopiedLinkPropertyId] = useState<string | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    if (selectedPropertyFilter !== 'ALL' && c.propertyId !== selectedPropertyFilter) {
      return false;
    }
    if (selectedStatusFilter !== 'ALL' && c.status !== selectedStatusFilter) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = c.candidateName.toLowerCase().includes(q);
      const matchEmployer = c.employer.toLowerCase().includes(q);
      const matchEmail = c.candidateEmail.toLowerCase().includes(q);
      return matchName || matchEmployer || matchEmail;
    }
    return true;
  });

  // Calculate statistics
  const totalCount = candidates.length;
  const eligibleCount = candidates.filter((c) => c.status === 'ELIGIBLE').length;
  const guarantorCount = candidates.filter((c) => c.status === 'GARANT_NECESSAIRE').length;
  const refusedCount = candidates.filter((c) => c.status === 'REFUSE').length;
  const avgScore =
    totalCount > 0 ? Math.round(candidates.reduce((acc, c) => acc + c.score, 0) / totalCount) : 0;

  const handleCopyPortalLink = (propertyId?: string) => {
    const url = propertyId
      ? `${window.location.origin}/?tab=candidate-portal&prop=${propertyId}`
      : `${window.location.origin}/?tab=candidate-portal`;
    navigator.clipboard?.writeText?.(url);
    setCopiedLinkPropertyId(propertyId || 'global');
    setTimeout(() => setCopiedLinkPropertyId(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner with Agency Identity & Quick Actions */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Gestion des Dossiers Locatifs
            </h1>
            <button
              onClick={onOpenAgencyProfile}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 text-xs font-bold border border-slate-300 transition cursor-pointer"
              title="Cliquer pour modifier le nom de l'agence, le SIRET et le responsable"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{agencyProfile.name || 'Configurer mon Agence'}</span>
              <Settings className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Directeur : <strong className="text-slate-800">{agencyProfile.managerName || 'Non défini'}</strong> • 
            SIRET : <span className="font-mono text-slate-700">{agencyProfile.siret || 'En attente'}</span> • 
            Standard GLI : <span className="text-emerald-700 font-semibold">{agencyProfile.gliPartner || 'Allianz / Visale'}</span>
          </p>
        </div>

        {/* Agency Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleCopyPortalLink()}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm transition flex items-center space-x-2 cursor-pointer"
            title="Lien public pour SeLoger / Leboncoin"
          >
            <Share2 className="w-4 h-4 text-emerald-600" />
            <span>{copiedLinkPropertyId === 'global' ? 'Lien copié !' : 'Lien Candidat'}</span>
          </button>

          {onOpenAddProperty && (
            <button
              onClick={onOpenAddProperty}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Ajouter un bien</span>
            </button>
          )}

          {isAdmin && !isPreviewAsClient && onOpenPromoVideo && (
            <button
              onClick={onOpenPromoVideo}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 transition flex items-center space-x-2 cursor-pointer"
              title="Studio Vidéo Démo & Scripts pour Réseaux Sociaux (Réservé Fondateur)"
            >
              <Video className="w-4 h-4 text-white" />
              <span>Vidéo & Kit Commercial</span>
            </button>
          )}

          {isAdmin && !isPreviewAsClient && onOpenVisitorTracker && (
            <button
              onClick={onOpenVisitorTracker}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-950/90 border border-indigo-700/70 text-indigo-200 hover:bg-indigo-900 shadow-sm transition flex items-center space-x-2 cursor-pointer"
              title="Consulter le journal des 20 agences et des visiteurs en temps réel (Réservé Fondateur)"
            >
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Suivi Visites (20 Agences)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          )}

          <button
            onClick={onNavigateToScanner}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition flex items-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Tester un Bulletin IA</span>
          </button>
        </div>
      </div>

      {/* Mode Production & Sample Management Bar */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-700">État de la base :</span>
          {candidates.length > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              Mode Démonstration ({candidates.length} dossiers actifs)
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mode Production Réel (Prêt à recevoir des candidats)
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {candidates.length > 0 ? (
            showConfirmClear ? (
              <div className="flex items-center space-x-2 animate-fadeIn">
                <span className="text-rose-600 font-semibold">Confirmer la suppression des exemples ?</span>
                <button
                  onClick={() => {
                    if (onClearAllCandidates) onClearAllCandidates();
                    setShowConfirmClear(false);
                  }}
                  className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-500 cursor-pointer"
                >
                  Oui, vider
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="px-3 py-1 rounded-lg bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Supprimer les 4 dossiers d'exemples pour commencer avec une agence propre"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Vider les exemples (Mode Réel)</span>
              </button>
            )
          ) : (
            onResetCandidates && (
              <button
                onClick={onResetCandidates}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-200 font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Recharger les exemples de test</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Candidatures
            </span>
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">{totalCount}</span>
            <span className="text-xs text-slate-500">dossiers</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Scoring instantané Loi ALUR</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Dossiers Éligibles (3x)
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-600">{eligibleCount}</span>
            <span className="text-xs text-slate-500">
              ({totalCount > 0 ? Math.round((eligibleCount / totalCount) * 100) : 0}%)
            </span>
          </div>
          <p className="text-xs text-emerald-700 mt-2 font-medium">
            Prêts pour visite et bail
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Garant Recommandé
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-amber-600">{guarantorCount}</span>
            <span className="text-xs text-slate-500">dossiers</span>
          </div>
          <p className="text-xs text-amber-700 mt-2 font-medium">
            Période d'essai / Visale
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Score Moyen Candidats
            </span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Shield className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-indigo-700">
              {totalCount > 0 ? `${avgScore}/100` : '—'}
            </span>
            <span className="text-xs text-slate-500">sur 100</span>
          </div>
          <p className="text-xs text-indigo-600 mt-2 font-medium">
            Économie de ~ 9.5 h / semaine
          </p>
        </div>
      </div>

      {/* Property Cards Carousel / Selection Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              Biens immobiliers à la location
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {properties.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenAddProperty && (
              <button
                onClick={onOpenAddProperty}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau logement</span>
              </button>
            )}
            {properties.length === 0 && onResetProperties && (
              <button
                onClick={onResetProperties}
                className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Restaurer biens démo
              </button>
            )}
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Home className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Aucun bien immobilier enregistré</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ajoutez vos appartements ou maisons en gestion pour que vos locataires puissent postuler directement.
            </p>
            {onOpenAddProperty && (
              <button
                onClick={onOpenAddProperty}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition cursor-pointer"
              >
                Ajouter un logement
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {properties.map((prop) => {
              const isSelected = selectedPropertyFilter === prop.id;
              const candCountForProp = candidates.filter((c) => c.propertyId === prop.id).length;
              return (
                <div
                  key={prop.id}
                  onClick={() => setSelectedPropertyFilter(isSelected ? 'ALL' : prop.id)}
                  className={`rounded-2xl border p-4 transition-all cursor-pointer bg-white relative group ${
                    isSelected
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="h-28 rounded-xl overflow-hidden mb-3 relative">
                    <img
                      src={prop.image}
                      alt={prop.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-white">
                      {prop.city} ({prop.postalCode})
                    </div>
                    <div className="absolute bottom-2 right-2 bg-emerald-600 text-white px-2 py-0.5 rounded text-xs font-black shadow">
                      {prop.rentCC} €/mois CC
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                    {prop.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {prop.surface} m² • {prop.rooms} pièce(s)
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {candCountForProp} candidat{candCountForProp > 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyPortalLink(prop.id);
                        }}
                        className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                        title="Copier le lien direct pour ce logement"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>{copiedLinkPropertyId === prop.id ? 'Copié !' : 'Partager'}</span>
                      </button>

                      {onDeleteProperty && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Supprimer le bien « ${prop.title} » ?`)) {
                              onDeleteProperty(prop.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition cursor-pointer p-0.5"
                          title="Supprimer ce bien"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Toolbar & Candidates Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtrer :
            </span>

            <button
              onClick={() => setSelectedStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedStatusFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Tous ({candidates.length})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('ELIGIBLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedStatusFilter === 'ELIGIBLE'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              Éligibles ({eligibleCount})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('GARANT_NECESSAIRE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedStatusFilter === 'GARANT_NECESSAIRE'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white border border-slate-200 text-amber-700 hover:bg-amber-50'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Garant Requis ({guarantorCount})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('REFUSE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedStatusFilter === 'REFUSE'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
              }`}
            >
              <XCircle className="w-3 h-3" />
              Insuffisants ({refusedCount})
            </button>

            {selectedPropertyFilter !== 'ALL' && (
              <button
                onClick={() => setSelectedPropertyFilter('ALL')}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Réinitialiser filtre bien
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher candidat, employeur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Table or Production Ready State */}
        <div className="overflow-x-auto">
          {candidates.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  Votre Agence est Prête pour Recevoir des Candidats Réels !
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Tous les dossiers d'exemples ont été retirés. Vous pouvez désormais communiquer votre lien public de dépôt aux candidats locataires.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => handleCopyPortalLink()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Copier mon lien de dépôt candidat</span>
                </button>

                <button
                  onClick={onNavigateToScanner}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Tester le scanner avec un bulletin</span>
                </button>
              </div>

              {onResetCandidates && (
                <div className="pt-4">
                  <button
                    onClick={onResetCandidates}
                    className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
                  >
                    Besoin de tester ? Recharger les 4 dossiers d'exemples
                  </button>
                </div>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Candidat Locataire</th>
                  <th className="py-3.5 px-4">Logement Convoité</th>
                  <th className="py-3.5 px-4">Contrat & Période d'essai</th>
                  <th className="py-3.5 px-4">Revenu Net / Mois</th>
                  <th className="py-3.5 px-4">Taux d'effort</th>
                  <th className="py-3.5 px-4">Verdict Loi ALUR</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Aucun dossier ne correspond à vos filtres.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => {
                    const prop = properties.find((p) => p.id === candidate.propertyId);
                    return (
                      <tr
                        key={candidate.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => onSelectCandidateToInspect(candidate)}
                      >
                        {/* Name & Contact */}
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900 text-sm">
                            {candidate.candidateName}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{candidate.candidateEmail}</span>
                            <span>•</span>
                            <span>{candidate.candidatePhone}</span>
                          </div>
                        </td>

                        {/* Property */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-800 line-clamp-1 max-w-[200px]">
                            {prop ? prop.title : 'Bien en gestion'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {candidate.rentAmount} €/mois CC • {prop?.city || 'France'}
                          </div>
                        </td>

                        {/* Contract & Trial Period */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-indigo-900">
                            {candidate.contractType}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            {candidate.employer}
                          </div>
                          <div className="mt-1">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                candidate.trialPeriodStatus === 'VALIDEE'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : candidate.trialPeriodStatus === 'EN_COURS'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {candidate.trialPeriodStatus === 'VALIDEE'
                                ? 'Hors période d\'essai'
                                : candidate.trialPeriodStatus === 'EN_COURS'
                                ? 'Essai en cours'
                                : 'Non applicable'}
                            </span>
                          </div>
                        </td>

                        {/* Salary */}
                        <td className="py-4 px-4">
                          <div className="font-black text-slate-900 text-sm">
                            {candidate.monthlyNetSalary?.toLocaleString('fr-FR')} € net
                          </div>
                          <div className="text-[11px] text-slate-400 font-semibold">
                            {(candidate.monthlyNetSalary / (candidate.rentAmount || 1)).toFixed(1)}x le loyer
                          </div>
                        </td>

                        {/* Effort Ratio */}
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`font-black ${
                                candidate.effortRatio <= 33
                                  ? 'text-emerald-600'
                                  : candidate.effortRatio <= 38
                                  ? 'text-amber-600'
                                  : 'text-rose-600'
                              }`}
                            >
                              {candidate.effortRatio}%
                            </span>
                            <span className="text-[10px] text-slate-400">
                              (Plafond: 33%)
                            </span>
                          </div>
                          <div className="w-20 bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className={`h-full ${
                                candidate.effortRatio <= 33
                                  ? 'bg-emerald-500'
                                  : candidate.effortRatio <= 38
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, candidate.effortRatio)}%` }}
                            />
                          </div>
                        </td>

                        {/* AI Verdict */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                              candidate.status === 'ELIGIBLE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : candidate.status === 'GARANT_NECESSAIRE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {candidate.status === 'ELIGIBLE' && (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>ÉLIGIBLE ({candidate.score}/100)</span>
                              </>
                            )}
                            {candidate.status === 'GARANT_NECESSAIRE' && (
                              <>
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>GARANT ({candidate.score}/100)</span>
                              </>
                            )}
                            {candidate.status === 'REFUSE' && (
                              <>
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>REFUSÉ ({candidate.score}/100)</span>
                              </>
                            )}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => onOpenLandlordReport(candidate)}
                              className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                              title="Générer le Rapport PDF Propriétaire"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onSelectCandidateToInspect(candidate)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition cursor-pointer"
                              title="Consulter le dossier complet"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteCandidate(candidate.id)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Supprimer la candidature"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
