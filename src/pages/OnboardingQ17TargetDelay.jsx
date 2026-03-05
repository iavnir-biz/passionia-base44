import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function OnboardingQ17TargetDelay() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [value, setValue] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [realisticChoice, setRealisticChoice] = useState('');

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    try {
      const firstName = localStorage.getItem('onboarding_firstName') || '';
      const storedValue = localStorage.getItem('onboarding_targetIncomeDelay');
      const storedIncome = localStorage.getItem('onboarding_targetIncome');
      setUser({ firstName, targetIncome: storedIncome ? parseInt(storedIncome) : 5000 });
      if (storedValue) setValue(parseInt(storedValue));
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    const income = user.targetIncome || 0;
    if (income >= 10000 && value <= 3) {
      setShowWarning(true);
      return;
    }
    await saveAndContinue(value);
  };

  const saveAndContinue = async (delay) => {
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
      onboardingFull.targetIncomeDelay = delay.toString();
      await base44.entities.Session.update(currentUser.sessionId, { onboarding_full: onboardingFull });
      localStorage.setItem('onboarding_targetIncomeDelay', delay);
      navigate(createPageUrl('OnboardingQ18LifeChange'));
    } catch (error) {
      console.error('Error saving:', error);
      alert('Erreur de sauvegarde.');
      setIsSaving(false);
    }
  };

  const handleRealisticChoice = async () => {
    if (!realisticChoice) return;
    const newIncome = realisticChoice === 'option1' ? 3000 : 5000;
    setShowWarning(false);
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
      onboardingFull.targetIncome = newIncome.toString();
      onboardingFull.targetIncomeDelay = value.toString();
      await base44.entities.Session.update(currentUser.sessionId, { onboarding_full: onboardingFull });
      localStorage.setItem('onboarding_targetIncome', newIncome);
      localStorage.setItem('onboarding_targetIncomeDelay', value);
      navigate(createPageUrl('OnboardingQ18LifeChange'));
    } catch (error) {
      console.error('Error:', error);
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

  // Progress: Q17 = 5th of 15 total static questions → ~33%
  const globalProgress = 33;
  const isDisabled = isSaving;

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
            Tes objectifs — 2/11
          </div>

          {!showWarning ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 style={{
                fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 500,
                lineHeight: 1.3, letterSpacing: '-0.02em',
                color: '#1a1a1a', marginBottom: '16px',
              }}>
                D'ici combien de mois aimerais-tu atteindre ce revenu ?
              </h1>

              <div style={{ marginTop: '16px' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <span style={{ fontSize: '52px', fontWeight: 700, letterSpacing: '-0.03em', color: '#1a1a1a' }}>
                    {value}
                  </span>
                  <span style={{ fontSize: '18px', color: '#bbb', marginLeft: '4px' }}>mois</span>
                </div>
                <input
                  type="range" min={1} max={12} step={1} value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#1a1a1a' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#bbb', marginTop: '8px' }}>
                  <span>1 mois</span>
                  <span>12 mois</span>
                </div>
              </div>

              {/* CTA */}
              <div style={{ marginTop: '32px', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
                <button
                  onClick={() => navigate(createPageUrl('OnboardingQ16TargetIncome'))}
                  style={{
                    background: '#fff', border: '1px solid #e5e5e5',
                    borderRadius: '100px', padding: '14px 20px',
                    fontSize: '14px', fontWeight: 500, fontFamily: "'Inter', sans-serif",
                    color: '#888', cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  <ArrowLeft size={16} /> Retour
                </button>
                <div style={{
                  display: 'inline-flex', alignItems: 'center',
                  background: '#f8f8f8', borderRadius: '100px',
                  padding: '6px', border: '1px solid #e5e5e5', flex: 1, maxWidth: '280px',
                }}>
                  <button
                    onClick={handleNext}
                    disabled={isDisabled}
                    style={{
                      background: isDisabled ? '#ccc' : '#1a1a1a', color: '#fff', border: 'none',
                      padding: '14px 28px', borderRadius: '100px',
                      fontSize: '15px', fontWeight: 600, fontFamily: "'Inter', sans-serif",
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '8px', width: '100%', transition: 'opacity 0.2s',
                    }}
                    onMouseOver={e => { if (!isDisabled) e.currentTarget.style.opacity = '0.85'; }}
                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <>Continuer <ArrowRight size={16} /></>}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AlertTriangle size={28} style={{ color: '#ef4444' }} />
                </div>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', marginBottom: '12px' }}>
                Objectif peu réaliste
              </h2>
              <p style={{ fontSize: '14px', color: '#888', marginBottom: '24px', lineHeight: 1.6 }}>
                Atteindre {user.targetIncome}€/mois en {value} mois n'est pas réaliste pour un premier lancement. Choisis un objectif plus atteignable :
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', marginBottom: '24px' }}>
                {[
                  { id: 'option1', label: '3 000€ par mois (objectif solide pour commencer)' },
                  { id: 'option2', label: '5 000€ par mois (ambitieux mais atteignable)' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setRealisticChoice(opt.id)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '14px 20px', borderRadius: '100px',
                      border: realisticChoice === opt.id ? '2px solid #1a1a1a' : '1px solid #e5e5e5',
                      background: realisticChoice === opt.id ? '#f5f5f5' : '#fff',
                      fontSize: '15px', fontWeight: realisticChoice === opt.id ? 600 : 400,
                      fontFamily: "'Inter', sans-serif", color: '#1a1a1a', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowWarning(false)}
                  style={{
                    background: '#fff', border: '1px solid #e5e5e5', borderRadius: '100px',
                    padding: '14px 20px', fontSize: '14px', fontWeight: 500,
                    fontFamily: "'Inter', sans-serif", color: '#888', cursor: 'pointer',
                  }}
                >
                  Retour
                </button>
                <div style={{
                  display: 'inline-flex', background: '#f8f8f8', borderRadius: '100px',
                  padding: '6px', border: '1px solid #e5e5e5',
                }}>
                  <button
                    onClick={handleRealisticChoice}
                    disabled={!realisticChoice || isSaving}
                    style={{
                      background: !realisticChoice ? '#ccc' : '#1a1a1a', color: '#fff', border: 'none',
                      padding: '14px 28px', borderRadius: '100px',
                      fontSize: '15px', fontWeight: 600, fontFamily: "'Inter', sans-serif",
                      cursor: !realisticChoice ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Valider mon choix'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
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