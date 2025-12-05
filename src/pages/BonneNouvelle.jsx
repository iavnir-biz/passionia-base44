import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  TrendingUp,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Globe,
  Users,
  Repeat,
  Laptop,
  BarChart3
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import { cn } from "@/lib/utils";

const mainSteps = [
  { id: 1, label: "Ton Offre" },
  { id: 2, label: "Bonne nouvelle !" },
  { id: 3, label: "Ta Vie Future" },
  { id: 4, label: "Concrètement ?" },
  { id: 5, label: "Plan d'Action" },
];

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

function ProgressBarItem({ label, value, icon: Icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-[#61f7a2]" />
          <span className="text-sm text-gray-300">{label}</span>
        </div>
        <span className="text-sm font-bold text-[#61f7a2]">{value}%</span>
      </div>
      <div className="h-3 bg-[#2a2a45] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-[#61f7a2] to-[#4de88f] rounded-full"
        />
      </div>
    </motion.div>
  );
}

export default function BonneNouvelle() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [marketAnalysis, setMarketAnalysis] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user && !marketAnalysis) {
      generateMarketAnalysis();
    }
  }, [user]);

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

  const generateMarketAnalysis = async () => {
    if (!user?.coreSkill) return;
    
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es un expert en analyse de marché e-learning et monétisation de compétences.

Contexte utilisateur :
- Compétence/Passion : ${user.coreSkill || 'non renseignée'}
- Public cible : ${user.targetAudience || 'non renseigné'}
- Problème principal des élèves : ${user.mainProblem || 'non renseigné'}
- Niveau d'expérience : ${user.experienceLevel || 'non renseigné'}
- Objectif de revenus : ${user.targetIncome || 'non renseigné'}€/mois

Génère une analyse de marché personnalisée avec :

1. validationText : Un texte de 3-4 phrases PERSONNALISÉ qui valide le marché de l'utilisateur. Le texte doit :
   - Mentionner directement sa compétence "${user.coreSkill}"
   - Rassurer sur le potentiel de monétisation
   - Être motivant et encourageant
   - Mentionner des tendances actuelles du e-learning
   - Rester professionnel et crédible

2. marketScores : Un objet avec 5 scores (entre 70 et 95) adaptés à la compétence :
   - elearningMarket : Taille du marché e-learning pour cette compétence
   - digitalDemand : Demande numérique croissante
   - recurringRevenue : Potentiel de revenus récurrents
   - globalAccess : Accessibilité globale
   - techEase : Facilité technique & outils modernes

Les scores doivent être réalistes et cohérents avec la compétence déclarée.`,
        response_json_schema: {
          type: "object",
          properties: {
            validationText: { type: "string" },
            marketScores: {
              type: "object",
              properties: {
                elearningMarket: { type: "number" },
                digitalDemand: { type: "number" },
                recurringRevenue: { type: "number" },
                globalAccess: { type: "number" },
                techEase: { type: "number" }
              }
            }
          }
        }
      });
      
      setMarketAnalysis(result);
    } catch (error) {
      console.error('Error generating analysis:', error);
      // Fallback values
      setMarketAnalysis({
        validationText: `Excellente nouvelle ! Le marché de l'enseignement en ligne pour ${user.coreSkill || 'ta compétence'} est en pleine expansion. Des milliers de personnes recherchent activement des formations pour progresser dans ce domaine. Avec ton expérience et ta méthode unique, tu as toutes les cartes en main pour réussir.`,
        marketScores: {
          elearningMarket: 85,
          digitalDemand: 88,
          recurringRevenue: 82,
          globalAccess: 90,
          techEase: 87
        }
      });
    } finally {
      setIsGenerating(false);
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
    { key: 'product_principal', label: 'Produit Principal', data: offer.product_principal, multiplier: 30 },
    { key: 'petit_extra', label: 'Order Bump', data: offer.petit_extra, multiplier: 15 },
    { key: 'offre_superieure', label: 'Upsell', data: offer.offre_superieure, multiplier: 9 },
    { key: 'offre_premium', label: 'Premium', data: offer.offre_premium, multiplier: 1 }
  ];

  const revenues = products.map(p => ({
    ...p,
    price: parsePrice(p.data?.price),
    total: parsePrice(p.data?.price) * p.multiplier
  }));

  const totalMonthly = revenues.reduce((sum, r) => sum + r.total, 0);
  const scores = marketAnalysis?.marketScores || {};

  return (
    <div className="min-h-screen bg-[#11112b]">
      {/* Main Navigation Bar */}
      <div className="bg-[#1b1b33] border-b border-[#2a2a45] py-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center gap-1 md:gap-2 flex-wrap">
            {mainSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={cn(
                  "px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap",
                  step.id === 2 
                    ? "bg-[#61f7a2] text-[#11112b]" 
                    : step.id < 2
                      ? "text-[#61f7a2]"
                      : "text-gray-500"
                )}>
                  {step.id}. {step.label}
                </div>
                {index < mainSteps.length - 1 && (
                  <div className={cn(
                    "w-4 md:w-8 h-[2px]",
                    step.id < 2 ? "bg-[#61f7a2]" : "bg-[#2a2a45]"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        <div className="max-w-3xl mx-auto px-4">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl font-bold text-white mb-3">
              🎉 Étape 2 : Bonne nouvelle !
            </h1>
          </motion.div>

          {/* Top CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <GlowButton onClick={handleContinue} size="lg" className="px-10">
              Voir ma vie future
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </motion.div>

          {/* Validation Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1b1b33] rounded-2xl border border-[#2a2a45] p-6 mb-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#61f7a2]/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#61f7a2]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white mb-1">
                  Ton marché est validé
                </h2>
                <p className="text-gray-400 text-sm">
                  Analyse personnalisée pour {user?.coreSkill || 'ta compétence'}
                </p>
              </div>
            </div>
            
            {isGenerating ? (
              <div className="flex items-center gap-3 py-4">
                <Loader2 className="w-5 h-5 text-[#61f7a2] animate-spin" />
                <span className="text-gray-400">Analyse en cours...</span>
              </div>
            ) : (
              <p className="text-gray-300 leading-relaxed">
                {marketAnalysis?.validationText}
              </p>
            )}
          </motion.div>

          {/* Market Potential Bars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1b1b33] rounded-2xl border border-[#2a2a45] p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#61f7a2]/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#61f7a2]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Potentiel du marché pour enseigner {user?.coreSkill || 'ta compétence'} en ligne
                </h2>
              </div>
            </div>

            {isGenerating ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-[#61f7a2] animate-spin" />
              </div>
            ) : (
              <div className="space-y-5">
                <ProgressBarItem 
                  label="Taille du Marché E-learning" 
                  value={scores.elearningMarket || 85}
                  icon={Globe}
                  delay={0}
                />
                <ProgressBarItem 
                  label="Demande Numérique Croissante" 
                  value={scores.digitalDemand || 88}
                  icon={TrendingUp}
                  delay={0.1}
                />
                <ProgressBarItem 
                  label="Potentiel de Revenus Récurrents" 
                  value={scores.recurringRevenue || 82}
                  icon={Repeat}
                  delay={0.2}
                />
                <ProgressBarItem 
                  label="Accessibilité Globale" 
                  value={scores.globalAccess || 90}
                  icon={Users}
                  delay={0.3}
                />
                <ProgressBarItem 
                  label="Facilité Technique & Outils Modernes" 
                  value={scores.techEase || 87}
                  icon={Laptop}
                  delay={0.4}
                />
              </div>
            )}
          </motion.div>

          {/* Revenue Calculation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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
                  Basé sur les produits sélectionnés et une hypothèse d'une vente par jour
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
                  Voir le détail <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Detail Breakdown */}
            {showDetail && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border-t border-[#2a2a45] pt-4 mt-2 space-y-3"
              >
                {revenues.map((rev) => (
                  <div 
                    key={rev.key}
                    className="flex items-center justify-between py-2 px-3 bg-[#11112b]/50 rounded-lg"
                  >
                    <div>
                      <span className="text-white text-sm font-medium">{rev.label}</span>
                      <p className="text-gray-500 text-xs">×{rev.multiplier} ventes/mois</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[#61f7a2] font-bold">{rev.total.toLocaleString('fr-FR')} €</span>
                      <p className="text-gray-500 text-xs">{rev.price} € × {rev.multiplier}</p>
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

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <GlowButton onClick={handleContinue} size="lg" className="px-12">
              Voir ma vie future
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-[#2a2a45] bg-[#1b1b33]">
        <p className="text-gray-500 text-sm">Copyright Passion IA</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-[#61f7a2] animate-pulse" />
          <span className="text-[#61f7a2] text-xs font-medium">SYSTÈME CONNECTÉ</span>
        </div>
      </footer>
    </div>
  );
}