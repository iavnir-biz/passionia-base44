import React from 'react';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import GlowButton from '@/components/ui/GlowButton';
import ProgressBar from '@/components/ui/ProgressBar';
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function OnboardingStep({ 
  step, 
  totalSteps, 
  question, 
  description,
  children,
  onNext,
  onBack,
  canProceed = true,
  isLast = false
}) {
  return (
    <div className="min-h-screen bg-[#11112b] flex flex-col">
      {/* Header with progress */}
      <div className="p-6 border-b border-[#2a2a45]">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Étape {step} sur {totalSteps}</span>
            <span className="text-sm font-semibold text-[#61f7a2]">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <ProgressBar value={step} max={totalSteps} size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-[#1b1b33] rounded-3xl border border-[#2a2a45] p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {question}
            </h2>
            {description && (
              <p className="text-gray-400 mb-8">{description}</p>
            )}
            
            <div className="space-y-6">
              {children}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <GlowButton 
                variant="ghost" 
                onClick={onBack}
                icon={ChevronLeft}
              >
                Retour
              </GlowButton>
            ) : (
              <div />
            )}
            
            <GlowButton 
              onClick={onNext}
              disabled={!canProceed}
              icon={isLast ? null : ChevronRight}
              className={cn(!canProceed && "opacity-50")}
            >
              {isLast ? "Générer mon analyse" : "Continuer"}
            </GlowButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}