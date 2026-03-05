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
      alignItems: 'center', justifyContent: 'center',
      background: '#ffffff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: 'relative', overflow: 'hidden', padding: '40px 24px',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Floating neon circles — subtle */}
      <div className="ogs-neon ogs-neon-1" />
      <div className="ogs-neon ogs-neon-2" />
      <div className="ogs-neon ogs-neon-3" />

      <div style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 1 }}>

        {/* Avatar icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}
        >
          <div style={{ position: 'relative' }}>
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '72px', height: '72px', borderRadius: '20px',
                background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(249,115,22,0.2)',
              }}
            >
              <Brain size={36} color="#fff" strokeWidth={1.5} />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                position: 'absolute', bottom: '2px', right: '2px',
                width: '14px', height: '14px', borderRadius: '50%',
                background: '#3dd67a', border: '2.5px solid #fff',
              }}
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '8px' }}
        >
          <h1 style={{
            fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800,
            letterSpacing: '-0.03em', color: '#1a1a1a', lineHeight: 1.2, marginBottom: '8px',
          }}>
            Construction de ton offre…
          </h1>
          <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.6 }}>
            Cela peut prendre jusqu'à 5 minutes. Ne ferme pas cette page.
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{ marginTop: '24px', marginBottom: '28px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#999' }}>
              {formatTime(elapsedTime)}
            </span>
            <span style={{
              fontSize: '12px', fontWeight: 700,
              background: 'linear-gradient(135deg, #f97316, #ec4899)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {Math.min(95, 20 + currentStep * 20)}%
            </span>
          </div>
          <div style={{
            width: '100%', height: '4px', background: '#f0f0f0',
            borderRadius: '100px', overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(95, 20 + currentStep * 20)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                height: '100%', borderRadius: '100px',
                background: 'linear-gradient(90deg, #f97316, #ec4899, #a78bfa)',
              }}
            />
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
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: index <= currentStep ? 1 : 0.35, x: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '16px 18px', background: '#fff',
                  borderRadius: '16px',
                  border: isInProgress ? '1px solid #e0e0e0' : '1px solid #f0f0f0',
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                  boxShadow: isInProgress ? '0 4px 16px rgba(0,0,0,0.04)' : 'none',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{
                  flexShrink: 0, width: '44px', height: '44px', borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isCompleted ? '#f0fdf4' : '#f5f5f5',
                }}>
                  {isCompleted
                    ? <Check size={20} color="#3dd67a" strokeWidth={2} />
                    : <Icon size={20} color="#1a1a1a" strokeWidth={1.5} />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.01em' }}>
                      {step.title}
                    </span>
                    {isInProgress && (
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}
                        style={{ display: 'flex', gap: '3px' }}>
                        {[0, 1, 2].map(i => (
                          <div key={i} style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#999' }} />
                        ))}
                      </motion.div>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: '#999', margin: '2px 0 0', lineHeight: 1.4 }}>
                    {step.description}
                  </p>
                </div>
                {isCompleted && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} style={{ marginLeft: 'auto' }}>
                    <Check size={16} color="#3dd67a" strokeWidth={2} />
                  </motion.div>
                )}

                {isInProgress && (
                  <motion.div
                    style={{
                      position: 'absolute', bottom: 0, left: 0, height: '2px',
                      background: 'linear-gradient(90deg, #f97316, #ec4899, #a78bfa)',
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

        {/* Reassurance */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 0.6 }}
          style={{ textAlign: 'center', fontSize: '12px', color: '#bbb', marginTop: '32px' }}
        >
          Nos serveurs sont parfois très sollicités — merci de patienter.
        </motion.p>
      </div>

      <style>{`
        .ogs-neon { position: absolute; border-radius: 50%; pointer-events: none; z-index: 0; filter: blur(60px); opacity: 0.35; }
        .ogs-neon-1 { width: min(300px, 60vw); height: min(300px, 60vw); background: radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 70%); top: 5%; right: -10%; animation: ogsF1 7s ease-in-out infinite; }
        .ogs-neon-2 { width: min(240px, 50vw); height: min(240px, 50vw); background: radial-gradient(circle, rgba(236,72,153,0.35) 0%, transparent 70%); bottom: 10%; left: -8%; animation: ogsF2 8s ease-in-out infinite; }
        .ogs-neon-3 { width: min(200px, 42vw); height: min(200px, 42vw); background: radial-gradient(circle, rgba(167,139,250,0.35) 0%, transparent 70%); top: 40%; left: 50%; transform: translateX(-50%); animation: ogsF3 9s ease-in-out infinite; }
        @keyframes ogsF1 { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-16px,14px) scale(1.06); } }
        @keyframes ogsF2 { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(14px,-10px) scale(1.05); } }
        @keyframes ogsF3 { 0%, 100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) translate(10px,12px) scale(1.08); } }
      `}</style>
    </div>
  );
}