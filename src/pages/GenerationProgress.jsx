import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, Circle, Sparkles } from 'lucide-react';

export default function GenerationProgress() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState({});
  const [globalProgress, setGlobalProgress] = useState(0);
  const [allReady, setAllReady] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const steps = [
    {
      id: 'completeMarketAnalysis',
      title: 'Analyse de marché SWOT',
      description: 'Analyse complète avec concurrence et stratégie',
      emoji: '📊'
    },
    {
      id: 'avatars',
      title: '3 Avatars clients',
      description: 'Profils détaillés de tes clients idéaux',
      emoji: '👥'
    },
    {
      id: 'detailedOffers',
      title: '4 Offres complètes',
      description: 'Tes offres ultra-détaillées prêtes à vendre',
      emoji: '📦'
    },
    {
      id: 'salesMessages',
      title: 'Messages de vente',
      description: '8 messages pour vendre en DM',
      emoji: '💬'
    },
    {
      id: 'marketingEmails',
      title: '5 Emails marketing',
      description: 'Séquence email complète',
      emoji: '📧'
    }
  ];

  useEffect(() => {
    initializeAndStart();
  }, []);

  // Polling avec intervalle adaptatif (3s → 8s après 30 polls)
  const pollCountRef = React.useRef(0);

  useEffect(() => {
    if (hasStarted && !allReady) {
      let timeoutId;
      const poll = () => {
        checkProgress();
        pollCountRef.current += 1;
        // Augmente progressivement : 3s → 5s → 8s
        const delay = pollCountRef.current < 10 ? 3000 : pollCountRef.current < 30 ? 5000 : 8000;
        timeoutId = setTimeout(poll, delay);
      };
      timeoutId = setTimeout(poll, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [hasStarted, allReady]);

  const initializeAndStart = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (!currentUser.has_purchased) {
        navigate(createPageUrl('CTAPAYWALL'));
        return;
      }

      const resolvedSessionId = currentUser.sessionId;
      if (!resolvedSessionId) {
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      setSessionId(resolvedSessionId);

      // Lancer la génération avec retry
      console.log('[GenerationProgress] Starting generation...');
      let startSuccess = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await base44.functions.invoke('startGeneration', {
            sessionId: resolvedSessionId
          });
          startSuccess = true;
          break;
        } catch (startError) {
          const isRetryable = startError.message?.includes('429') ||
                             startError.message?.includes('overloaded') ||
                             startError.message?.includes('409');
          if (isRetryable && attempt < 2) {
            console.warn(`[GenerationProgress] Start failed, retry ${attempt + 1} in ${(attempt + 1) * 3}s...`);
            await new Promise(r => setTimeout(r, (attempt + 1) * 3000));
            continue;
          }
          throw startError;
        }
      }

      if (startSuccess) {
        setHasStarted(true);
        // Premier check immédiat
        await checkProgress();
      }

    } catch (error) {
      console.error('Error initializing generation:', error);
    }
  };

  const checkProgress = async () => {
    try {
      if (!sessionId) return;

      const response = await base44.functions.invoke('checkGenerationProgress', {
        sessionId
      });

      const data = response.data;
      
      if (data.success) {
        setStatus(data.status || {});
        setGlobalProgress(data.globalProgress || 0);
        setAllReady(data.allReady || false);

        // Si tout est prêt, rediriger après 2 secondes
        if (data.allReady) {
          setTimeout(() => {
            navigate(createPageUrl('Dashboard'));
          }, 2000);
        }
      }

    } catch (error) {
      console.error('Error checking progress:', error);
    }
  };

  const getStepStatus = (stepId) => {
    const stepStatus = status[stepId];
    if (!stepStatus) return 'pending';
    return stepStatus.status || 'pending';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: allReady ? 0 : 360 }}
            transition={{ duration: 2, repeat: allReady ? 0 : Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            {allReady ? '🎉' : '✨'}
          </motion.div>
          
          <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {allReady ? 'Tout est prêt !' : 'Noah prépare ton espace...'}
          </h1>
          
          <p className="text-gray-600 text-lg">
            {allReady 
              ? 'Redirection vers ton Dashboard dans 2 secondes...' 
              : 'Ça prend environ 1-2 minutes'}
          </p>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 shadow-2xl"
        >
          
          {/* Barre de progression globale */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-700">Progression globale</span>
              <span className="text-2xl font-black text-transparent bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text">
                {globalProgress}%
              </span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 relative overflow-hidden"
                initial={{ width: '0%' }}
                animate={{ width: `${globalProgress}%` }}
                transition={{ duration: 0.5 }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
          </div>

          {/* Liste des étapes */}
          <div className="space-y-4">
            {steps.map((step, idx) => {
              const stepStatus = getStepStatus(step.id);
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-start gap-4 p-4 rounded-2xl transition-all ${
                    stepStatus === 'loading' 
                      ? 'bg-blue-50 border-2 border-blue-200' 
                      : stepStatus === 'done'
                      ? 'bg-green-50 border-2 border-green-200'
                      : 'bg-gray-50 border-2 border-gray-100'
                  }`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {stepStatus === 'done' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <CheckCircle className="w-7 h-7 text-green-600" />
                      </motion.div>
                    )}
                    {stepStatus === 'loading' && (
                      <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                    )}
                    {stepStatus === 'pending' && (
                      <Circle className="w-7 h-7 text-gray-300" />
                    )}
                    {stepStatus === 'error' && (
                      <Circle className="w-7 h-7 text-red-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{step.emoji}</span>
                      <h3 className={`font-bold text-base ${
                        stepStatus === 'done' ? 'text-green-900' :
                        stepStatus === 'loading' ? 'text-blue-900' :
                        'text-gray-700'
                      }`}>
                        {step.title}
                      </h3>
                    </div>
                    <p className={`text-sm ${
                      stepStatus === 'done' ? 'text-green-700' :
                      stepStatus === 'loading' ? 'text-blue-700' :
                      'text-gray-500'
                    }`}>
                      {stepStatus === 'loading' ? 'Génération en cours...' : step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bouton Dashboard (si tout prêt) */}
          {allReady && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(createPageUrl('Dashboard'))}
              className="w-full mt-8 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
            >
              <Sparkles className="w-6 h-6" />
              Découvrir mon Dashboard
              <Sparkles className="w-6 h-6" />
            </motion.button>
          )}

        </motion.div>

        {/* Info message */}
        {!allReady && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-6 text-sm text-gray-500"
          >
            Tu peux fermer cette page, la génération continue en arrière-plan.
          </motion.p>
        )}

      </div>
    </div>
  );
}
