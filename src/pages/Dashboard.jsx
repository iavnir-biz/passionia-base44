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

const planSteps7Days = [
  { step_number: 1, title: "Clarifier ton offre", description: "Définir précisément ton produit", locked: false },
  { step_number: 2, title: "Créer tes avatars clients", description: "Identifier tes cibles", locked: false },
  { step_number: 3, title: "Messages de vente", description: "Rédiger tes accroches", locked: false },
  { step_number: 4, title: "Emails marketing", description: "Préparer ta séquence", locked: false },
  { step_number: 5, title: "Page de vente", description: "Construire ta landing", locked: false },
  { step_number: 6, title: "Lancer la pub", description: "Démarrer tes campagnes", locked: true },
  { step_number: 7, title: "Premières ventes", description: "Obtenir tes clients", locked: false },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);
  
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
    if (!session) return 0;
    let completed = 0;
    let total = 5;
    
    if (session.offer_generation) completed++;
    if (session.generated_avatars) completed++;
    if (session.generated_sales_messages) completed++;
    if (session.generated_emails) completed++;
    if (session.generated_sales_page) completed++;
    
    return Math.round((completed / total) * 100);
  };
  
  const getCurrentStep = () => {
    if (!session?.offer_generation) return 1;
    if (!session?.generated_avatars) return 2;
    if (!session?.generated_sales_messages) return 3;
    if (!session?.generated_emails) return 4;
    if (!session?.generated_sales_page) return 5;
    return 6;
  };

  const dailyActions = [
    {
      id: 1,
      title: "Génère ton offre complète",
      page: "MyOffers",
      icon: Package,
      generated: session?.offer_generation
    },
    {
      id: 2,
      title: "Crée tes 3 avatars clients",
      page: "AvatarClients",
      icon: User,
      generated: session?.generated_avatars
    },
    {
      id: 3,
      title: "Rédige tes messages de vente",
      page: "SalesMessages",
      icon: MessageCircle,
      generated: session?.generated_sales_messages
    }
  ];

  const aiResources = [
    {
      title: "Offre complète",
      page: "MyOffers",
      icon: Package,
      color: "from-blue-500 to-cyan-500",
      generated: session?.offer_generation
    },
    {
      title: "Avatars clients",
      page: "AvatarClients",
      icon: User,
      color: "from-purple-500 to-pink-500",
      generated: session?.generated_avatars
    },
    {
      title: "Messages de vente",
      page: "SalesMessages",
      icon: MessageCircle,
      color: "from-green-500 to-emerald-500",
      generated: session?.generated_sales_messages
    },
    {
      title: "Emails marketing",
      page: "EmailsMarketing",
      icon: Send,
      color: "from-orange-500 to-red-500",
      generated: session?.generated_emails
    },
    {
      title: "Page de vente",
      page: "SalesPage",
      icon: FileText,
      color: "from-amber-500 to-yellow-500",
      generated: session?.generated_sales_page
    }
  ];
  
  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar currentPage="Dashboard" progress={0} />
        <div className="flex-1 ml-72">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin w-8 h-8 border-2 border-[#61f7a2] border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar currentPage="Dashboard" progress={calculateProgress()} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Dashboard" 
          subtitle={`Bienvenue ${user?.full_name?.split(' ')[0] || ''} !`}
          user={user}
        />
        
        <main className="p-8">
          {/* Bloc d'accueil premium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 rounded-3xl p-8 mb-8 shadow-lg"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  👋 Bonjour {user?.full_name?.split(' ')[0] || ''} !
                </h1>
                <p className="text-xl text-purple-100 mb-2">
                  Prêt à lancer ton activité en ligne aujourd'hui ?
                </p>
                <p className="text-sm text-purple-200">
                  Tu avances étape par étape. Nous t'accompagnons jusqu'au bout.
                </p>
              </div>
              <GlowButton
                onClick={() => {
                  const element = document.getElementById('daily-actions');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                variant="primary"
                size="lg"
                className="bg-[#61f7a2] hover:bg-[#4de88f] text-gray-900 font-semibold shrink-0"
              >
                Commencer ma première mission
                <ArrowRight className="w-5 h-5 ml-2" />
              </GlowButton>
            </div>
          </motion.div>

          {/* Cartes de gamification */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-purple-900">Progression</span>
              </div>
              <div className="text-3xl font-bold text-purple-900 mb-2">{calculateProgress()}%</div>
              <ProgressBar value={calculateProgress()} max={100} size="sm" className="bg-purple-200" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#61f7a2] flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-green-900">Étape en cours</span>
              </div>
              <div className="text-xl font-bold text-green-900 mb-1">
                {planSteps7Days[getCurrentStep() - 1]?.title}
              </div>
              <span className="inline-block bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                En cours
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-blue-900">Actions complétées</span>
              </div>
              <div className="text-3xl font-bold text-blue-900 mb-2">
                {dailyActions.filter(a => a.generated).length}/{dailyActions.length}
              </div>
              <div className="w-full bg-blue-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${(dailyActions.filter(a => a.generated).length / dailyActions.length) * 100}%` }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-amber-900">Aujourd'hui</span>
              </div>
              <div className="text-2xl font-bold text-amber-900 mb-1">
                {dailyActions.filter(a => !a.generated).length === 0 
                  ? 'Tout complété !' 
                  : `${dailyActions.filter(a => !a.generated).length} action${dailyActions.filter(a => !a.generated).length > 1 ? 's' : ''} restante${dailyActions.filter(a => !a.generated).length > 1 ? 's' : ''}`
                }
              </div>
              <span className="text-xs text-amber-700">Continue comme ça ! 💪</span>
            </motion.div>
          </div>
          
          {/* Tes actions du jour */}
          <motion.div
            id="daily-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-[#61f7a2]" />
              <h2 className="text-2xl font-bold text-gray-900">Tes actions du jour</h2>
            </div>

            <div className="space-y-4">
              {dailyActions.map((action, index) => {
                const Icon = action.icon;
                const progressValue = action.generated ? 100 : 0;
                return (
                  <Link
                    key={action.id}
                    to={createPageUrl(action.page)}
                    className="block bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-[#61f7a2] hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shrink-0">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{action.title}</h3>
                        {action.generated ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-[#61f7a2]" />
                            <span className="text-[#61f7a2] text-sm font-medium">Terminé ✔</span>
                          </div>
                        ) : (
                          <span className="text-gray-600 text-sm">À faire</span>
                        )}
                      </div>
                      <div className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                        action.generated 
                          ? 'bg-[#61f7a2] text-white' 
                          : 'bg-gray-900 text-white group-hover:bg-[#61f7a2]'
                      }`}>
                        {action.generated ? 'Consulter' : 'Lancer'}
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressValue}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-gradient-to-r from-[#61f7a2] to-[#4de88f] h-2 rounded-full"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Plan d'action 7 jours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-6 h-6 text-[#61f7a2]" />
              <h2 className="text-2xl font-bold text-gray-900">Plan d'action 7 jours</h2>
            </div>

            <div className="space-y-3">
              {planSteps7Days.map((step, index) => {
                const isUnlocked = !step.locked;
                const isCurrent = index + 1 === getCurrentStep();
                const isCompleted = index + 1 < getCurrentStep();

                return (
                  <div
                    key={step.step_number}
                    className={`bg-white border-2 rounded-2xl p-5 transition-all ${
                      isUnlocked 
                        ? isCurrent 
                          ? 'border-[#61f7a2] shadow-lg shadow-[#61f7a2]/20' 
                          : 'border-gray-200 hover:border-gray-300'
                        : 'border-gray-200 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        isCompleted 
                          ? 'bg-[#61f7a2] text-white' 
                          : isCurrent 
                            ? 'bg-[#61f7a2]/20 text-[#61f7a2] border-2 border-[#61f7a2]' 
                            : 'bg-gray-100 text-gray-500'
                      }`}>
                        {isCompleted ? <CheckCircle className="w-6 h-6" /> : step.step_number}
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-lg mb-1 ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                          {step.title}
                        </p>
                        <p className="text-gray-600 text-sm">{step.description}</p>
                      </div>
                      {!isUnlocked && <Lock className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Section restante avec colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">



          {/* Bandeau Ressources IA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-[#61f7a2]" />
              <h2 className="text-2xl font-bold text-gray-900">Ressources IA</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {aiResources.map((resource) => {
                const Icon = resource.icon;
                return (
                  <Link
                    key={resource.title}
                    to={createPageUrl(resource.page)}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#61f7a2]/50 hover:shadow-sm transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${resource.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-gray-900 font-medium text-sm mb-1">{resource.title}</p>
                    {resource.generated ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-[#61f7a2]" />
                        <span className="text-[#61f7a2] text-xs">Généré</span>
                      </div>
                    ) : (
                      <span className="text-gray-600 text-xs">À générer</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Bandeau Coaching */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border border-gray-200 rounded-2xl p-8 mb-8 shadow-sm"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Besoin d'accompagnement ?</h3>
                  <p className="text-gray-600">Prends rendez-vous avec un expert pour accélérer</p>
                </div>
              </div>
              <GlowButton
                onClick={() => navigate(createPageUrl('Booking'))}
                variant="primary"
                size="lg"
              >
                Prendre un rendez-vous
              </GlowButton>
            </div>
          </motion.div>

          {/* Bandeau Communauté */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Rejoins la communauté</h3>
                  <p className="text-gray-600">Partage avec d'autres créateurs et reçois du soutien</p>
                </div>
              </div>
              <GlowButton
                onClick={() => window.open('https://www.skool.com/ia-pour-tous-6043/about?ref=8a2dca11af9048e6940087b263136daa', '_blank')}
                variant="outline"
                size="lg"
              >
                Accéder à Skool
              </GlowButton>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Chat Bubble */}
      <ChatBubble />
    </div>
  );
}