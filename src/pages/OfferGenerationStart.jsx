import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Zap, Check, TrendingUp, Gift, Award, Crown, Lock, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NoahBrainIcon } from '@/components/NoahBrainIcon';

// ============================================================
// 🔥 Fonction de synchronisation localStorage → Base44 Session
// ============================================================
async function syncLocalStorageToSession() {
  const onboardingData = JSON.parse(localStorage.getItem('onboarding_data') || '{}');
  const firstName = localStorage.getItem('onboarding_firstName') || '';

  // Construire onboarding_history depuis le format local
  const history = (onboardingData.history || []).map(item => ({
    question: item.question,
    answer: item.answer
  }));

  // Construire onboarding_full depuis les données locales
  const full = { ...(onboardingData.full || {}) };

  // Ajouter aussi les données Q12-Q26 depuis localStorage
  const q12to26Fields = [
    'ageRange', 'gender', 'familyStatus', 'currentIncome',
    'targetIncome', 'targetIncomeDelay', 'lifeChangeStory', 'impactGoals',
    'emotionalBenefits', 'relativesThoughts', 'lifestyleGoals', 'perceivedObstacles',
    'ifNothingChanges', 'readinessScore', 'deliveryPreferences'
  ];

  for (const field of q12to26Fields) {
    const stored = localStorage.getItem(`onboarding_${field}`);
    if (stored) {
      try {
        full[field] = JSON.parse(stored);
      } catch {
        full[field] = stored;
      }
    }
  }

  // Construire le summary
  const summary = { ...(onboardingData.summary || {}) };
  if (full.deliveryPreferences) {
    summary.format_preferences = full.deliveryPreferences;
  }
  if (full.coreSkill) {
    summary.who_to_teach = full.coreSkill;
  }

  const currentUser = await base44.auth.me();

  // Chercher une session existante
  let sessionId;
  const existingSessions = await base44.entities.Session.filter({
    created_by: currentUser.email
  });

  const sessionData = {
    onboarding_history: history,
    onboarding_summary: summary,
    onboarding_full: full,
    skill: full.coreSkill || localStorage.getItem('prefilledSkill') || '',
    is_onboarding_done: true
  };

  if (existingSessions.length > 0) {
    sessionId = existingSessions[0].id;
    await base44.entities.Session.update(sessionId, sessionData);
    console.log('✅ [SYNC] Session existante mise à jour:', sessionId);
  } else {
    const session = await base44.entities.Session.create(sessionData);
    sessionId = session.id;
    console.log('✅ [SYNC] Nouvelle session créée:', sessionId);
  }

  // Mettre à jour le User avec toutes les données
  await base44.auth.updateMe({
    firstName: firstName,
    sessionId: sessionId,
    coreSkill: full.coreSkill || '',
    targetAudience: full.targetAudience || '',
    mainProblem: full.mainProblem || '',
    firstResult: full.firstQuickResult || '',
    finalTransformation: full.finalTransformation || '',
    uniqueMethod: full.uniqueMethod || '',
    typicalMistake: full.typicalMistake || '',
    extraDetail: full.extraDetail || '',
    deliveryPreferences: full.deliveryPreferences || '',
    onboarding_completed: true
  });

  console.log('✅ [SYNC] User enrichi avec toutes les données onboarding');
  console.log('✅ [SYNC] Synchronisation complète:', {
    sessionId,
    historyLength: history.length,
    fullKeys: Object.keys(full),
    firstName
  });

  return { sessionId, user: await base44.auth.me() };
}

export default function OfferGenerationStart() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('checking'); // checking | auth_required | syncing | generating
  const [dots, setDots] = useState(0);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [syncStatus, setSyncStatus] = useState('');

  // Timer pour afficher le temps écoulé
  useEffect(() => {
    if (phase !== 'generating') return;
    const timerInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [phase]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Témoignages clients
  const testimonials = [
    { name: "Sandra", skill: "Yoga", result: "2 500€ de ventes avec son petit produit", icon: "🧘‍♀️" },
    { name: "Jérôme", skill: "Techniques de sommeil", result: "A quitté son job pour enseigner aux sportifs", icon: "😴" },
    { name: "Marie", skill: "Pâtisserie", result: "4 200€ en 3 mois avec ses formations", icon: "🍰" },
    { name: "Thomas", skill: "Photographie", result: "15 clients en 2 semaines avec son offre starter", icon: "📸" },
    { name: "Léa", skill: "Développement web", result: "8 000€ le premier mois avec son système d'offres", icon: "💻" }
  ];

  // Étapes de préparation
  const preparationSteps = [
    { title: "Low Ticket", description: "Une petite offre pour attirer et convertir facilement tes premiers clients", icon: Gift, color: "from-green-500 to-green-600" },
    { title: "Order Bump", description: "Un complément irrésistible qui booste ton panier moyen de 30-40%", icon: Sparkles, color: "from-purple-500 to-purple-600" },
    { title: "Offre Supérieure", description: "Pour les clients prêts à aller plus loin avec toi (×2-3 ton revenu)", icon: Award, color: "from-orange-500 to-orange-600" },
    { title: "Offre Premium", description: "Ton accompagnement VIP qui maximise ton revenu par client", icon: Crown, color: "from-yellow-500 to-yellow-600" }
  ];

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(dotsInterval);
  }, []);

  // Rotation des témoignages
  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(testimonialInterval);
  }, []);

  // Progression des étapes
  useEffect(() => {
    if (phase !== 'generating') return;
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => prev < preparationSteps.length - 1 ? prev + 1 : prev);
    }, 3000);
    return () => clearInterval(stepInterval);
  }, [phase]);

  // 🔥 Point d'entrée principal
  useEffect(() => {
    checkAuthAndStart();
  }, []);

  const checkAuthAndStart = async () => {
    try {
      // Vérifier les données d'onboarding dans localStorage
      const onboardingData = JSON.parse(localStorage.getItem('onboarding_data') || '{}');
      if (!onboardingData.full || Object.keys(onboardingData.full).length === 0) {
        console.error('❌ [OfferGenerationStart] Pas de données onboarding');
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      // Vérifier l'authentification
      const isAuth = await base44.auth.isAuthenticated();

      if (!isAuth) {
        // 🔒 L'utilisateur n'est pas connecté → Afficher l'écran d'inscription
        console.log('🔒 [OfferGenerationStart] Auth requise - affichage de l\'écran d\'inscription');
        setPhase('auth_required');
        return;
      }

      // ✅ Authentifié → Sync et génération
      await syncAndGenerate();
    } catch (error) {
      console.error('❌ [OfferGenerationStart] Error checking auth:', error);
      // En cas d'erreur d'auth, afficher l'écran d'inscription
      setPhase('auth_required');
    }
  };

  const handleLogin = () => {
    // Rediriger vers la page de login Base44 avec retour ici
    base44.auth.redirectToLogin(window.location.href);
  };

  const syncAndGenerate = async () => {
    try {
      // Phase de synchronisation
      setPhase('syncing');
      setSyncStatus('Synchronisation de tes données...');

      const { sessionId, user } = await syncLocalStorageToSession();

      setSyncStatus('Données synchronisées !');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Phase de génération
      setPhase('generating');
      await generateOffer(sessionId, user);
    } catch (error) {
      console.error('❌ [OfferGenerationStart] Sync/Generate error:', error);
      setError({
        type: 'sync_error',
        message: error.message || 'Erreur lors de la synchronisation'
      });
    }
  };

  const generateOffer = async (sessionId, user, retryCount = 0) => {
    try {
      if (!sessionId) {
        console.error('❌ [OFFER_START] Pas de sessionId');
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      // Charger la session pour validation
      let sessions = null;
      try {
        sessions = await base44.entities.Session.filter({ id: sessionId });
      } catch (fetchError) {
        if (retryCount === 0 && (fetchError.message?.includes('429') || fetchError.message?.includes('Too Many'))) {
          console.warn('⚠️ [OFFER_START] Rate limit, retry dans 1s...');
          setIsRetrying(true);
          await new Promise(resolve => setTimeout(resolve, 1000));
          setIsRetrying(false);
          return generateOffer(sessionId, user, 1);
        }
        throw fetchError;
      }

      if (!sessions || sessions.length === 0) {
        console.error('❌ [OFFER_START] Session introuvable:', sessionId);
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      const session = sessions[0];

      console.log('✅ [OFFER_START] Session loaded:', {
        sessionId,
        historyLength: session.onboarding_history?.length || 0,
        fullKeys: Object.keys(session.onboarding_full || {}),
        isDone: session.is_onboarding_done,
        skill: session.skill
      });

      // Génération
      console.log('✅ [OfferGenerationStart] Toutes les données validées, génération...');

      const response = await base44.functions.invoke('generateFullStackOffer', {
        sessionId
      });

      console.log('📨 [OfferGenerationStart] Réponse génération:', {
        hasError: !!response.data?.error,
        success: response.data?.success,
        fromCache: response.data?.fromCache
      });

      if (response.data?.error) {
        console.error('❌ [OfferGenerationStart] Génération échouée:', response.data.error);
        setError({
          type: 'generation_error',
          message: response.data.error
        });
        return;
      }

      if (!response.data?.success) {
        console.error('❌ [OfferGenerationStart] Génération non confirmée');
        setError({
          type: 'generation_error',
          message: 'La génération n\'a pas pu être confirmée.'
        });
        return;
      }

      console.log('✅ [OfferGenerationStart] Génération réussie → Navigation');

      // Nettoyer le localStorage d'onboarding après sync réussie
      cleanupLocalStorage();

      navigate(createPageUrl('OfferProductPrincipal'));
    } catch (error) {
      console.error('❌ [OFFER_START] Error:', error);
      setError({
        type: 'generation_error',
        message: error.message || 'Une erreur est survenue'
      });
    }
  };

  const cleanupLocalStorage = () => {
    // Nettoyer les données d'onboarding du localStorage après sync réussie
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('onboarding_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('prefilledSkill');
    console.log('🧹 [CLEANUP] localStorage nettoyé:', keysToRemove.length, 'clés supprimées');
  };

  const handleRetry = () => {
    setError(null);
    setIsRetrying(false);
    setElapsedTime(0);
    setCurrentStep(0);
    syncAndGenerate();
  };

  // ====================================
  // 🔒 ÉCRAN D'INSCRIPTION / CONNEXION
  // ====================================
  if (phase === 'auth_required') {
    const firstName = localStorage.getItem('onboarding_firstName') || '';
    const coreSkill = localStorage.getItem('onboarding_coreSkill') || '';

    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg text-center">
            {/* Avatar Noah */}
            <div className="flex justify-center mb-6">
              <NoahBrainIcon size={72} isThinking={true} isFloating={true} />
            </div>

            {/* Titre */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {firstName ? `${firstName}, tes offres sont prêtes !` : 'Tes offres sont prêtes !'}
            </h1>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {coreSkill
                ? `J'ai analysé toutes tes réponses sur "${coreSkill}" et je suis prêt à créer tes 4 offres sur-mesure.`
                : "J'ai analysé toutes tes réponses et je suis prêt à créer tes 4 offres sur-mesure."
              }
            </p>

            {/* Ce qui va être généré */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-gray-800 mb-3">Ce que tu vas recevoir :</p>
              <div className="space-y-2">
                {[
                  '4 offres personnalisées avec prix optimaux',
                  'Messages de vente prêts à utiliser',
                  'Emails marketing rédigés',
                  'Plan d\'action sur 7 jours'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#61f7a2] flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Explication */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 text-left">
                  Crée un compte gratuit pour sauvegarder tes offres et y accéder à tout moment. Tes réponses sont déjà enregistrées !
                </p>
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              onClick={handleLogin}
              className="w-full h-14 bg-gradient-to-r from-[#61f7a2] to-[#4de88f] hover:from-[#4de88f] hover:to-[#3ad87f] text-gray-900 font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-200/50"
            >
              <LogIn className="w-5 h-5" />
              <span>Créer mon compte gratuit</span>
            </button>

            <p className="text-xs text-gray-400 mt-4">
              Inscription gratuite en 30 secondes
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ====================================
  // ⏳ ÉCRAN DE SYNCHRONISATION
  // ====================================
  if (phase === 'checking' || phase === 'syncing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <NoahBrainIcon size={80} isThinking={true} />
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {phase === 'checking' ? 'Vérification...' : 'Préparation de tes données...'}
            </h2>
            <p className="text-gray-500 text-sm">{syncStatus || 'Un instant...'}</p>
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
        </motion.div>
      </div>
    );
  }

  // ====================================
  // ❌ ÉCRAN D'ERREUR
  // ====================================
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

  // ====================================
  // 🚀 ÉCRAN DE GÉNÉRATION (phase === 'generating')
  // ====================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white overflow-x-hidden">
      <div className="min-h-screen flex flex-col items-center justify-start pt-24 lg:pt-8 pb-12 px-6">
        <div className="max-w-2xl w-full">
          {/* Nova AI Avatar avec cerveau animé */}
          <motion.div
            animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto mb-8 w-28 h-28"
          >
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#61f7a2] via-[#4de88f] to-[#3ad87f] flex items-center justify-center shadow-2xl">
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Brain className="w-14 h-14 text-white" />
              </motion.div>
            </div>

            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-3xl border-2 border-[#61f7a2]"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: [1, 1.4, 1.8], opacity: [0.6, 0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
              />
            ))}

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-8"
            >
              <Zap className="absolute top-0 left-1/2 w-5 h-5 text-[#61f7a2] opacity-80" />
              <Sparkles className="absolute top-1/2 right-0 w-5 h-5 text-[#4de88f] opacity-80" />
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-3xl bg-[#61f7a2] blur-2xl -z-10"
            />
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 text-center"
          >
            <p className="text-xl font-semibold text-gray-800 mb-2">
              Noah construit ton offre…
            </p>

            {/* Timer */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="bg-gray-100 px-4 py-2 rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-gray-700 font-mono font-semibold text-lg">
                  {formatTime(elapsedTime)}
                </span>
              </div>
            </div>

            {/* Loading dots */}
            <div className="flex items-center justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-2.5 h-2.5 rounded-full bg-[#61f7a2]"
                />
              ))}
            </div>
          </motion.div>

          {/* Encadré d'information */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-5 mb-6"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
              <div className="flex-1">
                <h3 className="text-amber-900 font-bold text-base mb-2 flex items-center gap-2">
                  🎯 Génération en cours...
                </h3>
                <p className="text-amber-800 text-sm leading-relaxed mb-1.5">
                  Pour des offres <span className="font-semibold">ultra-personnalisées et optimales</span>, la génération peut prendre jusqu'à <span className="font-semibold">5 minutes</span>.
                </p>
                <p className="text-amber-900 font-semibold text-sm">
                  ⚠️ Ne ferme surtout pas cette page ! Laisse la magie opérer... 🪄
                </p>
              </div>
            </div>
          </motion.div>

          {/* Étapes de préparation */}
          <div className="space-y-3 mt-6">
            {preparationSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isInProgress = index === currentStep;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: index <= currentStep ? 1 : 0.4, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative rounded-xl p-4 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200'
                      : isInProgress
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200'
                      : 'bg-white border-2 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center ${
                      isInProgress ? 'animate-pulse' : ''
                    }`}>
                      {isCompleted ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <Icon className="w-6 h-6 text-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                        {step.title}
                        {isInProgress && (
                          <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="flex gap-1"
                          >
                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                          </motion.div>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {isCompleted && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex-shrink-0">
                        <span className="text-green-600 font-semibold text-sm">✓</span>
                      </motion.div>
                    )}
                  </div>

                  {isInProgress && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-b-xl"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3, ease: 'linear' }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
