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
  Crown
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import OnboardingSidebar from '@/components/onboarding/OnboardingSidebar';
import { cn } from "@/lib/utils";

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

export default function CTAPAYWALL() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Order Bump states
  const [hasOrderBump, setHasOrderBump] = useState(false);
  const [showOrderBumpPopup, setShowOrderBumpPopup] = useState(false);
  const [checkboxInPopup, setCheckboxInPopup] = useState(false);

  // Prix
  const BASE_PRICE = 67;
  const ORDER_BUMP_PRICE = 37;
  const totalPrice = hasOrderBump ? BASE_PRICE + ORDER_BUMP_PRICE : BASE_PRICE;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // 🔥 P0-1: Guard paywall - si déjà payé → redirect
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
      console.log('=== Calling createCheckout ===');
      console.log('hasOrderBump value:', hasOrderBump);
      console.log('Sending to createCheckout:', { hasOrderBump });

      const { data } = await base44.functions.invoke('createCheckout', {
        hasOrderBump: hasOrderBump
      });

      console.log('Checkout response:', data);

      if (data.success && data.url) {
        // Sauvegarder le timestamp de clic paywall
        await base44.auth.updateMe({
          paywall_clicked_at: new Date().toISOString()
        });

        // Rediriger vers Stripe Checkout (au niveau top pour éviter l'iframe)
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

  const handleSimulatePurchase = async () => {
    if (!user) return;

    setIsSimulating(true);
    try {
      await base44.functions.invoke('simulatePurchase');
      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      console.error('Error simulating purchase:', error);
      alert('Erreur lors de la simulation.');
    } finally {
      setIsSimulating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
      </div>
    );
  }

  const completedSteps = [1, 2, 3, 4, 5, 6];

  // 🔥 P0-1: Source of truth = session.finalized_offer
  const finalizedOffer = session?.finalized_offer || {};
  const productPrincipal = finalizedOffer.mainProduct;
  const petitExtra = finalizedOffer.orderBump;
  const offreSuperieure = finalizedOffer.upsell1;
  const offrePremium = finalizedOffer.upsell3;

  const products = [
    {
      label: 'Produit Principal',
      data: productPrincipal,
      multiplier: 30,
      icon: ShoppingBag,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50',
      priceColor: 'text-orange-600'
    },
    {
      label: 'Order Bump',
      data: petitExtra,
      multiplier: 15,
      icon: Gift,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      priceColor: 'text-blue-600'
    },
    {
      label: 'Upsell',
      data: offreSuperieure,
      multiplier: 9,
      icon: TrendingUp,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50',
      priceColor: 'text-purple-600'
    },
    {
      label: 'Premium',
      data: offrePremium,
      multiplier: 1,
      icon: Crown,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      priceColor: 'text-amber-600'
    }
  ].filter(p => p.data);

  // 🔥 P0-2: Utiliser potential_revenue (pas recalcul)
  const potentialRevenue = session?.potential_revenue || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex overflow-x-hidden w-full max-w-[100vw]">
      <OnboardingSidebar currentPage="CTAPAYWALL" completedSteps={completedSteps} progressInStep={0} />

      <div className="flex-1 flex flex-col lg:ml-80 overflow-x-hidden w-full min-w-0">
        <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12 pt-28 md:pt-12 box-border">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-[#61f7a2]/10 px-4 py-2 rounded-full mb-6">
              <CheckCircle className="w-4 h-4 text-[#61f7a2]" />
              <span className="text-[#61f7a2] font-semibold text-sm">
                ✅ Ton plan d'action validé
              </span>
            </div>

            <h1 className="text-2xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              On passe à l'action ?
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tes offres t'attendent. Débloque-les maintenant.
            </p>
          </motion.div>

          {/* Vidéo Vimeo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="relative w-full rounded-2xl overflow-hidden shadow-xl" style={{ paddingBottom: '56.25%' }}>
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

          {/* Tu as maintenant - VERSION ACCOMPLISSEMENT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 md:p-8 mb-8 overflow-hidden"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              ✅ Regarde ce que tu as maintenant
            </h2>

            <div className="space-y-3 mb-6">
              {/* 1. Offres + Prix */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="flex items-start gap-4 py-4 px-5 rounded-xl border-2 bg-orange-50 border-orange-200"
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-white shadow-sm">
                  <ShoppingBag className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-bold mb-1">4 offres complètes + leurs prix</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Du petit produit à l'accompagnement premium, ton système d'offres est prêt
                  </p>
                </div>
              </motion.div>

              {/* 2. Validation Marché */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-4 py-4 px-5 rounded-xl border-2 bg-green-50 border-green-200"
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-white shadow-sm">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-bold mb-1">Validation que ta passion est viable</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Ton expertise a de la valeur et le marché est prêt à payer pour
                  </p>
                </div>
              </motion.div>

              {/* 3. Potentiel calculé */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="flex items-start gap-4 py-4 px-5 rounded-xl border-2 bg-blue-50 border-blue-200"
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-white shadow-sm">
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-bold mb-1">Potentiel de revenus basé sur des milliers de données</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {potentialRevenue > 0 ? `${potentialRevenue.toLocaleString('fr-FR')} €/mois` : 'Calculé selon ton marché et ton positionnement'}
                  </p>
                </div>
              </motion.div>

              {/* 4. Plan de route */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-start gap-4 py-4 px-5 rounded-xl border-2 bg-purple-50 border-purple-200"
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-white shadow-sm">
                  <Target className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-bold mb-1">Plan d'action exact et éprouvé</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Le protocole étape par étape pour passer de 0 à tes premières ventes
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="bg-gradient-to-br from-[#61f7a2]/10 to-blue-50 rounded-2xl p-6 text-center">
              <p className="text-gray-900 font-bold text-lg mb-2">
                🎯 Tu as tout ce qu'il faut pour démarrer
              </p>
              <p className="text-gray-600">
                Maintenant, on va t'aider à mettre tout ça en action
              </p>
            </div>
          </motion.div>



          {/* Comparatif Sans/Avec */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-2 gap-6 mb-12"
          >
            {/* Sans */}
            <div className="bg-white rounded-2xl border-2 border-red-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Sans ce pack</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-gray-700">
                  <X className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                  <span>Tu vas galérer seul(e)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <X className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                  <span>Tu ne sauras pas par où commencer</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <X className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                  <span>Tu risques d'abandonner</span>
                </li>
              </ul>
            </div>

            {/* Avec */}
            <div className="bg-gradient-to-br from-[#61f7a2]/20 to-green-50 rounded-2xl border-2 border-[#61f7a2] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#61f7a2] flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Avec ce pack (recommandé)</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-gray-900">
                  <CheckCircle className="w-4 h-4 text-[#61f7a2] mt-1 flex-shrink-0" />
                  <span className="font-medium">Tout est déjà prêt</span>
                </li>
                <li className="flex items-start gap-2 text-gray-900">
                  <CheckCircle className="w-4 h-4 text-[#61f7a2] mt-1 flex-shrink-0" />
                  <span className="font-medium">Tu avances étape par étape</span>
                </li>
                <li className="flex items-start gap-2 text-gray-900">
                  <CheckCircle className="w-4 h-4 text-[#61f7a2] mt-1 flex-shrink-0" />
                  <span className="font-medium">Tu es guidé(e) chaque jour</span>
                </li>
                <li className="flex items-start gap-2 text-gray-900">
                  <CheckCircle className="w-4 h-4 text-[#61f7a2] mt-1 flex-shrink-0" />
                  <span className="font-medium">Tu lances cette semaine</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Bloc principal sombre - Le pack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-4 md:p-10 mb-8 text-white shadow-2xl overflow-hidden"
          >


            <h2 className="text-3xl font-bold mb-4 text-center">
              Voici ce qu'on a préparé pour toi
            </h2>
            <p className="text-gray-300 text-center mb-10">
              Tu n'achètes pas du contenu. Tu accèdes à un système qui travaille avec toi.
            </p>

            <div className="space-y-8">
              {/* 1. Première vente à 27€ */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">🚀 Ta première vente à {productPrincipal ? productPrincipal.price : '27€'}</h3>
                    <ul className="space-y-2 text-gray-200">
                      <li>• Messages déjà rédigés</li>
                      <li>• Pas besoin de communauté</li>
                      <li>• Pas besoin de te montrer</li>
                      <li>• On te dit exactement quoi faire</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-[#61f7a2]/20 rounded-xl p-4 border border-[#61f7a2]">
                  <p className="text-white font-bold">
                    👉 Tu sais exactement quoi faire dès aujourd'hui pour ta première vente
                  </p>
                </div>
              </div>

              {/* 2. Contenu déjà créé */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">📦 Tout le contenu déjà créé</h3>
                    <ul className="space-y-2 text-gray-200 mb-3">
                      <li>• Analyse de ton marché détaillée</li>
                      <li>• Tes avatars futurs acheteurs</li>
                      <li>• La page de vente de ton produit low ticket</li>
                      <li>• Les messages à envoyer pour faire tes premières ventes</li>
                      <li>• Tes emails marketing</li>
                      <li>• Ton plan d'action jour par jour, à cocher pour avancer</li>
                    </ul>
                    <p className="text-[#61f7a2] italic">➡️ Tu copies, tu colles, tu appliques.</p>
                  </div>
                </div>
              </div>

              {/* 3. Protocole simple */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">🧭 Le protocole simple à suivre</h3>
                    <div className="grid grid-cols-2 gap-3 text-gray-200">
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="font-semibold">S1 - Validation</p>
                        <p className="text-sm">Ta première vente à 47€</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="font-semibold">S2 - Création</p>
                        <p className="text-sm">Création du petit extra • Revenus x2</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="font-semibold">S3 - Automatisation</p>
                        <p className="text-sm">Offre supérieure • Panier moyen x3</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="font-semibold">S4 - Croissance</p>
                        <p className="text-sm">Offre high ticket • Automatisation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Accompagnement vidéo */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">🎥 Accompagnement vidéo</h3>
                    <ul className="space-y-2 text-gray-200">
                      <li>• Comment contacter les gens</li>
                      <li>• Comment vendre sans forcer</li>
                      <li>• Comment améliorer ce qui fonctionne</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 5. Communauté School BONUS */}
              <div className="bg-gradient-to-br from-yellow-400/20 to-yellow-500/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-yellow-400">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center flex-shrink-0">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">🤝 Accès à la communauté Skool</h3>
                      <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                        BONUS
                      </span>
                    </div>
                    <ul className="space-y-2 text-gray-200 mb-3">
                      <li>• Groupe privé</li>
                      <li>• Lives réguliers</li>
                      <li>• Entraide + réponses</li>
                    </ul>
                    <div className="flex items-center gap-2">
                      <span className="line-through text-gray-400">97€/mois</span>
                      <span className="text-yellow-400 font-bold">GRATUIT À VIE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bloc émotionnel - Projection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-3xl border-2 border-[#61f7a2]/40 p-4 md:p-10 mb-8 overflow-hidden"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Imagine dans quelques jours…
            </h2>

            <div className="space-y-6 mb-8">
              <p className="text-gray-700 leading-relaxed text-lg">
                Aujourd'hui, tu as :
              </p>
              <ul className="space-y-2 ml-6">
                <li className="text-gray-700">• une idée</li>
                <li className="text-gray-700">• un savoir-faire</li>
                <li className="text-gray-700">• une offre claire</li>
                <li className="text-gray-700">• mais peut-être encore des doutes.</li>
              </ul>

              <p className="text-gray-700 leading-relaxed text-lg">
                Dans quelques jours, tu peux avoir :
              </p>
              <ul className="space-y-2 ml-6">
                <li className="text-gray-900 font-semibold">• ta première vente en ligne</li>
                <li className="text-gray-900 font-semibold">• un message de quelqu'un qui te dit "merci"</li>
                <li className="text-gray-900 font-semibold">• la preuve que c'est possible pour toi aussi</li>
              </ul>
            </div>

            {/* AVANT / APRÈS */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-red-500">❌</span>
                  Avant Passion IA
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Tu réfléchis trop</li>
                  <li>• Tu ne sais pas par où commencer</li>
                  <li>• Tu repousses le moment de te lancer</li>
                  <li>• Tu doutes de toi</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#61f7a2]/20 to-green-100 rounded-2xl p-6 border-2 border-[#61f7a2]">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-[#61f7a2]">✅</span>
                  Après Passion IA
                </h3>
                <ul className="space-y-2 text-gray-900 font-medium">
                  <li>• Tu sais exactement quoi faire chaque jour</li>
                  <li>• Tu passes à l'action sans te poser 1000 questions</li>
                  <li>• Tu fais ta première vente</li>
                  <li>• Tu prends confiance en toi et en ton projet</li>
                </ul>
              </div>
            </div>

          </motion.div>





          {/* 🎬 ORDER BUMP - Pack Réseaux Sociaux */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.69 }}
            className={`rounded-3xl p-6 mb-8 cursor-pointer transition-all duration-300 ${
              hasOrderBump
                ? 'bg-gradient-to-br from-[#61f7a2]/20 to-green-100 border-4 border-[#61f7a2] shadow-lg shadow-[#61f7a2]/20'
                : 'bg-white border-4 border-[#61f7a2] hover:shadow-lg hover:shadow-[#61f7a2]/10'
            }`}
            onClick={() => setShowOrderBumpPopup(true)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {/* Badge */}
            <div className="flex justify-center mb-4">
              <span className="bg-[#61f7a2] text-gray-900 text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                <Gift className="w-3 h-3" />
                OFFRE SPÉCIALE
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Checkbox visuelle */}
              <div
                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  hasOrderBump
                    ? 'bg-[#61f7a2] border-[#61f7a2]'
                    : 'border-gray-300 bg-white'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setHasOrderBump(!hasOrderBump);
                }}
              >
                {hasOrderBump && <CheckCircle className="w-5 h-5 text-white" />}
              </div>

              {/* Icône */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-green-500 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">🎬</span>
              </div>

              {/* Contenu */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  🎁 Ajoute le Pack Réseaux Sociaux
                </h3>
                <p className="text-gray-600 mb-2">
                  100+ Templates prêts à poster
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-[#61f7a2]">+37€</span>
                  <span className="text-gray-400 line-through text-sm">147€</span>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                    -75%
                  </span>
                </div>
              </div>

              {/* Bouton détails */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOrderBumpPopup(true);
                }}
                className="px-4 py-2 bg-[#61f7a2]/20 text-[#61f7a2] font-semibold rounded-xl hover:bg-[#61f7a2]/30 transition-colors flex items-center gap-1"
              >
                Voir les détails
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {hasOrderBump && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-[#61f7a2]/30"
              >
                <p className="text-[#61f7a2] font-semibold text-center flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Pack Réseaux Sociaux ajouté à ta commande !
                </p>
              </motion.div>
            )}
          </motion.div>

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
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-gradient-to-br from-[#61f7a2] to-green-500 p-6 rounded-t-3xl relative">
                  <button
                    onClick={() => setShowOrderBumpPopup(false)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                  <div className="text-center">
                    <span className="text-5xl mb-3 block">🎬</span>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Pack Réseaux Sociaux - 100+ Templates
                    </h2>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-3xl font-black text-white">+37€</span>
                      <span className="text-white/70 line-through">Valeur 147€</span>
                    </div>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6 space-y-6">
                  {/* Instagram/TikTok */}
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-5 border border-pink-200">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">📱</span>
                      Instagram / TikTok
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                        <span>30 scripts Reels adaptés à ton offre</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                        <span>20 hooks viraux pour capter l'attention</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                        <span>15 légendes de posts qui convertissent</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                        <span>10 CTA qui poussent à l'action</span>
                      </li>
                    </ul>
                  </div>

                  {/* Carrousels */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-200">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">🎨</span>
                      Carrousels
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                        <span>15 templates Canva de carrousels éducatifs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                        <span>Structures éprouvées pour présenter ton offre</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                        <span>Copywriting déjà fait, tu personnalises juste</span>
                      </li>
                    </ul>
                  </div>

                  {/* Stories */}
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-5 border border-orange-200">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">📖</span>
                      Stories
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                        <span>20 séquences de stories pour vendre</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                        <span>Templates visuels + textes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                        <span>Stratégie "Story to DM to Sale"</span>
                      </li>
                    </ul>
                  </div>

                  {/* LinkedIn */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-300">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">💼</span>
                      LinkedIn
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                        <span>10 posts viraux pour entrepreneurs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                        <span>Formats qui génèrent de l'engagement</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                        <span>Templates de carrousels pro</span>
                      </li>
                    </ul>
                  </div>

                  {/* Ads */}
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-5 border border-red-200">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">🎯</span>
                      Ads Facebook / Instagram
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                        <span>10 scripts de publicités testés</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                        <span>Accroches qui stoppent le scroll</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                        <span>Structure AIDA/PAS prête</span>
                      </li>
                    </ul>
                  </div>

                  {/* BONUS */}
                  <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl p-5 border-2 border-yellow-400">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                        BONUS INCLUS
                      </span>
                    </div>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <Gift className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="font-medium">Calendrier de contenu 30 jours</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Gift className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="font-medium">Guide "Poster sans se montrer"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Gift className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="font-medium">Stratégie 1 post/jour en 15 min</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Footer avec checkbox et boutons */}
                <div className="p-6 bg-gray-50 rounded-b-3xl border-t border-gray-200">
                  {/* Grande checkbox */}
                  <div
                    className={`p-4 rounded-2xl mb-4 cursor-pointer transition-all ${
                      checkboxInPopup
                        ? 'bg-[#61f7a2]/20 border-2 border-[#61f7a2]'
                        : 'bg-white border-2 border-gray-200 hover:border-[#61f7a2]/50'
                    }`}
                    onClick={() => setCheckboxInPopup(!checkboxInPopup)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        checkboxInPopup
                          ? 'bg-[#61f7a2] border-[#61f7a2]'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {checkboxInPopup && <CheckCircle className="w-5 h-5 text-white" />}
                      </div>
                      <span className="font-bold text-gray-900 text-lg">
                        ☑️ OUI, j'ajoute le Pack Réseaux Sociaux (+37€)
                      </span>
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setHasOrderBump(true);
                        setShowOrderBumpPopup(false);
                      }}
                      className="flex-1 py-4 px-6 bg-[#61f7a2] text-gray-900 font-bold rounded-2xl hover:bg-[#4de88f] transition-colors text-lg flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Ajouter au panier
                    </button>
                    <button
                      onClick={() => {
                        setCheckboxInPopup(false);
                        setShowOrderBumpPopup(false);
                      }}
                      className="px-6 py-4 bg-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-300 transition-colors"
                    >
                      Non merci
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Bloc prix & urgence */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 rounded-3xl border-2 border-yellow-600 p-4 md:p-8 mb-8 shadow-2xl text-center overflow-hidden"
          >
            <div className="mb-4">
              <span className="text-white/90 text-lg block mb-2">Prix normal</span>
              <span className="text-white text-3xl line-through opacity-60">{hasOrderBump ? '444€' : '297€'}</span>
            </div>

            <div className="mb-6">
              <span className="text-white/90 text-xl block mb-2">
                {hasOrderBump ? 'Ton total avec le Pack Réseaux Sociaux' : 'Offre de lancement'}
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-white text-7xl font-black">{totalPrice}€</span>
              </div>
              {hasOrderBump && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 bg-white/20 rounded-xl px-4 py-2 inline-flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span className="text-white/90 text-sm">
                    Pack Clé en Main (67€) + Pack Réseaux Sociaux (37€)
                  </span>
                </motion.div>
              )}
              <p className="text-white/80 mt-2">Accès immédiat</p>
            </div>

            <div className="flex justify-center">
              <GlowButton
                onClick={handleGetAccess}
                disabled={isCreatingCheckout}
                size="lg"
                className="px-12 bg-white text-yellow-600 hover:bg-gray-100 font-bold"
              >
                {isCreatingCheckout ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Redirection...
                  </>
                ) : (
                  <>
                    ✨ Je veux lancer mon activité maintenant
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </GlowButton>
            </div>

            <p className="text-white/70 text-sm mt-4">
              Accès immédiat après paiement sécurisé
            </p>

          </motion.div>

          {/* Garantie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl border-2 border-green-200 p-4 md:p-8 mb-8 text-center overflow-hidden"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500 mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              ✅ Garantie Satisfait ou Remboursé 30 jours
            </h3>
            <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
              Teste le pack pendant 30 jours. Si tu ne vois pas la valeur, on te rembourse intégralement. Aucune justification nécessaire.
            </p>
          </motion.div>

          {/* 🔥 P1-7: Promesse de continuité post-paiement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-6 mb-8 text-center"
          >
            <p className="text-gray-700 text-lg">
              <strong className="text-gray-900">Après le paiement,</strong> tu accèdes immédiatement à ton dashboard.<br />
              Tout ce que tu as créé ici t'y attend, prêt à être utilisé.
            </p>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-center"
          >
            <p className="text-gray-900 mb-3 text-2xl font-bold">
              Ton business personnalisé est prêt.
            </p>
            <p className="text-gray-700 mb-6 text-xl">
              Il t'attend juste derrière ces portes.
            </p>
            <div className="flex justify-center mb-4">
              <GlowButton
                onClick={handleGetAccess}
                disabled={isCreatingCheckout}
                size="lg"
                className="px-12"
              >
                {isCreatingCheckout ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Redirection...
                  </>
                ) : (
                  <>
                    Oui, je veux mon Pack Clé en Main
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </GlowButton>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 text-gray-500 text-sm mt-8 pb-8">
              <div className="flex items-center gap-2 text-gray-400">
                <Shield className="w-4 h-4" />
                <span>Paiement 100% sécurisé</span>
              </div>
              <div className="hidden md:block w-1 h-1 bg-gray-300 rounded-full" />
              <div className="flex items-center gap-2 text-gray-600 font-medium">
                <CheckCircle className="w-4 h-4 text-[#61f7a2]" />
                <span>Satisfait ou remboursé 30 jours</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}