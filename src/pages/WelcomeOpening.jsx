import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import GlowButton from '@/components/ui/GlowButton';

export default function WelcomeOpening() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    triggerConfetti();
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (!currentUser.has_purchased) {
        navigate(createPageUrl('CTAPAYWALL'));
        return;
      }

      // 🔒 Si l'utilisateur a déjà visité cette page (assets générés), redirect Dashboard
      const sessions = await base44.entities.Session.filter({ created_by: currentUser.email });
      if (sessions.length > 0) {
        const session = sessions[0];
        setSession(session);
        
        // Si les assets sont déjà générés → Dashboard
        if (session.assets_generation_completed_at) {
          console.log('✅ [WelcomeOpening] Assets déjà générés, redirect Dashboard');
          navigate(createPageUrl('Dashboard'));
          return;
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = () => {
    navigate(createPageUrl('NoahGeneration'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        {/* Confirmation Paiement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] shadow-2xl mb-8"
          >
            <Sparkles className="w-14 h-14 text-white" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Paiement réussi ✅
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="max-w-xl mx-auto"
          >
            <p className="text-xl text-gray-700 mb-6">
              Ton accès est activé.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Noah est en train de construire ton business personnalisé : offres, messages, emails, page de vente et plan d'action.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center"
            >
              <GlowButton
                onClick={handleStart}
                size="lg"
                className="px-12"
              >
                Démarrer mon aventure
              </GlowButton>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}