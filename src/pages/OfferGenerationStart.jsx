import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfferGenerationStart() {
  const navigate = useNavigate();
  const [dots, setDots] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

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

  const generateOffer = async (retryCount = 0) => {
    try {
      const user = await base44.auth.me();
      
      if (!user.sessionId) {
        console.error('❌ [OFFER_START] Pas de sessionId sur User');
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      // 🔥 Charger session avec retry sur 429
      let sessions = null;
      try {
        sessions = await base44.entities.Session.filter({ id: user.sessionId });
      } catch (fetchError) {
        // Si 429 ou erreur réseau, retry 1 fois après délai
        if (retryCount === 0 && (fetchError.message?.includes('429') || fetchError.message?.includes('Too Many'))) {
          console.warn('⚠️ [OFFER_START] Rate limit, retry dans 1s...');
          setIsRetrying(true);
          await new Promise(resolve => setTimeout(resolve, 1000));
          setIsRetrying(false);
          return generateOffer(1); // Retry
        }
        
        // Erreur persistante
        console.error('❌ [OFFER_START] Fetch session failed:', fetchError);
        setError({
          type: 'fetch_error',
          message: 'Impossible de charger tes données. Vérifie ta connexion.'
        });
        return;
      }
      
      if (!sessions || sessions.length === 0) {
        console.error('❌ [OFFER_START] Session introuvable:', user.sessionId);
        const fallbackSessions = await base44.entities.Session.filter({ created_by: user.email });
        if (fallbackSessions.length > 0) {
          console.warn('⚠️ [OFFER_START] Fallback sur created_by');
          const latestSession = fallbackSessions.sort((a, b) => 
            new Date(b.created_date) - new Date(a.created_date)
          )[0];
          await base44.auth.updateMe({ sessionId: latestSession.id });
          sessions = [latestSession];
        } else {
          navigate(createPageUrl('OnboardingFirstName'));
          return;
        }
      }

      const session = sessions[0];
      const sessionId = session.id;

      console.log('✅ [OFFER_START] Session loaded:', {
        sessionId,
        historyLength: session.onboarding_history?.length || 0,
        summaryKeys: Object.keys(session.onboarding_summary || {}),
        fullKeys: Object.keys(session.onboarding_full || {}),
        isDone: session.is_onboarding_done,
        skill: session.skill
      });

      // ✅ Validation stricte étape par étape
      if (!session.is_onboarding_done || (session.onboarding_history?.length || 0) < 11) {
        console.error('❌ [OfferGenerationStart] Onboarding incomplet:', {
          isDone: session.is_onboarding_done,
          historyLength: session.onboarding_history?.length || 0
        });
        navigate(createPageUrl('OnboardingDynamic'));
        return;
      }

      // 🔥 Validation stricte + redirect intelligent
      const requiredFullKeys = ['targetIncome', 'perceivedObstacles', 'readinessScore'];
      const fullData = session.onboarding_full || {};
      const missingKeys = requiredFullKeys.filter(k => !fullData[k] && fullData[k] !== 0);

      console.log('🔍 [OFFER_START]', {
        sessionId,
        missingFields: missingKeys,
        fullDataKeys: Object.keys(fullData),
        status: missingKeys.length === 0 ? 'ready' : 'incomplete'
      });

      if (missingKeys.length > 0) {
        const redirectMap = {
          'targetIncome': 'OnboardingQ16TargetIncome',
          'perceivedObstacles': 'OnboardingQ23Obstacles',
          'readinessScore': 'OnboardingQ25Readiness'
        };
        
        const firstMissing = missingKeys[0];
        const redirectPage = redirectMap[firstMissing] || 'OnboardingQ16TargetIncome';
        
        console.log('🔄 [OFFER_START] Redirect:', redirectPage, 'missing:', missingKeys);
        navigate(createPageUrl(redirectPage));
        return;
      }

      const missingData = [];
      
      if (!user.firstName) {
        missingData.push('firstName');
      }
      
      if (!session.skill && !session.onboarding_summary?.who_to_teach) {
        missingData.push('skill');
      }

      if (missingData.length > 0) {
        console.error('❌ Données manquantes pour générer l\'offre:', missingData);
        console.log('📦 État complet de la session:', {
          sessionId: session.id,
          skill: session.skill,
          onboarding_summary: session.onboarding_summary,
          onboarding_history_length: session.onboarding_history?.length || 0,
          onboarding_full_keys: Object.keys(session.onboarding_full || {}),
          user_firstName: user.firstName,
          user_coreSkill: user.coreSkill,
          user_targetIncome: user.targetIncome
        });
        
        // Rediriger intelligemment selon ce qui manque
        if (missingData.some(d => d.includes('onboarding_history'))) {
          alert(`⚠️ Onboarding incomplet (${session.onboarding_history?.length || 0}/11 questions)\n\nTu vas être redirigé pour finir les questions.`);
          navigate(createPageUrl('OnboardingDynamic'));
        } else if (missingData.some(d => d.includes('réponses statiques'))) {
          alert(`⚠️ Questions de profil incomplètes\n\nTu vas être redirigé pour finir ton profil.`);
          navigate(createPageUrl('OnboardingQ12AgeRange'));
        } else {
          alert(`⚠️ Données manquantes: ${missingData.join(', ')}\n\nRedirection...`);
          navigate(createPageUrl('OnboardingFirstName'));
        }
        return;
      }
      
      console.log('✅ [OfferGenerationStart] Toutes les données validées, génération...');
      
      // 🔥 Generate Full Stack Offer (P.S.S.O.)
      const response = await base44.functions.invoke('generateFullStackOffer', {
        sessionId
      });

      console.log('📨 [OfferGenerationStart] Réponse génération:', {
        hasError: !!response.data?.error,
        error: response.data?.error,
        success: response.data?.success,
        fromCache: response.data?.fromCache
      });

      // 🔥 NE NAVIGUER QUE SI GÉNÉRATION RÉUSSIE
      if (response.data?.error) {
        console.error('❌ [OfferGenerationStart] Génération échouée:', response.data.error);
        alert(`⚠️ Erreur lors de la génération de tes offres.\n\n${response.data.error}\n\nRéessaye dans quelques instants.`);
        return; // ❌ PAS DE NAVIGATION
      }

      if (!response.data?.success) {
        console.error('❌ [OfferGenerationStart] Génération non confirmée');
        alert('⚠️ La génération n\'a pas pu être confirmée. Réessaye.');
        return;
      }
      
      console.log('✅ [OfferGenerationStart] Génération réussie → Navigation');
      navigate(createPageUrl('OfferProductPrincipal'));
    } catch (error) {
      console.error('❌ [OFFER_START] Error:', error);
      setError({
        type: 'generation_error',
        message: error.message || 'Une erreur est survenue'
      });
    }
  };
  
  const handleRetry = () => {
    setError(null);
    setIsRetrying(false);
    generateOffer(0);
  };

  // Écran d'erreur avec retry
  if (error) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center z-50">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 rounded-full bg-red-100 mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {error.type === 'fetch_error' ? 'Trop de trafic' : 'Erreur'}
          </h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <Button
            onClick={handleRetry}
            className="bg-[#61f7a2] hover:bg-[#4de88f] text-white px-8 py-3 rounded-xl font-semibold"
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

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
            Noah construit ton offre…
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