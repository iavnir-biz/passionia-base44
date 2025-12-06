import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  ArrowRight,
  Target,
  CheckCircle,
  Zap,
  TrendingUp,
  Rocket,
  Shield,
  Sparkles,
  Users,
  DollarSign,
  RefreshCw
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

function PhaseCard({ number, title, objective, plan, result, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#1b1b33] rounded-2xl border border-[#2a2a45] p-6 hover:border-[#3a3a55] transition-all"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#61f7a2] flex items-center justify-center">
          <span className="text-xl font-bold text-[#11112b]">{number}</span>
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-[#61f7a2]" />
            <span className="text-sm font-semibold text-[#61f7a2] uppercase tracking-wide">
              Ton Objectif
            </span>
          </div>
          <p className="text-gray-300 leading-relaxed">{objective}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold text-yellow-500 uppercase tracking-wide">
              Notre Plan d'Action
            </span>
          </div>
          <p className="text-gray-300 leading-relaxed">{plan}</p>
        </div>

        <div className="bg-[#61f7a2]/5 rounded-xl p-4 border border-[#61f7a2]/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-[#61f7a2]" />
            <span className="text-sm font-semibold text-[#61f7a2] uppercase tracking-wide">
              Le Résultat
            </span>
          </div>
          <p className="text-white font-medium">{result}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function OfferConcretement() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    navigate(createPageUrl('PlanAction'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#11112b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
      </div>
    );
  }

  const offer = user?.offer || {};
  const productPrincipal = offer.product_principal || {};
  const petitExtra = offer.petit_extra || {};
  const offreSuperieure = offer.offre_superieure || {};
  const offrePremium = offer.offre_premium || {};
  
  const coreSkill = user?.coreSkill || 'ta compétence';

  const phases = [
    {
      number: 1,
      title: "Validation : Ta Première Vente",
      objective: `Valider ton offre en vendant ton premier produit : ${productPrincipal.title || 'ton produit principal'} au prix de ${productPrincipal.price || '—'}. C'est la preuve ultime que ton offre intéresse des vrais gens.`,
      plan: `Tu vas créer une offre simple et irrésistible autour de ${coreSkill}. On te guide pour identifier les bons canaux (réseaux sociaux, groupes, contacts directs) et présenter ton offre de manière convaincante. L'objectif : décrocher ta première vente rapidement pour valider le concept.`,
      result: "Ta première vente est réalisée. Tu sais que tu peux le faire. Tu as un début de business validé par le marché."
    },
    {
      number: 2,
      title: "Création : La Construction",
      objective: `Créer et livrer ton ${productPrincipal.title || 'produit principal'} de qualité qui apporte une vraie transformation à ton premier client.`,
      plan: `Grâce à notre système IA et aux templates fournis, tu vas structurer ton contenu étape par étape. Que ce soit une formation vidéo, un ebook, ou un atelier, on te donne la méthode pour créer rapidement sans te perdre. Tu livres ton premier client et récoltes son témoignage.`,
      result: "Ton produit est prêt et ton premier client est satisfait. Tu as la légitimité pour continuer et faire grandir ton activité."
    },
    {
      number: 3,
      title: "Automatisation : La Machine",
      objective: "Mettre en place un système simple (page de vente + emails automatiques) pour vendre tes offres 24/7, même quand tu dors.",
      plan: `On te fournit tous les textes (page de vente, emails de suivi, offres complémentaires) générés par IA et adaptés à ton offre. Tu n'as qu'à les intégrer dans les outils gratuits ou peu coûteux qu'on te recommande. Ton système devient autonome et peut accueillir des clients automatiquement.`,
      result: "Ton système tourne même quand tu n'es pas là. Tes offres sont prêtes à accueillir des clients automatiquement."
    },
    {
      number: 4,
      title: "Croissance : L'Expansion",
      objective: `Attirer davantage de clients pour vendre ton ${offreSuperieure.title || 'offre supérieure'} et ton ${offrePremium.title || 'offre premium'}, et atteindre tes objectifs de revenus.`,
      plan: `Avec les revenus générés par ton produit principal, tu peux maintenant investir intelligemment dans ta croissance : publicités ciblées, création de contenu régulier, témoignages clients. On te montre comment réinvestir une partie de tes gains pour multiplier ton impact et tes revenus.`,
      result: "Tu sais maintenant faire grandir ton activité et atteindre tes objectifs financiers. Ton business devient pérenne et scalable."
    }
  ];

  const advantages = [
    {
      icon: Rocket,
      title: "Tu vends AVANT de créer",
      description: "Valide ton idée avant d'investir du temps. Pas de risque de créer dans le vide."
    },
    {
      icon: DollarSign,
      title: "Tes pubs sont autofinancées",
      description: "Les revenus du début financent ta croissance. Pas besoin de gros budget initial."
    },
    {
      icon: Shield,
      title: "Fini le syndrome de l'imposteur",
      description: "Ta première vente prouve que les gens veulent ce que tu proposes."
    },
    {
      icon: Sparkles,
      title: "Tout le travail est fait pour toi",
      description: "IA + templates + méthode éprouvée. Tu n'as qu'à suivre le plan."
    }
  ];

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
                  step.id === 4 
                    ? "bg-[#61f7a2] text-[#11112b]" 
                    : step.id < 4
                      ? "text-[#61f7a2]"
                      : "text-gray-500"
                )}>
                  {step.id}. {step.label}
                </div>
                {index < mainSteps.length - 1 && (
                  <div className={cn(
                    "w-4 md:w-8 h-[2px]",
                    step.id < 4 ? "bg-[#61f7a2]" : "bg-[#2a2a45]"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Top CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <GlowButton onClick={handleContinue} size="lg" className="px-10">
              🚀 Voir mon Pack Clé en Main
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Ton Plan de Route en 4 Phases
            </h1>
            <p className="text-gray-400 text-lg">
              Oublie la pression des délais. Avance à ton rythme, étape par étape, vers ton objectif.
            </p>
          </motion.div>

          {/* Intro Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1b1b33] rounded-2xl border border-[#2a2a45] p-6 mb-8"
          >
            <p className="text-gray-300 leading-relaxed text-center">
              Construire ton activité en ligne n'est pas un sprint, c'est un parcours intelligent.
              On a découpé le chemin en <strong className="text-white">4 grandes phases logiques</strong>. 
              Tu n'as qu'à suivre le plan, on s'occupe de te guider à chaque étape.
            </p>
          </motion.div>

          {/* Parcours Guidé Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-bold text-white mb-2">
              🗺️ Ton Parcours Guidé
            </h2>
            <p className="text-gray-400">
              Adapté à ton savoir-faire : <span className="text-[#61f7a2] font-medium">{coreSkill}</span>
            </p>
          </motion.div>

          {/* 4 Phases */}
          <div className="grid gap-6 mb-8">
            {phases.map((phase, index) => (
              <PhaseCard
                key={phase.number}
                {...phase}
                delay={0.4 + index * 0.1}
              />
            ))}
          </div>

          {/* Why This Plan Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              🧩 Pourquoi ce plan est efficace ?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {advantages.map((advantage, index) => {
                const Icon = advantage.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + index * 0.05 }}
                    className="bg-[#1b1b33] rounded-xl border border-[#2a2a45] p-5 hover:border-[#61f7a2]/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#61f7a2]/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#61f7a2]" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-1">{advantage.title}</h3>
                        <p className="text-gray-400 text-sm">{advantage.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Understanding Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="bg-gradient-to-br from-[#61f7a2]/10 to-[#1b1b33] rounded-2xl border border-[#61f7a2]/30 p-8 mb-8 text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              💡 Tu comprends maintenant ?
            </h2>
            <p className="text-gray-300 leading-relaxed text-lg mb-6">
              Ce n'est pas compliqué. C'est juste un chemin à suivre.<br />
              On te donne le plan, les outils et on te guide à chaque phase.
            </p>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="text-center"
          >
            <p className="text-gray-400 mb-4 text-lg">
              Prêt(e) à commencer le voyage ?
            </p>
            <GlowButton onClick={handleContinue} size="lg" className="px-12">
              ✨ Voir Mon Pack Clé en Main
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-[#2a2a45] bg-[#1b1b33] mt-12">
        <p className="text-gray-500 text-sm">Copyright Passion IA</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-[#61f7a2] animate-pulse" />
          <span className="text-[#61f7a2] text-xs font-medium">SYSTÈME CONNECTÉ</span>
        </div>
      </footer>
    </div>
  );
}