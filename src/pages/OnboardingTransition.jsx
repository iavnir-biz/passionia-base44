import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle2, Package, DollarSign, Mail, FileText, Rocket, Brain, Zap } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import confetti from 'canvas-confetti';

export default function OnboardingTransition() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleItems, setVisibleItems] = useState(0);
  const [progress, setProgress] = useState(78);
  const [statusText, setStatusText] = useState('Analyse de ton positionnement…');

  const items = [
    { icon: CheckCircle2, title: 'Validation complète de ton idée' },
    { icon: Package, title: 'Tes 4 offres prêtes à vendre' },
    { icon: DollarSign, title: 'Les prix parfaits' },
    { icon: Mail, title: 'Les emails marketing essentiels' },
    { icon: FileText, title: 'Une page de vente à haute conversion' },
    { icon: Rocket, title: 'Un plan d\'action sur 7 jours' },
    { icon: Brain, title: 'Le protocole complet pour créer ton activité de formation en ligne' }
  ];

  const statusTexts = [
    'Analyse de ton positionnement…',
    'Structuration de tes offres…',
    'Optimisation des prix…',
    'Préparation du plan d\'action…'
  ];

  useEffect(() => {
    loadUser();
    
    // Déclencher les confettis au chargement de la page
    const hasShownConfetti = sessionStorage.getItem('talents_confetti_shown');
    if (!hasShownConfetti) {
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 }
        });
      }, 500);
      sessionStorage.setItem('talents_confetti_shown', 'true');
    }
  }, []);

  useEffect(() => {
    // Animation des items qui apparaissent un par un
    if (visibleItems < items.length) {
      const timer = setTimeout(() => {
        setVisibleItems(prev => prev + 1);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [visibleItems, items.length]);

  useEffect(() => {
    // Animation de la barre de progression
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 92) return 92;
        return prev + 2;
      });
    }, 600);
    return () => clearInterval(progressTimer);
  }, []);

  useEffect(() => {
    // Changement du texte de statut
    let index = 0;
    const statusTimer = setInterval(() => {
      index = (index + 1) % statusTexts.length;
      setStatusText(statusTexts[index]);
    }, 1500);
    return () => clearInterval(statusTimer);
  }, []);

  useEffect(() => {
    // Redirection automatique après 12 secondes (plus long)
    const redirectTimer = setTimeout(() => {
      navigate(createPageUrl('OnboardingQ12AgeRange'));
    }, 12000);
    return () => clearTimeout(redirectTimer);
  }, [navigate]);

  const loadUser = async () => {
    try {
      // Récupérer le prénom du localStorage
      const firstName = localStorage.getItem('onboarding_firstName') || '';
      setUser({ firstName: firstName, full_name: firstName });
      
      // Créer la session avec les données de l'onboarding
      await createSession();
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      // Récupérer TOUTES les données de localStorage
      const onboardingDataStr = localStorage.getItem('onboarding_data') || '{}';
      const onboardingData = JSON.parse(onboardingDataStr);
      const firstName = localStorage.getItem('onboarding_firstName') || '';
      
      // CRITIQUE : Normaliser les answers en strings
      const normalizedHistory = (onboardingData.history || []).map(item => ({
        question: item.question || '',
        type: item.type || 'text',
        answer: typeof item.answer === 'string' ? item.answer : JSON.stringify(item.answer),
        at: item.at || new Date().toISOString()
      }));
      
      console.log('📦 OnboardingTransition - Transfert données:', {
        firstName,
        historyLength: normalizedHistory.length,
        hasSummary: !!onboardingData.summary,
        hasSessionId: !!currentUser.sessionId,
        firstAnswer: normalizedHistory[0]?.answer?.substring(0, 50)
      });
      
      // La session doit déjà exister (créée dans OnboardingFirstName)
      if (!currentUser.sessionId) {
        console.error('❌ PAS DE SESSION ID - création de secours');
        const session = await base44.entities.Session.create({
          onboarding_history: normalizedHistory,
          onboarding_summary: onboardingData.summary || {},
          onboarding_full: {},
          skill: onboardingData.summary?.who_to_teach || '',
          is_onboarding_done: false
        });
        await base44.auth.updateMe({ sessionId: session.id });
        console.log('✅ Session de secours créée:', session.id);
        return;
      }
      
      // METTRE À JOUR la session existante avec TOUTES les données normalisées
      const summary = onboardingData.summary || {};
      
      // CRITIQUE : Extraire le coreSkill de la première réponse (Q1)
      const coreSkillFromHistory = normalizedHistory.length > 0 ? normalizedHistory[0].answer : '';
      const coreSkill = summary.who_to_teach || coreSkillFromHistory || '';
      
      await base44.entities.Session.update(currentUser.sessionId, {
        onboarding_history: normalizedHistory,
        onboarding_summary: {
          ...summary,
          who_to_teach: coreSkill
        },
        skill: coreSkill,
        is_onboarding_done: false
      });
      
      console.log('✅ Session mise à jour:', {
        sessionId: currentUser.sessionId,
        historyCount: normalizedHistory.length,
        skill: summary.who_to_teach
      });
      
      // Sauvegarder TOUTES les données clés sur le User
      await base44.auth.updateMe({ 
        coreSkill: coreSkill,
        targetAudience: summary.learner_profile || '',
        mainProblem: summary.main_learning_problem || '',
        firstResult: summary.quick_win || '',
        finalTransformation: summary.big_transformation || '',
        uniqueMethod: summary.method_angle || '',
        typicalMistake: summary.common_mistake || '',
        extraDetail: summary.proof_or_story || ''
      });
      
      console.log('✅ User mis à jour avec données du summary');
      
    } catch (error) {
      console.error('❌ Erreur mise à jour session:', error);
      console.error('Détails:', error.response?.data || error.message);
      throw error;
    }
  };

  const handleNext = () => {
    navigate(createPageUrl('OnboardingQ12AgeRange'));
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          {/* Cerveau IA animé au centre */}
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              {/* Particules animées autour */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-3"
              >
                <Zap className="absolute top-0 left-1/2 w-3 h-3 text-[#61f7a2] opacity-60" />
                <Sparkles className="absolute bottom-0 right-0 w-3 h-3 text-[#4de88f] opacity-60" />
              </motion.div>
            </motion.div>
          </div>

          {/* Titre principal */}
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-gray-900 mb-3 text-center leading-tight"
          >
            Merci pour toutes ces réponses, {user?.firstName} !<br />
            Je peux déjà te dire que ta passion vaut de l'or 💎
          </motion.h1>

          {/* Sous-titre */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 text-center mb-6 leading-relaxed text-sm"
          >
            J'analyse tes réponses pour construire une stratégie claire, simple et rentable, totalement personnalisée pour toi.
            <br />
            <span className="font-medium text-gray-700">Encore quelques questions, et je te montre tout.</span>
          </motion.p>

          {/* Barre de progression intelligente */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700">🔍 Analyse de ton potentiel</span>
              <span className="text-xs font-bold text-[#61f7a2]">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#61f7a2] to-[#4de88f] rounded-full"
                initial={{ width: '78%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <motion.p
              key={statusText}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-gray-500 mt-1"
            >
              {statusText}
            </motion.p>
          </motion.div>

          {/* Bloc central - Ce qui se construit */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">
              🎁 Ce que je construis pour toi
            </h2>
            
            <div className="space-y-3">
              <AnimatePresence>
                {items.slice(0, visibleItems).map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-start gap-3 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-[#61f7a2] rounded-lg flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-base">{item.title}</h3>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>


        </div>
      </motion.div>
    </div>
  );
}