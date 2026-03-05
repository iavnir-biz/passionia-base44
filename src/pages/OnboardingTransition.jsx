import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Package, Rocket, FileText, Brain, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

const items = [
  { icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50', title: 'Ton idée validée' },
  { icon: Package, color: 'text-pink-500', bg: 'bg-pink-50', title: 'Tes 4 offres sur-mesure avec les prix' },
  { icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50', title: 'Les messages pour vendre' },
  { icon: Rocket, color: 'text-green-500', bg: 'bg-green-50', title: 'La checklist de lancement' },
  { icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50', title: '1 structure d\'ascension claire' },
];

const statusTexts = [
  'Analyse de ton positionnement…',
  'Structuration de tes offres…',
  'Estimation de ton potentiel…',
  'Préparation du plan d\'action…'
];

function fireConfetti() {
  confetti({
    particleCount: 80, spread: 70,
    origin: { x: 0.5, y: 0.5 },
    colors: ['#f97316', '#ec4899', '#a78bfa', '#fbbf24', '#61f7a2'],
    ticks: 120,
  });
  setTimeout(() => {
    confetti({
      particleCount: 50, angle: 60, spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#f97316', '#ec4899', '#fbbf24'],
      ticks: 100,
    });
  }, 400);
  setTimeout(() => {
    confetti({
      particleCount: 50, angle: 120, spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#a78bfa', '#ec4899', '#f97316'],
      ticks: 100,
    });
  }, 700);
  setTimeout(() => {
    confetti({
      particleCount: 40, spread: 160,
      origin: { x: 0.5, y: 0 },
      gravity: 1.2,
      colors: ['#f97316', '#fbbf24', '#a78bfa'],
      ticks: 140,
    });
  }, 1100);
}

export default function OnboardingTransition() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [ready, setReady] = useState(false);
  const [visibleItems, setVisibleItems] = useState(0);
  const [progress, setProgress] = useState(75);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => { loadAndPrepare(); }, []);

  useEffect(() => {
    if (ready) fireConfetti();
  }, [ready]);

  useEffect(() => {
    if (ready && visibleItems < items.length) {
      const timer = setTimeout(() => setVisibleItems(v => v + 1), 350);
      return () => clearTimeout(timer);
    }
  }, [ready, visibleItems]);

  useEffect(() => {
    if (!ready) return;
    const timer = setInterval(() => {
      setProgress(p => (p >= 95 ? 95 : p + 1));
    }, 200);
    return () => clearInterval(timer);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const timer = setInterval(() => {
      setStatusIndex(i => (i + 1) % statusTexts.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      navigate(createPageUrl('OnboardingQ12AgeRange'));
    }, 7000);
    return () => clearTimeout(timer);
  }, [ready]);

  const loadAndPrepare = async () => {
    try {
      const currentUser = await base44.auth.me();
      const name = localStorage.getItem('onboarding_firstName') || currentUser.firstName || '';
      setFirstName(name);

      const resolvedSessionId = localStorage.getItem('passionia_active_session_id') || currentUser.sessionId;
      if (!resolvedSessionId) {
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      const sessions = await base44.entities.Session.filter({ id: resolvedSessionId });
      if (!sessions || sessions.length === 0) {
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      const session = sessions[0];

      if ((session.onboarding_history?.length || 0) < 11) {
        navigate(createPageUrl('OnboardingDynamic'));
        return;
      }

      const fullData = session.onboarding_full || {};
      await base44.auth.updateMe({
        firstName: name,
        coreSkill: session.skill || fullData.coreSkill || '',
        targetAudience: fullData.targetAudience || '',
        mainProblem: fullData.mainProblem || '',
        firstResult: fullData.firstQuickResult || '',
        finalTransformation: fullData.finalTransformation || '',
        uniqueMethod: fullData.uniqueMethod || '',
        typicalMistake: fullData.typicalMistake || '',
        extraDetail: fullData.extraDetail || ''
      });

      setReady(true);
    } catch (error) {
      console.error('[OnboardingTransition] Error:', error);
      setReady(true);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ffffff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: 'relative',
      overflow: 'hidden',
      padding: '40px 24px',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Floating neon circles */}
      <div className="ot-neon ot-neon-1" />
      <div className="ot-neon ot-neon-2" />
      <div className="ot-neon ot-neon-3" />

      <div style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 1 }}>

        {/* Noah Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}
        >
          <div style={{ position: 'relative' }}>
            <motion.div
              animate={ready ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '72px', height: '72px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(249,115,22,0.25)',
              }}
            >
              <Brain size={36} color="#fff" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                position: 'absolute', bottom: '2px', right: '2px',
                width: '14px', height: '14px',
                borderRadius: '50%',
                background: '#3dd67a',
                border: '2.5px solid #fff',
              }}
            />
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '32px' }}
        >
          <h1 style={{
            fontSize: 'clamp(22px, 4vw, 28px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#1a1a1a',
            lineHeight: 1.2,
            marginBottom: '8px',
          }}>
            {ready ? (
              <>Bravo{firstName ? ` ${firstName}` : ''}, c'est prometteur.</>
            ) : (
              'Analyse en cours…'
            )}
          </h1>
          <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.6 }}>
            {ready ? 'Voici ce que Noah va construire pour toi :' : 'Noah étudie tes réponses…'}
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{ marginBottom: '28px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={statusIndex}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.25 }}
                style={{ fontSize: '12px', color: '#999' }}
              >
                {statusTexts[statusIndex]}
              </motion.span>
            </AnimatePresence>
            <span style={{
              fontSize: '12px', fontWeight: 700,
              background: 'linear-gradient(135deg, #f97316, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {progress}%
            </span>
          </div>
          <div style={{
            width: '100%', height: '6px',
            background: '#f0f0f0', borderRadius: '100px',
            overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: '75%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'linear' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #f97316, #ec4899, #a78bfa)',
                borderRadius: '100px',
              }}
            />
          </div>
        </motion.div>

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={i < visibleItems ? { opacity: 1, x: 0, scale: 1 } : {}}
                transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '16px 18px',
                  background: '#fff',
                  borderRadius: '16px',
                  border: '1px solid #f0f0f0',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                whileHover={{ borderColor: '#e0e0e0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}
              >
                <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.01em' }}>
                  {item.title}
                </span>
                {i < visibleItems && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    style={{ marginLeft: 'auto' }}
                  >
                    <CheckCircle2 size={16} style={{ color: '#3dd67a' }} />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Reassurance */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={{ delay: 2.5, duration: 0.6 }}
          style={{
            textAlign: 'center',
            fontSize: '12px',
            color: '#bbb',
            marginTop: '32px',
          }}
        >
          Encore quelques questions pour affiner le résultat.
        </motion.p>
      </div>

      <style>{`
        .ot-neon {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(60px);
          opacity: 0.45;
        }
        .ot-neon-1 {
          width: min(300px, 60vw); height: min(300px, 60vw);
          background: radial-gradient(circle, rgba(249,115,22,0.5) 0%, transparent 70%);
          top: 5%; right: -10%;
          animation: otFloat1 7s ease-in-out infinite;
        }
        .ot-neon-2 {
          width: min(240px, 50vw); height: min(240px, 50vw);
          background: radial-gradient(circle, rgba(236,72,153,0.45) 0%, transparent 70%);
          bottom: 10%; left: -8%;
          animation: otFloat2 8s ease-in-out infinite;
        }
        .ot-neon-3 {
          width: min(200px, 42vw); height: min(200px, 42vw);
          background: radial-gradient(circle, rgba(167,139,250,0.45) 0%, transparent 70%);
          top: 40%; left: 50%;
          transform: translateX(-50%);
          animation: otFloat3 9s ease-in-out infinite;
        }
        @keyframes otFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-16px, 14px) scale(1.06); }
        }
        @keyframes otFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(14px, -10px) scale(1.05); }
        }
        @keyframes otFloat3 {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) translate(10px, 12px) scale(1.08); }
        }
      `}</style>
    </div>
  );
}