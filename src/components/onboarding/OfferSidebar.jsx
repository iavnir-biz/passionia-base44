import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Package, Gift, TrendingUp, Crown, FileCheck } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

const OFFER_STEPS = [
  { id: 1, label: 'Produit Principal', page: 'OfferProductPrincipal', icon: Package },
  { id: 2, label: 'Petit Extra', page: 'OfferPetitExtra', icon: Gift },
  { id: 3, label: 'Offre Supérieure', page: 'OfferSuperieure', icon: TrendingUp },
  { id: 4, label: 'Offre Premium', page: 'OfferPremium', icon: Crown },
  { id: 5, label: 'Résumé', page: 'OfferResume', icon: FileCheck }
];

export default function OfferSidebar({ currentPage, currentStep: propStep }) {
  const navigate = useNavigate();

  let activeStepObj = OFFER_STEPS.find(step => step.page === currentPage);
  if (!activeStepObj && propStep) {
    activeStepObj = OFFER_STEPS.find(step => step.id === propStep);
  }
  if (!activeStepObj) {
    activeStepObj = OFFER_STEPS[0];
  }

  const currentStep = activeStepObj.id;
  const progressPercent = Math.round((currentStep / OFFER_STEPS.length) * 100);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 h-screen w-72 bg-white border-r border-[#e5e5e5] p-6 flex-col z-40"
           style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span style={{
              background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontSize: '18px', fontWeight: 800
            }}>NOAH™</span>
          </div>
          <p className="text-sm text-[#888]">Construis ton offre complète</p>
        </div>

        {/* Steps */}
        <div className="flex-1 space-y-2">
          {OFFER_STEPS.map((step) => {
            const isActive = step.id === currentStep;
            const isPrevious = step.id < currentStep;
            const isClickable = isPrevious || isActive;

            return (
              <button
                key={step.id}
                onClick={() => isClickable && navigate(createPageUrl(step.page))}
                disabled={!isClickable}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                  isActive && "bg-[#1a1a1a] text-white shadow-lg",
                  isPrevious && "bg-white hover:bg-[#f8f8f8] text-[#666] cursor-pointer border border-[#e5e5e5]",
                  !isActive && !isPrevious && "bg-[#f8f8f8] text-[#ccc] cursor-not-allowed opacity-60"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                  isActive && "bg-white/20",
                  isPrevious && "bg-[#f0f0f0]",
                  !isActive && !isPrevious && "bg-[#eee]"
                )}>
                  <step.icon className={cn(
                    "w-4 h-4",
                    isActive && "text-white",
                    isPrevious && "text-[#666]",
                    !isActive && !isPrevious && "text-[#ccc]"
                  )} />
                </div>
                <div className="flex-1">
                  <div className={cn(
                    "text-[10px] font-medium mb-0.5 uppercase tracking-wider",
                    isActive ? "text-white/70" : "text-[#aaa]"
                  )}>
                    Étape {step.id}
                  </div>
                  <div className={cn(
                    "font-semibold text-sm",
                    isActive ? "text-white" : isPrevious ? "text-[#1a1a1a]" : "text-[#ccc]"
                  )}>
                    {step.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress Footer */}
        <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#888]">Progression</span>
            <span className="text-xs font-bold text-[#1a1a1a]">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #f97316, #ec4899, #a78bfa)' }}
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-[#e5e5e5] z-50 px-4 py-3 shadow-sm"
           style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#1a1a1a]">
            <activeStepObj.icon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h2 className="font-bold text-[#1a1a1a] text-sm">{activeStepObj.label}</h2>
              <span className="text-xs font-medium text-[#888]">{currentStep}/{OFFER_STEPS.length}</span>
            </div>
            <div className="w-full h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #f97316, #ec4899, #a78bfa)',
                  width: `${progressPercent}%`,
                  transition: 'width 0.5s ease'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}