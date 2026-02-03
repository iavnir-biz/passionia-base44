import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
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
    color: 'from-[#8b5cf6] to-[#a78bfa]',
    bgColor: '#8b5cf6'
  },
  {
    id: 2,
    title: 'Ton profil',
    icon: User,
    pages: ['OnboardingQ12AgeRange', 'OnboardingQ13Gender', 'OnboardingQ14Family', 'OnboardingQ15CurrentIncome'],
    color: 'from-blue-500 to-cyan-500',
    bgColor: '#3b82f6'
  },
  {
    id: 3,
    title: 'Tes objectifs',
    icon: Target,
    pages: ['OnboardingQ16TargetIncome', 'OnboardingQ17TargetDelay', 'OnboardingQ18LifeChange', 'OnboardingQ19Impact', 'OnboardingQ20Emotions', 'OnboardingQ21Relatives', 'OnboardingQ22Lifestyle', 'OnboardingQ23Obstacles', 'OnboardingQ24IfNothingChanges', 'OnboardingQ25Readiness', 'OnboardingQ26DeliveryPreferences'],
    color: 'from-purple-500 to-pink-500',
    bgColor: '#a855f7'
  },
  {
    id: 4,
    title: 'Tes offres',
    icon: Package,
    pages: ['OfferGenerationStart', 'OfferProductPrincipal', 'OfferPetitExtra', 'OfferSuperieure', 'OfferPremium', 'OfferResume'],
    color: 'from-orange-500 to-red-500',
    bgColor: '#f97316'
  },
  {
    id: 5,
    title: 'Ton marché',
    icon: BarChart3,
    pages: ['BonneNouvelle'],
    color: 'from-green-500 to-emerald-500',
    bgColor: '#22c55e'
  },
  {
    id: 6,
    title: 'Ta vie future',
    icon: Sprout,
    pages: ['OfferTaVieFuture'],
    color: 'from-amber-500 to-yellow-500',
    bgColor: '#f59e0b'
  },
  {
    id: 7,
    title: "Ton plan d'action",
    icon: Map,
    pages: ['OfferConcretement', 'PlanAction'],
    color: 'from-indigo-500 to-purple-500',
    bgColor: '#6366f1'
  },
  {
    id: 8,
    title: 'Bienvenue',
    icon: PartyPopper,
    pages: ['CTAPAYWALL', 'Dashboard'],
    color: 'from-[#61f7a2] to-[#4de88f]',
    bgColor: '#61f7a2'
  }
];

// Pages qui gardent l'ancien design mobile (sidebar offer style)
const OFFER_DETAIL_PAGES = [
  'OfferProductPrincipal',
  'OfferPetitExtra',
  'OfferSuperieure',
  'OfferPremium',
  'OfferResume'
];

export default function OnboardingSidebar({ currentPage, completedSteps = [], progressInStep = 0 }) {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  // Déterminer l'étape active basée sur la page courante
  const activeStep = ONBOARDING_STEPS.find(step =>
    step.pages.includes(currentPage)
  );

  const activeStepId = activeStep?.id || 1;
  const ActiveIcon = activeStep?.icon || Sparkles;

  // Vérifier si on est sur une page offer detail (garde l'ancien style mobile)
  const isOfferDetailPage = OFFER_DETAIL_PAGES.includes(currentPage);

  // Calcul de la progression
  let calculatedProgress = progressInStep;

  if (progressInStep === 0 && activeStep) {
    const currentPageIndexInStep = activeStep.pages.indexOf(currentPage) ?? 0;
    const totalPagesInStep = activeStep.pages.length || 1;
    calculatedProgress = ((currentPageIndexInStep + 1) / totalPagesInStep) * 100;
  }

  // Déclencher les confetti quand une nouvelle étape est complétée
  useEffect(() => {
    if (completedSteps.length > 0) {
      const lastCompleted = completedSteps[completedSteps.length - 1];
      const previousCompleted = JSON.parse(localStorage.getItem('onboarding_completed_steps') || '[]');

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
      {/* ============================================== */}
      {/* DESKTOP - NOUVELLE VERSION OPTION C           */}
      {/* ============================================== */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-80 bg-white border-r border-gray-200 flex-col z-50">
        {/* Header avec dots + card active */}
        <div className="p-6 border-b border-gray-100">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Stepper dots */}
          <div className="flex items-center gap-2 mb-5">
            {ONBOARDING_STEPS.map((step) => {
              const state = getStepState(step.id);
              const isActive = state === 'active';
              const isCompleted = state === 'completed';

              return (
                <motion.div
                  key={step.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: step.id * 0.05 }}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    isActive && `w-8 h-2.5 bg-gradient-to-r ${step.color}`,
                    isCompleted && "w-2.5 h-2.5",
                    !isActive && !isCompleted && "w-2.5 h-2.5 bg-gray-200"
                  )}
                  style={isCompleted ? { backgroundColor: step.bgColor } : {}}
                />
              );
            })}
          </div>

          {/* Card étape active */}
          {activeStep && (
            <motion.div
              key={activeStepId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "p-5 rounded-2xl bg-gradient-to-br shadow-lg",
                activeStep.color
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                  <ActiveIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">Étape {activeStepId}/8</p>
                  <p className="text-white text-xl font-bold">{activeStep.title}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Liste des étapes épurée */}
        <nav className="flex-1 p-6 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
            Parcours
          </p>
          <div className="space-y-1">
            {ONBOARDING_STEPS.map((step) => {
              const Icon = step.icon;
              const state = getStepState(step.id);
              const isActive = state === 'active';
              const isCompleted = state === 'completed';
              const isFuture = state === 'future';

              // Navigation vers la première page de l'étape complétée
              const handleStepClick = () => {
                if (isCompleted && step.pages.length > 0) {
                  navigate(createPageUrl(step.pages[0]));
                }
              };

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: step.id * 0.05 }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
                    isActive && "bg-gray-100",
                    isFuture && "opacity-40",
                    isCompleted && "cursor-pointer hover:bg-gray-50"
                  )}
                  onClick={handleStepClick}
                >
                  {/* Icône */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      isCompleted && "shadow-sm",
                      isActive && `bg-gradient-to-br ${step.color}`,
                      isFuture && "bg-gray-100"
                    )}
                    style={isCompleted ? { backgroundColor: step.bgColor } : {}}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Icon className={cn(
                        "w-5 h-5",
                        isActive ? "text-white" : "text-gray-400"
                      )} />
                    )}
                  </div>

                  {/* Titre */}
                  <span className={cn(
                    "text-sm font-medium flex-1",
                    isActive && "text-gray-900 font-semibold",
                    isCompleted && "text-gray-600",
                    isFuture && "text-gray-400"
                  )}>
                    {step.title}
                  </span>

                  {/* Indicateur actif */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-gradient-to-r from-[#61f7a2] to-[#4de88f]"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* ============================================== */}
      {/* MOBILE - OPTION C (Stepper dots)              */}
      {/* ============================================== */}

      {!isOfferDetailPage ? (
        // 🆕 NOUVEAU HEADER MOBILE - Option C Stepper Dots
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 shadow-sm">
          <div className="px-4 py-3">
            {/* Dots avec couleurs */}
            <div className="flex justify-center items-center gap-2 mb-2.5">
              {ONBOARDING_STEPS.map((step) => {
                const state = getStepState(step.id);
                const isActive = state === 'active';
                const isCompleted = state === 'completed';

                return (
                  <motion.div
                    key={step.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: step.id * 0.05 }}
                    className={cn(
                      "rounded-full transition-all duration-300",
                      isActive && `w-6 h-2 bg-gradient-to-r ${step.color}`,
                      isCompleted && "w-2 h-2",
                      !isActive && !isCompleted && "w-2 h-2 bg-gray-200"
                    )}
                    style={isCompleted ? { backgroundColor: step.bgColor } : {}}
                  />
                );
              })}
            </div>

            {/* Label avec icône */}
            {activeStep && (
              <div className="flex items-center justify-center gap-2">
                <div className={cn(
                  "w-5 h-5 rounded-md flex items-center justify-center bg-gradient-to-br",
                  activeStep.color
                )}>
                  <ActiveIcon className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {activeStep.title}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        // 🔒 ANCIEN HEADER pour pages Offer Detail (style photo 4)
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 transition-all shadow-sm">
          <div className="px-4 pt-2 pb-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-[12px] font-bold text-gray-900 leading-none">PASSION IA</h1>
                  <p className="text-[9px] text-gray-500 font-medium mt-0.5">
                    Étape {activeStepId}/8
                  </p>
                </div>
              </div>

              <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                <motion.div
                  className="h-full bg-[#61f7a2]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(activeStepId / 8) * 100}%` }}
                  transition={{ duration: 0.5, ease: "circOut" }}
                />
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
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
                        : step.id > 3
                          ? `bg-gradient-to-br ${step.color} border-transparent`
                          : "bg-white border-gray-100",
                      isCompleted && step.id <= 3 && "opacity-50 border-transparent bg-gray-50",
                      isFuture && step.id <= 3 && "opacity-30 border-transparent"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center relative",
                      isCompleted && step.id <= 3
                        ? "bg-gray-200"
                        : isActive
                          ? `bg-gradient-to-br ${step.color}`
                          : step.id > 3
                            ? "bg-white/20"
                            : "bg-gray-100"
                    )}>
                      {isCompleted && step.id <= 3 ? (
                        <CheckCircle2 className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Icon className={cn(
                          "w-3 h-3",
                          isActive || step.id > 3 ? "text-white" : "text-gray-400"
                        )} />
                      )}
                    </div>
                    <span className={cn(
                      "text-xs font-bold whitespace-nowrap",
                      isActive ? "text-white" :
                        step.id > 3 ? "text-white" :
                          "text-gray-500",
                      isCompleted && step.id <= 3 && "line-through font-normal"
                    )}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}