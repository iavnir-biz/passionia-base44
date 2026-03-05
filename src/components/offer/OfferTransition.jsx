import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Zap, Lightbulb, Target, CheckCircle, Rocket } from 'lucide-react';

export default function OfferTransition({ onComplete, message = "Noah analyse ton choix...", isPlanAction = false }) {
  const [currentStep, setCurrentStep] = useState(0);

  const defaultSteps = [{ text: message, icon: Brain }];
  const planActionSteps = [
    { text: "Noah analyse ton profil...", icon: Brain },
    { text: "Création de ton plan personnalisé...", icon: Lightbulb },
    { text: "Adaptation à tes objectifs...", icon: Target },
    { text: "Finalisation de ta stratégie...", icon: Rocket }
  ];

  const steps = isPlanAction ? planActionSteps : defaultSteps;
  const duration = isPlanAction ? 3500 : 1500;

  useEffect(() => {
    if (isPlanAction) {
      const stepDuration = duration / steps.length;
      const interval = setInterval(() => {
        setCurrentStep((prev) => prev < steps.length - 1 ? prev + 1 : prev);
      }, stepDuration);
      const timer = setTimeout(() => { if (onComplete) onComplete(); }, duration);
      return () => { clearInterval(interval); clearTimeout(timer); };
    } else {
      const timer = setTimeout(() => { if (onComplete) onComplete(); }, duration);
      return () => clearTimeout(timer);
    }
  }, [onComplete, isPlanAction, duration, steps.length]);

  const CurrentIcon = steps[currentStep]?.icon || Brain;

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50"
         style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Neon background circles */}
      <div style={{
        position: 'absolute', width: '280px', height: '280px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)',
        top: '15%', left: '10%', filter: 'blur(60px)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', width: '220px', height: '220px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
        bottom: '15%', right: '10%', filter: 'blur(60px)', pointerEvents: 'none'
      }} />

      <div className="text-center max-w-md px-6 relative z-10">
        {/* Animated icon */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative mx-auto mb-8 w-24 h-24"
        >
          <div className="w-24 h-24 rounded-2xl bg-[#1a1a1a] flex items-center justify-center shadow-xl">
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <CurrentIcon className="w-12 h-12 text-white" />
            </motion.div>
          </div>

          {[...Array(2)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-2xl border border-[#1a1a1a]"
              initial={{ scale: 1, opacity: 0.3 }}
              animate={{ scale: [1, 1.5, 2], opacity: [0.3, 0.1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
            />
          ))}
        </motion.div>

        {/* Message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <p className="text-xl font-semibold text-[#1a1a1a]">
              {steps[currentStep]?.text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress for plan action */}
        {isPlanAction && (
          <div className="w-full bg-[#f0f0f0] h-2 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #f97316, #ec4899, #a78bfa)' }}
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 rounded-full bg-[#1a1a1a]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}