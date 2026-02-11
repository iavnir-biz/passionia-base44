import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Brain, Zap } from 'lucide-react';
import { NoahBrainIcon } from '@/components/NoahBrainIcon';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';

// Hook for typing effect
const useTypingEffect = (text, speed = 30, delay = 0) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;
    
    const timeout = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayedText, isComplete };
};

const NoahAvatar = () => (
    <div className="relative flex items-center justify-center mb-8">
        <NoahBrainIcon size={96} isThinking={true} />
    </div>
);

export default function OnboardingFirstName() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 🔐 Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          // Rediriger vers login avec retour sur cette page
          base44.auth.redirectToLogin(window.location.href);
          return;
        }
        setIsCheckingAuth(false);
      } catch (error) {
        console.error('Auth check error:', error);
        base44.auth.redirectToLogin(window.location.href);
      }
    };

    // Timeout de sécurité : si l'auth check prend trop longtemps, rediriger vers login
    const timeout = setTimeout(() => {
      if (isCheckingAuth) {
        console.warn('Auth check timeout, redirecting to login');
        base44.auth.redirectToLogin(window.location.href);
      }
    }, 10000);

    checkAuth();

    return () => clearTimeout(timeout);
  }, []);

  // Typing effects for each text block
  const text1 = "Commençons par faire connaissance 🙂";
  const text2 = "Je suis Noah, l'IA de Passion IA.\nJe vais t'aider à transformer ce que tu sais déjà — en une activité en ligne claire et monétisable.";
  const text3 = "En quelques minutes, on va poser les bases de ton projet et construire un plan d'action adapté à toi.";
  const text4 = "On commence simplement, quel est ton prénom ? 👇";

  const typing1 = useTypingEffect(text1, 30, 500);
  const typing2 = useTypingEffect(text2, 20, 2000);
  const typing3 = useTypingEffect(text3, 20, typing2.isComplete ? 500 : 999999);
  const typing4 = useTypingEffect(text4, 30, typing3.isComplete ? 500 : 999999);

  const handleNext = async () => {
    if (!firstName.trim()) return;

    setIsLoading(true);
    try {
      // Sauvegarder le prénom dans localStorage
      localStorage.setItem('onboarding_firstName', firstName.trim());

      // Récupérer la passion pré-remplie depuis Welcome
      const prefilledSkill = localStorage.getItem('prefilledSkill');
      console.log('[OnboardingFirstName] Passion récupérée:', prefilledSkill);

      // Initialiser les données d'onboarding
      const onboardingData = {
        history: [],
        summary: {},
        current_question: null,
        is_onboarding_done: false
      };
      localStorage.setItem('onboarding_data', JSON.stringify(onboardingData));

      const currentUser = await base44.auth.me();

      // SESSION SYSTEM : Vérifier si c'est une régénération ou un nouveau parcours
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
        // CAS 1 : Régénération d'une session existante
        console.log('[OnboardingFirstName] Régénération de la session:', regeneratingSessionId);
        sessionId = regeneratingSessionId;

        // Mettre à jour la session existante avec les nouvelles données
        await base44.entities.Session.update(sessionId, sessionData);
        console.log('✅ Session régénérée mise à jour');

        // Ne pas supprimer le flag ici, on le supprime à la fin de l'onboarding
      } else if (activeSessionId) {
        // CAS 2 : Session active existante (créée depuis le dashboard ou précédemment)
        // Vérifier si cette session existe bien
        const existingSessions = await base44.entities.Session.filter({ id: activeSessionId });

        if (existingSessions.length > 0) {
          const existingSession = existingSessions[0];

          // Si la session est vide (nouvelle session créée depuis dashboard), l'utiliser
          if (!existingSession.is_onboarding_done && (!existingSession.onboarding_history || existingSession.onboarding_history.length === 0)) {
            sessionId = activeSessionId;
            await base44.entities.Session.update(sessionId, sessionData);
            console.log('✅ Session active vide mise à jour:', sessionId);
          } else {
            // Session active a déjà des données, on cherche s'il y a une session vide ou on en crée une nouvelle
            sessionId = activeSessionId;
            // On écrase si c'est la seule option (premier onboarding, pas de multi-session encore)
            await base44.entities.Session.update(sessionId, sessionData);
            console.log('✅ Session active existante réinitialisée:', sessionId);
          }
        } else {
          // activeSessionId invalide, fallback sur la logique classique
          sessionId = await createOrReuseSession(currentUser, sessionData, prefilledSkill);
        }
      } else {
        // CAS 3 : Aucune session active → logique classique
        sessionId = await createOrReuseSession(currentUser, sessionData, prefilledSkill);
      }

      // Sauvegarder le sessionId sur le user + localStorage
      await base44.auth.updateMe({
        firstName: firstName.trim(),
        sessionId: sessionId,
        coreSkill: prefilledSkill || ''
      });
      localStorage.setItem('passionia_active_session_id', sessionId);

      console.log('✅ User mis à jour avec prénom, sessionId et skill:', sessionId);

      // Navigation vers OnboardingDynamic
      navigate(createPageUrl('OnboardingDynamic'));
    } catch (error) {
      console.error('Error saving firstName:', error);
      alert('Une erreur est survenue. Merci de réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logique classique : réutiliser la première session ou en créer une
  const createOrReuseSession = async (currentUser, sessionData, prefilledSkill) => {
    const existingSessions = await base44.entities.Session.filter({
      created_by: currentUser.email
    });

    if (existingSessions.length > 0) {
      // Réutiliser la première session (rétrocompatible)
      const sessionId = existingSessions[0].id;
      await base44.entities.Session.update(sessionId, {
        ...sessionData,
        session_number: existingSessions[0].session_number || 1,
        session_name: existingSessions[0].session_name || 'Session 1'
      });
      console.log('✅ Session existante réutilisée:', sessionId);
      return sessionId;
    } else {
      // Créer la première session
      const session = await base44.entities.Session.create({
        ...sessionData,
        session_number: 1,
        session_name: 'Session 1',
        is_regenerating: false,
        regeneration_count: 0
      });
      console.log('✅ Première session créée:', session.id);
      return session.id;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && firstName.trim()) {
      handleNext();
    }
  };

  // Afficher un loader pendant la vérification d'auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <NoahAvatar />
          <p className="text-gray-600 mt-4">Vérification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Noah Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <NoahAvatar />
        </motion.div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm min-h-[500px]">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-relaxed min-h-[2.5rem]">
            {typing1.displayedText}
            {!typing1.isComplete && <span className="animate-pulse">|</span>}
          </h1>
          
          {typing1.isComplete && (
            <div className="text-gray-700 mb-6 leading-relaxed whitespace-pre-line min-h-[6rem]">
              Je suis <span className="text-[#61f7a2] font-semibold">Noah</span>, l'IA de Passion IA.
              <br />
              {typing2.displayedText.split('\n').slice(1).join('\n')}
              {!typing2.isComplete && <span className="animate-pulse">|</span>}
            </div>
          )}

          {typing2.isComplete && (
            <div className="text-gray-700 mb-6 leading-relaxed whitespace-pre-line min-h-[5rem]">
              {typing3.displayedText}
              {!typing3.isComplete && <span className="animate-pulse">|</span>}
            </div>
          )}

          {typing3.isComplete && (
            <div className="text-gray-700 mb-6 leading-relaxed min-h-[2rem]">
              {typing4.displayedText}
              {!typing4.isComplete && <span className="animate-pulse">|</span>}
            </div>
          )}

          {typing4.isComplete && (
            <Input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ton prénom"
              className="w-full bg-white border-gray-300 text-gray-900 text-lg py-6 px-4 rounded-2xl focus:border-[#61f7a2] focus:ring-[#61f7a2] placeholder:text-gray-400"
              autoFocus
            />
          )}

          {typing4.isComplete && (
            <div className="mt-8">
              <GlowButton
                onClick={handleNext}
                disabled={!firstName.trim()}
                loading={isLoading}
                className="w-full"
                size="lg"
              >
                Prêt à démarrer
                <ArrowRight className="w-5 h-5 ml-2" />
              </GlowButton>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}