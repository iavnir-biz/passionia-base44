import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle2, Package, DollarSign, Mail, FileText, Rocket, Brain, Zap } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';

export default function OnboardingTransition() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleItems, setVisibleItems] = useState(0);
  const [progress, setProgress] = useState(78);
  const [statusText, setStatusText] = useState('Analyse de ton positionnement…');

  const items = [
    { icon: CheckCircle2, title: 'Validation complète de ton idée', subtitle: 'Marché, cible et positionnement clair' },
    { icon: Package, title: 'Tes 4 offres prêtes à vendre', subtitle: 'Structure complète, pensée pour démarrer vite' },
    { icon: DollarSign, title: 'Les prix parfaits', subtitle: 'Optimisés pour vendre sans brader ta valeur' },
    { icon: Mail, title: 'Les emails marketing essentiels', subtitle: 'Pour générer tes premières ventes simplement' },
    { icon: FileText, title: 'Une page de vente à haute conversion', subtitle: 'Avec la structure et les messages qui fonctionnent' },
    { icon: Rocket, title: 'Un plan d\'action sur 7 jours', subtitle: 'Étape par étape, sans dispersion' },
    { icon: Brain, title: 'Le protocole complet pour créer ton activité de formation en ligne', subtitle: '' }
  ];

  const statusTexts = [
    'Analyse de ton positionnement…',
    'Structuration de tes offres…',
    'Optimisation des prix…',
    'Préparation du plan d\'action…'
  ];

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    // Animation des items qui apparaissent un par un
    if (visibleItems < items.length) {
      const timer = setTimeout(() => {
        setVisibleItems(prev => prev + 1);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [visibleItems, items.length]);

  useEffect(() => {
    // Animation de la barre de progression
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 92) return 92;
        return prev + 2;
      });
    }, 600);
    return () => clearInterval(progressTimer);
  }, []);

  useEffect(() => {
    // Changement du texte de statut
    let index = 0;
    const statusTimer = setInterval(() => {
      index = (index + 1) % statusTexts.length;
      setStatusText(statusTexts[index]);
    }, 1500);
    return () => clearInterval(statusTimer);
  }, []);

  useEffect(() => {
    // Redirection automatique après 8 secondes
    const redirectTimer = setTimeout(() => {
      navigate(createPageUrl('OnboardingQ12AgeRange'));
    }, 8000);
    return () => clearTimeout(redirectTimer);
  }, [navigate]);

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
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl"
      >
        <div className="bg-white rounded-3xl p-10 border border-gray-200 shadow-lg">
          {/* Cerveau IA animé au centre */}
          <div className="flex justify-center mb-8">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-2xl">
                <Brain className="w-10 h-10 text-white" />
              </div>
              {/* Particules animées autour */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4"
              >
                <Zap className="absolute top-0 left-1/2 w-4 h-4 text-[#61f7a2] opacity-60" />
                <Sparkles className="absolute bottom-0 right-0 w-4 h-4 text-[#4de88f] opacity-60" />
              </motion.div>
            </motion.div>
          </div>

          {/* Titre principal */}
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gray-900 mb-4 text-center leading-relaxed"
          >
            Merci pour toutes ces réponses, {user?.firstName} !<br />
            Je peux déjà te dire que ta passion vaut de l'or 💎
          </motion.h1>

          {/* Sous-titre */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 text-center mb-8 leading-relaxed"
          >
            J'analyse tes réponses pour construire une stratégie claire, simple et rentable, totalement personnalisée pour toi.
            <br />
            <span className="font-medium text-gray-700">Encore quelques questions, et je te montre tout.</span>
          </motion.p>

          {/* Barre de progression intelligente */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">🔍 Analyse de ton potentiel en cours</span>
              <span className="text-sm font-bold text-[#61f7a2]">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#61f7a2] to-[#4de88f] rounded-full"
                initial={{ width: '78%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <motion.p
              key={statusText}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-gray-500 mt-2"
            >
              {statusText}
            </motion.p>
          </motion.div>

          {/* Bloc central - Ce qui se construit */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
              🎁 Ce que je suis en train de construire pour toi
            </h2>
            
            <div className="space-y-4">
              <AnimatePresence>
                {items.slice(0, visibleItems).map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border border-green-200"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-[#61f7a2] rounded-xl flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      {item.subtitle && (
                        <p className="text-sm text-gray-600">{item.subtitle}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>


        </div>
      </motion.div>
    </div>
  );
}