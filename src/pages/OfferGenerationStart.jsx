import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Zap } from 'lucide-react';

export default function OfferGenerationStart() {
  const navigate = useNavigate();
  const [dots, setDots] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);

  const messages = [
    "J'analyse ton marché",
    "Je structure tes offres",
    "Je fixe tes prix",
    "Je valide la demande",
    "Je projette ton potentiel de revenus",
    "J'élabore ton plan d'action personnalisé"
  ];

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev + 1) % 4);
    }, 500);

    generateOffer();

    return () => {
      clearInterval(dotsInterval);
    };
  }, []);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(messageInterval);
  }, []);

  const generateOffer = async () => {
    try {
      const user = await base44.auth.me();
      
      // Get user's session
      const sessions = await base44.entities.Session.filter({ 
        created_by: user.email 
      });
      
      if (!sessions || sessions.length === 0) {
        console.error('Session not found, redirecting to onboarding');
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }
      
      const session = sessions[0];
      const sessionId = session.id;

      // Vérifier que toutes les données nécessaires sont présentes
      const missingData = [];
      if (!user.firstName) missingData.push('firstName');
      if (!session.skill && !session.onboarding_summary?.who_to_teach) missingData.push('skill');
      if (!session.onboarding_history || session.onboarding_history.length < 11) {
        missingData.push(`onboarding_history (${session.onboarding_history?.length || 0}/11 questions)`);
      }
      if (!session.onboarding_full || Object.keys(session.onboarding_full).length === 0) {
        missingData.push('réponses statiques post-transition');
      }

      if (missingData.length > 0) {
        console.error('Données manquantes pour générer l\'offre:', missingData);
        // Rediriger vers l'onboarding dynamic pour compléter
        navigate(createPageUrl('OnboardingDynamic'));
        return;
      }
      
      // Generate Full Stack Offer (P.S.S.O.)
      const response = await base44.functions.invoke('generateFullStackOffer', {
        sessionId
      });

      if (response.data?.error) {
        console.error('Erreur génération offre:', response.data.error);
      }
      
      // Navigate to offer selection pages
      navigate(createPageUrl('OfferProductPrincipal'));
    } catch (error) {
      console.error('Error:', error);
      navigate(createPageUrl('OfferProductPrincipal'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center p-6">
      <div className="text-center max-w-2xl">
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
            className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#61f7a2]/10 to-[#4de88f]/5 flex items-center justify-center relative"
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
          className="text-3xl font-bold text-gray-900 mb-4"
        >
          Noah analyse ton projet…
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-gray-600 text-lg mb-8"
        >
          Encore un instant, je prépare ton plan personnalisé.
        </motion.p>

        {/* Animated Messages avec effet gamifié */}
        <div className="relative h-16 mb-8">
          <motion.div
            key={currentMessage}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-gradient-to-r from-[#61f7a2]/10 via-[#61f7a2]/20 to-[#61f7a2]/10 px-8 py-4 rounded-2xl border-2 border-[#61f7a2]/30 shadow-lg">
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-gray-900 text-xl font-bold flex items-center gap-3"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-[#61f7a2]" />
                </motion.div>
                {messages[currentMessage]}
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {".".repeat((dots % 3) + 1)}
                </motion.span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Progress Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex items-center justify-center gap-2"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                backgroundColor: ['#e5e7eb', '#61f7a2', '#e5e7eb']
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