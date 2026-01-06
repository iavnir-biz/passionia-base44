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
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [futureVision, setFutureVision] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [offerData, setOfferData] = useState({});

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user && !futureVision) {
      generateFutureVision();
    }
  }, [user]);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      // Récupérer la session pour les offres
      if (currentUser.sessionId) {
        const sessions = await base44.entities.Session.filter({ id: currentUser.sessionId });
        if (sessions.length > 0) {
          const session = sessions[0];
          
          console.log('Session complète:', session);
          console.log('offer_generation:', session.offer_generation);
          
          const offerChoices = session.offer_generation?.offerChoices || {};
          
          // Construire l'objet offer avec les produits sélectionnés
          const offer = {
            product_principal: offerChoices.product_principal || null,
            petit_extra: offerChoices.petit_extra || null,
            offre_superieure: offerChoices.offre_superieure || null,
            offre_premium: offerChoices.offre_premium || null
          };
          
          console.log('Offres extraites:', offer);
          
          setUser({ 
            ...currentUser,
            offer: offer,
            sessionId: currentUser.sessionId,
            targetIncome: session.onboarding_full?.target_income || currentUser.targetIncome || 500
          });
        } else {
          setUser(currentUser);
        }
      } else {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFutureVision = async () => {
    if (!user?.sessionId) return;
    
    setIsGenerating(true);
    try {
      const { data } = await base44.functions.invoke('generateFutureVision', {
        sessionId: user.sessionId
      });
      
      if (data.success) {
        setFutureVision({
          narrativeText: data.narrativeText
        });
      }
    } catch (error) {
      console.error('Error generating vision:', error);
      // Fallback text
      setFutureVision({
        narrativeText: `Imagine-toi, dans quelques mois… Tu te réveilles le matin en sachant que des dizaines de personnes comptent sur toi pour progresser en ${user.coreSkill || 'ta compétence'}. Ton premier réflexe ? Consulter les messages de tes élèves qui te remercient pour la transformation que tu leur apportes.\n\nTu as réussi à structurer ton savoir-faire en une offre claire, accessible, et qui résonne avec ton audience. Chaque jour, de nouvelles personnes découvrent ton travail et décident de te faire confiance. Tes revenus augmentent régulièrement, te permettant de vivre de ta passion tout en ayant l'impact que tu souhaitais.\n\nTu n'es plus seul(e) à avancer. Ta communauté grandit, tes témoignages s'accumulent, et tu ressens cette fierté profonde d'avoir osé franchir le pas. Tu as transformé ton expertise en véritable activité pérenne.\n\nCette vie, elle t'attend. Il te suffit maintenant de passer à l'action, étape par étape.`
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
    return <OfferTransition message={isGenerating ? "Nova écrit ta vision future..." : "Chargement..."} />;
  }

  if (showTransition) {
    return <OfferTransition message="Nova prépare ton plan de route..." onComplete={handleTransitionComplete} />;
  }

  // Récupérer les offres depuis la session
  const [offerData, setOfferData] = useState({});
  
  useEffect(() => {
    if (user?.sessionId && !offerData.product_principal) {
      loadOfferData();
    }
  }, [user]);

  const loadOfferData = async () => {
    try {
      const sessions = await base44.entities.Session.filter({ id: user.sessionId });
      if (sessions.length > 0) {
        const session = sessions[0];
        const offerChoices = session.offer_generation?.offerChoices || {};
        
        setOfferData({
          product_principal: offerChoices.product_principal,
          petit_extra: offerChoices.petit_extra,
          offre_superieure: offerChoices.offre_superieure,
          offre_premium: offerChoices.offre_premium
        });
      }
    } catch (error) {
      console.error('Error loading offer data:', error);
    }
  };

  const products = [
    { key: 'product_principal', label: 'Produit Principal', data: offerData.product_principal, multiplier: 30 },
    { key: 'petit_extra', label: 'Order Bump', data: offerData.petit_extra, multiplier: 15 },
    { key: 'offre_superieure', label: 'Upsell', data: offerData.offre_superieure, multiplier: 9 },
    { key: 'offre_premium', label: 'Premium', data: offerData.offre_premium, multiplier: 1 }
  ].filter(p => p.data);

  const revenues = products.map(p => ({
    ...p,
    price: parsePrice(p.data?.price),
    total: parsePrice(p.data?.price) * p.multiplier
  }));

  const totalMonthly = revenues.reduce((sum, r) => sum + r.total, 0);
  
  // Calculate sales needed to reach goal using same proportions as revenue potential
  const revenueGoal = parseInt(user?.targetIncome) || 500;
  
  // Calculate the multiplier to reach the goal from current potential
  const multiplier = totalMonthly > 0 ? revenueGoal / totalMonthly : 1;
  
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
      <div className="flex-1 flex flex-col lg:ml-80">
        <div className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              ✨ Voici ce que ta vie future te réserve…
            </h1>
          </motion.div>

          {/* Top CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <GlowButton onClick={handleContinue} size="lg" className="px-10">
              Voir le Plan de mise en place CONCRÈTE
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </motion.div>

          {/* Narrative Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 mb-6"
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
              <motion.div 
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-lg"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <TrendingUp className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Ton Potentiel de Revenus Mensuels
                </h2>
                <p className="text-gray-400 text-sm">
                  Basé sur les produits sélectionnés et une hypothèse d'une vente par jour
                </p>
              </div>
            </div>

            {/* Big Number */}
            <motion.div 
              className="text-center py-8"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="text-5xl md:text-7xl font-bold text-[#61f7a2]">
                {totalMonthly.toLocaleString('fr-FR')} €
              </span>
              <p className="text-gray-400 mt-3 text-lg font-medium">par mois</p>
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
                    {totalMonthly.toLocaleString('fr-FR')} €
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
            className="bg-gradient-to-br from-yellow-50 to-white rounded-3xl border-2 border-yellow-300/50 p-8 mb-8 shadow-lg"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Ton Plan de Route pour Atteindre ton Objectif
                </h2>
                <p className="text-gray-600 text-sm">
                  Nombre de ventes nécessaires par mois pour atteindre {revenueGoal.toLocaleString('fr-FR')}€/mois
                  {totalProjected > 0 && (
                    <span className="block mt-1 text-[#61f7a2] font-semibold">
                      → Projection totale : {totalProjected.toLocaleString('fr-FR')}€/mois
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {salesNeeded.map((item, idx) => (
                <motion.div 
                  key={item.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  className="flex items-center justify-between py-4 px-5 bg-white rounded-2xl border border-gray-200 shadow-sm"
                >
                  <div>
                    <span className="text-gray-900 text-sm font-semibold">{item.label}</span>
                    <p className="text-gray-500 text-xs">{item.price} € par vente</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-yellow-500" />
                    <span className="text-yellow-600 font-bold text-lg">
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
                💡 <strong className="text-gray-900">Astuce :</strong> Commence par te concentrer sur ton Produit Principal pour valider le marché, puis ajoute progressivement les autres offres.
              </p>
            </motion.div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <GlowButton onClick={handleContinue} size="lg" className="px-12">
              Voir le Plan de mise en place CONCRÈTE
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </motion.div>
        </div>
        </div>
      </div>

      {/* Transition Animation */}
      {showTransition && (
        <OfferTransition 
          message="Nova prépare ton plan de route..." 
          onComplete={handleTransitionComplete} 
        />
      )}
    </div>
  );
}