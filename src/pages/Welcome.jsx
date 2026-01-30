import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Sparkles, ArrowRight, Zap, Target, FileText, TrendingUp, Search, Music, Code, Languages, Dumbbell, ChefHat, Camera, Sword, Sparkle, Video, Heart } from "lucide-react";
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
  { icon: Sword, label: "Jiu jitsu", color: "bg-red-100 text-red-700 hover:bg-red-200" },
  { icon: Sparkle, label: "Intelligence artificielle", color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" },
  { icon: Video, label: "Montage vidéo", color: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200" },
  { icon: Heart, label: "Yoga", color: "bg-rose-100 text-rose-700 hover:bg-rose-200" }
];

export default function Welcome() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [wordIndex, setWordIndex] = useState(0);

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
            <span className="text-gray-700 text-xs md:text-sm font-medium">Propulsé par l'Intelligence Artificielle</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">

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
            en <span className="underline decoration-[#61f7a2]/30">première vente</span> <br className="md:hidden" />dès cette semaine.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-base md:text-xl text-gray-600 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
            Notre IA sur-entraînée transforme ton savoir en offres, messages et page de vente, avec un plan clair et personnalisé.
          </motion.p>

          {/* Search Bar */}
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

              {/* Bouton Démarrer - Noir avec Glow Vert */}
              <Button
                onClick={handleStart}
                className="w-full md:w-auto bg-gradient-to-br from-[#1a1a1a] to-black text-white border border-transparent px-6 h-10 md:h-12 rounded-xl md:rounded-full font-semibold transition-all duration-300 ease-out hover:shadow-[0_0_20px_rgba(97,247,162,0.4)] hover:border-[#61f7a2]/30 hover:-translate-y-0.5 whitespace-nowrap">
                Découvrir mon potentiel
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* Scrolling Categories Tags - Défilement Horizontal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="relative mt-12 overflow-hidden max-w-2xl mx-auto py-2"
          >
            {/* Conteneur de défilement (Marquee) */}
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
                {/* On double la liste pour un effet de boucle infinie sans coupure */}
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

            {/* Effet de fondu sur les côtés pour le style "Premium" */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-gray-50 via-gray-50/20 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-gray-50 via-gray-50/20 to-transparent pointer-events-none z-10" />
          </motion.div>
        </div>

        {/* Floating Cards around Hero */}
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

      {/* 4 Steps Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="w-full max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            4 étapes pour <span className="bg-gradient-to-r from-[#61f7a2] to-[#4de88f] bg-clip-text text-transparent">démarrer</span>
          </h2>
          <p className="text-gray-500 text-sm">Qui te guide du début à ta première vente.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 01 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Target className="w-7 h-7 text-blue-600" />
              </div>
              <span className="text-6xl font-bold text-gray-200 group-hover:text-gray-300 transition-colors">01</span>
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-3">On comprend ton potentiel</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Tu nous parles de ta passion, de ton parcours ou de ce que tu sais faire. L'IA s'adapte à ton niveau.
            </p>
          </motion.div>

          {/* Step 02 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-pink-600" />
              </div>
              <span className="text-6xl font-bold text-gray-200 group-hover:text-gray-300 transition-colors">02</span>
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-3">L'IA fait le travail stratégique</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Notre IA sur-entraînée analyse ton idée, ton marché et ce que tu peux vendre. Tu n'as rien à deviner.
            </p>
          </motion.div>

          {/* Step 03 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7 }}
            className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <FileText className="w-7 h-7 text-amber-600" />
              </div>
              <span className="text-6xl font-bold text-gray-200 group-hover:text-gray-300 transition-colors">03</span>
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-3">Tout est prêt pour vendre</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Offres, messages de vente, emails et page de vente sont générés pour toi. Prêts à être utilisés, pas à compléter.
            </p>
          </motion.div>

          {/* Step 04 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-green-600" />
              </div>
              <span className="text-6xl font-bold text-gray-200 group-hover:text-gray-300 transition-colors">04</span>
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-3">Suis ton plan personnalisé</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Un plan d'action clair sur 7 jours, basé sur ton produit low-ticket. Une action par jour. Pas plus.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.9 }}
        className="w-full bg-gradient-to-br from-gray-50 to-white py-12 md:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-12">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-5">
                Tu n'as rien à perdre. Tout à construire.
              </h2>
              <p className="text-base md:text-lg text-gray-600 mb-8">
                Tu ne t'engages pas dans un projet compliqué. Tu commences simplement par comprendre ton potentiel — le reste est guidé.
              </p>

              {/* Two badges */}
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 mb-8">
                <div className="inline-flex items-center justify-center gap-2 bg-gray-100 rounded-full px-4 py-2 md:px-5 md:py-3">
                  <span className="text-gray-700 text-sm font-medium">✓ Inscription 100% gratuite</span>
                </div>
                <div className="inline-flex items-center justify-center gap-2 bg-gray-100 rounded-full px-4 py-2 md:px-5 md:py-3">
                  <span className="text-gray-700 text-sm font-medium">✓ Sans expertise technique</span>
                </div>
              </div>

              {/* CTA Button - Vert avec Glow Intense */}
              <div className="flex justify-center mb-4">
                <Button
                  onClick={handleStart}
                  className="bg-gradient-to-br from-[#61f7a2] to-[#4de88f] text-gray-900 px-6 py-4 md:px-10 md:py-6 text-base md:text-lg font-semibold rounded-full transition-all duration-300 ease-out hover:shadow-[0_0_25px_rgba(97,247,162,0.6)] hover:brightness-110 hover:-translate-y-0.5 h-auto whitespace-normal text-center">
                  <Sparkles className="w-5 h-5 mr-2 shrink-0" />
                  Commencer gratuitement
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
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