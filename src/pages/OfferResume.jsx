import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Video, FileText, CheckSquare, Presentation, GraduationCap, Users,
  ChevronDown, ChevronUp, ArrowRight, BookOpen, Award, Crown, Gift, Package
} from 'lucide-react';
import OfferTransition from '@/components/offer/OfferTransition';
import OfferSidebar from '@/components/onboarding/OfferSidebar';

const getProductIcon = (offer) => {
  if (!offer) return Package;
  const t = `${offer.title || ''} ${offer.description || ''} ${offer.badge || ''} ${offer.result || offer.outcome || ''}`.toLowerCase();
  if (t.includes('coaching') || t.includes('mentorat') || t.includes('accompagnement')) return Users;
  if (t.includes('vip') || t.includes('premium')) return Crown;
  if (t.includes('masterclass') || t.includes('élite')) return Award;
  if (t.includes('formation complète') || t.includes('programme') || t.includes('parcours')) return GraduationCap;
  if (t.includes('vidéo') || t.includes('video') || t.includes('mini-formation')) return Video;
  if (t.includes('ebook') || t.includes('guide') || t.includes('pdf')) return BookOpen;
  if (t.includes('checklist') || t.includes('template') || t.includes('kit')) return CheckSquare;
  if (t.includes('atelier') || t.includes('workshop') || t.includes('live')) return Presentation;
  if (t.includes('bonus') || t.includes('cadeau')) return Gift;
  return Package;
};

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  return parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
}

const PRODUCT_CONFIG = [
  { key: 'mainProduct', label: 'Produit Principal', tag: 'Low ticket', multiplier: 30, conversionLabel: '1 vente/jour × 30j' },
  { key: 'orderBump', label: 'Petit Extra', tag: 'Order bump', multiplier: 15, conversionLabel: '50% conversion × 30j' },
  { key: 'upsell1', label: 'Offre Supérieure', tag: 'Mid ticket', multiplier: 9, conversionLabel: '30% conversion × 30j' },
  { key: 'upsell3', label: 'Offre Premium', tag: 'High ticket', multiplier: 1, conversionLabel: '3% conversion × 30j' }
];

export default function OfferResume() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      const resolvedSessionId = localStorage.getItem('passionia_active_session_id') || currentUser.sessionId;
      if (!resolvedSessionId) return;
      const sessions = await base44.entities.Session.filter({ id: resolvedSessionId });
      if (sessions?.length > 0) {
        const s = sessions[0];
        setSession(s);

        // Auto-save potential_revenue and is_offer_complete if finalized_offer exists but values are missing
        if (s.finalized_offer && Object.keys(s.finalized_offer).length > 0) {
          const revenues = PRODUCT_CONFIG.map((p) => {
            const data = s.finalized_offer[p.key];
            const price = parsePrice(data?.price);
            return price * p.multiplier;
          });
          const totalMonthly = revenues.reduce((sum, r) => sum + r, 0);

          if (!s.is_offer_complete || !s.potential_revenue) {
            await base44.entities.Session.update(s.id, {
              is_offer_complete: true,
              potential_revenue: totalMonthly
            });
            setSession({ ...s, is_offer_complete: true, potential_revenue: totalMonthly });
          }
        }
      }
    } catch (error) { console.error('Error loading user:', error); }
    finally { setIsLoading(false); }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        try { await base44.functions.invoke('generateFullStackOffer', { sessionId: session.id }); break; }
        catch (err) {
          const isRetryable = err.message?.includes('429') || err.message?.includes('overloaded') || err.message?.includes('529');
          if (isRetryable && attempt < 2) { await new Promise(r => setTimeout(r, (attempt + 1) * 3000)); continue; }
          throw err;
        }
      }
      await loadUser();
    } catch (error) { console.error('Error regenerating:', error); }
    finally { setRegenerating(false); }
  };

  const handleContinue = () => setShowTransition(true);

  if (isLoading) return null;
  if (showTransition) return <OfferTransition message="Noah analyse ton offre..." onComplete={() => navigate(createPageUrl('BonneNouvelle'))} />;

  if (!session?.finalized_offer || Object.keys(session.finalized_offer).length === 0) {
    return (
      <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <OfferSidebar currentStep={5} />
        <div className="lg:ml-72 pt-24 lg:pt-12 pb-12 flex items-center justify-center min-h-screen">
          <div className="max-w-md text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.02em', color: '#1a1a1a', marginBottom: '12px' }}>
              Offres <span style={{ fontStyle: 'italic', fontWeight: 500, background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>non générées</span>
            </h2>
            <p style={{ fontSize: '15px', color: '#888', marginBottom: '32px' }}>Une erreur s'est produite lors de la génération.</p>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              style={{ background: '#1a1a1a', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '100px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: regenerating ? 0.6 : 1, transition: 'opacity 0.2s' }}
            >
              {regenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Regénération...</> : 'Regénérer mes offres'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const finalizedOffer = session.finalized_offer || {};
  const revenues = PRODUCT_CONFIG.map((p) => {
    const data = finalizedOffer[p.key];
    const price = parsePrice(data?.price);
    return { ...p, data, price, total: price * p.multiplier };
  });
  const totalMonthly = revenues.reduce((sum, r) => sum + r.total, 0);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <OfferSidebar currentStep={5} />

      <div className="lg:ml-72 pt-24 lg:pt-12 pb-16 relative">
        {/* Neon circles — same as other offer pages */}
        <div style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', top: '5%', right: '-5%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)', bottom: '10%', left: '5%', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div className="max-w-3xl mx-auto px-4 relative z-10">

          {/* Title — Landing style */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)',
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#1a1a1a',
              marginBottom: '16px'
            }}>
              Voici ton <span style={{
                fontStyle: 'italic',
                fontWeight: 500,
                background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                paddingRight: '0.3em',
                marginRight: '-0.3em',
                paddingBottom: '0.1em',
                marginBottom: '-0.1em',
              }}>offre complète</span>
            </h1>
            <p style={{ fontSize: '16px', color: '#888', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto' }}>
              La gamme que tu as construite avec Noah, prête à générer tes premiers revenus.
            </p>
          </div>

          {/* 4 Product Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {revenues.map((item, index) => {
              if (!item.data) return null;
              const Icon = getProductIcon(item.data);
              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + index * 0.08 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid #e5e5e5',
                    background: '#fff',
                    transition: 'box-shadow 0.2s',
                  }}
                  className="hover:shadow-md"
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Icon style={{ width: '22px', height: '22px', color: '#1a1a1a' }} strokeWidth={1.5} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: '15px', color: '#1a1a1a' }}>{item.label}</span>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, padding: '2px 10px', borderRadius: '100px',
                        background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)', color: '#fff'
                      }}>
                        {item.tag}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.data?.title || '—'}
                    </p>
                  </div>
                  <span style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {item.data?.price || '—'}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Blur teaser */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ position: 'relative', marginBottom: '40px' }}
          >
            <div style={{
              filter: 'blur(6px)', opacity: 0.3, pointerEvents: 'none', userSelect: 'none',
              background: '#f8f8f8', border: '1px solid #e5e5e5', borderRadius: '16px', padding: '24px'
            }}>
              <p style={{ fontSize: '14px', color: '#888' }}>Contenu détaillé de chaque offre avec descriptions, livrables, résultats attendus et bénéfices pour tes clients…</p>
            </div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{
                fontSize: '13px', fontWeight: 600, color: '#1a1a1a',
                background: 'rgba(255,255,255,0.95)', padding: '8px 20px', borderRadius: '100px',
                border: '1px solid #e5e5e5', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                🔒 Détail disponible dans ton dashboard
              </span>
            </div>
          </motion.div>

          {/* Revenue Card — Dark */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ background: '#1a1a1a', borderRadius: '20px', padding: '32px', marginBottom: '40px' }}
          >
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>
              Potentiel de revenus mensuels
            </p>
            <div style={{ textAlign: 'center', marginBottom: '4px' }}>
              <span style={{
                fontSize: 'clamp(40px, 6vw, 56px)', fontWeight: 700, letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>
                {totalMonthly.toLocaleString('fr-FR')} €
              </span>
            </div>
            <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>
              par mois · hypothèse 1 vente/jour
            </p>

            {/* Toggle */}
            <button
              onClick={() => setShowDetail(!showDetail)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                width: '100%', padding: '12px 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px',
                fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >
              {showDetail ? <>Masquer le détail <ChevronUp size={14} /></> : <>Voir le détail <ChevronDown size={14} /></>}
            </button>

            <AnimatePresence>
              {showDetail && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {revenues.map((rev) => (
                      <div key={rev.key} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)'
                      }}>
                        <div>
                          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}>{rev.label}</span>
                          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: '2px' }}>{rev.conversionLabel}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            fontWeight: 700, fontSize: '14px',
                            background: 'linear-gradient(135deg, #f97316, #ec4899)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                          }}>{rev.total.toLocaleString('fr-FR')} €</span>
                          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: '2px' }}>{rev.price}€ × {rev.multiplier}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* CTA — Landing style pill button */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
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
              Découvrir si mon marché est validé <ArrowRight size={16} />
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}