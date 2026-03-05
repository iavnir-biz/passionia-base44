import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Loader2, Check, Video, FileText, Layers, CheckSquare, Presentation,
  GraduationCap, Star, Users, ChevronDown, ChevronUp, TrendingUp,
  ArrowRight, BookOpen, Award, Crown, Gift, Target, Lightbulb,
  MessageSquare, Calendar, Package
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import OfferTransition from '@/components/offer/OfferTransition';
import OfferSidebar from '@/components/onboarding/OfferSidebar';

const getProductIcon = (offer) => {
  if (!offer) return Package;
  const allText = `${offer.title || ''} ${offer.description || ''} ${offer.badge || ''} ${offer.result || offer.outcome || ''}`.toLowerCase();
  if (allText.includes('retraite') || allText.includes('séjour') || allText.includes('présentiel') || allText.includes('immersion')) return Star;
  if (allText.includes('coaching') || allText.includes('mentorat') || allText.includes('accompagnement')) return Star;
  if (allText.includes('vip') || allText.includes('premium') || allText.includes('masterclass')) return Crown;
  if (allText.includes('programme') || allText.includes('formation complète') || allText.includes('parcours')) return GraduationCap;
  if (allText.includes('mini-formation') || allText.includes('cours vidéo') || allText.includes('vidéos')) return Video;
  if (allText.includes('ebook') || allText.includes('guide') || allText.includes('pdf')) return BookOpen;
  if (allText.includes('checklist') || allText.includes('template') || allText.includes('kit')) return CheckSquare;
  if (allText.includes('atelier') || allText.includes('workshop') || allText.includes('live')) return Presentation;
  if (allText.includes('consultation') || allText.includes('appel')) return MessageSquare;
  if (allText.includes('communauté') || allText.includes('groupe')) return Users;
  if (allText.includes('bonus') || allText.includes('cadeau')) return Gift;
  return Package;
};

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  return parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
}

export default function OfferResume() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      const resolvedSessionId = localStorage.getItem('passionia_active_session_id') || currentUser.sessionId;
      if (!resolvedSessionId) return;
      const sessions = await base44.entities.Session.filter({ id: resolvedSessionId });
      if (sessions?.length > 0) setSession(sessions[0]);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await base44.functions.invoke('generateFullStackOffer', { sessionId: session.id });
          break;
        } catch (err) {
          const isRetryable = err.message?.includes('429') || err.message?.includes('overloaded') || err.message?.includes('529');
          if (isRetryable && attempt < 2) { await new Promise(r => setTimeout(r, (attempt + 1) * 3000)); continue; }
          throw err;
        }
      }
      await loadUser();
    } catch (error) {
      console.error('Error regenerating:', error);
    } finally {
      setRegenerating(false);
    }
  };

  const handleContinue = () => setShowTransition(true);
  const handleTransitionComplete = () => navigate(createPageUrl('BonneNouvelle'));

  if (isLoading) return <OfferTransition message="Chargement de ton offre..." />;
  if (showTransition) return <OfferTransition message="Noah analyse ton offre..." onComplete={handleTransitionComplete} />;

  if (!session?.finalized_offer || Object.keys(session.finalized_offer).length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6"
           style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Offres non générées</h2>
          <p className="text-[#888] mb-6">Une erreur s'est produite lors de la génération.</p>
          <GlowButton onClick={handleRegenerate} disabled={regenerating} loading={regenerating} size="lg">
            {regenerating ? 'Regénération...' : 'Regénérer mes offres'}
          </GlowButton>
        </div>
      </div>
    );
  }

  const finalizedOffer = session.finalized_offer || {};
  const products = [
    { key: 'mainProduct', label: 'Produit d\'appel (Low ticket)', data: finalizedOffer.mainProduct, multiplier: 30, conversionLabel: '1 vente/jour × 30 jours' },
    { key: 'orderBump', label: 'Vente additionnelle (Order bump)', data: finalizedOffer.orderBump, multiplier: 15, conversionLabel: '50% conversion × 30 jours' },
    { key: 'upsell1', label: 'Offre intermédiaire (Mid ticket)', data: finalizedOffer.upsell1, multiplier: 9, conversionLabel: '30% conversion × 30 jours' },
    { key: 'upsell3', label: 'Offre premium (High ticket)', data: finalizedOffer.upsell3, multiplier: 1, conversionLabel: '3% conversion × 30 jours' }
  ];

  const revenues = products.map((p) => ({ ...p, price: parsePrice(p.data?.price), total: parsePrice(p.data?.price) * p.multiplier }));
  const totalMonthly = revenues.reduce((sum, r) => sum + r.total, 0);

  const cardColors = [
    { bg: 'bg-blue-50', border: 'border-blue-200', iconBg: 'bg-blue-500' },
    { bg: 'bg-green-50', border: 'border-green-200', iconBg: 'bg-green-500' },
    { bg: 'bg-purple-50', border: 'border-purple-200', iconBg: 'bg-purple-500' },
    { bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-500' }
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <OfferSidebar currentStep={5} />

      <div className="ml-0 lg:ml-72 pt-28 md:pt-24 lg:pt-12 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] mb-2">📋 Résumé de ton offre</h1>
            <p className="text-[#888] text-sm">Voici la gamme complète que tu as construite.</p>
          </motion.div>

          {/* CTA Top */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex justify-center mb-8">
            <GlowButton onClick={handleContinue} size="lg" className="w-full md:w-auto px-8">
              Découvrir si mon marché est validé <ArrowRight className="w-4 h-4 ml-2" />
            </GlowButton>
          </motion.div>

          {/* Info banner */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
            className="mb-6 p-4 bg-[#f8f8f8] border border-[#e5e5e5] rounded-xl flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
                 style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
              <Package className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm text-[#666] leading-relaxed">
              Le <span className="font-semibold text-[#1a1a1a]">détail complet de tes offres</span> t'attend dans ton dashboard disponible à la fin ! 🎯
            </p>
          </motion.div>

          {/* Products */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-[#1a1a1a]" /> Tes 4 offres complètes
            </h2>
            <div className="space-y-3">
              {products.map((product, index) => {
                if (!product.data) return null;
                const Icon = getProductIcon(product.data);
                const scheme = cardColors[index];
                return (
                  <div key={product.key} className={`${scheme.bg} ${scheme.border} border rounded-xl p-4 flex items-center gap-3 transition-all hover:shadow-sm`}>
                    <div className={`w-11 h-11 rounded-xl ${scheme.iconBg} shadow flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#1a1a1a] mb-0.5 text-sm truncate md:whitespace-normal">{product.label}</h3>
                      <p className="text-xs text-[#888] truncate md:whitespace-normal">{product.data?.title || 'Non défini'}</p>
                    </div>
                    <span className="text-lg md:text-xl font-bold text-[#1a1a1a] whitespace-nowrap flex-shrink-0">{product.data?.price || '—'}</span>
                  </div>
                );
              })}
            </div>

            {/* Blur teaser */}
            <div className="mt-6 relative">
              <div className="blur-sm opacity-40 pointer-events-none bg-[#f8f8f8] border border-[#e5e5e5] rounded-xl p-6">
                <p className="text-[#888] text-sm">Contenu détaillé de chaque offre avec descriptions complètes...</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-[#1a1a1a] font-semibold text-sm px-5 py-2.5 bg-white/95 rounded-lg border border-[#e5e5e5] shadow-sm">
                  Le détail sera disponible à la fin
                </p>
              </div>
            </div>
          </motion.div>

          {/* Revenue */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-[#1a1a1a] text-white mb-8 p-5 md:p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white text-base font-bold leading-tight">Ton Potentiel de Revenus Mensuels</h2>
                <p className="text-white/50 text-xs">Basé sur une hypothèse d'une vente par jour</p>
              </div>
            </div>

            <div className="text-center py-4">
              <span className="text-4xl md:text-5xl font-bold block"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {totalMonthly.toLocaleString('fr-FR')} €
              </span>
              <p className="text-white/50 text-sm mt-1">par mois</p>
            </div>

            <button onClick={() => setShowDetail(!showDetail)}
              className="w-full flex items-center justify-center gap-2 py-3 text-white/70 hover:text-white transition-colors text-sm">
              {showDetail ? <>Cacher le détail <ChevronUp className="w-4 h-4" /></> : <>Afficher le détail <ChevronDown className="w-4 h-4" /></>}
            </button>

            {showDetail && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="border-t border-white/10 pt-4 mt-2 space-y-3">
                {revenues.map((rev) => (
                  <div key={rev.key} className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg">
                    <div>
                      <span className="text-white text-sm font-medium">{rev.label}</span>
                      <p className="text-white/40 text-xs">{rev.conversionLabel}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold" style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {rev.total.toLocaleString('fr-FR')} €
                      </span>
                      <p className="text-white/40 text-xs">{rev.price} € × {rev.multiplier}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between py-3 px-3 rounded-lg border border-white/10"
                     style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(236,72,153,0.1))' }}>
                  <span className="text-white font-bold">Total Mensuel</span>
                  <span className="text-xl font-bold"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {totalMonthly.toLocaleString('fr-FR')} €
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* CTA Bottom */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex justify-center">
            <GlowButton onClick={handleContinue} size="lg" className="w-full md:w-auto px-12">
              Voir si mon marché est validé <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </motion.div>
        </div>
      </div>
    </div>
  );
}