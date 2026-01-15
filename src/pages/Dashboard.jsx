import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { motion } from "framer-motion";
import {
  Target,
  Calendar,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Lock,
  User,
  MessageCircle,
  Send,
  Package,
  Users,
  Video
} from "lucide-react";
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import ProgressBar from '@/components/ui/ProgressBar';
import GlowButton from '@/components/ui/GlowButton';
import ChatBubble from '@/components/chat/ChatBubble';

const dailyMissions = [
  {
    step: 1,
    title: "Envoyer 10 messages de diagnostic à des prospects",
    page: "SalesMessages",
    description: "Utilise tes messages prêts pour contacter tes premiers prospects"
  },
  {
    step: 2,
    title: "Créer ton premier post avec ton avatar client idéal",
    page: "AvatarClients",
    description: "Partage du contenu qui attire ta cible parfaite"
  },
  {
    step: 3,
    title: "Publier ta page de vente et partager le lien",
    page: "SalesPage",
    description: "Ta page est prête, il ne reste qu'à la mettre en ligne"
  },
  {
    step: 4,
    title: "Envoyer ta première séquence email",
    page: "EmailsMarketing",
    description: "Active ta séquence automatique pour convertir"
  },
  {
    step: 5,
    title: "Faire ta première vente",
    page: "MyOffers",
    description: "Concentre-toi sur ton offre principale"
  },
  {
    step: 6,
    title: "Optimiser ton tunnel de vente",
    page: "MyOffers",
    description: "Ajoute ton order bump et tes upsells"
  },
  {
    step: 7,
    title: "Scaler ton business",
    page: "PlanAction",
    description: "Répète ce qui fonctionne, automatise le reste"
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      checkGenerationComplete();
    }
  }, [isAuthenticated]);

  // 🔥 Recharger la progression depuis la base tous les 1000ms (sync live)
  useEffect(() => {
    if (profile?.id) {
      const interval = setInterval(() => {
        loadData();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [profile?.id]);

  const checkGenerationComplete = async () => {
    try {
      const currentUser = await base44.auth.me();

      // ✅ Vérifier si profil complet
      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length === 0 || !profiles[0].first_name) {
        navigate(createPageUrl('SetupProfile') + '?redirect=Dashboard');
        return;
      }

      loadData();
    } catch (error) {
      console.error('[Dashboard] Error checking generation:', error);
      loadData();
    }
  };

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }

      const sessions = await base44.entities.Session.filter({ created_by: currentUser.email });
      if (sessions.length > 0) {
        setSession(sessions[0]);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    // 🔥 Progression basée sur les TÂCHES réellement cochées du Plan d'action
    if (!profile?.plan_7days_progress) return 0;

    const completedDays = Object.keys(profile.plan_7days_progress).filter(
      key => profile.plan_7days_progress[key]?.completed
    ).length;

    return Math.round((completedDays / 7) * 100);
  };

  const getCurrentStep = () => {
    // 🔥 Lire le progrès RÉEL depuis le plan d'action (UserProfile)
    if (!profile?.plan_7days_progress) return 1;

    const completedDays = Object.keys(profile.plan_7days_progress).filter(
      key => profile.plan_7days_progress[key]?.completed
    ).length;

    return Math.min(completedDays + 1, 7);
  };

  const getNextIncompleteTask = () => {
    // 🔥 Calculer la VRAIE première tâche incomplète
    if (!profile?.plan_7days_progress) return dailyMissions[0];

    // Trouver le jour courant basé sur les jours complétés
    const completedDays = Object.keys(profile.plan_7days_progress).filter(
      key => profile.plan_7days_progress[key]?.completed
    ).length;

    const currentDayNum = Math.min(completedDays + 1, 7);

    // ✅ Retourner la mission du jour courant
    return dailyMissions[currentDayNum - 1] || dailyMissions[6];
  };

  const livrables = [
    { title: "Offres", page: "MyOffers", icon: Package },
    { title: "Messages", page: "SalesMessages", icon: MessageCircle },
    { title: "Emails", page: "EmailsMarketing", icon: Send },
    { title: "Page de vente", page: "SalesPage", icon: FileText },
    { title: "Avatars", page: "AvatarClients", icon: Users },
    { title: "Analyse marché", page: "MarketAnalysis", icon: Target }
  ];

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar currentPage="Dashboard" progress={0} />
        <div className="flex-1 ml-0 lg:ml-72">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin w-8 h-8 border-2 border-[#61f7a2] border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        currentPage="Dashboard"
        progress={calculateProgress()}
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 w-full ml-0 lg:ml-72">
        <TopBar
          title="Dashboard"
          subtitle={`Bienvenue ${user?.full_name?.split(' ')[0] || ''} !`}
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="p-8 max-w-6xl mx-auto">
          {/* 1️⃣ GREETING SIMPLE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              Bonjour {user?.first_name || 'entrepreneur'} <span className="text-4xl">👋</span>
            </h1>
          </motion.div>

          {/* 2️⃣ MISSION DU JOUR - SECTION DOMINANTE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#61f7a2] via-[#4de88f] to-[#3dd980] rounded-3xl p-10 mb-8 shadow-2xl"
          >
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-2">
                <Target className="w-8 h-8" />
                Ta mission aujourd'hui
              </h2>
              <p className="text-2xl font-bold text-white mb-2">
                {getNextIncompleteTask()?.title}
              </p>
              <p className="text-white/90 text-lg">
                {getNextIncompleteTask()?.description}
              </p>
            </div>

            <div className="flex justify-center">
              <GlowButton
                onClick={() => navigate(createPageUrl(getNextIncompleteTask()?.page))}
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 px-12 py-4 text-xl font-bold"
              >
                👉 Lancer cette mission
              </GlowButton>
            </div>
          </motion.div>

          {/* 3️⃣ PROGRESSION - COMPACT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ta progression</p>
                <p className="text-2xl font-bold text-gray-900">Jour {getCurrentStep()} / 7</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#61f7a2]">{calculateProgress()}%</p>
              </div>
            </div>
            <ProgressBar value={calculateProgress()} max={100} className="mb-3" />
            <p className="text-center text-gray-700 font-medium">
              Tu es exactement là où tu dois être.
            </p>
          </motion.div>

          {/* 4️⃣ LIVRABLES PRÊTS - SECONDAIRE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tes livrables sont prêts</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {livrables.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#61f7a2] hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-700" />
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* 5️⃣ PLAN 7 JOURS - APERÇU */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 rounded-2xl border border-gray-200 p-6"
          >
            <p className="text-lg font-bold text-gray-900 mb-4">Tu es au jour {getCurrentStep()}</p>

            {/* Mini timeline */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div
                  key={day}
                  className={`flex-1 h-2 rounded-full transition-all ${day < getCurrentStep()
                    ? 'bg-[#61f7a2]'
                    : day === getCurrentStep()
                      ? 'bg-[#61f7a2] ring-4 ring-[#61f7a2]/30'
                      : 'bg-gray-200'
                    }`}
                />
              ))}
            </div>

            <Link
              to={createPageUrl('PlanAction')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-xl hover:border-[#61f7a2] hover:shadow-md transition-all font-medium text-gray-900"
            >
              Voir le plan complet
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>


        </main>
      </div>

      {/* Chat Bubble */}
      <ChatBubble />
    </div>
  );
}