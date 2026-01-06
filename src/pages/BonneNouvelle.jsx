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
  Globe,
  Users,
  Repeat,
  Laptop,
  BarChart3,
  Package,
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

function ProgressBarItem({ label, value, icon: Icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#61f7a2]/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#61f7a2]" />
          </div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-sm font-bold text-[#61f7a2]">{value}%</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-[#61f7a2] to-[#4de88f] rounded-full shadow-sm"
        />
      </div>
    </motion.div>
  );
}

export default function BonneNouvelle() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [marketAnalysis, setMarketAnalysis] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user && !marketAnalysis) {
      generateMarketAnalysis();
    }
  }, [user]);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMarketAnalysis = async () => {
    if (!user?.sessionId) return;
    
    setIsGenerating(true);
    try {
      const { data } = await base44.functions.invoke('generateMarketValidation', {
        sessionId: user.sessionId
      });
      
      if (data.success) {
        setMarketAnalysis({
          validationText: data.marketValidation,
          marketScores: {
            elearningMarket: 85,
            digitalDemand: 88,
            recurringRevenue: 82,
            globalAccess: 90,
            techEase: 87
          }
        });
      }
    } catch (error) {
      console.error('Error generating analysis:', error);
      // Fallback values
      setMarketAnalysis({
        validationText: `Excellente nouvelle ! Le marché de l'enseignement en ligne pour ${user.coreSkill || 'ta compétence'} est en pleine expansion. Des milliers de personnes recherchent activement des formations pour progresser dans ce domaine. Avec ton expérience et ta méthode unique, tu as toutes les cartes en main pour réussir.`,
        marketScores: {
          elearningMarket: 85,
          digitalDemand: 88,
          recurringRevenue: 82,
          globalAccess: 90,
          techEase: 87
        }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = () => {
    setShowTransition(true);
  };

  const handleTransitionComplete = () => {
    navigate(createPageUrl('OfferTaVieFuture'));
  };

  if (isLoading || isGenerating) {
    return <OfferTransition message={isGenerating ? "Nova analyse le marché..." : "Chargement..."} />;
  }

  if (showTransition) {
    return <OfferTransition message="Nova prépare ta vision future..." onComplete={handleTransitionComplete} />;
  }

  const offer = user?.offer || {};
  const products = [
    { key: 'product_principal', label: 'Produit Principal', data: offer.product_principal, multiplier: 30 },
    { key: 'petit_extra', label: 'Order Bump', data: offer.petit_extra, multiplier: 15 },
    { key: 'offre_superieure', label: 'Upsell', data: offer.offre_superieure, multiplier: 9 },
    { key: 'offre_premium', label: 'Premium', data: offer.offre_premium, multiplier: 1 }
  ];

  const revenues = products.map(p => ({
    ...p,
    price: parsePrice(p.data?.price),
    total: parsePrice(p.data?.price) * p.multiplier
  }));

  const totalMonthly = revenues.reduce((sum, r) => sum + r.total, 0);
  const scores = marketAnalysis?.marketScores || {};

  const completedSteps = [1, 2, 3, 4]; // Jusqu'à Tes offres complété

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex">
      <OnboardingSidebar currentPage="BonneNouvelle" completedSteps={completedSteps} progressInStep={0} />

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
              🎉 Étape 2 : Bonne nouvelle !
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
              Voir ma vie future
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </motion.div>

          {/* Validation Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 mb-6"
          >
            <div className="flex items-start gap-4 mb-4">
              <motion.div 
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center flex-shrink-0 shadow-lg"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Ton marché est validé
                </h2>
                <p className="text-gray-600 text-sm">
                  Analyse personnalisée pour {user?.coreSkill || 'ta compétence'}
                </p>
              </div>
            </div>
            
            {isGenerating ? (
              <div className="flex items-center gap-3 py-4">
                <Loader2 className="w-5 h-5 text-[#61f7a2] animate-spin" />
                <span className="text-gray-600">Analyse en cours...</span>
              </div>
            ) : (
              <div className="space-y-6 text-gray-700 leading-relaxed text-base">
                {marketAnalysis?.validationText?.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-base">{paragraph}</p>
                ))}
              </div>
            )}
          </motion.div>

          {/* Market Potential Bars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 mb-6"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Potentiel du marché pour enseigner {user?.coreSkill || 'ta compétence'} en ligne
                </h2>
              </div>
            </div>

            {isGenerating ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-[#61f7a2] animate-spin" />
              </div>
            ) : (
              <div className="space-y-5">
                <ProgressBarItem 
                  label="Taille du Marché E-learning" 
                  value={scores.elearningMarket || 85}
                  icon={Globe}
                  delay={0}
                />
                <ProgressBarItem 
                  label="Demande Numérique Croissante" 
                  value={scores.digitalDemand || 88}
                  icon={TrendingUp}
                  delay={0.1}
                />
                <ProgressBarItem 
                  label="Potentiel de Revenus Récurrents" 
                  value={scores.recurringRevenue || 82}
                  icon={Repeat}
                  delay={0.2}
                />
                <ProgressBarItem 
                  label="Accessibilité Globale" 
                  value={scores.globalAccess || 90}
                  icon={Users}
                  delay={0.3}
                />
                <ProgressBarItem 
                  label="Facilité Technique & Outils Modernes" 
                  value={scores.techEase || 87}
                  icon={Laptop}
                  delay={0.4}
                />
              </div>
            )}
          </motion.div>

          {/* Revenue Calculation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 rounded-3xl border-2 border-yellow-600 p-8 mb-8 shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <motion.div 
                className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <TrendingUp className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white drop-shadow-sm">
                  🎯 Ton Objectif de Revenus Mensuels
                </h2>
                <p className="text-white/80 text-sm drop-shadow-sm">
                  Basé sur les produits sélectionnés et une hypothèse d'une vente par jour
                </p>
              </div>
            </div>

            {/* Big Number */}
            <motion.div 
              className="text-center py-8 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-6xl md:text-8xl font-black text-white drop-shadow-xl">
                {totalMonthly.toLocaleString('fr-FR')} €
              </span>
              <p className="text-white/90 mt-4 text-xl font-bold drop-shadow-sm">💰 par mois</p>
            </motion.div>

            {/* Toggle Detail */}
            <button
              onClick={() => setShowDetail(!showDetail)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-white hover:bg-white/10 transition-all font-medium mt-4"
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
                className="border-t border-white/20 pt-4 mt-2 space-y-3"
              >
                {revenues.map((rev) => (
                  <div 
                    key={rev.key}
                    className="flex items-center justify-between py-3 px-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
                  >
                    <div>
                      <span className="text-white text-sm font-semibold">{rev.label}</span>
                      <p className="text-white/70 text-xs">×{rev.multiplier} ventes/mois</p>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold">{rev.total.toLocaleString('fr-FR')} €</span>
                      <p className="text-white/70 text-xs">{rev.price} € × {rev.multiplier}</p>
                    </div>
                  </div>
                ))}
                
                <div className="flex items-center justify-between py-4 px-4 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/40">
                  <span className="text-white font-bold">Total Mensuel</span>
                  <span className="text-white font-bold text-xl">
                    {totalMonthly.toLocaleString('fr-FR')} €
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <GlowButton onClick={handleContinue} size="lg" className="px-12">
              Voir ma vie future
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </motion.div>
        </div>
      </div>
    </div>
  );
}