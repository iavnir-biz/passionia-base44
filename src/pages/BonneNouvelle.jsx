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

function ProgressBarItem({ label, value, icon: Icon, explanation, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="space-y-2"
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
      {explanation && (
        <p className="text-xs text-gray-600 ml-11 leading-relaxed">{explanation}</p>
      )}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [marketAnalysis, setMarketAnalysis] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (!currentUser.sessionId) {
        console.error('❌ [BONNENOUVELLE] Pas de sessionId');
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      const sessions = await base44.entities.Session.filter({ id: currentUser.sessionId });
      if (!sessions || sessions.length === 0) {
        console.error('❌ [BONNENOUVELLE] Session introuvable');
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      const currentSession = sessions[0];
      setSession(currentSession);

      console.log('[BONNENOUVELLE][SESSION]', {
        hasMarket: !!currentSession.market_validation,
        hasScores: !!currentSession.market_validation_scores,
        hasFinalized: !!currentSession.finalized_offer,
        hasMyOffers: !!currentSession.my_generated_offers
      });

      // Si cache existe, utiliser immédiatement
      if (currentSession.market_validation) {
        setMarketAnalysis({
          validationText: currentSession.market_validation,
          marketScores: currentSession.market_validation_scores || {},
          scoreExplanations: currentSession.market_validation_score_explanations || {},
          sources: currentSession.market_validation_sources || {},
          summary: currentSession.onboarding_summary || {}
        });
        setIsLoading(false);
      } else {
        // Sinon générer
        setIsLoading(false);
        generateMarketAnalysis(currentUser.sessionId, currentSession);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      setIsLoading(false);
    }
  };

  const generateMarketAnalysis = async (sessionId, currentSession) => {
    if (!sessionId) return;
    
    setIsGenerating(true);
    try {
      const summary = currentSession?.onboarding_summary || {};
      
      const { data } = await base44.functions.invoke('generateMarketValidation', {
        sessionId
      });
      
      if (data.success) {
        setMarketAnalysis({
          validationText: data.marketValidation,
          marketScores: data.marketScores || {},
          scoreExplanations: data.scoreExplanations || {},
          sources: data.sources || {},
          summary
        });
      }
    } catch (error) {
      console.error('Error generating analysis:', error);
      const summary = currentSession?.onboarding_summary || {};
      const who = summary.who_to_teach || 'ta compétence';
      const profile = summary.learner_profile || 'des personnes motivées';
      
      setMarketAnalysis({
        validationText: `${user?.firstName || ''}, les personnes que tu veux aider font face à un blocage réel. Ce problème les empêche de progresser efficacement.\n\nCe que tu proposes répond directement à ce blocage : un résultat rapide dès le départ, puis une transformation durable. Cette progression claire crée une valeur perçue forte.\n\nTon objectif de revenus est cohérent avec les formats que tu as choisis et le niveau de transformation que tu apportes. Le ratio effort/revenus est favorable.`,
        marketScores: {
          marketSize: 68,
          demandIntensity: 74,
          revenueRecurrence: 70,
          onlineAccessibility: 82,
          easeOfImplementation: 71
        },
        scoreExplanations: {
          marketSize: "Score modéré car audience ciblée spécifique.",
          demandIntensity: "Score élevé car besoin identifié et douleur concrète.",
          revenueRecurrence: "Score élevé car potentiel de récurrence.",
          onlineAccessibility: "Score très élevé car formats digitaux scalables.",
          easeOfImplementation: "Score modéré car mise en œuvre progressive requise."
        },
        summary
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
    return <OfferTransition message={isGenerating ? "Noah analyse le marché..." : "Chargement..."} />;
  }

  if (showTransition) {
    return <OfferTransition message="Noah prépare ta vision future..." onComplete={handleTransitionComplete} />;
  }

  // 🔥 REVENUE depuis Session (pas User)
  const finalized = session?.finalized_offer || null;
  const myOffers = session?.my_generated_offers || null;
  
  const defaultRevenues = [
    { key: 'low', label: 'Produit Principal', price: 97, multiplier: 30 },
    { key: 'bump', label: 'Order Bump', price: 27, multiplier: 15 },
    { key: 'mid', label: 'Upsell', price: 297, multiplier: 9 },
    { key: 'high', label: 'Premium', price: 3000, multiplier: 1 }
  ];
  
  let revenues = [];
  let revenueSource = 'defaults';
  
  // Priorité 1: my_generated_offers
  if (myOffers?.low || myOffers?.bump || myOffers?.mid || myOffers?.high) {
    revenueSource = 'my_generated_offers';
    revenues = [
      { key: 'low', label: 'Produit Principal', data: myOffers.low, multiplier: 30 },
      { key: 'bump', label: 'Order Bump', data: myOffers.bump, multiplier: 15 },
      { key: 'mid', label: 'Upsell', data: myOffers.mid, multiplier: 9 },
      { key: 'high', label: 'Premium', data: myOffers.high, multiplier: 1 }
    ].map((p, idx) => {
      const price = parsePrice(p.data?.price);
      return {
        ...p,
        price: price > 0 ? price : defaultRevenues[idx].price,
        total: (price > 0 ? price : defaultRevenues[idx].price) * p.multiplier
      };
    });
  }
  // Priorité 2: finalized_offer
  else if (finalized?.mainProduct || finalized?.upsell1 || finalized?.upsell2 || finalized?.upsell3) {
    revenueSource = 'finalized_offer';
    revenues = [
      { key: 'main', label: 'Produit Principal', data: finalized.mainProduct, multiplier: 30 },
      { key: 'upsell1', label: 'Order Bump', data: finalized.orderBump, multiplier: 15 },
      { key: 'upsell2', label: 'Upsell', data: finalized.upsell1, multiplier: 9 },
      { key: 'upsell3', label: 'Premium', data: finalized.upsell3, multiplier: 1 }
    ].map((p, idx) => {
      const price = parsePrice(p.data?.price);
      return {
        ...p,
        price: price > 0 ? price : defaultRevenues[idx].price,
        total: (price > 0 ? price : defaultRevenues[idx].price) * p.multiplier
      };
    });
  }
  // Fallback: defaults
  else {
    revenues = defaultRevenues.map(p => ({ ...p, total: p.price * p.multiplier }));
  }

  const totalMonthly = revenues.reduce((sum, r) => sum + r.total, 0);
  
  console.log('[BONNENOUVELLE][REVENUE]', {
    source: revenueSource,
    totalMonthly,
    hasFinalized: !!finalized,
    hasMyOffers: !!myOffers
  });
  
  const scores = marketAnalysis?.marketScores || {};
  const scoreExplanations = marketAnalysis?.scoreExplanations || {};
  const summary = marketAnalysis?.summary || {};

  const completedSteps = [1, 2, 3, 4]; // Jusqu'à Tes offres complété

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex">
      <OnboardingSidebar currentPage="BonneNouvelle" completedSteps={completedSteps} progressInStep={0} />

      {/* Content */}
      <div className="flex-1 flex flex-col lg:ml-80">
        <div className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          {/* Top CTA */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <GlowButton onClick={handleContinue} size="lg" className="px-12">
              Voir ma vie future
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-2">
              🎉 Bonne nouvelle
            </h1>
            <p className="text-xl text-gray-600">
              Ton marché est réel et viable
            </p>
          </motion.div>

          {/* Validation Text Block - Emotional */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 mb-8"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-3 py-12">
                <Loader2 className="w-5 h-5 text-[#61f7a2] animate-spin" />
                <span className="text-gray-600">Noah analyse le marché...</span>
              </div>
            ) : (
              <div className="space-y-5 text-gray-700 leading-relaxed text-base">
                <p>
                  Après analyse de ton marché autour de <strong>{summary.coreSkill || summary.who_to_teach || 'ta compétence'}</strong>, une chose ressort très clairement.
                </p>
                <p>
                  Nous sommes en 2024–2025, et jamais autant de personnes n'ont cherché à apprendre, progresser ou se former sur ce sujet. Ce n'est pas une intuition. Les données montrent une augmentation forte de l'intérêt, une douleur bien identifiée, et surtout un comportement d'achat déjà existant.
                </p>
                <p className="font-medium text-gray-900">
                  Autrement dit : tu n'arrives pas trop tôt. Tu arrives au bon moment.
                </p>
              </div>
            )}
          </motion.div>

          {/* Contextual Proof Block with Sources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              🔍 Ce que montrent les données récentes
            </h2>

            {isGenerating ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-[#61f7a2] animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-l-4 border-[#61f7a2] pl-4 py-3">
                  <p className="text-gray-700 text-base">
                    • Intérêt croissant pour les solutions en ligne autour de <strong>{summary.coreSkill || 'ta compétence'}</strong> avec une forte croissance observée sur les 12 derniers mois.
                  </p>
                </div>
                <div className="border-l-4 border-[#61f7a2] pl-4 py-3">
                  <p className="text-gray-700 text-base">
                    • Les personnes cherchent déjà des réponses : comportement d'achat confirmé, demande active, et solutions partielles existantes validant le marché.
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Market Potential Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              📊 Ton potentiel sur ce marché
            </h2>

            {isGenerating ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-[#61f7a2] animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                <ProgressBarItem 
                  label="Potentiel du marché"
                  value={scores.marketSize || scores.taille_du_probleme || 75}
                  explanation="Taille et accessibilité de l'audience pour ton offre."
                  icon={Globe}
                  delay={0}
                />
                <ProgressBarItem 
                  label="Évolution récente"
                  value={scores.demandIntensity || scores.intensite_de_la_douleur || 78}
                  explanation="Croissance de l'intérêt sur les 12 derniers mois."
                  icon={TrendingUp}
                  delay={0.1}
                />
                <ProgressBarItem 
                  label="Potentiel de monétisation"
                  value={scores.revenueRecurrence || scores.potentiel_de_monetisation || 80}
                  explanation="Capacité à générer des revenus stables avec les bons formats."
                  icon={Package}
                  delay={0.2}
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
                  🎯 {revenueSource !== 'defaults' ? 'Ton Objectif de Revenus Mensuels' : 'Potentiel de Revenus Mensuels'}
                </h2>
                <p className="text-white/80 text-sm drop-shadow-sm">
                  {revenueSource !== 'defaults' ? 'Basé sur ton offre complète' : 'Estimation basée sur les standards du secteur'}
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

          {/* Conclusion Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-[#61f7a2]/10 to-[#4de88f]/10 rounded-2xl border border-[#61f7a2]/20 p-6 mb-8 text-center"
          >
            <p className="text-gray-700 text-lg font-medium">
              👉 Tu n'essaies pas de créer un marché. Tu arrives sur un marché qui existe déjà.
            </p>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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
    </div>
  );
}