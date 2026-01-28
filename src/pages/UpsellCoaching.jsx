import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  Sparkles,
  CheckCircle,
  Clock,
  MessageCircle,
  FileCheck,
  Target,
  Shield,
  Star,
  Loader2,
  PartyPopper,
  Rocket,
  AlertTriangle
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import { toast } from 'sonner';

const TIMER_DURATION = 10 * 60; // 10 minutes en secondes

export default function UpsellCoaching() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [timerExpired, setTimerExpired] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    loadData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (loading) return;

    // Check localStorage for existing timer
    const storedStartTime = localStorage.getItem('upsell_timer_start');
    let startTime;

    if (storedStartTime) {
      startTime = parseInt(storedStartTime);
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = TIMER_DURATION - elapsed;

      if (remaining <= 0) {
        setTimerExpired(true);
        handleTimerExpired();
        return;
      }
      setTimeLeft(remaining);
    } else {
      startTime = Date.now();
      localStorage.setItem('upsell_timer_start', startTime.toString());
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimerExpired(true);
          handleTimerExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading]);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Charger la session
      const sessions = await base44.entities.Session.filter({ created_by: currentUser.email });

      if (sessions.length > 0) {
        const userSession = sessions[0];
        setSession(userSession);

        // Vérifier si l'utilisateur a déjà vu l'upsell
        if (userSession.has_seen_upsell === true) {
          console.log('[UpsellCoaching] Upsell already seen, redirecting to Dashboard');
          navigate(createPageUrl('Dashboard'));
          return;
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleTimerExpired = async () => {
    // Sauvegarder que l'utilisateur a vu l'upsell
    if (session) {
      try {
        await base44.entities.Session.update(session.id, {
          has_seen_upsell: true,
          upsell_refused_at: new Date().toISOString()
        });
      } catch (e) {
        console.error('Error updating session:', e);
      }
    }
    localStorage.removeItem('upsell_timer_start');

    // Redirect après 3 secondes
    setTimeout(() => {
      navigate(createPageUrl('Dashboard'));
    }, 3000);
  };

  const handleAcceptOffer = async () => {
    setIsCreatingCheckout(true);
    try {
      const { data } = await base44.functions.invoke('createCheckoutUpsell', {
        sessionId: session?.id,
        upsellPrice: 49700
      });

      if (data?.url) {
        window.top.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Erreur lors de la redirection vers le paiement');
      setIsCreatingCheckout(false);
    }
  };

  const handleDeclineOffer = async () => {
    try {
      // Sauvegarder le refus dans la session
      if (session) {
        await base44.entities.Session.update(session.id, {
          has_seen_upsell: true,
          upsell_refused_at: new Date().toISOString()
        });
      }
      localStorage.removeItem('upsell_timer_start');
      console.log('[UpsellCoaching] Offer declined, redirecting to Dashboard');
      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      console.error('Error declining offer:', error);
      navigate(createPageUrl('Dashboard'));
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-green-50/30 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50/30 to-white py-8 px-4 overflow-y-auto">
      <div className="max-w-3xl mx-auto">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          {/* Celebration Icon */}
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] mb-6 shadow-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <PartyPopper className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Felicitations ! Ton Pack Passion IA est active.
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Tu as fait le premier pas vers la monetisation de ton savoir.
            Maintenant, laisse-moi t'aider a maximiser tes resultats...
          </p>
        </motion.div>

        {/* Main Offer Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative bg-white rounded-3xl border-2 border-yellow-400 shadow-2xl overflow-hidden mb-8"
        >
          {/* Premium Badge */}
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
              <Sparkles className="w-3 h-3" />
              OFFRE UNIQUE
            </div>
          </div>

          {/* Card Header */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-6 border-b border-yellow-200">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-8 h-8 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                Pack 3 Sessions Coaching 1-1 Personnalise
              </h2>
            </div>
            <p className="text-gray-600">
              Fais-toi accompagner pour transformer ton projet en revenus concrets
            </p>
          </div>

          {/* Card Content */}
          <div className="p-6 space-y-6">

            {/* Feature 1: Sessions */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  3 Sessions de coaching 1-1 (3 x 30 min)
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-6">
                  <li>Session 1 : Audit complet de ton offre et positionnement</li>
                  <li>Session 2 : Analyse des premiers resultats + ajustements</li>
                  <li>Session 3 : Plan de scaling et optimisation</li>
                </ul>
              </div>
            </div>

            {/* Feature 2: Support */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Support WhatsApp/Telegram direct (30 jours)
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-6">
                  <li>Questions rapides entre les sessions</li>
                  <li>Feedback sur tes actions</li>
                  <li>Deblocage rapide si bloque</li>
                </ul>
              </div>
            </div>

            {/* Feature 3: Document Review */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Revue personnalisee de tes documents
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-6">
                  <li>Check de tes pages de vente</li>
                  <li>Validation de tes messages de prospection</li>
                  <li>Correction de ton positionnement</li>
                </ul>
              </div>
            </div>

            {/* Feature 4: Action Plan */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Plan d'action sur-mesure
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-6">
                  <li>Roadmap personnalisee selon ta situation</li>
                  <li>Priorisation des actions</li>
                  <li>Methode de suivi des resultats</li>
                </ul>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 text-center border border-green-200">
              <div className="mb-2">
                <span className="text-lg text-gray-500 line-through">591 EUR</span>
              </div>
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-5xl font-bold text-[#61f7a2]">497 EUR</span>
              </div>
              <div className="inline-block bg-green-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                Economie : 94 EUR
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid md:grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                S
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  "Sarah a genere <strong>2 400 EUR en 3 semaines</strong> avec notre coaching. Le suivi personnalise a fait toute la difference."
                </p>
                <p className="text-xs text-gray-500">Sarah M. - Coach en nutrition</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                M
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  "Marc a valide son offre en <strong>1 session</strong> et lance <strong>5 jours apres</strong>. Resultat : premiere vente des la semaine suivante."
                </p>
                <p className="text-xs text-gray-500">Marc D. - Consultant freelance</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Urgency Timer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6"
        >
          <div className={`text-center p-4 rounded-2xl border-2 ${
            timerExpired
              ? 'bg-red-50 border-red-300'
              : timeLeft < 60
                ? 'bg-red-50 border-red-300'
                : timeLeft < 180
                  ? 'bg-orange-50 border-orange-300'
                  : 'bg-amber-50 border-amber-300'
          }`}>
            {timerExpired ? (
              <div className="flex items-center justify-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Offre expiree ! Redirection vers le Dashboard...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 text-gray-700 mb-2">
                  <AlertTriangle className={`w-5 h-5 ${timeLeft < 180 ? 'text-red-500' : 'text-amber-500'}`} />
                  <span className="font-medium">Cette offre disparait dans :</span>
                </div>
                <motion.div
                  className={`text-4xl font-bold ${
                    timeLeft < 60
                      ? 'text-red-600'
                      : timeLeft < 180
                        ? 'text-orange-600'
                        : 'text-gray-900'
                  }`}
                  animate={timeLeft < 60 ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  {formatTime(timeLeft)}
                </motion.div>
                <p className="text-sm text-gray-600 mt-2">
                  et ne sera plus jamais disponible a ce prix
                </p>
              </>
            )}
          </div>

          {/* Scarcity Badge */}
          <div className="text-center mt-3">
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              Places limitees : 7/10 restantes ce mois-ci
            </span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-4 mb-6"
        >
          {/* Primary CTA */}
          <motion.button
            onClick={handleAcceptOffer}
            disabled={isCreatingCheckout || timerExpired}
            className={`w-full py-5 px-8 rounded-2xl text-lg font-bold transition-all duration-300 flex items-center justify-center gap-3 ${
              timerExpired
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#61f7a2] to-[#4de88f] text-[#11112b] hover:shadow-lg hover:shadow-green-300/50 hover:scale-[1.02] active:scale-[0.98]'
            }`}
            animate={!timerExpired && !isCreatingCheckout ? {
              boxShadow: ['0 0 20px rgba(97, 247, 162, 0.3)', '0 0 40px rgba(97, 247, 162, 0.5)', '0 0 20px rgba(97, 247, 162, 0.3)']
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isCreatingCheckout ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Rocket className="w-6 h-6" />
            )}
            {isCreatingCheckout ? 'Redirection...' : 'OUI, je prends le coaching 497 EUR'}
          </motion.button>

          {/* Secondary CTA */}
          <button
            onClick={handleDeclineOffer}
            disabled={isCreatingCheckout}
            className="w-full py-3 px-6 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all text-sm border border-gray-200"
          >
            Non merci, je continue seul au Dashboard
          </button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4 text-sm text-gray-500"
        >
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Paiement 100% securise par Stripe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Garantie satisfait ou rembourse 30 jours</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-green-500" />
            <span>97% de clients coaches atteignent leur premiere vente</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
