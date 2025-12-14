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
    navigate(createPageUrl('BonneNouvelle'));
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
      conversionLabel: '1 vente/jour × 30 jours',
      color: 'blue'
    },
    { 
      key: 'petit_extra', 
      label: 'Petit Extra (Order Bump)', 
      data: offer.petit_extra,
      multiplier: 15,
      conversionLabel: '50% conversion × 30 jours',
      color: 'green'
    },
    { 
      key: 'offre_superieure', 
      label: 'Offre Supérieure (Upsell)', 
      data: offer.offre_superieure,
      multiplier: 9,
      conversionLabel: '30% conversion × 30 jours',
      color: 'purple'
    },
    { 
      key: 'offre_premium', 
      label: 'Offre Premium', 
      data: offer.offre_premium,
      multiplier: 1,
      conversionLabel: '3% conversion × 30 jours',
      color: 'gold'
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
              
              // Color scheme per product type
              const colorSchemes = {
                blue: {
                  bg: 'bg-blue-500/10',
                  text: 'text-blue-500',
                  checkBg: 'bg-blue-500',
                  border: 'border-blue-500/20',
                  glow: 'shadow-blue-500/10'
                },
                green: {
                  bg: 'bg-green-500/10',
                  text: 'text-green-500',
                  checkBg: 'bg-green-500',
                  border: 'border-green-500/20',
                  glow: 'shadow-green-500/10'
                },
                purple: {
                  bg: 'bg-purple-500/10',
                  text: 'text-purple-500',
                  checkBg: 'bg-purple-500',
                  border: 'border-purple-500/20',
                  glow: 'shadow-purple-500/10'
                },
                gold: {
                  bg: 'bg-yellow-500/10',
                  text: 'text-yellow-500',
                  checkBg: 'bg-yellow-500',
                  border: 'border-yellow-500/20',
                  glow: 'shadow-yellow-500/10'
                }
              };
              
              const scheme = colorSchemes[product.color] || colorSchemes.green;
              
              return (
                <div 
                  key={product.key}
                  className={`flex items-start gap-4 p-4 bg-[#11112b] rounded-xl border ${scheme.border} shadow-lg ${scheme.glow}`}
                >
                  <div className={`w-10 h-10 rounded-lg ${scheme.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${scheme.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs ${scheme.text} font-medium uppercase tracking-wide`}>
                        {product.label}
                      </span>
                      <div className={`w-4 h-4 rounded-full ${scheme.checkBg} flex items-center justify-center`}>
                        <Check className="w-3 h-3 text-white" />
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
                    <span className={`text-xl font-bold ${scheme.text}`}>
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
              {revenues.map((rev) => {
                const colorSchemes = {
                  blue: { text: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/20' },
                  green: { text: 'text-green-500', bg: 'bg-green-500/5', border: 'border-green-500/20' },
                  purple: { text: 'text-purple-500', bg: 'bg-purple-500/5', border: 'border-purple-500/20' },
                  gold: { text: 'text-yellow-500', bg: 'bg-yellow-500/5', border: 'border-yellow-500/20' }
                };
                const scheme = colorSchemes[rev.color] || colorSchemes.green;
                
                return (
                  <div 
                    key={rev.key}
                    className={`flex items-center justify-between py-2 px-3 ${scheme.bg} rounded-lg border ${scheme.border}`}
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
                      <span className={`${scheme.text} font-bold`}>
                        {rev.total.toLocaleString('fr-FR')} €
                      </span>
                      <p className="text-gray-500 text-xs">
                        {rev.price} € × {rev.multiplier}
                      </p>
                    </div>
                  </div>
                );
              })}
              
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