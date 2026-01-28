import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Clock, MessageCircle, FileCheck, Shield, Check, Target, AlertTriangle, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// DOWNSELL SESSION DÉCLIC - 197€
// ============================================================================
// Affichée quand l'utilisateur refuse l'upsell 497€
// Objectif : récupérer avec une offre allégée à 197€
// ============================================================================

export default function DownsellSession() {
  const navigate = useNavigate();
  
  // ========================================================================
  // STATE & DATA
  // ========================================================================
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Animation d'entrée
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  // Données dynamiques
  const firstName = user?.firstName || session?.onboarding_full?.firstName || '';

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

      const sessions = await base44.entities.Session.filter({ created_by: currentUser.email });
      if (sessions.length > 0) {
        const userSession = sessions[0];
        setSession(userSession);

        if (userSession.has_coaching === true) {
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

  // ========================================================================
  // HANDLERS
  // ========================================================================
  const handleAcceptOffer = async () => {
    setIsCreatingCheckout(true);
    try {
      const { data } = await base44.functions.invoke('createCheckoutDownsell', {
        sessionId: session?.id,
        downsellPrice: 19700
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
      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      console.error('Error declining offer:', error);
      navigate(createPageUrl('Dashboard'));
    }
  };

  // ========================================================================
  // ÉLÉMENTS INCLUS
  // ========================================================================
  const inclus = [
    {
      icon: Target,
      title: "1 Session stratégique de 45 min",
      details: [
        "Audit complet de ton offre et positionnement",
        "Validation de ta cible et de ton pricing",
        "Plan d'action clair pour tes 30 prochains jours",
        "Tu repars avec une roadmap concrète"
      ],
      color: "from-emerald-400 to-teal-500"
    },
    {
      icon: MessageCircle,
      title: "14 jours de support WhatsApp",
      details: [
        "Pose tes questions après la session",
        "Feedback sur tes premières actions",
        "Déblocage si tu es coincé",
        "On reste disponibles 2 semaines"
      ],
      color: "from-blue-400 to-indigo-500"
    },
    {
      icon: FileCheck,
      title: "1 Revue de document incluse",
      details: [
        "Envoie-nous ta page de vente OU ton message de prospection",
        "On te fait un retour détaillé écrit",
        "Corrections et suggestions concrètes"
      ],
      color: "from-orange-400 to-amber-500"
    }
  ];

  // ========================================================================
  // COMPARATIF
  // ========================================================================
  const comparatif = [
    { feature: "Sessions", vip: "3 x 45 min", declic: "1 x 45 min" },
    { feature: "WhatsApp", vip: "30 jours", declic: "14 jours" },
    { feature: "Création tech", vip: true, declic: false },
    { feature: "Revues", vip: "Illimitées", declic: "1 document" },
    { feature: "Roadmap", vip: "Complète", declic: "Simplifiée" }
  ];

  // ========================================================================
  // RENDER
  // ========================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-50 via-white to-white transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        
        {/* ================================================================ */}
        {/* HEADER */}
        {/* ================================================================ */}
        <div className="text-center mb-8">
          {/* Icône */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-200 mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Titre */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Attends{firstName ? ` ${firstName}` : ''} — On comprend.
          </h1>

          {/* Sous-titre */}
          <div className="max-w-xl mx-auto text-gray-600 text-lg leading-relaxed">
            <p className="mb-3">
              497€, c'est un investissement. Et peut-être que tu n'as pas besoin de tout l'accompagnement VIP pour démarrer.
            </p>
            <p className="mb-3">
              Mais partir <span className="font-semibold text-gray-800">sans AUCUN accompagnement</span> ?<br />
              C'est le meilleur moyen de rejoindre les 90% qui n'obtiennent jamais de résultats.
            </p>
            <p className="text-[#61f7a2] font-semibold text-xl">
              On a une solution intermédiaire pour toi...
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
              <div>
                <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                  <Target className="w-4 h-4" />
                  DERNIÈRE CHANCE - OFFRE ALLÉGÉE
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Session Déclic + 14 jours de support
                </h2>
                <p className="text-gray-600 text-lg mt-1">avec Alfred & Damien</p>
              </div>
            </div>
            <p className="mt-4 text-gray-600 text-lg">
              L'essentiel pour valider ton offre et partir sur de bonnes bases.<br />
              <span className="text-gray-500">Sans l'engagement du coaching complet.</span>
            </p>
          </div>

          {/* Ce qui est inclus */}
          <div className="p-6 sm:p-8 space-y-4">
            {inclus.map((item, index) => (
              <div 
                key={index}
                className="flex gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                  <ul className="space-y-1">
                    {item.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600">
                        <Check className="w-4 h-4 text-[#61f7a2] flex-shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================================================================ */}
        {/* COMPARATIF VISUEL */}
        {/* ================================================================ */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
          <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
            <div className="p-4 font-semibold text-gray-700"></div>
            <div className="p-4 text-center border-l border-gray-200">
              <p className="font-bold text-gray-900">COACHING VIP</p>
              <p className="text-gray-500 text-sm">497€</p>
            </div>
            <div className="p-4 text-center border-l border-gray-200 bg-[#61f7a2]/10">
              <p className="font-bold text-[#61f7a2]">SESSION DÉCLIC</p>
              <p className="text-[#61f7a2] text-sm font-semibold">197€</p>
            </div>
          </div>
          {comparatif.map((row, index) => (
            <div key={index} className="grid grid-cols-3 border-b border-gray-100 last:border-b-0">
              <div className="p-4 text-gray-700 font-medium">{row.feature}</div>
              <div className="p-4 text-center border-l border-gray-100 text-gray-600">
                {typeof row.vip === 'boolean' ? (
                  row.vip ? <Check className="w-5 h-5 text-[#61f7a2] mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                ) : (
                  row.vip
                )}
              </div>
              <div className="p-4 text-center border-l border-gray-100 bg-[#61f7a2]/5 text-gray-600">
                {typeof row.declic === 'boolean' ? (
                  row.declic ? <Check className="w-5 h-5 text-[#61f7a2] mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                ) : (
                  row.declic
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ================================================================ */}
        {/* BLOC PRIX */}
        {/* ================================================================ */}
        <div className="bg-gradient-to-br from-[#61f7a2]/5 to-[#4de88f]/5 rounded-3xl p-6 sm:p-8 mb-8 border-2 border-[#61f7a2]/20">
          <div className="text-center">
            <p className="text-gray-500 mb-2">
              Valeur de cette formule : <span className="font-semibold">397€</span>
            </p>
            <div className="h-px bg-[#61f7a2]/20 max-w-xs mx-auto my-4"></div>
            <p className="text-[#61f7a2] font-bold text-lg mb-2">
              🎁 TON PRIX AUJOURD'HUI :
            </p>
            <p className="text-6xl sm:text-7xl font-black text-[#61f7a2] mb-4">
              197€
            </p>
            <div className="inline-flex items-center gap-2 bg-[#61f7a2] text-white px-6 py-3 rounded-full text-lg font-bold">
              Tu économises 200€
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* URGENCE */}
        {/* ================================================================ */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 mb-8 text-center">
          <div className="flex items-center justify-center gap-2 text-amber-700 font-semibold mb-2">
            <AlertTriangle className="w-5 h-5" />
            Cette offre est uniquement disponible MAINTENANT.
          </div>
          <p className="text-amber-700">
            Si tu quittes cette page, tu ne reverras plus jamais ce prix.
          </p>
        </div>

        {/* ================================================================ */}
        {/* CTA */}
        {/* ================================================================ */}
        <div className="text-center space-y-4">
          <button
            onClick={handleAcceptOffer}
            disabled={isCreatingCheckout}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#61f7a2] to-[#4de88f] hover:from-[#4de88f] hover:to-[#61f7a2] text-white text-xl font-bold px-12 py-5 rounded-2xl shadow-xl shadow-[#61f7a2]/20 transition-all hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingCheckout ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Check className="w-6 h-6" />
            )}
            {isCreatingCheckout ? 'Redirection...' : 'OUI, je prends la Session Déclic — 197€'}
          </button>
          
          <div>
            <button
              onClick={handleDeclineOffer}
              disabled={isCreatingCheckout}
              className="text-gray-500 hover:text-gray-700 underline underline-offset-4 transition-colors disabled:opacity-50"
            >
              Non merci, je me lance vraiment seul →
            </button>
          </div>

          {/* Garanties */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Paiement 100% sécurisé
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Satisfait ou remboursé 14 jours
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}