import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Sparkles,
  CheckCircle,
  ArrowRight,
  Loader2,
  Shield,
  Zap,
  Star,
  Gift,
  X,
  BarChart3
} from 'lucide-react';

export default function ProtocoleQuickwin() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasOrderBump, setHasOrderBump] = useState(false);
  const [showOrderBumpPopup, setShowOrderBumpPopup] = useState(false);

  // Prix
  const BASE_PRICE = 67;
  const ORDER_BUMP_PRICE = 37;
  const totalPrice = hasOrderBump ? BASE_PRICE + ORDER_BUMP_PRICE : BASE_PRICE;

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const { data } = await base44.functions.invoke('createCheckout', {
        hasOrderBump: hasOrderBump
      });

      if (data.success && data.url) {
        window.top.location.href = data.url;
      } else {
        alert('Erreur: impossible de créer la session de paiement');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full max-w-[100vw]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-lg shadow-[#61f7a2]/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs text-gray-500 font-medium">Chemin 1</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-1.5 bg-green-100 border border-green-300 px-3 py-1.5 rounded-full mb-4">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-green-600 font-semibold text-sm">Chemin rapide</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
            GÉNÉRATEUR<br /><span className="text-[#61f7a2]">COMPLET</span>
          </h1>
          <p className="text-gray-600 text-base mb-4">
            Ta première vente en <strong>moins de 7 jours</strong>
          </p>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-gray-400 line-through text-lg">297€</span>
            <span className="text-4xl md:text-5xl font-black text-[#61f7a2]">{totalPrice}€</span>
            <span className="text-gray-500 text-sm">ONE-TIME</span>
          </div>
        </motion.div>

        {/* Ce qui est inclus - Style cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
              <span className="text-lg">🧠</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Ce que Noah a préparé</h2>
              <p className="text-gray-500 text-xs">100% personnalisé à ton profil</p>
            </div>
          </div>

          {/* PRÊT À VENDRE */}
          <div className="bg-[#61f7a2]/10 rounded-xl p-3 mb-3 border-l-4 border-[#61f7a2]">
            <p className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#61f7a2]" />
              PRÊT À VENDRE
            </p>
            <div className="space-y-1.5">
              {[
                { icon: "🎯", text: "4 offres complètes avec prix" },
                { icon: "💬", text: "Messages de vente prêts" },
                { icon: "📄", text: "Pages de vente rédigées" },
                { icon: "📧", text: "8 emails marketing" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/70">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-gray-800 font-medium text-xs">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ANALYSE & STRATÉGIE */}
          <div className="bg-gray-50 rounded-xl p-3 mb-3">
            <p className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-gray-600" />
              ANALYSE & STRATÉGIE
            </p>
            <div className="space-y-1.5">
              {[
                { icon: "📊", text: "Analyse de marché détaillée" },
                { icon: "👥", text: "3 avatars de tes futurs acheteurs" },
                { icon: "🔄", text: "Jusqu'à 5 générations" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-gray-800 font-medium text-xs">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SYSTÈME COMPLET */}
          <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-200/50">
            <p className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              TON SYSTÈME COMPLET
            </p>
            <div className="space-y-1.5">
              {[
                { icon: "🎮", text: "Dashboard gamifié" },
                { icon: "📅", text: "Plan d'action 7 jours" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/70">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-gray-800 font-medium text-xs">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Garantie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-400 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">🎁 GARANTIE 30 JOURS</h3>
              <p className="text-gray-700 text-xs mt-1">
                Fais 67€ de CA ou remboursé intégral<br />
                <span className="text-gray-500">(1 seule vente suffit !)</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* ORDER BUMP - Pack Réseaux Sociaux */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
            hasOrderBump
              ? 'bg-gradient-to-br from-[#61f7a2]/20 to-green-100 border-2 border-[#61f7a2] shadow-lg shadow-[#61f7a2]/20'
              : 'bg-white border-2 border-[#61f7a2] hover:shadow-lg hover:shadow-[#61f7a2]/10'
          }`}
          onClick={() => setShowOrderBumpPopup(true)}
        >
          {/* Badge */}
          <div className="flex justify-center mb-3">
            <span className="bg-[#61f7a2] text-gray-900 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Gift className="w-3 h-3" />
              OFFRE SPÉCIALE
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Checkbox visuelle */}
            <div
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                hasOrderBump
                  ? 'bg-[#61f7a2] border-[#61f7a2]'
                  : 'border-gray-300 bg-white'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setHasOrderBump(!hasOrderBump);
              }}
            >
              {hasOrderBump && <CheckCircle className="w-4 h-4 text-white" />}
            </div>

            {/* Icône */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-green-500 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🎬</span>
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 leading-tight">
                Pack Réseaux Sociaux
              </h3>
              <p className="text-gray-600 text-xs">
                100+ Templates prêts
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-base font-black text-[#61f7a2]">+37€</span>
                <span className="text-gray-400 line-through text-[10px]">147€</span>
                <span className="bg-red-100 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
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
              className="px-2.5 py-1.5 bg-[#61f7a2]/20 text-[#61f7a2] font-semibold rounded-lg text-xs flex items-center gap-1"
            >
              Voir
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {hasOrderBump && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-3 border-t border-[#61f7a2]/30"
            >
              <p className="text-[#61f7a2] font-semibold text-center flex items-center justify-center gap-2 text-xs">
                <CheckCircle className="w-3.5 h-3.5" />
                Pack ajouté !
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-24 h-24 bg-[#61f7a2]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-[#61f7a2]" />
              <span className="text-white font-bold text-sm">LE CHOIX RECOMMANDÉ</span>
            </div>

            <div className="mb-4">
              <span className="text-gray-500 line-through text-lg">297€</span>
              <span className="text-white text-4xl font-black ml-2">{totalPrice}€</span>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 mb-4">
              {["Générateur Noah ∞", "Plan 7 jours", "Garantie 30j"].map((item, i) => (
                <span key={i} className="bg-white/10 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-[#61f7a2]" />
                  {item}
                </span>
              ))}
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full py-4 px-6 bg-[#61f7a2] hover:bg-[#4de88f] text-gray-900 font-bold text-base rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-[#61f7a2]/30"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Redirection...
                </>
              ) : (
                <>
                  ✨ Débloquer pour {totalPrice}€
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="text-gray-400 text-xs mt-3 flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              Paiement sécurisé • Accès immédiat
            </p>
          </div>
        </motion.div>

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
                <p className="text-white/90 text-sm font-medium mb-2">Ajoute ce pack à ta commande</p>
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
            <div className="p-4 space-y-3">
              {/* Instagram/TikTok */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-3 border border-pink-200">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                  <span className="text-base">📱</span>
                  Instagram / TikTok
                </h3>
                <ul className="space-y-1 text-gray-700 text-xs">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>30 scripts Reels adaptés</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>20 hooks viraux</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>15 légendes qui convertissent</span>
                  </li>
                </ul>
              </div>

              {/* Carrousels */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                  <span className="text-base">🎨</span>
                  Carrousels
                </h3>
                <ul className="space-y-1 text-gray-700 text-xs">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>15 templates Canva éducatifs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>Copywriting prêt à l'emploi</span>
                  </li>
                </ul>
              </div>

              {/* Stories */}
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-3 border border-orange-200">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                  <span className="text-base">📖</span>
                  Stories
                </h3>
                <ul className="space-y-1 text-gray-700 text-xs">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>20 séquences pour vendre</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>Stratégie "Story to Sale"</span>
                  </li>
                </ul>
              </div>

              {/* BONUS */}
              <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl p-3 border-2 border-yellow-400">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-yellow-400 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    BONUS
                  </span>
                </div>
                <ul className="space-y-1 text-gray-700 text-xs">
                  <li className="flex items-start gap-2">
                    <Gift className="w-3.5 h-3.5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">Calendrier de contenu 30 jours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Gift className="w-3.5 h-3.5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">Guide "Poster sans se montrer"</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 rounded-b-3xl border-t border-gray-200">
              <div className="space-y-2">
                {/* Prix récap */}
                <div className="bg-white rounded-xl p-2.5 border border-gray-200 text-center">
                  <p className="text-gray-600 text-[10px] mb-0.5">Ton total avec le Pack RS :</p>
                  <p className="text-xl font-black text-gray-900">{BASE_PRICE + ORDER_BUMP_PRICE}€ <span className="text-xs font-normal text-gray-400 line-through">214€</span></p>
                </div>
                
                <button
                  onClick={() => {
                    setHasOrderBump(true);
                    setShowOrderBumpPopup(false);
                  }}
                  className="w-full py-3.5 px-4 bg-[#61f7a2] text-gray-900 font-bold rounded-xl hover:bg-[#4de88f] transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  OUI, j'ajoute le Pack (+37€)
                </button>
                <button
                  onClick={() => setShowOrderBumpPopup(false)}
                  className="w-full py-2.5 bg-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-300 transition-colors text-sm"
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