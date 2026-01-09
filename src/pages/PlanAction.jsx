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

  useEffect(() => {
    if (user) {
      checkAccess();
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
    try {
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles.length > 0) {
        const userProfile = profiles[0];
        setProfile(userProfile);
        
        // Load saved progress
        const savedProgress = userProfile.plan_7days_progress || {};
        setDayProgress(savedProgress);
        
        // Calculate current day
        const completedDays = Object.keys(savedProgress).filter(
          key => savedProgress[key].completed
        ).length;
        setCurrentDay(Math.min(completedDays + 1, 7));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDayProgress = async (day, data) => {
    const newProgress = {
      ...dayProgress,
      [day]: data
    };
    setDayProgress(newProgress);
    
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, {
        plan_7days_progress: newProgress
      });
    }
  };

  const handleChecklistChange = async (day, itemIndex) => {
    const dayData = dayProgress[day] || { checklist: getDayChecklist(day).map(item => ({ ...item, checked: false })) };
    const newChecklist = [...dayData.checklist];
    newChecklist[itemIndex] = { ...newChecklist[itemIndex], checked: !newChecklist[itemIndex].checked };
    
    await saveDayProgress(day, {
      ...dayData,
      checklist: newChecklist
    });
  };

  const handleDayComplete = async (day) => {
    await saveDayProgress(day, {
      ...dayProgress[day],
      completed: true,
      completedAt: new Date().toISOString()
    });
    setCurrentDay(Math.min(day + 1, 7));
  };

  const getDayChecklist = (day) => {
    const saved = dayProgress[day]?.checklist;
    if (saved) return saved;
    
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
          details: "Présentez-vous aux autres membres : qui vous êtes, ce que vous voulez vendre, quels sont vos objectifs. Cela vous aidera à créer des liens et à obtenir des conseils. N'hésitez pas à faire une vidéo directement dans la communauté pour vous présenter de manière authentique !"
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
        { text: "Identifier où se trouve mon avatar (réseaux / groupes)", checked: false },
        { text: "Envoyer 10 messages de diagnostic", checked: false },
        { text: "Poser des questions, écouter, comprendre", checked: false }
      ],
      3: [
        { text: "Identifier les conversations avec une vraie douleur", checked: false },
        { text: "Proposer le petit produit comme une aide / un test", checked: false },
        { text: "Répondre calmement aux objections simples", checked: false },
        { text: "Obtenir au moins un \"oui\" ou un intérêt clair", checked: false }
      ],
      4: [
        { text: "Créer le produit (PDF simple ou vidéo Loom)", checked: false },
        { text: "Livrer au client", checked: false },
        { text: "Envoyer un message de suivi bienveillant", checked: false }
      ],
      5: [
        { text: "Demander un feedback honnête", checked: false },
        { text: "Comprendre ce qui a le plus aidé", checked: false },
        { text: "Identifier les besoins suivants", checked: false }
      ],
      6: [
        { text: "Contacter 30 nouvelles personnes", checked: false },
        { text: "Utiliser les messages améliorés", checked: false },
        { text: "Demander un témoignage aux premiers clients", checked: false }
      ],
      7: [
        { text: "Finaliser la page de vente", checked: false },
        { text: "Activer les emails automatiques", checked: false },
        { text: "Identifier une suite possible (order bump / accompagnement)", checked: false }
      ]
    };
    
    return defaults[day] || [];
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
    const completedDays = Object.keys(dayProgress).filter(
      key => dayProgress[key].completed
    ).length;
    return Math.round((completedDays / 7) * 100);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar currentPage="PlanAction" progress={0} user={user} />
        <div className="flex-1 ml-72">
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
      <Sidebar currentPage="PlanAction" progress={progress} user={user} />
      
      <div className="flex-1 ml-72 overflow-y-auto">
        <TopBar user={user} />
        
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
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
            
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
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