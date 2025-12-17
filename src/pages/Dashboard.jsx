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
      <div className="flex min-h-screen bg-[#11112b]">
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
    <div className="flex min-h-screen bg-[#11112b]">
      <Sidebar currentPage="Dashboard" progress={calculateProgress()} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Dashboard" 
          subtitle={`Bienvenue ${user?.full_name?.split(' ')[0] || ''} !`}
          user={user}
        />
        
        <main className="p-8">
          {/* Bandeau supérieur - Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1b1b33] border border-[#2a2a45] rounded-2xl p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Progression globale</span>
                  <span className="text-[#61f7a2] font-bold text-lg">{calculateProgress()}%</span>
                </div>
                <ProgressBar value={calculateProgress()} max={100} size="sm" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Actions du jour</span>
                  <span className="text-[#61f7a2] font-bold text-lg">
                    {dailyActions.filter(a => a.generated).length}/{dailyActions.length}
                  </span>
                </div>
                <ProgressBar 
                  value={(dailyActions.filter(a => a.generated).length / dailyActions.length) * 100} 
                  max={100} 
                  size="sm" 
                />
              </div>
              
              <div>
                <span className="text-gray-400 text-sm block mb-2">Étape actuelle</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#61f7a2] font-bold text-lg">{getCurrentStep()}/7</span>
                  <span className="text-white text-sm truncate">
                    {planSteps7Days[getCurrentStep() - 1]?.title}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Section principale - 2 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Colonne gauche - Actions du jour */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-[#61f7a2]" />
                <h3 className="text-xl font-bold text-white">Actions du jour</h3>
              </div>

              <div className="space-y-3">
                {dailyActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.id}
                      to={createPageUrl(action.page)}
                      className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-[#61f7a2]/50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#61f7a2]/20 to-[#61f7a2]/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-[#61f7a2]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">{action.title}</p>
                          {action.generated ? (
                            <div className="flex items-center gap-1 mt-1">
                              <CheckCircle className="w-3 h-3 text-[#61f7a2]" />
                              <span className="text-[#61f7a2] text-xs">Généré</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">À générer</span>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#61f7a2] transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            {/* Colonne droite - Plan 7 jours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#61f7a2]" />
                <h3 className="text-xl font-bold text-white">Plan d'action 7 jours</h3>
              </div>

              <div className="space-y-3">
                {planSteps7Days.map((step, index) => {
                  const isUnlocked = !step.locked;
                  const isCurrent = index + 1 === getCurrentStep();
                  const isCompleted = index + 1 < getCurrentStep();

                  return (
                    <div
                      key={step.step_number}
                      className={`bg-[#1b1b33] border rounded-xl p-4 transition-all ${
                        isUnlocked 
                          ? isCurrent 
                            ? 'border-[#61f7a2] shadow-lg shadow-[#61f7a2]/20' 
                            : 'border-[#2a2a45]'
                          : 'border-[#2a2a45] opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          isCompleted 
                            ? 'bg-[#61f7a2] text-[#11112b]' 
                            : isCurrent 
                              ? 'bg-[#61f7a2]/20 text-[#61f7a2] border border-[#61f7a2]' 
                              : 'bg-[#2a2a45] text-gray-500'
                        }`}>
                          {isCompleted ? <CheckCircle className="w-4 h-4" /> : step.step_number}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                            {step.title}
                          </p>
                          <p className="text-gray-400 text-xs">{step.description}</p>
                        </div>
                        {!isUnlocked && <Lock className="w-4 h-4 text-gray-600" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Bandeau Ressources IA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#61f7a2]" />
              <h3 className="text-xl font-bold text-white">Ressources IA</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {aiResources.map((resource) => {
                const Icon = resource.icon;
                return (
                  <Link
                    key={resource.title}
                    to={createPageUrl(resource.page)}
                    className="bg-[#1b1b33] border border-[#2a2a45] rounded-xl p-4 hover:border-[#61f7a2]/50 transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${resource.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-white font-medium text-sm mb-1">{resource.title}</p>
                    {resource.generated ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-[#61f7a2]" />
                        <span className="text-[#61f7a2] text-xs">Généré</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">À générer</span>
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
            className="bg-gradient-to-br from-[#1b1b33] to-[#2a2a45] border border-[#61f7a2]/30 rounded-2xl p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
                  <Video className="w-8 h-8 text-[#11112b]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Besoin d'accompagnement ?</h3>
                  <p className="text-gray-400">Prends rendez-vous avec un expert pour accélérer</p>
                </div>
              </div>
              <GlowButton
                onClick={() => window.open('https://calendly.com/votre-lien', '_blank')}
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
            className="bg-[#1b1b33] border border-[#2a2a45] rounded-2xl p-8"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Rejoins la communauté</h3>
                  <p className="text-gray-400">Partage avec d'autres créateurs et reçois du soutien</p>
                </div>
              </div>
              <GlowButton
                onClick={() => window.open('https://www.skool.com/votre-groupe', '_blank')}
                variant="outline"
                size="lg"
              >
                Accéder à Skool
              </GlowButton>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}