import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, Brain } from 'lucide-react';

const generationSteps = [
  { 
    id: 'swot',
    label: 'Analyse de marché SWOT complète',
    key: 'completeMarketAnalysis'
  },
  { 
    id: 'avatars',
    label: '3 Avatars clients ultra-détaillés',
    key: 'avatars'
  },
  { 
    id: 'offers',
    label: '4 Offres complètes avec prix',
    key: 'detailedOffers'
  },
  { 
    id: 'messages',
    label: '8 Messages de vente prêts',
    key: 'salesMessages'
  },
  { 
    id: 'emails',
    label: '5 Emails marketing en séquence',
    key: 'marketingEmails'
  },
  {
    id: 'salespage',
    label: 'Page de vente prête à convertir',
    key: 'salesPage'
  },
  {
    id: 'plan',
    label: 'Plan d\'action personnalisé',
    key: 'planDeRoute'
  }
];

export default function NoahGeneration() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState(null);
  const [pollIntervalId, setPollIntervalId] = useState(null);

  useEffect(() => {
    loadData();
    
    return () => {
      if (pollIntervalId) {
        clearInterval(pollIntervalId);
      }
    };
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (!currentUser.has_purchased) {
        navigate(createPageUrl('CTAPAYWALL'));
        return;
      }

      // Utiliser activeSessionId si disponible, sinon fallback sur created_by
      const activeSessionId = localStorage.getItem('passionia_active_session_id') || currentUser.sessionId;
      let targetSession = null;

      if (activeSessionId) {
        const sessionsById = await base44.entities.Session.filter({ id: activeSessionId });
        if (sessionsById.length > 0) {
          targetSession = sessionsById[0];
        }
      }

      if (!targetSession) {
        const sessionsByEmail = await base44.entities.Session.filter({ created_by: currentUser.email });
        if (sessionsByEmail.length > 0) {
          targetSession = sessionsByEmail[0];
        }
      }

      if (targetSession) {
        setSession(targetSession);
        startGeneration(currentUser, targetSession);
      }
    } catch (error) {
      console.error('[NoahGeneration] Error loading data:', error);
      setError('Erreur de chargement');
    }
  };

  const startGeneration = async (currentUser, userSession) => {
    console.log('[NoahGeneration] 🚀 START - Launching generation for session:', userSession.id);
    
    try {
      setCurrentStep(0);
      
      // 🔥 LANCER startGeneration (orchestrateur)
      console.log('[NoahGeneration] Calling startGeneration...');
      
      base44.functions.invoke('startGeneration', {
        sessionId: userSession.id
      }).then(({ data: startData }) => {
        console.log('[NoahGeneration] startGeneration response:', startData);
        
        if (startData?.error) {
          setError(startData.error === 'missing_data' 
            ? `Données manquantes : ${startData.missing?.join(', ')}`
            : 'Erreur lors de la génération'
          );
          setIsGenerating(false);
        }
      }).catch(err => {
        console.error('[NoahGeneration] startGeneration error:', err);
      });
      
      // 🔥 POLLING temps réel
      const intervalId = setInterval(async () => {
        try {
          const { data: progressData } = await base44.functions.invoke('checkGenerationProgress', {
            sessionId: userSession.id
          });
          
          console.log('[NoahGeneration] Progress:', progressData);
          
          if (progressData?.success) {
            const { completedSteps: numCompleted, totalSteps, allReady, inProgress } = progressData;
            
            setCurrentStep(numCompleted || 0);
            
            const newCompleted = [];
            for (let i = 0; i < Math.min(numCompleted, generationSteps.length); i++) {
              newCompleted.push(generationSteps[i].id);
            }
            setCompletedSteps(newCompleted);
            
            if (allReady || !inProgress) {
              console.log('[NoahGeneration] ✅ Generation complete!');
              clearInterval(intervalId);

              setCompletedSteps(generationSteps.map(s => s.id));
              setCurrentStep(generationSteps.length);
              setIsGenerating(false);

              // Si c'était une régénération, finaliser
              const regeneratingId = localStorage.getItem('regenerating_session_id');
              if (regeneratingId) {
                try {
                  await base44.functions.invoke('completeRegeneration', { sessionId: regeneratingId });
                } catch (e) {
                  console.warn('[NoahGeneration] completeRegeneration error:', e);
                }
                localStorage.removeItem('regenerating_session_id');
              }

              setTimeout(() => {
                navigate(createPageUrl('Dashboard'));
              }, 2000);
            }
          }
        } catch (pollError) {
          console.error('[NoahGeneration] Polling error:', pollError);
        }
      }, 3000);
      
      setPollIntervalId(intervalId);
      
    } catch (error) {
      console.error('[NoahGeneration] FATAL ERROR:', error);
      setError('Une erreur est survenue lors de la génération');
      setIsGenerating(false);
    }
  };

  const progress = ((completedSteps.length / generationSteps.length) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] shadow-2xl mb-6 relative"
          >
            <Brain className="w-12 h-12 text-white" />
            
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
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Noah construit ton business personnalisé
          </h1>
          <p className="text-gray-700 text-lg mb-2">
            Tout ce dont tu as besoin pour vendre est en train d'être préparé pour toi.
          </p>
          <p className="text-gray-600 text-sm">
            Tu n'as rien à faire. Noah s'occupe de tout pendant que tu avances vers ton premier client.
          </p>
        </motion.div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">Progression</span>
            <span className="text-sm font-bold text-[#61f7a2]">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#61f7a2] to-[#4de88f]"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">
            {completedSteps.length < generationSteps.length 
              ? `Étape ${completedSteps.length + 1} sur ${generationSteps.length} en cours`
              : "Tous les documents sont générés !"}
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {generationSteps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = index === currentStep && !isCompleted;
            const isPending = index > currentStep;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isCurrent 
                    ? 'bg-white border-[#61f7a2] shadow-md' 
                    : isCompleted
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white border-gray-200'
                }`}
              >
                <motion.div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isCompleted
                      ? 'bg-[#61f7a2]'
                      : isCurrent
                        ? 'bg-[#61f7a2]/20 border-2 border-[#61f7a2]'
                        : 'bg-gray-100'
                  }`}
                  animate={isCompleted ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <CheckCircle className="w-6 h-6 text-white" />
                    </motion.div>
                  ) : isCurrent ? (
                    <Loader2 className="w-6 h-6 text-[#61f7a2] animate-spin" />
                  ) : (
                    <span className="text-gray-400 font-bold">{index + 1}</span>
                  )}
                </motion.div>

                <div className="flex-1">
                  <p className={`font-semibold ${
                    isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                </div>

                {isCompleted && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-[#61f7a2] font-medium"
                  >
                    ✓ Prêt
                  </motion.span>
                )}
                {isCurrent && (
                  <span className="text-xs text-gray-600">En préparation...</span>
                )}
                {isPending && (
                  <span className="text-xs text-gray-400">À venir</span>
                )}
              </motion.div>
            );
          })}
        </div>

        {!isGenerating && !error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border border-green-200 p-6 text-center"
          >
            <CheckCircle className="w-12 h-12 text-[#61f7a2] mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Tout est prêt ! 🎉
            </h3>
            <p className="text-gray-700">
              Redirection vers ton dashboard...
            </p>
          </motion.div>
        ) : error ? null : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border border-blue-200 p-5 text-center"
          >
            <p className="text-gray-700 text-sm leading-relaxed">
              Une fois terminé, tu accéderas à ton dashboard.<br />
              <strong className="text-gray-900">Tout sera déjà prêt. Il ne te restera qu'à vendre.</strong>
            </p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 text-center"
          >
            <p className="text-red-800 font-medium mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Réessayer
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}