import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function OnboardingQ24IfNothingChanges() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const options = [
    "Exactement au même point, avec les mêmes frustrations",
    "Un peu découragé(e) de ne pas avoir essayé",
    "En train de chercher une autre idée, sans être passé(e) à l'action",
    "J'aurai probablement oublié cette idée"
  ];

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    try {
      const firstName = localStorage.getItem('onboarding_firstName') || '';
      const storedValue = localStorage.getItem('onboarding_ifNothingChanges');
      setUser({ firstName });
      if (storedValue) setValue(storedValue);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (option) => {
    setValue(option);
    setIsSaving(true);
    try {
      const { base44 } = await import('@/api/base44Client');
      const currentUser = await base44.auth.me();
      const resolvedSessionId = localStorage.getItem('passionia_active_session_id') || currentUser.sessionId;
      if (!resolvedSessionId) { alert('Session introuvable.'); setIsSaving(false); return; }
      const sessions = await base44.entities.Session.filter({ id: resolvedSessionId });
      if (!sessions || sessions.length === 0) { setIsSaving(false); return; }
      const session = sessions[0];
      const onboardingFull = session.onboarding_full || {};
      onboardingFull.ifNothingChanges = option;
      await base44.entities.Session.update(resolvedSessionId, { onboarding_full: onboardingFull });
      localStorage.setItem('onboarding_ifNothingChanges', option);
      navigate(createPageUrl('OnboardingQ25Readiness'));
    } catch (error) {
      console.error('Error saving:', error);
      alert('Erreur de sauvegarde.');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', fontFamily: "'Inter', sans-serif" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#1a1a1a' }} />
      </div>
    );
  }

  // Q24 = 13th of 15 total static questions → ~87%
  const globalProgress = 87;

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
          animate={{ width: `${globalProgress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', position: 'relative', overflow: 'hidden',
      }}>
        <div className="oqp-neon oqp-neon-1" />
        <div className="oqp-neon oqp-neon-2" />
        <div className="oqp-neon oqp-neon-3" />

        <div style={{ width: '100%', maxWidth: '520px', textAlign: 'center', position: 'relative', zIndex: 1 }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#f5f5f5', border: '1px solid #e8e8e8',
            borderRadius: '100px', padding: '6px 16px',
            fontSize: '13px', color: '#666', marginBottom: '28px'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
              color: '#fff', padding: '2px 10px', borderRadius: '100px',
              fontSize: '11px', fontWeight: 600
            }}>NOAH™</span>
            Tes objectifs — 9/11
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 style={{
              fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 500,
              lineHeight: 1.3, letterSpacing: '-0.02em',
              color: '#1a1a1a', marginBottom: '28px',
            }}>
              Si tu ne fais rien, où seras-tu dans 6 mois ?
            </h1>

            {/* Grid 2x2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textAlign: 'left' }}>
              {options.map((option, idx) => {
                const isSelected = value === option;
                return (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    onClick={() => !isSaving && handleSelect(option)}
                    disabled={isSaving}
                    style={{
                      position: 'relative',
                      padding: '20px 16px', borderRadius: '20px',
                      border: isSelected ? '2px solid #1a1a1a' : '1px solid #e5e5e5',
                      background: isSelected ? '#f5f5f5' : '#fff',
                      fontSize: '14px', fontWeight: isSelected ? 600 : 400,
                      fontFamily: "'Inter', sans-serif", color: '#1a1a1a',
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s', textAlign: 'left',
                      lineHeight: 1.5,
                      opacity: isSaving && !isSelected ? 0.5 : 1,
                    }}
                  >
                    {option}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                          position: 'absolute', top: '-6px', right: '-6px',
                          width: '22px', height: '22px', borderRadius: '50%',
                          background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Back button */}
            <div style={{ marginTop: '32px' }}>
              <button
                onClick={() => navigate(createPageUrl('OnboardingQ23Obstacles'))}
                style={{
                  background: '#fff', border: '1px solid #e5e5e5',
                  borderRadius: '100px', padding: '12px 20px',
                  fontSize: '14px', fontWeight: 500, fontFamily: "'Inter', sans-serif",
                  color: '#888', cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                <ArrowLeft size={16} /> Retour
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .oqp-neon { position: absolute; border-radius: 50%; pointer-events: none; z-index: 0; filter: blur(60px); opacity: 0.5; }
        .oqp-neon-1 { width: min(280px, 55vw); height: min(280px, 55vw); background: radial-gradient(circle, rgba(249,115,22,0.5) 0%, transparent 70%); top: 8%; left: -8%; animation: oqpF1 7s ease-in-out infinite; }
        .oqp-neon-2 { width: min(220px, 45vw); height: min(220px, 45vw); background: radial-gradient(circle, rgba(236,72,153,0.45) 0%, transparent 70%); bottom: 15%; right: -5%; animation: oqpF2 8s ease-in-out infinite; }
        .oqp-neon-3 { width: min(200px, 42vw); height: min(200px, 42vw); background: radial-gradient(circle, rgba(167,139,250,0.45) 0%, transparent 70%); bottom: 5%; left: 10%; animation: oqpF3 9s ease-in-out infinite; }
        @keyframes oqpF1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(18px, -12px) scale(1.06); } }
        @keyframes oqpF2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-12px, 16px) scale(1.05); } }
        @keyframes oqpF3 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(14px, 10px) scale(1.08); } }
      `}</style>
    </div>
  );
}