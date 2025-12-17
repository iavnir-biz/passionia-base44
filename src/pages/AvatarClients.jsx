import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { Sparkles, Loader2, Copy, User, Target, Heart, AlertCircle, TrendingUp, Lock } from 'lucide-react';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import GlowButton from '@/components/ui/GlowButton';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import UpgradeModal from '@/components/paywall/UpgradeModal';

export default function AvatarClients() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [avatars, setAvatars] = useState([]);
  const [expandedAvatar, setExpandedAvatar] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [hasPremium, setHasPremium] = useState(false);

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
        if (sessions[0].generated_avatars) {
          setAvatars(sessions[0].generated_avatars);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleGenerate = async (isRegenerate = false) => {
    if (isRegenerate && !hasPremium) {
      setShowUpgradeModal(true);
      return;
    }

    setLoading(true);

    try {
      const response = await base44.functions.invoke('generateAvatars', {
        profile,
        session
      });

      setAvatars(response.data.avatars);

      // Save to session
      await base44.entities.Session.update(session.id, {
        generated_avatars: response.data.avatars
      });

      toast.success('Avatars générés avec succès !');
    } catch (error) {
      console.error('Error generating avatars:', error);
      toast.error('Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAvatar = (avatar) => {
    const text = `
${avatar.name} - ${avatar.tagline}

🎯 PROFIL
${avatar.profile}

💭 FRUSTRATIONS
${avatar.frustrations}

🎯 OBJECTIFS
${avatar.goals}

❤️ DÉSIRS PROFONDS
${avatar.desires}

⚠️ PEURS & FREINS
${avatar.fears}

📈 COMMENT LES ATTEINDRE
${avatar.how_to_reach}
    `.trim();
    
    navigator.clipboard.writeText(text);
    toast.success('Avatar copié dans le presse-papier !');
  };

  const avatarColors = [
    { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    { gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    { gradient: 'from-orange-500 to-red-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' }
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
      <Sidebar currentPage="AvatarClients" progress={0} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Avatars clients" 
          subtitle="Comprends tes clients idéaux"
          user={user}
        />
        
        <main className="p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1b1b33] rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-[#61f7a2]" />
                <span className="text-sm text-gray-300">Avatars générés par IA</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">
                Tes Avatars Clients
              </h1>
              <p className="text-gray-400 text-lg">
                3 profils clients ultra-détaillés adaptés à ton offre
              </p>
            </div>

            {/* Generate Button */}
            {avatars.length === 0 ? (
              <div className="flex justify-center">
                <GlowButton
                  onClick={() => handleGenerate()}
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="px-12"
                >
                  {loading ? 'Génération en cours...' : 'Générer mes avatars'}
                </GlowButton>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Avatar Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {avatars.map((avatar, index) => {
                    const colors = avatarColors[index];
                    const isExpanded = expandedAvatar === index;

                    return (
                      <div
                        key={index}
                        className={cn(
                          "bg-[#1b1b33] border rounded-2xl p-6 transition-all duration-300 animate-fade-in",
                          isExpanded ? "lg:col-span-3" : "",
                          colors.border
                        )}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {/* Avatar Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className={cn(
                            "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                            colors.gradient
                          )}>
                            <User className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-white mb-1">
                              {avatar.name}
                            </h3>
                            <p className="text-[#61f7a2] text-sm font-medium">
                              {avatar.tagline}
                            </p>
                          </div>
                        </div>

                        {/* Quick Overview */}
                        {!isExpanded && (
                          <div className={cn("p-4 rounded-xl mb-4", colors.bg)}>
                            <p className="text-gray-300 text-sm line-clamp-3">
                              {avatar.profile}
                            </p>
                          </div>
                        )}

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="space-y-4 mb-4">
                            {/* Profile */}
                            <div className={cn("p-4 rounded-xl", colors.bg)}>
                              <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-[#61f7a2]" />
                                <h4 className="font-semibold text-white">Profil</h4>
                              </div>
                              <p className="text-gray-300 text-sm">{avatar.profile}</p>
                            </div>

                            {/* Frustrations */}
                            <div className={cn("p-4 rounded-xl", colors.bg)}>
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-[#61f7a2]" />
                                <h4 className="font-semibold text-white">Frustrations</h4>
                              </div>
                              <p className="text-gray-300 text-sm">{avatar.frustrations}</p>
                            </div>

                            {/* Goals */}
                            <div className={cn("p-4 rounded-xl", colors.bg)}>
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-[#61f7a2]" />
                                <h4 className="font-semibold text-white">Objectifs</h4>
                              </div>
                              <p className="text-gray-300 text-sm">{avatar.goals}</p>
                            </div>

                            {/* Desires */}
                            <div className={cn("p-4 rounded-xl", colors.bg)}>
                              <div className="flex items-center gap-2 mb-2">
                                <Heart className="w-4 h-4 text-[#61f7a2]" />
                                <h4 className="font-semibold text-white">Désirs profonds</h4>
                              </div>
                              <p className="text-gray-300 text-sm">{avatar.desires}</p>
                            </div>

                            {/* Fears */}
                            <div className={cn("p-4 rounded-xl", colors.bg)}>
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-[#61f7a2]" />
                                <h4 className="font-semibold text-white">Peurs & Freins</h4>
                              </div>
                              <p className="text-gray-300 text-sm">{avatar.fears}</p>
                            </div>

                            {/* How to Reach */}
                            <div className={cn("p-4 rounded-xl", colors.bg)}>
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-[#61f7a2]" />
                                <h4 className="font-semibold text-white">Comment les atteindre</h4>
                              </div>
                              <p className="text-gray-300 text-sm">{avatar.how_to_reach}</p>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <GlowButton
                            onClick={() => setExpandedAvatar(isExpanded ? null : index)}
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                          >
                            {isExpanded ? 'Réduire' : 'Voir le profil complet'}
                          </GlowButton>
                          <GlowButton
                            onClick={() => handleCopyAvatar(avatar)}
                            variant="ghost"
                            size="sm"
                            icon={Copy}
                          >
                            Copier
                          </GlowButton>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Regenerate Button */}
                <div className="flex justify-center pt-4">
                  <GlowButton
                    onClick={() => handleGenerate(true)}
                    variant="secondary"
                    size="default"
                    loading={loading}
                    icon={!hasPremium ? Lock : undefined}
                  >
                    {!hasPremium ? 'Premium - Régénérer' : 'Régénérer'}
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