import React, { useState, useEffect } from 'react';
import { Clock, MessageCircle, Users, FileCheck, Target, Shield, Check, Rocket, Gift, AlertTriangle, Star, Bot, Sparkles } from 'lucide-react';

// ============================================================================
// UPSELL COACHING VIP - 497€
// ============================================================================
// DWY (Done With You) - On accompagne ENSEMBLE, on couvre tous les besoins
// ============================================================================

export default function UpsellCoaching({ 
  user = {}, 
  session = {}, 
  onAccept, 
  onDecline 
}) {
  // ========================================================================
  // STATE & DATA
  // ========================================================================
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes
  const placesRestantes = 7;

  // Données dynamiques - PRÉNOM PERSONNALISÉ
  const firstName = user?.firstName || session?.onboarding_full?.firstName || '';
  const thematique = session?.onboarding_summary?.who_to_teach || session?.onboarding_full?.coreSkill || 'ton domaine';

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
  // RENDER
  // ========================================================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        
        {/* ================================================================ */}
        {/* HEADER */}
        {/* ================================================================ */}
        <div className="text-center mb-8">
          {/* Icône */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#61f7a2] to-[#4de88f] rounded-2xl shadow-lg shadow-[#61f7a2]/20 mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>

          {/* Titre - PRÉNOM PERSONNALISÉ */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {firstName ? `${firstName}, ton` : 'Ton'} Pack Passion IA est activé ! 🎉
          </h1>

          {/* Sous-titre */}
          <div className="max-w-2xl mx-auto text-gray-600 text-lg leading-relaxed">
            <p className="mb-3">
              Tu as maintenant tous les outils IA pour créer ton offre en <span className="font-semibold text-gray-800">{thematique}</span>.
            </p>
            <p className="mb-3">
              Mais soyons honnêtes : <span className="font-semibold text-gray-800">90% des gens</span> qui achètent une formation n'obtiennent jamais de résultats. Pas par manque d'outils. Par manque d'accompagnement.
            </p>
            <p className="text-[#61f7a2] font-semibold">
              Et si on t'accompagnait main dans la main pour garantir tes premiers résultats ?
            </p>
          </div>
        </div>

        {/* ================================================================ */}
        {/* CARD PRINCIPALE */}
        {/* ================================================================ */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden mb-8">
          
          {/* Header Card */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
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
          <div className="p-6 sm:p-8 space-y-4">
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
        {/* BLOC DIFFÉRENCIATEUR */}
        {/* ================================================================ */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 sm:p-8 mb-8 text-white">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 text-center">
            Pourquoi cet accompagnement change tout ?
          </h3>
          <div className="text-center mb-6">
            <p className="text-gray-300 text-lg mb-2">Avec Noah, tu as l'IA pour créer.</p>
            <p className="text-gray-300 text-lg mb-2">Avec la communauté, tu as le soutien pour avancer.</p>
            <p className="text-emerald-400 text-xl font-semibold">Avec nous, tu as l'humain pour réussir.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-gray-300">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <span>Tu doutes de ta stratégie ? → <span className="text-white font-medium">On la valide ensemble</span></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎨</span>
              <span>Tu galères sur le design ? → <span className="text-white font-medium">On le fait avec toi</span></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              <span>Tu bloques sur Stripe ? → <span className="text-white font-medium">On configure ensemble</span></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <span>Tu as une question ? → <span className="text-white font-medium">Réponse sous 24h</span></span>
            </div>
          </div>
          <p className="text-center mt-6 text-lg font-semibold text-[#61f7a2]">
            30 jours. Main dans la main. Tes premiers résultats garantis.
          </p>
        </div>

        {/* ================================================================ */}
        {/* BLOC PRIX WHAOU */}
        {/* ================================================================ */}
        <div className="bg-gradient-to-br from-[#61f7a2]/5 to-[#4de88f]/5 rounded-3xl p-6 sm:p-8 mb-8 border-2 border-[#61f7a2]/20">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-2">
              Prix normal : <span className="line-through">897€</span>
            </p>
            <p className="text-[#61f7a2] font-bold text-lg mb-2">
              🔥 TON PRIX AUJOURD'HUI UNIQUEMENT :
            </p>
            <p className="text-6xl sm:text-7xl font-black text-[#61f7a2] mb-4">
              497€
            </p>
            <div className="inline-flex items-center gap-2 bg-[#61f7a2] text-white px-6 py-3 rounded-full text-lg font-bold">
              <Gift className="w-5 h-5" />
              Tu économises 400€ (-45%)
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* TÉMOIGNAGES */}
        {/* ================================================================ */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {temoignages.map((t, index) => (
            <div key={index} className="bg-white rounded-2xl p-5 shadow-lg shadow-gray-100 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center text-white font-bold`}>
                  {t.initial}
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 text-sm mb-3">"{t.text}"</p>
              <div className="border-t border-gray-100 pt-3">
                <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                <p className="text-gray-500 text-xs">{t.role}</p>
                <p className="text-[#61f7a2] font-semibold text-sm mt-1">💰 {t.result}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ================================================================ */}
        {/* URGENCE */}
        {/* ================================================================ */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 mb-8 text-center">
          <div className="flex items-center justify-center gap-2 text-amber-700 font-semibold mb-3">
            <AlertTriangle className="w-5 h-5" />
            Cette offre disparaît dans :
          </div>
          <p className="text-5xl font-black text-gray-900 mb-3 font-mono">
            {formatTime(timeLeft)}
          </p>
          <p className="text-amber-700">
            et ne sera plus jamais disponible à ce prix.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-200 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Places limitées : {placesRestantes}/10 restantes ce mois-ci
          </div>
        </div>

        {/* ================================================================ */}
        {/* CTA */}
        {/* ================================================================ */}
        <div className="text-center space-y-4">
          <button
            onClick={onAccept}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#61f7a2] to-[#4de88f] hover:from-[#4de88f] hover:to-[#61f7a2] text-white text-xl font-bold px-12 py-5 rounded-2xl shadow-xl shadow-[#61f7a2]/20 transition-all hover:scale-105 active:scale-100"
          >
            <Rocket className="w-6 h-6" />
            OUI, je veux être accompagné — 497€
          </button>
          
          <div>
            <button
              onClick={onDecline}
              className="text-gray-500 hover:text-gray-700 underline underline-offset-4 transition-colors"
            >
              Non merci, je préfère avancer seul →
            </button>
          </div>

          {/* Garanties */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Paiement 100% sécurisé par Stripe
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Satisfait ou remboursé 30 jours
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              97% font leur 1ère vente
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}