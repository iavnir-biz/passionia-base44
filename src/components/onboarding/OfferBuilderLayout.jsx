import React from 'react';
import { Check, Package, Gift, Award, Crown } from 'lucide-react';
import { cn } from "@/lib/utils";

const mainSteps = [
  { id: 1, label: "Ton Offre", active: true },
  { id: 2, label: "Bonne nouvelle !", active: false },
  { id: 3, label: "Ta Vie Future", active: false },
  { id: 4, label: "Concrètement ?", active: false },
  { id: 5, label: "Plan d'Action", active: false },
];

const offerSteps = [
  { id: 1, label: "Produit Principal", icon: Package },
  { id: 2, label: "Petit Extra", icon: Gift },
  { id: 3, label: "Offre Supérieure", icon: Award },
  { id: 4, label: "Offre Premium", icon: Crown },
];

export default function OfferBuilderLayout({ 
  currentStep, 
  children 
}) {
  return (
    <div className="min-h-screen bg-[#f5f3f0]">
      {/* Main Navigation Bar */}
      <div className="bg-[#f5f3f0] pt-6 pb-4">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2">
            {mainSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  step.active 
                    ? "bg-[#22c55e] text-white" 
                    : "text-gray-500"
                )}>
                  {step.id}. {step.label}
                </div>
                {index < mainSteps.length - 1 && (
                  <div className="w-8 h-[1px] bg-gray-300" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Offer Steps Progress */}
      <div className="bg-[#f5f3f0] pb-6">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {offerSteps.map((step, index) => {
              const isCompleted = step.id < currentStep;
              const isActive = step.id === currentStep;
              const Icon = step.icon;
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                      isCompleted 
                        ? "bg-[#22c55e] text-white" 
                        : isActive 
                          ? "bg-[#1e3a5f] text-white" 
                          : "bg-gray-200 text-gray-500"
                    )}>
                      {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      isActive ? "text-[#1e3a5f]" : "text-gray-500"
                    )}>
                      {step.label}
                    </span>
                  </div>
                  {index < offerSteps.length - 1 && (
                    <div className="flex-1 h-1 mx-2 rounded-full overflow-hidden bg-gray-200">
                      <div 
                        className={cn(
                          "h-full bg-[#22c55e] transition-all duration-500",
                          isCompleted ? "w-full" : isActive ? "w-1/2" : "w-0"
                        )}
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
      <div className="pb-12">
        {children}
      </div>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-gray-200 bg-[#f5f3f0]">
        <p className="text-gray-500 text-sm">Copyright Passion IA</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
          <span className="text-[#22c55e] text-xs font-medium">SYSTÈME CONNECTÉ</span>
        </div>
      </footer>
    </div>
  );
}