import React from 'react';
import { motion } from 'framer-motion';
import { Check, BookOpen, Gift, Layers, Crown } from 'lucide-react';

const mainSteps = [
  { id: 1, label: "Ton Offre" },
  { id: 2, label: "Bonne nouvelle !" },
  { id: 3, label: "Ta Vie Future" },
  { id: 4, label: "Concrètement ?" },
  { id: 5, label: "Plan d'Action" }
];

const offerSteps = [
  { id: 1, label: "Produit Principal", icon: BookOpen },
  { id: 2, label: "Petit Extra", icon: Gift },
  { id: 3, label: "Offre Supérieure", icon: Layers },
  { id: 4, label: "Offre Premium", icon: Crown }
];

export default function OfferBuilderLayout({ 
  currentStep, 
  children 
}) {
  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Main navigation bar */}
      <div className="bg-[#f8f7f4] pt-6 pb-4 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {mainSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                {index > 0 && (
                  <div className="hidden md:block w-8 h-[2px] bg-gray-300" />
                )}
                <div 
                  className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    step.id === 1 
                      ? 'bg-[#22c55e] text-white' 
                      : 'text-gray-400'
                  }`}
                >
                  {step.id}. {step.label}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Offer steps progress bar */}
      <div className="bg-[#f8f7f4] pb-6 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            {offerSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep - 1;
              const isActive = index === currentStep - 1;
              const isUpcoming = index > currentStep - 1;
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isCompleted 
                          ? 'bg-[#22c55e] text-white' 
                          : isActive 
                            ? 'bg-[#22c55e] text-white border-4 border-[#22c55e]/30' 
                            : 'bg-white border-2 border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                    </div>
                    <span className={`text-xs mt-2 text-center ${
                      isActive ? 'text-gray-800 font-medium' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  
                  {index < offerSteps.length - 1 && (
                    <div className="flex-1 mx-2 h-1 rounded-full overflow-hidden bg-gray-200">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          isCompleted ? 'bg-[#22c55e] w-full' : isActive ? 'bg-[#22c55e] w-1/2' : 'w-0'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-12">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#f8f7f4] border-t border-gray-200 py-3">
        <div className="text-center text-gray-400 text-sm">
          Copyright Passion IA
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-[#22c55e]">
          <div className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" />
          SYSTÈME CONNECTÉ
        </div>
      </div>
    </div>
  );
}