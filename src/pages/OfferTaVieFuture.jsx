import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, Sparkles, Target, CheckCircle } from 'lucide-react';
import OfferTransition from '@/components/offer/OfferTransition';

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  return parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
}

export default function OfferTaVieFuture() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [futureVision, setFutureVision] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => { loadSession(); }, []);

  useEffect(() => {
    if (session && !futureVision) generateFutureVision();
  }, [session, futureVision]);

  const PRODUCT_CONFIG = [
    { key: 'mainProduct', multiplier: 30 },
    { key: 'orderBump', multiplier: 15 },
    { key: 'upsell1', multiplier: 9 },
    { key: 'upsell3', multiplier: 1 }
  ];

  const loadSession = async () => {
    try {
      const currentUser = await base44.auth.me();
      const realSessionId = localStorage.getItem('passionia_active_session_id') || currentUser.sessionId;

      if (!realSessionId) {
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      const sessions = await base44.entities.Session.filter({ id: realSessionId });
      if (!sessions || sessions.length === 0) {
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      const loadedSession = sessions[0];

      // If no finalized offer at all, go back
      if (!loadedSession.finalized_offer || Object.keys(loadedSession.finalized_offer).length === 0) {
        navigate(createPageUrl('OfferResume'));
        return;
      }

      // Auto-fix missing potential_revenue / is_offer_complete
      if (!loadedSession.potential_revenue || !loadedSession.is_offer_complete) {
        const totalMonthly = PRODUCT_CONFIG.reduce((sum, p) => {
          const price = parsePrice(loadedSession.finalized_offer[p.key]?.price);
          return sum + price * p.multiplier;
        }, 0);

        await base44.entities.Session.update(loadedSession.id, {
          potential_revenue: totalMonthly,
          is_offer_complete: true
        });
        loadedSession.potential_revenue = totalMonthly;
        loadedSession.is_offer_complete = true;
      }

      setSession(loadedSession);
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFutureVision = async () => {
    if (!session?.id) return;
    setIsGenerating(true);
    try {
      const { data } = await base44.functions.invoke('generateFutureVision', { sessionId: session.id });
      if (data.success) {
        setFutureVision({ narrativeText: data.narrativeText });
      }
    } catch (error) {
      console.error('Error generating vision:', error);
      const skill = session.skill || session.onboarding_summary?.who_to_teach || 'ta compétence';
      setFutureVision({
        narrativeText: `Imagine-toi, dans quelques mois… Tu te réveilles le matin en sachant que des dizaines de personnes comptent sur toi pour progresser en ${skill}.\n\nTu as réussi à structurer ton savoir-faire en une offre claire, accessible, et qui résonne avec ton audience. Chaque jour, de nouvelles personnes découvrent ton travail et décident de te faire confiance.\n\nTu n'es plus seul(e) à avancer. Ta communauté grandit, tes témoignages s'accumulent, et tu ressens cette fierté profonde d'avoir osé franchir le pas.\n\nCette vie, elle t'attend. Il te suffit maintenant de passer à l'action, étape par étape.`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = () => setShowTransition(true);

  if (isLoading || isGenerating) {
    return <OfferTransition message={isGenerating ? "Noah écrit ta vision future..." : "Chargement..."} />;
  }

  if (showTransition) {
    return <OfferTransition message="Noah prépare ton plan de route..." onComplete={() => navigate(createPageUrl('CTAPAYWALL'))} />;
  }

  const finalizedOffer = session?.finalized_offer || {};
  const potentialRevenue = session?.potential_revenue || 0;

  const products = [
    { key: 'mainProduct', label: 'Produit Principal', data: finalizedOffer.mainProduct, multiplier: 30 },
    { key: 'orderBump', label: 'Order Bump', data: finalizedOffer.orderBump, multiplier: 15 },
    { key: 'upsell1', label: 'Upsell', data: finalizedOffer.upsell1, multiplier: 9 },
    { key: 'upsell3', label: 'Premium', data: finalizedOffer.upsell3, multiplier: 1 }
  ].filter(p => p.data);

  const revenues = products.map(p => ({
    ...p,
    price: parsePrice(p.data?.price),
    total: parsePrice(p.data?.price) * p.multiplier
  }));

  const revenueGoal = parseInt(session?.onboarding_full?.targetIncome) || 500;
  const multiplier = potentialRevenue > 0 ? revenueGoal / potentialRevenue : 1;

  const salesNeeded = revenues.map(r => {
    if (r.price === 0) return { ...r, salesNeeded: 0, projectedRevenue: 0 };
    const targetSales = Math.ceil(r.multiplier * multiplier);
    const projectedRevenue = targetSales * r.price;
    return { ...r, salesNeeded: targetSales, projectedRevenue };
  });

  const totalProjected = salesNeeded.reduce((sum, item) => sum + item.projectedRevenue, 0);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div className="relative">
        {/* Neon circles */}
        <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', top: '5%', right: '-5%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)', bottom: '10%', left: '-5%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)', top: '40%', left: '50%', transform: 'translateX(-50%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div className="max-w-3xl mx-auto px-4 relative z-10" style={{ paddingTop: '80px', paddingBottom: '80px' }}>

          {/* Hero Title */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#f5f5f5', border: '1px solid #e8e8e8', borderRadius: '100px',
              padding: '6px 16px', fontSize: '13px', color: '#666', marginBottom: '32px'
            }}>
              <span style={{ fontSize: '16px' }}>✨</span>
              Vision personnalisée
            </div>

            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#1a1a1a',
              marginBottom: '16px'
            }}>
              Voici ce que ta <span style={{
                fontStyle: 'italic',
                fontWeight: 500,
                background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>vie future</span> te réserve
            </h1>

            <p style={{ fontSize: '17px', color: '#888', lineHeight: 1.6, maxWidth: '550px', margin: '0 auto 40px' }}>
              Une projection inspirante basée sur ton parcours et tes offres.
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
              Voir le plan concret <ArrowRight size={16} />
            </button>
          </div>

          {/* Narrative Vision Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: '#fff', border: '1px solid #e5e5e5', borderRadius: '20px',
              padding: '32px', marginBottom: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Sparkles style={{ width: '20px', height: '20px', color: '#fff' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
                  Ta vision personnalisée
                </h2>
                <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
                  Basée sur ton profil et tes choix
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {futureVision?.narrativeText.split('\n\n').map((paragraph, idx) => (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  style={{ color: '#444', fontSize: '15px', lineHeight: 1.8, margin: 0 }}
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>
          </motion.div>

          {/* Roadmap Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: '#fff', border: '1px solid #e5e5e5', borderRadius: '20px',
              padding: '32px', marginBottom: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: '#f5f5f5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Target style={{ width: '20px', height: '20px', color: '#1a1a1a' }} />
              </div>
              <h2 style={{
                fontSize: 'clamp(18px, 3vw, 24px)',
                fontWeight: 400,
                letterSpacing: '-0.02em',
                color: '#1a1a1a',
                margin: 0
              }}>
                Ton <span style={{
                  fontStyle: 'italic',
                  fontWeight: 500,
                  background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>plan de route</span>
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px', marginLeft: '52px' }}>
              Scénario indicatif pour atteindre {revenueGoal.toLocaleString('fr-FR')}€/mois
              {totalProjected > 0 && (
                <span style={{ display: 'block', marginTop: '4px', fontWeight: 600, background: 'linear-gradient(135deg, #f97316, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  → Projection totale : {totalProjected.toLocaleString('fr-FR')}€/mois
                </span>
              )}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {salesNeeded.map((item, idx) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px', background: '#f8f8f8', borderRadius: '14px',
                    border: '1px solid #e5e5e5'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', display: 'block' }}>{item.label}</span>
                    <span style={{ fontSize: '12px', color: '#888' }}>{item.price}€ par vente</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <CheckCircle style={{ width: '18px', height: '18px', color: '#f97316' }} />
                    <span style={{
                      fontWeight: 700, fontSize: '16px',
                      background: 'linear-gradient(135deg, #f97316, #ec4899)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                      {item.salesNeeded} ventes
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Tip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              style={{
                marginTop: '20px', padding: '16px 20px',
                background: '#f8f8f8', borderRadius: '14px', border: '1px solid #e5e5e5',
                textAlign: 'center'
              }}
            >
              <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6, margin: 0 }}>
                💡 <strong style={{ color: '#1a1a1a' }}>Astuce :</strong> Commence par ton Produit Principal pour valider le marché, puis ajoute progressivement les autres offres.
              </p>
            </motion.div>
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
              fontSize: '17px', fontWeight: 500, lineHeight: 1.6, margin: 0,
              background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Cette vie t'attend. Il te suffit maintenant de passer à l'action, étape par étape.
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
              Voir le plan concret <ArrowRight size={16} />
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}