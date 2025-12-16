import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Zap } from 'lucide-react';

export default function OfferGenerationStart() {
  const navigate = useNavigate();
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev + 1) % 4);
    }, 500);

    generateOffer();

    return () => {
      clearInterval(dotsInterval);
    };
  }, []);

  const generateOffer = async () => {
    try {
      const user = await base44.auth.me();
      
      // Get user's session
      const sessions = await base44.entities.Session.filter({ 
        created_by: user.email 
      });
      
      if (!sessions || sessions.length === 0) {
        throw new Error('Session not found');
      }
      
      const sessionId = sessions[0].id;
      
      // Sync User onboarding data to Session first
      await base44.functions.invoke('syncOnboardingToSession', {
        sessionId
      });
      
      // Generate offer from onboarding data
      await base44.functions.invoke('generateOfferFromOnboarding', {
        sessionId
      });
      
      // Mark onboarding as completed
      await base44.auth.updateMe({ onboardingCompleted: true });
      
      // Navigate to offer selection pages
      navigate(createPageUrl('OfferProductPrincipal'));
    } catch (error) {
      console.error('Error:', error);
      navigate(createPageUrl('Results'));
    }
  };

  return (
    <div className="min-h-screen bg-[#11112b] flex items-center justify-center p-6">
      <div className="text-center">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 relative"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#2a2a45] to-[#1b1b33] flex items-center justify-center relative"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-full bg-[#61f7a2]/20 flex items-center justify-center"
            >
              <Brain className="w-12 h-12 text-[#61f7a2]" />
            </motion.div>
          </motion.div>

          <motion.div
            animate={{ 
              y: [0, -10, 0],
              x: [0, 10, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute top-2 right-12"
          >
            <Sparkles className="w-6 h-6 text-[#61f7a2]" />
          </motion.div>

          <motion.div
            animate={{ 
              y: [0, 10, 0],
              x: [0, -10, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            className="absolute bottom-2 left-12"
          >
            <Zap className="w-6 h-6 text-[#61f7a2]" />
          </motion.div>
        </motion.div>

        {/* Text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-3xl font-bold text-white mb-4"
        >
          L'IA analyse vos réponses{'.'.repeat(dots)}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-gray-400 text-lg"
        >
          L'IA analyse vos réponses pour créer votre plan personnalisé
        </motion.p>

        {/* Progress Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex items-center justify-center gap-2 mt-8"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                backgroundColor: ['#2a2a45', '#61f7a2', '#2a2a45']
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-3 h-3 rounded-full"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}