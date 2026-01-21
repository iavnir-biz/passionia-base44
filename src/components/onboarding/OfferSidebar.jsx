import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Package, Gift, TrendingUp, Crown, FileCheck } from 'lucide-react';
import { cn } from "@/lib/utils";

const OFFER_STEPS = [
  { id: 1, label: 'Produit Principal', page: 'OfferProductPrincipal', icon: Package },
  { id: 2, label: 'Petit Extra', page: 'OfferPetitExtra', icon: Gift },
  { id: 3, label: 'Offre Supérieure', page: 'OfferSuperieure', icon: TrendingUp },
  { id: 4, label: 'Offre Premium', page: 'OfferPremium', icon: Crown },
  { id: 5, label: 'Résumé', page: 'OfferResume', icon: FileCheck }
];

export default function OfferSidebar({ currentPage, currentStep: propStep }) {
  const navigate = useNavigate();

  // Déterminer l'étape active en fonction de la page actuelle ou currentStep (prop)
  let activeStepObj = OFFER_STEPS.find(step => step.page === currentPage);

  // Fallback sur le propStep si currentPage ne correspond à rien
  if (!activeStepObj && propStep) {
    activeStepObj = OFFER_STEPS.find(step => step.id === propStep);
  }

  // Fallback final
  if (!activeStepObj) {
    activeStepObj = OFFER_STEPS[0];
  }

  const currentStep = activeStepObj.id;

  const stepColors = {
    1: { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50', text: 'text-blue-500', iconBg: 'bg-blue-500/20' },
    2: { bg: 'from-green-500 to-green-600', light: 'bg-green-50', text: 'text-green-500', iconBg: 'bg-green-500/20' },
    3: { bg: 'from-purple-500 to-purple-600', light: 'bg-purple-50', text: 'text-purple-500', iconBg: 'bg-purple-500/20' },
    4: { bg: 'from-yellow-500 to-yellow-600', light: 'bg-yellow-50', text: 'text-yellow-600', iconBg: 'bg-yellow-500/20' },
    5: { bg: 'from-[#61f7a2] to-[#4de88f]', light: 'bg-[#61f7a2]/10', text: 'text-[#61f7a2]', iconBg: 'bg-[#61f7a2]/20' }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-200 p-6 flex-col z-40">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">🏗️ Ton Offre</h2>
          <p className="text-sm text-gray-600">Construis ton offre complète</p>
        </div>

        {/* Steps */}
        <div className="flex-1 space-y-3">
          {OFFER_STEPS.map((step) => {
            const isActive = step.id === currentStep;
            // On considère les étapes précédentes comme "passées".
            // On peut aussi décider que toutes les étapes sont cliquables si on veut naviguer librement.
            // Pour l'instant, rendons cliquable si c'est l'étape courante ou une précédente.
            const isPrevious = step.id < currentStep;
            const isClickable = isPrevious || isActive;

            const colors = stepColors[step.id];

            return (
              <button
                key={step.id}
                onClick={() => isClickable && navigate(createPageUrl(step.page))}
                disabled={!isClickable}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                  isActive && `bg-gradient-to-r ${colors.bg} text-white shadow-lg`,
                  // Style pour les items précédents (accessibles mais pas actifs)
                  isPrevious && `bg-white hover:bg-gray-50 text-gray-600 cursor-pointer border border-gray-100`,
                  // Style pour les items futurs (inaccessibles)
                  !isActive && !isPrevious && "bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                  isActive && "bg-white/20",
                  isPrevious && colors.iconBg, // Icone colorée pour les précédents
                  !isActive && !isPrevious && "bg-gray-100"
                )}>
                  <step.icon className={cn(
                    "w-5 h-5",
                    isActive && "text-white",
                    isPrevious && colors.text,
                    !isActive && !isPrevious && "text-gray-400"
                  )} />
                </div>
                <div className="flex-1">
                  <div className={cn(
                    "text-xs font-medium mb-0.5",
                    isActive ? "text-white/80" : "text-gray-500"
                  )}>
                    Étape {step.id}
                  </div>
                  <div className={cn(
                    "font-semibold text-sm",
                    isActive ? "text-white" : "text-gray-900"
                  )}>
                    {step.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Progression</span>
            <span className="text-xs font-bold text-[#61f7a2]">{Math.round((currentStep / OFFER_STEPS.length) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#61f7a2] to-[#4de88f] transition-all duration-500"
              style={{ width: `${(currentStep / OFFER_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar (Version simplifiée sticky top) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            `bg-gradient-to-br ${stepColors[currentStep]?.bg}`
          )}>
            <activeStepObj.icon className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h2 className="font-bold text-gray-900 text-sm">{activeStepObj.label}</h2>
              <span className="text-xs font-medium text-[#61f7a2]">{currentStep}/{OFFER_STEPS.length}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#61f7a2] to-[#4de88f]"
                style={{ width: `${(currentStep / OFFER_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}