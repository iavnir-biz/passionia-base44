import React from 'react';
import { motion } from "framer-motion";
import { Sparkles, Brain, Zap } from "lucide-react";

const loadingMessages = [
  "Analyse de votre profil...",
  "Génération de votre avatar client...",
  "Création de votre offre unique...",
  "Personnalisation de votre stratégie...",
  "Finalisation de votre plan d'action..."
];

export default function LoadingStateAI({ message, step = 0 }) {
  const currentMessage = message || loadingMessages[step % loadingMessages.length];
  
  return (
    <div className="min-h-screen bg-[#0f1020] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Animated icon */}
        <motion.div 
          className="relative w-24 h-24 mx-auto mb-8"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full bg-[#61f7a2]/20 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-[#61f7a2]/30 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="absolute inset-4 rounded-full bg-[#61f7a2]/40 flex items-center justify-center">
            <Brain className="w-10 h-10 text-[#61f7a2]" />
          </div>
          
          {/* Orbiting particles */}
          <motion.div
            className="absolute -top-2 left-1/2 -translate-x-1/2"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-[#61f7a2]" />
          </motion.div>
          <motion.div
            className="absolute top-1/2 -right-2 -translate-y-1/2"
            animate={{ 
              rotate: [0, -360],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Zap className="w-4 h-4 text-[#61f7a2]" />
          </motion.div>
        </motion.div>
        
        {/* Loading text */}
        <motion.h2 
          key={currentMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-semibold text-white mb-3"
        >
          {currentMessage}
        </motion.h2>
        
        <p className="text-gray-400 text-sm mb-6">
          Noah analyse tes réponses pour créer ton plan personnalisé
        </p>
        
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[#61f7a2]"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}