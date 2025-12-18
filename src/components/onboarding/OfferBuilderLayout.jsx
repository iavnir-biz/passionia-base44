import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Check, Package, Gift, Award, Crown } from 'lucide-react';
import { cn } from "@/lib/utils";

const mainSteps = [
{ id: 1, label: "Ton Offre", page: "OfferResume" },
{ id: 2, label: "Bonne nouvelle !", page: "BonneNouvelle" },
{ id: 3, label: "Ta Vie Future", page: "OfferTaVieFuture" },
{ id: 4, label: "Concrètement ?", page: "OfferConcretement" },
{ id: 5, label: "Plan d'Action", page: "PlanAction" }];


const offerSteps = [
{ id: 1, label: "Produit Principal", icon: Package },
{ id: 2, label: "Petit Extra", icon: Gift },
{ id: 3, label: "Offre Supérieure", icon: Award },
{ id: 4, label: "Offre Premium", icon: Crown },
{ id: 5, label: "Résumé", icon: Check }];


export default function OfferBuilderLayout({
  currentStep,
  children
}) {
  const navigate = useNavigate();

  const handleStepClick = (step) => {
    if (step.page) {
      navigate(createPageUrl(step.page));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Main Navigation Bar */}
      <div className="bg-[#11112b] py-4 border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center gap-1 md:gap-2 flex-wrap">
            {mainSteps.map((step, index) =>
            <React.Fragment key={step.id}>
                <button 
                  onClick={() => handleStepClick(step)}
                  className={cn(
                  "px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap cursor-pointer hover:opacity-80",
                  step.id === currentStep ?
                  "bg-[#61f7a2] text-white shadow-sm" :
                  "text-gray-400 hover:text-gray-300"
                )}>
                  {step.id}. {step.label}
                </button>
                {index < mainSteps.length - 1 &&
              <div className="w-4 md:w-8 h-[2px] bg-gray-200" />
              }
              </React.Fragment>
            )}
          </div>
        </div>
      </div>

      {/* Offer Steps Progress */}
      <div className="bg-white py-8 border-b border-gray-200">
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
                      "w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all shadow-sm",
                      isCompleted ?
                      "bg-[#61f7a2] text-white" :
                      isActive ?
                      "bg-[#61f7a2] text-white" :
                      "bg-gray-100 text-gray-400"
                    )}>
                      {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                    </div>
                    <span className={cn(
                      "text-xs font-medium text-center hidden md:block",
                      isActive ? "text-gray-900" : isCompleted ? "text-[#61f7a2]" : "text-gray-400"
                    )}>
                      {step.label}
                    </span>
                  </div>
                  {index < offerSteps.length - 1 &&
                  <div className="flex-1 h-1 mx-2 rounded-full overflow-hidden bg-gray-100">
                      <div
                      className={cn(
                        "h-full bg-[#61f7a2] transition-all duration-500",
                        isCompleted ? "w-full" : isActive ? "w-1/2" : "w-0"
                      )} />

                    </div>
                  }
                </React.Fragment>);

            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-12">
        {children}
      </div>
    </div>);

}