import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Clock, MessageCircle, Users, FileCheck, Target, Shield, Check, Rocket, Gift, AlertTriangle, Star, Bot, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// UPSELL COACHING VIP - 497€
// ============================================================================
// DWY (Done With You) - On accompagne ENSEMBLE, on couvre tous les besoins
// ============================================================================

export default function UpsellCoaching() {
  const navigate = useNavigate();
  
  // ========================================================================
  // STATE & DATA
  // ========================================================================
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes
  const placesRestantes = 7;

  // Données dynamiques - PRÉNOM PERSONNALISÉ
  const firstName = user?.firstName || session?.onboarding_full?.firstName || '';
  const thematique = session?.onboarding_summary?.who_to_teach || session?.onboarding_full?.coreSkill || 'ton domaine';

  // ========================================================================
  // CHARGEMENT INITIAL
  // ========================================================================
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (!currentUser.has_purchased) {
        navigate(createPageUrl('Home'));
        return;
      }

      if (currentUser.has_purchased_upsell || currentUser.has_purchased_downsell || currentUser.has_coaching) {
        navigate(createPageUrl('Dashboard'));
        return;
      }

      const sessions = await base44.entities.Session.filter({ created_by: currentUser.email });
      if (sessions.length > 0) {
        const userSession = sessions[0];
        setSession(userSession);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // TIMER COUNTDOWN
  // ========================================================================
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ========================================================================
  // PILIERS DATA - VERSION DWY (Done With You)
  // ========================================================================
  const piliers = [
    {
      icon: Clock,
      title: "3 Sessions de coaching 1-1 (3 x 45 min)",
      details: [
        "Session 1 : Audit complet de ton offre + positionnement unique",
        "Session 2 : Analyse de tes premiers résultats + ajustements",
        "Session 3 : Plan de scaling et optimisation long terme"
      ],
      color: "from-emerald-400 to-teal-500"
    },
    {
      icon: MessageCircle,
      title: "Support WhatsApp direct avec nous (30 jours)",
      details: [
        "Pose tes questions à tout moment, on répond sous 24h",
        "Feedback rapide sur chacune de tes actions",
        "Déblocage immédiat quand tu es coincé",
        "Tu n'es jamais seul entre les sessions"
      ],
      color: "from-blue-400 to-indigo-500"
    },
    {
      icon: Sparkles,
      title: "Accompagnement complet, ensemble",
      details: [
        "Stratégie : positionnement, pricing, cible idéale",
        "Design : visuels, pages de vente, identité",
        "Création produit : structure, contenu, format",
        "Technique : Stripe, paiements, Pixel Meta",
        "Tu bloques quelque part ? On le fait AVEC toi"
      ],
      color: "from-purple-400 to-pink-500",
      highlight: true
    },
    {
      icon: Users,
      title: "Accès à la communauté privée",
      details: [
        "Échange avec d'autres entrepreneurs comme toi",
        "Partage tes victoires et tes blocages",
        "Entraide et motivation collective",
        "Lives et contenus exclusifs"
      ],
      color: "from-orange-400 to-amber-500"
    },
    {
      icon: Bot,
      title: "Support IA Noah personnalisé",
      details: [
        "Noah connaît ton projet et tes objectifs",
        "Assistance 24/7 pour avancer entre les sessions",
        "Génération de contenus adaptés à ta niche",
        "L'IA + l'humain = combo gagnant"
      ],
      color: "from-cyan-400 to-blue-500"
    },
    {
      icon: Target,
      title: "Roadmap personnalisée selon TA situation",
      details: [
        "Plan d'action clair : quoi faire, dans quel ordre",
        "Priorisation des actions à fort impact",
        "Objectifs concrets semaine par semaine"
      ],
      color: "from-rose-400 to-red-500"
    }
  ];

  // ========================================================================
  // TÉMOIGNAGES DATA
  // ========================================================================
  const temoignages = [
    {
      initial: "S",
      color: "bg-pink-500",
      text: "Les sessions avec Alfred m'ont débloquée. En 1 appel, j'avais mon positionnement clair. Première vente 5 jours après.",
      name: "Sarah M.",
      role: "Coach en nutrition",
      result: "2 400€ en 3 semaines"
    },
    {
      initial: "M",
      color: "bg-blue-500",
      text: "Le WhatsApp change tout. Question sur mon pricing à 22h, réponse le lendemain 8h. Je n'étais jamais bloqué plus de 24h.",
      name: "Marc D.",
      role: "Consultant freelance",
      result: "Première vente en 5 jours"
    },
    {
      initial: "J",
      color: "bg-violet-500",
      text: "Je bloquais sur Stripe depuis des semaines. En session avec Damien, on l'a configuré ensemble en 20 min. Game changer.",
      name: "Julie K.",
      role: "Formatrice en langues",
      result: "3 ventes la première semaine"
    }
  ];

  // ========================================================================
  // HANDLERS
  // ========================================================================
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
      if (session) {
        await base44.entities.Session.update(session.id, {
          has_seen_upsell: true,
          upsell_refused_at: new Date().toISOString()
        });
      }
      navigate(createPageUrl('DownsellSession'));
    } catch (error) {
      console.error('Error declining offer:', error);
      navigate(createPageUrl('DownsellSession'));
    }
  };

  // Animation d'entrée
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  // ========================================================================
  // RENDER
  // ========================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 my-8 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        
        {/* ================================================================ */}
        {/* HEADER */}
        {/* ================================================================ */}
        <div className="text-center p-6 sm:p-8">
          {/* Icône */}
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#61f7a2] to-[#4de88f] rounded-2xl shadow-lg shadow-[#61f7a2]/20 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>

          {/* Titre - PRÉNOM PERSONNALISÉ */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            {firstName ? `${firstName}, ton` : 'Ton'} Pack Passion IA est activé ! 🎉
          </h1>

          {/* Sous-titre */}
          <div className="text-gray-600 text-base leading-relaxed">
            <p className="mb-2">
              Tu as maintenant tous les outils IA pour créer ton offre en <span className="font-semibold text-gray-800">{thematique}</span>.
            </p>
            <p className="mb-2">
              Mais soyons honnêtes : <span className="font-semibold text-gray-800">90% des gens</span> qui achètent une formation n'obtiennent jamais de résultats.
            </p>
            <p className="text-[#61f7a2] font-semibold">
              Et si on t'accompagnait main dans la main ?
            </p>
          </div>
        </div>

        {/* ================================================================ */}
        {/* CARD PRINCIPALE */}
        {/* ================================================================ */}
        <div className="border-t border-gray-100">
          
          {/* Header Card */}
          <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Accompagnement VIP 30 jours
                  </h2>
                  <p className="text-gray-600 text-lg">avec Alfred & Damien</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 bg-[#61f7a2]/10 text-[#61f7a2] px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                OFFRE UNIQUE
              </span>
            </div>
            <p className="mt-4 text-gray-600 text-lg">
              On t'accompagne <span className="font-semibold text-gray-800">main dans la main</span> pendant 30 jours.<br />
              Stratégie, design, création, technique... On couvre tous tes besoins, <span className="font-semibold text-gray-800">ensemble</span>.
            </p>
          </div>

          {/* Piliers */}
          <div className="p-5 sm:p-6 space-y-3 max-h-[300px] overflow-y-auto">
            {piliers.map((pilier, index) => (
              <div 
                key={index}
                className={`flex gap-4 p-4 rounded-2xl transition-colors ${
                  pilier.highlight 
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${pilier.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <pilier.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{pilier.title}</h3>
                  <ul className="space-y-1">
                    {pilier.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600">
                        <Check className="w-4 h-4 text-[#61f7a2] flex-shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                  {pilier.highlight && (
                    <div className="mt-2 inline-flex items-center gap-1 text-purple-600 text-sm font-semibold">
                      <span>🔥</span> Tu bloques ? On le fait ensemble.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================================================================ */}
        {/* BLOC PRIX COMPACT */}
        {/* ================================================================ */}
        <div className="bg-gradient-to-br from-[#61f7a2]/10 to-[#4de88f]/10 p-5 sm:p-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-1">
              Prix normal : <span className="line-through">897€</span>
            </p>
            <p className="text-4xl sm:text-5xl font-black text-[#61f7a2] mb-2">
              497€
            </p>
            <div className="inline-flex items-center gap-2 bg-[#61f7a2] text-white px-4 py-2 rounded-full text-sm font-bold">
              <Gift className="w-4 h-4" />
              Tu économises 400€ (-45%)
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* URGENCE COMPACT */}
        {/* ================================================================ */}
        <div className="bg-amber-50 border-t border-amber-200 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-amber-700 font-semibold text-sm mb-1">
            <AlertTriangle className="w-4 h-4" />
            Cette offre disparaît dans : <span className="text-xl font-black text-gray-900 font-mono">{formatTime(timeLeft)}</span>
          </div>
          <p className="text-amber-600 text-xs">
            Places limitées : {placesRestantes}/10 restantes ce mois-ci
          </p>
        </div>

        {/* ================================================================ */}
        {/* CTA */}
        {/* ================================================================ */}
        <div className="p-5 sm:p-6 bg-white border-t border-gray-100 space-y-3">
          <button
            onClick={handleAcceptOffer}
            disabled={isCreatingCheckout}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#61f7a2] to-[#4de88f] hover:from-[#4de88f] hover:to-[#61f7a2] text-white text-lg font-bold px-8 py-4 rounded-xl shadow-lg shadow-[#61f7a2]/20 transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingCheckout ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Rocket className="w-5 h-5" />
            )}
            {isCreatingCheckout ? 'Redirection...' : 'OUI, je veux être accompagné — 497€'}
          </button>
          
          <button
            onClick={handleDeclineOffer}
            disabled={isCreatingCheckout}
            className="w-full text-gray-500 hover:text-gray-700 underline underline-offset-4 transition-colors disabled:opacity-50 text-sm py-2"
          >
            Non merci, je préfère avancer seul →
          </button>

          {/* Garanties */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Paiement sécurisé
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3" />
              Remboursé 30j
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}