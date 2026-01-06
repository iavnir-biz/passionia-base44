import React, { useState } from 'react';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Sparkles, ArrowRight, Zap, Target, FileText, TrendingUp, Play, Brain, Database, Cpu, Network, Search, Music, Code, Languages, Dumbbell, ChefHat, Camera, Sword, Sparkle, Video, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Floating AI Icons Component
const FloatingIcon = ({ icon: Icon, delay = 0, className = "", mobile = false }) =>
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
  </motion.div>;


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
}];


const categories = [
  { icon: Music, label: "Composition musicale", color: "bg-pink-100 text-pink-700 hover:bg-pink-200" },
  { icon: Code, label: "Code Python", color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
  { icon: Sparkle, label: "Intelligence artificielle", color: "bg-green-100 text-green-700 hover:bg-green-200" },
  { icon: Dumbbell, label: "Calisthenie", color: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
  { icon: ChefHat, label: "Cuisine moléculaire", color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" },
  { icon: Sword, label: "Jujitsu", color: "bg-red-100 text-red-700 hover:bg-red-200" },
  { icon: Video, label: "Montage vidéo", color: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200" },
  { icon: Heart, label: "Yoga", color: "bg-rose-100 text-rose-700 hover:bg-rose-200" },
];

export default function Welcome() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const handleStart = () => {
    navigate(createPageUrl('OnboardingFirstName'));
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl('Dashboard'));
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

        <div className="max-w-4xl text-center relative z-10">
          {/* AI Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-5 py-2.5 mb-8 shadow-sm">

            <Sparkles className="w-4 h-4 text-[#61f7a2]" />
            <span className="text-gray-700 text-sm font-medium">Propulsé par l'Intelligence Artificielle</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">

            Construis ton activité en ligne<br />grâce à{' '}
            <span className="text-[#61f7a2]">ton savoir-faire + l'IA</span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">

            Transmets ton savoir-faire, tes compétences ou ta passion et crée une véritable activité de formation en ligne, tout en impactant positivement la vie des autres.
          </motion.p>
          
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-6 max-w-2xl mx-auto">

            <div className="relative backdrop-blur-sm bg-white/95 rounded-2xl shadow-xl p-3 flex items-center gap-3 border border-gray-200">
              <Search className="w-5 h-5 text-gray-400 ml-3" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Quelle compétence veux-tu transmettre !"
                className="flex-1 border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 text-base h-12"
              />
              <Button
                onClick={handleStart}
                className="bg-[#61f7a2] hover:bg-[#4de88f] text-white px-6 h-12 rounded-xl font-semibold shadow-md transition-all">
                Démarrer
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* Category Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => handleCategoryClick(category.label)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 ${category.color}`}
              >
                <category.icon className="w-3.5 h-3.5" />
                {category.label}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Floating Cards around Hero - Smaller */}
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

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">
          4 étapes pour <span className="bg-gradient-to-r from-[#61f7a2] to-[#4de88f] bg-clip-text text-transparent">démarrer</span>
        </h2>

        {/* Steps Grid */}
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
            <h3 className="text-gray-900 font-bold text-lg mb-3">Crée ton profil</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Présente ta passion, ton expérience ou ton savoir-faire. L'IA s'adapte à ton parcours.
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
            <h3 className="text-gray-900 font-bold text-lg mb-3">Discute avec l'IA</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Notre IA t'aide à transformer ta passion en activité viable en quelques minutes.
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
            <h3 className="text-gray-900 font-bold text-lg mb-3">Récupère tes documents IA</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Offre, avatars, messages de vente, emails et page de vente prêts à l'emploi.
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
            <h3 className="text-gray-900 font-bold text-lg mb-3">Passe à l'action</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Un plan d'action personnalisé pour avancer concrètement, jour après jour.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.9 }}
        className="w-full bg-gradient-to-br from-gray-50 to-white py-24">

        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-xl p-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">
                Prêt à transformer tes <span className="text-[#61f7a2]">compétences</span> en véritable activité en ligne ?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Découvre comment ton savoir-faire peut générer de vrais revenus grâce à l'IA. <span className="text-gray-900 font-semibold">Commence dès maintenant !</span>
              </p>

              {/* Three badges */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-5 py-3">
                  <span className="text-gray-700 text-sm font-medium">✓ Inscription 100% gratuite</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-5 py-3">
                  <span className="text-gray-700 text-sm font-medium">✓ Documents IA offerts</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-5 py-3">
                  <span className="text-gray-700 text-sm font-medium">✓ Communauté vérifiée</span>
                </div>
              </div>

              {/* Main CTA Button */}
              <div className="flex justify-center mb-4">
                <Button
                  onClick={handleStart}
                  className="bg-[#61f7a2] hover:bg-[#4de88f] text-gray-900 px-10 py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Commencer gratuitement
                </Button>
              </div>


            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer - Institutional & Legal */}
      <footer className="w-full border-t border-gray-200 bg-gray-50/50 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-row justify-between items-center gap-6 overflow-x-auto">
            {/* Left - Brand & Technology */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">PassionIA</p>
                <p className="text-xs text-gray-600">
                  Technologie d'intelligence artificielle développée par IAVNIR INC
                </p>
              </div>
            </div>

            {/* Right - Legal Links */}
            <div className="flex items-center justify-center gap-4 text-xs text-gray-600 whitespace-nowrap overflow-x-auto">
              <a href="#" className="hover:text-gray-900 transition-colors">Réglementation AI Act</a>
              <span className="text-gray-300">•</span>
              <a href="#" className="hover:text-gray-900 transition-colors">Protection des données</a>
              <span className="text-gray-300">•</span>
              <a href="#" className="hover:text-gray-900 transition-colors">RGPD</a>
              <span className="text-gray-300">•</span>
              <a href="#" className="hover:text-gray-900 transition-colors">Politique de confidentialité</a>
              <span className="text-gray-300">•</span>
              <a href="#" className="hover:text-gray-900 transition-colors">Mentions légales</a>
            </div>
          </div>
        </div>
      </footer>
    </div>);

}