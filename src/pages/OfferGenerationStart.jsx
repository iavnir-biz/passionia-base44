import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Zap, Check, Gift, Award, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfferGenerationStart() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timerInterval = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(timerInterval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const preparationSteps = [
    { title: "Low Ticket", description: "Une petite offre pour attirer et convertir tes premiers clients", icon: Gift, status: "in-progress" },
    { title: "Order Bump", description: "Un complément irrésistible qui booste ton panier moyen", icon: Sparkles, status: "pending" },
    { title: "Offre Supérieure", description: "Pour les clients prêts à aller plus loin (×2-3 ton revenu)", icon: Award, status: "pending" },
    { title: "Offre Premium", description: "Ton accompagnement VIP qui maximise ton revenu", icon: Crown, status: "pending" }
  ];

  useEffect(() => {
    generateOffer();
  }, []);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => prev < preparationSteps.length - 1 ? prev + 1 : prev);
    }, 3000);
    return () => clearInterval(stepInterval);
  }, []);

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const retryableCall = async (fn, { maxRetries = 3, baseDelay = 2000, label = 'call' } = {}) => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try { return await fn(); } catch (err) {
        const isRetryable = err.message?.includes('429') || err.message?.includes('overloaded') || err.message?.includes('529') || err.message?.includes('timeout') || err.message?.includes('network') || err.message?.includes('fetch');
        if (isRetryable && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          setIsRetrying(true);
          await wait(delay);
          continue;
        }
        throw err;
      }
    }
  };

  const generateOffer = async () => {
    try {
      const user = await retryableCall(() => base44.auth.me(), { label: 'auth.me', maxRetries: 2, baseDelay: 1500 });
      const resolvedSessionId = localStorage.getItem('passionia_active_session_id') || user.sessionId;
      if (!resolvedSessionId) { navigate(createPageUrl('OnboardingFirstName')); return; }

      let sessions = null;
      try {
        sessions = await retryableCall(() => base44.entities.Session.filter({ id: resolvedSessionId }), { label: 'session.filter', maxRetries: 3, baseDelay: 2000 });
      } catch (fetchError) {
        setIsRetrying(false);
        setError({ type: 'fetch_error', message: 'Impossible de charger tes données. Vérifie ta connexion.' });
        return;
      }

      if (!sessions || sessions.length === 0) {
        try {
          const fallbackSessions = await retryableCall(() => base44.entities.Session.filter({ created_by: user.email }), { label: 'session.fallback', maxRetries: 2, baseDelay: 2000 });
          if (fallbackSessions.length > 0) {
            const latestSession = fallbackSessions.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
            await base44.auth.updateMe({ sessionId: latestSession.id });
            sessions = [latestSession];
          } else { navigate(createPageUrl('OnboardingFirstName')); return; }
        } catch { navigate(createPageUrl('OnboardingFirstName')); return; }
      }

      const session = sessions[0];
      const sessionId = session.id;

      if (!session.is_onboarding_done || (session.onboarding_history?.length || 0) < 11) {
        navigate(createPageUrl('OnboardingDynamic')); return;
      }

      const requiredFullKeys = ['targetIncome', 'perceivedObstacles', 'readinessScore'];
      const fullData = session.onboarding_full || {};
      const missingKeys = requiredFullKeys.filter(k => !fullData[k] && fullData[k] !== 0);

      if (missingKeys.length > 0) {
        const redirectMap = { 'targetIncome': 'OnboardingQ16TargetIncome', 'perceivedObstacles': 'OnboardingQ23Obstacles', 'readinessScore': 'OnboardingQ25Readiness' };
        navigate(createPageUrl(redirectMap[missingKeys[0]] || 'OnboardingQ16TargetIncome')); return;
      }

      if (!user.firstName) { navigate(createPageUrl('OnboardingFirstName')); return; }
      if (!session.skill && !fullData.coreSkill && !session.onboarding_summary?.who_to_teach) { navigate(createPageUrl('OnboardingFirstName')); return; }

      let response;
      try {
        response = await retryableCall(() => base44.functions.invoke('generateFullStackOffer', { sessionId }), { label: 'generateFullStackOffer', maxRetries: 3, baseDelay: 3000 });
      } catch (genError) {
        setIsRetrying(false);
        setError({ type: 'generation_error', message: 'La génération a pris trop de temps. Réessaye !' });
        return;
      }
      setIsRetrying(false);

      if (response.data?.error) {
        setIsRetrying(true);
        await wait(3000);
        try {
          response = await base44.functions.invoke('generateFullStackOffer', { sessionId });
          setIsRetrying(false);
          if (response.data?.error || !response.data?.success) {
            setError({ type: 'generation_error', message: 'La génération a rencontré un souci. Réessaye.' }); return;
          }
        } catch {
          setIsRetrying(false);
          setError({ type: 'generation_error', message: 'La génération a rencontré un souci. Réessaye.' }); return;
        }
      }

      if (!response.data?.success) {
        setError({ type: 'generation_error', message: 'La génération n\'a pas pu être confirmée.' }); return;
      }
      navigate(createPageUrl('OfferProductPrincipal'));
    } catch (error) {
      setIsRetrying(false);
      setError({ type: 'generation_error', message: error.message || 'Une erreur est survenue' });
    }
  };

  const handleRetry = () => {
    setError(null); setIsRetrying(false); setElapsedTime(0); setCurrentStep(0);
    generateOffer();
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50"
           style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 rounded-2xl bg-[#f8f8f8] mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">🔄</span>
          </div>
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Un petit souci temporaire</h2>
          <p className="text-[#888] mb-6">{error.message}</p>
          <button onClick={handleRetry}
            style={{ background: '#1a1a1a', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '100px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
            Relancer la génération
          </button>
          <p className="text-xs text-[#bbb] mt-4">Nos serveurs sont parfois très sollicités</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden"
         style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Neon ambient */}
      <div style={{ position: 'fixed', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', top: '5%', left: '-5%', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.10) 0%, transparent 70%)', bottom: '10%', right: '-3%', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.10) 0%, transparent 70%)', bottom: '5%', left: '15%', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

      <div className="min-h-screen flex flex-col items-center justify-start pt-20 lg:pt-8 pb-12 px-6 relative z-10">
        <div className="max-w-xl w-full">
          {/* Animated icon */}
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto mb-8 w-24 h-24"
          >
            <div className="w-24 h-24 rounded-2xl bg-[#1a1a1a] flex items-center justify-center shadow-xl">
              <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                <Brain className="w-12 h-12 text-white" />
              </motion.div>
            </div>
            {[...Array(2)].map((_, i) => (
              <motion.div key={i} className="absolute inset-0 rounded-2xl border border-[#1a1a1a]"
                initial={{ scale: 1, opacity: 0.3 }}
                animate={{ scale: [1, 1.5, 2], opacity: [0.3, 0.1, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }} />
            ))}
          </motion.div>

          {/* Message & Timer */}
          <div className="text-center mb-6">
            <p className="text-xl font-semibold text-[#1a1a1a] mb-3">Noah construit ton offre…</p>
            <div className="inline-flex items-center gap-2 bg-[#f5f5f5] border border-[#e5e5e5] rounded-full px-4 py-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[#1a1a1a] font-mono font-semibold text-lg">{formatTime(elapsedTime)}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
              ))}
            </div>
          </div>

          {/* Info banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2 }}
            className="rounded-2xl p-5 mb-6 border border-[#e5e5e5] bg-[#f8f8f8]"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
                <span className="text-base">✨</span>
              </div>
              <div className="flex-1">
                <h3 className="text-[#1a1a1a] font-bold text-sm mb-1">🎯 Génération en cours...</h3>
                <p className="text-[#666] text-sm leading-relaxed mb-1">
                  Pour des offres <span className="font-semibold">ultra-personnalisées</span>, la génération peut prendre jusqu'à <span className="font-semibold">5 minutes</span>.
                </p>
                <p className="text-[#1a1a1a] font-semibold text-sm">⚠️ Ne ferme surtout pas cette page !</p>
              </div>
            </div>
          </motion.div>

          {/* Steps */}
          <div className="space-y-3">
            {preparationSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isInProgress = index === currentStep;

              return (
                <motion.div key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: index <= currentStep ? 1 : 0.4, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative rounded-xl p-4 transition-all duration-300 border ${
                    isCompleted ? 'bg-[#f0faf4] border-[#c6f0d4]' :
                    isInProgress ? 'bg-[#f8f8f8] border-[#1a1a1a]' :
                    'bg-white border-[#e5e5e5]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      isCompleted ? 'bg-[#1a1a1a]' : isInProgress ? 'bg-[#1a1a1a] animate-pulse' : 'bg-[#f0f0f0]'
                    }`}>
                      {isCompleted ? <Check className="w-5 h-5 text-white" /> : <Icon className={`w-5 h-5 ${isInProgress ? 'text-white' : 'text-[#ccc]'}`} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#1a1a1a] mb-0.5 flex items-center gap-2 text-sm">
                        {step.title}
                        {isInProgress && (
                          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="flex gap-0.5">
                            {[0,1,2].map(d => <div key={d} className="w-1 h-1 rounded-full bg-[#1a1a1a]" />)}
                          </motion.div>
                        )}
                      </h3>
                      <p className="text-xs text-[#888] leading-relaxed">{step.description}</p>
                    </div>
                  </div>

                  {isInProgress && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-[2px] rounded-b-xl"
                      style={{ background: 'linear-gradient(90deg, #f97316, #ec4899, #a78bfa)' }}
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