import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, Brain } from 'lucide-react';

const generationSteps = [
  { 
    id: 'market',
    label: 'Analyse de marché prête à être exploitée',
    duration: 8000,
    function: 'generateMarketValidation'
  },
  { 
    id: 'avatars',
    label: 'Profils clients exploitables pour vendre',
    duration: 10000,
    function: 'generateAvatars'
  },
  { 
    id: 'offers',
    label: 'Offres structurées avec prix, promesse et positionnement',
    duration: 15000,
    function: 'generateMyOffers'
  },
  { 
    id: 'messages',
    label: 'Messages prêts à envoyer pour obtenir tes premières ventes',
    duration: 12000,
    function: 'generateSalesMessage'
  },
  { 
    id: 'emails',
    label: 'Séquence email automatique opérationnelle',
    duration: 18000,
    function: 'generateMarketingEmail'
  },
  { 
    id: 'salespage',
    label: 'Page de vente prête à convertir tes visiteurs',
    duration: 20000,
    function: 'generateSalesPage'
  },
  { 
    id: 'plan',
    label: 'Plan d\'action personnalisé pour ta première vente',
    duration: 8000,
    function: 'generatePlanDeRoute'
  }
];

export default function NovaGeneration() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (!currentUser.has_purchased) {
        navigate(createPageUrl('CTAPAYWALL'));
        return;
      }

      const sessions = await base44.entities.Session.filter({ created_by: currentUser.email });
      if (sessions.length > 0) {
        setSession(sessions[0]);
        startGeneration(currentUser, sessions[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Erreur de chargement');
    }
  };

  const startGeneration = async (currentUser, userSession) => {
    console.log('[NoahGeneration] 🚀 START - Orchestrated generation');
    
    try {
      // 🔥 APPEL UNIQUE à l'orchestrateur avec gestion visuelle progressive
      setCurrentStep(0);
      
      // Démarrer l'orchestrateur en arrière-plan
      const generationPromise = base44.functions.invoke('generateAllAssets', {});
      
      // Simuler la progression visuelle pendant l'orchestration
      let visualProgress = 0;
      const visualInterval = setInterval(() => {
        if (visualProgress < generationSteps.length) {
          setCurrentStep(visualProgress);
          setCompletedSteps(prev => [...prev, generationSteps[visualProgress].id]);
          visualProgress++;
        }
      }, 3000);

      // Attendre la fin de l'orchestration
      const { data } = await generationPromise;
      clearInterval(visualInterval);

      console.log('[NoahGeneration] Generation complete', data);
      
      if (data.error) {
        setError(data.error === 'missing_data' 
          ? `Données manquantes : ${data.missing?.join(', ')}`
          : 'Erreur lors de la génération'
        );
        setIsGenerating(false);
        return;
      }

      // Compléter visuellement les étapes restantes
      for (let i = visualProgress; i < generationSteps.length; i++) {
        setCompletedSteps(prev => [...prev, generationSteps[i].id]);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setIsGenerating(false);
      
      // Redirection vers Dashboard
      setTimeout(() => {
        navigate(createPageUrl('Dashboard'));
      }, 1500);
      
    } catch (error) {
      console.error('[NoahGeneration] FATAL ERROR:', error);
      setError('Une erreur est survenue lors de la génération');
      setIsGenerating(false);
    }
  };

  const generateStep = async (step, currentUser, userSession) => {
    // Vérifier si déjà généré
    const checkKeys = {
      market: 'market_validation',
      avatars: 'generated_avatars',
      offers: 'my_generated_offers',
      messages: 'generated_sales_messages',
      emails: 'generated_marketing_emails',
      salespage: 'generated_sales_pages',
      plan: 'plan_de_route'
    };

    const sessionKey = checkKeys[step.id];
    if (userSession[sessionKey]) {
      console.log(`${step.id} already generated, skipping`);
      return;
    }

    // Appel backend selon le type
    switch (step.id) {
      case 'market':
        await base44.functions.invoke('generateMarketValidation', { sessionId: userSession.id });
        break;
      case 'avatars':
        await base44.functions.invoke('generateAvatars', { sessionId: userSession.id });
        break;
      case 'offers':
        // Générer les 4 offres
        for (const offerType of ['low', 'bump', 'mid', 'high']) {
          await base44.functions.invoke('generateMyOffers', { 
            session: userSession,
            offerType 
          });
        }
        break;
      case 'messages':
        await base44.functions.invoke('generateSalesMessage', { sessionId: userSession.id });
        break;
      case 'emails':
        // Générer les 5 emails
        for (const emailType of ['contraste', 'validation', 'calcul', 'impact', 'urgence']) {
          await base44.functions.invoke('generateMarketingEmail', {
            emailType,
            session: userSession
          });
        }
        break;
      case 'salespage':
        await base44.functions.invoke('generateSalesPage', {
          session: userSession,
          offerType: 'low',
          color: '#61f7a2',
          tone: 'inspirant'
        });
        break;
      case 'plan':
        await base44.functions.invoke('generatePlanDeRoute', { sessionId: userSession.id });
        break;
    }
  };

  const progress = ((completedSteps.length / generationSteps.length) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Noha Avatar */}
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
            
            {/* Ondes d'énergie */}
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

        {/* Progress Bar */}
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
              : "Chaque élément est généré une seule fois, pour toi"}
          </p>
        </div>

        {/* Steps List */}
        <div className="space-y-3 mb-8">
          {generationSteps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = index === currentStep;
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

        {/* Projection Finale */}
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
        ) : (
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

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 text-center"
          >
            <p className="text-red-800 font-medium">{error}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}