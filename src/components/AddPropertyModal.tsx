import React, { useState } from 'react';
import {
  X,
  Home,
  Plus,
  Euro,
  MapPin,
  Maximize2,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { Property } from '../types.ts';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProperty: (prop: Property) => void;
}

const PRESET_IMAGES = [
  {
    name: 'Appartement Parisien / Haussmannien',
    url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Standing Contemporain / Balcon',
    url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Studio Meublé Moderne',
    url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Résidence Terrasse / Vue Dégagée',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
  },
];

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
  isOpen,
  onClose,
  onAddProperty,
}) => {
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('Paris');
  const [postalCode, setPostalCode] = useState('75011');
  const [rentCC, setRentCC] = useState('1100');
  const [surface, setSurface] = useState('45');
  const [rooms, setRooms] = useState('2');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState(PRESET_IMAGES[0].url);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newProp: Property = {
      id: `prop-${Date.now()}`,
      title: title.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      rentCC: parseFloat(rentCC) || 1000,
      surface: parseFloat(surface) || 40,
      rooms: parseInt(rooms, 10) || 2,
      address: address.trim() || `${city}`,
      status: 'Disponible',
      image: image || PRESET_IMAGES[0].url,
    };

    onAddProperty(newProp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-fadeIn text-slate-900">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Ajouter un bien à la location</h2>
              <p className="text-xs text-slate-400">Renseignez le logement pour recevoir les candidatures de locataires</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Titre de l'annonce *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : T2 rénové avec balcon - Proche transports"
              className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Loyer CC (€/mois) *</label>
              <input
                type="number"
                required
                min={100}
                value={rentCC}
                onChange={(e) => setRentCC(e.target.value)}
                className="w-full text-sm font-bold rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Surface (m²)</label>
              <input
                type="number"
                min={9}
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Pièces</label>
              <input
                type="number"
                min={1}
                max={10}
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Ville</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Code Postal</label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Adresse précise (optionnel)</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex : 24 Rue de la République"
              className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Photo presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Photo du bien :</label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_IMAGES.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => setImage(preset.url)}
                  className={`border-2 rounded-xl p-2 cursor-pointer transition flex items-center space-x-2 ${
                    image === preset.url
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={preset.url} alt={preset.name} className="w-12 h-10 object-cover rounded-lg" />
                  <span className="text-[11px] font-semibold text-slate-800 line-clamp-1">{preset.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer le bien</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
