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
  MapPin,
  ExternalLink,
  Globe,
  Search,
  Mail,
  Phone,
  MessageCircle,
  Eye,
  Download,
  Square,
  CircleDot,
  Film,
  AlertCircle,
} from 'lucide-react';
import { AgencyProfile, DEFAULT_AGENCY_PROFILE } from '../types.ts';

interface PromoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  agencyProfile?: AgencyProfile | null;
  onOpenVisitorTracker?: () => void;
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
    subtitle: 'Sans engagement. 79 € HT / mois seulement. Testez dès aujourd\'hui via le lien de la plateforme.',
    voiceoverFr:
      'Rejoignez les agences qui automatisent leur gestion locative. Testez gratuitement ImmoAI pendant quatorze jours sans engagement : le lien direct de la plateforme est accessible sous cette vidéo et en description.',
    visualDescription:
      'Écran final avec tarif clair, bouton d\'essai gratuit 14 jours et lien direct de la plateforme bien visible.',
    statsOverlay: { label: 'Période d\'essai', value: '14 jours offerts' },
    graphicType: 'offer',
  },
];

export const PromoVideoModal: React.FC<PromoVideoModalProps> = ({
  isOpen,
  onClose,
  agencyProfile,
  onOpenVisitorTracker,
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
  const [activeTab, setActiveTab] = useState<'video_player' | 'scripts_social' | 'outreach_email' | 'objections' | 'targets_annuaire'>('video_player');
  const [formatMode, setFormatMode] = useState<'16:9' | '9:16'>('16:9');
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true); // Default ON so the user hears voiceover immediately
  const [progress, setProgress] = useState(0); // 0 to 100 in current scene
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [recipientAgencyName, setRecipientAgencyName] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [customEmailMessage, setCustomEmailMessage] = useState<string>('');

  // Live Platform URL displayed on video and outreach links
  const [displayedPlatformUrl, setDisplayedPlatformUrl] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('immoai_custom_platform_url');
        if (saved) return saved;
        return window.location.origin;
      }
    } catch (e) {}
    return 'https://immoai.fr';
  });

  const displayedPlatformHost = (() => {
    try {
      const parsed = new URL(displayedPlatformUrl);
      return parsed.host;
    } catch (e) {
      return displayedPlatformUrl.replace(/^https?:\/\//, '');
    }
  })();

  // Video Recording & Export state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [recordedFilename, setRecordedFilename] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

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

  const handleStopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch (e) {}

    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    } catch (e) {}

    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const handleStartRecording = async () => {
    try {
      setRecordingError(null);
      if (typeof window === 'undefined' || !navigator?.mediaDevices?.getDisplayMedia) {
        setRecordingError("L'enregistrement direct nécessite un navigateur comme Chrome, Edge ou Safari sur ordinateur. Sur mobile, utilisez l'enregistreur d'écran natif.");
        return;
      }

      // Prompt screen / window / tab capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser' as any,
        },
        audio: true,
      });

      mediaStreamRef.current = stream;
      recordedChunksRef.current = [];

      let mimeType = 'video/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          mimeType = 'video/webm;codecs=vp9';
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/webm';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4';
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        setIsRecording(false);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }

        // Release media tracks
        stream.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;

        if (recordedChunksRef.current.length > 0) {
          const blob = new Blob(recordedChunksRef.current, { type: mimeType });
          const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
          const filename = formatMode === '9:16' ? `immoai-tiktok-reels-9-16.${ext}` : `immoai-linkedin-demo-16-9.${ext}`;
          setRecordedFilename(filename);
          const url = URL.createObjectURL(blob);
          setRecordedBlobUrl(url);

          // Auto trigger download
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      };

      // Handle user pressing native "Stop sharing" button in browser
      if (stream.getVideoTracks()[0]) {
        stream.getVideoTracks()[0].onended = () => {
          handleStopRecording();
        };
      }

      recorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Auto start video playback from scene 0 with audio voiceover
      safeStopAudio();
      setCurrentSceneIdx(0);
      setProgress(0);
      setIsAudioEnabled(true);
      setIsPlaying(true);
    } catch (err: any) {
      if (err?.name !== 'NotAllowedError') {
        setRecordingError("L'autorisation d'enregistrement a été refusée ou annulée.");
      }
      setIsRecording(false);
    }
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
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          handleStopRecording();
        }
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
👉 ${displayedPlatformUrl}

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
Voix-off : « Rendez-vous sur le lien de la plateforme en bio (${displayedPlatformHost}) pour profiter de 14 jours d'essai gratuit sans engagement ! »`;

  // Message WhatsApp / Email
  const currentOrigin = displayedPlatformUrl;
  const cleanAgency = recipientAgencyName.trim();
  const outreachLink = cleanAgency
    ? `${currentOrigin}/?ref=outreach&agency=${encodeURIComponent(cleanAgency)}`
    : `${currentOrigin}/?ref=outreach`;

  const defaultOutreachMessage = `Bonjour,

Je me permets de vous contacter car je sais que dans votre cabinet ${cleanAgency || 'immobilier'}, la vérification des dossiers locataires prend un temps considérable à vos négociateurs.

Nous avons développé ImmoAI (${currentOrigin}), une solution d'intelligence artificielle dédiée aux agences immobilières françaises :
• Analyse d'une fiche de paie en 3 secondes (extraction du Net avant impôt, audit période d'essai et ratio 33% Loi ALUR).
• Un portail de dépôt en ligne sécurisé pour vos annonces (SeLoger, Leboncoin).
• Génération en 1 clic d'un Rapport Propriétaire certifié A4 aux coordonnées et SIRET de votre agence.

Nous offrons actuellement 14 jours d'essai gratuit sans engagement pour tester l'outil sur vos dossiers en cours :
👉 Découvrir la plateforme et tester un dossier : ${outreachLink}

Seriez-vous disponible pour une rapide démonstration de 3 minutes cette semaine ?

Bien cordialement,
L'équipe ImmoAI
Site web : ${outreachLink}`;

  const effectiveEmailMessage = customEmailMessage || defaultOutreachMessage;

  const handleOpenGmail = () => {
    const subject = encodeURIComponent("Gain de 10h/semaine sur la gestion locative de votre agence");
    const body = encodeURIComponent(effectiveEmailMessage);
    const to = encodeURIComponent(recipientEmail.trim());
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`, '_blank');
  };

  const handleOpenMailto = () => {
    const subject = encodeURIComponent("Gain de 10h/semaine sur la gestion locative de votre agence");
    const body = encodeURIComponent(effectiveEmailMessage);
    const to = encodeURIComponent(recipientEmail.trim());
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(effectiveEmailMessage);
    const cleanPhone = recipientPhone.replace(/[^0-9]/g, '');
    if (cleanPhone) {
      window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${text}`, '_blank');
    } else {
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  // Pitch téléphonique 30 secondes
  const pitchTelephone = `« Bonjour [Nom du Directeur], je vous appelle très brièvement au sujet de la gestion locative de votre agence.
Aujourd'hui, vos négociateurs passent en moyenne 25 minutes par dossier à vérifier les fiches de paie et calculer les ratios d'effort.
ImmoAI divise ce temps par 10 : notre IA lit la fiche de paie en 3 secondes, certifie l'éligibilité GLI et vous génère un rapport PDF officiel pour le bailleur.
Nous offrons 14 jours d'essai gratuit sans carte bancaire sur notre plateforme (${displayedPlatformHost}). Avez-vous 2 minutes pour tester sur un dossier réel ? »`;

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
            <span>1. Vidéo Démo & Téléchargement (1-Clic)</span>
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
            <span>2. Scripts Sociaux (LinkedIn/TikTok)</span>
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
            <span>3. Envoyer des Emails (Démarchage)</span>
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
            <span>4. Anti-Objections</span>
          </button>

          <button
            onClick={() => setActiveTab('targets_annuaire')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'targets_annuaire'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4 text-rose-400" />
            <span>5. Annuaire & Adresses d'Agences</span>
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

            {/* Live Platform URL Bar */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-slate-300 whitespace-nowrap">Lien réel de la plateforme :</span>
                <input
                  type="text"
                  value={displayedPlatformUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDisplayedPlatformUrl(val);
                    try {
                      localStorage.setItem('immoai_custom_platform_url', val);
                    } catch (err) {}
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-emerald-300 font-mono text-xs w-full max-w-md focus:outline-none focus:border-emerald-500"
                  placeholder="https://votre-domaine.com"
                />
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => {
                    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://immoai.fr';
                    setDisplayedPlatformUrl(origin);
                    try {
                      localStorage.setItem('immoai_custom_platform_url', origin);
                    } catch (err) {}
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition cursor-pointer"
                  title="Détecter automatiquement l'adresse web actuelle de cette session"
                >
                  Détecter automatiquement
                </button>
                <button
                  onClick={() => handleCopyText(displayedPlatformUrl, 'copy_platform_url')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === 'copy_platform_url' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copié !</span>
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
                      <div className="min-w-0 flex-1">
                        <strong className="text-white block">Lien public personnalisé pour l'agence :</strong>
                        <span className="font-mono text-emerald-300 text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-emerald-500/30 truncate block">
                          {displayedPlatformUrl}/?tab=candidate-portal
                        </span>
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
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="text-xs text-emerald-400 font-bold uppercase block">Offre Découverte Agence</span>
                          <strong className="text-white text-base">14 Jours Offerts</strong>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs">
                          Sans engagement
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs">
                        <span className="text-slate-400 text-[11px]">Lien direct de la plateforme :</span>
                        <span className="font-mono text-emerald-300 font-bold text-xs bg-slate-950 px-2.5 py-1 rounded-lg border border-emerald-500/30 truncate max-w-full">
                          {displayedPlatformUrl}
                        </span>
                      </div>
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
              <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={handleTogglePlay}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center space-x-2 cursor-pointer shadow-lg shadow-emerald-500/20"
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

                {/* Direct 1-Click Screen Recorder & Video Downloader */}
                {isRecording ? (
                  <button
                    onClick={handleStopRecording}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition flex items-center space-x-2 cursor-pointer animate-pulse ring-4 ring-red-500/30 shadow-lg shadow-red-600/30"
                    title="Arrêter l'enregistrement et télécharger la vidéo"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>Arrêter & Télécharger ({Math.floor(recordingSeconds / 60)}:{('0' + (recordingSeconds % 60)).slice(-2)})</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartRecording}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs transition flex items-center space-x-2 cursor-pointer shadow-lg shadow-red-500/25"
                    title="Enregistrer l'écran et télécharger le fichier vidéo prêt pour TikTok / LinkedIn"
                  >
                    <CircleDot className="w-4 h-4 text-white animate-pulse" />
                    <span>Enregistrer & Télécharger (.webm)</span>
                  </button>
                )}

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
              <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full">
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

            {/* Recording Feedback / Download Ready Banner */}
            {recordedBlobUrl && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
                <div className="flex items-center space-x-3 text-left">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Vidéo enregistrée et prête à être envoyée !
                    </span>
                    <span className="text-[11px] text-emerald-300 font-mono">
                      Fichier : {recordedFilename}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={recordedBlobUrl}
                    download={recordedFilename}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger à nouveau</span>
                  </a>
                  <button
                    onClick={() => setActiveTab('scripts_social')}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Voir textes LinkedIn / TikTok</span>
                  </button>
                </div>
              </div>
            )}

            {/* Recording Error Alert */}
            {recordingError && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{recordingError}</span>
              </div>
            )}

            {/* Complete Guide to Export for TikTok & LinkedIn */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: TikTok / Reels */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-pink-500/30 hover:border-pink-500/50 transition space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-pink-500 animate-pulse" />
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-pink-400" />
                      <span>Pour TikTok / Instagram Reels (9:16)</span>
                    </h4>
                  </div>
                  <button
                    onClick={() => setFormatMode('9:16')}
                    className="px-2.5 py-1 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/40 text-[11px] font-bold hover:bg-pink-500/30 cursor-pointer transition"
                  >
                    Activer 9:16
                  </button>
                </div>

                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    Cliquez sur <strong>"9:16 Vertical"</strong> ci-dessus pour adapter l'affichage aux téléphones.
                  </li>
                  <li>
                    <strong>Depuis votre smartphone :</strong> Ouvrez le site, lancez l'enregistrement d'écran intégré (iPhone : Balayer vers le bas &gt; Enregistreur d'écran / Android : Volet rapide &gt; Enregistrement écran) avec le son activé.
                  </li>
                  <li>
                    <strong>Ou depuis ce PC :</strong> Cliquez sur le bouton rouge <em>"Enregistrer & Télécharger"</em>, la vidéo 9:16 se télécharge directement.
                  </li>
                </ol>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(scriptReelsTikTok, 'copy_tiktok_guide')}
                    className="w-full py-2 rounded-xl bg-pink-600/30 hover:bg-pink-600/50 border border-pink-500/40 text-pink-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === 'copy_tiktok_guide' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-pink-300" />
                        <span>Description TikTok copiée !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier la description TikTok & #hashtags</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Card 2: LinkedIn Pro */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-blue-500/30 hover:border-blue-500/50 transition space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <Monitor className="w-4 h-4 text-blue-400" />
                      <span>Pour LinkedIn & YouTube (16:9)</span>
                    </h4>
                  </div>
                  <button
                    onClick={() => setFormatMode('16:9')}
                    className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[11px] font-bold hover:bg-blue-500/30 cursor-pointer transition"
                  >
                    Activer 16:9
                  </button>
                </div>

                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    Restez en format <strong>16:9 Paysage</strong> (format horizontal professionnel idéal pour PC).
                  </li>
                  <li>
                    Cliquez sur <strong>"Enregistrer & Télécharger (.webm)"</strong>. Choisissez cet onglet. La démo joue les 5 scènes avec voix-off et se télécharge toute seule !
                  </li>
                  <li>
                    Sur LinkedIn, créez un nouveau post, joignez le fichier vidéo téléchargé, et collez le post pré-rédigé.
                  </li>
                </ol>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(linkedInPost, 'copy_linkedin_guide')}
                    className="w-full py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === 'copy_linkedin_guide' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-300" />
                        <span>Post LinkedIn copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier le post LinkedIn optimisé</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Instruction shortcuts */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Raccourcis rapides d'enregistrement d'écran :</strong> Windows : <code className="text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">Touche Windows + Alt + R</code> • Mac : <code className="text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">Cmd + Maj + 5</code>
                </span>
              </div>
              <button
                onClick={() =>
                  handleCopyText(
                    SCENES.map((s) => `[SCÈNE ${s.id} - ${s.badge}]\n${s.voiceoverFr}`).join('\n\n'),
                    'all_script'
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer text-xs"
              >
                {copiedId === 'all_script' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Script complet copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le script audio complet</span>
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

              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-slate-400">Format recommandé : 16:9 Paysage</span>
                <button
                  onClick={() => {
                    setFormatMode('16:9');
                    setActiveTab('video_player');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Lancer la démo en 16:9 (LinkedIn)</span>
                </button>
              </div>
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

              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-slate-400">Format recommandé : 9:16 Vertical</span>
                <button
                  onClick={() => {
                    setFormatMode('9:16');
                    setActiveTab('video_player');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-pink-600/30 hover:bg-pink-600/50 text-pink-200 border border-pink-500/40 font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Lancer la démo en 9:16 (TikTok)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Direct Outreach for Agency Owners */}
        {activeTab === 'outreach_email' && (
          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[75vh]">
            {/* Live Visitor Tracker Banner */}
            {onOpenVisitorTracker && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-slate-900 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-indigo-950/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-white">
                        Suivi des Visites des 20 Agences en Direct
                      </h4>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Actif
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Découvrez en temps réel si les directeurs ou négociateurs des agences ont cliqué sur votre message !
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    safeStopAudio();
                    onClose();
                    onOpenVisitorTracker();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-indigo-600/30 shrink-0"
                >
                  <Eye className="w-4 h-4" />
                  <span>Voir le Journal des Visites</span>
                </button>
              </div>
            )}

            {/* Guide d'utilisation clair */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 space-y-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <h4 className="font-bold text-white text-sm">
                  Comment envoyer votre message ? (Envoi Direct en 1 Clic)
                </h4>
              </div>
              <p className="leading-relaxed text-slate-300">
                Vous n'avez pas besoin de chercher où coller votre message : renseignez simplement l'adresse email de l'agence ci-dessous et cliquez sur <strong>« Ouvrir avec Gmail »</strong> ou <strong>« WhatsApp »</strong>. Votre messagerie s'ouvre automatiquement avec le destinataire, l'objet, le texte complet et votre lien déjà insérés !
              </p>
            </div>

            {/* Boîte d'Envoi Direct & Personnalisation */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-sm font-bold text-white">
                    Console d'Envoi Direct aux Agences
                  </h4>
                </div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-bold border border-indigo-500/30">
                  Prêt à l'envoi
                </span>
              </div>

              {/* Form Inputs for quick dispatch */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Email de l'agence destinataire :
                  </label>
                  <input
                    type="email"
                    placeholder="ex: contact@agence-paris.fr"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Nom de l'agence (pour personnaliser) :
                  </label>
                  <input
                    type="text"
                    placeholder="ex: ORPI Paris 11ème, Century 21..."
                    value={recipientAgencyName}
                    onChange={(e) => setRecipientAgencyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    WhatsApp de l'agent (Optionnel) :
                  </label>
                  <input
                    type="tel"
                    placeholder="ex: +33 6 12 34 56 78"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              {/* Action Buttons: Gmail, Mailto, WhatsApp, Copy */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={handleOpenGmail}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 transition cursor-pointer"
                  title="Ouvre directement la boîte de rédaction Gmail avec le message déjà rédigé"
                >
                  <Mail className="w-4 h-4" />
                  <span>🚀 Ouvrir et Envoyer avec Gmail</span>
                </button>

                <button
                  onClick={handleOpenMailto}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
                  title="Ouvre votre application de messagerie par défaut (Outlook, Apple Mail...)"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ouvrir avec Outlook / Mail</span>
                </button>

                <button
                  onClick={handleOpenWhatsApp}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-600/20"
                  title="Envoyer le message sur WhatsApp Web"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>💬 Envoyer sur WhatsApp</span>
                </button>

                <button
                  onClick={() => handleCopyText(effectiveEmailMessage, 'custom_outreach')}
                  className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  {copiedId === 'custom_outreach' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Texte copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier le texte</span>
                    </>
                  )}
                </button>
              </div>

              {/* Editable Textarea */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-400">
                    Texte du message (vous pouvez le modifier ou le coller ici si besoin) :
                  </label>
                  {customEmailMessage && (
                    <button
                      onClick={() => setCustomEmailMessage('')}
                      className="text-[10px] text-slate-500 hover:text-emerald-400 underline cursor-pointer"
                    >
                      Rétablir le modèle par défaut
                    </button>
                  )}
                </div>
                <textarea
                  rows={10}
                  value={effectiveEmailMessage}
                  onChange={(e) => setCustomEmailMessage(e.target.value)}
                  className="w-full p-4 rounded-xl bg-slate-950 text-xs text-slate-200 font-sans border border-slate-800 leading-relaxed focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            {/* Pitch téléphonique */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Pitch Téléphonique Rapide (30 secondes chrono)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pour appeler les agences locales et leur proposer d'essayer l'outil
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

        {/* Tab 5: Où Envoyer & Annuaire Agences */}
        {activeTab === 'targets_annuaire' && (
          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[75vh]">
            {/* Section 1: Les deux liens à envoyer */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5 space-y-4">
              <div className="flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  1. Quels liens envoyer et à qui ?
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lien B2B Agences */}
                <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                      Pour les Directeurs d'Agences (B2B)
                    </span>
                    <button
                      onClick={() => handleCopyText(window.location.origin, 'b2b_link')}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                    >
                      {copiedId === 'b2b_link' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-300">
                    Permet aux agences de tester le scanner IA, de voir la démo et d'activer leurs 14 jours d'essai gratuit.
                  </p>
                  <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-emerald-300 break-all border border-slate-800">
                    {window.location.origin}
                  </div>
                </div>

                {/* Lien Candidat B2C */}
                <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                      Pour les Candidats Locataires (Portail)
                    </span>
                    <button
                      onClick={() => handleCopyText(`${window.location.origin}/?tab=candidate-portal`, 'portal_link')}
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                    >
                      {copiedId === 'portal_link' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-300">
                    À insérer dans vos annonces <strong>SeLoger, Leboncoin, PAP</strong> pour que les candidats déposent leurs dossiers en ligne.
                  </p>
                  <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-indigo-300 break-all border border-slate-800">
                    {window.location.origin}/?tab=candidate-portal
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Villes & Recherche Google Maps Directe */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5 space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    2. Où trouver les adresses d'agences ? (Recherche par Ville)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cliquez sur une ville pour ouvrir Google Maps avec la liste des agences de gestion locative, leurs emails et numéros de téléphone :
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { name: 'Paris (75)', count: '4 500+ agences', query: 'Paris' },
                  { name: 'Lyon (69)', count: '1 200+ agences', query: 'Lyon' },
                  { name: 'Marseille (13)', count: '1 100+ agences', query: 'Marseille' },
                  { name: 'Bordeaux (33)', count: '850+ agences', query: 'Bordeaux' },
                  { name: 'Toulouse (31)', count: '750+ agences', query: 'Toulouse' },
                  { name: 'Lille (59)', count: '650+ agences', query: 'Lille' },
                  { name: 'Nantes (44)', count: '600+ agences', query: 'Nantes' },
                  { name: 'Nice (06)', count: '700+ agences', query: 'Nice' },
                ].map((city) => (
                  <a
                    key={city.name}
                    href={`https://www.google.com/maps/search/agence+immobiliere+gestion+locative+${encodeURIComponent(city.query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500/50 transition block group text-left cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                        {city.name}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition" />
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{city.count}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Section 3: Les Grands Réseaux d'Agences en France */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5 space-y-4">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    3. Les grands réseaux d'agences à contacter en priorité
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ce sont les réseaux qui gèrent le plus grand volume de locations en France :
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    name: 'ORPI',
                    stat: '1 350 agences en France',
                    desc: 'Premier réseau coopératif de France. Chaque agence est indépendante et décide de ses logiciels.',
                    url: 'https://www.orpi.com/agences-immobilieres/',
                  },
                  {
                    name: 'Century 21 France',
                    stat: '950 agences en France',
                    desc: 'Très fort volume locatif avec des équipes de négociateurs dédiés à la gestion.',
                    url: 'https://www.century21.fr/agences/',
                  },
                  {
                    name: 'Foncia',
                    stat: '500 cabinets de gestion',
                    desc: 'Numéro 1 de la gestion locative et du syndic en France. Cherche constamment à automatiser les fiches de paie.',
                    url: 'https://fr.foncia.com/agence-immobiliere',
                  },
                  {
                    name: 'Laforêt Immobilier',
                    stat: '700 agences en France',
                    desc: 'Réseau très orienté numérique et gain de temps pour les agents.',
                    url: 'https://www.laforet.com/agence-immobiliere',
                  },
                  {
                    name: 'Guy Hoquet l\'Immobilier',
                    stat: '580 agences en France',
                    desc: 'Garantie sur les délais de relocation et exigence forte sur la solvabilité.',
                    url: 'https://www.guy-hoquet.com/agences',
                  },
                  {
                    name: 'Citya Immobilier',
                    stat: '250 agences de gestion',
                    desc: 'Spécialiste historique de la gestion de patrimoine et de la garantie loyers impayés.',
                    url: 'https://www.citya.com/agences-immobilieres',
                  },
                ].map((network) => (
                  <div key={network.name} className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <strong className="text-white text-xs font-bold">{network.name}</strong>
                        <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                          {network.stat}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {network.desc}
                      </p>
                    </div>
                    <a
                      href={network.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shrink-0"
                      title="Voir les agences du réseau"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Méthode d'Envoi Pas-à-Pas (Routine 20 contacts / jour) */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5 space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  4. Méthode pas-à-pas : Comment envoyer et obtenir des réponses
                </h3>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    <strong className="text-white block font-bold">Ouvrez Google Maps ou PagesJaunes sur votre ville :</strong>
                    <span>Tapez « agence immobiliere gestion locative [Ville] ». Vous obtenez 50 à 100 agences avec leur adresse et leur email (ex: contact@agence-paris.fr ou location@...).</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    <strong className="text-white block font-bold">Copiez le message d'approche (Onglet 3) :</strong>
                    <span>Allez dans l'onglet « Démarchage (Email / WhatsApp) », cliquez sur « Copier le message » et collez-le dans votre messagerie avec le lien de la plateforme.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <div>
                    <strong className="text-white block font-bold">Contactez sur LinkedIn les Directeurs d'Agence :</strong>
                    <span>Cherchez « Directeur agence immobilière » + [Ville]. Envoyez une demande de connexion avec une courte note : « Bonjour [Nom], nous avons créé une IA qui qualifie les fiches de paie en 3s pour vos dossiers locataires. Voici le lien pour tester gratuitement : {window.location.origin} ».</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    4
                  </span>
                  <div>
                    <strong className="text-white block font-bold">Publiez sur vos réseaux sociaux (LinkedIn / Instagram) :</strong>
                    <span>Utilisez le post LinkedIn préparé dans l'onglet « Scripts Sociaux » et joignez la vidéo enregistrée avec le lecteur vidéo démo !</span>
                  </div>
                </div>
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
