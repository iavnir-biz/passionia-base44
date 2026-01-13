import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion"; // Ajout de AnimatePresence
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Sparkles, ArrowRight, Zap, Target, FileText, TrendingUp, Search, Music, Code, Languages, Dumbbell, ChefHat, Camera, Sword, Sparkle, Video, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Liste des mots pour le roulement
const ROTATING_WORDS = ["Savoir", "Passion", "Talent", "Vécu", "Expertise"];

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
    className={className}
  >
    <Icon className={mobile ? "w-6 h-6 text-[#61f7a2]" : "w-10 h-10 md:w-12 md:h-12 text-[#61f7a2]"} />
  </motion.div>
);

const categories = [
  { icon: Music, label: "Composition musicale", color: "bg-pink-100 text-pink-700 hover:bg-pink-200" },
  { icon: Code, label: "Programmation Python", color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
  { icon: Languages, label: "Anglais", color: "bg-green-100 text-green-700 hover:bg-green-200" },
  { icon: Dumbbell, label: "Calisthénie", color: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
  { icon: ChefHat, label: "Cuisine moléculaire", color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" },
  { icon: Camera, label: "Photographie", color: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
  { icon: Sword, label: "Jujitsu", color: "bg-red-100 text-red-700 hover:bg-red-200" },
  { icon: Sparkle, label: "Intelligence artificielle", color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" },
  { icon: Video, label: "Montage vidéo", color: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200" },
  { icon: Heart, label: "Yoga", color: "bg-rose-100 text-rose-700 hover:bg-rose-200" }
];

export default function Welcome() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [wordIndex, setWordIndex] = useState(0);

  // Effet pour faire tourner les mots toutes les 2.5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    // Petit bonus : on passe la recherche à la page suivante si l'utilisateur a tapé quelque chose
    navigate(createPageUrl('OnboardingFirstName'), { state: { niche: searchValue } });
  };

  const handleCategoryClick = (category) => {
    setSearchValue(category);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-8 py-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleStart}
            className="bg-[#61f7a2] hover:bg-[#4de88f] text-gray-900 px-8 py-2 rounded-xl font-medium shadow-sm">
            Démarrer gratuitement
          </Button>
        </div>
      </header>

      {/* Hero Section with Floating Cards */}
      <div className="relative flex items-center justify-center px-6 py-20 md:py-32 overflow-hidden">
        
        <div className="max-w-5xl text-center relative z-10">
          {/* AI Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-5 py-2.5 mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#61f7a2]" />
            <span className="text-gray-700 text-sm font-medium">Propulsé par l'Intelligence Artificielle</span>
          </motion.div>

          {/* Title Animated */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Transforme ton{" "}
            <span className="inline-block relative w-[240px] text-left align-top h-[1.2em] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={ROTATING_WORDS[wordIndex]}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute left-0 text-[#61f7a2]"
                >
                  {ROTATING_WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
            <br className="hidden md:block" />
            en <span className="underline decoration-[#61f7a2]/30">première vente</span> dès cette semaine.
          </h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            L'IA génère ton offre, ta page de vente et tes emails. Tu n'as plus qu'à partager ta passion.
          </motion.p>
          
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-8 max-w-2xl mx-auto">
            <div className="relative backdrop-blur-sm bg-white/95 rounded-2xl shadow-xl p-3 flex items-center gap-3 border border-gray-200 hover:border-[#61f7a2] transition-colors">
              <Search className="w-5 h-5 text-gray-400 ml-3" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Ex : Yoga, Gestion du stress, Python, Cuisine..."
                className="flex-1 border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 text-lg h-12" 
              />
              <Button
                onClick={handleStart}
                className="bg-[#61f7a2] hover:bg-[#4de88f] text-gray-900 px-8 h-12 rounded-xl font-bold text-lg shadow-md transition-all hover:scale-105">
                Démarrer
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <p className="text-sm text-gray-400 mt-3">
              Commence gratuitement, sans carte bancaire.
            </p>
          </motion.div>

          {/* Category Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto opacity-80 hover:opacity-100 transition-opacity">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => handleCategoryClick(category.label)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-110 cursor-pointer ${category.color}`}>
                <category.icon className="w-3.5 h-3.5" />
                {category.label}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Floating Icons Background (Décoration) */}
        <FloatingIcon icon={Target} delay={0} className="hidden lg:block absolute top-16 left-8 w-16 h-16 bg-white rounded-2xl shadow-lg p-3 flex items-center justify-center" />
        <FloatingIcon icon={Zap} delay={0.5} className="hidden lg:block absolute top-24 right-8 w-16 h-16 bg-white rounded-2xl shadow-lg p-3 flex items-center justify-center" />
        <FloatingIcon icon={TrendingUp} delay={1} className="hidden lg:block absolute bottom-32 left-12 w-16 h-16 bg-white rounded-2xl shadow-lg p-3 flex items-center justify-center" />
        <FloatingIcon icon={FileText} delay={1.5} className="hidden lg:block absolute bottom-24 right-12 w-16 h-16 bg-white rounded-2xl shadow-lg p-3 flex items-center justify-center" />

      </div>

      {/* 4 Steps Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-6xl mx-auto px-6 py-24">

        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            4 étapes pour <span className="bg-gradient-to-r from-[#61f7a2] to-[#4de88f] bg-clip-text text-transparent">encaisser</span>
          </h2>
          <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Ta roadmap vers la liberté</p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StepCard 
            number="01" 
            icon={Target} 
            color="text-blue-600 bg-blue-500/10"
            title="Crée ton profil" 
            desc="Présente ta passion. L'IA analyse instantanément ton potentiel de marché." 
          />
          <StepCard 
            number="02" 
            icon={Sparkles} 
            color="text-pink-600 bg-pink-500/10"
            title="Active l'IA" 
            desc="Laisse l'algorithme générer ton offre irrésistible et tes prix." 
          />
          <StepCard 
            number="03" 
            icon={FileText} 
            color="text-amber-600 bg-amber-500/10"
            title="Récupère tout" 
            desc="Page de vente, emails, scripts... Tout est prêt à être copié-collé." 
          />
          <StepCard 
            number="04" 
            icon={TrendingUp} 
            color="text-green-600 bg-green-500/10"
            title="Fais ta vente" 
            desc="Suis le plan de 7 jours pour obtenir ton premier virement." 
          />
        </div>
      </motion.div>

      {/* Footer CTA */}
      <div className="w-full bg-gray-50 py-24 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Arrête de réfléchir.<br/>
            <span className="text-[#61f7a2]">Commence à vendre.</span>
          </h2>
          <div className="flex justify-center gap-4 mb-8">
            <Badge text="Inscription gratuite" />
            <Badge text="Pas de carte requise" />
            <Badge text="Annulable à tout moment" />
          </div>
          <Button
            onClick={handleStart}
            className="bg-[#61f7a2] hover:bg-[#4de88f] text-gray-900 px-12 py-8 text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
            Je lance mon activité maintenant
          </Button>
        </div>
      </div>
    </div>
  );
}

// Sub-components for cleaner code
const StepCard = ({ number, icon: Icon, color, title, desc }) => (
  <div className="relative bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#61f7a2]/30 transition-all group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center`}>
        <Icon className="w-7 h-7" />
      </div>
      <span className="text-5xl font-bold text-gray-100 group-hover:text-gray-200 transition-colors">{number}</span>
    </div>
    <h3 className="text-gray-900 font-bold text-lg mb-3">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
  </div>
);

const Badge = ({ text }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600">
    ✓ {text}
  </span>
);