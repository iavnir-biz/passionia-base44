import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Package, Gift, TrendingUp, Crown, FileCheck } from 'lucide-react';
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: 'Produit Principal', page: 'OfferProductPrincipal', icon: Package },
  { id: 2, label: 'Petit Extra', page: 'OfferPetitExtra', icon: Gift },
  { id: 3, label: 'Offre Supérieure', page: 'OfferSuperieure', icon: TrendingUp },
  { id: 4, label: 'Offre Premium', page: 'OfferPremium', icon: Crown },
  { id: 5, label: 'Résumé', page: 'OfferResume', icon: FileCheck }
];

export default function OfferSidebar({ currentStep }) {
  const navigate = useNavigate();

  const stepColors = {
    1: { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50', text: 'text-blue-500', iconBg: 'bg-blue-500/20' },
    2: { bg: 'from-green-500 to-green-600', light: 'bg-green-50', text: 'text-green-500', iconBg: 'bg-green-500/20' },
    3: { bg: 'from-purple-500 to-purple-600', light: 'bg-purple-50', text: 'text-purple-500', iconBg: 'bg-purple-500/20' },
    4: { bg: 'from-yellow-500 to-yellow-600', light: 'bg-yellow-50', text: 'text-yellow-600', iconBg: 'bg-yellow-500/20' },
    5: { bg: 'from-[#61f7a2] to-[#4de88f]', light: 'bg-[#61f7a2]/10', text: 'text-[#61f7a2]', iconBg: 'bg-[#61f7a2]/20' }
  };

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-200 p-6 flex-col z-40">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">🏗️ Ton Offre</h2>
          <p className="text-sm text-gray-600">Construis ton offre complète</p>
        </div>

        {/* Steps */}
        <div className="flex-1 space-y-3">
          {steps.map((step) => {
            const isActive = step.id === currentStep;
            const isPrevious = step.id < currentStep;
            const isClickable = isPrevious;
            const colors = stepColors[step.id];

            return (
              <button
                key={step.id}
                onClick={() => isClickable && navigate(createPageUrl(step.page))}
                disabled={!isClickable}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                  isActive && `bg-gradient-to-r ${colors.bg} text-white shadow-lg`,
                  isPrevious && `${colors.light} ${colors.text} hover:opacity-80 cursor-pointer`,
                  !isActive && !isPrevious && "bg-gray-50 text-gray-400 cursor-not-allowed"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  isActive && "bg-white/20",
                  isPrevious && colors.iconBg,
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
                  <div className="text-xs font-medium opacity-80 mb-0.5">Étape {step.id}</div>
                  <div className="font-semibold text-sm">{step.label}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Progression</span>
            <span className="text-xs font-bold text-[#61f7a2]">{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#61f7a2] to-[#4de88f] transition-all duration-500"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Top Bar - Visible only on mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-gray-900">🏗️ Ton Offre</h2>
          <span className="text-xs font-bold text-[#61f7a2]">
            Étape {currentStep}/5
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-[#61f7a2] to-[#4de88f] transition-all duration-500"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>

        {/* Horizontal Steps */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {steps.map((step) => {
            const isActive = step.id === currentStep;
            const isPrevious = step.id < currentStep;
            const colors = stepColors[step.id];

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-xs font-medium transition-all flex-shrink-0",
                  isActive && `bg-gradient-to-r ${colors.bg} text-white`,
                  isPrevious && `${colors.light} ${colors.text}`,
                  !isActive && !isPrevious && "bg-gray-50 text-gray-400"
                )}
              >
                <step.icon className="w-4 h-4" />
                <span>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}