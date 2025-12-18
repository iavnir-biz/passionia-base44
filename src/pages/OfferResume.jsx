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
  ArrowRight } from
'lucide-react';
import OfferBuilderLayout from '@/components/onboarding/OfferBuilderLayout';
import GlowButton from '@/components/ui/GlowButton';
import OfferDetailCard from '@/components/offer/OfferDetailCard';

const iconMap = {
  'mini-formation': Video,
  'ebook': FileText,
  'modeles': Layers,
  'checklist': CheckSquare,
  'atelier': Presentation,
  'formation-complete': GraduationCap,
  'coaching': Star,
  'mentorat': Users
};

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

export default function OfferResume() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      if (currentUser.sessionId) {
        setSessionId(currentUser.sessionId);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    navigate(createPageUrl('BonneNouvelle'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#11112b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
      </div>);

  }

  const offer = user?.offer || {};
  const products = [
  {
    key: 'product_principal',
    offerType: 'low',
    label: 'Produit d\'appel (Low ticket)',
    data: offer.product_principal,
    multiplier: 30,
    conversionLabel: '1 vente/jour × 30 jours'
  },
  {
    key: 'petit_extra',
    offerType: 'bump',
    label: 'Vente additionnelle (Order bump)',
    data: offer.petit_extra,
    multiplier: 15,
    conversionLabel: '50% conversion × 30 jours'
  },
  {
    key: 'offre_superieure',
    offerType: 'mid',
    label: 'Offre intermédiaire (Mid ticket)',
    data: offer.offre_superieure,
    multiplier: 9,
    conversionLabel: '30% conversion × 30 jours'
  },
  {
    key: 'offre_premium',
    offerType: 'high',
    label: 'Offre premium (High ticket)',
    data: offer.offre_premium,
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
    <OfferBuilderLayout currentStep={5}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8">

          <h1 className="text-slate-950 mb-3 text-3xl font-bold">📋 Résumé de ton offre

          </h1>
          <p className="text-gray-400">
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
            className="px-12">

            Découvrir si mon marché est validé
            <ArrowRight className="w-5 h-5 ml-2" />
          </GlowButton>
        </motion.div>

        {/* Products Summary - Vertical */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6">

          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Check className="w-6 h-6 text-[#61f7a2]" />
            Tes 4 offres complètes
          </h2>
          
          <div className="space-y-4">
            {products.map((product, index) => {
              if (!product.data) return null;
              
              const Icon = iconMap[product.data?.productType] || Video;
              
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
                  className={`${scheme.bg} ${scheme.border} border rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-md`}
                >
                  {/* Icon avec couleur flash */}
                  <div className="flex-shrink-0">
                    <div className={`w-14 h-14 rounded-2xl ${scheme.iconBg} shadow-lg flex items-center justify-center`}>
                      <Icon className={`w-7 h-7 ${scheme.iconColor}`} />
                    </div>
                  </div>
                  
                  {/* Title & Subtitle */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{product.label}</h3>
                    <p className="text-sm text-gray-600">{product.data?.title || 'Non défini'}</p>
                  </div>
                  
                  {/* Price */}
                  <div className="flex-shrink-0">
                    <span className="text-2xl font-bold text-gray-900">{product.data?.price || '—'}</span>
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
          transition={{ delay: 0.2 }} className="bg-[#11112b] text-black mb-8 p-6 rounded-2xl from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">


          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#61f7a2] rounded-lg w-10 h-10 flex items-center justify-center backdrop-blur-sm">
              <TrendingUp className="w-5 h-5 text-[#11112b]" />
            </div>
            <div>
              <h2 className="text-[#61f7a2] text-lg font-bold">Ton Potentiel de Revenus Mensuels

              </h2>
              <p className="text-gray-400 text-sm">
                Basé sur une hypothèse d'une vente par jour
              </p>
            </div>
          </div>

          {/* Big Number */}
          <div className="text-center py-6">
            <span className="text-5xl md:text-6xl font-bold text-[#61f7a2]">
              {totalMonthly.toLocaleString('fr-FR')} €
            </span>
            <p className="text-gray-400 mt-2">par mois</p>
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
            className="px-12">

            Voir si mon marché est validé
            <ArrowRight className="w-5 h-5 ml-2" />
          </GlowButton>
        </motion.div>
      </div>
    </OfferBuilderLayout>);

}