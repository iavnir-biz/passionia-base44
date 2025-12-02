import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Users, 
  Lightbulb, 
  MessageSquare, 
  Rocket, 
  Target,
  Lock,
  Sparkles,
  ArrowRight
} from "lucide-react";
import ResultSection from '@/components/results/ResultSection';
import PaywallModal from '@/components/paywall/PaywallModal';
import GlowButton from '@/components/ui/GlowButton';
import LoadingStateAI from '@/components/common/LoadingStateAI';

const freeResults = [
  { key: 'market_validation', title: 'Validation de marché', icon: TrendingUp },
  { key: 'avatar', title: 'Avatar client', icon: Users },
  { key: 'opportunity', title: 'Opportunité prometteuse', icon: Lightbulb },
  { key: 'message', title: 'Message clé', icon: MessageSquare },
  { key: 'future_vision', title: 'Ton futur toi', icon: Rocket },
  { key: 'first_step', title: 'Première étape stratégique', icon: Target },
];

const premiumResults = [
  { key: 'offer_title', title: 'Offre complète', icon: Sparkles },
  { key: 'recommended_price', title: 'Pricing recommandé', icon: TrendingUp },
];

export default function Results() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  
  useEffect(() => {
    loadProfile();
  }, []);
  
  const loadProfile = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      
      if (profiles.length > 0 && profiles[0].generated_results) {
        setProfile(profiles[0]);
      } else {
        // Redirect to onboarding if no results
        navigate(createPageUrl('Onboarding'));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePurchase = async () => {
    setPurchasing(true);
    
    try {
      // Simulate payment (in real app, redirect to Stripe)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update profile as paid
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      
      if (profiles.length > 0) {
        await base44.entities.UserProfile.update(profiles[0].id, { has_paid: true });
      }
      
      // Redirect to dashboard
      navigate(createPageUrl('Dashboard'));
      
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setPurchasing(false);
      setShowPaywall(false);
    }
  };
  
  if (loading) {
    return <LoadingStateAI message="Chargement de vos résultats..." />;
  }
  
  const results = profile?.generated_results || {};
  
  return (
    <div className="min-h-screen bg-[#11112b] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-[#61f7a2] mx-auto mb-6 flex items-center justify-center glow-green">
            <Sparkles className="w-8 h-8 text-[#11112b]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ton analyse personnalisée
          </h1>
          <p className="text-gray-400 text-lg">
            Voici ce que l'IA a découvert sur ton potentiel
          </p>
        </motion.div>
        
        {/* Free Results */}
        <div className="space-y-4 mb-8">
          {freeResults.map((item, index) => (
            <ResultSection
              key={item.key}
              title={item.title}
              content={results[item.key] || "Contenu en cours de génération..."}
              icon={item.icon}
              index={index}
            />
          ))}
        </div>
        
        {/* Catchphrase highlight */}
        {results.catchphrase && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-active border border-[#61f7a2]/30 rounded-2xl p-8 mb-8 text-center"
          >
            <p className="text-sm text-[#61f7a2] uppercase tracking-wider mb-3">Ta phrase d'accroche</p>
            <p className="text-2xl font-semibold text-white italic">
              "{results.catchphrase}"
            </p>
          </motion.div>
        )}
        
        {/* Premium Results (Blurred) */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#11112b] z-10" />
          <div className="space-y-4 blur-content">
            {premiumResults.map((item, index) => (
              <ResultSection
                key={item.key}
                title={item.title}
                content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
                icon={item.icon}
                index={index + freeResults.length}
                isBlurred={true}
              />
            ))}
          </div>
        </div>
        
        {/* CTA Paywall */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-[#1b1b33] border border-[#2a2a45] rounded-3xl p-8 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#61f7a2]/10 mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-7 h-7 text-[#61f7a2]" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            Débloquer tout le contenu
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Accède à ton offre complète, ta page de vente, tes emails, ton plan d'action et tous tes documents IA
          </p>
          <GlowButton 
            onClick={() => setShowPaywall(true)}
            size="lg"
            className="px-12"
          >
            Débloquer maintenant
            <ArrowRight className="w-5 h-5 ml-2" />
          </GlowButton>
        </motion.div>
      </div>
      
      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchase={handlePurchase}
        loading={purchasing}
      />
    </div>
  );
}