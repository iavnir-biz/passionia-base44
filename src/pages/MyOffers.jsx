import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRequirePayment } from '@/components/hooks/useRequirePayment';
import { calculateProgressFromSession } from '@/utils/progressUtils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import UpgradeModal from '@/components/paywall/UpgradeModal';
import { Sparkles, Loader2, Copy, Package, ShoppingCart, TrendingUp, Crown, Brain, Download, FileText, Video, FileCheck, Users, Clock, Target } from 'lucide-react';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import GlowButton from '@/components/ui/GlowButton';
import ChatBubble from '@/components/chat/ChatBubble';
import { cn } from "@/lib/utils";

export default function MyOffers() {
  const { isAuthenticated, hasPurchased, isLoading: authLoading } = useRequirePayment();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loadingOffers, setLoadingOffers] = useState({});
  const [generatedOffers, setGeneratedOffers] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [hasPremium, setHasPremium] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Normalize offer data from different sources to a common format
  const normalizeOffer = (offer) => {
    if (!offer) return null;

    // Transform deliverables if they're objects {type, name, description, duration}
    let deliverables = offer.deliverables || [];
    if (deliverables.length > 0 && typeof deliverables[0] === 'object' && deliverables[0] !== null) {
      deliverables = deliverables.map(d => {
        if (d.description && d.name) {
          return `${d.name}: ${d.description}`;
        }
        return d.description || d.name || `${d.type || ''}: ${d.name || ''}`;
      });
    }

    // Transform benefits if needed
    let benefits = offer.benefits || [];
    if (benefits.length > 0 && typeof benefits[0] === 'object' && benefits[0] !== null) {
      benefits = benefits.map(b => {
        if (typeof b === 'string') return b;
        return b.description || b.benefit || b.name || '';
      }).filter(b => b);
    }

    // Transform ideal_for and not_for if needed
    const idealFor = Array.isArray(offer.idealFor || offer.ideal_for)
      ? (offer.idealFor || offer.ideal_for)
      : [];
    const notFor = Array.isArray(offer.notFor || offer.not_for)
      ? (offer.notFor || offer.not_for)
      : [];

    return {
      title: offer.title,
      price: offer.price,
      subtitle: offer.subtitle,
      description: offer.problem || offer.description || '',
      product_type: offer.productType || offer.product_type,
      level: offer.level,
      duration: offer.duration || offer.timeline,
      problem: offer.problem,
      before: offer.before,
      after: offer.after,
      deliverables: deliverables,
      benefits: benefits,
      how_to_use: offer.howToUse || offer.how_to_use,
      ideal_for: idealFor,
      not_for: notFor,
      ecosystem_role: offer.ecosystemRole || offer.ecosystem_role
    };
  };

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

      const sessionId = currentUser.sessionId;
      if (!sessionId) {
        console.error('[MyOffers] No sessionId');
        return;
      }

      const sessions = await base44.entities.Session.filter({ id: sessionId });

      if (sessions.length > 0) {
        const userSession = sessions[0];
        setSession(userSession);
        console.log('[MyOffers] Session loaded:', userSession);
        console.log('[MyOffers] Detailed offers:', userSession.detailed_offers);
        console.log('[MyOffers] My generated offers:', userSession.my_generated_offers);
        console.log('[MyOffers] Finalized offer (base):', userSession.finalized_offer);

        let baseOffers = {};

        // 1. Start with finalized_offer (bare minimum)
        if (userSession.finalized_offer) {
          baseOffers = {
            low: normalizeOffer(userSession.finalized_offer.mainProduct),
            bump: normalizeOffer(userSession.finalized_offer.orderBump),
            mid: normalizeOffer(userSession.finalized_offer.upsell1),
            high: normalizeOffer(userSession.finalized_offer.upsell3)
          };
        }

        // 2. Override with detailed_offers if available (bulk generation)
        if (userSession.detailed_offers) {
          const detailOffers = {
            low: normalizeOffer(userSession.detailed_offers.mainProduct),
            bump: normalizeOffer(userSession.detailed_offers.orderBump),
            mid: normalizeOffer(userSession.detailed_offers.upsell),
            high: normalizeOffer(userSession.detailed_offers.premium)
          };

          // Only merge if detailed_offers has content
          if (Object.keys(detailOffers).length > 0) {
            baseOffers = { ...baseOffers, ...detailOffers };
          }
        }

        // 3. Override with my_generated_offers (individual generation - HIGHEST PRIORITY)
        // This ensures that when a user manually enriches an offer, they see THAT version
        if (userSession.my_generated_offers) {
          console.log('[MyOffers] Merging manual updates:', userSession.my_generated_offers);
          baseOffers = { ...baseOffers, ...userSession.my_generated_offers };
        }

        console.log('[MyOffers] Final merged offers:', baseOffers);
        setGeneratedOffers(baseOffers);
      } else {
        console.error('No session found for user');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleGenerateSingle = async (offerType) => {
    console.log('🔵 [MyOffers] handleGenerateSingle called with offerType:', offerType);

    if (!session || !session.id) {
      console.error('❌ [MyOffers] No session available');
      toast.error('Session non disponible. Veuillez recharger la page.');
      return;
    }

    console.log('✅ [MyOffers] Starting enrichment for:', offerType);
    console.log('✅ [MyOffers] Session ID:', session.id);
    setLoadingOffers(prev => ({ ...prev, [offerType]: true }));

    try {
      console.log('📤 [MyOffers] Invoking generateMyOffers:', { sessionId: session.id, offerType });
      const response = await base44.functions.invoke('generateMyOffers', {
        sessionId: session.id,
        offerType
      });

      console.log('📥 [MyOffers] Response received:', response);

      // The backend returns { success: true, ...enrichedOffer } directly
      // base44.functions.invoke wraps it in { data: ... }
      const responseData = response.data || response;

      if (responseData.error) {
        throw new Error(responseData.error);
      }

      if (!responseData.success && !responseData.title) {
        throw new Error('Invalid response format from backend');
      }

      // Remove the 'success' field if present, keep only offer data
      const { success, ...enrichedOffer } = responseData;
      console.log('✨ [MyOffers] Enriched offer:', enrichedOffer);

      const updatedOffers = {
        ...generatedOffers,
        [offerType]: enrichedOffer
      };

      setGeneratedOffers(updatedOffers);

      await base44.entities.Session.update(session.id, {
        my_generated_offers: updatedOffers
      });

      // Reload for confirmation
      await loadData();

      toast.success('Offre enrichie !');
    } catch (error) {
      console.error('❌ [MyOffers] Error enriching offer:', error);
      console.error('❌ [MyOffers] Error details:', error.message, error.stack);
      toast.error(`Erreur: ${error.message || 'Erreur lors de l\'enrichissement'}`);
    } finally {
      setLoadingOffers(prev => ({ ...prev, [offerType]: false }));
    }
  };

  // Get icon for deliverable type
  const getDeliverableIcon = (item) => {
    const lowerItem = item.toLowerCase();
    if (lowerItem.includes('vidéo') || lowerItem.includes('video')) return Video;
    if (lowerItem.includes('pdf') || lowerItem.includes('document')) return FileText;
    if (lowerItem.includes('template') || lowerItem.includes('modèle')) return FileCheck;
    if (lowerItem.includes('session') || lowerItem.includes('coaching')) return Users;
    return Package;
  };

  const handleCopy = (offer) => {
    const text = `
${offer.title}
${offer.price}

${offer.subtitle || ''}

${offer.description}

Livrables:
${offer.deliverables.join('\n')}

Bénéfices:
${offer.benefits.join('\n')}

Pour qui:
${offer.ideal_for?.slice(0, 3).join('\n') || ''}

Rôle dans le funnel:
${offer.ecosystem_role || ''}
    `.trim();

    navigator.clipboard.writeText(text);
    toast.success('Offre copiée dans le presse-papier !');
  };

  const handleDownloadPDF = (offer, offerTypeName) => {
    // TODO: Implement PDF generation
    toast.info('Génération du PDF en cours...');
  };

  const offerTypes = [
    {
      id: 'low',
      title: 'Produit d\'appel',
      subtitle: 'Low ticket',
      description: 'Ton offre d\'entrée de gamme',
      icon: Package,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'bump',
      title: 'Vente additionnelle',
      subtitle: 'Order bump',
      description: 'Complément immédiat à ton offre',
      icon: ShoppingCart,
      color: 'from-green-500 to-green-600',
    },
    {
      id: 'mid',
      title: 'Offre intermédiaire',
      subtitle: 'Mid ticket',
      description: 'Ton offre premium',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'high',
      title: 'Offre premium',
      subtitle: 'High ticket',
      description: 'Ton offre haut de gamme',
      icon: Crown,
      color: 'from-yellow-500 to-amber-600',
    }
  ];

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        currentPage="MyOffers"
        progress={calculateProgressFromSession(session)}
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 ml-0 lg:ml-72">
        <TopBar
          title="Offres"
          subtitle=""
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="p-4 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full mb-4">
                <Brain className="w-4 h-4 text-[#61f7a2]" />
                <span className="text-xs font-medium text-gray-700">Générateur d'offres</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                Tes offres complètes
              </h1>
              <p className="text-gray-600 text-base lg:text-lg">
                4 offres détaillées pour ton funnel de vente complet
              </p>
            </motion.div>

            {/* Purpose Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-blue-50 border border-blue-200 rounded-2xl p-4 lg:p-6"
            >
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    📌 À quoi servent ces offres ?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-[#61f7a2]">✓</span>
                      <span>Structurer ton écosystème de revenus</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#61f7a2]">✓</span>
                      <span>Clarifier quoi vendre et à qui</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#61f7a2]">✓</span>
                      <span>Guider ton futur élève étape par étape</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#61f7a2]">✓</span>
                      <span>Faciliter tes pages de vente et messages</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Offer Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {offerTypes.map((offerType, index) => {
                const offer = generatedOffers?.[offerType.id];
                const Icon = offerType.icon;
                const isLoading = loadingOffers[offerType.id];

                return (
                  <motion.div
                    key={offerType.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="bg-gray-50 border border-gray-200 rounded-2xl p-6 transition-all hover:shadow-md"
                  >
                    {/* Icon Header */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${offerType.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Title */}
                    <div className="mb-4">
                      <p className="text-[#61f7a2] text-xs font-semibold uppercase tracking-wide mb-1">
                        {offerType.subtitle}
                      </p>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {offerType.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {offerType.description}
                      </p>
                    </div>

                    {/* Generated Content or Generate Button */}
                    {offer ? (
                      <>
                        <div className="space-y-4 mb-4">
                          {/* Nom de l'offre + Subtitle */}
                          <div>
                            {offer.title && (
                              <h4 className="text-base font-bold text-gray-900 mb-1">
                                {offer.title}
                              </h4>
                            )}
                            {offer.subtitle && (
                              <p className="text-gray-600 text-xs italic mb-2">
                                {offer.subtitle}
                              </p>
                            )}
                            <div className="text-2xl font-bold text-[#61f7a2] mb-2">
                              {offer.price}
                            </div>
                            {/* Description si pas de données PSSO enrichies */}
                            {offer.description && !offer.before && !offer.after && (
                              <p className="text-gray-600 text-xs">
                                {offer.description}
                              </p>
                            )}
                          </div>

                          {/* Avant → Après (Transformation) */}
                          {(offer.before || offer.after) && (
                            <div className="bg-gradient-to-r from-red-50 to-green-50 rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-gray-700">🔄 Transformation</span>
                              </div>
                              <div className="space-y-1 text-xs">
                                {offer.before && (
                                  <p className="text-gray-600">
                                    <span className="text-red-600 font-semibold">❌ Avant:</span> {offer.before.split('.')[0]}.
                                  </p>
                                )}
                                {offer.after && (
                                  <p className="text-gray-700">
                                    <span className="text-green-600 font-semibold">✅ Après:</span> {offer.after.split('.')[0]}.
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Top 3 Bénéfices */}
                          {offer.benefits && offer.benefits.length > 0 && (
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <h4 className="text-gray-900 font-semibold text-xs mb-2">✨ Bénéfices clés</h4>
                              <ul className="space-y-1">
                                {offer.benefits.slice(0, 3).map((item, i) => (
                                  <li key={i} className="text-gray-700 text-xs flex items-start gap-2">
                                    <span className="text-[#61f7a2] mt-0.5">→</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Livrables avec icônes */}
                          {offer.deliverables && offer.deliverables.length > 0 && (
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <h4 className="text-gray-900 font-semibold text-xs mb-2">📦 Ce que tu reçois</h4>
                              <ul className="space-y-1.5">
                                {offer.deliverables.slice(0, 4).map((item, i) => {
                                  const DeliverableIcon = getDeliverableIcon(item);
                                  return (
                                    <li key={i} className="text-gray-700 text-xs flex items-start gap-2">
                                      <DeliverableIcon className="w-3.5 h-3.5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                                      <span>{item}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}

                          {/* Message si pas enrichi */}
                          {(!offer.before && !offer.after && !offer.benefits?.length) && (
                            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                              <p className="text-xs text-yellow-800">
                                💡 <span className="font-semibold">Offre de base</span> - Clique sur "Enrichir avec l'IA" ci-dessous pour générer l'analyse PSSO complète (transformation, bénéfices, ciblage, etc.)
                              </p>
                            </div>
                          )}

                          {/* Pour qui + Durée */}
                          <div className="grid grid-cols-1 gap-2">
                            {offer.ideal_for && offer.ideal_for.length > 0 && (
                              <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-200">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Target className="w-3.5 h-3.5 text-blue-600" />
                                  <span className="text-xs font-semibold text-blue-900">Idéal pour</span>
                                </div>
                                <p className="text-xs text-blue-800">
                                  {offer.ideal_for.slice(0, 2).join(' • ')}
                                </p>
                              </div>
                            )}

                            {offer.duration && (
                              <div className="bg-purple-50 rounded-lg p-2.5 border border-purple-200">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                                  <span className="text-xs font-semibold text-purple-900">Durée:</span>
                                  <span className="text-xs text-purple-800">{offer.duration}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Rôle dans le funnel */}
                          {offer.ecosystem_role && (
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-2.5 border border-yellow-200">
                              <p className="text-xs text-gray-700">
                                <span className="font-semibold">🔗 Rôle:</span> {offer.ecosystem_role.split('.')[0]}.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {/* Si pas enrichi, proposer d'enrichir */}
                          {(!offer.before && !offer.after && !offer.benefits?.length) ? (
                            <GlowButton
                              onClick={() => handleGenerateSingle(offerType.id)}
                              variant="primary"
                              size="sm"
                              loading={loadingOffers[offerType.id]}
                              icon={Sparkles}
                              className="flex-1"
                            >
                              {loadingOffers[offerType.id] ? 'Enrichissement...' : 'Enrichir avec l\'IA'}
                            </GlowButton>
                          ) : (
                            <GlowButton
                              onClick={() => handleDownloadPDF(offer, offerType.title)}
                              variant="secondary"
                              size="sm"
                              icon={Download}
                              className="flex-1"
                            >
                              PDF
                            </GlowButton>
                          )}
                          <GlowButton
                            onClick={() => handleCopy(offer)}
                            variant="ghost"
                            size="sm"
                            icon={Copy}
                          >
                            Copier
                          </GlowButton>
                        </div>
                      </>
                    ) : (
                      <GlowButton
                        onClick={() => handleGenerateSingle(offerType.id)}
                        variant="primary"
                        size="default"
                        loading={isLoading}
                        icon={Sparkles}
                        className="w-full"
                      >
                        {isLoading ? 'Nova enrichit ton offre...' : 'Détailler avec l\'IA'}
                      </GlowButton>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      <ChatBubble />
    </div>
  );
}