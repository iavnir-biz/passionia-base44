import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, Globe, TrendingUp, Package } from 'lucide-react';
import OfferTransition from '@/components/offer/OfferTransition';

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  return parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
}

function ProgressBarItem({ label, value, icon: Icon, explanation, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      style={{ marginBottom: '20px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon style={{ width: '16px', height: '16px', color: '#1a1a1a' }} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>{label}</span>
        </div>
        <span style={{
          fontSize: '14px', fontWeight: 700,
          background: 'linear-gradient(135deg, #f97316, #ec4899)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>{value}%</span>
      </div>
      {explanation && (
        <p style={{ fontSize: '12px', color: '#888', marginLeft: '42px', marginBottom: '8px', lineHeight: 1.5 }}>{explanation}</p>
      )}
      <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '100px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
          style={{ height: '100%', borderRadius: '100px', background: 'linear-gradient(90deg, #f97316, #ec4899, #a78bfa)' }}
        />
      </div>
    </motion.div>
  );
}

export default function BonneNouvelle() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [marketAnalysis, setMarketAnalysis] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => { loadSession(); }, []);

  const loadSession = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

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

      const currentSession = sessions[0];
      setSession(currentSession);

      if (currentSession.market_validation) {
        setMarketAnalysis({
          validationText: currentSession.market_validation,
          marketScores: currentSession.market_validation_scores || {},
          sources: currentSession.market_validation_sources || {},
          summary: currentSession.onboarding_summary || {}
        });
        setIsLoading(false);
      } else {
        setIsLoading(false);
        generateMarketAnalysis(currentUser.sessionId, currentSession);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      setIsLoading(false);
    }
  };

  const generateMarketAnalysis = async (sessionId, currentSession) => {
    if (!sessionId) return;
    setIsGenerating(true);
    try {
      const summary = currentSession?.onboarding_summary || {};
      const { data } = await base44.functions.invoke('generateMarketValidation', { sessionId });

      if (data.success) {
        setMarketAnalysis({
          validationText: data.marketValidation,
          marketScores: data.marketScores || {},
          sources: data.sources || {},
          summary
        });
      }
    } catch (error) {
      console.error('Error generating analysis:', error);
      const summary = currentSession?.onboarding_summary || {};
      setMarketAnalysis({
        validationText: `${user?.firstName || ''}, les personnes que tu veux aider font face à un blocage réel. Ce problème les empêche de progresser efficacement.\n\nCe que tu proposes répond directement à ce blocage : un résultat rapide dès le départ, puis une transformation durable. Cette progression claire crée une valeur perçue forte.\n\nTon objectif de revenus est cohérent avec les formats que tu as choisis et le niveau de transformation que tu apportes.`,
        marketScores: { marketSize: 68, demandIntensity: 74, revenueRecurrence: 70 },
        summary
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = () => setShowTransition(true);

  if (isLoading || isGenerating) {
    return <OfferTransition message={isGenerating ? "Noah analyse le marché..." : "Chargement..."} />;
  }

  if (showTransition) {
    return <OfferTransition message="Noah prépare ta vision future..." onComplete={() => navigate(createPageUrl('OfferTaVieFuture'))} />;
  }

  const scores = marketAnalysis?.marketScores || {};

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div className="relative">
        {/* Neon circles */}
        <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', top: '5%', right: '-5%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)', bottom: '10%', left: '-5%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)', top: '40%', left: '50%', transform: 'translateX(-50%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div className="max-w-3xl mx-auto px-4 relative z-10" style={{ paddingTop: '80px', paddingBottom: '80px' }}>

          {/* Hero Title — Landing style */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#f5f5f5', border: '1px solid #e8e8e8', borderRadius: '100px',
              padding: '6px 16px', fontSize: '13px', color: '#666', marginBottom: '32px'
            }}>
              <span style={{ fontSize: '16px' }}>🎉</span>
              Analyse de marché terminée
            </div>

            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#1a1a1a',
              marginBottom: '16px'
            }}>
              Ton marché est <span style={{
                fontStyle: 'italic',
                fontWeight: 500,
                background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>réel et viable</span>
            </h1>

            <p style={{ fontSize: '17px', color: '#888', lineHeight: 1.6, maxWidth: '550px', margin: '0 auto 40px' }}>
              Noah a analysé ton expertise et ton audience. Voici ce que ça donne.
            </p>

            {/* Top CTA */}
            <button
              onClick={handleContinue}
              style={{
                background: '#1a1a1a', color: '#fff', border: 'none',
                padding: '14px 32px', borderRadius: '100px', fontSize: '15px',
                fontWeight: 600, cursor: 'pointer', display: 'inline-flex',
                alignItems: 'center', gap: '8px', transition: 'opacity 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              Voir ma vie future <ArrowRight size={16} />
            </button>
          </div>

          {/* Validation Text Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: '#fff', border: '1px solid #e5e5e5', borderRadius: '20px',
              padding: '32px', marginBottom: '24px'
            }}
          >
            <div style={{ color: '#444', fontSize: '15px', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {marketAnalysis?.validationText || 'Analyse en cours...'}
            </div>
          </motion.div>

          {/* Market Potential Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: '#fff', border: '1px solid #e5e5e5', borderRadius: '20px',
              padding: '32px', marginBottom: '24px'
            }}
          >
            <h2 style={{
              fontSize: 'clamp(20px, 3vw, 28px)',
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              color: '#1a1a1a',
              marginBottom: '28px'
            }}>
              Ton <span style={{
                fontStyle: 'italic',
                fontWeight: 500,
                background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>potentiel</span> sur ce marché
            </h2>

            <ProgressBarItem
              label="Potentiel du marché"
              value={scores.marketSize || 75}
              explanation="Taille et accessibilité de l'audience pour ton offre."
              icon={Globe}
              delay={0}
            />
            <ProgressBarItem
              label="Évolution récente"
              value={scores.demandIntensity || 78}
              explanation="Croissance de l'intérêt sur les 12 derniers mois."
              icon={TrendingUp}
              delay={0.1}
            />
            <ProgressBarItem
              label="Potentiel de monétisation"
              value={scores.revenueRecurrence || 80}
              explanation="Capacité à générer des revenus stables avec les bons formats."
              icon={Package}
              delay={0.2}
            />
          </motion.div>

          {/* Conclusion quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: '#1a1a1a', borderRadius: '20px', padding: '32px',
              textAlign: 'center', marginBottom: '40px'
            }}
          >
            <p style={{
              fontSize: '17px', fontWeight: 500, lineHeight: 1.6,
              background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Tu n'essaies pas de créer un marché. Tu arrives sur un marché qui existe déjà.
            </p>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ textAlign: 'center' }}
          >
            <button
              onClick={handleContinue}
              style={{
                background: '#1a1a1a', color: '#fff', border: 'none',
                padding: '16px 36px', borderRadius: '100px', fontSize: '15px',
                fontWeight: 600, cursor: 'pointer', display: 'inline-flex',
                alignItems: 'center', gap: '8px', transition: 'opacity 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              Voir ma vie future <ArrowRight size={16} />
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}