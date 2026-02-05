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
  Play,
  ChevronDown,
  ChevronUp,
  Palette,
  Calendar,
  BookOpen,
  Headphones,
  MessageCircle,
  RefreshCw
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

// Week Card pour le plan 30 jours
const WeekCard = ({ week, emoji, title, tasks, goal, isFirst }) => (
  <div className={cn(
    "rounded-2xl p-4 border-2 transition-all",
    isFirst 
      ? "bg-gradient-to-br from-green-50 to-emerald-50 border-[#61f7a2] shadow-lg" 
      : "bg-white border-gray-200"
  )}>
    <div className="flex items-start gap-3">
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0",
        isFirst 
          ? "bg-gradient-to-br from-[#61f7a2] to-green-500 text-white" 
          : "bg-gray-100 text-gray-600"
      )}>
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="text-xs font-medium text-gray-500">SEMAINE {week}</span>
          {isFirst && (
            <span className="bg-[#61f7a2] text-gray-900 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              PRIORITÉ
            </span>
          )}
        </div>
        <h4 className={cn(
          "font-bold mb-2",
          isFirst ? "text-gray-900" : "text-gray-800"
        )}>{title}</h4>
        <ul className="space-y-1 mb-3">
          {tasks.map((task, i) => (
            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
              <span className="text-gray-400">•</span>
              {task}
            </li>
          ))}
        </ul>
        <div className={cn(
          "text-sm font-semibold",
          isFirst ? "text-[#61f7a2]" : "text-gray-500"
        )}>
          🎯 Objectif : {goal}
        </div>
      </div>
    </div>
  </div>
);

// FAQ Item avec accordion
const FAQItem = ({ question, answer, isOpen, onToggle }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
    >
      <span className="font-semibold text-gray-900 text-sm pr-4">{question}</span>
      {isOpen ? (
        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
      )}
    </button>
    {isOpen && (
      <div className="px-4 pb-4">
        <p className="text-gray-600 text-sm leading-relaxed">{answer}</p>
      </div>
    )}
  </div>
);

export default function CTAPAYWALL() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);

  // Order Bump states
  const [showOrderBumpPopup, setShowOrderBumpPopup] = useState(false);

  // Prix
  const BASE_PRICE = 67;
  const ORDER_BUMP_PRICE = 37;

  // Plan 30 jours
  const weeks = [
    { 
      week: 1, 
      emoji: "🚀", 
      title: "LANCER", 
      tasks: [
        "Créer ton petit produit (Low Ticket)",
        "Envoyer tes premiers messages de vente"
      ],
      goal: "Ta 1ère vente",
      isFirst: true 
    },
    { 
      week: 2, 
      emoji: "🎨", 
      title: "CRÉER", 
      tasks: [
        "Designer ton système de vente complet",
        "Te lancer sur les réseaux sociaux",
        "Ajouter le Petit Extra (Order Bump)"
      ],
      goal: "3 ventes",
      isFirst: false 
    },
    { 
      week: 3, 
      emoji: "📊", 
      title: "STRUCTURER", 
      tasks: [
        "Récolter tes premiers avis clients",
        "Créer et vendre l'offre supérieure",
        "Préparer tes premières publicités"
      ],
      goal: "5 ventes",
      isFirst: false 
    },
    { 
      week: 4, 
      emoji: "⚡", 
      title: "AUTOMATISER", 
      tasks: [
        "Préparer ton produit High Ticket",
        "Automatiser tout ton système de vente"
      ],
      goal: "10 ventes",
      isFirst: false 
    }
  ];

  // Ce que tu reçois
  const generatorFeatures = [
    { icon: "📊", text: "Analyse de marché détaillée" },
    { icon: "👥", text: "3 avatars de tes futurs clients" },
    { icon: "🎯", text: "4 offres complètes avec prix (ta Full Stack Offer)" },
    { icon: "💬", text: "Messages de vente prêts (plusieurs angles)" },
    { icon: "📄", text: "Pages de vente rédigées pour chaque offre" },
    { icon: "📧", text: "8 emails marketing ready-to-send" },
    { icon: "🔄", text: "Jusqu'à 5 générations pour affiner" }
  ];

  // FAQ
  const faqs = [
    {
      q: "Dois-je avoir une grosse audience pour commencer ?",
      a: "Non. Le plan d'action est conçu pour démarrer de zéro. Tu vas apprendre à trouver tes premiers clients même sans audience, grâce aux messages de vente personnalisés et aux stratégies qu'on te donne."
    },
    {
      q: "Faut-il des compétences techniques ou en IA ?",
      a: "Aucune. Noah génère tout pour toi. Tu copies, tu colles, tu appliques. Les modules de formation t'expliquent chaque étape simplement."
    },
    {
      q: "L'accès à Noah (le générateur) est-il à vie ?",
      a: "Oui. Tu paies une fois, tu as accès au générateur à vie. Tu peux régénérer tes offres jusqu'à 5 fois pour les affiner."
    },
    {
      q: "Le plan d'action est-il vraiment sur mesure ?",
      a: "Oui. Noah analyse ton profil, ton expertise et tes objectifs pour créer un plan adapté à TA situation. Les ressources générées (messages, emails, pages) sont 100% personnalisées."
    },
    {
      q: "Et si je ne fais aucune vente en 30 jours ?",
      a: "On te rembourse intégralement, sans question. C'est notre garantie : 1 vente minimum ou remboursé."
    },
    {
      q: "Combien de temps dois-je y consacrer par jour ?",
      a: "Le plan est conçu pour 1 à 2 heures par jour. Certaines tâches prennent 15 minutes (copier-coller un message), d'autres demandent plus de temps (créer ton produit)."
    },
    {
      q: "Puis-je changer de thématique ou de projet plus tard ?",
      a: "Oui. Tu as jusqu'à 5 générations avec Noah. Tu peux tester différentes idées ou pivoter si besoin."
    },
    {
      q: "Comment fonctionnent les 7 jours d'essai Skool ?",
      a: "Tu as accès à TOUT pendant 7 jours : formation, communauté, lives, templates, coaching. Après 7 jours, tu peux continuer avec un abonnement ou rester avec ton générateur."
    }
  ];

  // Avant/Après
  const beforeAfter = {
    before: [
      "Tu as une idée floue depuis des mois",
      "Tu ne sais pas quoi dire pour vendre",
      "Tu procrastines, tu repousses",
      "Tu es seul face à tes doutes",
      "Tu ne sais pas si ça va marcher"
    ],
    after: [
      "Tu as 4 offres claires avec leurs prix",
      "Tout est écrit pour toi (tu copies-colles)",
      "Tu suis un plan jour par jour",
      "Tu as une communauté et du coaching",
      "Garantie : 1 vente en 30 jours ou remboursé"
    ]
  };

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

  // Ouvre le popup Order Bump quand on clique sur un CTA
  const handleCTAClick = () => {
    if (!user) return;
    setShowOrderBumpPopup(true);
  };

  // Procède au paiement Stripe avec ou sans Order Bump
  const handleProceedToCheckout = async (withOrderBump) => {
    if (!user) return;

    setShowOrderBumpPopup(false);
    setIsCreatingCheckout(true);
    
    try {
      const { data } = await base44.functions.invoke('createCheckout', {
        hasOrderBump: withOrderBump
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
  const potentialRevenue = session?.potential_revenue || 0;

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden w-full max-w-[100vw]">
      <OnboardingSidebar currentPage="CTAPAYWALL" completedSteps={completedSteps} progressInStep={0} />

      <div className="flex-1 flex flex-col lg:ml-80 overflow-x-hidden w-full min-w-0">
        
        {/* Sticky Header Mobile */}
        <div className="lg:hidden bg-gray-900 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <NoahBrainIcon size={32} />
            <div>
              <p className="text-white font-semibold text-xs">Système Complet</p>
              <p className="text-gray-400 text-[10px]">+ 7j communauté offerts</p>
            </div>
          </div>
          <button 
            onClick={handleCTAClick}
            disabled={isCreatingCheckout}
            className="bg-[#61f7a2] text-gray-900 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1"
          >
            {isCreatingCheckout ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{BASE_PRICE}€ <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>

        <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-8">

          {/* ============================================ */}
          {/* SECTION 1: HERO */}
          {/* ============================================ */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center pt-4"
          >
            <div className="inline-flex items-center gap-1.5 bg-green-100 border border-green-300 px-3 py-1.5 rounded-full mb-4">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-semibold text-sm">Tout est prêt !</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Ton business est à<br /><span className="text-[#61f7a2]">un clic</span>
            </h1>
            <p className="text-gray-600 mb-4 text-lg">
              Noah a tout préparé. <strong>100% personnalisé.</strong>
            </p>
            {potentialRevenue > 0 && (
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 px-5 py-3 rounded-2xl border border-green-200">
                <TrendingUp className="w-5 h-5 text-[#61f7a2]" />
                <span className="text-gray-700">Potentiel :</span>
                <span className="font-bold text-xl text-[#61f7a2]">{potentialRevenue.toLocaleString('fr-FR')} €/mois</span>
              </div>
            )}
          </motion.div>

          {/* ============================================ */}
          {/* SECTION 2: VSL */}
          {/* ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 rounded-3xl p-5 overflow-hidden"
          >
            <h2 className="text-white font-bold text-center mb-4 flex items-center justify-center gap-2">
              <Play className="w-5 h-5 text-[#61f7a2]" />
              Découvre ton cockpit en 90 secondes
            </h2>
            <div className="relative w-full rounded-2xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src="https://player.vimeo.com/video/1161817300?h=4878f93b53&badge=0&autopause=0&player_id=0&app_id=58479"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                allowFullScreen
                title="Passion IA"
              />
            </div>
          </motion.div>

          {/* ============================================ */}
          {/* SECTION 3: CE QUE TU REÇOIS */}
          {/* ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <NoahBrainIcon size={48} />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Tout ce que Noah a préparé pour toi</h2>
                <p className="text-gray-500 text-sm">100% personnalisé à ton profil</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {generatorFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors">
                  <span className="text-xl">{feature.icon}</span>
                  <span className="text-gray-800 font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ============================================ */}
          {/* SECTION 4: PLAN D'ACTION 30 JOURS */}
          {/* ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm"
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">🗺️ Ton plan d'action sur 30 jours</h2>
              <p className="text-gray-600 text-sm">La méthode étape par étape pour vivre de ton savoir</p>
            </div>

            <div className="space-y-4 mb-6">
              {weeks.map((week, i) => (
                <WeekCard key={i} {...week} />
              ))}
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-[#61f7a2]">
              <p className="text-gray-800 text-sm text-center leading-relaxed">
                <strong className="text-[#61f7a2]">Tout est prêt et structuré.</strong> Tu n'as qu'à suivre les étapes et copier-coller les ressources au fur et à mesure. La stack technique et digitale est là, tu pioches ce dont tu as besoin.
              </p>
            </div>
          </motion.div>

          {/* ============================================ */}
          {/* SECTION 5: 7 JOURS SKOOL */}
          {/* ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-purple-300 p-6 relative overflow-hidden"
          >
            <span className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              🎁 OFFERT
            </span>
            
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">🎁 7 jours offerts dans la communauté Skool</h2>
              <p className="text-gray-600 text-sm">Tu n'es jamais seul dans cette aventure</p>
            </div>

            {/* BLOC 1: Formation vidéo */}
            <div className="bg-white rounded-2xl p-4 mb-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">📚 FORMATION VIDÉO COMPLÈTE</h3>
                  <p className="text-purple-600 text-xs">Pour vivre de ta passion en ligne</p>
                </div>
              </div>
              <ul className="space-y-1.5 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  Module Paiement (Stripe, systèmes de paiement...)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  Module Création du petit produit + design
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  Module Trouver ses premiers clients
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  Module Réseaux sociaux (même sans se montrer)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  Et plus encore...
                </li>
              </ul>
            </div>

            {/* BLOC 2: Communauté active */}
            <div className="bg-white rounded-2xl p-4 mb-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">👥 COMMUNAUTÉ ACTIVE</h3>
              </div>
              <ul className="space-y-1.5 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Groupe privé Skool avec des passionnés comme toi
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  2 lives thématiques par semaine
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Entraide et networking 24/7
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Accès à toutes les ressources et templates (design, outils IA...)
                </li>
              </ul>
            </div>

            {/* BLOC 3: Bonus Premium */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-4 border-2 border-yellow-400">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-200 flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="font-bold text-gray-900 flex items-center gap-1">
                  ⭐ BONUS PREMIUM
                  <Star className="w-4 h-4 text-yellow-500" />
                  <Star className="w-4 h-4 text-yellow-500" />
                  <Star className="w-4 h-4 text-yellow-500" />
                </h3>
              </div>
              <ul className="space-y-1.5 text-sm text-gray-800 font-medium">
                <li className="flex items-start gap-2">
                  <Gift className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  30 min de coaching 1-to-1 par mois
                </li>
                <li className="flex items-start gap-2">
                  <Gift className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  Cerveau collectif & décision stratégique
                </li>
                <li className="flex items-start gap-2">
                  <Gift className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  Groupe WhatsApp VIP
                </li>
              </ul>
            </div>

            <div className="bg-white/80 rounded-xl p-3 mt-4 border border-purple-200 text-center">
              <p className="text-sm">
                Valeur : <strong className="text-purple-600">37€/mois</strong> → <span className="text-[#61f7a2] font-bold text-lg">7 JOURS OFFERTS</span> avec ton accès
              </p>
            </div>
          </motion.div>

          {/* ============================================ */}
          {/* SECTION 6: AVANT / APRÈS */}
          {/* ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Ce qui change vraiment</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* AVANT */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <X className="w-5 h-5 text-red-500" />
                  </div>
                  <span className="font-bold text-gray-700">AVANT</span>
                </div>
                <ul className="space-y-3">
                  {beforeAfter.before.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* APRÈS */}
              <div className="bg-green-50 rounded-2xl p-5 border-2 border-[#61f7a2]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#61f7a2] flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-gray-900">APRÈS</span>
                </div>
                <ul className="space-y-3">
                  {beforeAfter.after.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-800 font-medium">
                      <CheckCircle className="w-4 h-4 text-[#61f7a2] flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* ============================================ */}
          {/* SECTION 7: PRIX + CTA */}
          {/* ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#61f7a2]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-white font-bold text-xl mb-2">Accès complet au système</h2>
              <p className="text-gray-400 text-sm mb-4">Paiement unique • Accès à vie au générateur</p>
              
              <div className="mb-6">
                <span className="text-gray-500 line-through text-2xl">297€</span>
                <span className="text-white text-6xl md:text-7xl font-black ml-3">{BASE_PRICE}€</span>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {["Générateur Noah ∞", "Plan 30 jours", "7j communauté", "Garantie 30j"].map((item, i) => (
                  <span key={i} className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-[#61f7a2]" />
                    {item}
                  </span>
                ))}
              </div>
              
              <button 
                onClick={handleCTAClick}
                disabled={isCreatingCheckout}
                className="w-full max-w-md mx-auto bg-[#61f7a2] text-gray-900 font-bold py-5 rounded-2xl flex items-center justify-center gap-2 text-xl hover:bg-[#4de88f] transition-all hover:scale-105 disabled:opacity-50 shadow-xl shadow-[#61f7a2]/30"
              >
                {isCreatingCheckout ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Redirection...
                  </>
                ) : (
                  <>
                    ✨ Débloquer mon système pour {BASE_PRICE}€
                  </>
                )}
              </button>
              <p className="text-gray-400 text-xs mt-4">🔒 Paiement sécurisé • ⚡ Accès immédiat</p>
            </div>
          </motion.div>

          {/* ============================================ */}
          {/* SECTION 8: GARANTIE */}
          {/* ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl border-2 border-green-400 p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-xl">1 vente en 30 jours ou remboursé</h3>
                <p className="text-gray-600 text-sm">Notre garantie, sans question posée</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-green-200">
              <p className="text-gray-700 text-center">
                Tu appliques le plan, tu fais ta première vente (même un mini-produit). Si tu ne fais <strong>aucune vente en 30 jours</strong>, on te rembourse <strong>intégralement</strong>. Aucune question posée.
              </p>
            </div>
          </motion.div>

          {/* ============================================ */}
          {/* SECTION 9: FAQ COMPLÈTE */}
          {/* ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-3"
          >
            <h2 className="text-xl font-bold text-gray-900 text-center mb-4">Tes questions, nos réponses</h2>
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                question={faq.q}
                answer={faq.a}
                isOpen={openFAQ === i}
                onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
              />
            ))}
          </motion.div>

          {/* ============================================ */}
          {/* SECTION 10: FINAL CTA */}
          {/* ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-center py-8"
          >
            <h2 className="font-bold text-gray-900 text-2xl mb-2">Ton système t'attend.</h2>
            <p className="text-gray-600 mb-6">Tout est prêt. Il ne manque plus que toi.</p>
            <button 
              onClick={handleCTAClick}
              disabled={isCreatingCheckout}
              className="bg-[#61f7a2] text-gray-900 font-bold px-10 py-5 rounded-2xl flex items-center gap-3 mx-auto hover:bg-[#4de88f] transition-all hover:scale-105 disabled:opacity-50 shadow-xl text-lg"
            >
              {isCreatingCheckout ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Redirection...
                </>
              ) : (
                <>
                  C'est parti pour {BASE_PRICE}€ <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </motion.div>

        </div>

      </div>

      {/* ============================================ */}
      {/* POPUP Order Bump */}
      {/* ============================================ */}
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
              <div className="space-y-3">
                {/* Prix récap */}
                <div className="bg-white rounded-xl p-3 border border-gray-200 text-center">
                  <p className="text-gray-600 text-xs mb-1">Ton total avec le Pack RS :</p>
                  <p className="text-2xl font-black text-gray-900">{BASE_PRICE + ORDER_BUMP_PRICE}€ <span className="text-sm font-normal text-gray-400 line-through">214€</span></p>
                </div>
                
                <button
                  onClick={() => handleProceedToCheckout(true)}
                  disabled={isCreatingCheckout}
                  className="w-full py-4 px-4 bg-[#61f7a2] text-gray-900 font-bold rounded-xl hover:bg-[#4de88f] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCreatingCheckout ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Redirection...</>
                  ) : (
                    <><CheckCircle className="w-5 h-5" /> OUI, j'ajoute le Pack RS (+37€)</>
                  )}
                </button>
                <button
                  onClick={() => handleProceedToCheckout(false)}
                  disabled={isCreatingCheckout}
                  className="w-full py-3 bg-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  {isCreatingCheckout ? 'Redirection...' : `Non merci, continuer à ${BASE_PRICE}€`}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}