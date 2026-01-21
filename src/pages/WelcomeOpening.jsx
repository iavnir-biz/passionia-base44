import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
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

      // Vérifier si les assets sont déjà générés
      const sessions = await base44.entities.Session.filter({ created_by: currentUser.email });
      if (sessions.length > 0) {
        const userSession = sessions[0];
        setSession(userSession);
        
        // Si tout est déjà prêt, redirect direct vers Dashboard
        if (userSession.all_assets_ready) {
          console.log('✅ [WelcomeOpening] Assets déjà générés, redirect Dashboard');
          navigate(createPageUrl('Dashboard'));
          return;
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
    }
  };

  const handleStart = () => {
    // Redirect vers SetupProfile
    navigate(createPageUrl('SetupProfile'));
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
            <p className="text-lg text-gray-600 mb-4">
              Noah va générer tous tes documents personnalisés :
            </p>
            
            {/* Liste de ce qui va être généré */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 mb-8 border border-green-100 text-left">
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  <span>Analyse de marché complète avec SWOT</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  <span>3 Avatars clients ultra-détaillés</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  <span>4 Offres complètes avec prix et positionnement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  <span>8 Messages de vente prêts à envoyer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  <span>5 Emails marketing en séquence</span>
                </li>
              </ul>
            </div>

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
                C'est parti ! 🚀
              </GlowButton>
            </motion.div>
            
            <p className="text-sm text-gray-500 mt-6">
              Ça prend environ 1-2 minutes, tu verras la progression en temps réel.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}