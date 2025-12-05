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
  ArrowRight
} from 'lucide-react';
import OfferBuilderLayout from '@/components/onboarding/OfferBuilderLayout';
import GlowButton from '@/components/ui/GlowButton';

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

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    navigate(createPageUrl('Results'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#11112b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
      </div>
    );
  }

  const offer = user?.offer || {};
  const products = [
    { 
      key: 'product_principal', 
      label: 'Produit Principal', 
      data: offer.product_principal,
      multiplier: 30,
      conversionLabel: '1 vente/jour × 30 jours'
    },
    { 
      key: 'petit_extra', 
      label: 'Petit Extra (Order Bump)', 
      data: offer.petit_extra,
      multiplier: 15,
      conversionLabel: '50% conversion × 30 jours'
    },
    { 
      key: 'offre_superieure', 
      label: 'Offre Supérieure (Upsell)', 
      data: offer.offre_superieure,
      multiplier: 9,
      conversionLabel: '30% conversion × 30 jours'
    },
    { 
      key: 'offre_premium', 
      label: 'Offre Premium', 
      data: offer.offre_premium,
      multiplier: 1,
      conversionLabel: '3% conversion × 30 jours'
    }
  ];

  // Calculate revenues
  const revenues = products.map(p => ({
    ...p,
    price: parsePrice(p.data?.price),
    total: parsePrice(p.data?.price) * p.multiplier
  }));

  const totalMonthly = revenues.reduce((sum, r) => sum + r.total, 0);

  return (
    <OfferBuilderLayout currentStep={5}>
      <div className="max-w-3xl mx-auto px-4">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-3">
            📋 Résumé de ton offre
          </h1>
          <p className="text-gray-400">
            Voici la gamme complète que tu as construite pour ton activité.
          </p>
        </motion.div>

        {/* Products Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1b1b33] rounded-2xl border border-[#2a2a45] p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-[#61f7a2]" />
            Tes 4 produits sélectionnés
          </h2>
          
          <div className="space-y-4">
            {products.map((product, index) => {
              const Icon = iconMap[product.data?.id] || FileText;
              
              return (
                <div 
                  key={product.key}
                  className="flex items-start gap-4 p-4 bg-[#11112b] rounded-xl border border-[#2a2a45]"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#61f7a2]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#61f7a2]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[#61f7a2] font-medium uppercase tracking-wide">
                        {product.label}
                      </span>
                      <div className="w-4 h-4 rounded-full bg-[#61f7a2] flex items-center justify-center">
                        <Check className="w-3 h-3 text-[#11112b]" />
                      </div>
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-1 truncate">
                      {product.data?.title || 'Non sélectionné'}
                    </h3>
                    <p className="text-gray-500 text-xs">
                      {product.data?.badge || '—'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xl font-bold text-[#61f7a2]">
                      {product.data?.price || '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Revenue Calculation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#61f7a2]/10 to-[#1b1b33] rounded-2xl border border-[#61f7a2]/30 p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#61f7a2] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#11112b]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Ton Potentiel de Revenus Mensuels
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
            className="w-full flex items-center justify-center gap-2 py-3 text-[#61f7a2] hover:text-white transition-colors"
          >
            {showDetail ? (
              <>
                Cacher le détail <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Afficher le détail <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Detail Breakdown */}
          {showDetail && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-[#2a2a45] pt-4 mt-2 space-y-3"
            >
              {revenues.map((rev) => (
                <div 
                  key={rev.key}
                  className="flex items-center justify-between py-2 px-3 bg-[#11112b]/50 rounded-lg"
                >
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
              ))}
              
              <div className="flex items-center justify-between py-3 px-3 bg-[#61f7a2]/10 rounded-lg border border-[#61f7a2]/30">
                <span className="text-white font-bold">Total Mensuel</span>
                <span className="text-[#61f7a2] font-bold text-xl">
                  {totalMonthly.toLocaleString('fr-FR')} €
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <GlowButton
            onClick={handleContinue}
            size="lg"
            className="px-12"
          >
            Continuer
            <ArrowRight className="w-5 h-5 ml-2" />
          </GlowButton>
        </motion.div>
      </div>
    </OfferBuilderLayout>
  );
}