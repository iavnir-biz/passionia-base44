import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Sparkles,
  CheckCircle,
  ArrowRight,
  Loader2,
  Target,
  Mail,
  FileText,
  Users,
  BarChart3,
  MessageSquare,
  Zap,
  Shield,
  Clock,
  Rocket,
  X,
  TrendingUp,
  Heart,
  Star,
  Gift,
  Video,
  Package,
  ShoppingBag,
  Crown,
  Trophy,
  Lock,
  Play
} from 'lucide-react';
import OnboardingSidebar from '@/components/onboarding/OnboardingSidebar';
import { cn } from "@/lib/utils";

// Noah Brain Icon
const NoahBrainIcon = ({ size = 48 }) => (
  <div 
    className="rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-lg"
    style={{ width: size, height: size }}
  >
    <span style={{ fontSize: size * 0.5 }}>🧠</span>
  </div>
);

// Week Card
const WeekCard = ({ week, title, goal, isFirst }) => (
  <div className={`rounded-xl p-3 border-2 ${isFirst ? 'bg-gradient-to-br from-green-100 to-green-50 border-[#61f7a2]' : 'bg-white/10 border-white/20'}`}>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${isFirst ? 'bg-gradient-to-br from-[#61f7a2] to-green-500 text-white' : 'bg-white/20 text-white'}`}>
        S{week}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-bold text-sm ${isFirst ? 'text-gray-900' : 'text-white'}`}>{title}</span>
          {isFirst && (
            <span className="bg-[#61f7a2] text-gray-900 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              PRIORITÉ
            </span>
          )}
        </div>
        <p className={`text-xs font-semibold ${isFirst ? 'text-[#61f7a2]' : 'text-gray-300'}`}>
          🎯 {goal}
        </p>
      </div>
      {!isFirst && <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />}
    </div>
  </div>
);

// Skool Feature
const SkoolFeature = ({ emoji, title, isHighlight }) => (
  <div className={`flex items-center gap-2 p-2 rounded-lg text-xs ${isHighlight ? 'bg-yellow-50 border border-yellow-300' : 'bg-white border border-gray-200'}`}>
    <span>{emoji}</span>
    <span className="text-gray-900 font-medium">{title}</span>
    {isHighlight && <span className="text-yellow-500">⭐</span>}
  </div>
);

export default function CTAPAYWALL() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  // Order Bump states
  const [hasOrderBump, setHasOrderBump] = useState(false);
  const [showOrderBumpPopup, setShowOrderBumpPopup] = useState(false);

  // Prix
  const BASE_PRICE = 67;
  const ORDER_BUMP_PRICE = 37;
  const totalPrice = hasOrderBump ? BASE_PRICE + ORDER_BUMP_PRICE : BASE_PRICE;

  const weeks = [
    { week: 1, title: "Ta première vente", goal: "1 vente", isFirst: true },
    { week: 2, title: "Répétition & Order Bump", goal: "3 ventes", isFirst: false },
    { week: 3, title: "Offre supérieure", goal: "5 ventes", isFirst: false },
    { week: 4, title: "Système complet", goal: "10 ventes", isFirst: false }
  ];

  const generatorFeatures = [
    "📊 Analyse de marché détaillée",
    "👥 3 avatars de tes futurs acheteurs",
    "🎯 4 offres complètes (Full Stack Offer)",
    "💬 Messages de vente (plusieurs angles)",
    "📄 Pages de vente rédigées",
    "📧 8 emails marketing ready-to-send",
    "📅 Plan d'action 7 jours",
    "🎮 Dashboard gamifié"
  ];

  const skoolFeatures = [
    { emoji: "🎥", title: "Accompagnement vidéo", isHighlight: true },
    { emoji: "📺", title: "2 lives/semaine", isHighlight: false },
    { emoji: "🎧", title: "30 min coaching privé", isHighlight: true },
    { emoji: "📚", title: "Formation complète", isHighlight: false },
    { emoji: "👥", title: "Communauté 24/7", isHighlight: false },
    { emoji: "📁", title: "Templates & ressources", isHighlight: false },
    { emoji: "⭐", title: "1 Live Premium/mois", isHighlight: true },
    { emoji: "💬", title: "WhatsApp VIP", isHighlight: false },
    { emoji: "🧠", title: "Mastermind", isHighlight: false }
  ];

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (currentUser.has_purchased) {
        navigate(createPageUrl('Dashboard'));
        return;
      }

      if (currentUser.sessionId) {
        const sessions = await base44.entities.Session.filter({ id: currentUser.sessionId });
        if (sessions.length > 0) {
          setSession(sessions[0]);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAccess = async () => {
    if (!user) return;

    setIsCreatingCheckout(true);
    try {
      const { data } = await base44.functions.invoke('createCheckout', {
        hasOrderBump: hasOrderBump
      });

      if (data.success && data.url) {
        await base44.auth.updateMe({
          paywall_clicked_at: new Date().toISOString()
        });
        window.top.location.href = data.url;
      } else {
        alert('Erreur: impossible de créer la session de paiement');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
      </div>
    );
  }

  const completedSteps = [1, 2, 3, 4, 5, 6];
  const potentialRevenue = session?.potential_revenue || 3200;

  return (
    <div className="min-h-screen bg-white flex overflow-x-hidden w-full max-w-[100vw]">
      <OnboardingSidebar currentPage="CTAPAYWALL" completedSteps={completedSteps} progressInStep={0} />

      <div className="flex-1 flex flex-col lg:ml-80 overflow-x-hidden w-full min-w-0">
        
        {/* Sticky Header Mobile */}
        <div className="lg:hidden bg-gray-900 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <NoahBrainIcon size={32} />
            <div>
              <p className="text-white font-semibold text-xs">Pack Générateur</p>
              <p className="text-gray-400 text-[10px]">+ 7j communauté</p>
            </div>
          </div>
          <button 
            onClick={handleGetAccess}
            disabled={isCreatingCheckout}
            className="bg-[#61f7a2] text-gray-900 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1"
          >
            {isCreatingCheckout ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{totalPrice}€ <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>

        <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6">

          {/* SECTION 1: Hero */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-1.5 bg-green-100 border border-green-300 px-3 py-1.5 rounded-full mb-4">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-semibold text-sm">Tout est prêt !</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Ton business est à<br /><span className="text-[#61f7a2]">un clic</span>
            </h1>
            <p className="text-gray-600 mb-4">
              Noah a tout préparé. <strong>100% personnalisé.</strong>
            </p>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 px-4 py-2 rounded-xl border border-green-200">
              <span className="text-gray-700 text-sm">Potentiel :</span>
              <span className="font-bold text-[#61f7a2]">{potentialRevenue.toLocaleString('fr-FR')} €/mois</span>
            </div>
          </motion.div>

          {/* SECTION 2: VSL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 rounded-2xl p-4 overflow-hidden"
          >
            <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src="https://player.vimeo.com/video/1161817300?h=4878f93b53&badge=0&autopause=0&player_id=0&app_id=58479"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                allowFullScreen
                title="Passion IA"
              />
            </div>
            <p className="text-gray-400 text-xs text-center mt-3">Ce qui t'attend après le paiement</p>
          </motion.div>

          {/* SECTION 3: Générateur Noah */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <NoahBrainIcon size={40} />
              <div>
                <h2 className="text-lg font-bold text-gray-900">Le Générateur Noah</h2>
                <p className="text-gray-500 text-xs">100% personnalisé à ton profil</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-1.5 mb-4">
              {generatorFeatures.map((feature, i) => (
                <div key={i} className={`flex items-center gap-2 p-2.5 rounded-lg text-sm ${i < 4 ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <div className="bg-green-100 rounded-xl p-3 border border-green-300 text-center">
              <p className="text-gray-900 text-sm">
                <strong className="text-[#61f7a2]">Jusqu'à 5 générations</strong> pour affiner tes offres
              </p>
            </div>
          </motion.div>

          {/* SECTION 4: Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-2 text-center">
              🎯 Ce qui t'attend dans ton dashboard
            </h2>
            <p className="text-gray-500 text-xs text-center mb-4">Tout est personnalisé pour toi</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { emoji: "📊", label: "Analyse marché", color: "bg-orange-50" },
                { emoji: "👥", label: "3 avatars", color: "bg-blue-50" },
                { emoji: "🎯", label: "4 offres", color: "bg-purple-50" },
                { emoji: "💬", label: "Messages", color: "bg-green-50" },
                { emoji: "📄", label: "Pages vente", color: "bg-pink-50" },
                { emoji: "📧", label: "8 emails", color: "bg-cyan-50" }
              ].map((item, i) => (
                <div key={i} className={`${item.color} rounded-xl p-3 text-center relative border border-gray-100`}>
                  <span className="text-2xl">{item.emoji}</span>
                  <p className="text-gray-900 text-[10px] font-medium mt-1">{item.label}</p>
                  <span className="absolute top-1 right-1 bg-[#61f7a2] text-gray-900 text-[8px] px-1.5 py-0.5 rounded font-bold">PERSO</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* SECTION 5: Plan 4 semaines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900 rounded-2xl p-5"
          >
            <h2 className="text-white font-bold mb-1">🗺️ Plan "Première vente en 7 jours"</h2>
            <p className="text-gray-400 text-xs mb-4">Guide jour par jour + scripts + checklist</p>
            <div className="space-y-2">
              {weeks.map((week, i) => (
                <WeekCard key={i} {...week} />
              ))}
            </div>
            <div className="bg-[#61f7a2]/20 rounded-xl p-3 mt-4 border border-[#61f7a2]/30">
              <p className="text-white text-center text-sm">
                <strong className="text-[#61f7a2]">De 0 à 10 ventes en 4 semaines</strong>
              </p>
            </div>
          </motion.div>

          {/* SECTION 6: 7 jours communauté */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-300 p-5 relative"
          >
            <span className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              🎁 OFFERT
            </span>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">7 jours communauté</h2>
                <p className="text-gray-600 text-xs">Teste tout sans engagement</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {skoolFeatures.map((feature, i) => (
                <SkoolFeature key={i} {...feature} />
              ))}
            </div>
            <div className="bg-white/80 rounded-xl p-2 border border-purple-200 text-center">
              <p className="text-sm">
                <strong className="text-purple-600">Valeur : 37€</strong> → <span className="text-[#61f7a2] font-bold">OFFERT</span>
              </p>
            </div>
          </motion.div>

          {/* SECTION 7: Order Bump */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => setShowOrderBumpPopup(true)}
            className={`rounded-2xl p-5 cursor-pointer border-4 transition-all ${hasOrderBump ? 'bg-green-100 border-[#61f7a2] shadow-lg' : 'bg-white border-[#61f7a2]'}`}
          >
            <div className="flex justify-center mb-3">
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                ⚡ -75% OFFRE SPÉCIALE
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div 
                className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${hasOrderBump ? 'bg-[#61f7a2] border-[#61f7a2]' : 'border-gray-300'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setHasOrderBump(!hasOrderBump);
                }}
              >
                {hasOrderBump && <CheckCircle className="w-4 h-4 text-white" />}
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🎬</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900">Pack Réseaux Sociaux</h3>
                <p className="text-gray-600 text-[10px]">100+ templates prêts à poster</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-black text-[#61f7a2]">+{ORDER_BUMP_PRICE}€</span>
                  <span className="text-gray-400 line-through text-xs">147€</span>
                </div>
              </div>
            </div>
            {hasOrderBump && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 pt-3 border-t border-[#61f7a2]/30"
              >
                <p className="text-[#61f7a2] font-semibold text-center text-xs flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Ajouté à ta commande !
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* SECTION 8: Comparatif */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-red-500" />
                </div>
                <span className="font-bold text-gray-900 text-sm">Sans</span>
              </div>
              <ul className="space-y-2 text-xs text-gray-500">
                <li className="flex items-start gap-1.5"><X className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" /> Tu galères seul</li>
                <li className="flex items-start gap-1.5"><X className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" /> Tu abandonnes</li>
              </ul>
            </div>
            <div className="bg-green-100 rounded-xl border-2 border-[#61f7a2] p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-[#61f7a2] flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900 text-sm">Avec</span>
              </div>
              <ul className="space-y-2 text-xs text-gray-900 font-medium">
                <li className="flex items-start gap-1.5"><CheckCircle className="w-3 h-3 text-[#61f7a2] flex-shrink-0 mt-0.5" /> Tout est prêt</li>
                <li className="flex items-start gap-1.5"><CheckCircle className="w-3 h-3 text-[#61f7a2] flex-shrink-0 mt-0.5" /> <strong>1 vente en 7j</strong></li>
              </ul>
            </div>
          </motion.div>

          {/* SECTION 9: Prix + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-24 h-24 bg-[#61f7a2]/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <p className="text-gray-400 text-sm mb-2">Accès complet</p>
              <div className="mb-4">
                <span className="text-gray-500 line-through text-xl">297€</span>
                <span className="text-white text-5xl md:text-6xl font-black ml-2">{totalPrice}€</span>
              </div>
              {hasOrderBump && (
                <p className="text-[#61f7a2] text-xs mb-4">
                  Générateur (67€) + Pack RS (37€)
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-2 mb-5">
                {["Générateur ∞", "Plan 4 sem", "7j communauté"].map((item, i) => (
                  <span key={i} className="bg-white/10 text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-[#61f7a2]" />
                    {item}
                  </span>
                ))}
              </div>
              <button 
                onClick={handleGetAccess}
                disabled={isCreatingCheckout}
                className="w-full bg-[#61f7a2] text-gray-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-lg hover:bg-[#4de88f] transition-colors disabled:opacity-50"
              >
                {isCreatingCheckout ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redirection...
                  </>
                ) : (
                  <>
                    ✨ Débloquer pour {totalPrice}€
                  </>
                )}
              </button>
              <p className="text-gray-400 text-[10px] mt-3">🔒 Sécurisé • ⚡ Accès immédiat</p>
            </div>
          </motion.div>

          {/* SECTION 10: Garantie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="bg-green-50 rounded-2xl border-2 border-green-300 p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Garantie "1 vente en 30 jours"</h3>
                <p className="text-gray-600 text-xs">Ou remboursement, sans question</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-green-200">
              <p className="text-gray-700 text-sm text-center">
                Tu fais ta 1ère vente (même mini-produit) ou <strong>remboursement total</strong>.
              </p>
            </div>
          </motion.div>

          {/* SECTION 11: FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-2"
          >
            <h3 className="font-bold text-gray-900 text-center mb-3">Questions fréquentes</h3>
            {[
              { q: "J'ai accès à quoi ?", a: "Générateur (5 générations), 4 offres, messages, emails, plan 4 sem, 7j communauté" },
              { q: "Besoin de tech ?", a: "Non. Tu copies, tu appliques. Tout est expliqué." },
              { q: "Et si 0 vente ?", a: "Garantie 30 jours : remboursement intégral" }
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="font-semibold text-gray-900 text-sm">{faq.q}</p>
                <p className="text-gray-600 text-xs mt-1">{faq.a}</p>
              </div>
            ))}
          </motion.div>

          {/* SECTION 12: Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="text-center pb-8"
          >
            <p className="font-bold text-gray-900 text-lg mb-3">Ton business t'attend.</p>
            <button 
              onClick={handleGetAccess}
              disabled={isCreatingCheckout}
              className="bg-[#61f7a2] text-gray-900 font-bold px-8 py-4 rounded-xl flex items-center gap-2 mx-auto hover:bg-[#4de88f] transition-colors disabled:opacity-50"
            >
              {isCreatingCheckout ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Redirection...
                </>
              ) : (
                <>
                  C'est parti pour {totalPrice}€ <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>

        </div>

        {/* Sticky Bottom Desktop */}
        <div className="hidden lg:flex bg-white border-t border-gray-200 p-4 items-center justify-center gap-6 sticky bottom-0">
          <div>
            <span className="text-gray-400 line-through text-sm">297€</span>
            <span className="text-gray-900 font-bold text-2xl ml-2">{totalPrice}€</span>
          </div>
          <button 
            onClick={handleGetAccess}
            disabled={isCreatingCheckout}
            className="bg-[#61f7a2] text-gray-900 font-bold px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-[#4de88f] transition-colors disabled:opacity-50"
          >
            {isCreatingCheckout ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Redirection...
              </>
            ) : (
              <>
                Débloquer <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* POPUP Order Bump Détails */}
      {showOrderBumpPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowOrderBumpPopup(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-[#61f7a2] to-green-500 p-5 rounded-t-3xl relative">
              <button
                onClick={() => setShowOrderBumpPopup(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="text-center">
                <span className="text-4xl mb-2 block">🎬</span>
                <h2 className="text-xl font-bold text-white mb-1">
                  Pack Réseaux Sociaux
                </h2>
                <p className="text-white/80 text-sm mb-2">100+ Templates prêts à poster</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-black text-white">+37€</span>
                  <span className="text-white/60 line-through text-sm">147€</span>
                </div>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-5 space-y-4">
              {/* Instagram/TikTok */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-lg">📱</span>
                  Instagram / TikTok
                </h3>
                <ul className="space-y-1.5 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>30 scripts Reels adaptés à ton offre</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>20 hooks viraux pour capter l'attention</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>15 légendes de posts qui convertissent</span>
                  </li>
                </ul>
              </div>

              {/* Carrousels */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-lg">🎨</span>
                  Carrousels
                </h3>
                <ul className="space-y-1.5 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>15 templates Canva de carrousels éducatifs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>Copywriting déjà fait, tu personnalises juste</span>
                  </li>
                </ul>
              </div>

              {/* Stories */}
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-lg">📖</span>
                  Stories
                </h3>
                <ul className="space-y-1.5 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>20 séquences de stories pour vendre</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>Stratégie "Story to DM to Sale"</span>
                  </li>
                </ul>
              </div>

              {/* BONUS */}
              <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl p-4 border-2 border-yellow-400">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    BONUS
                  </span>
                </div>
                <ul className="space-y-1.5 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <Gift className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">Calendrier de contenu 30 jours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Gift className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">Guide "Poster sans se montrer"</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 bg-gray-50 rounded-b-3xl border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setHasOrderBump(true);
                    setShowOrderBumpPopup(false);
                  }}
                  className="flex-1 py-3 px-4 bg-[#61f7a2] text-gray-900 font-bold rounded-xl hover:bg-[#4de88f] transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Ajouter au panier
                </button>
                <button
                  onClick={() => setShowOrderBumpPopup(false)}
                  className="px-5 py-3 bg-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Non merci
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}