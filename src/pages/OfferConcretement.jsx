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
  Trophy,
  Calendar
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import OfferTransition from '@/components/offer/OfferTransition';
import OnboardingSidebar from '@/components/onboarding/OnboardingSidebar';
import { cn } from "@/lib/utils";

function PhaseCard({ number, title, subtitle, objective, plan, result, delay = 0, color = 'green', isPriority = false }) {
  const colorSchemes = {
    green: {
      bg: 'from-green-500 to-emerald-400',
      border: 'border-gray-100',
      text: 'text-green-600'
    },
    blue: {
      bg: 'from-blue-500 to-cyan-400',
      border: 'border-gray-100',
      text: 'text-blue-600'
    },
    purple: {
      bg: 'from-purple-500 to-pink-400',
      border: 'border-gray-100',
      text: 'text-purple-600'
    },
    orange: {
      bg: 'from-orange-500 to-red-400',
      border: 'border-gray-100',
      text: 'text-orange-600'
    }
  };

  const scheme = colorSchemes[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        "rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between",
        isPriority 
          ? "bg-gradient-to-br from-[#61f7a2]/10 to-green-50 border-[#61f7a2] ring-2 ring-[#61f7a2]/30" 
          : "bg-white",
        !isPriority && scheme.border
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm", scheme.bg)}>
          <span className="text-sm font-bold text-white">{number}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            {isPriority && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-[#61f7a2] to-[#4de88f] rounded-lg">
                <Trophy className="w-3 h-3 text-white" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wide">PRIORITÉ</span>
              </div>
            )}
          </div>
          <p className="text-gray-500 text-sm">{subtitle}</p>
        </div>
      </div>
      <ArrowRight className="w-5 h-5 text-gray-400" />
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
    navigate(createPageUrl('CTAPAYWALL'));
  };

  if (isLoading || isGenerating) {
    return <OfferTransition message={isGenerating ? "Noah prépare ton plan de route..." : "Chargement..."} />;
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
    { number: 'S1', title: 'Première vente', subtitle: 'Ta 1ère vente à 47€', ...planDeRoute.phase1, color: 'green', isPriority: true, weekLabel: null },
    { number: 'S2', title: 'Order bump activé', subtitle: 'Revenus x2', ...planDeRoute.phase2, color: 'blue', isPriority: false, weekLabel: null },
    { number: 'S3', title: 'Offre supérieure', subtitle: 'Panier moyen x3', ...planDeRoute.phase3, color: 'purple', isPriority: false, weekLabel: null },
    { number: 'S4', title: 'Système complet', subtitle: 'Automatisation', ...planDeRoute.phase4, color: 'orange', isPriority: false, weekLabel: null }
  ];

  const advantageIcons = [Rocket, DollarSign, Shield, Sparkles];
  const advantages = planDeRoute.advantages.map((adv, idx) => ({
    icon: advantageIcons[idx] || Sparkles,
    ...adv
  }));

  const completedSteps = [1, 2, 3, 4, 5, 6];

  // 🔥 Fonction pour aérer et ajouter émojis au texte d'intro
  const enhanceIntroText = (text) => {
    if (!text) return '';
    
    let enhanced = text;
    
    // Ajouter émojis stratégiques
    if (!enhanced.includes('🎯') && enhanced.includes('vision claire')) {
      enhanced = enhanced.replace('vision claire', '🎯 vision claire');
    }
    
    if (!enhanced.includes('😌') && enhanced.includes('sans stress')) {
      enhanced = enhanced.replace('sans stress', 'sans stress 😌');
    }
    
    if (!enhanced.includes('✨') && enhanced.toLowerCase().includes('pas de miracle')) {
      enhanced = enhanced.replace(/pas de miracle/i, 'pas de miracle ✨');
    }
    
    if (!enhanced.includes('💪') && enhanced.toLowerCase().includes('système complet')) {
      enhanced = enhanced.replace(/système complet/i, 'système complet 💪');
    }
    
    return enhanced;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex">
      <OnboardingSidebar currentPage="OfferConcretement" completedSteps={completedSteps} progressInStep={0} />

      <div className="flex-1 flex flex-col lg:ml-80">
        <div className="max-w-4xl mx-auto px-6 pt-52 pb-12 lg:py-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="bg-gradient-to-br from-[#61f7a2]/20 via-blue-50 to-purple-50 rounded-3xl border-2 border-[#61f7a2]/40 p-10 relative overflow-hidden shadow-lg">
              <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-br from-[#61f7a2]/30 to-blue-300/30 rounded-2xl"
              />
              <motion.div
                animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
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
              Activer mon plan
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
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

          {/* 🔥 4 Phases avec BADGES et HIGHLIGHT */}
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



          {/* Transformation Avant/Après */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15 }}
            className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 text-center"
          >
            <p className="text-gray-700 text-lg mb-4">
              <strong className="text-gray-900">Avant,</strong> tu avais une idée et des doutes.
            </p>
            <p className="text-gray-900 text-xl font-bold">
              <strong className="text-[#61f7a2]">Maintenant,</strong> tu as un système clair et un plan précis.
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
              Activer mon plan
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </motion.div>
        </div>
      </div>

      {showTransition && (
        <OfferTransition
          onComplete={handleTransitionComplete}
          isPlanAction={true}
        />
      )}
    </div>
  );
}