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
  CheckCircle2
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
    page: 'MarketAnalysis',
    category: 'Stratégie'
  },
  {
    id: 'avatars',
    title: 'Avatars clients',
    description: 'Définis précisément qui sont tes clients idéaux et leurs besoins',
    icon: User,
    color: 'from-purple-500 to-pink-500',
    page: 'AvatarClients',
    category: 'Stratégie'
  },
  {
    id: 'offers',
    title: 'Offres',
    description: 'Structure tes produits et services avec des prix optimisés',
    icon: Package,
    color: 'from-orange-500 to-red-500',
    page: 'MyOffers',
    category: 'Produits'
  },
  {
    id: 'sales-page',
    title: 'Page de vente',
    description: 'Crée une landing page qui convertit tes visiteurs en clients',
    icon: FileText,
    color: 'from-green-500 to-emerald-500',
    page: 'SalesPage',
    category: 'Marketing'
  },
  {
    id: 'sales-messages',
    title: 'Messages de vente',
    description: 'Génère des scripts de vente persuasifs pour convaincre',
    icon: MessageCircle,
    color: 'from-indigo-500 to-purple-500',
    page: 'SalesMessages',
    category: 'Marketing'
  },
  {
    id: 'emails',
    title: 'Emails marketing',
    description: 'Automatise tes campagnes email pour nurture tes prospects',
    icon: Send,
    color: 'from-pink-500 to-rose-500',
    page: 'EmailsMarketing',
    category: 'Marketing'
  },
  {
    id: 'social-media',
    title: 'Réseaux sociaux',
    description: 'Crée du contenu viral pour Instagram, TikTok, LinkedIn',
    icon: Share2,
    color: 'from-amber-500 to-orange-500',
    page: 'SocialMedia',
    category: 'Contenu'
  },
  {
    id: 'ads',
    title: 'Publicité / Meta Ads',
    description: 'Génère des copies publicitaires qui performent',
    icon: Megaphone,
    color: 'from-red-500 to-pink-500',
    page: 'AdCopies',
    category: 'Acquisition'
  }
];

export default function AIResources() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [generatedResources, setGeneratedResources] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Charger l'état de génération des ressources depuis le storage
      // Pour simplifier, on considère qu'une ressource est générée si elle existe
      // Tu peux adapter cette logique selon tes besoins
      setGeneratedResources({
        'market-analysis': !!currentUser?.market_validation,
        'avatars': !!currentUser?.avatars_generated,
        'offers': !!currentUser?.offers_generated,
        'sales-page': !!currentUser?.sales_page_generated,
        'sales-messages': !!currentUser?.sales_messages_generated,
        'emails': !!currentUser?.emails_generated,
        'social-media': false,
        'ads': false
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleResourceClick = (page) => {
    navigate(createPageUrl(page));
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
      </div>
    );
  }

  // Grouper les ressources par catégorie
  const categories = [...new Set(resources.map(r => r.category))];

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar currentPage="AIResources" progress={0} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Ressources IA" 
          subtitle="Tous les outils IA essentiels pour créer, structurer et vendre ton activité en ligne"
          user={user}
        />
        
        <main className="p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#61f7a2]/10 rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-[#61f7a2]" />
                <span className="text-xs font-semibold text-[#61f7a2]">Générés par IA</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                🎯 Tes ressources IA
              </h1>
              <p className="text-gray-600 text-lg mb-2">
                Tous les outils IA essentiels pour créer, structurer et vendre ton activité en ligne.
              </p>
              <p className="text-gray-500 text-sm">
                Commence par générer chaque ressource. Tu pourras les consulter et les affiner ensuite.
              </p>
            </motion.div>

            {/* Resources Grid par catégorie */}
            {categories.map((category, catIndex) => (
              <div key={category}>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: catIndex * 0.1 }}
                  className="text-xl font-bold text-gray-900 mb-4"
                >
                  {category}
                </motion.h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources
                    .filter(r => r.category === category)
                    .map((resource, index) => {
                      const Icon = resource.icon;
                      const isGenerated = generatedResources[resource.id];
                      
                      return (
                        <motion.div
                          key={resource.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                          onClick={() => handleResourceClick(resource.page)}
                          className="group cursor-pointer"
                        >
                          <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-[#61f7a2] hover:shadow-lg transition-all duration-300">
                            {/* Icon Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className={cn(
                                "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center",
                                resource.color
                              )}>
                                <Icon className="w-7 h-7 text-white" />
                              </div>
                              {isGenerated && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg">
                                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                                  <span className="text-xs font-medium text-green-600">Généré</span>
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="mb-4">
                              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#61f7a2] transition-colors">
                                {resource.title}
                              </h3>
                              <p className="text-gray-600 text-sm leading-relaxed">
                                {resource.description}
                              </p>
                            </div>

                            {/* Button */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-[#61f7a2] group-hover:underline">
                                {isGenerated ? 'Consulter' : 'Générer'}
                              </span>
                              <ArrowRight className="w-4 h-4 text-[#61f7a2] group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <ChatBubble />
    </div>
  );
}