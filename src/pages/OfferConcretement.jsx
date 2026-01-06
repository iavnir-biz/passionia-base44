import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  ArrowRight,
  Target,
  CheckCircle,
  Zap,
  Rocket,
  Shield,
  Sparkles,
  DollarSign,
  Package,
  BarChart3,
  Sprout,
  Map
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import OfferTransition from '@/components/offer/OfferTransition';
import OnboardingSidebar from '@/components/onboarding/OnboardingSidebar';
import { cn } from "@/lib/utils";

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

function PhaseCard({ number, title, objective, plan, result, delay = 0, color = 'green' }) {
  const colorSchemes = {
    green: {
      bg: 'from-green-500',
      border: 'border-green-200',
      text: 'text-green-600',
      resultBg: 'from-green-50 to-green-100',
      resultBorder: 'border-green-200'
    },
    blue: {
      bg: 'from-blue-500',
      border: 'border-blue-200',
      text: 'text-blue-600',
      resultBg: 'from-blue-50 to-blue-100',
      resultBorder: 'border-blue-200'
    },
    purple: {
      bg: 'from-purple-500',
      border: 'border-purple-200',
      text: 'text-purple-600',
      resultBg: 'from-purple-50 to-purple-100',
      resultBorder: 'border-purple-200'
    },
    orange: {
      bg: 'from-orange-500',
      border: 'border-orange-200',
      text: 'text-orange-600',
      resultBg: 'from-orange-50 to-orange-100',
      resultBorder: 'border-orange-200'
    }
  };

  const scheme = colorSchemes[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn("bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all", scheme.border)}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br to-white flex items-center justify-center shadow-sm", scheme.bg)}>
          <span className="text-xl font-bold text-white">{number}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className={cn("w-4 h-4", scheme.text)} />
            <span className={cn("text-sm font-semibold uppercase tracking-wide", scheme.text)}>
              Ton Objectif
            </span>
          </div>
          <p className="text-gray-700 leading-relaxed">{objective}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className={cn("w-4 h-4", scheme.text)} />
            <span className={cn("text-sm font-semibold uppercase tracking-wide", scheme.text)}>
              Notre Plan d'Action
            </span>
          </div>
          <p className="text-gray-700 leading-relaxed">{plan}</p>
        </div>

        <div className={cn("bg-gradient-to-br rounded-xl p-4 border", scheme.resultBg, scheme.resultBorder)}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className={cn("w-4 h-4", scheme.text)} />
            <span className={cn("text-sm font-semibold uppercase tracking-wide", scheme.text)}>
              Le Résultat
            </span>
          </div>
          <p className="text-gray-900 font-medium">{result}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function OfferConcretement() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [planDeRoute, setPlanDeRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (currentUser.sessionId) {
        const sessions = await base44.entities.Session.filter({ id: currentUser.sessionId });
        if (sessions.length > 0) {
          const userSession = sessions[0];
          setSession(userSession);

          if (userSession.plan_de_route) {
            setPlanDeRoute(userSession.plan_de_route);
          } else {
            await generatePlanDeRoute(currentUser.sessionId);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePlanDeRoute = async (sessionId) => {
    setIsGenerating(true);
    try {
      const { data } = await base44.functions.invoke('generatePlanDeRoute', { sessionId });
      if (data.success) {
        setPlanDeRoute(data.planDeRoute);
      }
    } catch (error) {
      console.error('Error generating plan de route:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = () => {
    setShowTransition(true);
  };

  const handleTransitionComplete = () => {
    navigate(createPageUrl('PlanActionPaywall'));
  };

  if (isLoading || isGenerating) {
    return <OfferTransition message={isGenerating ? "Nova prépare ton plan de route..." : "Chargement..."} />;
  }

  if (!planDeRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Impossible de charger le plan de route</p>
          <GlowButton onClick={() => window.location.reload()}>
            Réessayer
          </GlowButton>
        </div>
      </div>
    );
  }

  const phases = [
    { number: 1, ...planDeRoute.phase1, color: 'green' },
    { number: 2, ...planDeRoute.phase2, color: 'blue' },
    { number: 3, ...planDeRoute.phase3, color: 'purple' },
    { number: 4, ...planDeRoute.phase4, color: 'orange' }
  ];

  const advantageIcons = [Rocket, DollarSign, Shield, Sparkles];
  const advantages = planDeRoute.advantages.map((adv, idx) => ({
    icon: advantageIcons[idx] || Sparkles,
    ...adv
  }));

  const completedSteps = [1, 2, 3, 4, 5, 6]; // Jusqu'à Ta vie future complété

  const mainSteps = [
    { id: 1, label: "Tes offres", icon: Package, color: "from-orange-500 to-red-500" },
    { id: 2, label: "Ton marché", icon: BarChart3, color: "from-green-500 to-emerald-500" },
    { id: 3, label: "Ta vie future", icon: Sprout, color: "from-amber-500 to-yellow-500" },
    { id: 4, label: "Ton plan d'action", icon: Map, color: "from-indigo-500 to-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex">
      <OnboardingSidebar currentPage="OfferConcretement" completedSteps={completedSteps} progressInStep={0} />

      <div className="flex-1 flex flex-col lg:ml-80">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Hero Section avec visuel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="bg-gradient-to-br from-[#61f7a2]/20 via-blue-50 to-purple-50 rounded-3xl border-2 border-[#61f7a2]/40 p-10 relative overflow-hidden shadow-lg">
              {/* Éléments décoratifs flottants */}
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 10, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-br from-[#61f7a2]/30 to-blue-300/30 rounded-2xl"
              />
              <motion.div
                animate={{ 
                  y: [0, 20, 0],
                  rotate: [0, -10, 0]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute bottom-8 left-8 w-32 h-32 bg-gradient-to-br from-purple-300/30 to-[#61f7a2]/30 rounded-full"
              />

              <div className="relative z-10 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] shadow-lg mb-6"
                >
                  <span className="text-4xl">🗺️</span>
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Bienvenue dans ton Plan de Route
                </h1>
                <p className="text-gray-700 text-xl max-w-2xl mx-auto">
                  Oublie la pression des délais. Avance à ton rythme, étape par étape, vers ton objectif.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Top CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <GlowButton onClick={handleContinue} size="lg" className="px-10">
              Voir mon Pack Clé en Main
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </motion.div>

          {/* Intro Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 mb-8"
          >
            <p className="text-gray-700 leading-relaxed text-center text-base">
              {planDeRoute.introduction}
            </p>
          </motion.div>

          {/* Parcours Guidé Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🗺️ Ton Parcours Guidé
            </h2>
            <p className="text-gray-600">
              {planDeRoute.parcoursGuide}
            </p>
          </motion.div>

          {/* 4 Phases */}
          <div className="grid gap-6 mb-8">
            {phases.map((phase, index) => (
              <PhaseCard
                key={phase.number}
                {...phase}
                delay={0.4 + index * 0.1}
              />
            ))}
          </div>

          {/* Why This Plan Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              🧩 Pourquoi ce plan est efficace ?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {advantages.map((advantage, index) => {
                const Icon = advantage.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + index * 0.05 }}
                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-semibold mb-1">{advantage.title}</h3>
                        <p className="text-gray-600 text-sm">{advantage.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Understanding Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl border border-green-200 p-8 mb-8 text-center shadow-sm"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              💡 Tu comprends maintenant ?
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              {planDeRoute.conclusion}
            </p>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col items-center"
          >
            <p className="text-gray-600 mb-4 text-lg">
              Prêt(e) à commencer le voyage ?
            </p>
            <GlowButton onClick={handleContinue} size="lg" className="px-12">
              Voir Mon Pack Clé en Main
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </motion.div>
        </div>
      </div>

      {/* Transition Animation */}
      {showTransition && (
        <OfferTransition 
          onComplete={handleTransitionComplete} 
          isPlanAction={true}
        />
      )}
    </div>
  );
}