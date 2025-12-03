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
    navigate(createPageUrl('Onboarding'));
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl('Dashboard'));
  };
  
  return (
    <div className="min-h-screen bg-[#11112b] flex flex-col">
      {/* Header with logo and login button */}
      <header className="w-full flex justify-between items-center p-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-[#11112b]" />
        </div>
        <Button
          variant="outline"
          onClick={handleLogin}
          className="bg-[#1b1b33] border-[#2a2a45] text-white hover:bg-[#2a2a45] px-8 py-2 rounded-xl"
        >
          Connexion
        </Button>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center p-6 pt-0">
        <div className="max-w-2xl text-center">
          {/* AI Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-[#1b1b33] border border-[#2a2a45] rounded-full px-5 py-2.5 mb-8"
          >
            <Sparkles className="w-4 h-4 text-[#61f7a2]" />
            <span className="text-[#61f7a2] text-sm font-medium">Propulsé par l'Intelligence Artificielle</span>
          </motion.div>

          {/* Logo animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] mx-auto mb-8 flex items-center justify-center glow-green"
          >
            <Sparkles className="w-10 h-10 text-[#11112b]" />
          </motion.div>
          
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Construis ton activité en ligne grâce à{' '}
            <span className="text-[#61f7a2]">ton savoir-faire + l'IA</span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-gray-400 mb-10 max-w-xl mx-auto"
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
            <GlowButton 
              onClick={handleStart}
              size="lg"
              className="text-lg px-12"
            >
              Commencer maintenant
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
            
            <p className="text-gray-500 text-sm mt-4">
              Gratuit • Aucune carte requise • 5 minutes
            </p>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="w-full max-w-6xl mx-auto px-6 pb-12"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-[#1b1b33] border border-[#2a2a45] rounded-xl p-5"
            >
              <div className="w-12 h-12 rounded-xl bg-[#2a2a45] flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-[#61f7a2]" />
              </div>
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bottom CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="w-full bg-[#1b1b33] border-t border-[#2a2a45] py-16"
      >
        <div className="max-w-2xl mx-auto text-center px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Prêt à transformer ta passion en business ?
          </h2>
          <p className="text-gray-400 mb-8">
            Rejoins des centaines d'entrepreneurs qui ont déjà lancé leur activité grâce à PASSION IA.
          </p>
          <GlowButton 
            onClick={handleStart}
            size="lg"
            className="text-lg px-10"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Commencer maintenant
          </GlowButton>
        </div>
      </motion.div>
    </div>
  );
}