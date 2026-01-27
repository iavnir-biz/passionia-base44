import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
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
  AlertTriangle,
  Palette,
  Map,
  Gift
} from 'lucide-react';
import { toast } from 'sonner';

const TIMER_DURATION = 10 * 60; // 10 minutes en secondes

// Composant Pilier réutilisable
const PilierCard = ({ icon: Icon, iconBg, title, details, value }) => (
  <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
    <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="flex-1">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          {title}
        </h3>
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full whitespace-nowrap">
          {value}
        </span>
      </div>
      <ul className="text-sm text-gray-600 space-y-1">
        {details.map((detail, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-gray-400 mt-1">•</span>
            <span>{detail}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

// Composant Témoignage
const TestimonialCard = ({ initial, gradient, quote, name, role, result }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
    <div className="flex items-start gap-3">
      <div className={`w-12 h-12 rounded-full ${gradient} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
        {initial}
      </div>
      <div>
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="text-sm text-gray-700 mb-2 italic">"{quote}"</p>
        <p className="text-xs text-gray-500 mb-1">— {name} - {role}</p>
        <p className="text-xs font-semibold text-emerald-600">{result}</p>
      </div>
    </div>
  </div>
);

export default function UpsellCoaching() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [timerExpired, setTimerExpired] = useState(false);
  const timerRef = useRef(null);

  // Données dynamiques
  const firstName = user?.firstName || user?.full_name?.split(' ')[0] || 'Toi';
  const thematique = session?.onboarding_summary?.who_to_teach ||
                     session?.onboarding_full?.expertise_area ||
                     'ton domaine';

  useEffect(() => {
    loadData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (loading) return;

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

      const sessions = await base44.entities.Session.filter({ created_by: currentUser.email });

      if (sessions.length > 0) {
        const userSession = sessions[0];
        setSession(userSession);

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

    setTimeout(() => {
      navigate(createPageUrl('Dashboard'));
    }, 3000);
  };

  const handleAcceptOffer = async () => {
    setIsCreatingCheckout(true);
    try {
      const { data } = await base44.functions.invoke('createCheckoutUpsell', {
        sessionId: session?.id,
        upsellPrice: 49700,
        type: 'coaching_vip'
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

  const handleDeclineOffer = () => {
    // Rediriger vers le downsell au lieu du dashboard
    console.log('[UpsellCoaching] Offer declined, redirecting to DownsellSession');
    navigate(createPageUrl('DownsellSession'));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const piliers = [
    {
      icon: Clock,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      title: '3 Sessions de coaching 1-1 (3 x 45 min)',
      details: [
        'Session 1 : Audit complet de ton offre + positionnement unique',
        'Session 2 : Analyse de tes premiers resultats + ajustements',
        'Session 3 : Plan de scaling et optimisation long terme'
      ],
      value: '450€'
    },
    {
      icon: MessageCircle,
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      title: 'Support WhatsApp direct avec nous (30 jours)',
      details: [
        'Pose tes questions a tout moment, on repond sous 24h',
        'Feedback rapide sur chacune de tes actions',
        'Deblocage immediat quand tu es coince',
        "Tu n'es jamais seul entre les sessions"
      ],
      value: '300€'
    },
    {
      icon: Palette,
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      title: 'Creation complete de tes produits & tech',
      details: [
        'Design de tes visuels et pages de vente',
        'Structuration et creation de tes offres',
        'Integration Stripe : paiements, checkout, abonnements',
        'Configuration Pixel Meta pour tes futures pubs',
        "Tu n'as RIEN a faire cote technique, on gere tout"
      ],
      value: '500€'
    },
    {
      icon: FileCheck,
      iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
      title: 'Revue personnalisee de tous tes documents',
      details: [
        'Optimisation de tes pages de vente (ligne par ligne)',
        'Validation de tes messages de prospection',
        'Correction de ton positionnement et wording',
        'Feedback detaille et actionnable'
      ],
      value: '200€'
    },
    {
      icon: Map,
      iconBg: 'bg-gradient-to-br from-pink-500 to-pink-600',
      title: "Plan d'action sur-mesure selon TA situation",
      details: [
        'Roadmap claire : quoi faire, dans quel ordre, chaque semaine',
        'Priorisation des actions a fort impact',
        'Methode de suivi de tes resultats',
        'Objectifs concrets semaine par semaine'
      ],
      value: '150€'
    }
  ];

  const testimonials = [
    {
      initial: 'S',
      gradient: 'bg-gradient-to-br from-pink-400 to-rose-500',
      quote: "Alfred m'a configure Stripe et mes pages en 1 session. J'aurais mis 2 semaines seule. Premiere vente 5 jours apres.",
      name: 'Sarah M.',
      role: 'Coach en nutrition',
      result: '💰 Resultat : 2 400€ en 3 semaines'
    },
    {
      initial: 'M',
      gradient: 'bg-gradient-to-br from-blue-400 to-cyan-500',
      quote: "Le WhatsApp change tout. Question sur mon pricing a 22h, reponse le lendemain 8h. Je n'etais jamais bloque plus de 24h.",
      name: 'Marc D.',
      role: 'Consultant freelance',
      result: '💰 Resultat : Premiere vente en 5 jours'
    },
    {
      initial: 'J',
      gradient: 'bg-gradient-to-br from-violet-400 to-purple-500',
      quote: "Je pensais que mon offre etait claire. L'audit avec Damien m'a montre que je ciblais trop large. On a tout repris, maintenant ca convertit.",
      name: 'Julie K.',
      role: 'Formatrice en langues',
      result: '💰 Resultat : 3 ventes la premiere semaine'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white py-8 px-4 overflow-y-auto">
      <div className="max-w-3xl mx-auto">

        {/* SECTION 1: HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 mb-6 shadow-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {firstName}, ton Pack Passion IA est active ! 🎉
          </h1>

          <div className="text-lg text-gray-600 max-w-2xl mx-auto space-y-3">
            <p>
              Tu as maintenant tous les outils IA pour creer ton offre en <strong className="text-gray-800">{thematique}</strong>.
            </p>
            <p className="text-base">
              Mais soyons honnetes : <strong className="text-gray-800">90% des gens</strong> qui achetent une formation n'obtiennent jamais de resultats. Pas par manque d'outils. <strong className="text-gray-800">Par manque d'accompagnement.</strong>
            </p>
            <p className="text-emerald-600 font-medium">
              Et si on s'assurait ensemble que tu fasses partie des 10% qui reussissent ?
            </p>
          </div>
        </motion.div>

        {/* SECTION 2: CARD PRINCIPALE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative bg-white rounded-3xl border-2 border-amber-300 shadow-2xl overflow-hidden mb-8"
        >
          {/* Badge */}
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
              <Sparkles className="w-3 h-3" />
              OFFRE UNIQUE - RESERVEE AUX NOUVEAUX MEMBRES
            </div>
          </div>

          {/* Card Header */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-6 border-b border-amber-200">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-8 h-8 text-amber-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                Accompagnement VIP 30 jours
              </h2>
            </div>
            <p className="text-lg text-gray-700 font-medium">avec Alfred & Damien</p>
            <p className="text-gray-600 mt-2">
              On ne te donne pas juste des conseils. <strong>On fait AVEC toi.</strong><br />
              Pendant 30 jours, on est la pour garantir tes premiers resultats.
            </p>
          </div>

          {/* SECTION 3: LES 5 PILIERS */}
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Les 5 piliers de ton accompagnement :</h3>
            {piliers.map((pilier, idx) => (
              <PilierCard key={idx} {...pilier} />
            ))}
          </div>

          {/* SECTION 4: BLOC DIFFÉRENCIATEUR */}
          <div className="mx-6 mb-6 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Pourquoi cet accompagnement change tout ?</h3>
            <p className="text-gray-700 mb-4">
              Avec Noah, tu as l'IA pour creer.<br />
              <strong>Avec nous, tu as l'humain pour reussir.</strong>
            </p>
            <p className="text-gray-600 mb-4 text-sm">
              La difference entre ceux qui reussissent et les autres ? L'accompagnement.
            </p>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Tu bloques sur Stripe ? → <strong>On le configure ensemble en direct</strong></li>
              <li>• Ton design est moche ? → <strong>On le refait avec toi</strong></li>
              <li>• Tu doutes de ton prix ? → <strong>On valide et on ajuste</strong></li>
              <li>• T'as une question a 23h ? → <strong>Tu nous ecris, on repond demain matin</strong></li>
            </ul>
            <p className="text-emerald-700 font-semibold mt-4">
              30 jours. Alfred & Damien a tes cotes. Tes premiers resultats garantis.
            </p>
          </div>

          {/* SECTION 5: RÉCAP PRIX */}
          <div className="mx-6 mb-6 p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">💎 Valeur totale des 5 piliers :</p>
              <p className="text-lg text-gray-400 mb-3">1 600€</p>

              <p className="text-gray-400 line-through text-lg mb-2">Prix normal : 897€</p>

              <p className="text-sm font-medium text-gray-700 mb-2">🔥 TON PRIX AUJOURD'HUI UNIQUEMENT :</p>

              <p className="text-5xl font-bold text-emerald-500 mb-4">497€</p>

              <div className="inline-flex items-center gap-2 bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                <Gift className="w-4 h-4" />
                Tu economises 400€ (-45%)
              </div>
            </div>
          </div>
        </motion.div>

        {/* SECTION 6: TÉMOIGNAGES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="grid md:grid-cols-1 gap-4 mb-8"
        >
          {testimonials.map((testimonial, idx) => (
            <TestimonialCard key={idx} {...testimonial} />
          ))}
        </motion.div>

        {/* SECTION 7: URGENCE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6"
        >
          <div className={`text-center p-5 rounded-2xl border-2 ${
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
                <span className="font-semibold">Offre expiree ! Redirection...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 text-gray-700 mb-2">
                  <AlertTriangle className={`w-5 h-5 ${timeLeft < 180 ? 'text-red-500' : 'text-amber-500'}`} />
                  <span className="font-medium">Cette offre disparait dans :</span>
                </div>
                <motion.div
                  className={`text-5xl font-bold mb-2 ${
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
                <p className="text-sm text-gray-600">
                  et ne sera plus jamais disponible a ce prix.
                </p>
              </>
            )}
          </div>

          {/* Indicateur de rareté */}
          <div className="text-center mt-3">
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Places limitees : 7/10 restantes ce mois-ci
            </span>
          </div>
        </motion.div>

        {/* SECTION 8: CTA & GARANTIES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="space-y-4 mb-6"
        >
          {/* CTA Principal */}
          <motion.button
            onClick={handleAcceptOffer}
            disabled={isCreatingCheckout || timerExpired}
            className={`w-full py-5 px-8 rounded-2xl text-lg font-bold transition-all duration-300 flex items-center justify-center gap-3 ${
              timerExpired
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-300/50 hover:scale-[1.02] active:scale-[0.98]'
            }`}
            animate={!timerExpired && !isCreatingCheckout ? {
              boxShadow: ['0 0 20px rgba(16, 185, 129, 0.3)', '0 0 40px rgba(16, 185, 129, 0.5)', '0 0 20px rgba(16, 185, 129, 0.3)']
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isCreatingCheckout ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Rocket className="w-6 h-6" />
            )}
            {isCreatingCheckout ? 'Redirection...' : 'OUI, je veux Alfred & Damien a mes cotes — 497€'}
          </motion.button>

          {/* CTA Secondaire - vers Downsell */}
          <button
            onClick={handleDeclineOffer}
            disabled={isCreatingCheckout}
            className="w-full py-3 px-6 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all text-sm"
          >
            Non merci, je prefere avancer seul →
          </button>
        </motion.div>

        {/* Garanties */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 text-sm text-gray-500"
        >
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Paiement 100% securise par Stripe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Satisfait ou rembourse 30 jours</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            <span>97% font leur 1ere vente avec notre coaching</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
