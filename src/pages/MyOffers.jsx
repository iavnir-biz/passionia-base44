import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { toast } from 'sonner';
import UpgradeModal from '@/components/paywall/UpgradeModal';
import { Sparkles, Loader2, Eye, Copy, Download, Lock, Package, ShoppingCart, TrendingUp, Crown } from 'lucide-react';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import GlowButton from '@/components/ui/GlowButton';
import { cn } from "@/lib/utils";

export default function MyOffers() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedOffers, setGeneratedOffers] = useState(null);
  const [showPreview, setShowPreview] = useState(null);
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
        if (sessions[0].my_generated_offers) {
          setGeneratedOffers(sessions[0].my_generated_offers);
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
      const response = await base44.functions.invoke('generateMyOffers', {
        profile,
        session
      });

      setGeneratedOffers(response.data);

      // Save to session
      await base44.entities.Session.update(session.id, {
        my_generated_offers: response.data
      });

      toast.success('Offres générées avec succès !');
    } catch (error) {
      console.error('Error generating offers:', error);
      toast.error('Erreur lors de la génération');
    } finally {
      setLoading(false);
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
      <div className="flex items-center justify-center h-screen bg-[#11112b]">
        <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#11112b]">
      <Sidebar currentPage="MyOffers" progress={0} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Offres" 
          subtitle="Tes 4 offres complètes générées par l'IA"
          user={user}
        />
        
        <main className="p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1b1b33] rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-[#61f7a2]" />
                <span className="text-sm text-gray-300">Offres générées par IA</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">
                Tes Offres Complètes
              </h1>
              <p className="text-gray-400 text-lg">
                4 offres détaillées adaptées à ton funnel de vente
              </p>
            </div>

            {/* Offer Cards */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {offerTypes.map((offerType, index) => {
                  const offer = generatedOffers?.[offerType.id];
                  const Icon = offerType.icon;
                  
                  return (
                    <div
                      key={offerType.id}
                      className={cn(
                        "bg-[#1b1b33] border border-[#2a2a45] rounded-2xl p-6 transition-all duration-300 hover:border-[#61f7a2]/30 hover:shadow-xl animate-fade-in"
                      )}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Gradient Header */}
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${offerType.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Content */}
                      <div className="mb-4">
                        <p className="text-[#61f7a2] text-sm mb-1">{offerType.subtitle}</p>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {offerType.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                          {offerType.description}
                        </p>
                      </div>

                      {/* Generated Content or Generate Button */}
                      {offer ? (
                        <>
                          <div className="mb-4">
                            <div className="text-2xl font-bold text-[#61f7a2] mb-2">
                              {offer.price}
                            </div>
                            <p className="text-gray-300 text-sm mb-3">
                              {offer.description}
                            </p>
                            
                            <div>
                              <h4 className="text-white font-semibold text-sm mb-2">📦 Livrables</h4>
                              <ul className="space-y-1">
                                {offer.deliverables.slice(0, 3).map((item, i) => (
                                  <li key={i} className="text-gray-400 text-xs flex items-start gap-2">
                                    <span className="text-[#61f7a2] mt-0.5">•</span>
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
                              variant="outline"
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
                          onClick={() => handleGenerate(false)}
                          variant="primary"
                          size="default"
                          loading={loading}
                          className="w-full"
                        >
                          {loading ? 'Génération...' : 'Générer'}
                        </GlowButton>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Regenerate Button (only if offers are generated) */}
              {generatedOffers && (
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
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1b1b33] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-[#2a2a45]">
            <div className="p-6 border-b border-[#2a2a45] flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Détails de l'offre</h3>
              <button
                onClick={() => setShowPreview(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="space-y-6">
                {/* 1. L'IDENTITÉ DE L'OFFRE */}
                <div className="bg-[#2a2a45]/30 rounded-xl p-5 border border-[#2a2a45]">
                  <h3 className="text-xs font-semibold text-[#61f7a2] mb-3">🧩 L'IDENTITÉ DE L'OFFRE</h3>
                  <h2 className="text-2xl font-bold text-white mb-2">{showPreview.title}</h2>
                  {showPreview.subtitle && (
                    <p className="text-gray-400 text-sm mb-4">{showPreview.subtitle}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {showPreview.product_type && (
                      <div><span className="text-gray-500">Type:</span> <span className="text-white">{showPreview.product_type}</span></div>
                    )}
                    {showPreview.level && (
                      <div><span className="text-gray-500">Niveau:</span> <span className="text-white">{showPreview.level}</span></div>
                    )}
                    {showPreview.duration && (
                      <div><span className="text-gray-500">Durée:</span> <span className="text-white">{showPreview.duration}</span></div>
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
                    <h3 className="text-sm font-semibold text-white mb-2">🎯 À QUEL PROBLÈME CETTE OFFRE RÉPOND</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{showPreview.problem}</p>
                  </div>
                )}

                {/* 3. AVANT / APRÈS (TRANSFORMATION) */}
                {(showPreview.before || showPreview.after) && (
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">🔄 AVANT / APRÈS</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {showPreview.before && (
                        <div className="bg-[#2a2a45]/50 border border-red-500/20 rounded-xl p-4">
                          <p className="text-xs font-semibold text-red-400 mb-2">Avant</p>
                          <p className="text-gray-300 text-sm leading-relaxed">{showPreview.before}</p>
                        </div>
                      )}
                      {showPreview.after && (
                        <div className="bg-[#2a2a45]/50 border border-[#61f7a2]/20 rounded-xl p-4">
                          <p className="text-xs font-semibold text-[#61f7a2] mb-2">Après</p>
                          <p className="text-gray-300 text-sm leading-relaxed">{showPreview.after}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. CE QUE CONTIENT EXACTEMENT L'OFFRE */}
                {showPreview.deliverables && (
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">📦 CE QUE CONTIENT EXACTEMENT L'OFFRE</h3>
                    <ul className="space-y-2">
                      {showPreview.deliverables.map((item, i) => (
                        <li key={i} className="text-gray-300 text-sm flex items-start gap-2 bg-[#2a2a45]/30 p-3 rounded-lg">
                          <span className="text-[#61f7a2] mt-0.5">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 5. COMMENT UTILISER CETTE OFFRE */}
                {showPreview.how_to_use && (
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-2">🛠 COMMENT UTILISER CETTE OFFRE</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{showPreview.how_to_use}</p>
                  </div>
                )}

                {/* 6 & 7. POUR QUI / PAS POUR QUI */}
                {(showPreview.ideal_for || showPreview.not_for) && (
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">👤 CIBLAGE STRATÉGIQUE</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {showPreview.ideal_for && (
                        <div className="bg-[#2a2a45]/50 border border-[#61f7a2]/20 rounded-xl p-4">
                          <p className="text-xs font-semibold text-[#61f7a2] mb-2">✅ Idéal pour</p>
                          <ul className="space-y-1">
                            {showPreview.ideal_for.map((item, i) => (
                              <li key={i} className="text-gray-300 text-xs">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {showPreview.not_for && (
                        <div className="bg-[#2a2a45]/50 border border-red-500/20 rounded-xl p-4">
                          <p className="text-xs font-semibold text-red-400 mb-2">❌ Pas adapté si</p>
                          <ul className="space-y-1">
                            {showPreview.not_for.map((item, i) => (
                              <li key={i} className="text-gray-300 text-xs">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 8. RÔLE DANS L'ÉCOSYSTÈME GLOBAL */}
                {showPreview.ecosystem_role && (
                  <div className="bg-gradient-to-r from-[#61f7a2]/10 to-[#61f7a2]/5 border border-[#61f7a2]/30 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-[#61f7a2] mb-2">🔗 RÔLE DANS L'ÉCOSYSTÈME GLOBAL</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{showPreview.ecosystem_role}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
}