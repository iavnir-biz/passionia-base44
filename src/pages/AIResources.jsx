import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
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
  Lock
} from 'lucide-react';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import ChatBubble from '@/components/chat/ChatBubble';
import { cn } from "@/lib/utils";

const resources = [
  {
    id: 'market-analysis',
    title: 'Analyse de marché',
    description: 'Valide ton idée avec des données réelles sur ton marché cible',
    icon: BarChart3,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    page: 'MarketAnalysis',
    isBeta: false
  },
  {
    id: 'avatars',
    title: 'Avatars clients',
    description: 'Définis précisément qui sont tes clients idéaux et leurs besoins',
    icon: User,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    page: 'AvatarClients',
    isBeta: false
  },
  {
    id: 'offers',
    title: 'Offres',
    description: 'Structure tes produits et services avec des prix optimisés',
    icon: Package,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    page: 'MyOffers',
    isBeta: false
  },
  {
    id: 'sales-page',
    title: 'Page de vente',
    description: 'Crée une landing page qui convertit tes visiteurs en clients',
    icon: FileText,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    page: 'SalesPage',
    isBeta: false
  },
  {
    id: 'sales-messages',
    title: 'Messages de vente',
    description: 'Génère des scripts de vente persuasifs pour convaincre',
    icon: MessageCircle,
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-50',
    page: 'SalesMessages',
    isBeta: false
  },
  {
    id: 'emails',
    title: 'Emails marketing',
    description: 'Automatise tes campagnes email pour nurture tes prospects',
    icon: Send,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
    page: 'EmailsMarketing',
    isBeta: false
  },
  {
    id: 'social-media',
    title: 'Réseaux sociaux',
    description: 'Crée du contenu viral pour Instagram, TikTok, LinkedIn',
    icon: Share2,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    page: 'SocialMedia',
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

      // 🔥 P0: DB-first - charger Session via sessionId
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

      // ✅ ACCÈS LIBRE pour diagnostiquer
      console.log('[AIResources] Access granted for diagnostics');

      // Construire état "Prêt" depuis Session
      const resourcesState = {
        'market-analysis': isNonEmpty(userSession?.market_validation),
        'avatars': isNonEmpty(userSession?.generated_avatars),
        'offers': isNonEmpty(userSession?.my_generated_offers),
        'sales-messages': isNonEmpty(userSession?.generated_sales_messages),
        'emails': isNonEmpty(userSession?.generated_marketing_emails),
        'sales-page': isNonEmpty(userSession?.generated_sales_pages),
        'social-media': false,
        'ads': false
      };

      setGeneratedResources(resourcesState);

    } catch (error) {
      console.error('[AIResources] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceClick = (resource) => {
    if (resource.isBeta) return; // Bloquer clic sur bêta
    navigate(createPageUrl(resource.page));
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar currentPage="AIResources" progress={0} />
        <div className="flex-1 ml-0 lg:ml-72">
          <TopBar user={user} />
          <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
            <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        currentPage="AIResources"
        progress={0}
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

            {/* Bandeau "Tout est prêt" */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-[#61f7a2]/10 to-green-50 border border-[#61f7a2]/30 rounded-2xl p-4 mb-6"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#61f7a2]" />
                <p className="text-gray-900 font-medium">
                  ✅ Tout est prêt. Ouvre chaque ressource quand tu veux.
                </p>
              </div>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#61f7a2]/10 rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-[#61f7a2]" />
                <span className="text-xs font-semibold text-[#61f7a2]">Générés par IA</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                ✨ Tes ressources IA
              </h1>
              <p className="text-gray-600 text-lg">
                Tous les outils IA essentiels pour créer et vendre ton activité en ligne.
              </p>
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
                          {isGenerated && !resource.isBeta && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg border border-green-200">
                              <CheckCircle2 className="w-3 h-3 text-green-600" />
                              <span className="text-xs font-medium text-green-700">Prêt</span>
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
                          resource.isBeta ? "text-gray-400" : "text-[#61f7a2] group-hover:underline"
                        )}>
                          {resource.isBeta ? 'Bientôt disponible' : 'Ouvrir'}
                        </span>
                        {!resource.isBeta && (
                          <ArrowRight className="w-4 h-4 text-[#61f7a2] group-hover:translate-x-1 transition-transform" />
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