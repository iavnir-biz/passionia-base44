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
  Target,
  CheckCircle
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

export default function OfferTaVieFuture() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [futureVision, setFutureVision] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user && !futureVision) {
      generateFutureVision();
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

  const generateFutureVision = async () => {
    if (!user?.coreSkill) return;
    
    setIsGenerating(true);
    try {
      const offer = user?.offer || {};
      const products = [
        { data: offer.product_principal, multiplier: 30 },
        { data: offer.petit_extra, multiplier: 15 },
        { data: offer.offre_superieure, multiplier: 9 },
        { data: offer.offre_premium, multiplier: 1 }
      ];
      const revenues = products.map(p => ({
        price: parsePrice(p.data?.price),
        total: parsePrice(p.data?.price) * p.multiplier
      }));
      const totalMonthly = revenues.reduce((sum, r) => sum + r.total, 0);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es un coach de vie et expert en projection de succès entrepreneurial.

Contexte utilisateur :
- Compétence/Passion : ${user.coreSkill || 'non renseignée'}
- Public cible : ${user.targetAudience || 'non renseigné'}
- Niveau d'expérience : ${user.experienceLevel || 'non renseigné'}
- Années de pratique : ${user.yearsPracticing || 'non renseigné'}
- Objectif de revenus : ${user.targetIncome || '500'}€/mois
- Revenu potentiel calculé : ${totalMonthly}€/mois
- Transformation finale souhaitée : ${user.transformation || 'non renseignée'}
- Style de vie souhaité : ${user.lifestyle || 'non renseigné'}

Produits sélectionnés :
- Produit Principal : ${offer.product_principal?.title || 'non sélectionné'}
- Petit Extra : ${offer.petit_extra?.title || 'non sélectionné'}
- Offre Supérieure : ${offer.offre_superieure?.title || 'non sélectionné'}
- Offre Premium : ${offer.offre_premium?.title || 'non sélectionné'}

Rédige un texte narratif immersif et inspirant (4-5 paragraphes) qui projette l'utilisateur dans sa vie future.

Le texte doit :
- Commencer par une scène de vie concrète (ex: "Imagine-toi, dans 6 mois...")
- Être à la 2ème personne du singulier (tu)
- Mentionner directement sa compétence "${user.coreSkill}"
- Intégrer des éléments concrets : revenus, élèves, impact, liberté
- Être émotionnel mais réaliste
- Parler de l'impact sur son audience/élèves
- Évoquer le sentiment de fierté et d'accomplissement
- Terminer sur une note motivante et actionnable

Ton : doux, émotionnel, inspirant, réaliste, motivant.
Pas de promesses irréalistes, mais une vision concrète et atteignable.`,
        response_json_schema: {
          type: "object",
          properties: {
            narrativeText: { type: "string" }
          }
        }
      });
      
      setFutureVision(result);
    } catch (error) {
      console.error('Error generating vision:', error);
      // Fallback text
      setFutureVision({
        narrativeText: `Imagine-toi, dans quelques mois… Tu te réveilles le matin en sachant que des dizaines de personnes comptent sur toi pour progresser en ${user.coreSkill || 'ta compétence'}. Ton premier réflexe ? Consulter les messages de tes élèves qui te remercient pour la transformation que tu leur apportes.\n\nTu as réussi à structurer ton savoir-faire en une offre claire, accessible, et qui résonne avec ton audience. Chaque jour, de nouvelles personnes découvrent ton travail et décident de te faire confiance. Tes revenus augmentent régulièrement, te permettant de vivre de ta passion tout en ayant l'impact que tu souhaitais.\n\nTu n'es plus seul(e) à avancer. Ta communauté grandit, tes témoignages s'accumulent, et tu ressens cette fierté profonde d'avoir osé franchir le pas. Tu as transformé ton expertise en véritable activité pérenne.\n\nCette vie, elle t'attend. Il te suffit maintenant de passer à l'action, étape par étape.`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = () => {
    navigate(createPageUrl('OfferConcretement'));
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
  
  // Calculate sales needed to reach goal
  const revenueGoal = parseInt(user?.targetIncome) || 500;
  const salesNeeded = revenues.map(r => {
    if (r.price === 0) return { ...r, salesNeeded: 0 };
    const needed = Math.ceil(revenueGoal / r.price);
    return { ...r, salesNeeded: needed };
  });

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
                  step.id === 3 
                    ? "bg-[#61f7a2] text-[#11112b]" 
                    : step.id < 3
                      ? "text-[#61f7a2]"
                      : "text-gray-500"
                )}>
                  {step.id}. {step.label}
                </div>
                {index < mainSteps.length - 1 && (
                  <div className={cn(
                    "w-4 md:w-8 h-[2px]",
                    step.id < 3 ? "bg-[#61f7a2]" : "bg-[#2a2a45]"
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
              ✨ Voici ce que ta vie future te réserve…
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
              Voir le Plan de mise en place CONCRÈTE
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </motion.div>

          {/* Narrative Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1b1b33] rounded-2xl border border-[#2a2a45] p-8 mb-6"
          >
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#61f7a2]/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#61f7a2]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white mb-1">
                  Ta vision personnalisée
                </h2>
                <p className="text-gray-400 text-sm">
                  Une projection inspirante basée sur ton parcours
                </p>
              </div>
            </div>
            
            {isGenerating ? (
              <div className="flex items-center gap-3 py-8">
                <Loader2 className="w-5 h-5 text-[#61f7a2] animate-spin" />
                <span className="text-gray-400">Génération de ta vision en cours...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {futureVision?.narrativeText.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-gray-300 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </motion.div>

          {/* Revenue Calculation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[#61f7a2]/10 to-[#1b1b33] rounded-2xl border border-[#61f7a2]/30 p-6 mb-6"
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

          {/* Roadmap to Goal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-yellow-500/10 to-[#1b1b33] rounded-2xl border border-yellow-500/30 p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Ton Plan de Route pour Atteindre ton Objectif
                </h2>
                <p className="text-gray-400 text-sm">
                  Nombre de ventes nécessaires par mois pour atteindre {revenueGoal.toLocaleString('fr-FR')}€/mois
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {salesNeeded.map((item) => (
                <div 
                  key={item.key}
                  className="flex items-center justify-between py-3 px-4 bg-[#11112b] rounded-xl border border-[#2a2a45]"
                >
                  <div>
                    <span className="text-white text-sm font-medium">{item.label}</span>
                    <p className="text-gray-500 text-xs">{item.price} € par vente</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-yellow-500 font-bold text-lg">
                      {item.salesNeeded} ventes
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/20">
              <p className="text-gray-300 text-sm text-center">
                💡 <strong className="text-white">Astuce :</strong> Commence par te concentrer sur ton Produit Principal pour valider le marché, puis ajoute progressivement les autres offres.
              </p>
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <GlowButton onClick={handleContinue} size="lg" className="px-12">
              Voir le Plan de mise en place CONCRÈTE
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