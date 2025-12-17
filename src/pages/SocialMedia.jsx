import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { Sparkles, Loader2, Lock, FileText, Grid3x3, Video, MessageCircle } from 'lucide-react';
import { FaTiktok, FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from 'react-icons/fa6';
import { RiTwitterXFill } from 'react-icons/ri';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import GlowButton from '@/components/ui/GlowButton';
import { cn } from "@/lib/utils";
import UpgradeModal from '@/components/paywall/UpgradeModal';

const socialPlatforms = [
  { name: 'TikTok', icon: FaTiktok, color: 'text-white' },
  { name: 'Instagram', icon: FaInstagram, color: 'text-pink-500' },
  { name: 'Facebook', icon: FaFacebook, color: 'text-blue-500' },
  { name: 'YouTube', icon: FaYoutube, color: 'text-red-500' },
  { name: 'X', icon: RiTwitterXFill, color: 'text-white' },
  { name: 'LinkedIn', icon: FaLinkedin, color: 'text-blue-400' }
];

export default function SocialMedia() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [user, setUser] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showBlur, setShowBlur] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBlur(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const contentTypes = [
    {
      id: 'post',
      title: 'Générer un Post',
      subtitle: 'Publication textuelle',
      description: 'Posts engageants pour tous les réseaux',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'carousel',
      title: 'Générer un Carrousel',
      subtitle: 'Slides éducatifs',
      description: 'Contenu en plusieurs slides Instagram/LinkedIn',
      icon: Grid3x3,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'reel',
      title: 'Générer un Reel',
      subtitle: 'Vidéo courte',
      description: 'Script pour TikTok, Reels, Stories',
      icon: Video,
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'description',
      title: 'Générer une Description',
      subtitle: 'Texte d\'accompagnement',
      description: 'Descriptions optimisées pour chaque réseau',
      icon: MessageCircle,
      color: 'from-green-500 to-emerald-500',
    }
  ];

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#11112b]">
        <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#11112b]">
      <Sidebar currentPage="SocialMedia" progress={0} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Réseaux sociaux" 
          subtitle="Génère tes contenus avec l'IA"
          user={user}
        />
        
        <main className="p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1b1b33] rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-[#61f7a2]" />
                <span className="text-sm text-gray-300">Contenus générés par IA</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">
                Tes Contenus Réseaux Sociaux
              </h1>
              <p className="text-gray-400 text-lg mb-6">
                Génère du contenu viral pour tous tes réseaux
              </p>

              {/* Social Platform Icons */}
              <div className="flex items-center justify-center gap-6 mt-6">
                {socialPlatforms.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <div
                      key={platform.name}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#1b1b33] border border-[#2a2a45] flex items-center justify-center hover:border-[#61f7a2]/30 transition-all">
                        <Icon className={cn("w-6 h-6", platform.color)} />
                      </div>
                      <span className="text-xs text-gray-500">{platform.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contentTypes.map((type, index) => {
                const Icon = type.icon;
                
                return (
                  <div
                    key={type.id}
                    className="relative"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={cn(
                      "bg-[#1b1b33] border border-[#2a2a45] rounded-2xl p-6 transition-all duration-300 hover:border-[#61f7a2]/30 animate-fade-in",
                      showBlur && "blur-sm"
                    )}>
                      {/* Gradient Header */}
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-bold text-white mb-2">
                        {type.title}
                      </h3>
                      <p className="text-[#61f7a2] text-sm mb-1">{type.subtitle}</p>
                      <p className="text-gray-400 text-sm mb-6">{type.description}</p>

                      {/* Fake content */}
                      <div className="space-y-3">
                        <div className="h-12 bg-[#0f0f1f] rounded-xl" />
                        <div className="h-12 bg-[#0f0f1f] rounded-xl" />
                        <div className="h-12 bg-[#0f0f1f] rounded-xl" />
                      </div>
                    </div>

                    {/* Lock Overlay */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
                      <Lock className="w-12 h-12 text-[#61f7a2] mb-4" />
                      <h4 className="text-xl font-bold text-white mb-2">Premium</h4>
                      <p className="text-gray-400 text-sm mb-4 text-center px-6">
                        Débloque cette fonctionnalité
                      </p>
                      <GlowButton
                        onClick={() => setShowUpgradeModal(true)}
                        variant="primary"
                        size="sm"
                      >
                        Passer à Premium
                      </GlowButton>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
}