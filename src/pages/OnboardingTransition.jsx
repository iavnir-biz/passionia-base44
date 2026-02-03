import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle2, Package, DollarSign, Mail, FileText, Rocket, Brain, Zap, Loader2 } from 'lucide-react';
import { NoahBrainIcon } from '@/components/NoahBrainIcon';
import GlowButton from '@/components/ui/GlowButton';
import confetti from 'canvas-confetti';

export default function OnboardingTransition() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleItems, setVisibleItems] = useState(0);
  const [progress, setProgress] = useState(78);
  const [statusText, setStatusText] = useState('Analyse de ton positionnement…');
  const [transitionMessage, setTransitionMessage] = useState('Ta passion vaut de l\'or');

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

    // Cleanup du flag confetti après navigation
    return () => {
      sessionStorage.removeItem('talents_confetti_shown');
    };
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
    // Redirection automatique UNIQUEMENT si données OK
    if (!isLoading && user) {
      const redirectTimer = setTimeout(() => {
        handleNext();
      }, 10000);
      return () => clearTimeout(redirectTimer);
    }
  }, [isLoading, user]);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      const firstName = localStorage.getItem('onboarding_firstName') || currentUser.firstName || '';

      // Vérifier que la Session existe et contient les données
      if (!currentUser.sessionId) {
        console.error('❌ [OnboardingTransition] Pas de sessionId');
        // Rediriger vers l'onboarding pour reprendre
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      const sessions = await base44.entities.Session.filter({ id: currentUser.sessionId });
      if (!sessions || sessions.length === 0) {
        console.error('❌ [OnboardingTransition] Session introuvable');
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      const session = sessions[0];
      const summary = session.onboarding_summary || {};

      console.log('✅ [OnboardingTransition] Session chargée:', {
        sessionId: session.id,
        historyLength: session.onboarding_history?.length || 0,
        skill: session.skill,
        isDone: session.is_onboarding_done
      });

      // Vérifier que l'onboarding est complet
      if ((session.onboarding_history?.length || 0) < 11) {
        console.error('❌ [OnboardingTransition] Onboarding incomplet');
        navigate(createPageUrl('OnboardingDynamic'));
        return;
      }

      setUser({ firstName: firstName, full_name: firstName });

      // Enrichir le User avec les données du summary (une seule fois)
      const fullData = session.onboarding_full || {};

      await base44.auth.updateMe({
        firstName: firstName,
        coreSkill: session.skill || fullData.coreSkill || '',
        targetAudience: fullData.targetAudience || '',
        mainProblem: fullData.mainProblem || '',
        firstResult: fullData.firstQuickResult || '',
        finalTransformation: fullData.finalTransformation || '',
        uniqueMethod: fullData.uniqueMethod || '',
        typicalMistake: fullData.typicalMistake || '',
        extraDetail: fullData.extraDetail || ''
      });

      console.log('✅ [OnboardingTransition] User enrichi avec summary');

      // Générer la phrase de transition personnalisée
      try {
        const { data } = await base44.functions.invoke('generateTransitionMessage', {
          sessionId: session.id,
          firstName: firstName
        });
        if (data?.message) {
          setTransitionMessage(data.message);
        }
      } catch (err) {
        console.warn('⚠️ [OnboardingTransition] Fallback message used:', err);
        // Garder le message par défaut
      }

      setIsLoading(false);
    } catch (error) {
      console.error('❌ [OnboardingTransition] Error:', error);
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    navigate(createPageUrl('OnboardingQ12AgeRange'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <NoahBrainIcon size={80} isThinking={true} />
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Noah analyse tes réponses...</h2>
            <p className="text-gray-500 text-sm">Préparation de ton plan personnalisé</p>
          </div>
          <div className="flex items-center gap-2 text-[#61f7a2]">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Chargement en cours</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          {/* Cerveau IA animé au centre */}
          <div className="flex justify-center mb-6">
            <NoahBrainIcon size={72} isThinking={true} isFloating={true} />
          </div>

          {/* Titre principal */}
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-medium text-gray-700 mb-3 text-left leading-snug"
          >
            Merci pour toutes ces réponses, {user?.firstName} !<br />
            {transitionMessage}
          </motion.h1>



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
                    className="flex items-center gap-3 p-2.5 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-[#61f7a2] rounded-lg flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-white" />
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