import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
  Sparkles, ArrowRight, Zap, Target, FileText, TrendingUp, Search, 
  Music, Code, Languages, Dumbbell, ChefHat, Camera, Sword, Sparkle, 
  Video, Heart, X, Check, Clock, Wallet, Users, ChevronDown, AlertCircle,
  MessageSquare, DollarSign, Calendar, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Liste pour le roulement (en minuscules)
const ROTATING_WORDS = ["savoir", "expérience", "talent", "vécu", "expertise"];

// Floating AI Icons Component
const FloatingIcon = ({ icon: Icon, delay = 0, className = "", mobile = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{
      opacity: mobile ? [0, 0.3, 0.25, 0.3] : [0, 0.4, 0.35, 0.4],
      y: [20, 0, -10, 0],
      rotate: [0, 5, -5, 0]
    }}
    transition={{
      duration: mobile ? 4 : 3,
      delay,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }}
    className={className}>
    <Icon className={mobile ? "w-6 h-6 text-[#61f7a2]" : "w-10 h-10 md:w-12 md:h-12 text-[#61f7a2]"} />
  </motion.div>
);

const features = [
  {
    icon: Zap,
    title: "Analyse IA instantanée",
    description: "Transforme ta passion en business validé en quelques minutes."
  },
  {
    icon: Target,
    title: "Plan d'action personnalisé",
    description: "Un roadmap sur-mesure pour atteindre tes premiers revenus."
  },
  {
    icon: FileText,
    title: "Documents IA générés",
    description: "Page de vente, messages de vente, avatar complet, email marketing, script DM."
  },
  {
    icon: TrendingUp,
    title: "Suivi de progression avancé",
    description: "Suis ton avancement et reste motivé chaque jour avec des tâches prêtes à l'emploi."
  }
];

const categories = [
  { icon: Music, label: "Composition musicale", color: "bg-pink-100 text-pink-700 hover:bg-pink-200" },
  { icon: Code, label: "Programmation Python", color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
  { icon: Languages, label: "Anglais startup", color: "bg-green-100 text-green-700 hover:bg-green-200" },
  { icon: Dumbbell, label: "Calisthénie", color: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
  { icon: ChefHat, label: "Cuisine moléculaire", color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" },
  { icon: Camera, label: "Créer du contenu", color: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
  { icon: Sword, label: "Jujitsu", color: "bg-red-100 text-red-700 hover:bg-red-200" },
  { icon: Sparkle, label: "Intelligence artificielle", color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" },
  { icon: Video, label: "Montage vidéo", color: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200" },
  { icon: Heart, label: "Yoga", color: "bg-rose-100 text-rose-700 hover:bg-rose-200" }
];

// Témoignages
const testimonials = [
  {
    name: "Marc D.",
    role: "Coach sportif",
    avatar: "💪",
    text: "J'ai créé mon offre de coaching fitness à 497€ en 2 minutes. Première vente 24h après.",
    result: "497€ en 24h"
  },
  {
    name: "Sophie L.",
    role: "Consultante RH",
    avatar: "👔",
    text: "J'allais payer 2000€ un consultant. Noah a fait le même job en 60 secondes.",
    result: "2000€ économisés"
  },
  {
    name: "Thomas R.",
    role: "Formateur",
    avatar: "📚",
    text: "67€, puis 97€, puis 497€. Tout ça grâce à l'offre générée par Noah.",
    result: "3 ventes en 5 jours"
  }
];

// FAQ
const faqs = [
  {
    question: "C'est vraiment gratuit ?",
    answer: "Oui, tester Noah est 100% gratuit. Tu découvres ton potentiel, ton offre et ton plan d'action sans débourser un centime. Aucune carte bancaire requise."
  },
  {
    question: "Combien de temps ça prend vraiment ?",
    answer: "5 minutes maximum. Noah te pose quelques questions sur ton expertise, analyse ton marché, et génère ton offre complète. C'est aussi simple que ça."
  },
  {
    question: "Ça marche dans ma niche ?",
    answer: "Oui. Noah a créé des offres pour 1000+ entrepreneurs dans 50+ niches différentes : coaching, consulting, création de contenu, fitness, développement personnel, et bien plus."
  },
  {
    question: "Et si je n'ai aucune expertise technique ?",
    answer: "Parfait. Noah est justement fait pour toi. Tu parles normalement de ce que tu sais faire, et l'IA fait tout le reste. Aucune compétence technique nécessaire."
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "100%. Cryptage SSL, conformité RGPD, hébergement sécurisé. Tes données ne sont jamais partagées avec des tiers."
  },
  {
    question: "Que se passe-t-il après avoir généré mon offre ?",
    answer: "Tu reçois ton offre complète, tes messages de vente, ta page de vente et un plan d'action sur 7 jours. Tout est prêt à être utilisé immédiatement."
  }
];

export default function Welcome() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Timer pour changer le mot toutes les 2.5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    // 🔥 Si l'utilisateur a tapé quelque chose, on le sauvegarde
    if (searchValue && searchValue.trim() !== '') {
      localStorage.setItem('prefilledSkill', searchValue.trim());
      console.log('[Welcome] Passion pré-remplie:', searchValue.trim());
    }
    navigate(createPageUrl('OnboardingFirstName'));
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl('Dashboard'));
  };

  const handleCategoryClick = (category) => {
    setSearchValue(category);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white overflow-x-hidden">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-4 py-4 md:px-8 md:py-6">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-lg shrink-0">
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {/* Bouton Connexion */}
          <Button
            onClick={handleLogin}
            variant="outline"
            className="bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-900 px-3 py-1.5 text-xs md:text-base md:px-8 md:py-2 rounded-full font-medium transition-all duration-300 ease-out h-auto">
            Connexion
          </Button>

          {/* Bouton Démarrer */}
          <Button
            onClick={handleStart}
            className="bg-gradient-to-br from-[#1a1a1a] to-black text-white border border-transparent px-3 py-1.5 text-xs md:text-base md:px-8 md:py-2 rounded-full font-medium transition-all duration-300 ease-out hover:shadow-[0_0_20px_rgba(97,247,162,0.4)] hover:border-[#61f7a2]/30 hover:-translate-y-0.5 h-auto">
            <span className="hidden md:inline">Démarrer gratuitement</span>
            <span className="md:hidden">Démarrer</span>
          </Button>
        </div>
      </header>

      {/* Hero Section with Floating Cards */}
      <div className="relative flex items-center justify-center px-4 py-12 md:px-6 md:py-32 overflow-hidden">
        <div className="max-w-4xl text-center relative z-10 w-full">
          {/* AI Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-2 md:px-5 md:py-2.5 mb-6 md:mb-8 shadow-sm">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-[#61f7a2]" />
            <span className="text-gray-700 text-xs md:text-sm font-medium">✨ 100% Gratuit • Résultat en 5 minutes</span>
          </motion.div>

          {/* Title - NOUVEAU HOOK */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            
            <span className="text-gray-500 text-2xl md:text-3xl lg:text-4xl block mb-2">
              Pendant que d'autres passent <span className="line-through">6 mois</span>
            </span>
            
            Transforme ton <br className="md:hidden" />
            <motion.span
              layout
              className="inline-flex relative h-[1.2em] align-top overflow-hidden align-middle mx-1 md:mx-2 justify-center md:justify-start min-w-[60px]"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={ROTATING_WORDS[wordIndex]}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.4, ease: "backOut" }}
                  className="text-[#61f7a2] block whitespace-nowrap"
                >
                  {ROTATING_WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </motion.span>
            <br className="md:hidden" />
            en première vente <br className="md:hidden" />
            <span className="underline decoration-[#61f7a2]/30">en 5 minutes</span>
          </motion.h1>

          {/* Subtitle - OPTIMISÉ */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-base md:text-xl text-gray-600 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
            Noah, ton copilote IA, crée ton offre complète, tes messages de vente et ton plan d'action.
            <span className="block mt-2 font-semibold text-gray-900">Sans formation à 2000€. Sans expertise technique.</span>
          </motion.p>

          {/* Search Bar - CONSERVÉ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-6 max-w-2xl mx-auto w-full">
            <div className="relative backdrop-blur-sm bg-white/95 rounded-2xl shadow-xl p-2 md:p-3 flex flex-col md:flex-row items-center gap-2 md:gap-3 border border-gray-200">
              <div className="flex items-center w-full md:w-auto flex-1 pl-2">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <Input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Quel talent veux-tu transformer ?"
                  className="flex-1 border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 text-sm md:text-base h-10 md:h-12" />
              </div>

              <Button
                onClick={handleStart}
                className="w-full md:w-auto bg-gradient-to-br from-[#1a1a1a] to-black text-white border border-transparent px-6 h-10 md:h-12 rounded-xl md:rounded-full font-semibold transition-all duration-300 ease-out hover:shadow-[0_0_20px_rgba(97,247,162,0.4)] hover:border-[#61f7a2]/30 hover:-translate-y-0.5 whitespace-nowrap">
                Découvrir mon potentiel
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* Social Proof - NOUVEAU */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#61f7a2]" />
              <span className="text-sm font-medium text-gray-700">1000+ offres créées</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#61f7a2]" />
              <span className="text-sm font-medium text-gray-700">Première vente en 3 jours</span>
            </div>
          </motion.div>

          {/* Scrolling Categories Tags - CONSERVÉ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="relative mt-12 overflow-hidden max-w-2xl mx-auto py-2"
          >
            <div className="flex overflow-hidden group">
              <motion.div
                className="flex gap-4 items-center whitespace-nowrap pr-4"
                animate={{ x: [0, -1030] }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                {[...categories, ...categories].map((category, index) =>
                  <button
                    key={index}
                    onClick={() => handleCategoryClick(category.label)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all hover:scale-105 shadow-sm border border-gray-100/50 ${category.color}`}>
                    <category.icon className="w-3.5 h-3.5" />
                    {category.label}
                  </button>
                )}
              </motion.div>
            </div>

            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-gray-50 via-gray-50/20 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-gray-50 via-gray-50/20 to-transparent pointer-events-none z-10" />
          </motion.div>
        </div>

        {/* Floating Cards - CONSERVÉS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: [20, 0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 4,
            delay: 0.4,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="hidden lg:block absolute top-16 left-8 w-16 h-16 bg-white rounded-2xl shadow-lg p-2">
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
            <Target className="w-7 h-7 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: [20, 0, -10, 0],
            rotate: [0, -5, 5, 0]
          }}
          transition={{
            duration: 4,
            delay: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="hidden lg:block absolute top-24 right-8 w-16 h-16 bg-white rounded-2xl shadow-lg p-2">
          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center">
            <Zap className="w-7 h-7 text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: [20, 0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 4,
            delay: 0.6,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="hidden lg:block absolute bottom-32 left-12 w-16 h-16 bg-white rounded-2xl shadow-lg p-2">
          <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: [20, 0, -10, 0],
            rotate: [0, -5, 5, 0]
          }}
          transition={{
            duration: 4,
            delay: 0.7,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="hidden lg:block absolute bottom-24 right-12 w-16 h-16 bg-white rounded-2xl shadow-lg p-2">
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center">
            <FileText className="w-7 h-7 text-amber-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: [20, 0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 4,
            delay: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="hidden lg:block absolute top-1/2 left-4 w-16 h-16 bg-white rounded-2xl shadow-lg p-2">
          <div className="w-full h-full bg-gradient-to-br from-rose-100 to-rose-50 rounded-xl flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-rose-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: [20, 0, -10, 0],
            rotate: [0, -5, 5, 0]
          }}
          transition={{
            duration: 4,
            delay: 0.9,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="hidden lg:block absolute top-1/2 right-4 w-16 h-16 bg-white rounded-2xl shadow-lg p-2">
          <div className="w-full h-full bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-xl flex items-center justify-center">
            <ArrowRight className="w-7 h-7 text-cyan-600" />
          </div>
        </motion.div>
      </div>

      {/* 🔥 NOUVELLE SECTION: LE PROBLÈME */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="w-full max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pourquoi tu <span className="text-red-500">bloques</span> sur ton offre ?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            La plupart des entrepreneurs passent des mois à tourner en rond. Voici pourquoi :
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Problème 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-red-100">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Tu passes des mois à réfléchir
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Tu sais que tu as de la valeur, mais impossible de la structurer en offre claire. 
              Tu tournes en rond sans jamais passer à l'action.
            </p>
          </motion.div>

          {/* Problème 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-red-100">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Tu copies ce qui existe déjà
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Résultat : ton offre ressemble à celle de 100 autres personnes. 
              Impossible de te différencier ou de justifier ton prix.
            </p>
          </motion.div>

          {/* Problème 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-red-100">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
              <DollarSign className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Tu doutes de ton prix
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Trop cher ? Pas assez ? Tu ne sais pas combien facturer pour ton expertise. 
              Tu perds confiance avant même de commencer.
            </p>
          </motion.div>
        </div>

        {/* Transition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="text-center mt-12">
          <p className="text-2xl md:text-3xl font-bold text-gray-900">
            Et si une IA faisait ce travail pour toi <br className="hidden md:block" />
            <span className="text-[#61f7a2]">pendant que tu bois ton café</span> ?
          </p>
        </motion.div>
      </motion.div>

      {/* 🔥 NOUVELLE SECTION: COMPARATIF COACH VS NOAH */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className="w-full bg-gradient-to-br from-gray-900 to-black py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Coach à 2000€ <span className="text-gray-400">vs</span> Noah
            </h2>
            <p className="text-gray-400 text-lg">
              Même résultat. Temps et prix incomparables.
            </p>
          </div>

          {/* Tableau Comparatif */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
              <div className="p-6"></div>
              <div className="p-6 text-center border-l border-r border-gray-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <X className="w-5 h-5 text-red-500" />
                  <span className="font-bold text-gray-900">Coach 2000€</span>
                </div>
              </div>
              <div className="p-6 text-center bg-gradient-to-br from-[#61f7a2]/10 to-[#4de88f]/10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-[#61f7a2]" />
                  <span className="font-bold text-gray-900">Noah</span>
                </div>
              </div>
            </div>

            {/* Prix */}
            <div className="grid grid-cols-3 border-b border-gray-200">
              <div className="p-6 font-semibold text-gray-900 flex items-center">
                <Wallet className="w-5 h-5 mr-3 text-gray-400" />
                Prix
              </div>
              <div className="p-6 text-center border-l border-r border-gray-200 bg-red-50">
                <X className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <span className="font-bold text-red-600">2000€</span>
              </div>
              <div className="p-6 text-center bg-green-50">
                <Check className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <span className="font-bold text-green-600">Gratuit puis 17€</span>
              </div>
            </div>

            {/* Temps */}
            <div className="grid grid-cols-3 border-b border-gray-200">
              <div className="p-6 font-semibold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-3 text-gray-400" />
                Temps pour créer l'offre
              </div>
              <div className="p-6 text-center border-l border-r border-gray-200 bg-red-50">
                <X className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <span className="font-bold text-red-600">6 mois</span>
              </div>
              <div className="p-6 text-center bg-green-50">
                <Check className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <span className="font-bold text-green-600">5 minutes</span>
              </div>
            </div>

            {/* Disponibilité */}
            <div className="grid grid-cols-3 border-b border-gray-200">
              <div className="p-6 font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                Disponibilité
              </div>
              <div className="p-6 text-center border-l border-r border-gray-200 bg-red-50">
                <X className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <span className="text-gray-700">RDV limités</span>
              </div>
              <div className="p-6 text-center bg-green-50">
                <Check className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <span className="text-gray-900 font-semibold">24/7 illimité</span>
              </div>
            </div>

            {/* Personnalisation */}
            <div className="grid grid-cols-3 border-b border-gray-200">
              <div className="p-6 font-semibold text-gray-900 flex items-center">
                <Target className="w-5 h-5 mr-3 text-gray-400" />
                Résultat
              </div>
              <div className="p-6 text-center border-l border-r border-gray-200 bg-red-50">
                <X className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <span className="text-gray-700">Méthode générique</span>
              </div>
              <div className="p-6 text-center bg-green-50">
                <Check className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <span className="text-gray-900 font-semibold">100% personnalisé</span>
              </div>
            </div>

            {/* Garantie */}
            <div className="grid grid-cols-3">
              <div className="p-6 font-semibold text-gray-900 flex items-center">
                <Award className="w-5 h-5 mr-3 text-gray-400" />
                Garantie
              </div>
              <div className="p-6 text-center border-l border-r border-gray-200 bg-red-50">
                <X className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <span className="text-gray-700">Aucune</span>
              </div>
              <div className="p-6 text-center bg-green-50">
                <Check className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <span className="text-gray-900 font-semibold">Satisfait ou remboursé</span>
              </div>
            </div>
          </div>

          {/* CTA sous le tableau */}
          <div className="text-center mt-12">
            <Button
              onClick={handleStart}
              className="bg-gradient-to-br from-[#61f7a2] to-[#4de88f] text-gray-900 px-10 py-6 text-lg font-semibold rounded-full transition-all duration-300 ease-out hover:shadow-[0_0_25px_rgba(97,247,162,0.6)] hover:brightness-110 hover:-translate-y-0.5 h-auto">
              <Sparkles className="w-5 h-5 mr-2" />
              Économise 2000€, teste gratuitement
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 4 Steps Section - CONSERVÉ MAIS AMÉLIORÉ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7 }}
        className="w-full max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Comment Noah transforme ton expertise <br className="hidden md:block" />
            en <span className="bg-gradient-to-r from-[#61f7a2] to-[#4de88f] bg-clip-text text-transparent">première vente</span>
          </h2>
          <p className="text-gray-500 text-lg mt-4">En 4 étapes simples. 5 minutes chrono.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 01 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Target className="w-7 h-7 text-blue-600" />
              </div>
              <span className="text-6xl font-bold text-gray-200 group-hover:text-gray-300 transition-colors">01</span>
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-3">Tu parles à Noah</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Tu décris ton expertise en langage naturel. Pas de formulaires compliqués. 
              Juste une conversation.
            </p>
          </motion.div>

          {/* Step 02 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9 }}
            className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-pink-600" />
              </div>
              <span className="text-6xl font-bold text-gray-200 group-hover:text-gray-300 transition-colors">02</span>
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-3">Noah analyse ton marché</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Il valide ton idée, trouve ton client idéal, analyse la concurrence et calcule le prix optimal.
            </p>
          </motion.div>

          {/* Step 03 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0 }}
            className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <FileText className="w-7 h-7 text-amber-600" />
              </div>
              <span className="text-6xl font-bold text-gray-200 group-hover:text-gray-300 transition-colors">03</span>
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-3">Ton offre est générée</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Structure professionnelle complète : promesse, livrables, pricing, garanties. 
              Prêt à vendre.
            </p>
          </motion.div>

          {/* Step 04 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.1 }}
            className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-green-600" />
              </div>
              <span className="text-6xl font-bold text-gray-200 group-hover:text-gray-300 transition-colors">04</span>
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-3">Tu reçois tes messages</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Scripts prêts à envoyer : DMs, emails, page de vente. 
              Fais ta première vente dès ce soir.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* 🔥 NOUVELLE SECTION: PREUVE SOCIALE */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2 }}
        className="w-full bg-gradient-to-br from-gray-50 to-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Plus de <span className="text-[#61f7a2]">1000 offres</span> créées ce mois-ci
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">500K€+</div>
                <div className="text-gray-600 mt-1">générés par nos utilisateurs</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">3 jours</div>
                <div className="text-gray-600 mt-1">moyenne 1ère vente</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">67%</div>
                <div className="text-gray-600 mt-1">vendent en 48h</div>
              </div>
            </div>
          </div>

          {/* Témoignages Carousel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.3 + index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="inline-flex items-center gap-2 bg-green-50 rounded-full px-3 py-1.5">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">{testimonial.result}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 🔥 NOUVELLE SECTION: FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.6 }}
        className="w-full max-w-4xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Questions fréquentes
          </h2>
          <p className="text-gray-600 text-lg">
            Tout ce que tu dois savoir avant de commencer
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.7 + index * 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${
                    openFaqIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openFaqIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden">
                    <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bottom CTA Section - AMÉLIORÉ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.3 }}
        className="w-full bg-gradient-to-br from-gray-900 to-black py-12 md:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-5">
              Prêt à créer ton offre en 5 minutes ?
            </h2>
            <p className="text-base md:text-lg text-gray-300 mb-8">
              Rejoins 1000+ entrepreneurs qui ont transformé leur expertise en revenus
            </p>

            {/* Stats rapides */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-gray-300">
                <Check className="w-5 h-5 text-[#61f7a2]" />
                <span className="text-sm font-medium">1000+ offres créées</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Check className="w-5 h-5 text-[#61f7a2]" />
                <span className="text-sm font-medium">500K€+ générés</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Check className="w-5 h-5 text-[#61f7a2]" />
                <span className="text-sm font-medium">Première vente en 3 jours</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center mb-6">
              <Button
                onClick={handleStart}
                className="bg-gradient-to-br from-[#61f7a2] to-[#4de88f] text-gray-900 px-6 py-4 md:px-10 md:py-6 text-base md:text-lg font-semibold rounded-full transition-all duration-300 ease-out hover:shadow-[0_0_25px_rgba(97,247,162,0.6)] hover:brightness-110 hover:-translate-y-0.5 h-auto whitespace-normal text-center">
                <Sparkles className="w-5 h-5 mr-2 shrink-0" />
                Créer mon offre gratuitement
              </Button>
            </div>

            {/* Reassurance finale */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#61f7a2]" />
                <span>Aucune CB requise</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#61f7a2]" />
                <span>Résultat en 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#61f7a2]" />
                <span>RGPD compliant</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer - CONSERVÉ */}
      <footer className="w-full border-t border-gray-200 bg-gray-50/50 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3 self-center md:self-auto">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">PassionIA</p>
                <p className="text-xs text-gray-600">Technologie IA développée par IAVNIR©</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-xs text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors">Réglementation AI Act</a>
              <span className="text-gray-300 hidden md:inline">•</span>
              <a href="#" className="hover:text-gray-900 transition-colors">Protection des données</a>
              <span className="text-gray-300 hidden md:inline">•</span>
              <a href="#" className="hover:text-gray-900 transition-colors">RGPD</a>
              <span className="text-gray-300 hidden md:inline">•</span>
              <a href="#" className="hover:text-gray-900 transition-colors">Politique de confidentialité</a>
              <span className="text-gray-300 hidden md:inline">•</span>
              <a href="#" className="hover:text-gray-900 transition-colors">Mentions légales</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}