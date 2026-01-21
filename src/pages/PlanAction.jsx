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
import { Loader2, Target, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PlanAction() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user } = useRequireAuth();
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [dayProgress, setDayProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [docsReady, setDocsReady] = useState(false);

  useEffect(() => {
    if (user && user.email) {
      const timer = setTimeout(() => { checkAccess(); }, 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const checkAccess = async () => {
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
    setIsLoading(true);
    try {
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      
      if (profiles.length > 0) {
        const userProfile = profiles[0];
        setProfile(userProfile);

        let savedProgress = userProfile.plan_7days_progress;

        if (savedProgress === undefined || savedProgress === null) {
          savedProgress = {};
          try {
            await base44.entities.UserProfile.update(userProfile.id, {
              plan_7days_progress: JSON.stringify({})
            });
          } catch (error) {
            console.error('Erreur initialisation:', error);
          }
        } else if (typeof savedProgress === "string") {
          try {
            savedProgress = JSON.parse(savedProgress);
          } catch (e) {
            console.error('Erreur parsing JSON', e);
            savedProgress = {};
          }
        }

        setDayProgress(savedProgress);

        const completedDays = Object.keys(savedProgress).filter(
          key => savedProgress[key]?.completed
        ).length;
        setCurrentDay(Math.min(completedDays + 1, 7));
      }

      const sessions = await base44.entities.Session.filter({ created_by: user.email });
      if (sessions.length > 0) {
        const userSession = sessions[0];
        setSession(userSession);
        
        const allReady = !!(
          userSession.complete_market_analysis &&
          userSession.generated_avatars &&
          userSession.detailed_offers &&
          userSession.generated_sales_messages &&
          userSession.generated_marketing_emails
        );
        setDocsReady(allReady);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChecklistChange = async (day, itemIndex) => {
    if (!profile?.id) {
      console.error('⛔ Aucun profil chargé');
      return;
    }

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

    try {
      await base44.entities.UserProfile.update(profile.id, {
        plan_7days_progress: JSON.stringify(newProgress)
      });
      console.log('✅ Sauvegardé');
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
    }
  };

  const handleDayComplete = async (day) => {
    if (!profile?.id) return;

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

    try {
      await base44.entities.UserProfile.update(profile.id, {
        plan_7days_progress: JSON.stringify(newProgress)
      });
    } catch (error) {
      console.error('❌ Erreur:', error);
    }
  };
  const getDayChecklist = (day) => {
    const mainProduct = session?.finalized_offer?.mainProduct;
    const orderBump = session?.finalized_offer?.orderBump;
    const upsell = session?.finalized_offer?.upsell1;
    const avatars = session?.generated_avatars;
    
    const defaults = {
      1: [
        {
          text: "Ajouter ma photo de profil",
          checked: false,
          details: "Une photo de profil professionnelle augmente la confiance. Va dans les paramètres pour l'ajouter.",
          action: { type: "link", label: "Aller aux paramètres", page: "Settings" }
        },
        {
          text: "Rejoindre la communauté Skool",
          checked: false,
          details: "Rejoins notre communauté pour échanger avec d'autres entrepreneurs et obtenir du soutien.",
          action: { type: "external", label: "Rejoindre maintenant", url: "https://www.skool.com/ia-pour-tous-6043/about?ref=8a2dca11af9048e6940087b263136daa" }
        },
        {
          text: "Me présenter dans la communauté",
          checked: false,
          details: "Présente-toi : qui tu es, ce que tu vends, tes objectifs. Une vidéo courte fonctionne très bien !",
          action: { type: "external", label: "Aller dans la communauté", url: "https://www.skool.com/ia-pour-tous-6043/about?ref=8a2dca11af9048e6940087b263136daa" }
        },
        {
          text: session?.complete_market_analysis ? "✅ Analyse de marché générée" : "Générer mon analyse de marché SWOT",
          checked: !!session?.complete_market_analysis,
          autoChecked: !!session?.complete_market_analysis,
          details: session?.complete_market_analysis
            ? "Ton analyse de marché est prête. Consulte-la pour comprendre ton positionnement et valider la demande."
            : "L'analyse de marché t'aide à comprendre ton positionnement, identifier tes concurrents et valider la demande.",
          action: { type: "link", label: "Voir mon analyse", page: "MarketAnalysis" }
        },
        {
          text: session?.generated_avatars ? `✅ ${Object.keys(avatars || {}).length} Avatars clients générés` : "Générer mes 3 avatars clients",
          checked: !!session?.generated_avatars,
          autoChecked: !!session?.generated_avatars,
          details: session?.generated_avatars
            ? "Tes avatars clients sont prêts. Ce sont des profils ultra-détaillés de tes clients idéaux."
            : "Définis précisément qui sont tes clients idéaux : leurs problèmes, leurs rêves, leur vocabulaire.",
          action: { type: "link", label: "Voir mes avatars", page: "AvatarClients" }
        },
        {
          text: session?.detailed_offers ? `✅ Mes offres générées (${mainProduct?.title || 'Produit principal'} + upsells)` : "Générer mes 4 offres complètes",
          checked: !!session?.detailed_offers,
          autoChecked: !!session?.detailed_offers,
          details: session?.detailed_offers
            ? `Tes 4 offres sont prêtes : ${mainProduct?.title} (${mainProduct?.price}), ${orderBump?.title || 'Order bump'}, ${upsell?.title || 'Upsell'} et ton offre premium.`
            : "Crée ta gamme d'offres avec des prix cohérents : produit d'appel, order bump, upsells.",
          action: { type: "link", label: "Voir mes offres", page: "MyOffers" }
        },
        {
          text: session?.generated_sales_pages ? "✅ Page de vente générée" : "Générer ma page de vente",
          checked: !!session?.generated_sales_pages,
          autoChecked: !!session?.generated_sales_pages,
          details: session?.generated_sales_pages
            ? "Ta page de vente est prête. Elle présente ton offre de manière convaincante."
            : "Une page de vente professionnelle pour présenter ton offre et convertir tes prospects.",
          action: { type: "link", label: "Voir ma page", page: "SalesPage" }
        },
        {
          text: session?.generated_sales_messages ? "✅ 8 Messages de vente générés" : "Générer mes messages de vente",
          checked: !!session?.generated_sales_messages,
          autoChecked: !!session?.generated_sales_messages,
          details: session?.generated_sales_messages
            ? "Tes 8 messages de vente sont prêts : diagnostic, empathie, solution, achat, objections, etc."
            : "Des messages prêts à l'emploi pour approcher tes prospects avec confiance en DM.",
          action: { type: "link", label: "Voir mes messages", page: "SalesMessages" }
        },
        {
          text: session?.generated_marketing_emails ? "✅ 5 Emails marketing générés" : "Générer mes 5 emails marketing",
          checked: !!session?.generated_marketing_emails,
          autoChecked: !!session?.generated_marketing_emails,
          details: session?.generated_marketing_emails
            ? "Ta séquence de 5 emails est prête : contraste, validation, calcul, impact, urgence."
            : "Une séquence d'emails automatiques pour nurturer tes prospects et les convertir.",
          action: { type: "link", label: "Voir mes emails", page: "EmailsMarketing" }
        }
      ],
      2: [
        {
          text: "Identifier où se trouve mon avatar (groupes, forums, réseaux)",
          checked: false,
          details: `Pense aux groupes Facebook de niche, forums Reddit, communautés LinkedIn, Discord spécialisés. Où ton avatar ${avatars?.avatar1?.identity?.situation || 'idéal'} pose-t-il des questions sur ses problèmes ?`,
          action: { type: "link", label: "Consulter mes avatars", page: "AvatarClients" }
        },
        {
          text: "Créer une liste de 50 prospects potentiels",
          checked: false,
          details: "Note leurs noms, où tu les as trouvés, et pourquoi ils correspondent à ton avatar. Un Google Sheet simple suffit : Nom | Canal | Notes."
        },
        {
          text: "Envoyer 10 messages de diagnostic (pas de vente)",
          checked: false,
          details: `Utilise ton message de diagnostic généré. Objectif : comprendre leurs problèmes. Pose des questions ouvertes : "Qu'est-ce qui te bloque le plus en ce moment avec ${session?.skill || 'ta compétence'} ?"`,
          action: { type: "link", label: "Copier mes messages de diagnostic", page: "SalesMessages" }
        },
        {
          text: "Poser des questions, écouter, comprendre (noter les mots exacts)",
          checked: false,
          details: "Note les mots EXACTS qu'ils utilisent pour décrire leur problème. Ce vocabulaire sera crucial pour leur parler de ta solution demain."
        },
        {
          text: "Identifier au moins 3 conversations prometteuses",
          checked: false,
          details: "Repère les personnes qui ont un vrai problème urgent et qui semblent ouvertes à une solution. Ce sont tes prospects prioritaires pour demain."
        },
        {
          text: "Créer mon premier post de valeur sur un réseau social",
          checked: false,
          details: `Partage une astuce concrète liée à ${session?.skill || 'ton expertise'}. Pas de vente, juste de la valeur. Utilise le vocabulaire de ton avatar. 200-300 mots max.`
        }
      ],
      3: [
        {
          text: "Relire les conversations d'hier et identifier les vraies douleurs",
          checked: false,
          details: "Relis tes échanges. Qui a mentionné un problème urgent ou frustrant ? Ces personnes sont tes priorités aujourd'hui."
        },
        {
          text: `Proposer mon produit principal (${mainProduct?.title || 'offre d\'appel'}) comme une solution simple`,
          checked: false,
          details: mainProduct
            ? `Message type : "J'ai créé ${mainProduct.title} qui aide justement avec ce problème. Ça t'intéresse pour ${mainProduct.price} ?" Reste simple et humain.`
            : "Propose ton produit d'appel (27-97€) comme une aide concrète. Pas de pression.",
          action: { type: "link", label: "Voir mon offre", page: "MyOffers" }
        },
        {
          text: "Répondre calmement aux 3 objections les plus courantes",
          checked: false,
          details: "Prix → justifie par le temps gagné. Timing → propose de commencer petit. Doute → partage un mini-aperçu. Ne force jamais.",
          action: { type: "link", label: "Voir mes réponses aux objections", page: "SalesMessages" }
        },
        {
          text: "Obtenir au moins 1 'oui' ou intérêt clair",
          checked: false,
          details: "Un 'oui' peut être : un paiement, un 'envoie-moi les détails', ou un 'OK je teste'. Si personne ne dit oui, c'est OK : tu as appris."
        },
        {
          text: "Si 1ère vente : créer le produit dans les 24-48h",
          checked: false,
          details: "PDF de 5-10 pages dans Google Docs OU vidéo Loom de 15-20 minutes. N'essaie pas d'être parfait. Crée quelque chose d'UTILE."
        },
        {
          text: "Célébrer ma première proposition (même si c'est un non)",
          checked: false,
          details: "Tu viens de faire ce que 99% des gens ne font jamais : proposer ton travail. C'est énorme. Partage dans la communauté !"
        }
      ],
      4: [
        {
          text: "Livrer le produit au client (si vente faite hier)",
          checked: false,
          details: "Envoie par email avec un message personnel : 'Voilà ce que j'ai créé pour toi. Dis-moi ce que tu en penses.'"
        },
        {
          text: "Envoyer un message de suivi bienveillant 24h après",
          checked: false,
          details: "Message : 'Tu as eu le temps de regarder ? Des questions ?' Sois disponible, pas insistant."
        },
        {
          text: "Continuer à contacter 10 nouvelles personnes",
          checked: false,
          details: "Ne t'arrête pas après 1 vente. Continue le volume. Plus tu parles à des gens, plus tu vends.",
          action: { type: "link", label: "Utiliser mes messages", page: "SalesMessages" }
        },
        {
          text: "Proposer mon offre à 3-5 nouvelles personnes",
          checked: false,
          details: "Tu sais maintenant que ça marche. Tu as le vocabulaire qui résonne. Utilise-le."
        },
        {
          text: "Noter ce qui a pris le plus de temps dans la création",
          checked: false,
          details: "Identifie ce qui t'a ralenti. Note aussi ce que le client a le plus apprécié."
        },
        {
          text: "Créer un Google Sheet de suivi : Prospect | Canal | Statut",
          checked: false,
          details: "Colonnes simples : Nom, Où trouvé, Intérêt, Date, Notes. Tu commences à voir des patterns."
        }
      ],
      5: [
        {
          text: "Demander un feedback honnête à mes premiers clients",
          checked: false,
          details: "Message : 'Je veux vraiment améliorer. Qu'est-ce qui t'a le plus aidé ? Qu'est-ce qui manquait ?' Tu veux la vérité."
        },
        {
          text: "Identifier ce qui a eu le plus de valeur",
          checked: false,
          details: "Note les phrases exactes. Si plusieurs mentionnent la même chose, c'est ton angle de vente."
        },
        {
          text: "Demander : 'Quel est ton prochain défi maintenant ?'",
          checked: false,
          details: "C'est comme ça que tu découvres ton prochain produit. Si 3 personnes mentionnent le même problème, tu as ton upsell."
        },
        {
          text: "Ajuster mon message ou ma page",
          checked: false,
          details: "Produit bon mais mal expliqué → améliore ta page. Produit manquait quelque chose → ajoute une section.",
          action: { type: "link", label: "Mettre à jour", page: "SalesPage" }
        },
        {
          text: "Demander un témoignage écrit (si client satisfait)",
          checked: false,
          details: "Message : 'Ça m'aiderait si tu pouvais écrire 2-3 phrases sur ce que ça t'a apporté.' La plupart diront oui."
        },
        {
          text: "Poster le témoignage dans la communauté + réseau social",
          checked: false,
          details: "C'est la preuve sociale la plus puissante. Ça attire d'autres prospects.",
          action: { type: "external", label: "Partager dans Skool", url: "https://www.skool.com/ia-pour-tous-6043" }
        }
      ],
      6: [
        {
          text: "Contacter 30 nouvelles personnes (3x le volume)",
          checked: false,
          details: "Tu connais ton message. Tu sais ce qui marche. Multiplie par 3.",
          action: { type: "link", label: "Voir mes messages", page: "SalesMessages" }
        },
        {
          text: "Utiliser les mots exacts de mes clients dans mes messages",
          checked: false,
          details: "Si quelqu'un a dit 'j'étais perdu', utilise ce mot. Ça résonne instantanément."
        },
        {
          text: "Viser 3-5 nouvelles ventes aujourd'hui",
          checked: false,
          details: "Tu as déjà vendu. Tu sais que ça marche. C'est juste une question de volume."
        },
        {
          text: `Proposer l'order bump (${orderBump?.title || 'offre complémentaire'}) aux clients`,
          checked: false,
          details: orderBump
            ? `Propose ${orderBump.title} (${orderBump.price}) à ceux qui ont acheté. Ils te font déjà confiance.`
            : "Propose une offre complémentaire à tes clients existants.",
          action: { type: "link", label: "Voir mon order bump", page: "MyOffers" }
        },
        {
          text: "Mettre à jour mon tracker : noter tous les résultats",
          checked: false,
          details: "Taux de réponse, taux de conversion, objections fréquentes, canaux efficaces. Ces données valent de l'or."
        },
        {
          text: "Créer 2-3 posts de valeur sur mes réseaux",
          checked: false,
          details: `Partage des insights sur ${session?.skill || 'ton domaine'}. Pas de vente directe, juste de la valeur.`
        }
      ],
      7: [
        {
          text: "Mettre à jour ma page avec témoignages et résultats",
          checked: false,
          details: "Ajoute tes témoignages. Ta page sera 10x plus convaincante.",
          action: { type: "link", label: "Mettre à jour", page: "SalesPage" }
        },
        {
          text: "Configurer ma séquence de 5 emails automatiques",
          checked: false,
          details: "Utilise les 5 emails générés. Configure-les dans Mailchimp ou Brevo.",
          action: { type: "link", label: "Voir mes emails", page: "EmailsMarketing" }
        },
        {
          text: `Identifier mon prochain produit (upsell ~${upsell?.price || '97-297€'})`,
          checked: false,
          details: "Tes clients à 27€ ont un nouveau problème. Quelle est la prochaine étape logique ?",
          action: { type: "link", label: "Voir mon upsell", page: "MyOffers" }
        },
        {
          text: "Calculer mes résultats : CA total, ventes, taux conversion",
          checked: false,
          details: `Exemple : 100 contacts → 10 conversations → 3 ventes × ${mainProduct?.price || '27€'} = ${parseInt(mainProduct?.price || 27) * 3}€.`
        },
        {
          text: "Planifier ma semaine : 1h/jour pour prospecter",
          checked: false,
          details: "Bloque 1h par jour. Tu as un système qui marche. Il suffit de le faire tourner."
        },
        {
          text: "Partager mes victoires dans la communauté",
          checked: false,
          details: "Tu es passé d'une idée à des ventes réelles en 7 jours. Partage ton histoire !",
          action: { type: "external", label: "Partager", url: "https://www.skool.com/ia-pour-tous-6043" }
        },
        {
          text: "Célébrer : tu as prouvé que c'est possible 🎉",
          checked: false,
          details: "Tu as vendu. Tu as aidé quelqu'un. Tu es officiellement un entrepreneur. Célèbre ça."
        }
      ]
    };

    const base = defaults[day] || [];
    const saved = dayProgress?.[day]?.checklist || [];

    return base.map((item, idx) => {
      const savedItem = saved[idx];
      if (item.autoChecked) {
        return { ...item, checked: true, disabled: true };
      }
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
      objective: "Mettre en place ton environnement et générer tous tes documents IA personnalisés.",
      keyMessage: docsReady 
        ? "✅ Tes documents sont prêts ! Concentre-toi sur les tâches communautaires." 
        : "Aujourd'hui, tu ne vends RIEN. Tu prépares tout ce dont tu as besoin.",
      completionMessage: "Parfait. Tout est prêt. Demain, tu vas parler à de vraies personnes.",
      buttons: [
        { label: "Dashboard", onClick: () => navigate(createPageUrl('Dashboard')) }
      ]
    },
    {
      number: 2,
      title: "Ouvrir des conversations",
      objective: "Parler à 10 personnes. Comprendre leurs vrais problèmes. Sans vendre.",
      keyMessage: "Tu es là pour ÉCOUTER et COMPRENDRE, pas pour convaincre.",
      completionMessage: "Bravo ! Tu as écouté de vraies personnes. Demain, tu vas proposer.",
      buttons: [
        { label: "Mes avatars", onClick: () => navigate(createPageUrl('AvatarClients')) },
        { label: "Mes messages", onClick: () => navigate(createPageUrl('SalesMessages')) }
      ]
    },
    {
      number: 3,
      title: "Proposer le petit produit",
      objective: `Faire ta première proposition : ${session?.finalized_offer?.mainProduct?.title || 'ton produit d\'appel'} à ${session?.finalized_offer?.mainProduct?.price || '27-97€'}.`,
      specialMessage: "🎉 Ta première vente est proche. Reste humain et simple.",
      completionMessage: "Incroyable ! Tu as fait ta première proposition. Demain, tu livres ou continues.",
      buttons: [
        { label: "Voir mon offre", onClick: () => navigate(createPageUrl('MyOffers')) }
      ]
    },
    {
      number: 4,
      title: "Livrer & Continuer",
      objective: "Livrer ce que tu as vendu (si vente faite) ET continuer à prospecter.",
      keyMessage: "Tu n'as pas besoin d'être parfait. Tu dois être UTILE.",
      completionMessage: "Félicitations ! Tu as livré (ou continué à prospecter). Demain, tu améliores."
    },
    {
      number: 5,
      title: "Feedback & Optimisation",
      objective: "Améliorer avec de vrais retours clients. Ajuster ton message.",
      keyMessage: "Écoute tes clients. Ils te disent exactement comment vendre mieux.",
      completionMessage: "Super ! Tu es à l'écoute. Demain, tu multiplies les résultats."
    },
    {
      number: 6,
      title: "Scaler : 3-5 ventes",
      objective: "Refaire ce qui fonctionne, mais en 3x plus grand.",
      keyMessage: "Tu sais que ça marche. Maintenant : VOLUME.",
      completionMessage: "Excellent ! Tu as une dynamique. Demain, tu structures pour durer."
    },
    {
      number: 7,
      title: "Structurer la suite",
      objective: "Automatiser, planifier, identifier l'upsell. Poser les bases pour continuer.",
      specialMessage: "🎉 Tu as vendu. Tu as aidé. Tu viens de prouver que c'est possible.",
      buttons: [
        { label: "Ma page de vente", onClick: () => navigate(createPageUrl('SalesPage')) },
        { label: "Mes emails", onClick: () => navigate(createPageUrl('EmailsMarketing')) }
      ]
    }
  ];

  const calculateProgress = () => {
    const totalTasks = [1, 2, 3, 4, 5, 6, 7].reduce(
      (acc, day) => acc + getDayChecklist(day).length,
      0
    );
    if (totalTasks === 0) return 0;
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
        <div className="flex-1 ml-0 lg:ml-72 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
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
        <TopBar user={user} onMenuClick={() => setIsSidebarOpen(true)} />

        <div className="max-w-5xl mx-auto px-6 py-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-left mb-8">
            <div className="inline-flex items-center gap-2 bg-[#61f7a2]/10 px-4 py-2 rounded-full mb-4">
              <Target className="w-4 h-4 text-[#61f7a2]" />
              <span className="text-[#61f7a2] font-semibold text-sm">Jour {currentDay} / 7</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Plan d'action</h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Ta première vente en 7 jours</h2>
            <p className="text-lg text-gray-600 max-w-3xl">Une action par jour. Pas plus. Pas moins.</p>
          </motion.div>

          {!docsReady && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
              className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-900 font-semibold mb-1">Documents en cours de génération</p>
                <p className="text-blue-700 text-sm">
                  Les tâches du Jour 1 se cocheront automatiquement une fois prêts.
                </p>
              </div>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} className="mb-12">
            <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-[#61f7a2] to-[#4de88f]" />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Progression globale</span>
              <span className="font-bold text-[#61f7a2]">{progress}%</span>
            </div>
          </motion.div>

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

          {progress === 100 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="mt-12 bg-gradient-to-r from-[#61f7a2] to-[#4de88f] rounded-3xl p-12 text-center text-white">
              <div className="w-20 h-20 bg-white rounded-full mx-auto mb-6 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-[#61f7a2]" />
              </div>
              <h2 className="text-4xl font-bold mb-4">Félicitations ! 🎉</h2>
              <p className="text-xl mb-6">Tu as complété le plan 7 jours. Tu as prouvé que c'est possible.</p>
              <Button onClick={() => navigate(createPageUrl('Dashboard'))} size="lg"
                className="bg-white text-[#61f7a2] hover:bg-gray-100 font-bold px-8">
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