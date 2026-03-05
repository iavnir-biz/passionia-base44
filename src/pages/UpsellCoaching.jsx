import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { CheckCircle, X, ArrowRight, Clock, Sparkles, Shield, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const UPSELL_PRICE = 297;
const TIMER_SECONDS = 15 * 60; // 15 minutes

const deliverables = [
  "Noah crée ton offre principale de A à Z",
  "Page de vente rédigée et prête à publier",
  "Stratégie de premier contact client",
  "Accompagnement jusqu'à ta première vente",
  "Accès prioritaire au support Passion IA",
];

function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export default function UpsellCoaching() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerRef = useRef(null);

  const firstName = user?.firstName || '';

  useEffect(() => {
    loadData();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Already purchased upsell → skip to dashboard
      if (currentUser.has_purchased_upsell || currentUser.has_coaching) {
        navigate(createPageUrl('Dashboard'));
        return;
      }

      // Not purchased main product → go back
      if (!currentUser.has_purchased) {
        navigate(createPageUrl('Register'));
        return;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleYes = async () => {
    setIsCreatingCheckout(true);
    try {
      const response = await base44.functions.invoke('createUpsellCheckout');
      if (response?.data?.url) {
        window.location.href = response.data.url;
      } else if (response?.data?.clientSecret) {
        // Handle embedded checkout if needed
        navigate(createPageUrl('Dashboard'));
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Erreur lors du paiement, réessaie.');
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  const handleNo = () => {
    navigate(createPageUrl('SetupProfile'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] flex flex-col items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl"
      >
        {/* Timer */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-red-500/15 border border-red-500/30 text-red-400 rounded-full px-4 py-2 text-sm font-semibold">
            <Clock className="w-4 h-4" />
            Offre disponible encore {formatTime(timeLeft)}
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Header gradient */}
          <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] px-8 py-7 text-white">
            <div className="inline-flex items-center gap-2 bg-[#61f7a2]/20 text-[#61f7a2] rounded-full px-3 py-1 text-xs font-bold mb-4">
              <Sparkles className="w-3 h-3" />
              OFFRE UNIQUE — UNE SEULE FOIS
            </div>
            <h1 className="text-2xl font-bold leading-tight mb-3">
              {firstName ? `${firstName}, on` : 'On'} crée ta première offre et ton premier produit pour toi — jusqu'à la première vente
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed">
              Tu viens de générer tes offres. Maintenant, laisse l'équipe Passion IA tout mettre en place pour toi, jusqu'à ce que tu décroches ta première vente.
            </p>
          </div>

          <div className="px-8 py-7">
            {/* Price */}
            <div className="text-center mb-7">
              <div className="text-gray-400 text-sm line-through mb-1">Valeur réelle : 997€</div>
              <div className="text-5xl font-black text-gray-900 mb-1">{UPSELL_PRICE}€</div>
              <div className="text-gray-500 text-sm">paiement unique · résultats garantis</div>
            </div>

            {/* Deliverables */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-7 space-y-3">
              {deliverables.map((d, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#61f7a2]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-[#1a9e5c]" />
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed">{d}</span>
                </div>
              ))}
            </div>

            {/* Stars */}
            <div className="flex items-center justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-gray-500 text-sm ml-2">+340 clients accompagnés</span>
            </div>

            {/* YES button */}
            <button
              onClick={handleYes}
              disabled={isCreatingCheckout || timeLeft === 0}
              className="w-full bg-[#1a1a1a] hover:bg-black disabled:opacity-60 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] mb-3"
            >
              {isCreatingCheckout ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Redirection...</>
              ) : (
                <><Sparkles className="w-5 h-5 text-[#61f7a2]" /> Oui, je veux être accompagné — {UPSELL_PRICE}€ <ArrowRight className="w-5 h-5" /></>
              )}
            </button>

            {/* NO button */}
            <button
              onClick={handleNo}
              className="w-full text-gray-400 hover:text-gray-600 text-sm py-3 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Non merci, je me débrouille seul
            </button>

            {/* Trust */}
            <div className="flex items-center justify-center gap-2 mt-4 text-gray-400 text-xs">
              <Shield className="w-3 h-3" />
              <span>Paiement sécurisé · Remboursé si pas de résultat</span>
            </div>
          </div>
        </div>

        {/* Social proof bottom */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          "J'ai décroché ma première vente en 4 jours avec l'accompagnement." — Marie L.
        </div>
      </motion.div>
    </div>
  );
}
