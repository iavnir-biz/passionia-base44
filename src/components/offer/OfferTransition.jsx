import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Zap, Lightbulb, Target, CheckCircle, Rocket } from 'lucide-react';

export default function OfferTransition({ onComplete, message = "Nova analyse ton choix...", isPlanAction = false }) {
  const [currentStep, setCurrentStep] = useState(0);

  const defaultSteps = [
    { text: message, icon: Brain }
  ];

  const planActionSteps = [
    { text: "Nova analyse ton profil...", icon: Brain },
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
        setCurrentStep((prev) => {
          if (prev < steps.length - 1) return prev + 1;
          return prev;
        });
      }, stepDuration);

      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, duration);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    } else {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [onComplete, isPlanAction, duration, steps.length]);

  const CurrentIcon = steps[currentStep]?.icon || Brain;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center z-50">
      <div className="text-center max-w-md px-6">
        {/* Nova AI Avatar avec cerveau animé */}
        <motion.div
          animate={{ 
            scale: [1, 1.08, 1],
            rotate: [0, 3, -3, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative mx-auto mb-8"
        >
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#61f7a2] via-[#4de88f] to-[#3ad87f] flex items-center justify-center shadow-2xl">
            <motion.div
              animate={{ 
                scale: [1, 1.15, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <CurrentIcon className="w-14 h-14 text-white" />
            </motion.div>
          </div>
          
          {/* Ondes d'énergie autour */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-3xl border-2 border-[#61f7a2]"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ 
                scale: [1, 1.4, 1.8],
                opacity: [0.6, 0.3, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeOut"
              }}
            />
          ))}
          
          {/* Particules qui tournent */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-8"
          >
            <Zap className="absolute top-0 left-1/2 w-5 h-5 text-[#61f7a2] opacity-80" />
            <Sparkles className="absolute top-1/2 right-0 w-5 h-5 text-[#4de88f] opacity-80" />
            <Lightbulb className="absolute bottom-0 left-1/2 w-5 h-5 text-[#3ad87f] opacity-80" />
            <Target className="absolute top-1/2 left-0 w-5 h-5 text-[#61f7a2] opacity-80" />
          </motion.div>
          
          {/* Glow effect pulsant */}
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-3xl bg-[#61f7a2] blur-2xl"
          />
        </motion.div>

        {/* Message avec transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <p className="text-xl font-semibold text-gray-800">
              {steps[currentStep]?.text}
            </p>
          </motion.div>
        </AnimatePresence>
        
        {/* Progress bar pour plan action */}
        {isPlanAction && (
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full bg-gradient-to-r from-[#61f7a2] to-[#4de88f]"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}

        {/* Steps indicator pour plan action */}
        {isPlanAction && (
          <div className="flex items-center justify-center gap-3 mb-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0.3 }}
                animate={{ 
                  scale: index === currentStep ? 1.2 : index < currentStep ? 1 : 0.8,
                  opacity: index <= currentStep ? 1 : 0.3
                }}
                transition={{ duration: 0.3 }}
                className={`w-2.5 h-2.5 rounded-full ${
                  index < currentStep 
                    ? 'bg-[#61f7a2]' 
                    : index === currentStep 
                      ? 'bg-gradient-to-r from-[#61f7a2] to-[#4de88f]' 
                      : 'bg-gray-300'
                }`}
              >
                {index < currentStep && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-full h-full rounded-full bg-[#61f7a2] flex items-center justify-center"
                  >
                    <CheckCircle className="w-2 h-2 text-white" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Loading dots */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-2.5 h-2.5 rounded-full bg-[#61f7a2]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}