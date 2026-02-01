import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import {
  Sparkles, ArrowRight, Zap, Target, FileText, TrendingUp,
  Search, Music, Code, Languages, Dumbbell, ChefHat, Camera,
  Sword, Sparkle, Video, Heart, Clock, BrainCircuit, Shield,
  CheckCircle2, XCircle, ChevronDown, MessageSquare, Mail,
  BarChart3, Users, Star, Rocket, AlertCircle, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── CONSTANTES ────────────────────────────────────────────────────────────────

const ROTATING_WORDS = ["savoir", "expérience", "talent", "vécu", "expertise"];

const categories = [
  { icon: Music, label: "Composition musicale", color: "bg-pink-50 text-pink-700 border-pink-200" },
  { icon: Code, label: "Programmation", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { icon: Languages, label: "Anglais startup", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { icon: Dumbbell, label: "Calisthénie", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { icon: ChefHat, label: "Cuisine", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { icon: Camera, label: "Création de contenu", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { icon: Sword, label: "Jujitsu", color: "bg-red-50 text-red-700 border-red-200" },
  { icon: Sparkle, label: "Intelligence artificielle", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { icon: Video, label: "Montage vidéo", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { icon: Heart, label: "Yoga & bien-être", color: "bg-rose-50 text-rose-700 border-rose-200" }
];

const painPoints = [
  {
    icon: Clock,
    emoji: "😩",
    title: "Tu passes des semaines à réfléchir… sans avancer",
    description: "Tu lis, tu regardes des vidéos, tu prends des notes. Mais tu ne lances rien. Parce que tu ne sais pas par où commencer concrètement.",
  },
  {
    icon: AlertCircle,
    emoji: "🤯",
    title: "Tu doutes de ce que tu peux vendre (et à quel prix)",
    description: "\"Est-ce que les gens vont vraiment payer pour ça ?\" Tu as le savoir, mais pas la clarté. Tu hésites entre 10 idées sans en valider aucune.",
  },
  {
    icon: BrainCircuit,
    emoji: "💸",
    title: "Tu n'as pas 2 000€ pour un coach ou une formation",
    description: "Les solutions existent, mais elles coûtent cher. Tu te retrouves seul, face à un business model blanc, sans roadmap claire.",
  },
];

const comparisonRows = [
  { label: "Prix", coach: "1 500€ — 5 000€", noah: "Gratuit pour tester" },
  { label: "Temps pour ta première offre", coach: "2 à 6 mois", noah: "60 secondes" },
  { label: "Disponibilité", coach: "1 appel / semaine", noah: "24h/24, 7j/7" },
  { label: "Ce que tu obtiens", coach: "Des conseils à implémenter toi-même", noah: "Offre + page de vente + emails + plan d'action, générés pour toi" },
  { label: "Personnalisation", coach: "Selon le coach", noah: "100% basé sur TON profil, TON vécu" },
];

const steps = [
  {
    icon: Target,
    color: "bg-blue-500/10 text-blue-600",
    title: "Dis-nous ce que tu sais faire",
    description: "Ta passion, ton métier, ton vécu. L'IA comprend ton univers et s'adapte à ton niveau — même si tu débutes.",
  },
  {
    icon: BrainCircuit,
    color: "bg-pink-500/10 text-pink-600",
    title: "Noah analyse et structure tout",
    description: "Marché, demande, concurrence, prix idéal. En 60 secondes, Noah transforme ton idée en business validé.",
  },
  {
    icon: FileText,
    color: "bg-amber-500/10 text-amber-600",
    title: "Tu reçois tout, prêt à utiliser",
    description: "Offre complète, page de vente, messages de prospection, emails marketing, avatar client. Zéro template à remplir.",
  },
  {
    icon: Rocket,
    color: "bg-green-500/10 text-green-600",
    title: "Tu suis ton plan d'action personnalisé",
    description: "Un plan clair, semaine par semaine, jusqu'à ta première vente. Une action par jour. Pas plus, pas moins.",
  },
];

const testimonials = [
  {
    name: "Sarah L.",
    role: "Coach bien-être",
    text: "J'avais passé 4 mois à réfléchir à mon offre sans rien lancer. Avec Noah, en 1 heure j'avais tout : l'offre, la page de vente, les messages. Ma première vente est tombée 3 jours après.",
    result: "Première vente à 67€ en 3 jours",
    avatar: "👩‍🦰",
  },
  {
    name: "Karim D.",
    role: "Développeur freelance",
    text: "Je pensais que c'était encore un outil gadget. J'ai testé gratuitement, j'ai été bluffé par la qualité de l'offre générée. C'était plus clair que ce que j'avais fait en 6 mois tout seul.",
    result: "Offre structurée en 60 secondes",
    avatar: "👨‍💻",
  },
  {
    name: "Marie P.",
    role: "Professeure de yoga",
    text: "Aucune compétence en marketing, aucune idée de comment vendre en ligne. Noah m'a tout généré. J'ai suivi le plan d'action et j'ai eu mes 3 premières clientes en une semaine.",
    result: "3 clientes en 7 jours",
    avatar: "🧘‍♀️",
  },
];

const faqItems = [
  {
    q: "C'est vraiment gratuit ?",
    a: "Oui. Tu peux tester Noah et voir ce qu'il génère pour toi sans payer. Pas de carte bancaire, pas d'engagement. Si tu veux l'accès complet (plan d'action, page de vente, emails…), c'est 67€ — pas 2 000€.",
  },
  {
    q: "Je n'ai aucune compétence technique. C'est pour moi ?",
    a: "C'est exactement pour toi. Noah est conçu pour les débutants. Tu réponds à des questions simples sur ton vécu et ta passion, et l'IA fait le reste. Si tu sais écrire un message, tu sais utiliser Noah.",
  },
  {
    q: "Est-ce que ça marche dans ma niche ?",
    a: "Noah a généré des offres dans plus de 120 niches différentes : fitness, cuisine, langues, coaching, artisanat, musique, développement personnel, tech… Si tu as un savoir que d'autres veulent apprendre, ça marche.",
  },
  {
    q: "En quoi c'est différent d'une formation en ligne classique ?",
    a: "Les formations te donnent des concepts. Noah te donne des résultats. Pas de module à regarder pendant 40h. Pas de template à remplir. Tu entres ton idée, tu ressors avec une offre prête à vendre. C'est un générateur, pas un cours.",
  },
  {
    q: "Qu'est-ce que je reçois exactement ?",
    a: "Une offre complète avec prix, une page de vente rédigée, des messages de prospection (DM, emails), un avatar client détaillé, une analyse de marché, une projection de revenus et un plan d'action semaine par semaine jusqu'à ta première vente.",
  },
  {
    q: "Mes données sont protégées ?",
    a: "Oui. Hébergement en Europe, conforme au RGPD. Tes données ne sont jamais revendues. Jamais.",
  },
];

// ─── COMPOSANTS UTILITAIRES ────────────────────────────────────────────────────

const SectionReveal = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const FAQItem = ({ item, isOpen, onToggle }) => (
  <div className="border-b border-gray-100 last:border-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-5 px-1 text-left group"
    >
      <span className="text-gray-900 font-medium text-base md:text-lg pr-4 group-hover:text-[#3dd67a] transition-colors">
        {item.q}
      </span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.25 }}
        className="shrink-0"
      >
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </motion.div>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <p className="text-gray-600 text-sm md:text-base leading-relaxed pb-5 px-1">
            {item.a}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ─── COMPOSANT PRINCIPAL ───────────────────────────────────────────────────────

export default function Welcome() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    if (searchValue && searchValue.trim() !== '') {
      localStorage.setItem('prefilledSkill', searchValue.trim());
    }
    navigate(createPageUrl('OnboardingFirstName'));
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl('Dashboard'));
  };

  const handleCategoryClick = (label) => {
    setSearchValue(label);
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ━━━ HEADER ━━━ */}
      <header className="w-full flex justify-between items-center px-4 py-4 md:px-8 md:py-5 sticky top-0 bg-white/80 backdrop-blur-xl z-50 border-b border-gray-100/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#3dd67a] flex items-center justify-center shadow-md shadow-[#61f7a2]/20">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <span className="text-gray-900 font-bold text-sm md:text-base tracking-tight">PassionIA</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            onClick={handleLogin}
            variant="ghost"
            className="text-gray-600 hover:text-gray-900 text-xs md:text-sm font-medium h-auto px-3 py-2">
            Connexion
          </Button>
          <Button
            onClick={handleStart}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 text-xs md:text-sm rounded-full font-medium h-auto transition-all hover:shadow-lg">
            Commencer
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </header>

      {/* ━━━ HERO ━━━ */}
      <section className="relative px-4 pt-12 pb-8 md:px-6 md:pt-24 md:pb-16">
        {/* Background subtil */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#61f7a2]/5 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3.5 py-1.5 md:px-4 md:py-2 mb-6 md:mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#61f7a2] animate-pulse" />
            <span className="text-gray-600 text-xs md:text-sm font-medium">100% gratuit · Résultat en 60 secondes</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-[2rem] leading-[1.15] md:text-5xl lg:text-[3.5rem] font-extrabold text-gray-900 mb-5 md:mb-6 tracking-tight"
          >
            Pendant que d'autres{" "}
            <span className="text-gray-400 line-through decoration-gray-300">hésitent depuis 6 mois</span>,{" "}
            <br className="hidden md:block" />
            transforme ton{" "}
            <span className="relative inline-flex items-center overflow-hidden h-[1.15em] align-bottom min-w-[80px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={ROTATING_WORDS[wordIndex]}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-110%", opacity: 0 }}
                  transition={{ duration: 0.35, ease: "backOut" }}
                  className="text-[#3dd67a] whitespace-nowrap absolute left-0"
                >
                  {ROTATING_WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
            <br className="hidden md:block" />
            en offre qui se vend.
          </motion.h1>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-gray-500 text-base md:text-xl max-w-xl mx-auto mb-8 md:mb-10 leading-relaxed"
          >
            Notre IA génère ton offre complète, ta page de vente, tes messages et ton plan d'action.
            <br className="hidden md:block" />
            <span className="text-gray-700 font-medium">Sans formation à 2 000€. Sans compétence technique.</span>
          </motion.p>

          {/* Barre de recherche */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="max-w-xl mx-auto mb-5"
          >
            <div className="relative bg-white rounded-2xl shadow-xl shadow-gray-200/60 p-2 md:p-2.5 flex flex-col md:flex-row items-center gap-2 border border-gray-200">
              <div className="flex items-center w-full md:w-auto flex-1 pl-3">
                <Search className="w-4.5 h-4.5 text-gray-300 shrink-0" />
                <Input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                  placeholder="Ex : coach fitness, prof de yoga, dev freelance…"
                  className="flex-1 border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 text-sm md:text-base h-11"
                />
              </div>
              <Button
                onClick={handleStart}
                className="w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white px-5 h-11 rounded-xl font-semibold text-sm transition-all hover:shadow-lg whitespace-nowrap"
              >
                Découvrir mon potentiel
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* Micro-proof sous la barre */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-4 text-xs text-gray-400 mb-8"
          >
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#61f7a2]" />
              Aucune CB requise
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#61f7a2]" />
              Résultat immédiat
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block" />
            <span className="hidden sm:flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#61f7a2]" />
              RGPD conforme
            </span>
          </motion.div>

          {/* Catégories défilantes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="relative overflow-hidden max-w-xl mx-auto py-1"
          >
            <div className="flex overflow-hidden">
              <motion.div
                className="flex gap-3 items-center whitespace-nowrap pr-3"
                animate={{ x: [0, -1030] }}
                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
              >
                {[...categories, ...categories].map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => handleCategoryClick(cat.label)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 ${cat.color}`}
                  >
                    <cat.icon className="w-3 h-3" />
                    {cat.label}
                  </button>
                ))}
              </motion.div>
            </div>
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
          </motion.div>
        </div>
      </section>

      {/* ━━━ SECTION PROBLÈME ━━━ */}
      <section className="px-4 py-16 md:py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-12 md:mb-16">
              <p className="text-[#3dd67a] font-semibold text-sm uppercase tracking-wider mb-3">Le vrai problème</p>
              <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Tu as la valeur.{" "}
                <span className="text-gray-400">Il te manque le système.</span>
              </h2>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {painPoints.map((point, i) => (
              <SectionReveal key={i} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 h-full hover:border-gray-200 hover:shadow-sm transition-all">
                  <span className="text-3xl mb-4 block">{point.emoji}</span>
                  <h3 className="text-gray-900 font-bold text-base md:text-lg mb-3 leading-snug">
                    {point.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>

          <SectionReveal delay={0.3}>
            <div className="text-center mt-10 md:mt-14">
              <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">
                Et si une IA pouvait faire en <span className="text-gray-900 font-semibold">60 secondes</span> ce qu'un coach met <span className="text-gray-900 font-semibold">6 mois</span> à t'apprendre ?
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ━━━ SECTION COMPARATIF ━━━ */}
      <section className="px-4 py-16 md:py-24 bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-10 md:mb-14">
              <p className="text-[#61f7a2] font-semibold text-sm uppercase tracking-wider mb-3">Pourquoi Noah</p>
              <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                Coach à 2 000€{" "}
                <span className="text-gray-500">vs</span>{" "}
                Noah
              </h2>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.15}>
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden">
              {/* En-tête du tableau */}
              <div className="grid grid-cols-3 gap-0 border-b border-gray-700/50">
                <div className="p-4 md:p-5" />
                <div className="p-4 md:p-5 text-center border-l border-gray-700/50">
                  <span className="text-gray-400 text-xs md:text-sm font-medium">Coach / Formation</span>
                </div>
                <div className="p-4 md:p-5 text-center border-l border-gray-700/50 bg-[#61f7a2]/5">
                  <span className="text-[#61f7a2] text-xs md:text-sm font-bold">Noah IA ✨</span>
                </div>
              </div>

              {/* Lignes */}
              {comparisonRows.map((row, i) => (
                <div key={i} className="grid grid-cols-3 gap-0 border-b border-gray-700/30 last:border-0">
                  <div className="p-4 md:p-5 flex items-center">
                    <span className="text-gray-300 text-xs md:text-sm font-medium">{row.label}</span>
                  </div>
                  <div className="p-4 md:p-5 flex items-center justify-center border-l border-gray-700/30 text-center">
                    <span className="text-gray-500 text-xs md:text-sm">{row.coach}</span>
                  </div>
                  <div className="p-4 md:p-5 flex items-center justify-center border-l border-gray-700/30 bg-[#61f7a2]/5 text-center">
                    <span className="text-white text-xs md:text-sm font-medium">{row.noah}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionReveal>

          <SectionReveal delay={0.3}>
            <div className="text-center mt-10">
              <Button
                onClick={handleStart}
                className="bg-[#61f7a2] hover:bg-[#4de88f] text-gray-900 px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-bold rounded-full h-auto transition-all hover:shadow-[0_0_30px_rgba(97,247,162,0.3)] hover:-translate-y-0.5"
              >
                Tester gratuitement
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-gray-500 text-xs mt-3">Aucune carte bancaire requise</p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ━━━ CE QUE NOAH GÉNÈRE ━━━ */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-12 md:mb-16">
              <p className="text-[#3dd67a] font-semibold text-sm uppercase tracking-wider mb-3">Tout est généré pour toi</p>
              <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
                Ce que Noah crée en{" "}
                <span className="bg-gradient-to-r from-[#61f7a2] to-[#3dd67a] bg-clip-text text-transparent">60 secondes</span>
              </h2>
              <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">
                Pas de template à remplir. Pas de module à regarder. Tout est prêt à utiliser.
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-3xl mx-auto">
            {[
              { icon: Target, label: "Ton offre complète", sub: "avec le prix idéal" },
              { icon: FileText, label: "Ta page de vente", sub: "rédigée et structurée" },
              { icon: MessageSquare, label: "Messages de vente", sub: "DMs et prospection" },
              { icon: Mail, label: "Emails marketing", sub: "séquences prêtes" },
              { icon: Users, label: "Avatar client", sub: "profil détaillé" },
              { icon: BarChart3, label: "Analyse de marché", sub: "demande et concurrence" },
              { icon: TrendingUp, label: "Projection de revenus", sub: "estimation réaliste" },
              { icon: Rocket, label: "Plan d'action", sub: "semaine par semaine" },
              { icon: Star, label: "Jusqu'au gros produit", sub: "de 27€ à 2 000€" },
            ].map((item, i) => (
              <SectionReveal key={i} delay={i * 0.05}>
                <div className="bg-gray-50 rounded-xl p-4 md:p-5 border border-gray-100 hover:border-[#61f7a2]/30 hover:bg-[#61f7a2]/5 transition-all group">
                  <item.icon className="w-5 h-5 text-gray-400 group-hover:text-[#3dd67a] transition-colors mb-2.5" />
                  <p className="text-gray-900 font-semibold text-sm mb-0.5">{item.label}</p>
                  <p className="text-gray-400 text-xs">{item.sub}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 4 ÉTAPES ━━━ */}
      <section className="px-4 py-16 md:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-12 md:mb-16">
              <p className="text-[#3dd67a] font-semibold text-sm uppercase tracking-wider mb-3">Comment ça marche</p>
              <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                4 étapes.{" "}
                <span className="text-gray-400">Zéro prise de tête.</span>
              </h2>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {steps.map((step, i) => (
              <SectionReveal key={i} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 h-full relative overflow-hidden group hover:border-gray-200 hover:shadow-sm transition-all">
                  <span className="absolute top-4 right-5 text-5xl md:text-6xl font-extrabold text-gray-100 group-hover:text-gray-150 transition-colors select-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className={`w-11 h-11 rounded-xl ${step.color} flex items-center justify-center mb-4 relative z-10`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-gray-900 font-bold text-base md:text-lg mb-2 relative z-10">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed relative z-10">
                    {step.description}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ PREUVE SOCIALE ━━━ */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-12 md:mb-16">
              <p className="text-[#3dd67a] font-semibold text-sm uppercase tracking-wider mb-3">Ils l'ont fait</p>
              <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Des résultats concrets.{" "}
                <span className="text-gray-400">Pas des promesses.</span>
              </h2>
            </div>
          </SectionReveal>

          {/* Stats */}
          <SectionReveal delay={0.1}>
            <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-2xl mx-auto mb-12 md:mb-16">
              {[
                { value: "1 000+", label: "offres générées" },
                { value: "3 jours", label: "temps moyen 1ère vente" },
                { value: "120+", label: "niches différentes" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{stat.value}</p>
                  <p className="text-gray-400 text-xs md:text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </SectionReveal>

          {/* Témoignages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {testimonials.map((t, i) => (
              <SectionReveal key={i} delay={i * 0.1}>
                <div className="bg-gray-50 rounded-2xl p-6 md:p-7 border border-gray-100 h-full flex flex-col">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-5">
                    "{t.text}"
                  </p>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{t.avatar}</span>
                      <div>
                        <p className="text-gray-900 font-semibold text-sm">{t.name}</p>
                        <p className="text-gray-400 text-xs">{t.role}</p>
                      </div>
                    </div>
                    <div className="bg-[#61f7a2]/10 rounded-lg px-3 py-1.5 mt-2 inline-block">
                      <p className="text-[#2aad5a] text-xs font-semibold">{t.result}</p>
                    </div>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ FAQ ━━━ */}
      <section className="px-4 py-16 md:py-24 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-10 md:mb-14">
              <p className="text-[#3dd67a] font-semibold text-sm uppercase tracking-wider mb-3">Questions fréquentes</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                Tu hésites encore ?
              </h2>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="bg-white rounded-2xl border border-gray-100 px-5 md:px-8">
              {faqItems.map((item, i) => (
                <FAQItem
                  key={i}
                  item={item}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ━━━ CTA FINAL ━━━ */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          <SectionReveal>
            <div className="bg-gray-900 rounded-3xl p-8 md:p-14 text-center relative overflow-hidden">
              {/* Glow background */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#61f7a2]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4">
                  Tu n'as rien à perdre.
                  <br />
                  <span className="text-[#61f7a2]">Tout à construire.</span>
                </h2>
                <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto mb-8 leading-relaxed">
                  Découvre en 60 secondes ce que ton savoir peut générer comme revenus. Gratuitement.
                </p>

                <Button
                  onClick={handleStart}
                  className="bg-[#61f7a2] hover:bg-[#4de88f] text-gray-900 px-7 py-3.5 md:px-10 md:py-4 text-base md:text-lg font-bold rounded-full h-auto transition-all hover:shadow-[0_0_40px_rgba(97,247,162,0.35)] hover:-translate-y-0.5"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Créer mon offre gratuitement
                </Button>

                <div className="flex items-center justify-center gap-3 md:gap-5 mt-5 text-xs text-gray-500">
                  <span>Aucune CB</span>
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  <span>60 secondes</span>
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  <span>RGPD</span>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="w-full border-t border-gray-100 bg-gray-50/50 py-8">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#61f7a2] to-[#3dd67a] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">PassionIA</p>
                <p className="text-xs text-gray-500">Technologie IA par IAVNIR©</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-400">
              <a href="#" className="hover:text-gray-600 transition-colors">Réglementation AI Act</a>
              <a href="#" className="hover:text-gray-600 transition-colors">Protection des données</a>
              <a href="#" className="hover:text-gray-600 transition-colors">RGPD</a>
              <a href="#" className="hover:text-gray-600 transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-gray-600 transition-colors">Mentions légales</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}