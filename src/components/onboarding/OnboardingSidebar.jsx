import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
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
    pages: ['Dashboard'],
    color: 'from-[#61f7a2] to-[#4de88f]'
  }
];

export default function OnboardingSidebar({ currentPage, completedSteps = [] }) {
  // Déterminer l'étape active basée sur la page courante
  const activeStep = ONBOARDING_STEPS.find(step => 
    step.pages.includes(currentPage)
  );

  const activeStepId = activeStep?.id || 1;

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
            const isActive = step.id === activeStepId;
            const isCompleted = completedSteps.includes(step.id);
            const isFuture = step.id > activeStepId;

            return (
              <div key={step.id} className="relative">
                {/* Connecting line */}
                {index < ONBOARDING_STEPS.length - 1 && (
                  <div className="absolute left-[23px] top-[50px] w-0.5 h-8 bg-gray-200" />
                )}

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "relative flex items-center gap-3 p-3 rounded-xl transition-all",
                    isActive && "bg-gray-50 shadow-sm border border-gray-200",
                    isFuture && "opacity-40"
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                    isCompleted 
                      ? "bg-[#61f7a2]" 
                      : `bg-gradient-to-br ${step.color}`
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : (
                      <Icon className="w-6 h-6 text-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm font-semibold",
                      isActive || isCompleted ? "text-gray-900" : "text-gray-600"
                    )}>
                      {step.title}
                    </p>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-3 w-2 h-2 rounded-full bg-[#61f7a2]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Mobile - Top bar horizontale */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900">PASSION IA</h1>
                <p className="text-[10px] text-gray-600">Onboarding</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-900">Étape {activeStepId}/8</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#61f7a2] to-[#4de88f]"
              initial={{ width: '0%' }}
              animate={{ width: `${(activeStepId / ONBOARDING_STEPS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Horizontal steps */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
            {ONBOARDING_STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === activeStepId;
              const isCompleted = completedSteps.includes(step.id);

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg flex-shrink-0 transition-all",
                    isActive && "bg-gray-50"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center",
                    isCompleted 
                      ? "bg-[#61f7a2]" 
                      : `bg-gradient-to-br ${step.color}`
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    ) : (
                      <Icon className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    isActive || isCompleted ? "text-gray-900" : "text-gray-500"
                  )}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}