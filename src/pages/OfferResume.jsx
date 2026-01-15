import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Loader2,
  Check,
  Video,
  FileText,
  Layers,
  CheckSquare,
  Presentation,
  GraduationCap,
  Star,
  Users,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Zap,
  Award,
  Crown,
  Gift,
  Target,
  Lightbulb,
  MessageSquare,
  Calendar,
  Package
} from
  'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import OfferDetailCard from '@/components/offer/OfferDetailCard';
import OfferTransition from '@/components/offer/OfferTransition';
import OfferSidebar from '@/components/onboarding/OfferSidebar';

// Function to get icon based on offer content
const getProductIcon = (offer) => {
  if (!offer) return Package;

  const titleLower = (offer.title || '').toLowerCase();
  const descLower = (offer.description || '').toLowerCase();
  const badgeLower = (offer.badge || '').toLowerCase();
  const resultLower = (offer.result || offer.outcome || '').toLowerCase();

  // Combine all text for better detection
  const allText = `${titleLower} ${descLower} ${badgeLower} ${resultLower}`.toLowerCase();

  // Retraite / Séjour / Présentiel
  if (allText.includes('retraite') || allText.includes('séjour') ||
    allText.includes('présentiel') || allText.includes('weekend') ||
    allText.includes('immersion')) {
    return Star;
  }

  // Coaching / Mentorat / Accompagnement
  if (allText.includes('coaching') || allText.includes('mentorat') ||
    allText.includes('accompagnement') || allText.includes('suivi personnalisé') ||
    allText.includes('appels privés')) {
    return Star;
  }

  // VIP / Premium / Masterclass
  if (allText.includes('vip') || allText.includes('premium') ||
    allText.includes('masterclass') || allText.includes('élite')) {
    return Crown;
  }

  // Programme / Formation complète
  if (allText.includes('programme') || allText.includes('formation complète') ||
    allText.includes('parcours complet') || allText.includes('cursus')) {
    return GraduationCap;
  }

  // Mini-formation / Cours vidéo
  if (allText.includes('mini-formation') || allText.includes('mini formation') ||
    allText.includes('cours vidéo') || allText.includes('modules vidéo') ||
    allText.includes('vidéos')) {
    return Video;
  }

  // Ebook / Guide / PDF
  if (allText.includes('ebook') || allText.includes('e-book') ||
    allText.includes('guide') || allText.includes('pdf') ||
    allText.includes('livre')) {
    return BookOpen;
  }

  // Checklist / Template / Modèles
  if (allText.includes('checklist') || allText.includes('check-list') ||
    allText.includes('template') || allText.includes('modèle') ||
    allText.includes('kit') || allText.includes('ressource')) {
    return CheckSquare;
  }

  // Atelier / Workshop / Live
  if (allText.includes('atelier') || allText.includes('workshop') ||
    allText.includes('live') || allText.includes('webinaire') ||
    allText.includes('session live')) {
    return Presentation;
  }

  // Consultation / Appel stratégique
  if (allText.includes('consultation') || allText.includes('appel') ||
    allText.includes('session') || allText.includes('diagnostic')) {
    return MessageSquare;
  }

  // Communauté / Groupe / Accès
  if (allText.includes('communauté') || allText.includes('groupe') ||
    allText.includes('réseau') || allText.includes('club')) {
    return Users;
  }

  // Bonus / Cadeau
  if (allText.includes('bonus') || allText.includes('cadeau') ||
    allText.includes('offert') || allText.includes('gratuit')) {
    return Gift;
  }

  // Calendrier / Planning
  if (allText.includes('calendrier') || allText.includes('planning') ||
    allText.includes('suivi') || allText.includes('rendez-vous')) {
    return Calendar;
  }

  // Idée / Conseil / Tips
  if (allText.includes('idée') || allText.includes('astuce') ||
    allText.includes('conseil') || allText.includes('tips')) {
    return Lightbulb;
  }

  // Challenge / Action
  if (allText.includes('challenge') || allText.includes('défi') ||
    allText.includes('action') || allText.includes('exercice')) {
    return Target;
  }

  // Default
  return Package;
};

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

export default function OfferResume() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (!currentUser.sessionId) {
        console.error('❌ [OfferResume] No sessionId');
        return;
      }

      const sessions = await base44.entities.Session.filter({ id: currentUser.sessionId });

      if (!sessions || sessions.length === 0) {
        console.error('❌ [OfferResume] Session not found');
        return;
      }

      setSession(sessions[0]);

      console.log('📊 [OfferResume] Session loaded:', {
        hasOfferGeneration: !!sessions[0].offer_generation,
        hasFinalizedOffer: !!sessions[0].finalized_offer,
        finalizedKeys: Object.keys(sessions[0].finalized_offer || {})
      });

    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await base44.functions.invoke('generateFullStackOffer', {
        sessionId: session.id
      });
      // Reload session
      await loadUser();
    } catch (error) {
      console.error('Error regenerating:', error);
      alert('Erreur lors de la régénération. Réessaye.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleContinue = () => {
    setShowTransition(true);
  };

  const handleTransitionComplete = () => {
    navigate(createPageUrl('BonneNouvelle'));
  };

  if (isLoading) {
    return <OfferTransition message="Chargement de ton offre..." />;
  }

  if (showTransition) {
    return <OfferTransition message="Noah analyse ton offre..." onComplete={handleTransitionComplete} />;
  }

  // 🔥 FALLBACK : si pas d'offres générées
  if (!session?.finalized_offer || Object.keys(session.finalized_offer).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Offres non générées</h2>
          <p className="text-gray-600 mb-6">
            Une erreur s'est produite lors de la génération de tes offres.
          </p>
          <GlowButton
            onClick={handleRegenerate}
            disabled={regenerating}
            loading={regenerating}
            size="lg"
          >
            {regenerating ? 'Regénération...' : 'Regénérer mes offres'}
          </GlowButton>
        </div>
      </div>
    );
  }

  const finalizedOffer = session.finalized_offer || {};
  const products = [
    {
      key: 'mainProduct',
      offerType: 'low',
      label: 'Produit d\'appel (Low ticket)',
      data: finalizedOffer.mainProduct,
      multiplier: 30,
      conversionLabel: '1 vente/jour × 30 jours'
    },
    {
      key: 'orderBump',
      offerType: 'bump',
      label: 'Vente additionnelle (Order bump)',
      data: finalizedOffer.orderBump,
      multiplier: 15,
      conversionLabel: '50% conversion × 30 jours'
    },
    {
      key: 'upsell1',
      offerType: 'mid',
      label: 'Offre intermédiaire (Mid ticket)',
      data: finalizedOffer.upsell1,
      multiplier: 9,
      conversionLabel: '30% conversion × 30 jours'
    },
    {
      key: 'upsell3',
      offerType: 'high',
      label: 'Offre premium (High ticket)',
      data: finalizedOffer.upsell3,
      multiplier: 1,
      conversionLabel: '3% conversion × 30 jours'
    }];


  // Calculate revenues
  const revenues = products.map((p) => ({
    ...p,
    price: parsePrice(p.data?.price),
    total: parsePrice(p.data?.price) * p.multiplier
  }));

  const totalMonthly = revenues.reduce((sum, r) => sum + r.total, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <OfferSidebar currentStep={5} />

      <div className="ml-0 lg:ml-72 pt-40 md:pt-32 lg:pt-12 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 md:mb-12">

            <h1 className="text-slate-950 mb-3 text-2xl md:text-3xl font-bold">📋 Résumé de ton offre</h1>
            <p className="text-gray-400 text-sm md:text-base">
              Voici la gamme complète que tu as construite pour ton activité.
            </p>
          </motion.div>

          {/* CTA Button Top */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex justify-center mb-12">

            <GlowButton
              onClick={handleContinue}
              size="lg"
              className="w-full md:w-auto px-6 md:px-12 text-sm md:text-base">
              Découvrir si mon marché est validé
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
            </GlowButton>
          </motion.div>

          {/* Products Summary - Vertical */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6">

            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Check className="w-5 h-5 md:w-6 md:h-6 text-[#61f7a2]" />
              Tes 4 offres complètes
            </h2>

            <div className="space-y-4">
              {products.map((product, index) => {
                if (!product.data) return null;

                const Icon = getProductIcon(product.data);

                // Couleurs flash par type d'offre
                const colorSchemes = {
                  0: { bg: 'bg-blue-50', border: 'border-blue-200', iconBg: 'bg-blue-500', iconColor: 'text-white' },
                  1: { bg: 'bg-green-50', border: 'border-green-200', iconBg: 'bg-green-500', iconColor: 'text-white' },
                  2: { bg: 'bg-purple-50', border: 'border-purple-200', iconBg: 'bg-purple-500', iconColor: 'text-white' },
                  3: { bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-500', iconColor: 'text-white' }
                };

                const scheme = colorSchemes[index];

                return (
                  <div
                    key={product.key}
                    className={`${scheme.bg} ${scheme.border} border rounded-2xl p-4 md:p-5 flex items-center gap-3 md:gap-4 transition-all hover:shadow-md`}
                  >
                    {/* Icon avec couleur flash */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${scheme.iconBg} shadow-lg flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 md:w-7 md:h-7 ${scheme.iconColor}`} />
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-0.5 md:mb-1 text-sm md:text-base truncate md:whitespace-normal">{product.label}</h3>
                      <p className="text-xs md:text-sm text-gray-600 truncate md:whitespace-normal">{product.data?.title || 'Non défini'}</p>
                    </div>

                    {/* Price */}
                    <div className="flex-shrink-0">
                      <span className="text-lg md:text-2xl font-bold text-gray-900 whitespace-nowrap">{product.data?.price || '—'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Blur Effect - Detail disponible à la fin */}
            <div className="mt-6 relative">
              <div className="blur-sm opacity-40 pointer-events-none bg-white border border-gray-200 rounded-2xl p-6">
                <p className="text-gray-600 text-sm">
                  Contenu détaillé de chaque offre avec descriptions complètes, livrables, et bénéfices...
                </p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-700 font-semibold text-lg px-6 py-3 bg-white/90 rounded-xl shadow-lg">
                  Le détail de vos offres sera disponible à la fin
                </p>
              </div>
            </div>
          </motion.div>

          {/* Revenue Calculation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#11112b] text-white mb-8 p-5 md:p-6 rounded-2xl shadow-lg border border-white/5">


            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#61f7a2] rounded-lg w-10 h-10 flex-shrink-0 flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="w-5 h-5 text-[#11112b]" />
              </div>
              <div>
                <h2 className="text-[#61f7a2] text-base md:text-lg font-bold leading-tight">
                  Ton Potentiel de Revenus Mensuels
                </h2>
                <p className="text-gray-400 text-[10px] md:text-sm">
                  Basé sur une hypothèse d'une vente par jour
                </p>
              </div>
            </div>

            {/* Big Number */}
            <div className="text-center py-4 md:py-6">
              <span className="text-4xl md:text-6xl font-bold text-[#61f7a2] block">
                {totalMonthly.toLocaleString('fr-FR')} €
              </span>
              <p className="text-gray-400 text-sm mt-1">par mois</p>
            </div>

            {/* Toggle Detail */}
            <button
              onClick={() => setShowDetail(!showDetail)}
              className="w-full flex items-center justify-center gap-2 py-3 text-[#61f7a2] hover:text-white transition-colors">

              {showDetail ?
                <>
                  Cacher le détail <ChevronUp className="w-4 h-4" />
                </> :

                <>
                  Afficher le détail <ChevronDown className="w-4 h-4" />
                </>
              }
            </button>

            {/* Detail Breakdown */}
            {showDetail &&
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-[#2a2a45] pt-4 mt-2 space-y-3">

                {revenues.map((rev) =>
                  <div
                    key={rev.key}
                    className="flex items-center justify-between py-2 px-3 bg-[#11112b]/50 rounded-lg">

                    <div>
                      <span className="text-white text-sm font-medium">
                        {rev.label}
                      </span>
                      <p className="text-gray-500 text-xs">
                        {rev.conversionLabel}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[#61f7a2] font-bold">
                        {rev.total.toLocaleString('fr-FR')} €
                      </span>
                      <p className="text-gray-500 text-xs">
                        {rev.price} € × {rev.multiplier}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between py-3 px-3 bg-[#61f7a2]/10 rounded-lg border border-[#61f7a2]/30">
                  <span className="text-white font-bold">Total Mensuel</span>
                  <span className="text-[#61f7a2] text-xl font-bold">
                    {totalMonthly.toLocaleString('fr-FR')} €
                  </span>
                </div>
              </motion.div>
            }
          </motion.div>

          {/* CTA Button Bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center">

            <GlowButton
              onClick={handleContinue}
              size="lg"
              className="w-full md:w-auto px-12">

              Voir si mon marché est validé
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </motion.div>
        </div>
      </div>
    </div >
  );
}