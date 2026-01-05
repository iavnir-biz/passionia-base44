import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Loader2, 
  Copy, 
  User, 
  Target, 
  Heart, 
  AlertCircle, 
  TrendingUp, 
  Lock,
  Users,
  Clock,
  DollarSign,
  Calendar,
  MessageSquare,
  Lightbulb,
  CheckCircle,
  Brain
} from 'lucide-react';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import GlowButton from '@/components/ui/GlowButton';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import UpgradeModal from '@/components/paywall/UpgradeModal';
import ChatBubble from '@/components/chat/ChatBubble';

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
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar currentPage="AvatarClients" progress={0} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Avatars clients" 
          subtitle="Comprends tes clients idéaux"
          user={user}
        />
        
        <main className="p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full mb-4">
                <Brain className="w-4 h-4 text-[#61f7a2]" />
                <span className="text-xs font-medium text-gray-700">Psychologie client</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Tes avatars clients
              </h1>
              <p className="text-gray-600 text-lg max-w-3xl">
                3 profils ultra-détaillés pour comprendre précisément qui sont tes clients, comment leur parler, et comment créer des offres qui convertissent.
              </p>
            </motion.div>

            {/* Purpose Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-blue-50 border border-blue-200 rounded-2xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    📌 À quoi servent ces avatars ?
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#61f7a2] flex-shrink-0" />
                      <span>Créer tes messages de vente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#61f7a2] flex-shrink-0" />
                      <span>Écrire tes emails marketing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#61f7a2] flex-shrink-0" />
                      <span>Concevoir tes pages de vente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#61f7a2] flex-shrink-0" />
                      <span>Produire tes contenus</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Avatar Cards */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[0, 1, 2].map((index) => {
                  const avatar = avatars[index];
                  const isExpanded = expandedAvatar === index;

                  return avatar ? (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className={cn(
                        "bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-md",
                        isExpanded && "lg:col-span-3"
                      )}
                    >
                      {/* Avatar Header */}
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-7 h-7 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {avatar.name}
                          </h3>
                        </div>
                      </div>

                      {/* Quick Preview when collapsed */}
                      {!isExpanded && avatar.identity && (
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>{avatar.identity.age_range} • {avatar.identity.job_context}</span>
                          </div>
                          <p className="text-gray-700 text-sm line-clamp-3">
                            {avatar.identity.life_situation}
                          </p>
                        </div>
                      )}

                      {/* Full Content when expanded */}
                      {isExpanded && (
                        <div className="space-y-6 mb-6">
                          
                          {/* 1. IDENTITÉ */}
                          {avatar.identity && (
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <User className="w-4 h-4 text-[#61f7a2]" />
                                IDENTITÉ DE L'AVATAR
                              </h4>
                              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                                <div><span className="font-medium text-gray-900">Âge :</span> <span className="text-gray-700">{avatar.identity.age_range}</span></div>
                                <div><span className="font-medium text-gray-900">Situation :</span> <span className="text-gray-700">{avatar.identity.life_situation}</span></div>
                                <div><span className="font-medium text-gray-900">Métier :</span> <span className="text-gray-700">{avatar.identity.job_context}</span></div>
                                <div><span className="font-medium text-gray-900">Niveau :</span> <span className="text-gray-700">{avatar.identity.experience_level}</span></div>
                              </div>
                            </div>
                          )}

                          {/* 2. ANALYSE FACTUELLE */}
                          {avatar.factual_analysis && (
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4 text-[#61f7a2]" />
                                ANALYSE FACTUELLE
                              </h4>
                              <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                                <div>
                                  <span className="font-medium text-gray-900">Situation actuelle :</span>
                                  <p className="text-gray-700 mt-1">{avatar.factual_analysis.current_situation}</p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-3 pt-2">
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{avatar.factual_analysis.budget}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{avatar.factual_analysis.available_time}</span>
                                  </div>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">Canaux :</span>
                                  <p className="text-gray-700 mt-1">{avatar.factual_analysis.channels}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">Formats préférés :</span>
                                  <p className="text-gray-700 mt-1">{avatar.factual_analysis.preferred_formats}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 3. COMPORTEMENTS & ALTERNATIVES */}
                          {avatar.behavior_alternatives && (
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-[#61f7a2]" />
                                COMPORTEMENTS & ALTERNATIVES
                              </h4>
                              <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                                <div>
                                  <span className="font-medium text-gray-900">A déjà essayé :</span>
                                  <p className="text-gray-700 mt-1">{avatar.behavior_alternatives.already_tried}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">Déceptions :</span>
                                  <p className="text-gray-700 mt-1">{avatar.behavior_alternatives.disappointments}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">Ce qu'il évite :</span>
                                  <p className="text-gray-700 mt-1">{avatar.behavior_alternatives.what_he_avoids}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">Pourquoi pas de résultats :</span>
                                  <p className="text-gray-700 mt-1">{avatar.behavior_alternatives.why_no_results_yet}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 4. STORYTELLING – DANS SA TÊTE */}
                          {avatar.in_his_head && (
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Brain className="w-4 h-4 text-[#61f7a2]" />
                                DANS SA TÊTE
                              </h4>
                              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 space-y-3 text-sm border border-blue-200">
                                <div>
                                  <span className="font-medium text-gray-900">Journée type :</span>
                                  <p className="text-gray-700 mt-1 italic">{avatar.in_his_head.typical_day}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">État émotionnel :</span>
                                  <p className="text-gray-700 mt-1">{avatar.in_his_head.dominant_emotion}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">Moment critique :</span>
                                  <p className="text-gray-700 mt-1">{avatar.in_his_head.problem_moment}</p>
                                </div>
                                <div className="bg-white/70 rounded-lg p-3 border border-blue-300">
                                  <span className="font-medium text-gray-900">💭 Sa phrase intérieure :</span>
                                  <p className="text-gray-900 mt-1 italic font-medium">"{avatar.in_his_head.inner_phrase}"</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">Déclencheur d'achat :</span>
                                  <p className="text-gray-700 mt-1">{avatar.in_his_head.trigger_to_action}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 5. MOTIVATIONS D'ACHAT */}
                          {avatar.purchase_motivations && (
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Heart className="w-4 h-4 text-[#61f7a2]" />
                                MOTIVATIONS D'ACHAT
                              </h4>
                              <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                                <div>
                                  <span className="font-medium text-gray-900">Pourquoi une formation :</span>
                                  <p className="text-gray-700 mt-1">{avatar.purchase_motivations.why_training}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">Pourquoi du coaching :</span>
                                  <p className="text-gray-700 mt-1">{avatar.purchase_motivations.why_coaching}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">Pourquoi une communauté :</span>
                                  <p className="text-gray-700 mt-1">{avatar.purchase_motivations.why_community}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">Attente réelle :</span>
                                  <p className="text-gray-700 mt-1">{avatar.purchase_motivations.real_expectation}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 6. CE QU'IL ATTEND DE L'EXPERT */}
                          {avatar.what_he_expects_from_expert && (
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-[#61f7a2]" />
                                CE QU'IL ATTEND DE TOI (L'EXPERT)
                              </h4>
                              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 space-y-3 text-sm border border-green-200">
                                <div>
                                  <span className="font-medium text-gray-900">Type d'expert recherché :</span>
                                  <p className="text-gray-700 mt-1">{avatar.what_he_expects_from_expert.expert_type}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">Ton attendu :</span>
                                  <p className="text-gray-700 mt-1">{avatar.what_he_expects_from_expert.tone}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">Niveau de proximité :</span>
                                  <p className="text-gray-700 mt-1">{avatar.what_he_expects_from_expert.proximity_level}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">Ce qui crée la confiance :</span>
                                  <p className="text-gray-700 mt-1">{avatar.what_he_expects_from_expert.trust_builders}</p>
                                </div>
                              </div>
                            </div>
                          )}
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
                    </motion.div>
                  ) : (
                    <div
                      key={index}
                      className={cn(
                        "bg-[#1b1b33] border rounded-2xl p-6 transition-all duration-300 animate-fade-in",
                        colors.border
                      )}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Empty Avatar Card */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className={cn(
                          "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                          colors.gradient
                        )}>
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white mb-1">
                            Avatar {index + 1}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            En attente de génération
                          </p>
                        </div>
                      </div>

                      <div className={cn("p-4 rounded-xl mb-4 border-2 border-dashed", colors.border)}>
                        <p className="text-gray-500 text-sm text-center py-8">
                          Clique sur "Générer" pour créer cet avatar
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Generate/Regenerate Button */}
              <div className="flex justify-center pt-4">
                {avatars.length === 0 ? (
                  <GlowButton
                    onClick={() => handleGenerate()}
                    variant="primary"
                    size="lg"
                    loading={loading}
                    className="px-12"
                  >
                    {loading ? 'Génération en cours...' : 'Générer mes avatars'}
                  </GlowButton>
                ) : (
                  <GlowButton
                    onClick={() => handleGenerate(true)}
                    variant="secondary"
                    size="default"
                    loading={loading}
                    icon={!hasPremium ? Lock : undefined}
                  >
                    {!hasPremium ? 'Premium - Régénérer' : 'Régénérer'}
                  </GlowButton>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
}