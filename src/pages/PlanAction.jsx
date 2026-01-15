import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import DayCard from '@/components/plan/DayCard';
import ChatBubble from '@/components/chat/ChatBubble';
import {
  Loader2,
  Target,
  Sparkles,
  Users,
  BarChart3,
  MessageSquare,
  FileText,
  Mail,
  Share2
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';

export default function PlanAction() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user } = useRequireAuth();
  const [profile, setProfile] = useState(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [dayProgress, setDayProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (user && user.email) {
      // Petit délai pour être sûr que Base44 est prêt
      const timer = setTimeout(() => {
        checkAccess();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const checkAccess = async () => {
    // 🔥 P0-3: Guard paywall (réactivé en prod)
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser.has_purchased) {
        navigate(createPageUrl('CTAPAYWALL'));
        return;
      }
      loadData();
    } catch (error) {
      console.error('Error checking access:', error);
      navigate(createPageUrl('CTAPAYWALL'));
    }
  };

  const loadData = async () => {
    setIsLoading(true); // On affiche le chargement
    try {
      // On récupère le profil
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });

      if (profiles.length > 0) {
        const userProfile = profiles[0];
        setProfile(userProfile);

        // --- FIX ICI : Gestion robuste du JSON ---
        let savedProgress = userProfile.plan_7days_progress;

        console.log("🔍 DEBUT DEBUG - Type de plan_7days_progress:", typeof savedProgress);
        console.log("🔍 DEBUT DEBUG - Valeur brute:", savedProgress);

        // 🆕 SI LE CHAMP N'EXISTE PAS (undefined), on l'initialise en base
        if (savedProgress === undefined || savedProgress === null) {
          console.log("⚠️ Le champ plan_7days_progress n'existe pas, initialisation en base...");
          savedProgress = {};

          // On initialise le champ en base pour les prochaines fois
          try {
            await base44.entities.UserProfile.update(userProfile.id, {
              plan_7days_progress: JSON.stringify({})
            });
            console.log("✅ Champ plan_7days_progress initialisé en base");
          } catch (error) {
            console.error("❌ Erreur lors de l'initialisation du champ:", error);
          }
        }
        // Si la base renvoie une string (ex: "{...}"), on la convertit en Objet
        else if (typeof savedProgress === "string") {
          try {
            savedProgress = JSON.parse(savedProgress);
            console.log("✅ JSON parsé avec succès:", savedProgress);
          } catch (e) {
            console.error("❌ Erreur de parsing JSON", e);
            savedProgress = {};
          }
        }

        console.log("📥 Progression chargée FINALE:", savedProgress); // Pour vérifier dans la console IDX

        setDayProgress(savedProgress);

        // Recalcul du jour actuel basé sur la sauvegarde
        const completedDays = Object.keys(savedProgress).filter(
          key => savedProgress[key].completed
        ).length;

        // On force au moins le jour 1, ou le jour suivant
        setCurrentDay(Math.min(completedDays + 1, 7));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChecklistChange = async (day, itemIndex) => {
    // 1. SÉCURITÉ : Vérifions qu'on a bien l'ID
    if (!profile?.id) {
      console.error("⛔ ERREUR GRAVE : Aucun profil chargé, impossible de sauvegarder");
      return;
    }

    console.log("💾 Tentative de sauvegarde pour le profil ID:", profile.id);

    // 2. On met à jour l'état local (UI)
    // ✅ FIX: Toujours utiliser getDayChecklist qui merge correctement les données sauvegardées
    const currentList = getDayChecklist(day);

    const newChecklist = currentList.map((item, idx) =>
      idx === itemIndex ? { ...item, checked: !item.checked } : item
    );

    const newProgress = {
      ...dayProgress,
      [day]: {
        ...(dayProgress[day] || {}),
        checklist: newChecklist,
        updatedAt: new Date().toISOString()
      }
    };

    setDayProgress(newProgress);

    // 3. SAUVEGARDE : On convertit l'objet en Texte (JSON.stringify)
    try {
      // ⚠️ LE CHANGEMENT EST ICI : JSON.stringify()
      // On s'assure que la base reçoit une string, pas un objet JS complexe
      const dataToSave = JSON.stringify(newProgress);

      await base44.entities.UserProfile.update(profile.id, {
        plan_7days_progress: dataToSave
      });
      console.log("✅ Sauvegardé en base avec succès !");
    } catch (error) {
      console.error("❌ ÉCHEC de la sauvegarde Base44 :", error);
      alert("Attention : Votre progression n'a pas pu être sauvegardée. Vérifiez votre connexion.");
    }
  };

  const handleDayComplete = async (day) => {
    if (!profile?.id) {
      console.error("⛔ ERREUR : Aucun profil chargé");
      return;
    }

    const newProgress = {
      ...dayProgress,
      [day]: {
        ...(dayProgress[day] || {}),
        completed: true,
        completedAt: new Date().toISOString()
      }
    };

    setDayProgress(newProgress);
    setCurrentDay(Math.min(day + 1, 7));

    // Sauvegarder en base
    try {
      await base44.entities.UserProfile.update(profile.id, {
        plan_7days_progress: JSON.stringify(newProgress)
      });
      console.log("✅ Jour complété et sauvegardé !");
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde de la complétion du jour:", error);
    }
  };

  const getDayChecklist = (day) => {
    // Default checklists
    const defaults = {
      1: [
        {
          text: "Ajouter ma photo de profil dans Passion IA",
          checked: false,
          details: "Vous retrouverez cela dans les paramètres de l'application.",
          action: { type: "link", label: "Aller aux paramètres", page: "Settings" }
        },
        {
          text: "Rejoindre la communauté Skool",
          checked: false,
          details: "Rejoignez notre communauté pour échanger avec d'autres membres et obtenir du soutien.",
          action: { type: "external", label: "Cliquer ici pour rejoindre", url: "https://www.skool.com/ia-pour-tous-6043/about?ref=8a2dca11af9048e6940087b263136daa" }
        },
        {
          text: "Me présenter dans la communauté",
          checked: false,
          details: "Présentez-vous aux autres membres : qui vous êtes, ce que vous voulez vendre, quels sont vos objectifs. N'hésitez pas à faire une vidéo dans la communauté !"
        },
        {
          text: "Générer mon analyse de marché",
          checked: false,
          details: "L'analyse de marché vous aide à comprendre votre positionnement et valider la demande.",
          action: { type: "link", label: "Cliquer ici pour générer votre analyse de marché", page: "MarketAnalysis" }
        },
        {
          text: "Générer mes avatars clients",
          checked: false,
          details: "Définissez précisément qui sont vos clients idéaux pour mieux les adresser.",
          action: { type: "link", label: "Cliquer ici pour générer vos avatars clients", page: "AvatarClients" }
        },
        {
          text: "Générer mes offres (produits & prix)",
          checked: false,
          details: "Créez votre gamme d'offres avec des prix cohérents et attractifs.",
          action: { type: "link", label: "Cliquer ici pour générer vos offres", page: "MyOffers" }
        },
        {
          text: "Générer ma page de vente",
          checked: false,
          details: "Une page de vente professionnelle pour présenter votre offre de manière convaincante.",
          action: { type: "link", label: "Cliquer ici pour générer votre page de vente", page: "SalesPage" }
        },
        {
          text: "Générer mes messages de vente",
          checked: false,
          details: "Des messages prêts à l'emploi pour approcher vos prospects avec confiance.",
          action: { type: "link", label: "Cliquer ici pour générer vos messages de vente", page: "SalesMessages" }
        },
        {
          text: "Générer mes emails marketing",
          checked: false,
          details: "Une séquence d'emails automatiques pour nurture vos prospects.",
          action: { type: "link", label: "Cliquer ici pour générer vos emails marketing", page: "EmailsMarketing" }
        }
      ],
      2: [
        {
          text: "Identifier où se trouve mon avatar (réseaux / groupes)",
          checked: false,
          details: "Exemples : groupes Facebook de niche, forums Reddit, communautés LinkedIn, Discord spécialisés. Pense aux endroits où ton avatar pose déjà des questions sur ses problèmes.",
          action: { type: "link", label: "Voir mes avatars clients", page: "AvatarClients" }
        },
        {
          text: "Envoyer 10 messages de diagnostic",
          checked: false,
          details: "Utilise tes messages prêts à l'emploi. L'objectif : comprendre leurs problèmes, pas vendre. Pose des questions ouvertes : 'Qu'est-ce qui te bloque le plus en ce moment ?'",
          action: { type: "link", label: "Copier mes messages de diagnostic", page: "SalesMessages" }
        },
        {
          text: "Poser des questions, écouter, comprendre",
          checked: false,
          details: "Note les mots exacts qu'ils utilisent pour décrire leur problème. Ce sont ces mots que tu réutiliseras pour leur parler de ta solution demain.",
        },
        {
          text: "Identifier au moins 3 conversations prometteuses",
          checked: false,
          details: "Repère les personnes qui ont un vrai problème urgent et qui semblent ouvertes à une solution. Ce sont tes prospects prioritaires pour demain."
        }
      ],
      3: [
        {
          text: "Identifier les conversations avec une vraie douleur",
          checked: false,
          details: "Relis tes échanges d'hier. Qui a mentionné un problème urgent ou frustrant ? Ce sont ces personnes que tu vas recontacter en priorité.",
        },
        {
          text: "Proposer le petit produit comme une aide / un test",
          checked: false,
          details: "Exemple de message : 'J'ai créé un mini-guide qui aide justement avec ce problème. Je le teste avec quelques personnes. Ça t'intéresse de le tester pour 27€ ?' Reste simple et humain.",
          action: { type: "link", label: "Voir mon offre", page: "MyOffers" }
        },
        {
          text: "Répondre calmement aux objections simples",
          checked: false,
          details: "Les objections courantes : prix (justifie par le temps gagné), timing (propose de commencer petit), doute (partage un mini-aperçu). Ne force jamais.",
        },
        {
          text: "Obtenir au moins un 'oui' ou un intérêt clair",
          checked: false,
          details: "Un 'oui' peut être : un paiement, un 'envoie-moi les détails', ou un 'OK je teste'. Si personne ne dit oui, c'est OK : tu as appris ce qui ne marche pas.",
        },
        {
          text: "Célébrer ta première proposition (même si c'est un non)",
          checked: false,
          details: "Tu viens de faire ce que 99% des gens ne font jamais : proposer ton travail. C'est énorme. Note ce que tu as appris.",
        }
      ],
      4: [
        {
          text: "Créer le produit (PDF simple ou vidéo Loom)",
          checked: false,
          details: "N'essaie pas de faire quelque chose de parfait. Crée un PDF de 5-10 pages dans Google Docs ou enregistre une vidéo Loom de 15-20 minutes. L'essentiel : que ça résolve leur problème.",
        },
        {
          text: "Livrer au client dans les 24-48h",
          checked: false,
          details: "Envoie par email avec un message personnel : 'Voilà ce que j'ai créé pour toi. Dis-moi ce que tu en penses et si quelque chose n'est pas clair.'",
        },
        {
          text: "Envoyer un message de suivi bienveillant",
          checked: false,
          details: "24h après la livraison, envoie un message : 'Tu as eu le temps de regarder ? Des questions ?' Sois disponible, pas insistant.",
        },
        {
          text: "Noter ce qui a pris le plus de temps",
          checked: false,
          details: "Identifie ce qui t'a ralenti dans la création. La prochaine fois, tu pourras optimiser ou même créer le produit AVANT de vendre (mais seulement après avoir validé qu'il y a de la demande).",
        }
      ],
      5: [
        {
          text: "Demander un feedback honnête",
          checked: false,
          details: "Message type : 'Je veux vraiment améliorer ce produit. Qu'est-ce qui t'a le plus aidé ? Qu'est-ce qui manquait ?' Insiste sur le fait que tu veux la vérité, pas des compliments.",
        },
        {
          text: "Comprendre ce qui a le plus aidé",
          checked: false,
          details: "Note les phrases exactes du client. Si plusieurs personnes mentionnent la même chose, c'est un signal fort : c'est ça qui a le plus de valeur.",
        },
        {
          text: "Identifier les besoins suivants",
          checked: false,
          details: "Demande : 'Maintenant que tu as résolu ça, quel est ton prochain défi ?' C'est comme ça que tu découvres ton prochain produit.",
        },
        {
          text: "Ajuster ton offre ou ta communication",
          checked: false,
          details: "Si le produit était bon mais mal expliqué : améliore ta page de vente. Si le produit manquait quelque chose : ajoute une section. Petit ajustement = gros impact.",
          action: { type: "link", label: "Mettre à jour mon offre", page: "MyOffers" }
        },
        {
          text: "Demander un témoignage (si le client est satisfait)",
          checked: false,
          details: "Message simple : 'Ça m'aiderait énormément si tu pouvais écrire 2-3 phrases sur ce que ça t'a apporté. Je peux l'utiliser pour aider d'autres personnes ?' La plupart diront oui.",
        }
      ],
      6: [
        {
          text: "Contacter 30 nouvelles personnes",
          checked: false,
          details: "Tu connais maintenant ton message. Tu sais ce qui marche. Multiplie par 3 ton volume d'hier. Utilise les mêmes canaux qui ont fonctionné.",
          action: { type: "link", label: "Voir mes messages", page: "SalesMessages" }
        },
        {
          text: "Utiliser les messages améliorés",
          checked: false,
          details: "Intègre les mots exacts que tes premiers clients ont utilisés. Si quelqu'un a dit 'j'étais perdu', utilise ce mot dans tes nouveaux messages.",
        },
        {
          text: "Demander un témoignage aux premiers clients",
          checked: false,
          details: "Si tu ne l'as pas fait hier, fais-le aujourd'hui. Un témoignage = crédibilité instantanée. Utilise-le dans tes prochaines conversations.",
        },
        {
          text: "Tracker tes conversations et résultats",
          checked: false,
          details: "Crée un Google Sheet simple : Personne | Canal | Réponse | Intérêt (Oui/Non/Peut-être). Tu commences à voir des patterns.",
        },
        {
          text: "Viser 3-5 nouvelles ventes",
          checked: false,
          details: "Tu as déjà vendu une fois. Tu sais que ça marche. Maintenant, c'est juste une question de volume. Plus tu parles à des gens, plus tu vends. C'est mathématique.",
        }
      ],
      7: [
        {
          text: "Finaliser la page de vente",
          checked: false,
          details: "Maintenant que tu as des vrais retours clients et peut-être un témoignage, mets tout ça sur ta page. Elle sera 10x plus convaincante qu'au Jour 1.",
          action: { type: "link", label: "Mettre à jour ma page de vente", page: "SalesPage" }
        },
        {
          text: "Activer les emails automatiques",
          checked: false,
          details: "Configure une séquence simple : Email 1 (présentation), Email 2 (problème), Email 3 (solution), Email 4 (offre). Utilise les modèles déjà générés.",
          action: { type: "link", label: "Voir mes emails marketing", page: "EmailsMarketing" }
        },
        {
          text: "Identifier une suite possible (upsell / accompagnement)",
          checked: false,
          details: "Tes clients qui ont acheté ton produit à 27€ ont maintenant un nouveau problème. Quelle est la prochaine étape logique ? Un produit à 97€ ? Un coaching à 297€ ? Note l'idée, ne la crée pas encore.",
        },
        {
          text: "Planifier ta semaine prochaine",
          checked: false,
          details: "Bloque 1h par jour pour continuer à contacter des prospects. Tu as maintenant un système qui marche. Il suffit de le faire tourner.",
        },
        {
          text: "Célébrer tes victoires",
          checked: false,
          details: "Prends 5 minutes pour réaliser ce que tu viens de faire en 7 jours. Tu es passé d'une idée à des ventes réelles. C'est énorme. Partage ça dans la communauté Skool !",
          action: { type: "external", label: "Partager dans la communauté", url: "https://www.skool.com/ia-pour-tous-6043/about?ref=8a2dca11af9048e6940087b263136daa" }
        }
      ]
    };

    const base = defaults[day] || [];
    const saved = dayProgress?.[day]?.checklist || [];

    // Merge par index : on garde le texte/details/action du default,
    // et on applique le checked sauvegardé si présent
    return base.map((item, idx) => {
      const savedItem = saved[idx];
      return {
        ...item,
        checked: savedItem?.checked ?? item.checked ?? false
      };
    });
  };

  const days = [
    {
      number: 1,
      title: "Tout préparer (sans vendre)",
      objective: "Mettre en place ton environnement et générer tout ce dont tu as besoin.",
      keyMessage: "Aujourd'hui, tu ne vends RIEN. Tu prépares.",
      completionMessage: "Parfait. Tout est prêt. Demain, tu vas parler à de vraies personnes.",
      buttons: [
        { label: "Analyse de marché", onClick: () => navigate(createPageUrl('MarketAnalysis')) },
        { label: "Avatars clients", onClick: () => navigate(createPageUrl('AvatarClients')) },
        { label: "Mes offres", onClick: () => navigate(createPageUrl('MyOffers')) },
        { label: "Page de vente", onClick: () => navigate(createPageUrl('SalesPage')) },
        { label: "Messages de vente", onClick: () => navigate(createPageUrl('SalesMessages')) },
        { label: "Emails marketing", onClick: () => navigate(createPageUrl('EmailsMarketing')) }
      ]
    },
    {
      number: 2,
      title: "Ouvrir des conversations",
      objective: "Parler à des gens. Comprendre leurs problèmes. Sans vendre.",
      keyMessage: "Tu es là pour aider, pas pour convaincre.",
      completionMessage: "Bravo ! Tu as écouté de vraies personnes. Demain, tu vas proposer.",
      buttons: [
        { label: "Voir mes avatars", onClick: () => navigate(createPageUrl('AvatarClients')) },
        { label: "Messages de diagnostic", onClick: () => navigate(createPageUrl('SalesMessages')) }
      ]
    },
    {
      number: 3,
      title: "Proposer le petit produit",
      objective: "Faire ta première proposition simple et humaine.",
      specialMessage: "🎉 Ta première vente est proche.",
      completionMessage: "Incroyable ! Tu as fait ta première proposition. Demain, tu vas créer.",
      buttons: [
        { label: "Voir mon offre", onClick: () => navigate(createPageUrl('MyOffers')) }
      ]
    },
    {
      number: 4,
      title: "Créer APRÈS avoir vendu",
      objective: "Livrer ce que tu as vendu, simplement.",
      keyMessage: "Tu n'as pas besoin d'être parfait. Tu dois être utile.",
      completionMessage: "Félicitations ! Tu as livré. Demain, tu vas améliorer."
    },
    {
      number: 5,
      title: "Feedback & ajustement",
      objective: "Améliorer avec de vrais retours clients.",
      completionMessage: "Super ! Tu es à l'écoute. Demain, tu vas multiplier."
    },
    {
      number: 6,
      title: "Répéter pour aller vers 10 ventes",
      objective: "Refaire ce qui fonctionne.",
      completionMessage: "Excellent ! Tu as une dynamique. Demain, tu structures."
    },
    {
      number: 7,
      title: "Structurer la suite (simplement)",
      objective: "Poser les bases pour continuer.",
      specialMessage: "🎉 Tu as vendu. Tu as aidé quelqu'un. Tu viens de prouver que c'est possible.",
      buttons: [
        { label: "Page de vente", onClick: () => navigate(createPageUrl('SalesPage')) },
        { label: "Emails automatiques", onClick: () => navigate(createPageUrl('EmailsMarketing')) }
      ]
    }
  ];

  const calculateProgress = () => {
    // total tâches = somme des tâches de tous les jours
    const totalTasks = [1, 2, 3, 4, 5, 6, 7].reduce(
      (acc, day) => acc + getDayChecklist(day).length,
      0
    );

    if (totalTasks === 0) return 0;

    // tâches cochées = somme des checked true
    const checkedTasks = [1, 2, 3, 4, 5, 6, 7].reduce((acc, day) => {
      const list = getDayChecklist(day);
      return acc + list.filter((i) => i.checked).length;
    }, 0);

    return Math.round((checkedTasks / totalTasks) * 100);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar currentPage="PlanAction" progress={0} user={user} />
        <div className="flex-1 ml-0 lg:ml-72">
          <TopBar user={user} />
          <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
            <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const progress = calculateProgress();

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        currentPage="PlanAction"
        progress={progress}
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 ml-0 lg:ml-72 overflow-y-auto">
        <TopBar
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-left mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-[#61f7a2]/10 px-4 py-2 rounded-full mb-4">
              <Target className="w-4 h-4 text-[#61f7a2]" />
              <span className="text-[#61f7a2] font-semibold text-sm">
                Jour {currentDay} / 7
              </span>
            </div>

            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Plan d'action
            </h1>

            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Ta première vente en 7 jours
            </h2>

            <p className="text-lg text-gray-600 max-w-3xl">
              Une action par jour. Pas plus. Pas moins.
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            className="mb-12"
          >
            <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-[#61f7a2] to-[#4de88f]"
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Progression globale</span>
              <span className="font-bold text-[#61f7a2]">{progress}%</span>
            </div>
          </motion.div>

          {/* Days List */}
          <div className="space-y-6">
            {days.map((day) => {
              const isCompleted = dayProgress[day.number]?.completed || false;
              const isActive = day.number === currentDay;
              const isLocked = day.number > currentDay;

              return (
                <DayCard
                  key={day.number}
                  day={day}
                  isActive={isActive}
                  isCompleted={isCompleted}
                  isLocked={isLocked}
                  checklist={getDayChecklist(day.number)}
                  onChecklistChange={(idx) => handleChecklistChange(day.number, idx)}
                  onComplete={() => handleDayComplete(day.number)}
                />
              );
            })}
          </div>

          {/* Success Message */}
          {progress === 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-12 bg-gradient-to-r from-[#61f7a2] to-[#4de88f] rounded-3xl p-12 text-center text-white"
            >
              <div className="w-20 h-20 bg-white rounded-full mx-auto mb-6 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-[#61f7a2]" />
              </div>
              <h2 className="text-4xl font-bold mb-4">
                Félicitations ! 🎉
              </h2>
              <p className="text-xl mb-6">
                Tu as complété le plan 7 jours. Tu as prouvé que c'est possible.
              </p>
              <Button
                onClick={() => navigate(createPageUrl('Dashboard'))}
                size="lg"
                className="bg-white text-[#61f7a2] hover:bg-gray-100 font-bold px-8"
              >
                Retour au Dashboard
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      <ChatBubble />
    </div>
  );
}