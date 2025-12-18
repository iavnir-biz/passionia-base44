import React from 'react';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Sparkles, ArrowRight, Zap, Target, FileText, TrendingUp, Play, Brain, Database, Cpu, Network } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const features = [
  { 
    icon: Zap, 
    title: "Analyse IA instantanée", 
    description: "Transformez votre passion en business validé en quelques minutes." 
  },
  { 
    icon: Target, 
    title: "Plan d'action personnalisé", 
    description: "Un roadmap sur-mesure pour atteindre vos premiers revenus." 
  },
  { 
    icon: FileText, 
    title: "Documents générés", 
    description: "Page de vente, emails, scripts DM... tout prêt à l'emploi." 
  },
  { 
    icon: TrendingUp, 
    title: "Suivi progression", 
    description: "Suivez votre avancement et restez motivé chaque jour." 
  },
];

export default function Welcome() {
  const navigate = useNavigate();
  
  const handleStart = () => {
    navigate(createPageUrl('OnboardingFirstName'));
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl('Dashboard'));
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-8 py-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <Button
          variant="outline"
          onClick={handleLogin}
          className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-2 rounded-xl font-medium"
        >
          Connexion
        </Button>
      </header>

      {/* Hero Section with Floating Cards */}
      <div className="relative flex items-center justify-center px-6 py-20 md:py-32 overflow-hidden">
        {/* Desktop Floating AI Icons - Left Side */}
        <FloatingIcon icon={Brain} delay={0} className="hidden md:block absolute left-8 top-20" />
        <FloatingIcon icon={Zap} delay={0.3} className="hidden md:block absolute left-16 top-1/3" />
        <FloatingIcon icon={Database} delay={0.6} className="hidden md:block absolute left-12 bottom-32" />
        <FloatingIcon icon={Sparkles} delay={0.9} className="hidden md:block absolute left-20 bottom-1/4" />
        
        {/* Desktop Floating AI Icons - Right Side */}
        <FloatingIcon icon={Cpu} delay={0.2} className="hidden md:block absolute right-12 top-24" />
        <FloatingIcon icon={Network} delay={0.5} className="hidden md:block absolute right-20 top-1/3" />
        <FloatingIcon icon={Sparkles} delay={0.8} className="hidden md:block absolute right-16 bottom-28" />
        <FloatingIcon icon={Zap} delay={1.1} className="hidden md:block absolute right-24 bottom-1/4" />
        
        {/* Mobile Floating AI Icons - Around Title (plus visibles) */}
        <FloatingIcon icon={Brain} delay={0} mobile={true} className="md:hidden absolute left-4 top-24" />
        <FloatingIcon icon={Sparkles} delay={0.4} mobile={true} className="md:hidden absolute right-4 top-20" />
        <FloatingIcon icon={Zap} delay={0.8} mobile={true} className="md:hidden absolute left-6 top-52" />
        <FloatingIcon icon={Cpu} delay={1.2} mobile={true} className="md:hidden absolute right-6 top-56" />
        <FloatingIcon icon={Network} delay={0.2} mobile={true} className="md:hidden absolute left-8 bottom-1/3" />
        <FloatingIcon icon={Database} delay={0.6} mobile={true} className="md:hidden absolute right-8 bottom-1/3" />
        <FloatingIcon icon={Sparkles} delay={1.0} mobile={true} className="md:hidden absolute left-4 bottom-1/4" />
        <FloatingIcon icon={Zap} delay={1.4} mobile={true} className="md:hidden absolute right-4 bottom-1/4" />

        <div className="max-w-4xl text-center relative z-10">
          {/* AI Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-5 py-2.5 mb-8 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-[#61f7a2]" />
            <span className="text-gray-700 text-sm font-medium">Propulsé par l'Intelligence Artificielle</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Construis ton activité en ligne<br />grâce à{' '}
            <span className="text-[#61f7a2]">ton savoir-faire + l'IA</span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Transforme ta passion en business rentable avec l'aide de l'intelligence artificielle
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center mb-6"
          >
            <Button
              onClick={handleStart}
              className="bg-[#61f7a2] hover:bg-[#4de88f] text-gray-900 px-8 py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              Commencer maintenant
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
          
          <p className="text-gray-500 text-sm">
            Gratuit • Aucune carte requise • 5 minutes
          </p>
        </div>

        {/* Floating Cards around Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="hidden lg:block absolute top-10 left-20 w-32 h-32 bg-white rounded-3xl shadow-xl p-4"
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center">
            <Target className="w-12 h-12 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="hidden lg:block absolute top-32 right-24 w-40 h-40 bg-white rounded-3xl shadow-xl p-4"
        >
          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl flex items-center justify-center">
            <Zap className="w-14 h-14 text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="hidden lg:block absolute bottom-20 left-32 w-36 h-36 bg-white rounded-3xl shadow-xl p-4"
        >
          <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-12 h-12 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="hidden lg:block absolute bottom-32 right-20 w-32 h-32 bg-white rounded-3xl shadow-xl p-4"
        >
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center">
            <FileText className="w-12 h-12 text-amber-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="hidden lg:block absolute top-1/2 left-10 w-28 h-28 bg-white rounded-3xl shadow-xl p-3"
        >
          <div className="w-full h-full bg-gradient-to-br from-pink-100 to-pink-50 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-pink-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          className="hidden lg:block absolute top-1/2 right-16 w-28 h-28 bg-white rounded-3xl shadow-xl p-3"
        >
          <div className="w-full h-full bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-2xl flex items-center justify-center">
            <ArrowRight className="w-10 h-10 text-cyan-600" />
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="w-full max-w-6xl mx-auto px-6 py-20"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + index * 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#61f7a2]/20 to-[#61f7a2]/10 flex items-center justify-center mb-5">
                <feature.icon className="w-7 h-7 text-[#61f7a2]" />
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-3">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bottom CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="w-full bg-gradient-to-br from-gray-50 to-white py-24"
      >
        <div className="max-w-2xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">
            Prêt à transformer ta passion en business ?
          </h2>
          <p className="text-gray-600 text-lg mb-10 leading-relaxed">
            Rejoins des centaines d'entrepreneurs qui ont déjà lancé leur activité grâce à PASSION IA.
          </p>
          <div className="flex justify-center">
            <Button
              onClick={handleStart}
              className="bg-[#61f7a2] hover:bg-[#4de88f] text-gray-900 px-10 py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Commencer maintenant
            </Button>
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
              </div>
            </div>

            {/* Right - Legal Links */}
            <div className="flex flex-col items-end justify-center gap-2 text-xs text-gray-600 whitespace-nowrap overflow-x-auto">
              <div className="flex items-center gap-4">
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
              <p className="text-gray-500">
                Technologie d'intelligence artificielle développée par IAVNIR INC
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}