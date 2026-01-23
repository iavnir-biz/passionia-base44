import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { base44 } from '@/api/base44Client';
import { useRequirePayment } from '@/components/hooks/useRequirePayment';
import { calculateProgressFromSession } from '@/utils/progressUtils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import UpgradeModal from '@/components/paywall/UpgradeModal';
import { Sparkles, Loader2, Eye, Copy, Package, ShoppingCart, TrendingUp, Crown, Brain } from 'lucide-react';
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
  const [showPreview, setShowPreview] = useState(null);
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
    if (deliverables.length > 0 && typeof deliverables[0] === 'object') {
      deliverables = deliverables.map(d => {
        if (d.description && d.name) {
          return `${d.name}: ${d.description}`;
        }
        return d.description || d.name || `${d.type}: ${d.name || ''}`;
      });
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
      benefits: offer.benefits || [],
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

        // 🔥 PRIORITY 1: detailed_offers (complete enriched offers from generateDetailedOffers)
        if (userSession.detailed_offers) {
          const mappedOffers = {
            low: normalizeOffer(userSession.detailed_offers.mainProduct),
            bump: normalizeOffer(userSession.detailed_offers.orderBump),
            mid: normalizeOffer(userSession.detailed_offers.upsell),
            high: normalizeOffer(userSession.detailed_offers.premium)
          };
          console.log('[MyOffers] Using detailed_offers (fully enriched):', mappedOffers);
          setGeneratedOffers(mappedOffers);
        }
        // 🔥 PRIORITY 2: my_generated_offers (individually enriched offers)
        else if (userSession.my_generated_offers) {
          console.log('[MyOffers] Using my_generated_offers (individually enriched)');
          setGeneratedOffers(userSession.my_generated_offers);
        }
        // 🔥 PRIORITY 3: finalized_offer (base offers only)
        else if (userSession.finalized_offer) {
          console.log('[MyOffers] Using finalized_offer (base only)');
          const baseOffers = {
            low: userSession.finalized_offer.mainProduct,
            bump: userSession.finalized_offer.orderBump,
            mid: userSession.finalized_offer.upsell1,
            high: userSession.finalized_offer.upsell3
          };
          setGeneratedOffers(baseOffers);
        }
      } else {
        console.error('No session found for user');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleGenerateSingle = async (offerType) => {
    // Check if already enriched (not base offer)
    const isFromFinalized = session?.finalized_offer && 
      !session?.my_generated_offers?.[offerType];
    
    if (!isFromFinalized && generatedOffers?.[offerType]) {
      return; // Already enriched
    }

    setLoadingOffers(prev => ({ ...prev, [offerType]: true }));

    try {
      console.log('[MyOffers] Invoking generateMyOffers:', { sessionId: session.id, offerType });
      const response = await base44.functions.invoke('generateMyOffers', {
        sessionId: session.id,
        offerType
      });

      const enrichedOffer = response.data;
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
      console.error('Error enriching offer:', error);
      toast.error('Erreur lors de l\'enrichissement');
    } finally {
      setLoadingOffers(prev => ({ ...prev, [offerType]: false }));
    }
  };

  const handleCopy = (offer) => {
    const text = `
${offer.title}
${offer.price}

${offer.description}

Livrables:
${offer.deliverables.join('\n')}

Bénéfices:
${offer.benefits.join('\n')}
    `.trim();
    
    navigator.clipboard.writeText(text);
    toast.success('Offre copiée dans le presse-papier !');
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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar currentPage="MyOffers" progress={calculateProgressFromSession(session)} user={user} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Offres" 
          subtitle=""
          user={user}
        />
        
        <main className="p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            
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
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Tes offres complètes
              </h1>
              <p className="text-gray-600 text-lg">
                4 offres détaillées pour ton funnel de vente complet
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
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    📌 À quoi servent ces offres ?
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div className="mb-4">
                          {/* Nom de l'offre en noir au-dessus du prix */}
                          {offer.title && (
                            <h4 className="text-base font-bold text-gray-900 mb-2">
                              {offer.title}
                            </h4>
                          )}
                          <div className="text-2xl font-bold text-[#61f7a2] mb-2">
                            {offer.price}
                          </div>
                          <p className="text-gray-700 text-sm mb-3">
                            {offer.description}
                          </p>
                          
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <h4 className="text-gray-900 font-semibold text-xs mb-2">📦 Livrables</h4>
                            <ul className="space-y-1">
                              {(offer.deliverables || []).slice(0, 3).map((item, i) => (
                                <li key={i} className="text-gray-600 text-xs flex items-start gap-2">
                                  <span className="text-[#61f7a2] mt-0.5">✓</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <GlowButton
                            onClick={() => setShowPreview(offer)}
                            variant="secondary"
                            size="sm"
                            icon={Eye}
                            className="flex-1"
                          >
                            Voir
                          </GlowButton>
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

      {/* Preview Modal */}
      {showPreview && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200 shadow-xl"
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Détails de l'offre</h3>
              <button
                onClick={() => setShowPreview(null)}
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="space-y-6">
                {/* 1. L'IDENTITÉ DE L'OFFRE */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-xs font-semibold text-[#61f7a2] mb-3">🧩 L'IDENTITÉ DE L'OFFRE</h3>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{showPreview.title || "Mon Offre"}</h2>
                  {showPreview.subtitle && (
                    <p className="text-gray-600 text-sm mb-4">{showPreview.subtitle}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {showPreview.product_type && (
                      <div><span className="text-gray-500">Type:</span> <span className="text-gray-900">{showPreview.product_type}</span></div>
                    )}
                    {showPreview.level && (
                      <div><span className="text-gray-500">Niveau:</span> <span className="text-gray-900">{showPreview.level}</span></div>
                    )}
                    {showPreview.duration && (
                      <div><span className="text-gray-500">Durée:</span> <span className="text-gray-900">{showPreview.duration}</span></div>
                    )}
                    <div className="flex items-center gap-3">
                      {showPreview.original_value && (
                        <span className="text-gray-500 line-through">{showPreview.original_value}</span>
                      )}
                      <span className="text-2xl font-bold text-[#61f7a2]">{showPreview.price}</span>
                    </div>
                  </div>
                </div>

                {/* 2. À QUEL PROBLÈME CETTE OFFRE RÉPOND */}
                {showPreview.problem && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">🎯 À QUEL PROBLÈME CETTE OFFRE RÉPOND</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{showPreview.problem}</p>
                  </div>
                )}

                {/* 3. AVANT / APRÈS (TRANSFORMATION) */}
                {(showPreview.before || showPreview.after) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">🔄 AVANT / APRÈS</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {showPreview.before && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <p className="text-xs font-semibold text-red-600 mb-2">Avant</p>
                          <p className="text-gray-700 text-sm leading-relaxed">{showPreview.before}</p>
                        </div>
                      )}
                      {showPreview.after && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <p className="text-xs font-semibold text-[#61f7a2] mb-2">Après</p>
                          <p className="text-gray-700 text-sm leading-relaxed">{showPreview.after}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. CE QUE CONTIENT EXACTEMENT L'OFFRE */}
                {showPreview.deliverables && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">📦 CE QUE CONTIENT EXACTEMENT L'OFFRE</h3>
                    <ul className="space-y-2">
                      {showPreview.deliverables.map((item, i) => (
                        <li key={i} className="text-gray-700 text-sm flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <span className="text-[#61f7a2] mt-0.5">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 4B. BÉNÉFICES CONCRETS */}
                {showPreview.benefits && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">✨ BÉNÉFICES CONCRETS</h3>
                    <ul className="space-y-2">
                      {showPreview.benefits.map((item, i) => (
                        <li key={i} className="text-gray-700 text-sm flex items-start gap-2 bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200">
                          <span className="text-[#61f7a2] mt-0.5">→</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 5. COMMENT UTILISER CETTE OFFRE */}
                {showPreview.how_to_use && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">🛠 COMMENT UTILISER CETTE OFFRE</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{showPreview.how_to_use}</p>
                  </div>
                )}

                {/* 6 & 7. POUR QUI / PAS POUR QUI */}
                {(showPreview.ideal_for || showPreview.not_for) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">👤 CIBLAGE STRATÉGIQUE</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {showPreview.ideal_for && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <p className="text-xs font-semibold text-green-700 mb-2">✅ Idéal pour</p>
                          <ul className="space-y-1">
                            {showPreview.ideal_for.map((item, i) => (
                              <li key={i} className="text-gray-700 text-xs">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {showPreview.not_for && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <p className="text-xs font-semibold text-red-600 mb-2">❌ Pas adapté si</p>
                          <ul className="space-y-1">
                            {showPreview.not_for.map((item, i) => (
                              <li key={i} className="text-gray-700 text-xs">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 8. RÔLE DANS L'ÉCOSYSTÈME GLOBAL */}
                {showPreview.ecosystem_role && (
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-[#61f7a2] mb-2">🔗 RÔLE DANS L'ÉCOSYSTÈME GLOBAL</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{showPreview.ecosystem_role}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      <ChatBubble />
    </div>
  );
}