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
  const [typedText, setTypedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [fullText, setFullText] = useState('');

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

      const sessions = await base44.entities.Session.filter({ created_by: currentUser.email });
      if (sessions.length > 0) {
        const userSession = sessions[0];
        setSession(userSession);
        generateBrief(currentUser, userSession);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateBrief = (currentUser, userSession) => {
    const firstName = currentUser.full_name?.split(' ')[0] || currentUser.firstName || 'toi';
    const skill = currentUser.coreSkill || userSession.onboarding_summary?.who_to_teach || 'ton savoir-faire';
    const mainOffer = userSession.finalized_offer?.mainProduct?.title || 'ton offre principale';
    const targetIncome = currentUser.targetIncome || '3000';
    const potentialRevenue = userSession.potential_revenue || 0;

    const text = `Ok, ${firstName}.

J'ai analysé ton profil, ton marché et tes choix.

Tu vas lancer une activité basée sur ${skill}.
${mainOffer} est prêt.

Ton objectif est de ${targetIncome}€/mois.
Le potentiel identifié est réaliste : environ ${potentialRevenue.toLocaleString('fr-FR')}€/mois.

Je vais maintenant préparer tous les éléments nécessaires pour que tu puisses vendre rapidement.

Tu n'as rien à configurer.
Tu vas simplement piloter.`;

    setFullText(text);
  };

  useEffect(() => {
    if (fullText && !isTypingComplete) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setTypedText(fullText.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsTypingComplete(true);
          clearInterval(interval);
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, [fullText, isTypingComplete]);

  const handleStart = () => {
    navigate(createPageUrl('NovaGeneration'));
  };

  const elementsToGenerate = [
    { label: 'Offres complètes', key: 'my_generated_offers' },
    { label: 'Analyse de marché', key: 'market_validation' },
    { label: 'Avatars clients', key: 'generated_avatars' },
    { label: 'Messages de vente', key: 'generated_sales_messages' },
    { label: 'Emails marketing', key: 'generated_marketing_emails' },
    { label: 'Page de vente', key: 'generated_sales_pages' },
    { label: 'Plan d\'action 7 jours', key: 'plan_de_route' }
  ];

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
        {/* Félicitations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] shadow-lg mb-6"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Félicitations.
          </h1>
          <p className="text-xl text-gray-700">
            Tu viens d'ouvrir l'accès à ton business en ligne personnalisé.
          </p>
        </motion.div>

        {/* Brief Noha avec Typing Effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Noha</h3>
              <p className="text-sm text-gray-600">Ton cofondateur IA</p>
            </div>
          </div>

          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
            {typedText}
            {!isTypingComplete && <span className="animate-pulse">|</span>}
          </div>
        </motion.div>

        {/* Ce qui t'attend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Ce qui t'attend derrière ces portes
          </h3>

          <div className="space-y-3">
            {elementsToGenerate.map((element, index) => {
              const isReady = session?.[element.key];
              return (
                <motion.div
                  key={element.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200"
                >
                  {isReady ? (
                    <CheckCircle className="w-5 h-5 text-[#61f7a2]" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span className="text-gray-900 font-medium">{element.label}</span>
                  {!isReady && (
                    <span className="ml-auto text-xs text-gray-500">En préparation</span>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border border-blue-200">
            <p className="text-sm text-gray-700 text-center">
              <strong className="text-gray-900">Tout est pris en charge par Noha.</strong><br />
              Tu n'as rien à configurer. Tu vas simplement piloter.
            </p>
          </div>
        </motion.div>

        {/* CTA Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <GlowButton
            onClick={handleStart}
            size="lg"
            className="px-12"
            disabled={!isTypingComplete}
          >
            Démarrer mon aventure
          </GlowButton>
        </motion.div>
      </div>
    </div>
  );
}