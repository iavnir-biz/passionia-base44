import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';

export default function OnboardingTransition() {
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

  const handleNext = () => {
    navigate(createPageUrl('OnboardingQ12AgeRange'));
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
          {/* Nova Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center leading-relaxed">
            J'analyse... merci pour toutes ces réponses, {user?.firstName} ! 
            Je peux déjà te dire que ta passion vaut de l'or 💎
          </h1>

          <p className="text-gray-700 text-center mb-8 leading-relaxed">
            J'ai encore quelques questions à te poser, puis je te montrerai toutes tes offres personnalisées.
          </p>

          <div className="mt-8">
            <GlowButton
              onClick={handleNext}
              className="w-full"
              size="lg"
            >
              C'est parti pour la suite
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}