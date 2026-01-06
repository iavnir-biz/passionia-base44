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
              <Brain className="w-14 h-14 text-white" />
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

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <p className="text-xl font-semibold text-gray-800">
            Nova construit ton offre…
          </p>
        </motion.div>
        
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