import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Loader2,
  TrendingUp,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  CheckCircle,
  Package,
  BarChart3,
  Sprout,
  Map
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import OfferTransition from '@/components/offer/OfferTransition';
import OnboardingSidebar from '@/components/onboarding/OnboardingSidebar';
import { cn } from "@/lib/utils";

const mainSteps = [
  { id: 1, label: "Tes offres", icon: Package, color: "from-orange-500 to-red-500" },
  { id: 2, label: "Ton marché", icon: BarChart3, color: "from-green-500 to-emerald-500" },
  { id: 3, label: "Ta vie future", icon: Sprout, color: "from-amber-500 to-yellow-500" },
  { id: 4, label: "Ton plan d'action", icon: Map, color: "from-indigo-500 to-purple-500" },
];

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

export default function OfferTaVieFuture() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [futureVision, setFutureVision] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (session && !futureVision) {
      generateFutureVision();
    }
  }, [session, futureVision]);

  const loadSession = async () => {
    try {
      const currentUser = await base44.auth.me();
      const realSessionId = currentUser.sessionId;

      if (!realSessionId) {
        console.error('❌ No sessionId');
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      const sessions = await base44.entities.Session.filter({ id: realSessionId });
      if (!sessions || sessions.length === 0) {
        console.error('❌ Session not found');
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      const loadedSession = sessions[0];

      // 🔥 P0-1: Vérifier potential_revenue
      if (!loadedSession.potential_revenue || loadedSession.potential_revenue === 0) {
        console.warn('⚠️ potential_revenue = 0, redirect OfferResume');
        navigate(createPageUrl('OfferResume'));
        return;
      }

      // 🔥 P0-1: Vérifier finalized_offer
      if (!loadedSession.finalized_offer || !loadedSession.is_offer_complete) {
        console.warn('⚠️ Offre incomplète, redirect OfferResume');
        navigate(createPageUrl('OfferResume'));
        return;
      }

      console.log('✅ Session chargée:', {
        sessionId: loadedSession.id,
        potential_revenue: loadedSession.potential_revenue,
        is_offer_complete: loadedSession.is_offer_complete,
        has_future_vision: !!loadedSession.future_vision
      });

      setSession(loadedSession);
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFutureVision = async () => {
    if (!session?.id) return;

    setIsGenerating(true);
    try {
      const { data } = await base44.functions.invoke('generateFutureVision', {
        sessionId: session.id
      });

      if (data.success) {
        setFutureVision({
          narrativeText: data.narrativeText
        });
      }
    } catch (error) {
      console.error('Error generating vision:', error);
      const skill = session.skill || session.onboarding_summary?.who_to_teach || 'ta compétence';
      setFutureVision({
        narrativeText: `Imagine-toi, dans quelques mois… Tu te réveilles le matin en sachant que des dizaines de personnes comptent sur toi pour progresser en ${skill}.\n\nTu as réussi à structurer ton savoir-faire en une offre claire, accessible, et qui résonne avec ton audience. Chaque jour, de nouvelles personnes découvrent ton travail et décident de te faire confiance.\n\nTu n'es plus seul(e) à avancer. Ta communauté grandit, tes témoignages s'accumulent, et tu ressens cette fierté profonde d'avoir osé franchir le pas.\n\nCette vie, elle t'attend. Il te suffit maintenant de passer à l'action, étape par étape.`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = () => {
    setShowTransition(true);
  };

  const handleTransitionComplete = () => {
    navigate(createPageUrl('OfferConcretement'));
  };

  if (isLoading || isGenerating) {
    return <OfferTransition message={isGenerating ? "Noah écrit ta vision future..." : "Chargement..."} />;
  }

  if (showTransition) {
    return <OfferTransition message="Noah prépare ton plan de route..." onComplete={handleTransitionComplete} />;
  }

  // 🔥 P0-1: Source of truth = session.finalized_offer
  const finalizedOffer = session?.finalized_offer || {};
  const potentialRevenue = session?.potential_revenue || 0;

  const products = [
    { key: 'mainProduct', label: 'Produit Principal', data: finalizedOffer.mainProduct, multiplier: 30 },
    { key: 'orderBump', label: 'Order Bump', data: finalizedOffer.orderBump, multiplier: 15 },
    { key: 'upsell1', label: 'Upsell', data: finalizedOffer.upsell1, multiplier: 9 },
    { key: 'upsell3', label: 'Premium', data: finalizedOffer.upsell3, multiplier: 1 }
  ].filter(p => p.data);

  const revenues = products.map(p => ({
    ...p,
    price: parsePrice(p.data?.price),
    total: parsePrice(p.data?.price) * p.multiplier
  }));

  // 🔥 P0-5: Clé correcte targetIncome
  const revenueGoal = parseInt(session?.onboarding_full?.targetIncome) || 500;

  // Calculate the multiplier to reach the goal from potential_revenue
  const multiplier = potentialRevenue > 0 ? revenueGoal / potentialRevenue : 1;

  // Apply the multiplier to each product's sales count to maintain proportions
  const salesNeeded = revenues.map(r => {
    if (r.price === 0) return { ...r, salesNeeded: 0, projectedRevenue: 0 };

    // Scale up the current multiplier by the goal ratio
    const targetSales = Math.ceil(r.multiplier * multiplier);
    const projectedRevenue = targetSales * r.price;

    return {
      ...r,
      salesNeeded: targetSales,
      projectedRevenue
    };
  });

  // Calculate total projected revenue to verify
  const totalProjected = salesNeeded.reduce((sum, item) => sum + item.projectedRevenue, 0);

  const completedSteps = [1, 2, 3, 4, 5]; // Jusqu'à Ton marché complété

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex">
      <OnboardingSidebar currentPage="OfferTaVieFuture" completedSteps={completedSteps} progressInStep={0} />

      {/* Content */}
      <div className="flex-1 w-full flex flex-col lg:ml-80 pt-32 lg:pt-0 overflow-x-hidden relative">
        <div className="py-6 md:py-12">
          <div className="max-w-3xl mx-auto px-4">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
                ✨ Voici ce que ta vie future te réserve…
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center mb-8"
            >
              <GlowButton onClick={handleContinue} size="lg" className="w-full md:w-auto px-6 md:px-10 text-sm md:text-base">
                Voir le Plan de mise en place CONCRÈTE
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
              </GlowButton>
            </motion.div>

            {/* Narrative Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 md:p-8 mb-6"
            >
              <div className="flex items-start gap-4 mb-6">
                <motion.div
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center flex-shrink-0 shadow-lg"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Ta vision personnalisée
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Une projection inspirante basée sur ton parcours
                  </p>
                </div>
              </div>

              {isGenerating ? (
                <div className="flex items-center gap-3 py-8">
                  <Loader2 className="w-5 h-5 text-[#61f7a2] animate-spin" />
                  <span className="text-gray-600">Génération de ta vision en cours...</span>
                </div>
              ) : (
                <div className="space-y-5">
                  {futureVision?.narrativeText.split('\n\n').map((paragraph, idx) => (
                    <motion.p
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="text-gray-700 leading-relaxed text-base"
                    >
                      {paragraph}
                    </motion.p>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Revenue Calculation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#1b1b33] rounded-3xl border border-[#2a2a45] p-8 mb-6 shadow-lg"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center flex-shrink-0 shadow-lg">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white leading-tight">
                    Ton Potentiel de Revenus Mensuels
                  </h2>
                  <p className="text-gray-400 text-[10px] md:text-sm mt-0.5">
                    Basé sur une hypothèse d'une vente par jour
                  </p>
                </div>
              </div>

              {/* Big Number */}
              <motion.div
                className="text-center py-6 md:py-8"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <span className="text-4xl md:text-7xl font-bold text-[#61f7a2]">
                  {potentialRevenue.toLocaleString('fr-FR')} €
                </span>
                <p className="text-gray-400 mt-2 md:mt-3 text-base md:text-lg font-medium">par mois</p>
              </motion.div>

              {/* Toggle Detail */}
              <button
                onClick={() => setShowDetail(!showDetail)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-[#61f7a2] hover:bg-[#2a2a45] transition-all font-medium"
              >
                {showDetail ? (
                  <>
                    Cacher le détail <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Voir le détail <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Detail Breakdown */}
              {showDetail && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-[#2a2a45] pt-4 mt-2 space-y-3"
                >
                  {revenues.map((rev) => (
                    <div
                      key={rev.key}
                      className="flex items-center justify-between py-3 px-4 bg-[#11112b] rounded-2xl border border-[#2a2a45]"
                    >
                      <div>
                        <span className="text-white text-sm font-semibold">{rev.label}</span>
                        <p className="text-gray-400 text-xs">×{rev.multiplier} ventes/mois</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[#61f7a2] font-bold">{rev.total.toLocaleString('fr-FR')} €</span>
                        <p className="text-gray-400 text-xs">{rev.price} € × {rev.multiplier}</p>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between py-4 px-4 bg-[#2a2a45] rounded-2xl border-2 border-[#61f7a2]/30">
                    <span className="text-white font-bold">Total Mensuel</span>
                    <span className="text-[#61f7a2] font-bold text-xl">
                      {potentialRevenue.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Roadmap to Goal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-yellow-50 to-white rounded-3xl border-2 border-yellow-300/50 p-5 md:p-8 mb-8 shadow-lg"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Target className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">
                  Ton Plan de Route pour Atteindre ton Objectif
                </h2>
                <p className="text-gray-600 text-[11px] md:text-sm mt-0.5">
                  Scénario indicatif pour atteindre {revenueGoal.toLocaleString('fr-FR')}€/mois
                  {totalProjected > 0 && (
                    <span className="block mt-1 text-emerald-600 font-semibold">
                      → Projection totale : {totalProjected.toLocaleString('fr-FR')}€/mois
                    </span>
                  )}
                </p>
              </div>

              <div className="space-y-3">
                {salesNeeded.map((item, idx) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="flex items-center justify-between py-3 md:py-4 px-4 md:px-5 bg-white rounded-2xl border border-gray-200 shadow-sm"
                  >
                    <div>
                      <span className="text-gray-900 text-sm font-semibold truncate block max-w-[150px] md:max-w-none">{item.label}</span>
                      <p className="text-gray-500 text-[10px] md:text-xs">{item.price} € par vente</p>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                      <span className="text-yellow-600 font-bold text-base md:text-lg">
                        {item.salesNeeded} ventes
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-6 p-5 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200"
              >
                <p className="text-gray-700 text-sm text-center leading-relaxed">
                  💡 <strong className="text-gray-900">Astuce :</strong> Commence par te concentrer sur ton Produit Principal pour valider le marché, puis ajoute progressivement les autres offres. Ces volumes sont indicatifs et s'ajustent avec ton expérience.
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center"
            >
              <GlowButton onClick={handleContinue} size="lg" className="w-full md:w-auto px-6 md:px-12 text-sm md:text-base">
                Voir le Plan de mise en place CONCRÈTE
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
              </GlowButton>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Transition Animation */}
      {showTransition && (
        <OfferTransition
          message="Noah prépare ton plan de route..."
          onComplete={handleTransitionComplete}
        />
      )}
    </div>
  );
}