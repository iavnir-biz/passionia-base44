import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { NoahBrainIcon } from '@/components/NoahBrainIcon';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';

export default function OnboardingFirstName() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(window.location.href);
          return;
        }
        setIsCheckingAuth(false);
        // Petit delai pour laisser l'avatar apparaitre puis reveal le contenu
        setTimeout(() => setShowContent(true), 600);
      } catch (error) {
        console.error('Auth check error:', error);
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    checkAuth();
  }, []);

  const handleNext = async () => {
    if (!firstName.trim()) return;

    setIsLoading(true);
    try {
      localStorage.setItem('onboarding_firstName', firstName.trim());

      const prefilledSkill = localStorage.getItem('prefilledSkill');
      console.log('[OnboardingFirstName] Passion recuperee:', prefilledSkill);

      const onboardingData = {
        history: [],
        summary: {},
        current_question: null,
        is_onboarding_done: false
      };
      localStorage.setItem('onboarding_data', JSON.stringify(onboardingData));

      const currentUser = await base44.auth.me();

      const regeneratingSessionId = localStorage.getItem('regenerating_session_id');
      const activeSessionId = localStorage.getItem('passionia_active_session_id');

      let sessionId;

      const sessionData = {
        onboarding_history: [],
        onboarding_summary: prefilledSkill ? { who_to_teach: prefilledSkill } : {},
        onboarding_full: prefilledSkill ? { coreSkill: prefilledSkill } : {},
        skill: prefilledSkill || '',
        is_onboarding_done: false
      };

      if (regeneratingSessionId) {
        console.log('[OnboardingFirstName] Regeneration de la session:', regeneratingSessionId);
        sessionId = regeneratingSessionId;
        await base44.entities.Session.update(sessionId, sessionData);
        console.log('Session regeneree mise a jour');
      } else if (activeSessionId) {
        const existingSessions = await base44.entities.Session.filter({ id: activeSessionId });

        if (existingSessions.length > 0) {
          const existingSession = existingSessions[0];

          if (!existingSession.is_onboarding_done && (!existingSession.onboarding_history || existingSession.onboarding_history.length === 0)) {
            sessionId = activeSessionId;
            await base44.entities.Session.update(sessionId, sessionData);
          } else {
            sessionId = activeSessionId;
            await base44.entities.Session.update(sessionId, sessionData);
          }
        } else {
          sessionId = await createOrReuseSession(currentUser, sessionData, prefilledSkill);
        }
      } else {
        sessionId = await createOrReuseSession(currentUser, sessionData, prefilledSkill);
      }

      await base44.auth.updateMe({
        firstName: firstName.trim(),
        sessionId: sessionId,
        coreSkill: prefilledSkill || ''
      });
      localStorage.setItem('passionia_active_session_id', sessionId);

      navigate(createPageUrl('OnboardingDynamic'));
    } catch (error) {
      console.error('Error saving firstName:', error);
      alert('Une erreur est survenue. Merci de reessayer.');
      setIsLoading(false);
    }
  };

  const createOrReuseSession = async (currentUser, sessionData, prefilledSkill) => {
    const existingSessions = await base44.entities.Session.filter({
      created_by: currentUser.email
    });

    if (existingSessions.length > 0) {
      const sessionId = existingSessions[0].id;
      await base44.entities.Session.update(sessionId, {
        ...sessionData,
        session_number: existingSessions[0].session_number || 1,
        session_name: existingSessions[0].session_name || 'Session 1'
      });
      return sessionId;
    } else {
      const session = await base44.entities.Session.create({
        ...sessionData,
        session_number: 1,
        session_name: 'Session 1',
        is_regenerating: false,
        regeneration_count: 0
      });
      return session.id;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && firstName.trim()) {
      handleNext();
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center">
        <NoahBrainIcon size={64} isThinking={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium">Etape 1</span>
            <span className="text-xs text-gray-400">~ 5 min</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-[#61f7a2] h-1.5 rounded-full" style={{ width: '2%' }} />
          </div>
        </motion.div>

        {/* Noah Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <NoahBrainIcon size={72} isThinking={true} />
        </motion.div>

        {/* Conversation card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm"
        >
          {/* Noah's message - visible fast */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={showContent ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
          >
            <p className="text-xl font-bold text-gray-900 leading-relaxed mb-2">
              On va faire connaissance.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Je suis <span className="text-[#61f7a2] font-semibold">Noah</span>, ton associe IA. Ensemble, on va construire ton activite — de l'idee au premier euro. Mais d'abord...
            </p>
          </motion.div>

          {/* Question + input - appears right after */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={showContent ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <p className="text-gray-900 font-semibold mb-4">
              Comment je t'appelle ?
            </p>

            <Input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ton prenom"
              className="w-full bg-white border-gray-300 text-gray-900 text-lg py-6 px-4 rounded-2xl focus:border-[#61f7a2] focus:ring-[#61f7a2] placeholder:text-gray-400"
              autoFocus
            />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={showContent ? { opacity: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-6"
          >
            <GlowButton
              onClick={handleNext}
              disabled={!firstName.trim()}
              loading={isLoading}
              className="w-full"
              size="lg"
            >
              {firstName.trim() ? `C'est parti, ${firstName.trim()} !` : 'Entre ton prenom pour commencer'}
              {firstName.trim() && <ArrowRight className="w-5 h-5 ml-2" />}
            </GlowButton>
          </motion.div>
        </motion.div>

        {/* Reassurance */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={showContent ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          className="text-center text-xs text-gray-400 mt-6"
        >
          Tes donnees restent privees. Noah travaille uniquement pour toi.
        </motion.p>
      </div>
    </div>
  );
}
