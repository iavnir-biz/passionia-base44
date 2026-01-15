import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import confetti from 'canvas-confetti';
import {
  Sparkles,
  User,
  Target,
  Package,
  BarChart3,
  Sprout,
  Map,
  PartyPopper,
  CheckCircle2
} from 'lucide-react';

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: 'Tes talents',
    icon: Sparkles,
    pages: ['OnboardingDynamic'],
    color: 'from-[#61f7a2] to-[#4de88f]'
  },
  {
    id: 2,
    title: 'Ton profil',
    icon: User,
    pages: ['OnboardingQ12AgeRange', 'OnboardingQ13Gender', 'OnboardingQ14Family', 'OnboardingQ15CurrentIncome'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 3,
    title: 'Tes objectifs',
    icon: Target,
    pages: ['OnboardingQ16TargetIncome', 'OnboardingQ17TargetDelay', 'OnboardingQ18LifeChange', 'OnboardingQ19Impact', 'OnboardingQ20Emotions', 'OnboardingQ21Relatives', 'OnboardingQ22Lifestyle', 'OnboardingQ23Obstacles', 'OnboardingQ24IfNothingChanges', 'OnboardingQ25Readiness', 'OnboardingQ26DeliveryPreferences'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 4,
    title: 'Tes offres',
    icon: Package,
    pages: ['OfferGenerationStart', 'OfferProductPrincipal', 'OfferPetitExtra', 'OfferSuperieure', 'OfferPremium', 'OfferResume'],
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 5,
    title: 'Ton marché',
    icon: BarChart3,
    pages: ['BonneNouvelle'],
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 6,
    title: 'Ta vie future',
    icon: Sprout,
    pages: ['OfferTaVieFuture'],
    color: 'from-amber-500 to-yellow-500'
  },
  {
    id: 7,
    title: 'Ton plan d\'action',
    icon: Map,
    pages: ['OfferConcretement', 'PlanAction'],
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 8,
    title: 'Bienvenue',
    icon: PartyPopper,
    pages: ['CTAPAYWALL', 'Dashboard'],
    color: 'from-[#61f7a2] to-[#4de88f]'
  }
];

export default function OnboardingSidebar({ currentPage, completedSteps = [], progressInStep = 0 }) {
  const scrollContainerRef = useRef(null);

  // Déterminer l'étape active basée sur la page courante
  const activeStep = ONBOARDING_STEPS.find(step =>
    step.pages.includes(currentPage)
  );

  const activeStepId = activeStep?.id || 1;

  // Auto-scroll pour mobile
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector(`[data-step-id="${activeStepId}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeStepId]);

  // Déclencher les confetti quand une nouvelle étape est complétée
  useEffect(() => {
    if (completedSteps.length > 0) {
      const lastCompleted = completedSteps[completedSteps.length - 1];
      const previousCompleted = JSON.parse(localStorage.getItem('onboarding_completed_steps') || '[]');

      // Si c'est une nouvelle étape complétée (pas déjà dans le localStorage)
      if (!previousCompleted.includes(lastCompleted)) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        localStorage.setItem('onboarding_completed_steps', JSON.stringify(completedSteps));
      }
    }
  }, [completedSteps]);

  // Helper pour les classes d'état
  const getStepState = (stepId) => {
    if (stepId === activeStepId) return 'active';
    if (completedSteps.includes(stepId)) return 'completed';
    return 'future';
  };

  return (
    <>
      {/* Desktop - Sidebar verticale */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-80 bg-white border-r border-gray-200 flex-col z-50">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">PASSION IA</h1>
          </div>
          <div>
            <h2 className="text-gray-900 font-semibold mb-1">Onboarding</h2>
            <p className="text-gray-600 text-xs">Étape {activeStepId}/8</p>
          </div>
        </div>

        {/* Steps */}
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          {ONBOARDING_STEPS.map((step, index) => {
            const Icon = step.icon;
            const state = getStepState(step.id);
            const isActive = state === 'active';
            const isCompleted = state === 'completed';
            const isFuture = state === 'future';

            return (
              <div key={step.id} className="relative">
                {/* Connecting line */}
                {index < ONBOARDING_STEPS.length - 1 && (
                  <div className="absolute left-[19px] top-[42px] w-0.5 h-8">
                    <div className="absolute inset-0 bg-gray-100" />
                    {isCompleted && (
                      <motion.div
                        className="absolute inset-0 bg-gray-300"
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                    {isActive && progressInStep > 0 && (
                      <motion.div
                        className="absolute inset-0 bg-[#61f7a2]"
                        initial={{ height: 0 }}
                        animate={{ height: `${progressInStep}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                    isActive && "bg-gray-900 shadow-md border border-gray-900 scale-105",
                    isCompleted && "opacity-60 grayscale hover:grayscale-0 transition-all",
                    isFuture && "opacity-30 blur-[0.5px]"
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all relative",
                    isCompleted ? "bg-gray-100" : isActive ? `bg-gradient-to-br ${step.color}` : "bg-gray-100"
                  )}>
                    {isCompleted ? (
                      <>
                        <Icon className="w-5 h-5 text-gray-500" />
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-[#61f7a2] rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10"
                        >
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </motion.div>
                      </>
                    ) : (
                      <Icon className={cn("w-5 h-5 text-white")} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm font-semibold transition-colors",
                      isActive ? "text-white" : "text-gray-500",
                      isCompleted && "line-through text-gray-400 decoration-gray-300"
                    )}>
                      {step.title}
                    </p>
                  </div>

                  {/* Active indicator */}
                  {
                    isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-3 w-2 h-2 rounded-full bg-[#61f7a2]"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )
                  }
                </motion.div>
              </div>
            );
          })}
        </nav >
      </aside >

      {/* Mobile - Top bar improved */}
      < div className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 transition-all shadow-sm" >
        <div className="px-4 pt-2 pb-1">
          {/* Header Compact */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-[12px] font-bold text-gray-900 leading-none">PASSION IA</h1>
                <p className="text-[9px] text-gray-500 font-medium mt-0.5">Étape {activeStepId}/8</p>
              </div>
            </div>

            {/* Mini Progress Bar Global */}
            <div className="w-20 h-1bg-gray-100 rounded-full overflow-hidden shrink-0">
              <motion.div
                className="h-full bg-[#61f7a2]"
                initial={{ width: 0 }}
                animate={{ width: `${(activeStepId / 8) * 100}%` }}
              />
            </div>
          </div>

          {/* Horizontal Scrollable Steps - Auto Centering */}
          <div
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-2 px-2"
          >
            {ONBOARDING_STEPS.map((step) => {
              const Icon = step.icon;
              const state = getStepState(step.id);
              const isActive = state === 'active';
              const isCompleted = state === 'completed';
              const isFuture = state === 'future';

              return (
                <div
                  key={step.id}
                  data-step-id={step.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0 transition-all snap-center border",
                    isActive
                      ? "bg-gray-900 border-gray-900 shadow-md transform scale-105"
                      : "bg-white border-gray-100",
                    isCompleted && "opacity-50 border-transparent bg-gray-50",
                    isFuture && "opacity-30 border-transparent"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center relative",
                    isCompleted
                      ? "bg-gray-200"
                      : isActive ? `bg-gradient-to-br ${step.color}` : "bg-gray-100"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Icon className={cn("w-3 h-3", isActive ? "text-white" : "text-gray-400")} />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs font-bold whitespace-nowrap",
                    isActive ? "text-white" : "text-gray-500",
                    isCompleted && "line-through font-normal"
                  )}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div >
    </>
  );
}