import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { calculateProgressFromSession } from '@/utils/progressUtils';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Loader2,
  BarChart3,
  User,
  Package,
  FileText,
  MessageCircle,
  Send,
  Share2,
  Megaphone,
  ArrowRight,
  CheckCircle2,
  Lock,
  AlertCircle
} from 'lucide-react';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import ChatBubble from '@/components/chat/ChatBubble';
import { cn } from "@/lib/utils";

const resources = [
  // 🎯 Priorité haute - Commence ici
  {
    id: 'sales-messages',
    title: 'Messages de vente',
    description: '4 messages prêts à copier-coller pour démarrer tes conversations',
    icon: MessageCircle,
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-50',
    page: 'SalesMessages',
    field: 'generated_sales_messages',
    isBeta: false,
    isHighPriority: true
  },
  {
    id: 'offers',
    title: 'Offres',
    description: '4 offres complètes : produit principal, order bump, upsells avec prix et détails',
    icon: Package,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    page: 'MyOffers',
    field: 'detailed_offers',
    isBeta: false,
    isHighPriority: true
  },
  {
    id: 'sales-page',
    title: 'Page de vente',
    description: 'Ta page de vente complète, prête à copier dans Carrd ou Notion',
    icon: FileText,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    page: 'SalesPage',
    field: 'generated_sales_pages',
    isBeta: false,
    isHighPriority: false
  },
  // Priorité moyenne
  {
    id: 'avatars',
    title: 'Avatars clients',
    description: '3 profils ultra-détaillés de clients cibles avec leurs problèmes et motivations',
    icon: User,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    page: 'AvatarClients',
    field: 'generated_avatars',
    isBeta: false
  },
  {
    id: 'emails',
    title: 'Emails marketing',
    description: '5 emails de séquence automatique : contraste, validation, calcul, impact, urgence',
    icon: Send,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
    page: 'EmailsMarketing',
    field: 'generated_marketing_emails',
    isBeta: false
  },
  {
    id: 'market-analysis',
    title: 'Analyse de marché',
    description: 'Analyse SWOT complète : concurrents, prix, opportunités, canaux de distribution',
    icon: BarChart3,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    page: 'MarketAnalysis',
    field: 'complete_market_analysis',
    isBeta: false
  },
  // Fonctionnalités avancées/bêta
  {
    id: 'social-media',
    title: 'Réseaux sociaux',
    description: 'Crée du contenu viral pour Instagram, TikTok, LinkedIn',
    icon: Share2,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    page: 'SocialMedia',
    field: null,
    isBeta: true
  },
  {
    id: 'ads',
    title: 'Publicité / Meta Ads',
    description: 'Génère des copies publicitaires qui performent',
    icon: Megaphone,
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-50',
    page: 'AdCopies',
    field: null,
    isBeta: true
  }
];

export default function AIResources() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [generatedResources, setGeneratedResources] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const isNonEmpty = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return true;
    if (typeof value === 'boolean') return true;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return false;
  };

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const sessionId = currentUser.sessionId;
      if (!sessionId) {
        console.warn('[AIResources] No sessionId');
        setLoading(false);
        return;
      }

      const sessions = await base44.entities.Session.filter({ id: sessionId });
      const userSession = sessions?.[0];
      setSession(userSession);

      if (!userSession) {
        console.warn('[AIResources] Session not found');
        setLoading(false);
        return;
      }

      console.log('[AIResources] Session loaded:', {
        complete_market_analysis: !!userSession.complete_market_analysis,
        generated_avatars: !!userSession.generated_avatars,
        detailed_offers: !!userSession.detailed_offers,
        generated_sales_messages: !!userSession.generated_sales_messages,
        generated_marketing_emails: !!userSession.generated_marketing_emails,
        generated_sales_pages: !!userSession.generated_sales_pages,
        generation_in_progress: userSession.generation_in_progress
      });

      // Construire état des ressources
      const resourcesState = {};
      resources.forEach(resource => {
        if (resource.field) {
          resourcesState[resource.id] = isNonEmpty(userSession?.[resource.field]);
        } else {
          resourcesState[resource.id] = false; // Beta
        }
      });

      setGeneratedResources(resourcesState);

    } catch (error) {
      console.error('[AIResources] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceClick = (resource) => {
    if (resource.isBeta) return;
    navigate(createPageUrl(resource.page));
  };

  const countGenerated = () => {
    return Object.values(generatedResources).filter(Boolean).length;
  };

  const totalResources = resources.filter(r => !r.isBeta).length;

  if (authLoading || loading) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar currentPage="AIResources" progress={0} user={user} />
        <div className="flex-1 ml-0 lg:ml-72 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        currentPage="AIResources"
        progress={calculateProgressFromSession(session)}
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 ml-0 lg:ml-72">
        <TopBar
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="p-8">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* Banner génération en cours */}
            {session?.generation_in_progress && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3"
              >
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-900 font-semibold mb-1">Génération en cours...</p>
                  <p className="text-blue-700 text-sm">
                    Noah génère tes documents. Les badges "Prêt" apparaîtront automatiquement une fois terminé. Ça prend 1-2 minutes.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Banner tout prêt */}
            {!session?.generation_in_progress && countGenerated() === totalResources && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-[#61f7a2]/10 to-green-50 border border-[#61f7a2]/30 rounded-2xl p-4 mb-6"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#61f7a2]" />
                  <p className="text-gray-900 font-medium">
                    Tout est généré. Récupère ce dont tu as besoin pour ta mission du jour.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    Tes livrables IA
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Noah a généré tout ce dont tu as besoin. Ouvre, personnalise, lance.
                  </p>
                </div>
                {!session?.generation_in_progress && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Progression</p>
                    <p className="text-2xl font-bold text-[#61f7a2]">
                      {countGenerated()} / {totalResources}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {resources.map((resource, index) => {
                const Icon = resource.icon;
                const isGenerated = generatedResources[resource.id];

                return (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    onClick={() => handleResourceClick(resource)}
                    className={cn(
                      "group",
                      resource.isBeta ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                    )}
                  >
                    <div className={cn(
                      "border border-gray-200 rounded-2xl p-6 transition-all duration-300",
                      resource.bgColor,
                      !resource.isBeta && "hover:border-[#61f7a2] hover:shadow-lg"
                    )}>
                      {/* Icon Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center",
                          resource.color
                        )}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {resource.isHighPriority && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-[#61f7a2]/20 rounded-lg border border-[#61f7a2]">
                              <span className="text-xs font-bold text-gray-900">🎯 Priorité</span>
                            </div>
                          )}
                          {isGenerated && !resource.isBeta && !resource.isHighPriority && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg border border-green-200">
                              <CheckCircle2 className="w-3 h-3 text-green-600" />
                              <span className="text-xs font-medium text-green-700">Prêt</span>
                            </div>
                          )}
                          {!isGenerated && !resource.isBeta && session?.generation_in_progress && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg border border-blue-200">
                              <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                              <span className="text-xs font-medium text-blue-700">En cours</span>
                            </div>
                          )}
                          {resource.isBeta && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg border border-amber-200">
                              <Lock className="w-3 h-3 text-amber-600" />
                              <span className="text-xs font-medium text-amber-700">Bêta</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mb-4">
                        <h3 className={cn(
                          "text-lg font-bold text-gray-900 mb-2 transition-colors",
                          !resource.isBeta && "group-hover:text-[#61f7a2]"
                        )}>
                          {resource.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {resource.description}
                        </p>
                      </div>

                      {/* Button */}
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-sm font-semibold flex items-center gap-2",
                          resource.isBeta ? "text-gray-400" : "text-gray-900 group-hover:text-black"
                        )}>
                          {resource.isBeta ? 'Bientôt disponible' : 'Ouvrir'}
                        </span>
                        {!resource.isBeta && (
                          <ArrowRight className="w-4 h-4 text-gray-900 group-hover:translate-x-1 transition-transform" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      <ChatBubble />
    </div>
  );
}