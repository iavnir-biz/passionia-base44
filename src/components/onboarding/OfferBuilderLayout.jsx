import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Check, Package, Gift, Award, Crown } from 'lucide-react';
import { cn } from "@/lib/utils";

const mainSteps = [
{ id: 1, label: "Ton Offre", subSteps: ['OfferProductPrincipal', 'OfferPetitExtra', 'OfferSuperieure', 'OfferPremium', 'OfferResume'] },
{ id: 2, label: "Bonne nouvelle !", page: "BonneNouvelle" },
{ id: 3, label: "Ta Vie Future", page: "OfferTaVieFuture" },
{ id: 4, label: "Concrètement ?", page: "OfferConcretement" },
{ id: 5, label: "Plan d'Action", page: "PlanAction" }];


const offerSteps = [
{ id: 1, label: "Produit Principal", icon: Package, page: "OfferProductPrincipal" },
{ id: 2, label: "Petit Extra", icon: Gift, page: "OfferPetitExtra" },
{ id: 3, label: "Offre Supérieure", icon: Award, page: "OfferSuperieure" },
{ id: 4, label: "Offre Premium", icon: Crown, page: "OfferPremium" },
{ id: 5, label: "Résumé", icon: Check, page: "OfferResume" }];


// Mapper les pages aux étapes principales
const pageToMainStep = {
  'OfferProductPrincipal': 1,
  'OfferPetitExtra': 1,
  'OfferSuperieure': 1,
  'OfferPremium': 1,
  'OfferResume': 1,
  'BonneNouvelle': 2,
  'OfferTaVieFuture': 3,
  'OfferConcretement': 4,
  'PlanAction': 5
};

const pageToOfferStep = {
  'OfferProductPrincipal': 1,
  'OfferPetitExtra': 2,
  'OfferSuperieure': 3,
  'OfferPremium': 4,
  'OfferResume': 5
};

export default function OfferBuilderLayout({
  currentStep,
  children
}) {
  const navigate = useNavigate();
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [maxOfferStepReached, setMaxOfferStepReached] = useState(1);
  const [currentPage, setCurrentPage] = useState('');

  useEffect(() => {
    // Détecter la page actuelle
    const path = window.location.pathname;
    const pageName = path.split('/').pop();
    setCurrentPage(pageName);

    // Charger la progression maximale
    loadProgress();
  }, []);

  useEffect(() => {
    // Mettre à jour la progression quand on change de page
    if (currentPage) {
      updateProgress();
    }
  }, [currentPage]);

  const loadProgress = async () => {
    try {
      const user = await base44.auth.me();
      setMaxStepReached(user.maxStepReached || 1);
      setMaxOfferStepReached(user.maxOfferStepReached || 1);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const updateProgress = async () => {
    try {
      const mainStep = pageToMainStep[currentPage];
      const offerStep = pageToOfferStep[currentPage];

      if (mainStep && mainStep > maxStepReached) {
        setMaxStepReached(mainStep);
        await base44.auth.updateMe({ maxStepReached: mainStep });
      }

      if (offerStep && offerStep > maxOfferStepReached) {
        setMaxOfferStepReached(offerStep);
        await base44.auth.updateMe({ maxOfferStepReached: offerStep });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleMainStepClick = (step) => {
    // Autoriser uniquement les étapes déjà atteintes
    if (step.id > maxStepReached) {
      return;
    }

    if (step.page) {
      navigate(createPageUrl(step.page));
    } else if (step.subSteps && step.subSteps.length > 0) {
      // Si c'est "Ton Offre", aller à la première sous-étape
      navigate(createPageUrl(step.subSteps[0]));
    }
  };

  const handleOfferStepClick = (step) => {
    // Autoriser uniquement les sous-étapes déjà atteintes
    if (step.id > maxOfferStepReached) {
      return;
    }

    if (step.page) {
      navigate(createPageUrl(step.page));
    }
  };

  const currentMainStep = pageToMainStep[currentPage] || 1;
  const currentOfferStep = pageToOfferStep[currentPage] || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Main Navigation Bar */}
      <div className="bg-[#11112b] py-4 border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center gap-1 md:gap-2 flex-wrap">
            {mainSteps.map((step, index) => {
              const isActive = step.id === currentMainStep;
              const isAccessible = step.id <= maxStepReached;
              
              return (
                <React.Fragment key={step.id}>
                  <button 
                    onClick={() => handleMainStepClick(step)}
                    disabled={!isAccessible}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap",
                      isActive && "bg-[#61f7a2] text-white shadow-sm",
                      !isActive && isAccessible && "text-gray-400 hover:text-gray-300 cursor-pointer hover:opacity-80",
                      !isAccessible && "text-gray-600 cursor-not-allowed opacity-50"
                    )}
                  >
                    {step.id}. {step.label}
                  </button>
                  {index < mainSteps.length - 1 &&
                    <div className="w-4 md:w-8 h-[2px] bg-gray-200" />
                  }
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Offer Steps Progress - Visible uniquement sur "Ton Offre" */}
      {currentMainStep === 1 && (
        <div className="bg-white py-8 border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex items-center justify-between">
              {offerSteps.map((step, index) => {
                const isCompleted = step.id < currentOfferStep;
                const isActive = step.id === currentOfferStep;
                const isAccessible = step.id <= maxOfferStepReached;
                const Icon = step.icon;

                return (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => handleOfferStepClick(step)}
                      disabled={!isAccessible}
                      className="flex flex-col items-center gap-2 disabled:cursor-not-allowed"
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all shadow-sm",
                        isCompleted && "bg-[#61f7a2] text-white cursor-pointer hover:opacity-80",
                        isActive && "bg-[#61f7a2] text-white",
                        !isCompleted && !isActive && isAccessible && "bg-gray-100 text-gray-400",
                        !isAccessible && "bg-gray-100 text-gray-300 opacity-50"
                      )}>
                        {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                      </div>
                      <span className={cn(
                        "text-xs font-medium text-center hidden md:block",
                        isActive && "text-gray-900",
                        isCompleted && "text-[#61f7a2]",
                        !isActive && !isCompleted && "text-gray-400"
                      )}>
                        {step.label}
                      </span>
                    </button>
                    {index < offerSteps.length - 1 &&
                      <div className="flex-1 h-1 mx-2 rounded-full overflow-hidden bg-gray-100">
                        <div
                          className={cn(
                            "h-full bg-[#61f7a2] transition-all duration-500",
                            isCompleted ? "w-full" : isActive ? "w-1/2" : "w-0"
                          )}
                        />
                      </div>
                    }
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="py-12">
        {children}
      </div>
    </div>);

}