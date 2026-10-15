import React, { useState } from 'react';
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  FileBadge,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Copy,
  ExternalLink,
  Save,
  Sparkles,
} from 'lucide-react';
import { AgencyProfile } from '../types.ts';

interface AgencyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: AgencyProfile;
  onSaveProfile: (updated: AgencyProfile) => void;
}

export const AgencyProfileModal: React.FC<AgencyProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<AgencyProfile>({ ...profile });
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const candidatePortalUrl = `${window.location.origin}/?tab=candidate-portal`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(candidatePortalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-fadeIn text-slate-900">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white">Identité & Paramètres de l'Agence</h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  B2B France
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Renseignez le nom de votre agence, votre SIRET et le responsable pour personnaliser vos dossiers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Aperçu en direct de votre signature agence :
            </span>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">{formData.name || 'Nom de votre agence'}</h3>
                <p className="text-xs text-slate-500">
                  {formData.managerName || 'Gérant'} • {formData.managerRole || 'Directeur'} • {formData.phone}
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  SIRET : {formData.siret || 'En attente'} • Carte Pro : {formData.cartePro || 'En attente'}
                </p>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                Loi ALUR & GLI
              </div>
            </div>
          </div>

          {/* Section 1 : Informations Générales de l'Agence */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>1. Raison sociale & Cabinet</span>
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nom de l'agence ou du cabinet immobilier *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex : Cabinet Haussmann Immobilier, Agence Saint-Germain..."
                className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Numéro SIRET (14 chiffres)
                </label>
                <input
                  type="text"
                  value={formData.siret}
                  onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                  placeholder="Ex : 842 190 321 00024"
                  className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Carte Professionnelle CPI (Loi Hoguet)
                </label>
                <input
                  type="text"
                  value={formData.cartePro}
                  onChange={(e) => setFormData({ ...formData, cartePro: e.target.value })}
                  placeholder="Ex : CPI 7501 2024 000 012 345"
                  className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Adresse du siège
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ex : 14 Avenue de l'Opéra"
                  className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Ville & CP
                </label>
                <input
                  type="text"
                  value={`${formData.postalCode} ${formData.city}`.trim()}
                  onChange={(e) => {
                    const parts = e.target.value.split(' ');
                    const cp = parts[0] || '';
                    const city = parts.slice(1).join(' ') || '';
                    setFormData({ ...formData, postalCode: cp, city });
                  }}
                  placeholder="75001 Paris"
                  className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2 : Gérant & Contact Professionnel */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600" />
              <span>2. Responsable d'Agence & Contact direct</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nom et Prénom du gestionnaire / directeur *
                </label>
                <input
                  type="text"
                  required
                  value={formData.managerName}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  placeholder="Ex : Jean-Marc Dupont"
                  className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Titre / Fonction
                </label>
                <input
                  type="text"
                  value={formData.managerRole}
                  onChange={(e) => setFormData({ ...formData, managerRole: e.target.value })}
                  placeholder="Ex : Directeur Gestion Locative"
                  className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email de réception des dossiers
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="gestion@votre-agence.fr"
                  className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Téléphone direct
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01 42 68 50 00"
                  className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Partenaire Garantie Loyers Impayés (GLI) ou Assureur
              </label>
              <input
                type="text"
                value={formData.gliPartner}
                onChange={(e) => setFormData({ ...formData, gliPartner: e.target.value })}
                placeholder="Ex : Allianz GLI, Garantie Visale, Garantme, AXA..."
                className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Section 3 : Portail Candidat Public */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>3. Lien Public de Dépôt pour vos Annonces (SeLoger / Leboncoin)</span>
            </h4>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-emerald-950 block">Votre lien candidat officiel :</span>
                <span className="text-[11px] font-mono text-emerald-800 break-all">{candidatePortalUrl}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Lien copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le lien</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition flex items-center gap-2 cursor-pointer"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Informations enregistrées !</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les coordonnées de l'agence</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
