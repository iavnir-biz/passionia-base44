import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Video, FileText, CheckSquare, Presentation, GraduationCap, Star, Users,
  ChevronDown, ChevronUp, TrendingUp, ArrowRight, BookOpen, Award, Crown, Gift, Target,
  Lightbulb, MessageSquare, Calendar, Package, Layers
} from 'lucide-react';
import OfferTransition from '@/components/offer/OfferTransition';
import OfferSidebar from '@/components/onboarding/OfferSidebar';

const getProductIcon = (offer) => {
  if (!offer) return Package;
  const allText = `${offer.title || ''} ${offer.description || ''} ${offer.badge || ''} ${offer.result || offer.outcome || ''}`.toLowerCase();
  if (allText.includes('coaching') || allText.includes('mentorat') || allText.includes('accompagnement')) return Users;
  if (allText.includes('vip') || allText.includes('premium')) return Crown;
  if (allText.includes('masterclass') || allText.includes('élite')) return Award;
  if (allText.includes('formation complète') || allText.includes('programme') || allText.includes('parcours')) return GraduationCap;
  if (allText.includes('mini-formation') || allText.includes('cours vidéo') || allText.includes('vidéo')) return Video;
  if (allText.includes('ebook') || allText.includes('guide') || allText.includes('pdf')) return BookOpen;
  if (allText.includes('checklist') || allText.includes('template') || allText.includes('kit')) return CheckSquare;
  if (allText.includes('atelier') || allText.includes('workshop') || allText.includes('live')) return Presentation;
  if (allText.includes('bonus') || allText.includes('cadeau')) return Gift;
  return Package;
};

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  return parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
}

const PRODUCT_CONFIG = [
  { key: 'mainProduct', label: 'Produit Principal', tag: 'Low ticket', multiplier: 30, conversionLabel: '1 vente/jour × 30j', color: '#3b82f6' },
  { key: 'orderBump', label: 'Petit Extra', tag: 'Order bump', multiplier: 15, conversionLabel: '50% conversion × 30j', color: '#22c55e' },
  { key: 'upsell1', label: 'Offre Supérieure', tag: 'Mid ticket', multiplier: 9, conversionLabel: '30% conversion × 30j', color: '#8b5cf6' },
  { key: 'upsell3', label: 'Offre Premium', tag: 'High ticket', multiplier: 1, conversionLabel: '3% conversion × 30j', color: '#f59e0b' }
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
      if (sessions?.length > 0) setSession(sessions[0]);
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
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Offres non générées</h2>
            <p className="text-[#888] text-sm mb-8">Une erreur s'est produite lors de la génération de tes offres.</p>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50"
              style={{ background: '#1a1a1a' }}
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

      <div className="lg:ml-72 pt-24 lg:pt-12 pb-12 relative">
        {/* Neon circles */}
        <div style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', top: '5%', right: '-5%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)', bottom: '10%', left: '5%', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div className="max-w-3xl mx-auto px-4 relative z-10">

          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] mb-2">Résumé de ton offre</h2>
            <p className="text-[#888] text-sm max-w-lg mx-auto">Voici la gamme complète que tu as construite.</p>
          </motion.div>

          {/* 4 Product Cards */}
          <div className="space-y-3 mb-8">
            {revenues.map((item, index) => {
              if (!item.data) return null;
              const Icon = getProductIcon(item.data);
              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + index * 0.06 }}
                  className="rounded-xl border border-[#e5e5e5] bg-white p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: item.color }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-[#1a1a1a] text-sm">{item.label}</span>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: `${item.color}15`, color: item.color }}
                      >
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-xs text-[#888] truncate">{item.data?.title || '—'}</p>
                  </div>
                  <span className="text-xl font-bold text-[#1a1a1a] whitespace-nowrap">{item.data?.price || '—'}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Blur teaser */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8 relative"
          >
            <div className="blur-sm opacity-30 pointer-events-none bg-[#f8f8f8] border border-[#e5e5e5] rounded-xl p-6">
              <p className="text-[#888] text-sm">Contenu détaillé de chaque offre avec descriptions, livrables et bénéfices...</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[#1a1a1a] font-semibold text-xs px-4 py-2 bg-white rounded-lg border border-[#e5e5e5] shadow-sm">
                🔒 Détail disponible dans ton dashboard
              </span>
            </div>
          </motion.div>

          {/* Revenue Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 rounded-2xl overflow-hidden"
            style={{ background: '#1a1a1a' }}
          >
            <div className="p-5 md:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm md:text-base">Potentiel de Revenus Mensuels</h3>
                  <p className="text-white/40 text-[10px]">Hypothèse : 1 vente/jour</p>
                </div>
              </div>

              <div className="text-center py-3">
                <span
                  className="text-4xl md:text-5xl font-extrabold"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  {totalMonthly.toLocaleString('fr-FR')} €
                </span>
                <p className="text-white/30 text-xs mt-1">par mois</p>
              </div>

              {/* Toggle detail */}
              <button
                onClick={() => setShowDetail(!showDetail)}
                className="w-full flex items-center justify-center gap-2 pt-4 pb-1 text-white/50 hover:text-white/80 transition-colors text-xs font-medium"
              >
                {showDetail ? <>Masquer le détail <ChevronUp className="w-3.5 h-3.5" /></> : <>Voir le détail <ChevronDown className="w-3.5 h-3.5" /></>}
              </button>

              <AnimatePresence>
                {showDetail && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/10 pt-4 mt-3 space-y-2">
                      {revenues.map((rev) => (
                        <div key={rev.key} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/5">
                          <div>
                            <span className="text-white text-xs font-medium">{rev.label}</span>
                            <p className="text-white/25 text-[10px]">{rev.conversionLabel}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-xs" style={{ color: rev.color }}>{rev.total.toLocaleString('fr-FR')} €</span>
                            <p className="text-white/25 text-[10px]">{rev.price}€ × {rev.multiplier}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <button
              onClick={handleContinue}
              className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-10 py-4 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: '#1a1a1a' }}
            >
              Découvrir si mon marché est validé
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}