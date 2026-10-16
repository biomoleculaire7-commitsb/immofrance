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
  Video,
  Send,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Euro,
  Layers,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Monitor,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { AgencyProfile, DEFAULT_AGENCY_PROFILE } from '../types.ts';

interface PromoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  agencyProfile?: AgencyProfile | null;
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
    duration: 15,
    badge: 'Problème Agence',
    title: 'Vous passez encore 10 heures par semaine sur les fiches de paie ?',
    subtitle: 'Calculs manuels de solvabilité, bulletins falsifiés, périodes d\'essai masquées...',
    voiceoverFr:
      'En tant qu\'agent immobilier, vous recevez des dizaines de candidatures par jour. Calculer les 33% de solvabilité et traquer les périodes d\'essai masquées vous fait perdre un temps précieux.',
    visualDescription:
      'Animation d\'une pile de dossiers papier et bulletins de paie avec alertes et chronomètre qui tourne.',
    statsOverlay: { label: 'Temps perdu par négociateur', value: '10h / sem' },
    graphicType: 'problem',
  },
  {
    id: 2,
    duration: 16,
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
    duration: 16,
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
    duration: 15,
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
    duration: 12,
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
  agencyProfile,
}) => {
  // Safe Agency Profile with complete fallbacks
  const safeProfile = {
    name: agencyProfile?.name || DEFAULT_AGENCY_PROFILE.name,
    managerName: agencyProfile?.managerName || DEFAULT_AGENCY_PROFILE.managerName,
    siret: agencyProfile?.siret || DEFAULT_AGENCY_PROFILE.siret,
    city: agencyProfile?.city || DEFAULT_AGENCY_PROFILE.city,
    phone: agencyProfile?.phone || DEFAULT_AGENCY_PROFILE.phone,
    email: agencyProfile?.email || DEFAULT_AGENCY_PROFILE.email,
  };

  // ALL HOOKS CALLED AT TOP LEVEL UNCONDITIONALLY (React Rules of Hooks)
  const [activeTab, setActiveTab] = useState<'video_player' | 'scripts_social' | 'outreach_email' | 'objections'>('video_player');
  const [formatMode, setFormatMode] = useState<'16:9' | '9:16'>('16:9');
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true); // Default ON so the user hears voiceover immediately
  const [progress, setProgress] = useState(0); // 0 to 100 in current scene
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // References to keep speech synthesis alive & prevent Chrome garbage collection
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const keepAliveIntervalRef = useRef<any>(null);
  const transitionTimeoutRef = useRef<any>(null);
  const progressTimerRef = useRef<any>(null);
  const speechCompletedRef = useRef<boolean>(false);

  // Clean text for French Speech Synthesis to avoid stuttering or stopping on symbols like '%' or '€'
  const formatForSpeech = (rawText: string) => {
    return rawText
      .replace(/33\s*%/g, 'trente-trois pour cent')
      .replace(/3x/g, 'trois fois')
      .replace(/10h\s*\/\s*sem/gi, 'dix heures par semaine')
      .replace(/10h/gi, 'dix heures')
      .replace(/14\s*jours/gi, 'quatorze jours')
      .replace(/3\s*secondes/gi, 'trois secondes')
      .replace(/79\s*€\s*HT/gi, 'soixante-dix-neuf euros hors taxes')
      .replace(/79\s*€/gi, 'soixante-dix-neuf euros')
      .replace(/€/g, 'euros')
      .replace(/A4/g, 'A quatre')
      .replace(/CDI/g, 'C D I')
      .replace(/GLI/g, 'G L I')
      .replace(/RGPD/g, 'R G P D')
      .replace(/ALUR/g, 'Alur')
      .replace(/immoai\.fr/g, 'immo a i point f r');
  };

  const safeStopAudio = () => {
    speechCompletedRef.current = false;
    setIsVoiceSpeaking(false);
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    utteranceRef.current = null;
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {}
  };

  // Function to move to the next scene or loop/stop
  const advanceToNextScene = () => {
    safeStopAudio();
    setProgress(100);
    setTimeout(() => {
      if (currentSceneIdx < SCENES.length - 1) {
        setCurrentSceneIdx((prev) => prev + 1);
        setProgress(0);
      } else {
        setIsPlaying(false);
        setProgress(100);
      }
    }, 400);
  };

  // Video scene execution hook: coordinates audio speech & scene transition
  useEffect(() => {
    if (!isOpen) {
      safeStopAudio();
      return;
    }

    if (!isPlaying) {
      safeStopAudio();
      return;
    }

    const scene = SCENES[currentSceneIdx] || SCENES[0];
    const estimatedDurationMs = (scene.duration || 15) * 1000;
    const stepIntervalMs = 100;
    let localProgress = 0;
    setProgress(0);
    speechCompletedRef.current = false;

    // 1. If audio is enabled, launch speech synthesis with full lifecycle events
    if (isAudioEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const phoneticText = formatForSpeech(scene.voiceoverFr);
        const utterance = new SpeechSynthesisUtterance(phoneticText);
        utterance.lang = 'fr-FR';
        utterance.rate = 1.0; // Natural, clear French cadence
        utterance.pitch = 1.0;

        // Try to pick a high quality French voice if present
        const voices = window.speechSynthesis.getVoices();
        const frenchVoice = voices.find(
          (v) => v.lang.startsWith('fr') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Thomas') || v.name.includes('Amelie'))
        ) || voices.find((v) => v.lang.startsWith('fr'));
        if (frenchVoice) {
          utterance.voice = frenchVoice;
        }

        utteranceRef.current = utterance;
        setIsVoiceSpeaking(true);

        // Keep-alive timer for Chrome (Chrome stops speech after 14s if keep-alive is not triggered)
        if (keepAliveIntervalRef.current) clearInterval(keepAliveIntervalRef.current);
        keepAliveIntervalRef.current = setInterval(() => {
          if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 6000);

        // WHEN THE FULL SENTENCE HAS FINISHED SPEAKING:
        utterance.onend = () => {
          speechCompletedRef.current = true;
          setIsVoiceSpeaking(false);
          if (keepAliveIntervalRef.current) clearInterval(keepAliveIntervalRef.current);
          
          // Smooth 1.2-second pause after voice finishes to let the user absorb the message
          transitionTimeoutRef.current = setTimeout(() => {
            advanceToNextScene();
          }, 1200);
        };

        utterance.onerror = () => {
          speechCompletedRef.current = true;
          setIsVoiceSpeaking(false);
          if (keepAliveIntervalRef.current) clearInterval(keepAliveIntervalRef.current);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        setIsVoiceSpeaking(false);
      }
    }

    // 2. Smooth progress bar animation
    const progressIncrement = 100 / (estimatedDurationMs / stepIntervalMs);
    progressTimerRef.current = setInterval(() => {
      localProgress += progressIncrement;

      // If voice is speaking, cap progress bar at 94% until voiceover actually finishes
      if (isAudioEnabled && !speechCompletedRef.current) {
        if (localProgress >= 94) {
          localProgress = 94;
        }
      } else {
        if (localProgress >= 100) {
          localProgress = 100;
          if (!isAudioEnabled) {
            if (progressTimerRef.current) clearInterval(progressTimerRef.current);
            advanceToNextScene();
          }
        }
      }
      setProgress(Math.min(100, localProgress));
    }, stepIntervalMs);

    // Fallback maximum safety timeout (so video never freezes if browser speech hangs)
    const maxSafetyTimeout = setTimeout(() => {
      if (!speechCompletedRef.current) {
        advanceToNextScene();
      }
    }, estimatedDurationMs + 6000);

    return () => {
      safeStopAudio();
      clearTimeout(maxSafetyTimeout);
    };
  }, [isOpen, isPlaying, currentSceneIdx, isAudioEnabled]);

  // Clean audio on unmount or close
  useEffect(() => {
    return () => {
      safeStopAudio();
    };
  }, []);

  // Now conditional render after all hooks are initialized
  if (!isOpen) return null;

  const validIndex = Math.max(0, Math.min(currentSceneIdx, SCENES.length - 1));
  const currentScene = SCENES[validIndex] || SCENES[0];

  const handleTogglePlay = () => {
    if (!isPlaying && progress >= 100 && currentSceneIdx === SCENES.length - 1) {
      setCurrentSceneIdx(0);
      setProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    safeStopAudio();
    setCurrentSceneIdx(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleSelectScene = (idx: number) => {
    safeStopAudio();
    setCurrentSceneIdx(idx);
    setProgress(0);
  };

  const handleCopyText = (text: string, id: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    } catch (e) {}
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Pre-formatted viral copy for LinkedIn
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

  // Script Reels / TikTok
  const scriptReelsTikTok = `[SCRIPT VIDÉO VIRALE REELS / TIKTOK / SHORTS - 45 SECONDES]

🎬 PLAN 1 (0-5s) - ACCROCHE :
(Visuel : L'agent montre l'écran de son ordinateur avec 30 emails de fiches de paie)
Voix-off : « Si vous travaillez en agence immobilière, arrêtez immédiatement de calculer la solvabilité des locataires à la main. »

🎬 PLAN 2 (5-15s) - LE PROBLÈME :
(Texte dynamique à l'écran : 10h perdues par semaine)
Voix-off : « Vérifier le Net avant impôt, chercher si la période d'essai est validée, calculer si les 3x le loyer passent pour la GLI... Ça prend 25 minutes par candidat ! »

🎬 PLAN 3 (15-30s) - LA DÉMONSTRATION IMMOAI :
(Visuel : Enregistrement d'écran d'ImmoAI avec glisser-déposer de la fiche de paie)
Voix-off : « Avec ImmoAI, vous glissez la fiche de paie... et en 3 secondes chrono, l'IA extrait le salaire net, vérifie l'ancienneté et valide la conformité Garantie Loyers Impayés ! »

🎬 PLAN 4 (30-40s) - LE RAPPORT PROPRIÉTAIRE :
(Visuel : Clic sur « Générer le rapport PDF », le document certifié A4 apparaît)
Voix-off : « Et en un clic, j'exporte le rapport PDF certifié avec le logo et le SIRET de mon agence pour rassurer mon propriétaire bailleur. »

🎬 PLAN 5 (40-45s) - CALL TO ACTION :
Voix-off : « Rendez-vous sur immoai.fr pour profiter de 14 jours d'essai gratuit sans engagement ! »`;

  // Message WhatsApp / Email
  const outreachMessageWhatsApp = `Bonjour,

Je me permets de vous contacter car je sais que dans votre agence ${safeProfile.name}, la vérification des dossiers locataires prend un temps considérable à vos négociateurs.

Nous avons développé ImmoAI (https://immoai.fr), une solution d'IA dédiée aux agences immobilières françaises :
• Analyse d'une fiche de paie en 3 secondes (extraction du Net avant impôt, audit période d'essai et ratio 33% Loi ALUR).
• Un portail de dépôt en ligne pour vos annonces (SeLoger, Leboncoin).
• Génération en 1 clic d'un Rapport Propriétaire certifié A4 aux coordonnées et SIRET de votre agence.

Nous offrons actuellement 14 jours d'essai gratuit sans engagement pour tester l'outil sur vos dossiers en cours.

Seriez-vous disponible pour une rapide démonstration de 3 minutes cette semaine ?

Bien cordialement,
L'équipe ImmoAI
Site web : https://immoai.fr`;

  // Pitch téléphonique 30 secondes
  const pitchTelephone = `« Bonjour [Nom du Directeur], je vous appelle très brièvement au sujet de la gestion locative de votre agence.
Aujourd'hui, vos négociateurs passent en moyenne 25 minutes par dossier à vérifier les fiches de paie et calculer les ratios d'effort.
ImmoAI divise ce temps par 10 : notre IA lit la fiche de paie en 3 secondes, certifie l'éligibilité GLI et vous génère un rapport PDF officiel pour le bailleur.
Nous offrons 14 jours d'essai gratuit sans carte bancaire sur immoai.fr. Avez-vous 2 minutes pour tester sur un dossier réel ? »`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[95vh] animate-fadeIn">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 shrink-0">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-xl font-black text-white">
                  Studio Vidéo Démo & Kit Commercial
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  B2B Agences
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                Présentation vidéo animée interactive + Scripts et posts prêts pour réseaux sociaux
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              safeStopAudio();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-4 sm:px-6 pt-3 space-x-2 sm:space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('video_player')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'video_player'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Lecteur Vidéo Démo</span>
          </button>

          <button
            onClick={() => setActiveTab('scripts_social')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'scripts_social'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>Scripts Sociaux (LinkedIn / TikTok)</span>
          </button>

          <button
            onClick={() => setActiveTab('outreach_email')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'outreach_email'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4 text-indigo-400" />
            <span>Démarchage (Email / WhatsApp)</span>
          </button>

          <button
            onClick={() => setActiveTab('objections')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'objections'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Argumentaire Anti-Objections</span>
          </button>
        </div>

        {/* Tab 1: Video Player */}
        {activeTab === 'video_player' && (
          <div className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
            {/* Aspect Ratio Switcher */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-medium">Format d'affichage :</span>
                <button
                  onClick={() => setFormatMode('16:9')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    formatMode === '16:9'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>16:9 Paysage (PC / YouTube / LinkedIn)</span>
                </button>
                <button
                  onClick={() => setFormatMode('9:16')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    formatMode === '9:16'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>9:16 Vertical (Reels / TikTok / Shorts)</span>
                </button>
              </div>

              <div className="text-xs text-slate-400 font-mono hidden md:block">
                Scène {currentScene.id} sur {SCENES.length} • {currentScene.duration}s
              </div>
            </div>

            {/* The Animated Video Screen */}
            <div
              className={`relative mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/60 border border-slate-700 shadow-2xl p-5 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                formatMode === '9:16'
                  ? 'max-w-sm min-h-[520px] border-2 border-emerald-500/40 ring-4 ring-emerald-500/10'
                  : 'w-full min-h-[380px]'
              }`}
            >
              {/* Scene Top Badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black uppercase tracking-wider">
                    {currentScene.badge}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Scène {currentScene.id}/{SCENES.length}
                  </span>
                </div>

                {currentScene.statsOverlay && (
                  <div className="px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-right">
                    <span className="text-[10px] text-slate-400 block">{currentScene.statsOverlay.label}</span>
                    <span className="text-xs sm:text-sm font-black text-emerald-400">{currentScene.statsOverlay.value}</span>
                  </div>
                )}
              </div>

              {/* Center Animated Scene Presentation */}
              <div className="my-5 space-y-3 sm:space-y-4 text-center max-w-2xl mx-auto">
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight animate-fadeIn">
                  {currentScene.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  {currentScene.subtitle}
                </p>

                {/* Visual Simulation Card based on scene graphicType */}
                <div className="mt-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-left max-w-lg mx-auto shadow-xl">
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
                        <span>Signé numériquement pour {safeProfile.name}.</span>
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
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-center space-y-1.5">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Sous-titres & Voix-off synchronisée :
                  </span>
                  {isAudioEnabled && isPlaying && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                      <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" />
                      <span>{isVoiceSpeaking ? 'Lecture vocale en cours...' : 'Voix-off prête'}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-emerald-200 font-medium leading-relaxed">
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
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={handleTogglePlay}
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
                  onClick={() => {
                    if (currentSceneIdx > 0) {
                      handleSelectScene(currentSceneIdx - 1);
                    }
                  }}
                  disabled={currentSceneIdx === 0}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 text-xs transition cursor-pointer"
                  title="Scène précédente"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (currentSceneIdx < SCENES.length - 1) {
                      handleSelectScene(currentSceneIdx + 1);
                    }
                  }}
                  disabled={currentSceneIdx === SCENES.length - 1}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 text-xs transition cursor-pointer"
                  title="Scène suivante"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                  className={`p-2.5 rounded-xl text-xs transition cursor-pointer ${
                    !isAudioEnabled
                      ? 'bg-slate-800 text-slate-400 hover:text-white'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                  title={isAudioEnabled ? 'Désactiver la voix-off' : 'Activer la voix-off en français'}
                >
                  {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>

              {/* Timeline Scene Selector */}
              <div className="flex items-center space-x-1.5 overflow-x-auto">
                {SCENES.map((scene, idx) => (
                  <button
                    key={scene.id}
                    onClick={() => handleSelectScene(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
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
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Astuce d'enregistrement :</strong> Lancez ce lecteur et enregistrez votre écran en 1080p avec votre smartphone ou un outil de capture (Windows : Win+Alt+R, Mac : Cmd+Maj+5, ou Loom/OBS) pour publier directement la vidéo sur vos réseaux sociaux !
                </span>
              </div>
              <button
                onClick={() =>
                  handleCopyText(
                    SCENES.map((s) => `[SCÈNE ${s.id} - ${s.badge}]\n${s.voiceoverFr}`).join('\n\n'),
                    'all_script'
                  )
                }
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
          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[75vh]">
            {/* Post LinkedIn B2B */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <h4 className="text-sm font-bold text-white">Post LinkedIn Pro (Ciblage : Directeurs d'Agences & Négociateurs)</h4>
                </div>
                <button
                  onClick={() => handleCopyText(linkedInPost, 'linkedin')}
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
                  onClick={() => handleCopyText(scriptReelsTikTok, 'reels')}
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
          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[75vh]">
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Message d'approche directe (Email ou WhatsApp aux patrons d'agences)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    À copier-coller pour démarcher les agences immobilières de votre ville
                  </p>
                </div>
                <button
                  onClick={() => handleCopyText(outreachMessageWhatsApp, 'outreach')}
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
            </div>

            {/* Pitch téléphonique */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Pitch Téléphonique Rapide (30 secondes chrono)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pour appeler les agences locales et obtenir un test sans friction
                  </p>
                </div>
                <button
                  onClick={() => handleCopyText(pitchTelephone, 'pitch')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === 'pitch' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Pitch copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier le pitch</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 text-xs text-slate-300 font-sans whitespace-pre-wrap border border-slate-800 leading-relaxed">
                {pitchTelephone}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 4: Anti-Objections Argumentaire */}
        {activeTab === 'objections' && (
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[75vh]">
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-xs">Objection 1</span>
                  « Nos négociateurs ont l'habitude de calculer sur Excel ou à la main »
                </h4>
                <p className="text-xs text-emerald-300 mt-2 font-medium">
                  <strong>Réponse gagnante :</strong> Sur Excel, vos négociateurs passent 25 min par candidat et font des erreurs sur le Net Fiscal ou les primes non récurrentes. ImmoAI analyse le document en 3 secondes, détecte si le CDI est encore en période d'essai et sécurise 100% de la prise en charge par la Garantie Loyers Impayés (GLI).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-xs">Objection 2</span>
                  « Les candidats ne voudront pas utiliser un portail en ligne »
                </h4>
                <p className="text-xs text-emerald-300 mt-2 font-medium">
                  <strong>Réponse gagnante :</strong> Au contraire ! Les locataires déposent leurs pièces depuis leur smartphone en 2 minutes sans envoyer de mails volumineux. Ils reçoivent un accusé de réception immédiat et votre boîte de réception d'agence reste parfaitement propre.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-xs">Objection 3</span>
                  « Est-ce que le rapport est reconnu par nos propriétaires bailleurs ? »
                </h4>
                <p className="text-xs text-emerald-300 mt-2 font-medium">
                  <strong>Réponse gagnante :</strong> Oui, le rapport A4 est certifié avec votre numéro SIRET, votre Carte Professionnelle (CPI), le détail des 3 derniers bulletins et le calcul certifié de solvabilité. Les propriétaires bailleurs adorent cette transparence institutionnelle.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-xs">Objection 4</span>
                  « Pourquoi payer 79 € HT / mois ? »
                </h4>
                <p className="text-xs text-emerald-300 mt-2 font-medium">
                  <strong>Réponse gagnante :</strong> 79 € représente moins d'une heure de travail d'un négociateur. Si l'outil fait gagner 10 heures par semaine à l'équipe et évite un seul sinistre d'impayé (coût moyen : 8 000 €), le retour sur investissement est immédiat dès le premier mois.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 hidden sm:inline">
            Kit marketing et vidéo publicitaire prêt pour la prospection d'agences immobilières
          </span>
          <button
            onClick={() => {
              safeStopAudio();
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer ml-auto"
          >
            Fermer le studio
          </button>
        </div>
      </div>
    </div>
  );
};
