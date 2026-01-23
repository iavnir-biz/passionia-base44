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

      // 🔥 DB-first: charger Session via sessionId
      const sessionId = currentUser.sessionId;
      if (!sessionId) {
        console.error('[AvatarClients] No sessionId');
        return;
      }

      const sessions = await base44.entities.Session.filter({ id: sessionId });
      const userSession = sessions?.[0];

      if (!userSession) {
        console.error('[AvatarClients] Session not found');
        return;
      }

      setSession(userSession);
      console.log('[AvatarClients] Session loaded:', userSession);
      console.log('[AvatarClients] Generated avatars:', userSession.generated_avatars);

      // Vérifier si avatars existe et est non-vide
      if (isNonEmpty(userSession.generated_avatars)) {
        // 🔥 HANDLE BOTH FORMATS: array or object with { avatars: [...], generatedAt: "..." }
        const avatarsData = userSession.generated_avatars;

        // Si c'est un objet avec une clé 'avatars', extraire le tableau
        if (avatarsData && typeof avatarsData === 'object' && avatarsData.avatars) {
          setAvatars(avatarsData.avatars);
        }
        // Sinon, si c'est déjà un tableau, l'utiliser directement
        else if (Array.isArray(avatarsData)) {
          setAvatars(avatarsData);
        }
      }

      const profiles = await base44.entities.UserProfile.filter({
        created_by: currentUser.email
      });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        setHasPremium(profiles[0].has_paid === true);
      }
    } catch (error) {
      console.error('[AvatarClients] Error loading data:', error);
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
        sessionId: session.id,
        regenerate: isRegenerate
      });

      console.log('[AvatarClients] Response from generateAvatars:', response);

      // 🔥 HANDLE RESPONSE: backend returns { avatars: [...], generatedAt: "..." }
      const avatarsData = response.data?.avatars || response.avatars;
      const generatedAt = response.data?.generatedAt || response.generatedAt;

      if (!avatarsData || !Array.isArray(avatarsData)) {
        throw new Error('Format de réponse invalide: avatars manquants ou incorrect');
      }

      // 🔥 Sauvegarder IMMÉDIATEMENT en base (format cohérent avec backend)
      const dataToSave = {
        avatars: avatarsData,
        generatedAt: generatedAt || new Date().toISOString()
      };

      await base44.entities.Session.update(session.id, {
        generated_avatars: dataToSave
      });

      // 🔥 Mettre à jour l'état local pour affichage immédiat
      setAvatars(avatarsData);

      // 🔥 Recharger la session complète depuis la base
      const sessions = await base44.entities.Session.filter({ id: session.id });
      if (sessions.length > 0) {
        setSession(sessions[0]);
      }

      toast.success('Avatars générés avec succès et sauvegardés !');
    } catch (error) {
      console.error('[AvatarClients] Error generating avatars:', error);
      console.error('[AvatarClients] Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      toast.error('Erreur lors de la génération : ' + (error.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAvatar = (avatar) => {
    let text = `${avatar.name}\n\n`;

    if (avatar.identity) {
      text += `🎯 IDENTITÉ\n`;
      text += `Âge : ${avatar.identity.age_range}\n`;
      text += `Situation : ${avatar.identity.life_situation}\n`;
      text += `Métier : ${avatar.identity.job_context}\n`;
      text += `Niveau : ${avatar.identity.experience_level}\n\n`;
    }

    if (avatar.factual_analysis) {
      text += `📊 ANALYSE FACTUELLE\n`;
      text += `${avatar.factual_analysis.current_situation}\n`;
      text += `Budget : ${avatar.factual_analysis.budget}\n`;
      text += `Temps disponible : ${avatar.factual_analysis.available_time}\n`;
      text += `Canaux : ${avatar.factual_analysis.channels}\n`;
      text += `Formats : ${avatar.factual_analysis.preferred_formats}\n\n`;
    }

    if (avatar.behavior_alternatives) {
      text += `🔄 COMPORTEMENTS\n`;
      text += `Déjà essayé : ${avatar.behavior_alternatives.already_tried}\n`;
      text += `Déceptions : ${avatar.behavior_alternatives.disappointments}\n\n`;
    }

    if (avatar.in_his_head) {
      text += `🧠 DANS SA TÊTE\n`;
      text += `"${avatar.in_his_head.inner_phrase}"\n`;
      text += `Déclencheur : ${avatar.in_his_head.trigger_to_action}\n\n`;
    }

    if (avatar.purchase_motivations) {
      text += `💰 MOTIVATIONS D'ACHAT\n`;
      text += `Formation : ${avatar.purchase_motivations.why_training}\n`;
      text += `Coaching : ${avatar.purchase_motivations.why_coaching}\n\n`;
    }

    if (avatar.what_he_expects_from_expert) {
      text += `👤 CE QU'IL ATTEND DE TOI\n`;
      text += `Type d'expert : ${avatar.what_he_expects_from_expert.expert_type}\n`;
      text += `Ton : ${avatar.what_he_expects_from_expert.tone}\n`;
      text += `Confiance : ${avatar.what_he_expects_from_expert.trust_builders}\n`;
    }

    navigator.clipboard.writeText(text.trim());
    toast.success('Avatar copié !');
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
          subtitle=""
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
                        <div className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
                          avatarColors[index].bg,
                          `border-2 ${avatarColors[index].border}`
                        )}>
                          <User className={cn("w-7 h-7", `bg-gradient-to-br ${avatarColors[index].gradient} bg-clip-text text-transparent`)} />
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
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-gray-400 transition-all"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-7 h-7 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            Avatar {index + 1}
                          </h3>
                          <p className="text-gray-500 text-sm">
                            En attente de génération
                          </p>
                        </div>
                      </div>

                      <div className="py-8 text-center">
                        <p className="text-gray-400 text-sm">
                          Clique sur "Générer mes avatars" ci-dessous
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Generate/Regenerate Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center pt-4"
              >
                {(!avatars || avatars.length === 0 || !avatars[0]?.name) ? (
                  <GlowButton
                    onClick={() => handleGenerate()}
                    variant="primary"
                    size="lg"
                    loading={loading}
                    className="px-12"
                  >
                    {loading ? 'Noah génère tes avatars...' : 'Générer mes avatars'}
                  </GlowButton>
                ) : (
                  <GlowButton
                    onClick={() => handleGenerate(true)}
                    variant="secondary"
                    size="default"
                    loading={loading}
                    icon={!hasPremium ? Lock : undefined}
                  >
                    {!hasPremium ? '🔒 Régénérer (Premium)' : 'Régénérer les avatars'}
                  </GlowButton>
                )}
              </motion.div>
            </div>

            {/* Help Section */}
            {avatars.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#61f7a2] flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      💡 Comment utiliser ces avatars ?
                    </h3>
                    <p className="text-gray-700 text-sm mb-3">
                      Ces profils sont maintenant la base de toute ta communication. Quand tu écris un message, un email, ou que tu crées du contenu, réfère-toi à ces avatars pour :
                    </p>
                    <ul className="space-y-1.5 text-sm text-gray-700">
                      <li>✓ Utiliser les mots qu'ils utilisent (vocabulaire, expressions)</li>
                      <li>✓ Parler de leurs frustrations exactes</li>
                      <li>✓ Montrer que tu comprends leur quotidien</li>
                      <li>✓ Adresser leurs peurs et objections</li>
                      <li>✓ Choisir les bons canaux et formats</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </main>
      </div>

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      <ChatBubble />
    </div>
  );
}