import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Sparkles, ArrowRight, CheckCircle, Zap, Target, FileText } from "lucide-react";
import GlowButton from '@/components/ui/GlowButton';

const benefits = [
  { icon: Target, text: "Trouve ta passion rentable" },
  { icon: Zap, text: "Crée ton offre en quelques minutes" },
  { icon: FileText, text: "Génère tous tes documents IA" },
];

export default function Welcome() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuthenticated = await base44.auth.isAuthenticated();
      if (isAuthenticated) {
        const user = await base44.auth.me();
        const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
        
        if (profiles.length > 0 && profiles[0].has_paid) {
          navigate(createPageUrl('Dashboard'));
        } else if (profiles.length > 0 && profiles[0].onboarding_completed) {
          navigate(createPageUrl('Results'));
        }
      }
    } catch (err) {
      // Not authenticated
    } finally {
      setCheckingAuth(false);
    }
  };
  
  const handleStart = () => {
    base44.auth.redirectToLogin(createPageUrl('Onboarding'));
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl('Dashboard'));
  };
  
  return (
    <div className="min-h-screen bg-[#11112b] flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl text-center">
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
          
          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap justify-center gap-6 mb-12"
          >
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 text-gray-300"
              >
                <CheckCircle className="w-5 h-5 text-[#61f7a2]" />
                <span>{benefit.text}</span>
              </div>
            ))}
          </motion.div>
          
          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-4"
          >
            <GlowButton 
              onClick={handleStart}
              size="lg"
              className="text-lg px-12"
            >
              Commencer maintenant
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
            
            <p className="text-gray-400 text-sm mt-4">
              Déjà un compte ?{' '}
              <button 
                onClick={handleLogin}
                className="text-[#61f7a2] hover:underline font-medium"
              >
                Se connecter
              </button>
            </p>
            
            <p className="text-gray-500 text-xs">
              Gratuit • Aucune carte requise • 5 minutes
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom decoration */}
      <div className="h-32 bg-gradient-to-t from-[#61f7a2]/5 to-transparent" />
    </div>
  );
}