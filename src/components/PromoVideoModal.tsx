import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  CheckCircle2,
  Sparkles,
  Building2,
  FileText,
  Share2,
  Download,
  Video,
  Send,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  Euro,
} from 'lucide-react';
import { AgencyProfile, DEFAULT_AGENCY_PROFILE } from '../types.ts';

interface PromoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  agencyProfile?: AgencyProfile;
}

interface Scene {
  id: number;
  duration: number; // in seconds
  title: string;
  subtitle: string;
  badge: string;
  voiceoverFr: string;
  visualDescription: string;
  statsOverlay?: { label: string; value: string };
  graphicType: 'problem' | 'scanner' | 'portal' | 'report' | 'offer';
}

const SCENES: Scene[] = [
  {
    id: 1,
    duration: 8,
    badge: 'Problème Agence',
    title: 'Vous passez encore 10 heures par semaine sur les fiches de paie ?',
    subtitle: 'Calculs de taux d\'effort, bulletins falsifiés, périodes d\'essai masquées...',
    voiceoverFr:
      'En tant qu\'agent immobilier, vous recevez des dizaines de candidatures par jour. Calculer les 33% de solvabilité et traquer les périodes d\'essai masquées vous fait perdre un temps précieux.',
    visualDescription:
      'Animation d\'une pile de dossiers papier et bulletins de paie avec alertes et chronomètre qui tourne.',
    statsOverlay: { label: 'Temps perdu par négociateur', value: '10h / sem' },
    graphicType: 'problem',
  },
  {
    id: 2,
    duration: 10,
    badge: 'Solution IA',
    title: 'ImmoAI qualifie chaque dossier locatif en 3 secondes chrono.',
    subtitle: 'Intelligence artificielle spécialisée pour le marché locatif français.',
    voiceoverFr:
      'Voici ImmoAI. Glissez simplement la fiche de paie du candidat. Notre intelligence artificielle extrait instantanément le salaire net avant impôt, contrôle l\'ancienneté et valide le ratio de solvabilité.',
    visualDescription:
      'Démonstration du scanner IA : glisser-déposer du bulletin, barre de chargement ultra-rapide et badge vert « ÉLIGIBLE 3x LOYER » qui s\'allume.',
    statsOverlay: { label: 'Vitesse de qualification', value: '3 secondes' },
    graphicType: 'scanner',
  },
  {
    id: 3,
    duration: 9,
    badge: 'Portail Candidat',
    title: 'Un lien public à intégrer dans vos annonces SeLoger & Leboncoin.',
    subtitle: 'Fini les boîtes mails encombrées : vos candidats déposent leurs pièces en toute sécurité.',
    voiceoverFr:
      'Intégrez votre lien officiel ImmoAI directement dans vos annonces en ligne. Les locataires déposent leurs justificatifs en toute autonomie et votre tableau de bord les classe automatiquement par ordre de solvabilité.',
    visualDescription:
      'Aperçu du portail candidat sur smartphone et PC, avec logo personnalisé de l\'agence et conformité Loi ALUR.',
    statsOverlay: { label: 'Conformité juridique', value: 'Loi ALUR & RGPD' },
    graphicType: 'portal',
  },
  {
    id: 4,
    duration: 9,
    badge: 'Rapport Propriétaire',
    title: 'Exportez un Rapport PDF Certifié au nom de votre Agence.',
    subtitle: 'La preuve irréfutable de solvabilité pour rassurer vos propriétaires bailleurs.',
    voiceoverFr:
      'En un clic, générez un rapport A4 officiel estampillé aux coordonnées et au numéro SIRET de votre agence. Vous présentez un dossier limpide et irréprochable à votre propriétaire bailleur.',
    visualDescription:
      'Feuille de synthèse A4 officielle qui s\'affiche avec note du gestionnaire, score de solvabilité et signature numérique.',
    statsOverlay: { label: 'Taux de validation bailleur', value: '98%' },
    graphicType: 'report',
  },
  {
    id: 5,
    duration: 8,
    badge: 'Offre Découverte',
    title: 'Passez votre agence à la vitesse supérieure. 14 jours gratuits.',
    subtitle: 'Sans engagement. 79 € HT / mois seulement. Rentabilisé dès le premier mandat.',
    voiceoverFr:
      'Rejoignez les agences qui automatisent leur gestion locative. Testez gratuitement ImmoAI pendant quatorze jours sans engagement sur immoai.fr.',
    visualDescription:
      'Écran final avec tarif clair, bouton d\'essai gratuit 14 jours et logo ImmoAI éclatant.',
    statsOverlay: { label: 'Période d\'essai', value: '14 jours offerts' },
    graphicType: 'offer',
  },
];

export const PromoVideoModal: React.FC<PromoVideoModalProps> = ({
  isOpen,
  onClose,
  agencyProfile = DEFAULT_AGENCY_PROFILE,
}) => {
  const [activeTab, setActiveTab] = useState<'video_player' | 'scripts_social' | 'outreach_email'>('video_player');
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100 in current scene
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  if (!isOpen) return null;

  const currentScene = SCENES[currentSceneIdx];

  // Speech synthesis in French
  const speakScene = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error:', e);
    }
  };

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Video playback timer loop
  useEffect(() => {
    let interval: any = null;

    if (isPlaying) {
      // Trigger voiceover when scene starts
      if (progress === 0 && !isMuted) {
        speakScene(currentScene.voiceoverFr);
      }

      const stepMs = 100;
      const totalSteps = (currentScene.duration * 1000) / stepMs;
      const increment = 100 / totalSteps;

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev + increment >= 100) {
            // Move to next scene
            if (currentSceneIdx < SCENES.length - 1) {
              setCurrentSceneIdx((curr) => curr + 1);
              return 0;
            } else {
              // End reached
              setIsPlaying(false);
              stopSpeech();
              return 100;
            }
          }
          return prev + increment;
        });
      }, stepMs);
    } else {
      stopSpeech();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentSceneIdx, currentScene.duration, isMuted]);

  const handlePlayToggle = () => {
    if (!isPlaying && progress >= 100 && currentSceneIdx === SCENES.length - 1) {
      // Reset to beginning
      setCurrentSceneIdx(0);
      setProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    stopSpeech();
    setCurrentSceneIdx(0);
    setProgress(0);
    setIsPlaying(true);
    if (!isMuted) {
      speakScene(SCENES[0].voiceoverFr);
    }
  };

  const handleSelectScene = (idx: number) => {
    stopSpeech();
    setCurrentSceneIdx(idx);
    setProgress(0);
    if (isPlaying && !isMuted) {
      speakScene(SCENES[idx].voiceoverFr);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText?.(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Pre-formatted viral copy for LinkedIn / TikTok / Instagram Reels
  const linkedInPost = `🚀 Agents immobiliers et gestionnaires locatifs : combien d'heures par semaine perdez-vous à éplucher des fiches de paie ?

Entre le calcul des 33% de taux d'effort, la détection des périodes d'essai masquées et les risques de rejet par votre assurance GLI, la qualification manuelle d'un dossier locataire prend en moyenne 25 minutes.

👉 Avec ImmoAI, ce processus prend désormais 3 SECONDES :

1️⃣ Vous ou le candidat déposez le bulletin de salaire (PDF ou photo).
2️⃣ L'IA extrait le Net avant impôt, certifie la stabilité du contrat et applique la règle des 3x le loyer selon le droit français (Loi ALUR).
3️⃣ En un clic, vous générez un Rapport Propriétaire officiel au format A4 signé au nom de votre cabinet.

💡 Résultat : ~ 9,5 heures gagnées par semaine par négociateur, et zéro risque d'impayé non couvert.

🎁 Testez gratuitement pendant 14 jours (sans engagement) :
👉 https://immoai.fr

#Proptech #Immobilier #GestionLocative #LoiALUR #IntelligenceArtificielle #AgencesImmobilieres`;

  const scriptReelsTikTok = `[SCRIPT VIDÉO VIRALE REELS / TIKTOK / SHORTS - 45 SECONDES]

🎬 PLAN 1 (0-5s) - ACCROCHE :
(Visuel : L'agent montre l'écran de son ordinateur avec 30 emails de fiches de paie)
Voix-off / Facecam : « Si tu travailles en agence immobilière, arrête immédiatement de calculer le taux d'effort des locataires à la main. »

🎬 PLAN 2 (5-15s) - LE PROBLÈME :
(Texte dynamique à l'écran : 10h perdues par semaine)
Voix-off : « Vérifier le net avant impôt, chercher si la période d'essai est validée, calculer si les 3x le loyer passent pour la GLI... Ça te prend 20 minutes par candidat. »

🎬 PLAN 3 (15-30s) - LA DÉMONSTRATION IMMOAI :
(Visuel : Enregistrement d'écran d'ImmoAI avec glisser-déposer de la fiche de paie)
Voix-off : « Regarde ça : je glisse la fiche de paie sur ImmoAI... 1, 2, 3 secondes : le salaire net est extrait, le taux d'effort est calculé, et le dossier est validé conforme Garantie Loyers Impayés ! »

🎬 PLAN 4 (30-40s) - LE RAPPORT PROPRIÉTAIRE :
(Visuel : Clic sur « Générer le rapport PDF », le document certifié A4 apparaît)
Voix-off : « Et le truc fou ? En un clic, j'exporte le rapport PDF certifié avec le logo de mon agence pour rassurer mon propriétaire bailleur. »

🎬 PLAN 5 (40-45s) - CALL TO ACTION :
Voix-off : « Le lien est dans ma bio ou sur immoai.fr, il y a 14 jours d'essai gratuit pour les pros. Fonce tester ! »`;

  const outreachMessageWhatsApp = `Bonjour Monsieur/Madame,

Je me permets de vous contacter car je sais que dans votre agence ${agencyProfile.name || 'immobilière'}, la sélection des dossiers locataires prend un temps considérable à vos négociateurs.

Nous avons développé ImmoAI (https://immoai.fr), une plateforme d'intelligence artificielle dédiée aux agences immobilières françaises :
• Analyse d'un bulletin de paie en 3 secondes (extraction du Net avant impôt, détection de la période d'essai et calcul du ratio 33% Loi ALUR).
• Un portail candidat en ligne à intégrer directement dans vos annonces SeLoger / Leboncoin.
• Génération en 1 clic d'un Rapport Propriétaire A4 certifié avec le nom et le SIRET de votre cabinet.

Nous offrons actuellement 14 jours d'essai gratuit sans engagement pour tester l'outil sur vos dossiers en cours.

Seriez-vous disponible pour une rapide démonstration de 3 minutes en visio cette semaine ?

Bien cordialement,
L'équipe ImmoAI`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[95vh] animate-fadeIn">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Studio Vidéo Publicitaire & Kit Commercial
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  B2B Agences
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Présentation vidéo animée interactive + Scripts et posts prêts pour réseaux sociaux
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-6 pt-3 space-x-4">
          <button
            onClick={() => setActiveTab('video_player')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'video_player'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Lecteur Vidéo Démo Animé</span>
          </button>

          <button
            onClick={() => setActiveTab('scripts_social')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'scripts_social'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>Scripts Réseaux Sociaux (LinkedIn / Reels / TikTok)</span>
          </button>

          <button
            onClick={() => setActiveTab('outreach_email')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'outreach_email'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4 text-indigo-400" />
            <span>Message de Prospection (Directeurs d'Agences)</span>
          </button>
        </div>

        {/* Tab 1: Interactive Video Player */}
        {activeTab === 'video_player' && (
          <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
            {/* The Animated Video Screen */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/60 border border-slate-700 shadow-2xl p-6 sm:p-10 min-h-[380px] flex flex-col justify-between">
              {/* Scene Top Badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black uppercase tracking-wider">
                    {currentScene.badge}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Scène {currentSceneIdx + 1} / {SCENES.length}
                  </span>
                </div>

                {currentScene.statsOverlay && (
                  <div className="px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-right">
                    <span className="text-[10px] text-slate-400 block">{currentScene.statsOverlay.label}</span>
                    <span className="text-sm font-black text-emerald-400">{currentScene.statsOverlay.value}</span>
                  </div>
                )}
              </div>

              {/* Center Animated Scene Presentation */}
              <div className="my-6 space-y-4 text-center max-w-2xl mx-auto">
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight animate-fadeIn">
                  {currentScene.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
                  {currentScene.subtitle}
                </p>

                {/* Visual Simulation Card based on scene graphicType */}
                <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-left max-w-lg mx-auto shadow-xl">
                  {currentScene.graphicType === 'problem' && (
                    <div className="flex items-center space-x-3 text-xs text-rose-300">
                      <Clock className="w-8 h-8 text-rose-400 shrink-0 animate-pulse" />
                      <div>
                        <strong className="block text-white font-bold">Perte de temps colossale :</strong>
                        <span>25 minutes par dossier locatif, calculatrices Excel et risques d'impayés.</span>
                      </div>
                    </div>
                  )}

                  {currentScene.graphicType === 'scanner' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Analyse IA en direct :</span>
                        <span className="text-emerald-400 font-bold">100% Validé</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.max(20, progress)}%` }} />
                      </div>
                      <div className="text-[11px] text-emerald-300 flex items-center justify-between">
                        <span>Net avant impôt : 3 450 €</span>
                        <span>Effort : 28.4% &lt; 33% GLI</span>
                      </div>
                    </div>
                  )}

                  {currentScene.graphicType === 'portal' && (
                    <div className="flex items-center space-x-3 text-xs text-slate-300">
                      <Share2 className="w-7 h-7 text-emerald-400 shrink-0" />
                      <div>
                        <strong className="text-white block">Lien public personnalisé pour l'agence :</strong>
                        <span className="font-mono text-emerald-400 text-[11px]">immoai.fr/?tab=candidate-portal</span>
                      </div>
                    </div>
                  )}

                  {currentScene.graphicType === 'report' && (
                    <div className="flex items-center space-x-3 text-xs text-slate-300">
                      <FileText className="w-7 h-7 text-indigo-400 shrink-0" />
                      <div>
                        <strong className="text-white block">Rapport Officiel Bailleur (Format A4) :</strong>
                        <span>Signé numériquement pour {agencyProfile.name || 'votre cabinet'}.</span>
                      </div>
                    </div>
                  )}

                  {currentScene.graphicType === 'offer' && (
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-xs text-emerald-400 font-bold uppercase block">Essai Découverte</span>
                        <strong className="text-white text-base">14 Jours Offerts</strong>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs">
                        Sans engagement
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subtitles / Voiceover text */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5">
                  Sous-titres & Voix-off synchronisée :
                </span>
                <p className="text-xs text-emerald-200 font-medium italic">
                  « {currentScene.voiceoverFr} »
                </p>
              </div>

              {/* Scene progress bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Video Controls Bar */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePlayToggle}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center space-x-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-slate-950" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>Lancer la vidéo démo</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleRestart}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition cursor-pointer"
                  title="Recommencer depuis le début"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2.5 rounded-xl text-xs transition cursor-pointer ${
                    isMuted
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                  title={isMuted ? 'Activer la voix-off en français' : 'Couper le son'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>

              {/* Timeline Scene Selector */}
              <div className="flex items-center space-x-1.5">
                {SCENES.map((scene, idx) => (
                  <button
                    key={scene.id}
                    onClick={() => handleSelectScene(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      currentSceneIdx === idx
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {idx + 1}. {scene.badge}
                  </button>
                ))}
              </div>
            </div>

            {/* Instruction to record */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-200 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Astuce d'enregistrement :</strong> Vous pouvez lancer ce lecteur et enregistrer votre écran en 1080p avec votre smartphone ou un outil de capture (Loom, OBS, QuickTime) pour publier directement la vidéo sur vos réseaux sociaux !
                </span>
              </div>
              <button
                onClick={() => handleCopy(SCENES.map((s) => `[SCÈNE ${s.id} - ${s.badge}]\n${s.voiceoverFr}`).join('\n\n'), 'all_script')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer text-xs"
              >
                {copiedId === 'all_script' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Script copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le script complet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Social Media Ready Copy */}
        {activeTab === 'scripts_social' && (
          <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
            {/* Post LinkedIn B2B */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <h4 className="text-sm font-bold text-white">Post LinkedIn Pro (Ciblage : Directeurs d'Agences & Négociateurs)</h4>
                </div>
                <button
                  onClick={() => handleCopy(linkedInPost, 'linkedin')}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === 'linkedin' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier le post</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 text-xs text-slate-300 font-sans whitespace-pre-wrap border border-slate-800 leading-relaxed">
                {linkedInPost}
              </pre>
            </div>

            {/* Script Vidéo Reels / TikTok */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  <h4 className="text-sm font-bold text-white">Script Vidéo Verticale Format 9:16 (Instagram Reels / TikTok / Shorts)</h4>
                </div>
                <button
                  onClick={() => handleCopy(scriptReelsTikTok, 'reels')}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === 'reels' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier le script</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 text-xs text-slate-300 font-sans whitespace-pre-wrap border border-slate-800 leading-relaxed">
                {scriptReelsTikTok}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Direct Outreach for Agency Owners */}
        {activeTab === 'outreach_email' && (
          <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Message d'approche directe (Email ou WhatsApp aux patrons d'agences)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    À copier-coller pour démarcher les agences immobilières de votre ville
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(outreachMessageWhatsApp, 'outreach')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === 'outreach' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Message copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier le message</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 text-xs text-slate-300 font-sans whitespace-pre-wrap border border-slate-800 leading-relaxed">
                {outreachMessageWhatsApp}
              </pre>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <strong className="text-emerald-400 block">Taux d'ouverture :</strong>
                  <span className="text-slate-300">Très élevé car vous parlez de leur plus grande douleur (les fiches de paie).</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <strong className="text-emerald-400 block">Offre irrésistible :</strong>
                  <span className="text-slate-300">14 jours d'essai sans carte bancaire requise.</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <strong className="text-emerald-400 block">ROI immédiat :</strong>
                  <span className="text-slate-300">79 €/mois rentabilisé en un seul dossier accepté.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Kit marketing et vidéo publicitaire prêt pour la prospection d'agences immobilières
          </span>
          <button
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
          >
            Fermer le studio
          </button>
        </div>
      </div>
    </div>
  );
};
