import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { Sparkles, Loader2, Copy, Lock, Image as ImageIcon, Grid3x3, Video } from 'lucide-react';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import GlowButton from '@/components/ui/GlowButton';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import UpgradeModal from '@/components/paywall/UpgradeModal';

const contentTypes = [
  {
    id: 'posts',
    title: 'Posts',
    subtitle: 'Publications textuelles',
    description: 'Posts engageants pour tous les réseaux',
    icon: ImageIcon,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'carousels',
    title: 'Carrousels',
    subtitle: 'Slides Instagram/LinkedIn',
    description: 'Contenu éducatif en plusieurs slides',
    icon: Grid3x3,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'reels',
    title: 'Reels/Stories',
    subtitle: 'Vidéos courtes',
    description: 'Scripts pour TikTok, Reels, Stories',
    icon: Video,
    color: 'from-orange-500 to-red-500',
  }
];

export default function SocialMedia() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [hasPremium, setHasPremium] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const profiles = await base44.entities.UserProfile.filter({ 
        created_by: currentUser.email 
      });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        setHasPremium(profiles[0].has_paid === true);
      }

      const sessions = await base44.entities.Session.filter({ 
        created_by: currentUser.email 
      });
      
      if (sessions.length > 0) {
        setSession(sessions[0]);
        if (sessions[0].generated_social_content) {
          setGeneratedContent(sessions[0].generated_social_content);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleGenerate = async (isRegenerate = false) => {
    if (!hasPremium) {
      setShowUpgradeModal(true);
      return;
    }

    if (isRegenerate && !hasPremium) {
      setShowUpgradeModal(true);
      return;
    }

    setLoading(true);

    try {
      const response = await base44.functions.invoke('generateSocialContent', {
        profile,
        session
      });

      setGeneratedContent(response.data);

      // Save to session
      await base44.entities.Session.update(session.id, {
        generated_social_content: response.data
      });

      toast.success('Contenus générés avec succès !');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papier !');
  };

  const handleCopyAll = (items) => {
    const text = items.map((item, i) => `${i + 1}. ${typeof item === 'string' ? item : item.script || JSON.stringify(item)}`).join('\n\n');
    navigator.clipboard.writeText(text);
    toast.success('Tous les éléments copiés !');
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#11112b]">
        <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
      </div>
    );
  }

  if (!hasPremium) {
    return (
      <div className="flex min-h-screen bg-[#11112b]">
        <Sidebar currentPage="SocialMedia" progress={0} />
        
        <div className="flex-1 ml-72">
          <TopBar 
            title="Contenus réseaux sociaux" 
            subtitle="Générez vos contenus pour les réseaux"
            user={user}
          />
          
          <main className="p-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Fonctionnalité Premium
              </h2>
              <p className="text-gray-400 mb-8">
                Accédez à la génération de contenus pour réseaux sociaux avec l'abonnement Premium
              </p>
              <GlowButton
                onClick={() => setShowUpgradeModal(true)}
                variant="primary"
                size="lg"
              >
                Passer à Premium
              </GlowButton>
            </div>
          </main>
        </div>

        <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#11112b]">
      <Sidebar currentPage="SocialMedia" progress={0} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Contenus réseaux sociaux" 
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
              <p className="text-gray-400 text-lg">
                Génère posts, carrousels et scripts vidéos pour TikTok, Instagram et Facebook
              </p>
            </div>

            {/* Generate Button */}
            {!generatedContent ? (
              <div className="flex justify-center">
                <GlowButton
                  onClick={() => handleGenerate()}
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="px-12"
                >
                  {loading ? 'Génération en cours...' : 'Générer mes contenus'}
                </GlowButton>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Tabs */}
                <div className="flex gap-3 justify-center mb-8">
                  {contentTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setActiveTab(type.id)}
                      className={cn(
                        "px-6 py-3 rounded-xl font-semibold transition-all",
                        activeTab === type.id
                          ? "bg-[#61f7a2] text-[#11112b]"
                          : "bg-[#1b1b33] text-gray-400 hover:text-white border border-[#2a2a45]"
                      )}
                    >
                      {type.title}
                    </button>
                  ))}
                </div>

                {/* Posts */}
                {activeTab === 'posts' && (
                  <div className="bg-[#1b1b33] border border-[#2a2a45] rounded-2xl p-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Posts textuels</h3>
                          <p className="text-sm text-gray-400">5 posts engageants prêts à publier</p>
                        </div>
                      </div>
                      <GlowButton
                        onClick={() => handleCopyAll(generatedContent.posts)}
                        variant="ghost"
                        size="sm"
                        icon={Copy}
                      >
                        Copier tout
                      </GlowButton>
                    </div>
                    <div className="space-y-4">
                      {generatedContent.posts?.map((post, index) => (
                        <div key={index} className="p-4 bg-[#0f0f1f] rounded-xl hover:bg-[#1a1a2f] transition-colors group">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-[#61f7a2] font-bold text-sm">Post {index + 1}</span>
                            <button
                              onClick={() => handleCopy(post)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[#61f7a2]"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-white whitespace-pre-wrap">{post}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Carousels */}
                {activeTab === 'carousels' && (
                  <div className="bg-[#1b1b33] border border-[#2a2a45] rounded-2xl p-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Grid3x3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Carrousels Instagram/LinkedIn</h3>
                          <p className="text-sm text-gray-400">5 idées de carrousels avec structure</p>
                        </div>
                      </div>
                      <GlowButton
                        onClick={() => handleCopyAll(generatedContent.carousels)}
                        variant="ghost"
                        size="sm"
                        icon={Copy}
                      >
                        Copier tout
                      </GlowButton>
                    </div>
                    <div className="space-y-4">
                      {generatedContent.carousels?.map((carousel, index) => (
                        <div key={index} className="p-4 bg-[#0f0f1f] rounded-xl hover:bg-[#1a1a2f] transition-colors group">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <span className="text-[#61f7a2] font-bold text-sm">Carrousel {index + 1}</span>
                              <h4 className="text-white font-semibold mt-1">{carousel.title}</h4>
                            </div>
                            <button
                              onClick={() => handleCopy(`${carousel.title}\n\n${carousel.slides.map((s, i) => `Slide ${i + 1}: ${s}`).join('\n\n')}`)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[#61f7a2]"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-2 mt-3">
                            {carousel.slides?.map((slide, slideIndex) => (
                              <div key={slideIndex} className="pl-4 border-l-2 border-[#61f7a2]/30">
                                <span className="text-xs text-gray-500">Slide {slideIndex + 1}</span>
                                <p className="text-gray-300 text-sm mt-1">{slide}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reels/Stories */}
                {activeTab === 'reels' && (
                  <div className="bg-[#1b1b33] border border-[#2a2a45] rounded-2xl p-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                          <Video className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Reels/Stories</h3>
                          <p className="text-sm text-gray-400">5 scripts pour vidéos courtes (TikTok, Reels, Stories)</p>
                        </div>
                      </div>
                      <GlowButton
                        onClick={() => handleCopyAll(generatedContent.reels)}
                        variant="ghost"
                        size="sm"
                        icon={Copy}
                      >
                        Copier tout
                      </GlowButton>
                    </div>
                    <div className="space-y-4">
                      {generatedContent.reels?.map((reel, index) => (
                        <div key={index} className="p-4 bg-[#0f0f1f] rounded-xl hover:bg-[#1a1a2f] transition-colors group">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <span className="text-[#61f7a2] font-bold text-sm">Script {index + 1}</span>
                              <h4 className="text-white font-semibold mt-1">{reel.hook}</h4>
                            </div>
                            <button
                              onClick={() => handleCopy(reel.script)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[#61f7a2]"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-gray-300 text-sm whitespace-pre-wrap mt-2">{reel.script}</p>
                          {reel.cta && (
                            <div className="mt-3 pt-3 border-t border-[#2a2a45]">
                              <span className="text-xs text-gray-500">CTA:</span>
                              <p className="text-[#61f7a2] text-sm mt-1">{reel.cta}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Regenerate Button */}
                <div className="flex justify-center pt-4">
                  <GlowButton
                    onClick={() => handleGenerate(true)}
                    variant="secondary"
                    size="default"
                    loading={loading}
                  >
                    Régénérer
                  </GlowButton>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
}