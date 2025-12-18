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
  TrendingUp,
  Rocket,
  Shield,
  Sparkles,
  Users,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import { cn } from "@/lib/utils";

const mainSteps = [
  { id: 1, label: "Ton Offre", page: "OfferResume" },
  { id: 2, label: "Bonne nouvelle !", page: "BonneNouvelle" },
  { id: 3, label: "Ta Vie Future", page: "OfferTaVieFuture" },
  { id: 4, label: "Concrètement ?", page: "OfferConcretement" },
  { id: 5, label: "Plan d'Action", page: "PlanAction" },
];

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

function PhaseCard({ number, title, objective, plan, result, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#1b1b33] rounded-2xl border border-[#2a2a45] p-6 hover:border-[#3a3a55] transition-all"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#61f7a2] flex items-center justify-center">
          <span className="text-xl font-bold text-[#11112b]">{number}</span>
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-[#61f7a2]" />
            <span className="text-sm font-semibold text-[#61f7a2] uppercase tracking-wide">
              Ton Objectif
            </span>
          </div>
          <p className="text-gray-300 leading-relaxed">{objective}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold text-yellow-500 uppercase tracking-wide">
              Notre Plan d'Action
            </span>
          </div>
          <p className="text-gray-300 leading-relaxed">{plan}</p>
        </div>

        <div className="bg-[#61f7a2]/5 rounded-xl p-4 border border-[#61f7a2]/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-[#61f7a2]" />
            <span className="text-sm font-semibold text-[#61f7a2] uppercase tracking-wide">
              Le Résultat
            </span>
          </div>
          <p className="text-white font-medium">{result}</p>
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
    navigate(createPageUrl('PlanAction'));
  };

  const handleStepClick = (step) => {
    if (step.page) {
      navigate(createPageUrl(step.page));
    }
  };

  if (isLoading || isGenerating) {
    return (
      <div className="min-h-screen bg-[#11112b] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin mb-4" />
        <p className="text-gray-400">{isGenerating ? 'Nova prépare ton plan personnalisé...' : 'Chargement...'}</p>
      </div>
    );
  }

  if (!planDeRoute) {
    return (
      <div className="min-h-screen bg-[#11112b] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Impossible de charger le plan de route</p>
          <GlowButton onClick={() => window.location.reload()}>
            Réessayer
          </GlowButton>
        </div>
      </div>
    );
  }

  const phases = [
    { number: 1, ...planDeRoute.phase1 },
    { number: 2, ...planDeRoute.phase2 },
    { number: 3, ...planDeRoute.phase3 },
    { number: 4, ...planDeRoute.phase4 }
  ];

  const advantageIcons = [Rocket, DollarSign, Shield, Sparkles];
  const advantages = planDeRoute.advantages.map((adv, idx) => ({
    icon: advantageIcons[idx] || Sparkles,
    ...adv
  }));

  return (
    <div className="min-h-screen bg-[#11112b]">
      {/* Main Navigation Bar */}
      <div className="bg-[#1b1b33] border-b border-[#2a2a45] py-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center gap-1 md:gap-2 flex-wrap">
            {mainSteps.map((step, index) => {
              const isActive = step.id === 4;
              const isPrevious = step.id < 4;
              const isClickable = isPrevious;

              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => isClickable && step.page && navigate(createPageUrl(step.page))}
                    disabled={!isClickable}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap",
                      isActive && "bg-[#61f7a2] text-[#11112b]",
                      isPrevious && "text-[#61f7a2] hover:text-[#4de88f] cursor-pointer",
                      !isActive && !isPrevious && "text-gray-500 cursor-not-allowed opacity-50"
                    )}>
                    {step.id}. {step.label}
                  </button>
                  {index < mainSteps.length - 1 && (
                    <div className={cn(
                      "w-4 md:w-8 h-[2px]",
                      step.id < 4 ? "bg-[#61f7a2]" : "bg-[#2a2a45]"
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Top CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <GlowButton onClick={handleContinue} size="lg" className="px-10">
              🚀 Voir mon Pack Clé en Main
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Ton Plan de Route en 4 Phases
            </h1>
            <p className="text-gray-400 text-lg">
              Oublie la pression des délais. Avance à ton rythme, étape par étape, vers ton objectif.
            </p>
          </motion.div>

          {/* Intro Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1b1b33] rounded-2xl border border-[#2a2a45] p-6 mb-8"
          >
            <p className="text-gray-300 leading-relaxed text-center">
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
            <h2 className="text-2xl font-bold text-white mb-2">
              🗺️ Ton Parcours Guidé
            </h2>
            <p className="text-gray-400">
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
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
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
                    className="bg-[#1b1b33] rounded-xl border border-[#2a2a45] p-5 hover:border-[#61f7a2]/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#61f7a2]/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#61f7a2]" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-1">{advantage.title}</h3>
                        <p className="text-gray-400 text-sm">{advantage.description}</p>
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
            className="bg-gradient-to-br from-[#61f7a2]/10 to-[#1b1b33] rounded-2xl border border-[#61f7a2]/30 p-8 mb-8 text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              💡 Tu comprends maintenant ?
            </h2>
            <p className="text-gray-300 leading-relaxed text-lg">
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
            <p className="text-gray-400 mb-4 text-lg">
              Prêt(e) à commencer le voyage ?
            </p>
            <GlowButton onClick={handleContinue} size="lg" className="px-12">
              ✨ Voir Mon Pack Clé en Main
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </motion.div>
        </div>
      </div>


    </div>
  );
}