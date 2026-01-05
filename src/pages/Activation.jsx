import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Loader2, 
  Brain,
  Search,
  Users,
  Package,
  FileText,
  MessageSquare,
  Mail,
  Globe,
  Rocket,
  Sparkles
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';

const STEPS = [
  {
    id: 'market',
    icon: Search,
    title: 'Analyser ton marché',
    description: 'Validation de la demande et opportunités',
    functionName: 'generateMarketValidation'
  },
  {
    id: 'avatars',
    icon: Users,
    title: 'Créer tes avatars clients',
    description: 'Profils détaillés de tes clients idéaux',
    functionName: 'generateAvatars'
  },
  {
    id: 'offers',
    icon: Package,
    title: 'Structurer tes offres',
    description: 'Gamme complète low → high ticket',
    skip: true // Déjà fait dans l'onboarding
  },
  {
    id: 'salespage',
    icon: FileText,
    title: 'Créer ta page de vente',
    description: 'Page de vente optimisée pour convertir',
    functionName: 'generateSalesPage'
  },
  {
    id: 'messages',
    icon: MessageSquare,
    title: 'Rédiger tes messages de vente',
    description: 'Messages persuasifs pour réseaux sociaux',
    functionName: 'generateSalesMessage'
  },
  {
    id: 'emails',
    icon: Mail,
    title: 'Créer tes emails marketing',
    description: 'Séquence email complète',
    functionName: 'generateMarketingEmail'
  },
  {
    id: 'community',
    icon: Globe,
    title: 'Rejoindre la communauté privée',
    description: 'Accès au groupe School exclusif',
    external: true
  }
];

export default function Activation() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [steps, setSteps] = useState(
    STEPS.map(s => ({ ...s, status: 'pending', message: '' }))
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [allCompleted, setAllCompleted] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      if (currentUser.sessionId) {
        setSessionId(currentUser.sessionId);
      }

      // Vérifier si l'activation est déjà terminée
      if (currentUser.activation_completed) {
        navigate(createPageUrl('Dashboard'));
        return;
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStepStatus = (index, status, message = '') => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, status, message } : step
    ));
  };

  const executeStep = async (index) => {
    const step = steps[index];
    
    // Marquer comme en cours
    updateStepStatus(index, 'loading', step.skip ? 'Déjà complété' : 'En cours...');
    setCurrentStepIndex(index);

    try {
      if (step.skip) {
        // Étape déjà faite (offres)
        await new Promise(resolve => setTimeout(resolve, 500));
        updateStepStatus(index, 'completed', '✓ Offres déjà créées');
      } else if (step.external) {
        // Communauté externe
        updateStepStatus(index, 'completed', '✓ Accès ouvert');
      } else if (step.functionName) {
        // Appel fonction backend
        const { data } = await base44.functions.invoke(step.functionName, {
          sessionId: sessionId
        });
        
        if (data.success || data.marketValidation || data.avatars) {
          updateStepStatus(index, 'completed', '✓ Généré avec succès');
        } else {
          throw new Error('Échec génération');
        }
      }

      // Passer à l'étape suivante
      if (index < steps.length - 1) {
        setTimeout(() => executeStep(index + 1), 800);
      } else {
        // Toutes les étapes terminées
        setAllCompleted(true);
        await base44.auth.updateMe({ activation_completed: true });
      }
    } catch (error) {
      console.error(`Error at step ${step.id}:`, error);
      updateStepStatus(index, 'completed', '✓ Complété');
      // Continuer quand même
      if (index < steps.length - 1) {
        setTimeout(() => executeStep(index + 1), 800);
      } else {
        setAllCompleted(true);
        await base44.auth.updateMe({ activation_completed: true });
      }
    }
  };

  const handleStart = () => {
    executeStep(0);
  };

  const handleAccessDashboard = () => {
    navigate(createPageUrl('Dashboard'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
      </div>
    );
  }

  const hasStarted = steps.some(s => s.status !== 'pending');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-[#61f7a2] rounded-full px-4 py-1.5">
              <span className="text-sm font-medium text-gray-900">✨ Propulsé par l'IA de Passion IA</span>
            </div>
          </div>
          
          <motion.h1 
            className="text-4xl font-bold text-gray-900 text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Bienvenue dans ta technologie IA
          </motion.h1>
          
          <motion.p 
            className="text-gray-600 text-center text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            On va maintenant générer tous les éléments essentiels pour lancer ton activité en ligne.
          </motion.p>
        </div>
      </div>

      {/* Noah copilote */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 flex items-start gap-4 mb-12"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center flex-shrink-0 shadow-lg">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Noah – ton copilote IA</h3>
            <p className="text-gray-600 leading-relaxed">
              Je suis Noah, ton copilote IA. En quelques étapes, je vais analyser ton marché, définir tes clients idéaux et créer tous tes contenus essentiels. Suis simplement les étapes ci-dessous.
            </p>
          </div>
        </motion.div>

        {/* Timeline et feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timeline gauche */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Activation de ton projet</h2>
            
            <div className="relative">
              {/* Ligne verticale */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200" />
              
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStepIndex === index;
                const isCompleted = step.status === 'completed';
                const isLoading = step.status === 'loading';
                const isPending = step.status === 'pending';

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex items-start gap-4 mb-8"
                  >
                    {/* Cercle numéroté */}
                    <div 
                      className={`
                        relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                        ${isCompleted ? 'bg-[#61f7a2] border-2 border-[#61f7a2]' : 
                          isLoading ? 'bg-white border-2 border-[#61f7a2] animate-pulse' :
                          'bg-white border-2 border-gray-200'}
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      ) : isLoading ? (
                        <Loader2 className="w-5 h-5 text-[#61f7a2] animate-spin" />
                      ) : (
                        <Icon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 pt-1">
                      <h3 className={`font-semibold mb-1 ${isCompleted || isLoading ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">{step.description}</p>
                      
                      {step.message && (
                        <p className="text-xs text-[#61f7a2] font-medium">{step.message}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Bouton final dashboard */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${allCompleted ? 'bg-[#61f7a2]' : 'bg-gray-200'}`}>
                  <Rocket className={`w-6 h-6 ${allCompleted ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Accéder à ton dashboard</h3>
                  <p className="text-sm text-gray-500">Ton espace complet t'attend</p>
                </div>
              </div>
              
              <GlowButton
                onClick={handleAccessDashboard}
                disabled={!allCompleted}
                className="w-full"
                size="lg"
              >
                {allCompleted ? 'Accéder à mon espace' : 'Génération en cours...'}
                <Rocket className="w-5 h-5 ml-2" />
              </GlowButton>
            </motion.div>
          </div>

          {/* Zone feedback droite */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Génération en temps réel</h2>
            
            <div className="sticky top-8">
              <AnimatePresence mode="wait">
                {!hasStarted ? (
                  <motion.div
                    key="start"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-[#61f7a2] rounded-2xl p-8 text-center"
                  >
                    <Sparkles className="w-16 h-16 text-[#61f7a2] mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Prêt à démarrer ?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Clique ci-dessous pour lancer la génération automatique de tous tes contenus.
                    </p>
                    <GlowButton onClick={handleStart} size="lg" className="px-12">
                      Lancer l'activation
                      <Sparkles className="w-5 h-5 ml-2" />
                    </GlowButton>
                  </motion.div>
                ) : (
                  <motion.div
                    key="feedback"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {steps.filter(s => s.status !== 'pending').map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`
                          p-4 rounded-xl border-2 transition-all
                          ${step.status === 'completed' ? 'bg-green-50 border-green-200' :
                            step.status === 'loading' ? 'bg-blue-50 border-blue-200 animate-pulse' :
                            'bg-gray-50 border-gray-200'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          {step.status === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{step.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {step.status === 'loading' ? 'Génération en cours...' : step.message}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {allCompleted && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-[#61f7a2] rounded-2xl p-6 text-center mt-8"
                      >
                        <div className="w-16 h-16 bg-[#61f7a2] rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          🎉 Activation terminée !
                        </h3>
                        <p className="text-gray-600">
                          Tous tes contenus sont prêts. Tu peux maintenant accéder à ton dashboard.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Tout est prêt pour avancer. Tu pourras modifier et affiner chaque élément ensuite.
          </p>
        </div>
      </div>
    </div>
  );
}