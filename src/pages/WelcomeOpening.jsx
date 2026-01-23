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
  const [isLoading, setIsLoading] = useState(true);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  useEffect(() => {
    // Vérifier si on vient d'un paiement réussi
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment') === 'success';

    if (paymentSuccess) {
      // Paiement réussi - attendre que le webhook traite le paiement
      console.log('[WelcomeOpening] Payment success detected, waiting for webhook...');
      loadDataWithRetry();
    } else {
      // Accès direct - vérifier immédiatement
      loadData();
    }

    triggerConfetti();
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const loadDataWithRetry = async (attemptNumber = 0) => {
    try {
      const currentUser = await base44.auth.me();

      if (currentUser.has_purchased) {
        // Paiement confirmé !
        console.log('[WelcomeOpening] Payment verified successfully');
        setUser(currentUser);
        setIsLoading(false);
        return;
      }

      // Pas encore confirmé - retry jusqu'à 10 fois (20 secondes max)
      if (attemptNumber < 10) {
        console.log(`[WelcomeOpening] Payment not yet confirmed, retry ${attemptNumber + 1}/10...`);
        setVerificationAttempts(attemptNumber + 1);
        setTimeout(() => {
          loadDataWithRetry(attemptNumber + 1);
        }, 2000); // Attendre 2 secondes avant de réessayer
      } else {
        // Échec après 10 tentatives - rediriger avec message d'erreur
        console.error('[WelcomeOpening] Payment verification failed after 10 attempts');
        alert('Ton paiement a bien été reçu mais la confirmation prend plus de temps que prévu. Tu vas recevoir un email avec un lien d\'accès. Contacte le support si besoin.');
        navigate(createPageUrl('CTAPAYWALL'));
      }
    } catch (error) {
      console.error('[WelcomeOpening] Error verifying payment:', error);
      // En cas d'erreur, continuer à retry
      if (attemptNumber < 10) {
        setTimeout(() => {
          loadDataWithRetry(attemptNumber + 1);
        }, 2000);
      } else {
        setIsLoading(false);
      }
    }
  };

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (!currentUser.has_purchased) {
        navigate(createPageUrl('CTAPAYWALL'));
        return;
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
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#61f7a2] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {verificationAttempts > 0
              ? 'Vérification de ton paiement...'
              : 'Chargement...'}
          </h2>
          {verificationAttempts > 0 && (
            <p className="text-gray-600 text-sm">
              Confirmation en cours ({verificationAttempts}/10)... Cela prend généralement quelques secondes.
            </p>
          )}
        </div>
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
            Bienvenue dans Passion IA ! 🎉
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
              Tu vas pouvoir générer tous tes documents personnalisés :
            </p>
            
            {/* Liste de ce qui va être disponible */}
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
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  <span>Page de vente prête à convertir</span>
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
                Accéder à mon dashboard 🚀
              </GlowButton>
            </motion.div>
            
            <p className="text-sm text-gray-500 mt-6">
              Tu pourras générer chaque document quand tu en auras besoin.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}