import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useRequirePayment } from '@/components/hooks/useRequirePayment';
import { calculateProgressFromSession, getCurrentDay } from '@/utils/progressUtils';
import { motion } from "framer-motion";
import {
  Target,
  ArrowRight,
  CheckCircle,
  User,
  MessageCircle,
  Send,
  Package,
  Users,
  FileText,
  Loader2,
  Clock,
  Sparkles
} from "lucide-react";
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import ProgressBar from '@/components/ui/ProgressBar';
import GlowButton from '@/components/ui/GlowButton';
import ChatBubble from '@/components/chat/ChatBubble';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, hasPurchased, isLoading: authLoading } = useRequirePayment();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timeLeftCoaching, setTimeLeftCoaching] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      checkGenerationComplete();
    }
  }, [isAuthenticated]);

  // 🔥 Polling si génération en cours
  useEffect(() => {
    if (session?.generation_in_progress) {
      const interval = setInterval(() => {
        loadData();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [session?.generation_in_progress]);

  // ⏰ Countdown 72h pour coaching (démarre depuis l'achat du pack)
  useEffect(() => {
    if (!user?.has_purchased || !user?.purchased_at) return;
    if (user?.has_purchased_upsell || user?.has_purchased_downsell || user?.has_coaching) return;

    const calculateTimeLeft = () => {
      const purchasedAt = new Date(user.purchased_at).getTime();
      const now = Date.now();
      const deadline = purchasedAt + (72 * 60 * 60 * 1000); // 72h en millisecondes
      const remaining = Math.max(0, deadline - now);
      return Math.floor(remaining / 1000); // en secondes
    };

    setTimeLeftCoaching(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeftCoaching(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [user]);



  const checkGenerationComplete = async () => {
    try {
      const currentUser = await base44.auth.me();

      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length === 0 || !profiles[0].first_name) {
        navigate(createPageUrl('SetupProfile') + '?redirect=Dashboard');
        return;
      }

      loadData();
    } catch (error) {
      console.error('[Dashboard] Error:', error);
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
        console.log('[Dashboard] ✅ Session loaded:', sessions[0].id);
        console.log('[Dashboard] ✅ plan_progress:', sessions[0].plan_progress);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Using shared utility functions from progressUtils.js

  const getNextIncompleteTask = () => {
    if (!session?.plan_progress) {
      return {
        title: "Rejoindre la communauté et se présenter",
        description: "Commence par te connecter avec d'autres entrepreneurs",
        page: "PlanAction"
      };
    }

    const currentDay = getCurrentDay(session);
    const dayProgress = session.plan_progress[currentDay];
    
    // Si pas de checklist pour ce jour, retourner la première mission
    if (!dayProgress?.checklist) {
      return {
        title: "Commencer le jour " + currentDay,
        description: "Clique pour voir tes missions du jour",
        page: "PlanAction"
      };
    }

    // Trouver la première tâche non cochée et non auto-cochée
    const firstUnchecked = dayProgress.checklist.find(
      (item, idx) => !item.checked && !item.autoChecked
    );

    if (firstUnchecked) {
      return {
        title: firstUnchecked.text.replace(/^✅\s+/, ''),
        description: firstUnchecked.details || "Clique pour plus de détails",
        page: firstUnchecked.action?.page || "PlanAction"
      };
    }

    // Si toutes les tâches du jour sont cochées mais le jour n'est pas marqué comme complété
    return {
      title: "Valider le jour " + currentDay,
      description: "Tu as tout fait ! Marque ce jour comme terminé",
      page: "PlanAction"
    };
  };

  const livrables = [
    { title: "Analyse SWOT", page: "MarketAnalysis", icon: Target, field: "complete_market_analysis" },
    { title: "3 Avatars", page: "AvatarClients", icon: Users, field: "generated_avatars" },
    { title: "4 Offres", page: "MyOffers", icon: Package, field: "my_generated_offers" },
    { title: "Messages", page: "SalesMessages", icon: MessageCircle, field: "generated_sales_messages" },
    { title: "Emails", page: "EmailsMarketing", icon: Send, field: "generated_marketing_emails" },
    { title: "Page de vente", page: "SalesPage", icon: FileText, field: "generated_sales_pages" }
  ];

  const countGenerated = () => livrables.filter(item => session?.[item.field]).length;

  const formatTimeCoaching = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const shouldShowCoachingOffer = () => {
    return user?.has_purchased
      && !user?.has_purchased_upsell
      && !user?.has_purchased_downsell
      && !user?.has_coaching
      && timeLeftCoaching > 0;
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar currentPage="Dashboard" progress={0} />
        <div className="flex-1 ml-0 lg:ml-72 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
        </div>
      </div>
    );
  }

  const currentMission = getNextIncompleteTask();

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        currentPage="Dashboard"
        progress={calculateProgressFromSession(session)}
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

        <main className="p-4 sm:p-8 max-w-6xl mx-auto">
          
          {/* BANNIÈRE COACHING 72h - Version fine */}
          {shouldShowCoachingOffer() && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 w-full">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-xs sm:text-sm lg:text-base leading-tight">
                      🔥 Dernière chance : Accompagnement VIP 30 jours
                    </h3>
                    <p className="text-white/80 text-xs hidden sm:block mt-0.5">
                      3 sessions 1-1 + WhatsApp direct avec Alfred & Damien
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  {/* Compteur */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-white/30 flex-1 sm:flex-none">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Clock className="w-3 h-3 text-white/80" />
                      <span className="text-white/80 text-xs font-medium">Expire dans :</span>
                    </div>
                    <p className="text-sm sm:text-base lg:text-lg font-black text-white font-mono">
                      {formatTimeCoaching(timeLeftCoaching)}
                    </p>
                  </div>

                  {/* CTA */}
                  <Link
                    to={createPageUrl('UpsellCoaching')}
                    className="bg-white text-orange-600 hover:bg-white/90 font-bold py-2 px-3 sm:px-4 lg:px-6 rounded-lg transition-all shadow-md text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
                  >
                    ✨ Voir l'offre
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* GREETING avec photo */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center gap-4">
            <div className="flex-shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profil" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                Hello {profile?.first_name || user?.first_name || ''} <span className="text-4xl">👋</span>
              </h1>
              {session?.generation_in_progress && (
                <p className="text-sm text-[#61f7a2] font-medium flex items-center gap-2 mt-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Noah génère tes documents...
                </p>
              )}
            </div>
          </motion.div>

          {/* BANNER génération */}
          {session?.generation_in_progress && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8 flex gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-900 font-semibold mb-1">Génération en cours...</p>
                <p className="text-blue-700 text-sm">Noah génère tes documents. Ça prend 1-2 minutes.</p>
              </div>
            </motion.div>
          )}

          {/* MISSION DU JOUR */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#61f7a2] via-[#4de88f] to-[#3dd980] rounded-3xl px-6 py-8 md:p-10 mb-8 shadow-2xl">
            <div className="text-left mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-8 h-8" />
                Ta mission aujourd'hui
              </h2>
              <p className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
                {currentMission.title}
              </p>
              <p className="text-white/90 text-lg line-clamp-2">{currentMission.description}</p>
            </div>
            <GlowButton onClick={() => navigate(createPageUrl(currentMission.page))} size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 w-full md:w-auto px-6 md:px-12 py-3 md:py-4 text-lg md:text-xl font-bold">
              👉 Lancer cette mission
            </GlowButton>
          </motion.div>

          {/* PROGRESSION */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ta progression</p>
                <p className="text-2xl font-bold text-gray-900">Jour {getCurrentDay(session)} / 7</p>
              </div>
              <p className="text-3xl font-bold text-[#61f7a2]">{calculateProgressFromSession(session)}%</p>
            </div>
            <ProgressBar value={calculateProgressFromSession(session)} max={100} className="mb-3" />
            <p className="text-center text-gray-700 font-medium">Tu es exactement là où tu dois être.</p>
          </motion.div>

          {/* LIVRABLES */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Tes documents IA</h3>
              <span className="text-sm text-gray-600"><span className="font-bold text-[#61f7a2]">{countGenerated()}</span> / {livrables.length}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {livrables.map((item) => {
                const Icon = item.icon;
                const isGenerated = session?.[item.field];
                return (
                  <Link key={item.page} to={createPageUrl(item.page)}
                    className={`flex items-center gap-3 p-4 bg-white border rounded-xl transition-all ${
                      isGenerated ? 'border-gray-300 hover:border-[#61f7a2] hover:shadow-md' : 'border-gray-200 opacity-60'
                    }`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isGenerated ? 'bg-gray-100' : 'bg-gray-50'}`}>
                      <Icon className={`w-5 h-5 ${isGenerated ? 'text-gray-700' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-gray-900 text-sm truncate">{item.title}</span>
                        {isGenerated ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> : <Loader2 className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0" />}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* PLAN 7 JOURS */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
            <p className="text-lg font-bold text-gray-900 mb-4">Tu es au jour {getCurrentDay(session)}</p>
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div key={day} className={`flex-1 h-2 rounded-full transition-all ${
                  day < getCurrentDay(session) ? 'bg-[#61f7a2]' : day === getCurrentDay(session) ? 'bg-[#61f7a2] ring-4 ring-[#61f7a2]/30' : 'bg-gray-200'
                }`} />
              ))}
            </div>
            <Link to={createPageUrl('PlanAction')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-xl hover:border-[#61f7a2] hover:shadow-md transition-all font-medium text-gray-900">
              Voir le plan complet
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </main>
      </div>
      <ChatBubble />
    </div>
  );
}