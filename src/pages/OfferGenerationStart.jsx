import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Check, Gift, Award, Crown, RotateCw } from 'lucide-react';

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
    { title: "Offre Principale", description: "Ton produit d'entrée pour attirer et convertir tes premiers clients", icon: Gift },
    { title: "Offre Extra", description: "Un complément irrésistible qui booste ton panier moyen de 30-40%", icon: Sparkles },
    { title: "Offre Supérieure", description: "Pour les clients prêts à aller plus loin avec toi (×2-3 ton revenu)", icon: Award },
    { title: "Offre Premium", description: "Ton accompagnement VIP qui maximise ton revenu par client", icon: Crown }
  ];

  useEffect(() => { generateOffer(); }, []);

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
        const isRetryable = err.message?.includes('429') || err.message?.includes('Too Many') || err.message?.includes('overloaded') || err.message?.includes('529') || err.message?.includes('timeout') || err.message?.includes('network') || err.message?.includes('fetch');
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
        navigate(createPageUrl(redirectMap[missingKeys[0]] || 'OnboardingQ16TargetIncome'));
        return;
      }

      if (!user.firstName) { navigate(createPageUrl('OnboardingFirstName')); return; }
      if (!session.skill && !fullData.coreSkill && !session.onboarding_summary?.who_to_teach) { navigate(createPageUrl('OnboardingFirstName')); return; }

      let response;
      try {
        response = await retryableCall(() => base44.functions.invoke('generateFullStackOffer', { sessionId }), { label: 'generateFullStackOffer', maxRetries: 3, baseDelay: 3000 });
      } catch (genError) {
        setIsRetrying(false);
        setError({ type: 'generation_error', message: 'La génération a pris trop de temps. Réessaye, ça devrait marcher !' });
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
            setError({ type: 'generation_error', message: 'La génération a rencontré un souci. Réessaye dans quelques instants.' });
            return;
          }
        } catch {
          setIsRetrying(false);
          setError({ type: 'generation_error', message: 'La génération a rencontré un souci. Réessaye dans quelques instants.' });
          return;
        }
      }

      if (!response.data?.success) {
        setError({ type: 'generation_error', message: 'La génération n\'a pas pu être confirmée. Réessaye.' });
        return;
      }

      navigate(createPageUrl('OfferProductPrincipal'));
    } catch (error) {
      setIsRetrying(false);
      setError({ type: 'generation_error', message: error.message || 'Une erreur est survenue' });
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsRetrying(false);
    setElapsedTime(0);
    setCurrentStep(0);
    generateOffer();
  };

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#ffffff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: '40px 24px', position: 'relative', overflow: 'hidden',
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <div className="ogs-neon ogs-neon-1" />
        <div className="ogs-neon ogs-neon-2" />

        <div style={{ maxWidth: '420px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '24px',
            background: '#f8f8f8', border: '1px solid #e5e5e5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
          }}>
            <RotateCw size={36} style={{ color: '#ccc' }} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', marginBottom: '12px', letterSpacing: '-0.02em' }}>
            Un petit souci temporaire
          </h2>
          <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.6, marginBottom: '28px' }}>
            {error.message}
          </p>

          <button
            onClick={handleRetry}
            style={{
              background: '#1a1a1a', color: '#fff', border: 'none',
              padding: '14px 32px', borderRadius: '100px',
              fontSize: '15px', fontWeight: 600, cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              transition: 'opacity 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            Relancer la génération
          </button>
          <p style={{ fontSize: '11px', color: '#bbb', marginTop: '16px' }}>
            Nos serveurs sont parfois très sollicités
          </p>
        </div>

        <style>{`
          .ogs-neon { position: absolute; border-radius: 50%; pointer-events: none; z-index: 0; filter: blur(60px); opacity: 0.5; }
          .ogs-neon-1 { width: 280px; height: 280px; background: radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 70%); top: 5%; left: -8%; animation: ogsF1 7s ease-in-out infinite; }
          .ogs-neon-2 { width: 220px; height: 220px; background: radial-gradient(circle, rgba(236,72,153,0.35) 0%, transparent 70%); bottom: 10%; right: -5%; animation: ogsF2 8s ease-in-out infinite; }
          @keyframes ogsF1 { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(18px,-12px) scale(1.06); } }
          @keyframes ogsF2 { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-12px,16px) scale(1.05); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: '#ffffff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Progress bar */}
      <div style={{ width: '100%', height: '3px', background: '#f0f0f0' }}>
        <motion.div
          style={{ height: '100%', background: 'linear-gradient(90deg, #f97316, #ec4899, #a78bfa)', borderRadius: '0 4px 4px 0' }}
          initial={{ width: '0%' }}
          animate={{ width: `${Math.min(95, 20 + currentStep * 20)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Floating neon circles */}
        <div className="ogs-neon ogs-neon-1" />
        <div className="ogs-neon ogs-neon-2" />
        <div className="ogs-neon ogs-neon-3" />

        <div style={{ width: '100%', maxWidth: '520px', position: 'relative', zIndex: 1 }}>

          {/* Badge pill */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#f5f5f5', border: '1px solid #e8e8e8',
              borderRadius: '100px', padding: '6px 16px',
              fontSize: '13px', color: '#666',
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
                color: '#fff', padding: '2px 10px', borderRadius: '100px',
                fontSize: '11px', fontWeight: 600
              }}>NOAH™</span>
              Génération en cours
            </div>
          </div>

          {/* Animated Brain Icon */}
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: 'relative', width: '88px', height: '88px', margin: '0 auto 24px' }}
          >
            <div style={{
              width: '88px', height: '88px', borderRadius: '24px',
              background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}>
              <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                <Brain size={40} color="#fff" />
              </motion.div>
            </div>
            {[0, 1].map(i => (
              <motion.div key={i}
                style={{ position: 'absolute', inset: 0, borderRadius: '24px', border: '1px solid #1a1a1a' }}
                initial={{ scale: 1, opacity: 0.3 }}
                animate={{ scale: [1, 1.5, 2], opacity: [0.3, 0.1, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
              />
            ))}
          </motion.div>

          {/* Title + Timer */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{
              fontSize: 'clamp(20px, 3.5vw, 26px)', fontWeight: 600,
              color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: '12px',
            }}>
              Noah construit ton offre…
            </h1>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#f8f8f8', border: '1px solid #e5e5e5',
              borderRadius: '100px', padding: '8px 18px',
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'ogsPulse 1.5s ease-in-out infinite' }} />
              <span style={{ fontFamily: "'Inter', monospace", fontWeight: 600, fontSize: '16px', color: '#1a1a1a' }}>
                {formatTime(elapsedTime)}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '12px' }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1a1a1a' }}
                />
              ))}
            </div>
          </div>

          {/* Info banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
            style={{
              background: 'linear-gradient(135deg, rgba(249,115,22,0.06), rgba(236,72,153,0.04))',
              border: '1px solid rgba(249,115,22,0.15)',
              borderRadius: '20px', padding: '16px 20px', marginBottom: '28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>✨</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>
                  Génération ultra-personnalisée
                </p>
                <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.5, marginBottom: '4px' }}>
                  Pour des offres adaptées à ton profil, la génération peut prendre jusqu'à <span style={{ fontWeight: 600, color: '#666' }}>5 minutes</span>.
                </p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>
                  ⚠️ Ne ferme surtout pas cette page !
                </p>
              </div>
            </div>
          </motion.div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {preparationSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isInProgress = index === currentStep;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: index <= currentStep ? 1 : 0.35, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  style={{
                    position: 'relative', borderRadius: '16px', padding: '14px 16px',
                    background: isCompleted ? '#fafafa' : isInProgress ? '#fff' : '#fff',
                    border: isCompleted
                      ? '1px solid #e0e0e0'
                      : isInProgress
                        ? '2px solid #1a1a1a'
                        : '1px solid #eeeeee',
                    transition: 'all 0.3s',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      background: isCompleted
                        ? 'linear-gradient(135deg, #f97316, #ec4899)'
                        : '#1a1a1a',
                    }}>
                      {isCompleted
                        ? <Check size={18} color="#fff" />
                        : <Icon size={18} color="#fff" />
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
                          {step.title}
                        </h3>
                        {isInProgress && (
                          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
                            style={{ display: 'flex', gap: '3px' }}>
                            {[0, 1, 2].map(i => (
                              <div key={i} style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#1a1a1a' }} />
                            ))}
                          </motion.div>
                        )}
                        {isCompleted && (
                          <span style={{
                            fontSize: '10px', fontWeight: 600, color: '#f97316',
                            background: 'rgba(249,115,22,0.08)', padding: '2px 8px',
                            borderRadius: '100px',
                          }}>Prêt</span>
                        )}
                      </div>
                      <p style={{ fontSize: '12px', color: '#999', margin: '2px 0 0', lineHeight: 1.4 }}>
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {isInProgress && (
                    <motion.div
                      style={{
                        position: 'absolute', bottom: 0, left: 0, height: '2px',
                        background: 'linear-gradient(90deg, #f97316, #ec4899, #a78bfa)',
                        borderRadius: '0 0 16px 16px',
                      }}
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

      <style>{`
        .ogs-neon { position: absolute; border-radius: 50%; pointer-events: none; z-index: 0; filter: blur(60px); opacity: 0.5; }
        .ogs-neon-1 { width: min(280px, 55vw); height: min(280px, 55vw); background: radial-gradient(circle, rgba(249,115,22,0.5) 0%, transparent 70%); top: 8%; left: -8%; animation: ogsF1 7s ease-in-out infinite; }
        .ogs-neon-2 { width: min(220px, 45vw); height: min(220px, 45vw); background: radial-gradient(circle, rgba(236,72,153,0.45) 0%, transparent 70%); bottom: 15%; right: -5%; animation: ogsF2 8s ease-in-out infinite; }
        .ogs-neon-3 { width: min(200px, 42vw); height: min(200px, 42vw); background: radial-gradient(circle, rgba(167,139,250,0.45) 0%, transparent 70%); bottom: 5%; left: 10%; animation: ogsF3 9s ease-in-out infinite; }
        @keyframes ogsF1 { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(18px,-12px) scale(1.06); } }
        @keyframes ogsF2 { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-12px,16px) scale(1.05); } }
        @keyframes ogsF3 { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(14px,10px) scale(1.08); } }
        @keyframes ogsPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.85); } }
      `}</style>
    </div>
  );
}