import React from 'react';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Sparkles, ArrowRight, Zap, Target, FileText, TrendingUp } from "lucide-react";
import GlowButton from '@/components/ui/GlowButton';
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d24] via-[#11112b] to-[#1a1a3e] relative overflow-hidden flex flex-col">
      {/* Background halos/blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#61f7a2]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#61f7a2]/5 rounded-full blur-[180px]" />
      </div>

      {/* Header with logo and login button */}
      <header className="relative z-10 w-full flex justify-between items-center p-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-lg shadow-[#61f7a2]/20">
          <Sparkles className="w-6 h-6 text-[#11112b]" />
        </div>
        <Button
          variant="outline"
          onClick={handleLogin}
          className="bg-white/5 backdrop-blur-sm border-white/10 text-white hover:bg-white/10 px-8 py-2 rounded-2xl transition-all duration-300"
        >
          Connexion
        </Button>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6 pt-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-3xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-12 shadow-2xl"
        >
          <div className="text-center">
            {/* AI Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5 mb-8"
            >
              <Sparkles className="w-4 h-4 text-[#61f7a2]" />
              <span className="text-[#61f7a2] text-sm font-medium">Propulsé par l'Intelligence Artificielle</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Construis ton activité en ligne grâce à{' '}
              <span className="bg-gradient-to-r from-[#61f7a2] to-[#4de88f] bg-clip-text text-transparent">ton savoir-faire + l'IA</span>
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Transforme ta passion en business rentable avec l'aide de l'intelligence artificielle
            </motion.p>
            
            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col items-center"
            >
              <button
                onClick={handleStart}
                className="group relative bg-[#61f7a2] text-[#11112b] font-semibold text-lg px-12 py-4 rounded-2xl shadow-lg shadow-[#61f7a2]/30 hover:shadow-xl hover:shadow-[#61f7a2]/40 hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                Commencer maintenant
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 rounded-2xl bg-[#61f7a2] blur-xl opacity-50 group-hover:opacity-70 -z-10 transition-opacity" />
              </button>
              
              <p className="text-gray-400 text-sm mt-4">
                Gratuit • Aucune carte requise • 5 minutes
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#61f7a2]/10 flex items-center justify-center mb-5 group-hover:bg-[#61f7a2]/20 transition-colors">
                <feature.icon className="w-7 h-7 text-[#61f7a2]" />
              </div>
              <h3 className="text-white font-bold text-lg mb-3">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bottom CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="relative z-10 w-full py-20"
      >
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-12 text-center shadow-2xl"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prêt à transformer ta passion en business ?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
              Rejoins des centaines d'entrepreneurs qui ont déjà lancé leur activité grâce à PASSION IA.
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleStart}
                className="group relative bg-[#61f7a2] text-[#11112b] font-semibold text-lg px-10 py-4 rounded-2xl shadow-lg shadow-[#61f7a2]/30 hover:shadow-xl hover:shadow-[#61f7a2]/40 hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Commencer maintenant
                <div className="absolute inset-0 rounded-2xl bg-[#61f7a2] blur-xl opacity-50 group-hover:opacity-70 -z-10 transition-opacity" />
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Spacing bottom */}
      <div className="h-12" />
    </div>
  );
}