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

  return (
    <div className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-200 p-6 flex flex-col z-40">
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

          return (
            <button
              key={step.id}
              onClick={() => isClickable && navigate(createPageUrl(step.page))}
              disabled={!isClickable}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                isActive && "bg-gradient-to-r from-[#61f7a2] to-[#4de88f] text-white shadow-lg",
                isPrevious && "bg-[#61f7a2]/10 text-[#61f7a2] hover:bg-[#61f7a2]/20 cursor-pointer",
                !isActive && !isPrevious && "bg-gray-50 text-gray-400 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                isActive && "bg-white/20",
                isPrevious && "bg-[#61f7a2]/20",
                !isActive && !isPrevious && "bg-gray-100"
              )}>
                <step.icon className={cn(
                  "w-5 h-5",
                  isActive && "text-white",
                  isPrevious && "text-[#61f7a2]",
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
  );
}