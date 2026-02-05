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
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-200 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Titre */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Attends{firstName ? ` ${firstName}` : ''} — On comprend.
          </h1>

          {/* Sous-titre */}
          <div className="text-gray-600 text-base leading-relaxed">
            <p className="mb-2">
              497€, c'est un investissement. Mais partir <span className="font-semibold text-gray-800">sans AUCUN accompagnement</span> ?
            </p>
            <p className="text-[#61f7a2] font-semibold text-lg">
              On a une solution intermédiaire pour toi...
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
          <div className="p-5 sm:p-6 space-y-3 max-h-[250px] overflow-y-auto">
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
        {/* BLOC PRIX COMPACT */}
        {/* ================================================================ */}
        <div className="bg-gradient-to-br from-[#61f7a2]/10 to-[#4de88f]/10 p-5 sm:p-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-1">
              Valeur : <span className="line-through">397€</span>
            </p>
            <p className="text-4xl sm:text-5xl font-black text-[#61f7a2] mb-2">
              197€
            </p>
            <div className="inline-flex items-center gap-2 bg-[#61f7a2] text-white px-4 py-2 rounded-full text-sm font-bold">
              Tu économises 200€
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* URGENCE COMPACT */}
        {/* ================================================================ */}
        <div className="bg-amber-50 border-t border-amber-200 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-amber-700 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4" />
            Cette offre est uniquement disponible MAINTENANT.
          </div>
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
              <Check className="w-5 h-5" />
            )}
            {isCreatingCheckout ? 'Redirection...' : 'OUI, je prends la Session Déclic — 197€'}
          </button>
          
          <button
            onClick={handleDeclineOffer}
            disabled={isCreatingCheckout}
            className="w-full text-gray-500 hover:text-gray-700 underline underline-offset-4 transition-colors disabled:opacity-50 text-sm py-2"
          >
            Non merci, je me lance vraiment seul →
          </button>

          {/* Garanties */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Paiement sécurisé
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3" />
              Remboursé 14j
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}